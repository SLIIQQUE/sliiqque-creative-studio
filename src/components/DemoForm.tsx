"use client";

import { track } from "@vercel/analytics";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { readAttribution } from "@/lib/attribution";

type Status = "idle" | "sending" | "sent" | "error";

/** Posts to /api/contact (Resend-backed) and shows a distinct, accessible confirmation or
 *  error state, rather than just a transient button-label change. Includes a hidden honeypot
 *  field: real visitors never fill it, so a filled submission is treated as spam. */
export default function DemoForm({
  className, label, children, kind, successMessage, mailtoFallback,
}: {
  className: string;
  label: string;
  children: ReactNode;
  kind: "contact" | "newsletter";
  successMessage: string;
  mailtoFallback: string;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError(null);
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, ...data, attribution: readAttribution() }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Something went wrong. Please try again.");
      setStatus("sent");
      track(kind === "contact" ? "contact_form_submit" : "newsletter_signup");
      ref.current?.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <form ref={ref} className={className} onSubmit={onSubmit}>
      {children}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor={`hp-${kind}`}>Leave this field blank</label>
        <input id={`hp-${kind}`} name="hp" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : label}
      </button>
      {status === "sent" && (
        <p className="form-status form-status--ok" role="status">{successMessage}</p>
      )}
      {status === "error" && (
        <p className="form-status form-status--error" role="alert">
          {error} Email us directly: <a href={`mailto:${mailtoFallback}`}>{mailtoFallback}</a>
        </p>
      )}
    </form>
  );
}
