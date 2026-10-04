import { Btn } from "@/components/ui";
import { NOT_FOUND } from "@/lib/data";

export default function NotFoundView() {
  return (
    <section className="nf">
      <div className="nf__row">
        <div><h1>404</h1><h2 className="t-title">page not<br />found</h2></div>
        <div className="nf__aside"><p>{NOT_FOUND.p}</p><Btn href="/">Back To Home</Btn></div>
      </div>
    </section>
  );
}
