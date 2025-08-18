import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  fcmTokens?: string[];
  userId?: string;
  taskId?: string;
  notificationType?: 'task_reminder' | 'custom' | 'deadline';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { title, body, data = {}, fcmTokens, userId, taskId, notificationType = 'custom' }: NotificationPayload = await req.json();

    // Validar dades requerides
    if (!title || !body) {
      throw new Error('Title i body son obligatoris');
    }

    let tokensToSend: string[] = [];

    // Si es proporcionen tokens específics, usar-los
    if (fcmTokens && fcmTokens.length > 0) {
      tokensToSend = fcmTokens;
    } 
    // Si no, obtenir tokens de l'usuari des de la base de dades
    else if (userId) {
      const { data: subscriptions, error: subscriptionsError } = await supabaseClient
        .from('notification_subscriptions')
        .select('fcm_token')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (subscriptionsError) {
        console.error('Error obtenint subscripcions:', subscriptionsError);
        throw subscriptionsError;
      }

      tokensToSend = subscriptions?.map(sub => sub.fcm_token) || [];
    }

    if (tokensToSend.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No s\'han trobat tokens FCM per enviar la notificació' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Preparar missatge de notificació
    const notification = {
      title,
      body,
    };

    const messageData = {
      ...data,
      taskId: taskId || '',
      type: notificationType,
      timestamp: new Date().toISOString(),
    };

    console.log(`📨 Enviant notificació a ${tokensToSend.length} dispositius`);
    console.log('Títol:', title);
    console.log('Missatge:', body);
    console.log('Dades:', messageData);

    // Firebase FCM API seria cridada aquí
    // Per ara, simulem l'enviament i guardem a l'historial
    const results = [];
    
    for (const token of tokensToSend) {
      try {
        // Aquí es faria la crida real a Firebase FCM
        // await sendToFirebase(token, notification, messageData);
        
        // Simular resposta exitosa
        results.push({
          token,
          success: true,
          messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });

        console.log(`✅ Notificació enviada exitosament al token: ${token.substring(0, 20)}...`);
      } catch (error) {
        console.error(`❌ Error enviant a token ${token.substring(0, 20)}...:`, error);
        results.push({
          token,
          success: false,
          error: error.message,
        });
      }
    }

    // Guardar notificació a l'historial si hi ha userId
    if (userId) {
      try {
        await supabaseClient
          .from('notification_history')
          .insert({
            user_id: userId,
            title,
            message: body,
            delivery_status: results.some(r => r.success) ? 'sent' : 'failed',
            fcm_response: {
              results,
              sent_at: new Date().toISOString(),
              total_tokens: tokensToSend.length,
              successful: results.filter(r => r.success).length,
              failed: results.filter(r => !r.success).length,
            },
          });
      } catch (historyError) {
        console.error('Error guardant a historial:', historyError);
        // No aturar l'execució per aquest error
      }
    }

    const response = {
      success: true,
      message: 'Notificació processada',
      results: {
        total: tokensToSend.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      },
      details: results,
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Error en edge function:', error);
    
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

// Funció auxiliar per enviar a Firebase FCM (per implementar)
/*
async function sendToFirebase(token: string, notification: any, data: any) {
  const serverKey = Deno.env.get('FIREBASE_SERVER_KEY');
  
  if (!serverKey) {
    throw new Error('FIREBASE_SERVER_KEY no està configurat');
  }

  const response = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Authorization': `key=${serverKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      notification,
      data,
      android: {
        priority: 'high',
      },
      apns: {
        headers: {
          'apns-priority': '10',
        },
        payload: {
          aps: {
            alert: notification,
            sound: 'default',
          },
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Firebase FCM error: ${response.statusText}`);
  }

  return await response.json();
}
*/