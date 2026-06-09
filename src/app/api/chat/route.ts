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
      tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: 'Filter by tags' },
      order_count: { type: SchemaType.NUMBER, description: 'Minimum number of orders' }
    }
  }
};

const createCampaignDeclaration: FunctionDeclaration = {
  name: 'create_campaign',
  description: 'Create and fire a campaign after user confirms',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      name: { type: SchemaType.STRING },
      goal: { type: SchemaType.STRING },
      segment_filters: { type: SchemaType.OBJECT, properties: { anyKey: { type: SchemaType.STRING } } },
      message_template: { type: SchemaType.STRING, description: 'Message with {{name}} placeholder' },
      channel: { type: SchemaType.STRING, description: 'One of: whatsapp, sms, email' }
    },
    required: ['name', 'goal', 'message_template', 'channel']
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

const tools = [{
  functionDeclarations: [
    queryCustomersDeclaration,
    createCampaignDeclaration,
    getCampaignStatsDeclaration
  ]
}];

async function executeTool(name: string, input: any) {
  if (name === 'query_customers') {
    const { data: orders } = await supabase
      .from('orders')
      .select('customer_id, ordered_at, amount');

    const { data: customers } = await supabase
      .from('customers')
      .select('*');

    // Calculate derived stats per customer
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

    // Apply filters
    let filtered = enriched;
    if (input.days_since_order) filtered = filtered.filter(c => c.daysSince >= input.days_since_order);
    if (input.min_spent) filtered = filtered.filter(c => c.totalSpent >= input.min_spent);
    if (input.city) filtered = filtered.filter(c => c.city === input.city);
    if (input.order_count) filtered = filtered.filter(c => c.orderCount >= input.order_count);

    return {
      count: filtered.length,
      sample: filtered.slice(0, 3).map(c => ({ name: c.name, city: c.city, daysSince: c.daysSince })),
      customer_ids: filtered.map(c => c.id)
    };
  }

  if (name === 'create_campaign') {
    // Fetch the customers again to personalize messages
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, email');

    const messages = customers!.slice(0, 50).map(c => ({  // limit for demo
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
    return { success: true, campaign_id: data.campaign.id, messages_queued: messages.length };
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
1. Use query_customers to find the right audience and show them the count + sample
2. Draft a personalized message with {{name}} placeholder
3. Ask for confirmation: "Found X customers. Here's the plan: [summary]. Shall I send this?"
4. Only call create_campaign after explicit confirmation ("yes", "send it", "go ahead")
5. After sending, tell them to check Analytics for live updates

Keep responses concise and conversational. Always show numbers.
Current date: ${new Date().toLocaleDateString('en-IN')}`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      tools: tools
    });

    const formattedHistory = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    const currentMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history: formattedHistory
    });

    let result = await chat.sendMessage(currentMessage);
    let response = result.response;
    
    let debugLogs: any[] = [];
    while (response.functionCalls && (response.functionCalls()?.length || 0) > 0) {
      const calls = response.functionCalls();
      const call = calls ? calls[0] : null;
      if (!call) break;
      debugLogs.push({ event: 'TOOL CALL', name: call.name, args: call.args });
      const toolResult = await executeTool(call.name, call.args);
      debugLogs.push({ event: 'TOOL RESULT', result: toolResult });
      
      result = await chat.sendMessage([{
        functionResponse: {
          name: call.name,
          response: toolResult as any
        }
      }]);
      response = result.response;
      debugLogs.push({ event: 'MODEL AFTER TOOL', text: response.text() });
    }

    const responseText = response.text();
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
