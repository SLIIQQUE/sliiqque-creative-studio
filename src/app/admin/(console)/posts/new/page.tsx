import Link from "next/link";
import { requireUser } from "@/lib/cms/dal";
import { listCategories } from "@/lib/cms/queries";
import { createPostAction } from "../actions";

export default async function NewPost() {
  await requireUser();
  const categories = await listCategories();
  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> New entry <i>·</i> Draft</p>
          <h1 className="adm-head__title">Start a <em className="adm-gradient-text">draft</em><span className="adm-head__ghost">.</span></h1>
          <p className="adm-sub">A working title is enough. The editor opens with the body, publishing checks and SEO in reach.</p>
        </div>
        <div className="adm-head__actions">
          <Link className="adm-btn adm-btn--ghost" href="/admin/posts">Back to posts</Link>
        </div>
      </div>

      <div className="adm-bento">
        <form action={createPostAction} className="adm-card adm-span-7 adm-reg">
          <div className="adm-card__head">
            <div>
              <p className="adm-kicker"><i>01</i> The seed</p>
              <h2>Name the story</h2>
            </div>
            <span className="adm-kicker">Draft 00</span>
          </div>
          <div className="adm-field">
            <label htmlFor="title">Working title</label>
            <input id="title" name="title" type="text" required maxLength={200} autoFocus placeholder="e.g. How an AI commercial is made" />
            <span className="hint">You can change it later. The post starts as a draft and saves itself as you write.</span>
          </div>
          <div className="adm-field" style={{ marginTop: 24 }}>
            <label htmlFor="categoryId">Category</label>
            <select id="categoryId" name="categoryId" defaultValue="">
              <option value="">Choose later</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <span className="hint">A category sets the service a post links to. You can override it in the editor.</span>
          </div>
          <div className="adm-divider" />
          <div className="adm-row" style={{ justifyContent: "space-between" }}>
            <span className="adm-chip"><b>Auto-save</b> every 2.5s</span>
            <button className="adm-btn adm-btn--gradient" type="submit">Create draft <span className="adm-btn__arrow">↗</span></button>
          </div>
        </form>

        <aside className="adm-span-5">
          <div className="adm-card adm-card--dark">
            <p className="adm-kicker"><i>02</i> The shape</p>
            <h2 style={{ marginTop: 10 }}>One clear promise.</h2>
            <p className="adm-card__note" style={{ marginTop: 10 }}>
              The journal rewards a single, useful idea. Name it in the title, answer it in the first paragraph, then let the body breathe.
            </p>
            <div className="adm-steps">
              <div className="adm-step">
                <span className="adm-step__num">01</span>
                <div><div className="adm-step__label">Title</div><p className="adm-step__note">The promise in one line.</p></div>
              </div>
              <div className="adm-step">
                <span className="adm-step__num">02</span>
                <div><div className="adm-step__label">Excerpt</div><p className="adm-step__note">The answer, before the scroll.</p></div>
              </div>
              <div className="adm-step">
                <span className="adm-step__num">03</span>
                <div><div className="adm-step__label">Body</div><p className="adm-step__note">Sections, images and a clear next step.</p></div>
              </div>
            </div>
          </div>
        </aside>

        <div className="adm-band adm-span-12">
          <div>
            <p className="adm-kicker"><span className="adm-dot" /> The only rule</p>
            <h2 style={{ marginTop: 7 }}>Write for one person who needs the answer.</h2>
            <p style={{ marginTop: 5 }}>The journal is not a feed. It is a shelf of useful, specific stories about making things.</p>
          </div>
          <Link className="adm-btn adm-btn--ghost adm-btn--sm" href="/blogs" target="_blank" rel="noreferrer">See the public shelf ↗</Link>
        </div>
      </div>
    </>
  );
}
