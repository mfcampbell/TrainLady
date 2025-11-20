import { NextResponse } from "next/server";

type Train = {
  id: string;
  latitude: number | null;
  longitude: number | null;
  speedKph: number | null;
  timestamp: number | null;
  nextStop?: string | null;
  eta?: string | null;
  extra: Record<string, any>;
};

const TSI_URL = "https://tsimobile.viarail.ca/data/allData.json";

function parseTrain(raw: any): Train | null {
  try {
    const timestamp =
      typeof raw.poll === "number"
        ? raw.poll
        : typeof raw.time === "number"
        ? raw.time
        : typeof raw.timestamp === "number"
        ? raw.timestamp
        : null;

    let lat = null,
      lng = null,
      speedKph = null;

    if (typeof raw.lat === "number" && typeof raw.lng === "number") {
      lat = raw.lat;
      lng = raw.lng;
    } else if (raw.position && typeof raw.position.latitude === "number") {
      lat = raw.position.latitude;
      lng = raw.position.longitude;
      speedKph = typeof raw.position.speed === "number" ? raw.position.speed : null;
    }

    if (speedKph === null) {
      speedKph = typeof raw.speed === "number" ? raw.speed : null;
    }

    let nextStop = null,
      eta = null;
    if (Array.isArray(raw.times)) {
      const next = raw.times.find((t: any) => t.estimated || t.eta || t.scheduled);
      if (next) {
        nextStop = next.station ?? next.stop ?? null;
        eta = next.estimated ?? next.eta ?? next.scheduled ?? null;
      }
    } else if (raw.nextStop) {
      nextStop = raw.nextStop;
    }

    const id = raw.trainNumber ?? raw.id ?? raw.name ?? String(raw);

    return {
      id: String(id),
      latitude: lat,
      longitude: lng,
      speedKph,
      timestamp,
      nextStop,
      eta,
      extra: raw,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const response = await fetch(TSI_URL, { cache: "no-store" });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return NextResponse.json(
        { error: "Failed to fetch TSI", status: response.status, bodyPreview: text.slice(0, 512) },
        { status: 502 }
      );
    }

    const raw = await response.json();
    let trains: Train[] = [];

    if (Array.isArray(raw)) {
      trains = raw.map(parseTrain).filter((t): t is Train => t !== null);
    } else if (typeof raw === "object" && raw !== null) {
      for (const [key, val] of Object.entries(raw)) {
        if (val && typeof val === "object") {
          const parsed = parseTrain({ ...val, id: key });
          if (parsed) trains.push(parsed);
        }
      }
    }

    trains.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

    const res = NextResponse.json({
      fetchedAt: new Date().toISOString(),
      count: trains.length,
      trains,
    });

    res.headers.set("Cache-Control", "s-maxage=10, stale-while-revalidate=30");

    return res;
  } catch (err) {
    console.error("VIA TSI proxy error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}