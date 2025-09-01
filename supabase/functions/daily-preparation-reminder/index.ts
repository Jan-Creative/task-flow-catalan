import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      notification_preferences: {
        Row: {
          id: string
          user_id: string
          enabled: boolean
          task_reminders: boolean
          deadline_alerts: boolean
          custom_notifications: boolean
          quiet_hours_start: string | null
          quiet_hours_end: string | null
          notification_sound: boolean
          created_at: string
          updated_at: string
        }
      }
      web_push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          p256dh_key: string
          auth_key: string
          device_info: any
          is_active: boolean
          device_type: string
          created_at: string
          updated_at: string
        }
      }
    }
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🌙 Iniciating daily preparation reminder service...');

    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current time and day of week
    const now = new Date();
    const currentHour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    console.log(`Current time: ${now.toISOString()}, Day: ${dayOfWeek}, Hour: ${currentHour}`);

    // Determine message based on day of week
    let title: string;
    let message: string;
    
    if (dayOfWeek === 5) { // Friday
      title = "🎉 Prepara la setmana que ve";
      message = "Planifica la setmana vinent i gaudeix del cap de setmana!";
    } else if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday to Thursday
      title = "🌙 És hora de preparar el dia de demà";
      message = "Dedica uns minuts a planificar les tasques i prioritats de demà.";
    } else {
      // Weekend - no notifications
      console.log('🚫 No notifications sent during weekends');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No notifications sent during weekends',
          sent_count: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Get all users with active notification preferences
    const { data: users, error: usersError } = await supabaseClient
      .from('notification_preferences')
      .select('user_id, enabled, custom_notifications, quiet_hours_start, quiet_hours_end')
      .eq('enabled', true)
      .eq('custom_notifications', true);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`📋 Found ${users?.length || 0} users with notifications enabled`);

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No users with notifications enabled',
          sent_count: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Filter users based on quiet hours
    const eligibleUsers = users.filter(user => {
      if (!user.quiet_hours_start || !user.quiet_hours_end) {
        return true; // No quiet hours set, user is eligible
      }

      const quietStart = parseInt(user.quiet_hours_start.split(':')[0]);
      const quietEnd = parseInt(user.quiet_hours_end.split(':')[0]);
      
      // Check if current hour is within quiet hours
      if (quietStart <= quietEnd) {
        // Same day quiet hours (e.g., 22:00 - 07:00 next day is handled differently)
        return currentHour < quietStart || currentHour >= quietEnd;
      } else {
        // Quiet hours span midnight (e.g., 22:00 - 07:00)
        return currentHour < quietStart && currentHour >= quietEnd;
      }
    });

    console.log(`✅ ${eligibleUsers.length} users eligible for notifications (after quiet hours filter)`);

    if (eligibleUsers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All users in quiet hours',
          sent_count: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Get active subscriptions for eligible users
    const { data: subscriptions, error: subscriptionsError } = await supabaseClient
      .from('web_push_subscriptions')
      .select('*')
      .in('user_id', eligibleUsers.map(u => u.user_id))
      .eq('is_active', true);

    if (subscriptionsError) {
      console.error('❌ Error fetching subscriptions:', subscriptionsError);
      throw subscriptionsError;
    }

    console.log(`📱 Found ${subscriptions?.length || 0} active subscriptions`);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No active subscriptions found',
          sent_count: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Send notifications
    let sentCount = 0;
    let errors: any[] = [];

    for (const subscription of subscriptions) {
      try {
        console.log(`📤 Sending notification to user: ${subscription.user_id}`);

        const { error: notificationError } = await supabaseClient.functions.invoke('send-notification', {
          body: {
            subscription: {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh_key,
                auth: subscription.auth_key
              }
            },
            payload: {
              title,
              body: message,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
              tag: 'daily-preparation',
              requireInteraction: false,
              actions: [
                {
                  action: 'prepare',
                  title: 'Preparar Ara'
                },
                {
                  action: 'later',
                  title: 'Més Tard'
                }
              ]
            }
          }
        });

        if (notificationError) {
          console.error(`❌ Error sending to ${subscription.user_id}:`, notificationError);
          errors.push({ user_id: subscription.user_id, error: notificationError });
        } else {
          sentCount++;
          console.log(`✅ Notification sent successfully to ${subscription.user_id}`);
        }
      } catch (error) {
        console.error(`❌ Exception sending to ${subscription.user_id}:`, error);
        errors.push({ user_id: subscription.user_id, error: error.message });
      }
    }

    const result = {
      success: true,
      message: `Daily preparation reminders processed`,
      sent_count: sentCount,
      total_subscriptions: subscriptions.length,
      day_of_week: dayOfWeek,
      notification_type: dayOfWeek === 5 ? 'weekend_prep' : 'daily_prep',
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('📊 Final result:', result);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Fatal error in daily preparation reminder:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});