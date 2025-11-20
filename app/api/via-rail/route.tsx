// app/api/trains/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://vercel.com/mfcampbells-projects/train-lady/api/via-rail", {
      headers: {
        "Content-Type": "application/json",
      },
      // Optional: add cache busting or custom headers here
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch train data" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Server error", details: error }, { status: 500 });
  }
}