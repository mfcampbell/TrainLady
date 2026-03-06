import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // ensures serverless fetch works

export async function GET(req: NextRequest) {
  try {
    const res = await fetch("https://rail-api.vercel.app/api/via-rail", {
      cache: "no-store", // always fresh
    });

    if (!res.ok) {
      console.error("Via Rail API error:", res.statusText);
      return NextResponse.json(
        { error: "Failed to fetch train data" },
        { status: 500 }
      );
    }

    const data = await res.json();

    return NextResponse.json({ trains: data.trains ?? [] });
  } catch (err: any) {
    console.error("Via Rail fetch failed:", err.message);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}