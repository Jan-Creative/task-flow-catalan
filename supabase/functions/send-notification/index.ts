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

    // Enviar notificacions via Firebase FCM
    const results = [];
    
    for (const token of tokensToSend) {
      try {
        // Cridar a Firebase FCM amb la Service Account Key
        const result = await sendToFirebase(token, notification, messageData);
        
        results.push({
          token,
          success: true,
          messageId: result.messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          response: result,
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

// Funció per enviar a Firebase FCM utilitzant Service Account
async function sendToFirebase(token: string, notification: any, data: any) {
  const serviceAccountKey = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_KEY');
  
  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY no està configurat');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountKey);
  } catch (error) {
    throw new Error('Error parsejant FIREBASE_SERVICE_ACCOUNT_KEY: ' + error.message);
  }

  // Obtenir access token OAuth2 per la Service Account
  const accessToken = await getFirebaseAccessToken(serviceAccount);

  // Enviar notificació utilitzant l'API v1 de Firebase
  const projectId = serviceAccount.project_id;
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: {
        token,
        notification,
        data,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channel_id: 'default',
          },
        },
        apns: {
          headers: {
            'apns-priority': '10',
          },
          payload: {
            aps: {
              alert: notification,
              sound: 'default',
              badge: 1,
            },
          },
        },
        webpush: {
          headers: {
            'Urgency': 'high',
          },
          notification: {
            ...notification,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            actions: data.type === 'task_reminder' ? [
              { action: 'view', title: 'Veure tasca' },
              { action: 'complete', title: 'Completar' }
            ] : [
              { action: 'view', title: 'Veure' }
            ],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Firebase FCM v1 error: ${response.statusText} - ${errorData}`);
  }

  return await response.json();
}

// Funcio per obtenir access token OAuth2 per Firebase
async function getFirebaseAccessToken(serviceAccount: any) {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hora

  // Crear JWT token per OAuth2
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: expiry,
  };

  // Crear JWT signature (simplified - en producció utilitzar biblioteca JWT)
  const headerBase64 = btoa(JSON.stringify(header));
  const payloadBase64 = btoa(JSON.stringify(payload));
  const unsignedToken = `${headerBase64}.${payloadBase64}`;

  // Per simplicitat, utilitzem l'API de Google per crear el token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: await createJWTAssertion(serviceAccount),
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Error obtenint access token: ${tokenResponse.statusText}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Crear JWT assertion per OAuth2
async function createJWTAssertion(serviceAccount: any) {
  const now = Math.floor(Date.now() / 1000);
  
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  // Encode header and payload
  const encodedHeader = btoa(JSON.stringify(header)).replace(/[+\/]/g, (m) => ({ '+': '-', '/': '_' })[m]).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/[+\/]/g, (m) => ({ '+': '-', '/': '_' })[m]).replace(/=/g, '');
  
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  
  // Import private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    new TextEncoder().encode(serviceAccount.private_key.replace(/\\n/g, '\n')),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );

  // Sign the token
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(unsignedToken)
  );

  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/[+\/]/g, (m) => ({ '+': '-', '/': '_' })[m])
    .replace(/=/g, '');

  return `${unsignedToken}.${encodedSignature}`;
}