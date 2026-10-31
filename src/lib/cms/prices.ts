import { PLANS, PROJECT_ROWS } from "@/lib/data";
import type { PriceToken } from "./types";

const plan = (name: string) => PLANS.find((p) => p[0].toLowerCase().startsWith(name));
const project = (title: string) => PROJECT_ROWS.find((r) => r[0] === title);

/** Resolves a price token from the site's data (which follows COMPANY.md). Post text never holds the number itself. */
export function resolvePrice(token: PriceToken): string {
  switch (token) {
    case "starter-retainer": {
      const p = plan("starter");
      return p ? `${p[2]} (US${p[5]}) a month` : "";
    }
    case "growth-retainer": {
      const p = plan("growth");
      return p ? `${p[2]} (US${p[5]}) a month` : "";
    }
    case "scale-retainer": {
      const p = plan("scale");
      return p ? `${p[2]} (US${p[5]}) a month` : "";
    }
    case "ai-commercial-from": {
      const r = project("AI Commercial");
      return r ? `${r[3]} (US${r[4].replace("from ", "")})` : "";
    }
    case "photo-pack": {
      const r = project("Product Photo Pack");
      return r ? `${r[3]} (US${r[4]})` : "";
    }
    case "digital-human": {
      const r = project("Custom Digital Human");
      return r ? `${r[3]} (US${r[4]})` : "";
    }
    case "brand-launch": {
      const r = project("Brand Launch Campaign");
      return r ? `${r[3]} (US${r[4]})` : "";
    }
  }
}

export const PRICE_TOKEN_LABELS: Record<PriceToken, string> = {
  "ai-commercial-from": "AI commercial, starting price",
  "starter-retainer": "Starter retainer",
  "growth-retainer": "Growth retainer",
  "scale-retainer": "Scale retainer",
  "brand-launch": "Brand launch campaign",
  "photo-pack": "Product photo pack",
  "digital-human": "Custom digital human",
};
