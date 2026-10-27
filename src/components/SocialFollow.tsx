import Reveal from "./Reveal";
import OutLink from "./OutLink";
import { SITE } from "@/lib/data";

/** "Follow the studio" block: the web to social half of the traffic loop. Handles come from SITE.social, the one owner list. */
export default function SocialFollow({ placement, heading = "Follow the studio", sub = "New production notes, price breakdowns and identity-lock tests, posted as we make them." }: { placement: string; heading?: string; sub?: string }) {
  return (
    <Reveal className="follow">
      <div className="follow__text">
        <h2 className="t-h4">{heading}</h2>
        <p>{sub}</p>
      </div>
      <ul className="follow__list">
        {SITE.social.map(([name, url]) => (
          <li key={name}><OutLink className="follow__link" href={url} network={name.toLowerCase()} placement={placement}>{name} <span aria-hidden="true">↗</span></OutLink></li>
        ))}
      </ul>
    </Reveal>
  );
}
