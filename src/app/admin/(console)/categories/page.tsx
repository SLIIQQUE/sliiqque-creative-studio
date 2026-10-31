import { SERVICE_PAGES } from "@/data/services";
import { requireUser } from "@/lib/cms/dal";
import { listCategories } from "@/lib/cms/queries";
import { deleteCategory } from "./actions";
import CategoryForm from "./CategoryForm";

export default async function CategoriesPage() {
  const user = await requireUser();
  const categories = await listCategories();
  const services = SERVICE_PAGES.map((s) => ({ slug: s.slug, name: s.name }));
  return (
    <>
      <div className="adm-head">
        <div>
          <p className="adm-kicker"><span className="adm-dot" /> Taxonomy <i>·</i> {categories.length} {categories.length === 1 ? "shelf" : "shelves"}</p>
          <h1 className="adm-head__title">The <em className="adm-gradient-text">shelves</em><span className="adm-head__ghost">.</span></h1>
          <p className="adm-sub">A category sets the default service a post links to. Services themselves live in code; the shelves are yours to arrange.</p>
        </div>
      </div>

      <div className="adm-bento">
        <div className="adm-card adm-span-4 adm-reg">
          <div className="adm-card__head">
            <div>
              <p className="adm-kicker"><i>01</i> Add</p>
              <h2>New shelf</h2>
            </div>
          </div>
          <CategoryForm services={services} />
          <p className="adm-card__note">Name the shelf, then choose the service it should route readers toward.</p>
        </div>

        <div className="adm-card adm-span-8">
          <div className="adm-card__head">
            <div>
              <p className="adm-kicker"><i>02</i> Index</p>
              <h2>The taxonomy</h2>
            </div>
            <span className="adm-kicker">{String(categories.length).padStart(2, "0")} total</span>
          </div>
          {categories.length ? (
            <div>
              {categories.map((c, i) => (
                <div className="adm-catrow" key={c.id}>
                  <span className="adm-index__num">{String(i + 1).padStart(2, "0")}</span>
                  <CategoryForm services={services} category={{ id: c.id, name: c.name, serviceSlug: c.serviceSlug }} compact />
                  {user.role === "owner" ? (
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <button className="adm-btn adm-btn--danger adm-btn--sm" type="submit">Delete</button>
                    </form>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="adm-empty">
              <b>No shelves yet.</b>
              <span>Add the first category to start mapping posts to services.</span>
            </div>
          )}
          <p className="adm-card__note">A category that still holds posts cannot be deleted.</p>
        </div>
      </div>
    </>
  );
}
