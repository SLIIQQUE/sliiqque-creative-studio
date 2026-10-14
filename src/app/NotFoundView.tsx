import Link from "next/link";
import { Btn } from "@/components/ui";
import { NOT_FOUND } from "@/lib/data";

export default function NotFoundView() {
  return (
    <section className="nf">
      <div className="nf__row">
        <div><h1>404</h1><h2 className="t-title">page not<br />found</h2></div>
        <div className="nf__aside">
          <p>{NOT_FOUND.p}</p>
          <Btn href="/">Back To Home</Btn>
          <p className="services-note">
            Or try <Link className="link-u" href="/services">Services</Link>, <Link className="link-u" href="/works">Work</Link>, <Link className="link-u" href="/faq">FAQ</Link> or <Link className="link-u" href="/contact">Contact</Link>.
          </p>
        </div>
      </div>
    </section>
  );
}
