// app/api/eventbrite/route.ts
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic"; // ensures runtime fetching (required for APIs)

export async function GET(req: NextRequest) {
  const EVENTBRITE_TOKEN = process.env.EVENTBRITE_TOKEN;

  if (!EVENTBRITE_TOKEN) {
    return new Response(
      JSON.stringify({ error: "EVENTBRITE_TOKEN not set in environment" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const res = await fetch(
      "https://www.eventbriteapi.com/v3/organizations/2753828311591/events/",
      {
        headers: {
          Authorization: `Bearer ${EVENTBRITE_TOKEN}`,
        },
      }
    );

    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({ error: `Eventbrite API error: ${res.status} ${text}` }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify({ events: data.events ?? [] }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}