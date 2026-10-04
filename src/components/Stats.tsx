import CountUp from "./CountUp";
import Reveal from "./Reveal";
import type { Stat } from "@/lib/data";

export default function Stats({ stats, className, reveal = false }: { stats: Stat[]; className: string; reveal?: boolean }) {
  const Wrap = reveal ? Reveal : "div";
  return (
    <Wrap className={className}>
      {stats.map(([n, sign, caption]) => (
        <div className="stat" key={caption}>
          <div className="stat__num">
            <CountUp target={n} />
            <span className="sign">{sign}</span>
          </div>
          <p>{caption}</p>
        </div>
      ))}
    </Wrap>
  );
}
