import { NextResponse } from "next/server";

type ClientMessage = {
  role: "user" | "ai" | "system";
  content: string;
};

const SUPPORTIVE_PROMPT = `You are CalmCube, a gentle companion that helps people de-escalate anxiety in under a minute.
Keep every reply short (1-3 sentences), empathetic, and actionable.
Encourage slow breathing, grounding, or simple reflections. Avoid clinical diagnosis or promises.
If the user expresses severe distress or harm, recommend contacting trusted people or professional help.`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Server missing OpenAI credentials" },
      { status: 500 }
    );
  }

  let payload: { messages?: ClientMessage[] } = {};
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const clientMessages = payload.messages ?? [];

  if (!Array.isArray(clientMessages) || clientMessages.length === 0) {
    return NextResponse.json(
      { error: "Conversation history is required" },
      { status: 400 }
    );
  }

  const openAiMessages = [
    { role: "system", content: SUPPORTIVE_PROMPT },
    ...clientMessages.map((message) => ({
      role: message.role === "ai" ? "assistant" : message.role,
      content: message.content
    }))
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.6,
        max_tokens: 200,
        messages: openAiMessages
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenAI error", response.status, errorBody);
      return NextResponse.json(
        { error: "Failed to reach CalmCube companion" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply: string | undefined = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return NextResponse.json(
        { error: "CalmCube assistant returned an empty reply" },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat route error", error);
    return NextResponse.json(
      { error: "Unexpected server error contacting CalmCube" },
      { status: 500 }
    );
  }
}
