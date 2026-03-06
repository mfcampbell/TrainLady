"use client";

import dynamic from "next/dynamic";
import { Train } from "./TrainMap";

const TrainMap = dynamic(() => import("./TrainMap"), {
  ssr: false,
});

export default function TrainMapWrapper({
  initialTrains,
}: {
  initialTrains: Train[];
}) {
  return <TrainMap initialTrains={initialTrains} />;
}