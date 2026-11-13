"use client";

import CountUp from "react-countup";
import { useReducedMotion } from "framer-motion";

export function CountUpNumber({ value }: { value: number }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return <>{value}</>;

  return (
    <CountUp end={value} duration={1.1} preserveValue redraw={false} />
  );
}
