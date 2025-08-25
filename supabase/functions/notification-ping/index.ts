import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    // Comprovar configuració VAPID
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@taskflow.app';

    console.log('🏥 Health check de notificacions executat');

    // Comprovar subscripcions actives
    const { data: activeSubscriptions, error: subError } = await supabaseClient
      .from('web_push_subscriptions')
      .select('count')
      .eq('is_active', true);

    if (subError) {
      console.error('❌ Error accedint a subscripcions:', subError);
    }

    // Comprovar historial recent
    const { data: recentHistory, error: histError } = await supabaseClient
      .from('notification_history')
      .select('count')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (histError) {
      console.error('❌ Error accedint a historial:', histError);
    }

    const diagnostics = {
      timestamp: new Date().toISOString(),
      vapid: {
        publicKey: !!vapidPublicKey,
        privateKey: !!vapidPrivateKey,
        subject: vapidSubject,
        fingerprint: vapidPublicKey ? vapidPublicKey.substring(0, 8) : null
      },
      database: {
        activeSubscriptions: activeSubscriptions?.[0]?.count || 0,
        recentNotifications: recentHistory?.[0]?.count || 0,
        subscriptionsError: !!subError,
        historyError: !!histError
      },
      environment: {
        supabaseUrl: !!Deno.env.get('SUPABASE_URL'),
        serviceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      }
    };

    const isHealthy = vapidPublicKey && vapidPrivateKey && !subError && !histError;

    return new Response(JSON.stringify({
      status: isHealthy ? 'healthy' : 'degraded',
      diagnostics
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: isHealthy ? 200 : 503
    });

  } catch (error) {
    console.error('❌ Error en health check:', error);
    return new Response(JSON.stringify({
      status: 'error',
      error: error.message,
      diagnostics: {
        timestamp: new Date().toISOString(),
        error: true
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});