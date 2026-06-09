// Native fetch in Node 18+
// Wait, this is running locally, node index.js runs in channel-service.
// The frontend runs on Next.js 14 which has Node 18+ builtin fetch.

async function runE2ETest() {
  console.log("🚀 Starting E2E Test with OpenAI Backend");
  try {
    const APP_URL = "http://localhost:3000";

    // Step 1: Initialize Chat
    console.log("\\n💬 [1/4] Sending initial prompt to Campaign Agent...");
    const chatReq = await fetch(`${APP_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: "I want to run a win-back email campaign for lapsed customers (>60 days). Make it friendly." }]
      })
    });
    const chatRes = await chatReq.json();
    
    if (chatRes.error) {
      console.error("❌ Chat API failed:", chatRes.error);
      return;
    }
    
    console.log("✅ Chat Response:", chatRes.message);
    
    // Check if it queried customers
    const usedQueryTool = chatRes.debug?.some(d => d.name === 'query_customers');
    console.log(usedQueryTool ? "✅ AI successfully used query_customers tool!" : "⚠️ AI did not use query_customers tool.");

    // Step 2: Confirm Campaign Creation
    console.log("\\n💬 [2/4] Sending confirmation to trigger campaign creation...");
    const confirmMessages = [
      ...chatRes.updatedMessages,
      { role: 'user', content: 'Yes, please send it!' }
    ];

    const confirmReq = await fetch(`${APP_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: confirmMessages })
    });
    const confirmRes = await confirmReq.json();

    if (confirmRes.error) {
      console.error("❌ Confirm API failed:", confirmRes.error);
      return;
    }

    console.log("✅ Confirmation Response:", confirmRes.message);

    const createCampaignToolIndex = confirmRes.debug?.findIndex(d => d.name === 'create_campaign');
    if (createCampaignToolIndex === -1 || createCampaignToolIndex === undefined) {
      console.error("❌ AI failed to call create_campaign tool!");
      return;
    }
    
    console.log("✅ AI successfully called create_campaign tool!");
    const toolResultEvent = confirmRes.debug[createCampaignToolIndex + 1];
    if (!toolResultEvent || !toolResultEvent.result || !toolResultEvent.result.success) {
      console.error("❌ create_campaign tool failed during execution!", toolResultEvent);
      return;
    }

    const campaignId = toolResultEvent.result.campaign_id;
    console.log(`✅ Draft Campaign ID generated: ${campaignId}`);

    // Step 3: Trigger Campaign Send
    console.log("\\n🚀 [3/4] Sending Campaign to Channel Service...");
    const sendReq = await fetch(`${APP_URL}/api/campaigns/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId })
    });
    
    const sendRes = await sendReq.json();
    if (sendRes.error) {
       console.error("❌ Send API failed:", sendRes.error);
       return;
    }
    
    console.log("✅ Campaign Successfully Queued for Delivery!", sendRes);

    // Step 4: Verify Analytics Update
    console.log("\\n📊 [4/4] Verifying Analytics and Stats...");
    const statsReq = await fetch(`${APP_URL}/api/analytics`);
    const statsRes = await statsReq.json();
    
    const campaignFound = statsRes.campaigns.find(c => c.id === campaignId);
    if (campaignFound) {
       console.log(`✅ Analytics accurately reflects the campaign: ${campaignFound.name} [Status: ${campaignFound.status}]`);
    } else {
       console.error("❌ Failed to find the campaign in recent analytics.");
    }

    console.log("\\n🎉 End-to-End Test Completed Successfully!");

  } catch (err) {
    console.error("❌ Uncaught Error during test:", err);
  }
}

runE2ETest();
