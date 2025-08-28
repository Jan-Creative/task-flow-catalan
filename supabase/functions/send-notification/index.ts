import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Configurar VAPID amb variables d'entorn
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const rawVapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@taskflow.app';
    
    // Sanititzar VAPID_SUBJECT: eliminar espais i angle brackets que causen BadJwtToken
    const vapidSubject = rawVapidSubject.trim().replace(/[<>\s]/g, '');

    console.log('🔑 Verificant VAPID keys...', {
      hasPublicKey: !!vapidPublicKey,
      hasPrivateKey: !!vapidPrivateKey,
      rawSubject: rawVapidSubject,
      sanitizedSubject: vapidSubject
    });

    if (!vapidPublicKey || !vapidPrivateKey) {
      const errorMsg = `VAPID keys no configurades. Té publicKey: ${!!vapidPublicKey}, té privateKey: ${!!vapidPrivateKey}`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

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

    // Crear payload base
    const basePayload = {
      title: title || 'TaskFlow',
      body: body || 'Nova notificació',
      icon: data?.icon || '/icon-192x192.png',
      badge: data?.badge || '/icon-192x192.png',
      tag: data?.type || 'taskflow-notification',
      data: data || {},
      silent: false
    };

    // Funció per crear payload optimitzat per plataforma
    const createPlatformPayload = (deviceType: string, deviceOS: string) => {
      const isDesktop = deviceType === 'macos' || deviceOS?.includes('macOS');
      const isIPad = deviceOS?.includes('iPad');
      const isIPhone = deviceType === 'ios' && !isIPad;
      
      let payload = { ...basePayload };
      
      // Optimitzacions per desktop (macOS)
      if (isDesktop) {
        payload = {
          ...payload,
          requireInteraction: data?.type === 'task_reminder',
          actions: data?.type === 'task_reminder' ? [
            { action: 'view', title: 'Veure tasca' },
            { action: 'complete', title: 'Marcar com a completada' },
            { action: 'snooze', title: 'Posposa 10 min' }
          ] : [
            { action: 'view', title: 'Veure' },
            { action: 'dismiss', title: 'Descartar' }
          ],
          // Títol i cos més llargs per desktop
          title: (title || 'TaskFlow').substring(0, 100),
          body: (body || 'Nova notificació').substring(0, 300)
        };
      }
      
      // Optimitzacions per iPad
      else if (isIPad) {
        payload = {
          ...payload,
          requireInteraction: data?.type === 'task_reminder',
          actions: data?.type === 'task_reminder' ? [
            { action: 'view', title: 'Veure' },
            { action: 'complete', title: 'Completar' }
          ] : [{ action: 'view', title: 'Veure' }],
          // Llargada mitjana per iPad
          title: (title || 'TaskFlow').substring(0, 70),
          body: (body || 'Nova notificació').substring(0, 200),
          vibrate: [200, 100, 200]
        };
      }
      
      // Optimitzacions per iPhone
      else if (isIPhone) {
        payload = {
          ...payload,
          requireInteraction: data?.type === 'task_reminder',
          actions: data?.type === 'task_reminder' ? [
            { action: 'view', title: 'Veure' },
            { action: 'complete', title: 'Fet' }
          ] : [{ action: 'view', title: 'Veure' }],
          // Títol i cos curts per iPhone
          title: (title || 'TaskFlow').substring(0, 50),
          body: (body || 'Nova notificació').substring(0, 150),
          vibrate: [200, 100, 200]
        };
      }
      
      // Android i altres
      else {
        payload = {
          ...payload,
          requireInteraction: data?.type === 'task_reminder',
          actions: data?.type === 'task_reminder' ? [
            { action: 'view', title: 'Veure tasca' },
            { action: 'complete', title: 'Completar' }
          ] : [{ action: 'view', title: 'Veure' }],
          vibrate: [200, 100, 200]
        };
      }
      
      return payload;
    };

    // Enviar a totes les subscripcions
    let sentCount = 0;
    let failedCount = 0;
    const results = [];

    for (const subscription of subscriptions) {
      try {
        // Crear payload optimitzat per aquesta plataforma específica
        const platformPayload = createPlatformPayload(subscription.device_type, subscription.device_os);
        
        // Normalitzar claus a base64url (eliminar padding i caràcters problemàtics)
        const normalizeKey = (key: string) => {
          return key.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        };
        
        // Reconstruir objecte de subscripció per web-push
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: normalizeKey(subscription.p256dh_key),
            auth: normalizeKey(subscription.auth_key)
          }
        };

        // Determinar opcions segons tipus d'endpoint i plataforma
        const options: any = {};
        
        // TTL específic per plataforma
        const isDesktop = subscription.device_type === 'macos' || subscription.device_os?.includes('macOS');
        const isIPad = subscription.device_os?.includes('iPad');
        
        if (isDesktop) {
          options.TTL = 60 * 60 * 24 * 7; // 7 dies per desktop
        } else if (isIPad) {
          options.TTL = 60 * 60 * 24 * 5; // 5 dies per iPad
        } else {
          options.TTL = 60 * 60 * 24 * 3; // 3 dies per mòbil
        }

        // Configuració específica per Apple/Safari
        if (subscription.endpoint.includes('web.push.apple.com')) {
          const priority = data?.type === 'task_reminder' ? '10' : '5';
          
          options.headers = {
            'apns-priority': priority,
            'apns-topic': 'web.push',
            'apns-push-type': 'alert'
          };
          
          // Headers específics per iPad (pantalla més gran)
          if (isIPad) {
            options.headers['apns-expiration'] = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 5);
          }
          
          // Headers específics per macOS (desktop)
          if (isDesktop) {
            options.headers['apns-expiration'] = Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7);
            options.headers['apns-collapse-id'] = data?.type || 'taskflow-notification';
          }
        }

        const deviceInfo = `${subscription.device_type} (${subscription.device_os || 'unknown'})`;
        console.log(`📱 Enviant a ${deviceInfo}: ${subscription.endpoint.substring(0, 50)}...`);

        // Enviar notificació amb web-push
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(platformPayload),
          options
        );

        sentCount++;
        
        // Create VAPID fingerprint for debugging
        const vapidFingerprint = vapidPublicKey ? vapidPublicKey.substring(0, 8) : 'unknown';
        console.log(`✅ Notificació enviada a dispositiu ${subscription.device_type} (VAPID: ${vapidFingerprint})`);
        
        results.push({
          endpoint: subscription.endpoint.substring(0, 50) + '...',
          success: true,
          deviceType: subscription.device_type,
          deviceOS: subscription.device_os,
          platform: `${subscription.device_type} (${subscription.device_os || 'unknown'})`,
          payloadLength: JSON.stringify(platformPayload).length,
          ttl: options.TTL,
          vapidSubject: vapidSubject
        });

        } catch (error: any) {
          failedCount++;
          const status = error?.statusCode ?? null;
          const responseBody = error?.body ?? null;
          console.log(`❌ Error enviant a dispositiu ${subscription.device_type}:`, {
            message: error?.message,
            statusCode: status,
            body: typeof responseBody === 'string' ? responseBody : undefined
          });
          
          results.push({
            endpoint: subscription.endpoint.substring(0, 50) + '...',
            success: false,
            error: error?.message,
            statusCode: status,
            deviceType: subscription.device_type,
            deviceOS: subscription.device_os,
            platform: `${subscription.device_type} (${subscription.device_os || 'unknown'})`,
            vapidSubject: vapidSubject
          });
  
          // Si l'endpoint ha expirat o és invàlid, desactivar subscripció
          if (status === 410 || status === 404) {
            await supabaseClient
              .from('web_push_subscriptions')
              .update({ is_active: false })
              .eq('id', subscription.id);
            console.log(`🗑️ Subscripció ${subscription.id} desactivada (endpoint invàlid)`);
          }
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
            timestamp: new Date().toISOString(),
            method: 'web-push-library'
          }
        });
    } catch (error) {
      console.error('❌ Error guardant historial:', error);
    }

    console.log(`📊 Resum final: ${sentCount} enviades, ${failedCount} fallides de ${subscriptions.length} total`);

    // Add server VAPID fingerprint for debugging
    const serverVapidFingerprint = vapidPublicKey ? vapidPublicKey.substring(0, 8) : 'unknown';
    
    return new Response(JSON.stringify({
      success: sentCount > 0,
      message: `Notificacions Web Push: ${sentCount}/${subscriptions.length} enviades`,
      sent: sentCount,
      failed: failedCount,
      total: subscriptions.length,
      results,
      diagnostics: {
        serverVapidFingerprint,
        vapidSubject: vapidSubject,
        rawVapidSubject: rawVapidSubject,
        timestamp: new Date().toISOString(),
        hasVapidKeys: {
          publicKey: !!vapidPublicKey,
          privateKey: !!vapidPrivateKey
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error general en send-notification:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      sent: 0,
      failed: 1,
      diagnostics: {
        serverVapidFingerprint: 'error',
        timestamp: new Date().toISOString(),
        hasVapidKeys: {
          publicKey: !!Deno.env.get('VAPID_PUBLIC_KEY'),
          privateKey: !!Deno.env.get('VAPID_PRIVATE_KEY')
        }
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});