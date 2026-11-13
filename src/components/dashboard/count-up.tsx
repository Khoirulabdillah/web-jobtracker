"use client";

import CountUp from "react-countup";

export function CountUpNumber({ value }: { value: number }) {
  return <CountUp end={value} duration={1.1} preserveValue />;
}
