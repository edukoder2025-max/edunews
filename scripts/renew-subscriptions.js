#!/usr/bin/env node
/**
 * Monthly subscription renewal script
 * Renews monthly subscriptions that have expired
 * Runs as part of GitHub Action reader-revenue-renewal.yml
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function renewMonthlySubscriptions() {
  console.log('🔄 Starting monthly subscription renewal...');

  try {
    // Find subscriptions that expired in the last 24 hours
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const now = new Date();

    const { data: expiredSubs, error: fetchError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('expires_at', null) // Monthly subscriptions have null expires_at
      .lt('updated_at', yesterday.toISOString())
      .gt('updated_at', now.toISOString());

    if (fetchError) {
      console.error('❌ Error fetching subscriptions:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!expiredSubs || expiredSubs.length === 0) {
      console.log('ℹ️ No subscriptions to renew at this time');
      return { success: true, renewed: 0 };
    }

    console.log(`ℹ️ Found ${expiredSubs.length} monthly subscriptions to process`);

    // Update monthly subscriptions (extend expires_at by 1 month)
    let renewed = 0;
    for (const sub of expiredSubs) {
      const newExpiryDate = new Date();
      newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);

      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ 
          expires_at: newExpiryDate.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq('id', sub.id);

      if (updateError) {
        console.warn(`⚠️ Failed to renew subscription ${sub.id}:`, updateError);
      } else {
        renewed++;
        console.log(`✅ Renewed subscription for ${sub.email} (${sub.plan})`);
      }
    }

    console.log(`\n✅ Renewal complete: ${renewed}/${expiredSubs.length} subscriptions renewed`);
    return { success: true, renewed };

  } catch (err) {
    console.error('❌ Error during renewal process:', err);
    return { success: false, error: err.message };
  }
}

// Run the renewal
renewMonthlySubscriptions().then(result => {
  if (!result.success) {
    console.error('Renewal failed:', result.error);
    process.exit(1);
  } else {
    console.log('Renewal completed successfully');
    process.exit(0);
  }
});
