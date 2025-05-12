import type { GetServerSideProps } from 'next';

type EventbriteEvent = {
  id: string;
  name: { text: string };
  description: { text: string };
  url: string;
  start: { local: string };
  logo: { url: string } | null;
};

type Props = {
  events: EventbriteEvent[];
};

export default function Home({ events }: Props) {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <h1 className="text-4xl font-bold text-center mb-10">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white p-4 rounded-xl shadow-lg">
            {event.logo && (
              <img
                src={event.logo.url}
                alt={event.name.text}
                className="w-full h-48 object-cover rounded-md mb-4"
              />
            )}
            <h2 className="text-xl font-semibold mb-2">{event.name.text}</h2>
            <p className="text-sm text-gray-600 mb-4">
              {new Date(event.start.local).toLocaleString()}
            </p>
            <p className="text-gray-700 line-clamp-4 mb-4">{event.description.text}</p>
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Register
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const res = await fetch(
    `https://www.eventbriteapi.com/v3/events/search/?location.address=Vancouver&expand=venue,organizer`,
    {
      headers: {
        Authorization: `Bearer ${process.env.EVENTBRITE_TOKEN as string}`,
      },
    }
  );

  if (!res.ok) {
    return {
      props: {
        events: [],
      },
    };
  }

  const data = await res.json();
  return {
    props: {
      events: data.events ?? [],
    },
  };
};

console.log('TOKEN:', process.env.EVENTBRITE_TOKEN);