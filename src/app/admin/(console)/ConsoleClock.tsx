"use client";

import { useEffect, useState } from "react";

const format = new Intl.DateTimeFormat("en-NG", {
  timeZone: "Africa/Lagos",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export default function ConsoleClock() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setNow(format.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="adm-clock" aria-label="Lagos time">
      <span>Lagos</span>
      <b suppressHydrationWarning>{now ?? "--:--:--"}</b>
    </div>
  );
}
