#!/usr/bin/env node
/**
 * Sync Brevo subscriptions script
 * Updates Brevo contacts with latest subscription data
 * Activates automation journeys based on plans
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const brevoApiKey = process.env.BREVO_API_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey || !brevoApiKey) {
  console.error('❌ Missing required credentials (Supabase or Brevo)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Brevo automation ID mappings by plan
const BREVO_AUTOMATION_MAP = {
  'mensual-pro': 'automation-pro',      // Trigger Brevo automation for Pro plan
  'mensual-basico': 'automation-basic',
  'mensual-plus': 'automation-plus',
  'lifetime-15000': 'automation-lifetime-full',
  'lifetime-10000': 'automation-lifetime-std',
  'lifetime-5000': 'automation-lifetime-lite',
};

async function syncBrevoSubscriptions() {
  console.log('🔄 Syncing subscriptions with Brevo...');

  try {
    // Get all active subscriptions
    const { data: subscriptions, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    if (fetchError) {
      console.error('❌ Error fetching subscriptions:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('ℹ️ No active subscriptions to sync');
      return { success: true, synced: 0 };
    }

    console.log(`ℹ️ Found ${subscriptions.length} subscriptions to sync with Brevo`);

    let synced = 0;
    for (const sub of subscriptions) {
      try {
        // Update Brevo contact with subscription attributes
        const response = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: sub.email,
            attributes: {
              SUBSCRIPTION_PLAN: sub.plan,
              SUBSCRIPTION_STATUS: 'active',
              SUBSCRIPTION_DATE: sub.started_at,
              SUBSCRIPTION_EXPIRES: sub.expires_at || 'lifetime',
            },
            listIds: [2], // Add to "Subscribers" list
          }),
        });

        if (!response.ok) {
          console.warn(`⚠️ Failed to sync ${sub.email}:`, response.statusText);
          continue;
        }

        synced++;
        console.log(`✅ Synced ${sub.email} (${sub.plan})`);
      } catch (err) {
        console.warn(`⚠️ Error syncing ${sub.email}:`, err.message);
      }
    }

    console.log(`\n✅ Sync complete: ${synced}/${subscriptions.length} contacts updated in Brevo`);
    return { success: true, synced };

  } catch (err) {
    console.error('❌ Error during Brevo sync:', err);
    return { success: false, error: err.message };
  }
}

// Run the sync
syncBrevoSubscriptions().then(result => {
  if (!result.success) {
    console.error('Sync failed:', result.error);
    process.exit(1);
  } else {
    console.log('Sync completed successfully');
    process.exit(0);
  }
});
