"use client";

import { useEffect, useState } from "react";

export default function LagosTime() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const tick = () => {
      try {
        setTime(new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()));
      } catch {
        setTime("");
      }
    };
    tick();
    const id = window.setInterval(tick, 20000);
    return () => window.clearInterval(id);
  }, []);

  return <span className="lagos-time">Lagos {time}</span>;
}
