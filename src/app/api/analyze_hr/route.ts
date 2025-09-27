import { NextResponse } from "next/server";
import { analyzeHeartRate, clampHeartRate } from "@/features/heart-rate/analyzeHeartRate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const heartRate = Number(body?.heartRate);

    if (!Number.isFinite(heartRate)) {
      return NextResponse.json(
        { error: "Invalid heart rate" },
        { status: 400 }
      );
    }

    const safeHeartRate = clampHeartRate(heartRate);
    const mode = analyzeHeartRate(safeHeartRate);

    return NextResponse.json({
      heartRate: safeHeartRate,
      mode
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to analyze heart rate" },
      { status: 400 }
    );
  }
}
