"use client";

import { useActionState } from "react";
import { saveCategory, type FormState } from "./actions";

export default function CategoryForm({ services, category, compact = false }: { services: { slug: string; name: string }[]; category?: { id: string; name: string; serviceSlug: string | null }; compact?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCategory, undefined);
  const uid = category?.id ?? "new";
  return (
    <form action={action} className="adm-inline-form">
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div className="adm-field">
        <label className={compact ? "sr-only" : undefined} htmlFor={`n-${uid}`}>Name</label>
        <input id={`n-${uid}`} name="name" type="text" defaultValue={category?.name ?? ""} placeholder="Category name" required />
      </div>
      <div className="adm-field">
        <label className={compact ? "sr-only" : undefined} htmlFor={`s-${uid}`}>Service</label>
        <select id={`s-${uid}`} name="serviceSlug" defaultValue={category?.serviceSlug ?? ""}>
          <option value="">No service</option>
          {services.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
      </div>
      <button className="adm-btn adm-btn--sm" type="submit" disabled={pending}>{pending ? "Saving" : category ? "Save" : "Add category"}</button>
      {state?.error ? <span className="adm-flash adm-flash--err" style={{ margin: 0 }} role="alert">{state.error}</span> : state?.ok ? <span className="muted small">{state.ok}</span> : null}
    </form>
  );
}
