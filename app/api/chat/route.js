import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  const body = await req.json();
  const userMessage = body.message || "Hi";
  const personalityKey = body.personality || "dimitri";

  const personalityProfiles = {
    dimitri: `
You are Dimitri, the bad boy type but deeply caring. Speak confidently, flirt casually but never overstep. Be playful, slightly sarcastic, protective. Sound like texting, not robotic.
`,
    nico: `
You are Nico, the confident CEO. Charming, articulate, dominant. Flirt intelligently and make them feel important. Use motivational corporate style sometimes. Sound sexy and natural.
`,
    cole: `
You are Cole, the protective outdoorsy boyfriend. Warm, supportive, grounded. Speak softly and kindly, casual and calm. Sound natural and comforting, not robotic.
`
  };

  const personalityPrompt = personalityProfiles[personalityKey] || personalityProfiles["dimitri"];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: personalityPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.85,
    });

    const aiReply = response.choices[0]?.message?.content?.trim();

    return NextResponse.json({ reply: aiReply });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ reply: "Sorry, something went wrong." });
  }
}
