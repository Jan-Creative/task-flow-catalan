import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      daily_reminder_preferences: {
        Row: {
          id: string
          user_id: string
          is_enabled: boolean
          reminder_time: string
          custom_title: string | null
          custom_message: string | null
          days_of_week: number[]
          timezone: string
          last_sent_at: string | null
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

    // Check if it's a test request
    const body = await req.text();
    let isTest = false;
    try {
      const parsedBody = JSON.parse(body);
      isTest = parsedBody.test === true;
    } catch {
      // Not JSON or no test field, continue normally
    }

    // Get current time and day of week
    const now = new Date();
    const currentDay = now.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Convert Sunday=0 to Monday=1 system (as in DB)
    const weekday = currentDay === 0 ? 7 : currentDay;

    console.log(`Current time: ${now.toISOString()}, Weekday: ${weekday}, Hour: ${currentHour}:${currentMinute}`);

    // Default messages
    const defaultTitle = "🌙 És hora de preparar el dia de demà";
    const defaultMessage = "Dedica uns minuts a planificar les tasques i prioritats de demà.";
    
    if (currentDay === 5) { // Friday
      const defaultTitle = "🎉 Prepara la setmana que ve";
      const defaultMessage = "Planifica la setmana vinent i gaudeix del cap de setmana!";
    }

    // Get users with daily reminder preferences enabled
    const { data: users, error: usersError } = await supabaseClient
      .from('daily_reminder_preferences')
      .select('user_id, reminder_time, custom_title, custom_message, days_of_week, timezone, last_sent_at, is_enabled')
      .eq('is_enabled', true);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      throw usersError;
    }

    console.log(`📋 Found ${users?.length || 0} users with daily reminders enabled`);

    if (!users || users.length === 0) {
      console.log('🔍 No hi ha usuaris amb recordatoris diaris habilitats');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No users with daily reminders enabled', 
          sent: 0 
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Filter users based on their local time and day (unless it's a test)
    const eligibleUsers = isTest ? users : users.filter(user => {
      try {
        // Calculate user's local time using their timezone
        const userTimezone = user.timezone || 'Europe/Madrid';
        const userLocalDate = new Date();
        
        // Get user's local time
        const userLocalTime = userLocalDate.toLocaleString('en-US', {
          timeZone: userTimezone,
          hour12: false,
          hour: '2-digit',
          minute: '2-digit'
        }).slice(-5); // Get HH:MM format
        
    // Get user's local day of week
    const userLocalDay = new Date().toLocaleDateString('en-US', {
      timeZone: userTimezone,
      weekday: 'short'
    });
    
    // Map day names to numbers consistently
    const dayMap: { [key: string]: number } = {
      'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 7
    };
    const userWeekday = dayMap[userLocalDay] || 1;

        console.log(`👤 User ${user.user_id}: Local time ${userLocalTime}, Local day ${userWeekday}, Reminder time ${user.reminder_time}, Timezone: ${userTimezone}`);

        // Check if today is an active day for this user in their timezone
        if (!user.days_of_week.includes(userWeekday)) {
          console.log(`📅 User ${user.user_id}: Not scheduled for day ${userWeekday}`);
          return false;
        }

        // Check if it's the correct time (with ±5 minutes tolerance)
        const [reminderHour, reminderMinute] = user.reminder_time.split(':').map(Number);
        const [userHour, userMinute] = userLocalTime.split(':').map(Number);
        
        const currentTimeMinutes = userHour * 60 + userMinute;
        const reminderTimeMinutes = reminderHour * 60 + reminderMinute;
        
        // Tolerance of 5 minutes before and after
        const timeDiff = Math.abs(currentTimeMinutes - reminderTimeMinutes);
        
        if (timeDiff > 5) {
          console.log(`⏰ User ${user.user_id}: Time diff too large (${timeDiff} minutes)`);
          return false;
        }

        // Check if we haven't sent today already (prevent duplicates)
        const today = new Date().toISOString().split('T')[0];
        const lastSentDate = user.last_sent_at ? new Date(user.last_sent_at).toISOString().split('T')[0] : null;

        if (lastSentDate === today) {
          console.log(`⏭️ User ${user.user_id}: Already sent today`);
          return false;
        }

        console.log(`✅ User ${user.user_id} is eligible (time diff: ${timeDiff} minutes)`);
        return true;
      } catch (error) {
        console.error(`❌ Error processing user ${user.user_id}:`, error);
        return false;
      }
    });

    console.log(`✅ ${eligibleUsers.length} users eligible for notifications (day/time filter)`);

    if (eligibleUsers.length === 0 && !isTest) {
      console.log('🔕 No hi ha usuaris elegibles en aquest moment (dia/hora)');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No eligible users at this time (day/hour)', 
          sent: 0 
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
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
          sent: 0 
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send notifications to each eligible user
    let sentCount = 0;
    const errors: string[] = [];

    for (const user of eligibleUsers) {
      try {
        // Determine title and message (custom or default)
        const notificationTitle = user.custom_title || defaultTitle;
        const notificationMessage = user.custom_message || defaultMessage;

        // Get active subscriptions for this user
        const userSubscriptions = subscriptions.filter(s => s.user_id === user.user_id);

        if (userSubscriptions.length === 0) {
          console.log(`⚠️ L'usuari ${user.user_id} no té subscripcions actives`);
          continue;
        }

        // Send notification to each subscription
        for (const subscription of userSubscriptions) {
          try {
            const { error: notificationError } = await supabaseClient.functions.invoke('send-notification', {
              body: {
                title: notificationTitle,
                body: notificationMessage,
                userId: user.user_id,
                data: {
                  type: 'daily_preparation_reminder',
                  timestamp: now.toISOString(),
                  url: '/prepare-tomorrow',
                  test: isTest
                }
              }
            });

            if (notificationError) {
              console.error(`❌ Error enviant notificació:`, notificationError);
              errors.push(`Notification error: ${notificationError.message}`);
            } else {
              console.log(`✅ Notificació enviada a l'usuari ${user.user_id} - ${notificationTitle}`);
              sentCount++;
              
              // Update last_sent_at for this user to prevent duplicates
              await supabaseClient
                .from('daily_reminder_preferences')
                .update({ last_sent_at: now.toISOString() })
                .eq('user_id', user.user_id);
            }
          } catch (error) {
            console.error(`❌ Error enviant notificació a l'usuari ${user.user_id}:`, error);
            errors.push(`User ${user.user_id}: ${error.message}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processant l'usuari ${user.user_id}:`, error);
        errors.push(`User ${user.user_id}: ${error.message}`);
      }
    }

    const result = {
      success: true,
      message: `Daily preparation reminders processed ${isTest ? '(TEST MODE)' : ''}`,
      sent: sentCount,
      total_subscriptions: subscriptions.length,
      eligible_users: eligibleUsers.length,
      weekday,
      current_time: `${currentHour}:${currentMinute}`,
      test_mode: isTest,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('📊 Final result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error) {
    console.error('❌ Fatal error in daily preparation reminder:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders }, status: 500 }
    );
  }
});