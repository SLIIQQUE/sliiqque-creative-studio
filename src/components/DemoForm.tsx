"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";

/** Demo submit handler (matches the template): flashes "Thank you!" then resets. Wire to a backend. */
export default function DemoForm({ className, label, children }: { className: string; label: string; children: ReactNode }) {
  const ref = useRef<HTMLFormElement>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      ref.current?.reset();
    }, 2200);
  };

  return (
    <form ref={ref} className={className} onSubmit={onSubmit}>
      {children}
      <button className="btn" type="submit">{sent ? "Thank you!" : label}</button>
    </form>
  );
}
