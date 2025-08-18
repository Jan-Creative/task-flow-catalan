import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Processant recordatoris pendents...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Obtenir recordatoris que han de ser enviats
    const now = new Date().toISOString();
    
    const { data: pendingReminders, error: remindersError } = await supabaseClient
      .from('notification_reminders')
      .select(`
        *,
        tasks (
          title,
          description,
          status,
          priority
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(50); // Processar màxim 50 recordatoris per execució

    if (remindersError) {
      console.error('Error obtenint recordatoris:', remindersError);
      throw remindersError;
    }

    if (!pendingReminders || pendingReminders.length === 0) {
      console.log('✅ No hi ha recordatoris pendents per processar');
      return new Response(
        JSON.stringify({ 
          message: 'No hi ha recordatoris pendents',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Trobats ${pendingReminders.length} recordatoris per processar`);

    const results = [];

    // Processar cada recordatori
    for (const reminder of pendingReminders) {
      try {
        console.log(`📨 Processant recordatori: ${reminder.title}`);

        // Verificar preferències d'usuari
        const { data: preferences } = await supabaseClient
          .from('notification_preferences')
          .select('*')
          .eq('user_id', reminder.user_id)
          .single();

        // Comprovar si les notificacions estan activades
        if (!preferences?.enabled) {
          console.log(`⏭️ Notificacions desactivades per usuari ${reminder.user_id}`);
          await markReminderAsCancelled(supabaseClient, reminder.id, 'User notifications disabled');
          continue;
        }

        // Comprovar tipus específic de notificació
        if (reminder.notification_type === 'task_reminder' && !preferences?.task_reminders) {
          console.log(`⏭️ Recordatoris de tasca desactivats per usuari ${reminder.user_id}`);
          await markReminderAsCancelled(supabaseClient, reminder.id, 'Task reminders disabled');
          continue;
        }

        if (reminder.notification_type === 'deadline' && !preferences?.deadline_alerts) {
          console.log(`⏭️ Alertes de venciment desactivades per usuari ${reminder.user_id}`);
          await markReminderAsCancelled(supabaseClient, reminder.id, 'Deadline alerts disabled');
          continue;
        }

        // Comprovar horari de silenci
        if (isInQuietHours(preferences)) {
          console.log(`🔇 Recordatori ajornat per horari de silenci`);
          // Ajornar a la propera hora vàlida
          const nextValidTime = getNextValidTime(preferences);
          await supabaseClient
            .from('notification_reminders')
            .update({ scheduled_at: nextValidTime.toISOString() })
            .eq('id', reminder.id);
          continue;
        }

        // Preparar contingut de la notificació
        let notificationTitle = reminder.title;
        let notificationBody = reminder.message;

        // Personalitzar segons tipus
        if (reminder.notification_type === 'task_reminder' && reminder.tasks) {
          const task = Array.isArray(reminder.tasks) ? reminder.tasks[0] : reminder.tasks;
          notificationTitle = `⏰ ${reminder.title}`;
          notificationBody = `Tasca: ${task.title}${task.description ? ` - ${task.description}` : ''}`;
        }

        // Cridar edge function per enviar notificació
        const { data: sendResult, error: sendError } = await supabaseClient.functions.invoke(
          'send-notification',
          {
            body: {
              title: notificationTitle,
              body: notificationBody,
              userId: reminder.user_id,
              taskId: reminder.task_id,
              notificationType: reminder.notification_type,
              data: {
                reminderId: reminder.id,
                scheduledAt: reminder.scheduled_at,
                ...reminder.metadata,
              },
            },
          }
        );

        if (sendError) {
          console.error(`❌ Error enviant notificació per recordatori ${reminder.id}:`, sendError);
          await markReminderAsFailed(supabaseClient, reminder.id, sendError.message);
          results.push({
            reminderId: reminder.id,
            success: false,
            error: sendError.message,
          });
        } else {
          console.log(`✅ Notificació enviada per recordatori ${reminder.id}`);
          await markReminderAsSent(supabaseClient, reminder.id);
          results.push({
            reminderId: reminder.id,
            success: true,
            result: sendResult,
          });
        }

      } catch (error) {
        console.error(`❌ Error processant recordatori ${reminder.id}:`, error);
        await markReminderAsFailed(supabaseClient, reminder.id, error.message);
        results.push({
          reminderId: reminder.id,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`✅ Processament completat: ${successCount} exitosos, ${failCount} fallits`);

    return new Response(
      JSON.stringify({
        message: 'Recordatoris processats',
        processed: results.length,
        successful: successCount,
        failed: failCount,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error en process-reminders:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Error intern del servidor',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Funcions auxiliars
async function markReminderAsSent(supabaseClient: any, reminderId: string) {
  await supabaseClient
    .from('notification_reminders')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
    })
    .eq('id', reminderId);
}

async function markReminderAsFailed(supabaseClient: any, reminderId: string, errorMessage: string) {
  await supabaseClient
    .from('notification_reminders')
    .update({
      status: 'failed',
      metadata: {
        error: errorMessage,
        failed_at: new Date().toISOString(),
      },
    })
    .eq('id', reminderId);
}

async function markReminderAsCancelled(supabaseClient: any, reminderId: string, reason: string) {
  await supabaseClient
    .from('notification_reminders')
    .update({
      status: 'cancelled',
      metadata: {
        cancelled_reason: reason,
        cancelled_at: new Date().toISOString(),
      },
    })
    .eq('id', reminderId);
}

function isInQuietHours(preferences: any): boolean {
  if (!preferences?.quiet_hours_start || !preferences?.quiet_hours_end) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minuts des de mitjanit

  const [startHour, startMin] = preferences.quiet_hours_start.split(':').map(Number);
  const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number);

  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  // Gestionar casos on l'horari de silenci creua mitjanit
  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    return currentTime >= startTime || currentTime <= endTime;
  }
}

function getNextValidTime(preferences: any): Date {
  if (!preferences?.quiet_hours_end) {
    return new Date(); // Si no hi ha horari de silenci, enviar ara
  }

  const now = new Date();
  const [endHour, endMin] = preferences.quiet_hours_end.split(':').map(Number);
  
  const nextValidTime = new Date(now);
  nextValidTime.setHours(endHour, endMin, 0, 0);

  // Si l'hora de fi ja ha passat avui, programar per demà
  if (nextValidTime <= now) {
    nextValidTime.setDate(nextValidTime.getDate() + 1);
  }

  return nextValidTime;
}