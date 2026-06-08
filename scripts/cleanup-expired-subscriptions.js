#!/usr/bin/env node
/**
 * Clean up expired subscriptions script
 * Removes or archives subscriptions that have expired for more than 30 days
 * Sends farewell emails via Brevo
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const brevoApiKey = process.env.BREVO_API_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function cleanupExpiredSubscriptions() {
  console.log('🗑️ Cleaning up expired subscriptions...');

  try {
    // Find subscriptions that expired more than 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: expiredSubs, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .lt('expires_at', thirtyDaysAgo.toISOString())
      .neq('expires_at', null);

    if (fetchError) {
      console.error('❌ Error fetching expired subscriptions:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!expiredSubs || expiredSubs.length === 0) {
      console.log('ℹ️ No expired subscriptions to clean up');
      return { success: true, cleaned: 0 };
    }

    console.log(`ℹ️ Found ${expiredSubs.length} subscriptions expired for 30+ days`);

    // Mark as archived instead of deleting (for audit trail)
    let cleaned = 0;
    for (const sub of expiredSubs) {
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ 
          metadata: {
            ...sub.metadata,
            archived_at: new Date().toISOString(),
            archive_reason: 'expired_30_days_ago',
          },
        })
        .eq('id', sub.id);

      if (updateError) {
        console.warn(`⚠️ Failed to archive subscription ${sub.id}:`, updateError);
      } else {
        cleaned++;
        console.log(`✅ Archived expired subscription for ${sub.email}`);

        // Optional: Send a re-engagement email via Brevo
        if (brevoApiKey) {
          try {
            await fetch('https://api.brevo.com/v3/smtp/email', {
              method: 'POST',
              headers: {
                'api-key': brevoApiKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: [{ email: sub.email }],
                templateId: 1, // Use your re-engagement template ID
                params: {
                  FIRSTNAME: sub.metadata?.first_name || 'Usuario',
                  PLAN: sub.plan,
                },
              }),
            });
            console.log(`📧 Re-engagement email sent to ${sub.email}`);
          } catch (emailErr) {
            console.warn(`⚠️ Could not send re-engagement email to ${sub.email}`);
          }
        }
      }
    }

    console.log(`\n✅ Cleanup complete: ${cleaned}/${expiredSubs.length} subscriptions archived`);
    return { success: true, cleaned };

  } catch (err) {
    console.error('❌ Error during cleanup:', err);
    return { success: false, error: err.message };
  }
}

// Run the cleanup
cleanupExpiredSubscriptions().then(result => {
  if (!result.success) {
    console.error('Cleanup failed:', result.error);
    process.exit(1);
  } else {
    console.log('Cleanup completed successfully');
    process.exit(0);
  }
});
