import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const queryCustomersDeclaration: FunctionDeclaration = {
  name: 'query_customers',
  description: 'Query customers based on filters like days since last order, total spent, city, tags',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      days_since_order: { type: SchemaType.NUMBER, description: 'Minimum days since last order' },
      min_spent: { type: SchemaType.NUMBER, description: 'Minimum total amount spent' },
      max_spent: { type: SchemaType.NUMBER, description: 'Maximum total amount spent' },
      city: { type: SchemaType.STRING, description: 'Filter by city' },
      name: { type: SchemaType.STRING, description: 'Filter by customer name' },
      tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: 'Filter by tags' },
      min_orders: { type: SchemaType.NUMBER, description: 'Minimum number of orders' },
      max_orders: { type: SchemaType.NUMBER, description: 'Maximum number of orders' },
      exact_orders: { type: SchemaType.NUMBER, description: 'Exact number of orders' }
    }
  }
};

const createCampaignDeclaration: FunctionDeclaration = {
  name: 'create_campaign',
  description: 'Create a draft campaign in the system so the user can preview it',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      name: { type: SchemaType.STRING },
      goal: { type: SchemaType.STRING },
      segment_filters: { 
        type: SchemaType.OBJECT, 
        description: 'Segment filters used to find customers',
        properties: {
          days_since_order: { type: SchemaType.NUMBER },
          min_spent: { type: SchemaType.NUMBER },
          max_spent: { type: SchemaType.NUMBER },
          city: { type: SchemaType.STRING },
          name: { type: SchemaType.STRING },
          tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          min_orders: { type: SchemaType.NUMBER },
          max_orders: { type: SchemaType.NUMBER },
          exact_orders: { type: SchemaType.NUMBER }
        }
      },
      message_template: { type: SchemaType.STRING, description: 'Message with {{name}} placeholder' },
      channel: { type: SchemaType.STRING, description: 'One of: whatsapp, sms, email' }
    },
    required: ['name', 'goal', 'message_template', 'channel']
  }
};

const sendCampaignDeclaration: FunctionDeclaration = {
  name: 'send_campaign',
  description: 'Send a previously drafted campaign after user confirms',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      campaign_id: { type: SchemaType.STRING }
    },
    required: ['campaign_id']
  }
};

const getCampaignStatsDeclaration: FunctionDeclaration = {
  name: 'get_campaign_stats',
  description: 'Get live stats for a specific campaign',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      campaign_id: { type: SchemaType.STRING }
    },
    required: ['campaign_id']
  }
};

async function getFilteredCustomers(filters: any) {
  const { data: orders } = await supabase.from('orders').select('customer_id, ordered_at, amount');
  const { data: customers } = await supabase.from('customers').select('*');

  const enriched = customers!.map(c => {
    const customerOrders = orders!.filter(o => o.customer_id === c.id);
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.amount, 0);
    const lastOrder = customerOrders.sort((a, b) =>
      new Date(b.ordered_at).getTime() - new Date(a.ordered_at).getTime()
    )[0];
    const daysSince = lastOrder
      ? Math.floor((Date.now() - new Date(lastOrder.ordered_at).getTime()) / 86400000)
      : 999;

    return { ...c, totalSpent, daysSince, orderCount: customerOrders.length };
  });

  let filtered = enriched;
  if (filters.days_since_order !== undefined) filtered = filtered.filter(c => c.daysSince >= filters.days_since_order);
  if (filters.min_spent !== undefined) filtered = filtered.filter(c => c.totalSpent >= filters.min_spent);
  if (filters.max_spent !== undefined) filtered = filtered.filter(c => c.totalSpent <= filters.max_spent);
  if (filters.city !== undefined) filtered = filtered.filter(c => c.city === filters.city);
  if (filters.name !== undefined) filtered = filtered.filter(c => c.name.toLowerCase().includes(filters.name.toLowerCase()));
  if (filters.min_orders !== undefined) filtered = filtered.filter(c => c.orderCount >= filters.min_orders);
  if (filters.max_orders !== undefined) filtered = filtered.filter(c => c.orderCount <= filters.max_orders);
  if (filters.exact_orders !== undefined) filtered = filtered.filter(c => c.orderCount === filters.exact_orders);

  return filtered;
}

async function executeTool(name: string, input: any) {
  if (name === 'query_customers') {
    const filtered = await getFilteredCustomers(input);

    return {
      count: filtered.length,
      sample: filtered.slice(0, 3).map(c => ({ name: c.name, city: c.city, daysSince: c.daysSince })),
      customer_ids: filtered.map(c => c.id)
    };
  }

  if (name === 'create_campaign') {
    // Re-run the filter logic to get the exact real audience
    const customers = await getFilteredCustomers(input.segment_filters || {});

    const messages = customers.map(c => ({
      customer_id: c.id,
      content: input.message_template.replace('{{name}}', c.name.split(' ')[0]),
      channel: input.channel
    }));

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, messages, draft: true })
    });

    const data = await response.json();
    if (!data.campaign) {
      return { success: false, error: data.error || data.details || "Failed to create campaign" };
    }
    return { success: true, campaign_id: data.campaign.id, messages_queued: messages.length, note: 'Draft created successfully. Ask user for confirmation to send.' };
  }

  if (name === 'send_campaign') {
    // We update the DB status to 'running' which triggers the backend pollers
    const { error } = await supabase
      .from('campaigns')
      .update({ status: 'running' })
      .eq('id', input.campaign_id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: "Campaign has been sent!" };
  }

  if (name === 'get_campaign_stats') {
    const { data: messages } = await supabase
      .from('messages')
      .select('status, delivered_at, opened_at, clicked_at')
      .eq('campaign_id', input.campaign_id);

    return {
      total: messages?.length,
      sent: messages?.filter(m => m.status !== 'pending').length,
      delivered: messages?.filter(m => m.delivered_at).length,
      opened: messages?.filter(m => m.opened_at).length,
      clicked: messages?.filter(m => m.clicked_at).length,
    };
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `You are a CRM campaign agent for Roast & Co., a coffee chain brand in India.
You help marketers reach their customers through targeted campaigns.

When a marketer describes a goal:
1. Use query_customers to find the right audience.
2. IMMEDIATELY use the create_campaign tool to generate a draft of the personalized message in the system. NEVER ask for permission before creating the draft.
   - IMPORTANT: The message_template must NOT include a "Subject:" line or title. Start directly with the greeting.
3. Once the draft is created, respond to the user in a clearly structured, friendly way using paragraphs and bullet points.

FORMATTING RULES for your response:
- Announce the audience count clearly (e.g. "I found **250** high-value customers!").
- List the sample customer names using proper bullet points (e.g. "\\n- Priya\\n- Rohan").
- DO NOT use markdown headings with hashes (like "### Plan" or "###").
- End your message by saying: "I've created a draft! Review the preview on the right. Shall I send this?"

4. Only use the send_campaign tool after the user provides explicit confirmation ("yes", "send it", "go ahead").
5. After sending, tell them the campaign is running and to check Analytics for live updates.

Keep responses concise and conversational.
Current date: ${new Date().toLocaleDateString('en-IN')}`;

    // Convert history format to Gemini format, enforcing strict alternating 'user'/'model' roles
    let rawHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content || "" }]
    }));

    let history: any[] = [];
    for (const msg of rawHistory) {
      if (history.length === 0) {
        if (msg.role === 'user') history.push(msg);
      } else {
        if (history[history.length - 1].role !== msg.role) {
          history.push(msg);
        } else {
          // If same role, append text to the previous message to maintain alternation
          history[history.length - 1].parts[0].text += "\n" + msg.parts[0].text;
        }
      }
    }
    
    const lastMessage = messages[messages.length - 1].content;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      tools: [{
        functionDeclarations: [
          queryCustomersDeclaration,
          createCampaignDeclaration,
          sendCampaignDeclaration,
          getCampaignStatsDeclaration
        ]
      }]
    });

    const chat = model.startChat({ history });

    let debugLogs: any[] = [];
    let responseText = "";

    // Send the user's message
    let result = await chat.sendMessage(lastMessage);
    let calls = result.response.functionCalls();

    while (calls && calls.length > 0) {
      const functionResponses = [];
      
      for (const call of calls) {
        debugLogs.push({ event: 'TOOL CALL', name: call.name, args: call.args });
        
        const toolResult = await executeTool(call.name, call.args);
        debugLogs.push({ event: 'TOOL RESULT', result: toolResult });
        
        functionResponses.push({
          functionResponse: {
            name: call.name,
            response: toolResult as any
          }
        });
      }

      // Send tool results back to the model
      result = await chat.sendMessage(functionResponses);
      calls = result.response.functionCalls();
    }

    responseText = result.response.text();
    debugLogs.push({ event: 'FINAL TEXT', text: responseText });
    
    return NextResponse.json({ 
      message: responseText, 
      updatedMessages: [...messages, { role: 'assistant', content: responseText }],
      debug: debugLogs
    });
  } catch (e: any) {
    console.error("Chat error:", e);
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
  }
}
