import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.EVENTBRITE_TOKEN;
  const organizerId = process.env.EVENTBRITE_ORGANIZER_ID;

  if (!token || !organizerId) {
    console.error('❌ Missing credentials');
    return NextResponse.json({ error: 'Missing credentials' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://www.eventbriteapi.com/v3/organizations/${organizerId}/events/?token=`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const text = await res.text(); // capture raw response
    if (!res.ok) {
      console.error('❌ Eventbrite API error:', text);
      return NextResponse.json({ error: 'Failed to fetch from Eventbrite' }, { status: 500 });
    }

    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (err) {
    console.error('❌ Server error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}