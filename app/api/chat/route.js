import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { personalities } from "@/lib/personalities";

export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const body = await req.json();
  const pastMessages = body.messages || [];
  const personalityKey = body.personality || 'dimitri';
  const personality = personalities[personalityKey] || personalities['dimitri'];

  const isStarter = body.starter;

  try {
    const formattedMessages = [
      { role: "system", content: personality.prompt }
    ];

    if (!isStarter && pastMessages.length > 0) {
      formattedMessages.push(...pastMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    } else if (isStarter) {
      formattedMessages.push({ role: "user", content: "Say hi to the user and start a flirty, fun conversation." });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: formattedMessages,
      temperature: 0.9,
    });

    const aiReply = response.choices[0]?.message?.content || "Hmm... I'm not sure what to say.";

    return NextResponse.json({ reply: aiReply });
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json({ reply: "Sorry, something went wrong." });
  }
}
