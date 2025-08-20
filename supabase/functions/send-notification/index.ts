import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// VAPID Configuration
const VAPID_PUBLIC_KEY = "BDaie0OXdfKEQeTiv-sqcXg6hoElx3LxT0hfE5l5i6zkQCMMtx-IJFodq3UssaBTWc5TBDmt0gsBHqOL0wZGGHg";
const VAPID_PRIVATE_KEY = "BKg8lJsKqEe7FnMW7UJQczOQ8Q4B0-Tn0oJ9B4K9QjRDfPGe_MqOEo-vhX0K8Y6LjGx4A8K4xV1K5k9Fo6KjNDg";
const VAPID_SUBJECT = "mailto:hello@taskflow.app";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { title, body, data, userId } = await req.json();
    console.log('📨 Processant notificació Web Push:', { title, body, userId });

    if (!userId) {
      throw new Error('userId és obligatori');
    }

    // Obtenir subscripcions Web Push de l'usuari
    const { data: subscriptions, error } = await supabaseClient
      .from('web_push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('❌ Error obtenint subscripcions:', error);
      throw error;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('⚠️ No s\'han trobat subscripcions actives');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No active subscriptions found',
        sent: 0,
        total: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`🔍 Trobades ${subscriptions.length} subscripcions per l'usuari`);

    // Preparar payload de notificació
    const notificationPayload = {
      title: title || 'TaskFlow',
      body: body || 'Nova notificació',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: data?.type || 'taskflow-notification',
      data: data || {},
      actions: data?.type === 'task_reminder' ? [
        { action: 'view', title: 'Veure tasca' },
        { action: 'complete', title: 'Marcar completada' }
      ] : [{ action: 'view', title: 'Veure' }],
      requireInteraction: data?.type === 'task_reminder',
      silent: false,
      vibrate: [200, 100, 200]
    };

    // Enviar a totes les subscripcions
    let sentCount = 0;
    let failedCount = 0;
    const results = [];

    for (const subscription of subscriptions) {
      try {
        const result = await sendWebPushNotification(
          subscription,
          notificationPayload
        );
        
        results.push({
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          success: result.success,
          status: result.status,
          error: result.error
        });
        
        if (result.success) {
          sentCount++;
          console.log(`✅ Notificació enviada a dispositiu ${subscription.device_type}`);
        } else {
          failedCount++;
          console.log(`❌ Error enviant a dispositiu ${subscription.device_type}:`, result.error);
          
          // Si l'endpoint ha expirat o és invàlid, desactivar subscripció
          if (result.status === 410 || result.status === 404) {
            await supabaseClient
              .from('web_push_subscriptions')
              .update({ is_active: false })
              .eq('id', subscription.id);
            console.log(`🗑️ Subscripció ${subscription.id} desactivada (endpoint invàlid)`);
          }
        }
      } catch (error) {
        failedCount++;
        console.error(`❌ Error crític enviant notificació:`, error);
        results.push({
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          success: false,
          error: error.message
        });
      }
    }

    // Guardar historial de notificació
    try {
      await supabaseClient
        .from('notification_history')
        .insert({
          user_id: userId,
          title: title || 'Notificació',
          message: body || '',
          delivery_status: sentCount > 0 ? 'sent' : 'failed',
          fcm_response: { 
            total: subscriptions.length,
            sent: sentCount,
            failed: failedCount,
            results: results,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('❌ Error guardant historial:', error);
    }

    console.log(`📊 Resum final: ${sentCount} enviades, ${failedCount} fallides de ${subscriptions.length} total`);

    return new Response(JSON.stringify({
      success: sentCount > 0,
      message: `Notificacions Web Push: ${sentCount}/${subscriptions.length} enviades`,
      sent: sentCount,
      failed: failedCount,
      total: subscriptions.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error general en send-notification:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      sent: 0,
      failed: 1
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Enviar notificació Web Push amb protocol natiu
 */
async function sendWebPushNotification(
  subscription: any,
  payload: any
) {
  try {
    // Preparar l'endpoint
    const endpoint = subscription.endpoint;
    const p256dh = subscription.p256dh_key;
    const auth = subscription.auth_key;

    if (!endpoint || !p256dh || !auth) {
      throw new Error('Dades de subscripció incompletes');
    }

    // Convertir payload a JSON
    const payloadString = JSON.stringify(payload);
    const payloadBuffer = new TextEncoder().encode(payloadString);

    // Generar capçaleres VAPID
    const vapidHeaders = await generateVAPIDHeaders(endpoint);

    // Determinar tipus d'endpoint per configuració específica
    const endpointType = getEndpointType(endpoint);
    console.log(`📱 Enviant a ${endpointType}: ${endpoint.substring(0, 50)}...`);

    // Configurar capçaleres segons l'endpoint
    const headers = {
      'Content-Type': 'application/octet-stream',
      'TTL': '2419200', // 4 setmanes
      ...vapidHeaders
    };

    // Afegir capçaleres específiques per Safari/Apple
    if (endpointType === 'apple') {
      headers['apns-priority'] = '10';
      headers['apns-topic'] = 'taskflow.app';
    }

    // Enviar la notificació
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: payloadBuffer
    });

    const responseText = await response.text().catch(() => '');

    if (response.ok) {
      return { 
        success: true, 
        status: response.status,
        endpoint: endpointType
      };
    } else {
      return { 
        success: false, 
        status: response.status, 
        error: `${response.status}: ${responseText}`,
        endpoint: endpointType
      };
    }
  } catch (error) {
    console.error('❌ Error en sendWebPushNotification:', error);
    return { 
      success: false, 
      error: error.message,
      endpoint: 'unknown'
    };
  }
}

/**
 * Detectar tipus d'endpoint
 */
function getEndpointType(endpoint: string): string {
  if (endpoint.includes('fcm.googleapis.com')) return 'android';
  if (endpoint.includes('updates.push.services.mozilla.com')) return 'firefox';
  if (endpoint.includes('wns.windows.com')) return 'windows';
  if (endpoint.includes('web.push.apple.com')) return 'apple';
  if (endpoint.includes('push.services.mozilla.com')) return 'firefox';
  return 'generic';
}

/**
 * Generar capçaleres VAPID amb JWT
 */
async function generateVAPIDHeaders(endpoint: string): Promise<Record<string, string>> {
  try {
    // Extreure audiència de l'endpoint
    const url = new URL(endpoint);
    const audience = `${url.protocol}//${url.host}`;

    // Crear JWT payload
    const jwtPayload = {
      aud: audience,
      exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60), // 12 hores
      sub: VAPID_SUBJECT
    };

    // Per simplicitat, usar una implementació JWT bàsica
    // En producció caldria una implementació completa amb signatura
    const jwt = await createSimpleJWT(jwtPayload);

    return {
      'Authorization': `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`
    };
  } catch (error) {
    console.error('❌ Error generant VAPID headers:', error);
    return {};
  }
}

/**
 * Crear JWT simple (versió simplificada per testing)
 */
async function createSimpleJWT(payload: any): Promise<string> {
  const header = {
    typ: 'JWT',
    alg: 'ES256'
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  
  // Signatura simplificada per testing
  // En producció caldria usar crypto.subtle.sign amb la clau privada VAPID
  const signature = btoa('simple-signature-for-testing');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}