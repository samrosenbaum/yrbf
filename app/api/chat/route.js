import { NextResponse } from 'next/server';

export async function POST(request) {
  const { message } = await request.json();

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4', // OR 'gpt-3.5-turbo' if you don't have GPT-4 access
      messages: [
        { role: 'system', content: 'You are Brad, a flirty, supportive boyfriend who always listens and makes her feel special. Be warm, attentive, playful.' },
        { role: 'user', content: message }
      ],
      max_tokens: 100,
    }),
  });

  const data = await res.json();

  if (!data.choices || !data.choices[0]) {
    return NextResponse.json({ reply: 'Brad is being shy. Try again later.' });
  }

  const reply = data.choices[0].message.content;

  return NextResponse.json({ reply });
}
