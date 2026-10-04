"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const KEY = "sliiqque-age-confirmed";

/** Age gate for alcohol-related brand content (ÀSE spirits concept). Asked once per browser session. */
export default function AgeGate() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(KEY) === "1") setOpen(false);
    } catch {
      /* storage unavailable: keep the gate up */
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const confirm = () => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  return (
    <div className="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      <div className="age-gate__box">
        <h2 id="age-gate-title" className="t-h3">Are you 18 or older?</h2>
        <p>This page shows alcohol-related brand content: ÀSE, a fictional spirits brand we built as concept work. Please confirm your age to continue.</p>
        <div className="age-gate__actions">
          <button className="btn" type="button" onClick={confirm}>I am 18 or older</button>
          <Link className="btn btn--accent" href="/works">Leave</Link>
        </div>
      </div>
    </div>
  );
}
