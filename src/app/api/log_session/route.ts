import { NextResponse } from "next/server";
import type { RelaxationMode } from "@/features/heart-rate/analyzeHeartRate";

interface Payload {
  heartRate: number;
  mode: RelaxationMode;
  stressScore?: number;
}

const inMemorySessions: Array<Payload & { id: string; timestamp: string }> = [];

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Payload;

    if (typeof body.heartRate !== "number" || !body.mode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const entry = {
      ...body,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };

    inMemorySessions.push(entry);

    return NextResponse.json({ ok: true, entry });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to log session" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ sessions: inMemorySessions });
}
