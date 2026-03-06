import TrainMapWrapper from "./TrainMapWrapper";

export default async function Page() {
  const res = await fetch(
    `https://rail-api.vercel.app/api/via-rail`,
    { next: { revalidate: 60 } }
  );

  const data = await res.json();
  const trains = data.trains ?? [];

  return <TrainMapWrapper initialTrains={trains} />;
}