// pages/api/events.ts
import type { NextApiRequest, NextApiResponse } from 'next';

type EventbriteEvent = {
  id: string;
  name: { text: string };
  description: { text: string };
  url: string;
  start: { local: string };
  logo: { url: string } | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EventbriteEvent[] | { error: string }>
) {
  const location = 'Vancouver';

  const response = await fetch(
    `https://www.eventbriteapi.com/v3/events/search/?location.address=${location}&expand=venue,organizer`,
    {
      headers: {
        Authorization: `Bearer ${process.env.EVENTBRITE_TOKEN as string}`,
      },
    }
  );

  if (!response.ok) {
    return res.status(response.status).json({ error: 'Failed to fetch events' });
  }

  const data = await response.json();
  res.status(200).json(data.events as EventbriteEvent[]);
  console.log('TOKEN:', process.env.EVENTBRITE_TOKEN);
}