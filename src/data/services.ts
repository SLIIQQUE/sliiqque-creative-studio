export type Faq = { q: string; a: string };

export type ServicePage = {
  slug: string;
  name: string;
  /** <title> without the site suffix */
  title: string;
  description: string;
  h1: string;
  /** Direct answer shown first (written to be quoted by search and AI answers). */
  answer: string;
  forWho: string[];
  included: string[];
  how: [string, string][];
  priceLabel: string;
  priceNgn: string;
  priceUsd: string;
  timeline: string;
  faqs: Faq[];
  keywords: string[];
  related: string[];
  /** Example frames shown under the short answer (public/img ids, portrait 2:3). */
  gallery?: { id: string; alt: string }[];
};

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: "ai-commercials",
    name: "AI Commercials",
    title: "AI Commercial Production in Lagos, Nigeria",
    description:
      "AI commercial production in Lagos, Nigeria: storyboard, AI production, grade, sound and cutdowns for Meta, TikTok and YouTube. From ₦350,000 / $650 in 7 days.",
    h1: "AI commercial production in Lagos, Nigeria",
    answer:
      "An AI commercial is a short, cinematic advertisement produced with AI image and video tools under human art direction, without a conventional film shoot. SLIIQQUE storyboards, builds, grades and cuts 30 to 60 second AI commercials for brands in Nigeria, Africa and worldwide, starting from ₦350,000 (US$650) with a 7 day turnaround.",
    forWho: [
      "Brands launching a product that need a premium ad without a full production crew",
      "Startups and SMEs that want cinematic video for Meta, TikTok, YouTube and Instagram Reels",
      "Marketing teams that need several platform cutdowns from one hero spot",
    ],
    included: [
      "Concept and a nine-panel storyboard before any motion is made",
      "AI production with product and character consistency locked across shots",
      "One colour grade applied across the whole piece, with skin and brand colours protected",
      "Sound and music, captions where needed",
      "Platform cutdowns: vertical 9:16, square 1:1 and landscape 16:9",
      "A high-resolution master file, two revision rounds and commercial usage rights",
    ],
    how: [
      ["Brief and storyboard", "You share the product, audience, platforms and references. SLIIQQUE turns one reference into a nine-panel storyboard with varied camera angles so the sequence is judged before animation."],
      ["Identity and product lock", "Faces, products and outfits are described once in a permanent profile and reused word for word, so they stay identical across every shot."],
      ["Build, grade, animate", "Stills are upscaled without invented detail, graded once, then animated in short blocks and cut together with sound."],
      ["Cutdowns and delivery", "You receive the hero spot and the platform cutdowns, with two revision rounds included."],
    ],
    priceLabel: "AI Commercial",
    priceNgn: "from ₦350,000",
    priceUsd: "from $650",
    timeline: "7 days",
    faqs: [
      { q: "How much does an AI commercial cost in Nigeria?", a: "SLIIQQUE AI commercials start from ₦350,000 (US$650) for a 30 to 60 second spot with platform cutdowns, a high-resolution master, two revision rounds and commercial usage rights. Larger scopes are quoted after a brief." },
      { q: "How long does an AI commercial take?", a: "The standard timeline is 7 days from receipt of the deposit and all required materials. Rush delivery is available at +50% where the schedule allows." },
      { q: "Can I run an AI commercial as a paid ad on Meta, TikTok or YouTube?", a: "Yes. One-off projects include commercial usage, including paid media, assigned to you on full payment. You are responsible for any AI or synthetic-media labels the platform or law requires, and SLIIQQUE supplies suggested disclosure wording on request." },
      { q: "What do you need from me to start?", a: "A short brief covering the product, audience, platforms, references and deadline, plus your existing brand assets and product images. SLIIQQUE does not design logos and uses the assets you supply." },
    ],
    keywords: ["AI commercial production Nigeria", "AI video ads Lagos", "AI-generated commercials", "short-form video ads Nigeria", "cinematic AI ads"],
    related: ["ai-ugc-digital-humans", "brand-launches-campaigns"],
  },
  {
    slug: "ai-ugc-digital-humans",
    name: "AI UGC & Digital Humans",
    title: "AI UGC Ads and Digital Humans for Brands",
    description:
      "AI UGC ads and identity-locked digital humans for brands in Nigeria and worldwide. Retainers from ₦150,000 / $280 a month. Custom digital human ₦150,000.",
    h1: "AI UGC ads and digital humans for brands",
    answer:
      "AI UGC is UGC-style short-form video presented by a photorealistic AI-generated person instead of a hired creator. SLIIQQUE builds identity-locked digital humans, so the same person appears consistently across every ad, and produces vertical UGC-style videos for TikTok, Instagram Reels and Meta. Retainers start at ₦150,000 (US$280) a month and a custom digital human is ₦150,000 (US$280).",
    forWho: [
      "DTC, beauty, fashion, wellness, food and e-commerce brands that need a steady flow of short-form ads",
      "Brands that want one consistent on-screen spokesperson across every ad",
      "Teams that want to test many hooks and variants without booking creators for each one",
    ],
    included: [
      "A custom digital human with a permanent identity profile (face, skin, hair, age, proportions), exclusive to you",
      "Vertical UGC-style videos, 15 to 30 seconds, with captions",
      "Talking-video animation with natural movement and the identity held locked",
      "Variants for hook and format testing on retainer plans",
      "Two revision rounds per batch",
    ],
    how: [
      ["Brief and identity profile", "SLIIQQUE writes a permanent profile for the digital human, from your brief or from reference images you are entitled to use."],
      ["Lock and generate", "The profile is reused word for word in every generation so the person never drifts between ads."],
      ["Animate and edit", "Stills become short talking-video clips, then are cut with voice, music and captions into platform formats."],
      ["Deliver in batches", "Retainer content is delivered in batches agreed in a monthly content plan."],
    ],
    priceLabel: "Retainers from",
    priceNgn: "₦150,000 / month",
    priceUsd: "$280 / month",
    timeline: "First batch within 7 days of the cycle starting",
    faqs: [
      { q: "What is AI UGC?", a: "AI UGC is UGC-style short-form video, the casual creator look used in TikTok and Reels ads, presented by an AI-generated person. It gives brands creator-style content without booking and managing individual creators." },
      { q: "Will the same digital human appear in every ad?", a: "Yes. Each custom digital human has a permanent identity profile that is reused in every generation, and it is exclusive to you. SLIIQQUE does not reuse a custom digital human for another client." },
      { q: "Do you create fake customer reviews or testimonials?", a: "No. Digital humans are synthetic people and are not presented as real customers. SLIIQQUE does not produce fabricated reviews or testimonials presented as genuine, and does not create a likeness of a real person without their written consent." },
      { q: "How much does a digital human cost?", a: "A custom, identity-locked digital human is ₦150,000 (US$280) as a one-off project, and is included in the Growth retainer at ₦350,000 (US$650) a month." },
    ],
    keywords: ["AI UGC ads Nigeria", "AI UGC creator", "digital humans for advertising", "AI avatar spokesperson", "AI influencer content"],
    related: ["ai-commercials", "ai-photography"],
    gallery: [
      { id: "digital-human-face-macro.jpg", alt: "Digital human: identity-locked photorealistic AI man, extreme close-up of the face" },
      { id: "digital-human-portrait.jpg", alt: "The same digital human in a head-and-shoulders portrait, identity held" },
      { id: "digital-human-full-look.jpg", alt: "The same digital human in a full look, wearing an embroidered kaftan" },
    ],
  },
  {
    slug: "ai-photography",
    name: "AI Photography",
    title: "AI Product Photography in Lagos",
    description:
      "AI product and lifestyle photography from SLIIQQUE in Lagos. Product Photo Pack, 5 SKUs, from ₦75,000 / $140, delivered in 5 working days.",
    h1: "AI product and lifestyle photography",
    answer:
      "AI photography creates commercial product and lifestyle images without a conventional studio shoot. SLIIQQUE builds high-resolution stills with your product held consistent in every frame. The Product Photo Pack covers 5 SKUs with 3 styled images each for ₦75,000 (US$140), delivered in 5 working days.",
    forWho: [
      "E-commerce and DTC brands that need styled product images for many SKUs",
      "Brands that need lifestyle scenes without booking a studio, models and props",
      "Businesses refreshing product pages, marketplaces, ads and social feeds",
    ],
    included: [
      "A product identity profile covering shape, material, colour, label and the details that must not drift",
      "Product and lifestyle stills, 3 styled images per SKU in the Product Photo Pack",
      "High-resolution files with one consistent grade across the set",
      "Two revision rounds and commercial usage rights",
    ],
    how: [
      ["Know the product", "You send product photos and references. SLIIQQUE writes a permanent profile of the product."],
      ["Lock and style", "The profile keeps the product identical across scenes while the setting, light and props change."],
      ["Upscale and grade", "Stills are upscaled without invented detail and graded once as a set."],
      ["Deliver", "Files are delivered through a private link in the sizes you need."],
    ],
    priceLabel: "Product Photo Pack (5 SKUs)",
    priceNgn: "₦75,000",
    priceUsd: "$140",
    timeline: "5 working days",
    faqs: [
      { q: "How much does AI product photography cost in Nigeria?", a: "SLIIQQUE's Product Photo Pack is ₦75,000 (US$140) for 5 SKUs with 3 styled high-resolution images each. Retainers from ₦150,000 (US$280) a month include stills alongside video." },
      { q: "Can AI photography replace a studio photoshoot?", a: "For many product and lifestyle uses, yes. It suits catalogues, product pages, ads and social content. It does not replace a shoot where the exact physical garment, fit or texture must be documented, and SLIIQQUE will tell you when a traditional shoot is the better choice." },
      { q: "What do you need to start?", a: "Clear photos of the product from several angles, your brand assets and any style references. SLIIQQUE uses your supplied logos and packaging as they are." },
      { q: "Do you do alcohol or age-restricted product photography?", a: "Alcohol-related work is accepted only for audiences of legal drinking age, with age-gating and the compliance messaging that applies. Pages on this site that show alcohol-related concept work are age-gated." },
    ],
    keywords: ["AI product photography Lagos", "AI product photos for e-commerce", "AI lifestyle photography", "AI photoshoot for brands", "product photography Nigeria"],
    related: ["ai-commercials", "brand-launches-campaigns"],
    gallery: [
      { id: "ode-beard-oil.jpg", alt: "AI product photography: ODÈ beard oil bottle in hand, concept work" },
      { id: "digital-human-full-look.jpg", alt: "AI lifestyle photography: photorealistic portrait of a man in an embroidered kaftan" },
      { id: "digital-human-fabric-detail.jpg", alt: "AI detail photography: macro of embroidered fabric texture" },
    ],
  },
  {
    slug: "ai-fashion-imagery",
    name: "AI Fashion Imagery",
    title: "AI Fashion Imagery and AI Models for Brands",
    description:
      "AI fashion imagery from SLIIQQUE in Lagos: photorealistic AI models wearing your clothes for lookbooks, campaigns and e-commerce. Included in retainers from ₦150,000 / $280 a month.",
    h1: "AI fashion imagery: photorealistic models wearing your clothes",
    answer:
      "AI fashion imagery is photorealistic imagery of AI-generated models wearing a brand's clothes, produced from photos of the real garments without a studio, a model booking or a wardrobe shoot. SLIIQQUE builds identity-locked AI models and puts your garments on them for lookbooks, campaign visuals and e-commerce product pages, keeping each garment's colour, cut and details consistent in every frame.",
    forWho: [
      "Fashion and apparel brands, boutiques and online stores that need lookbook and product imagery",
      "Designers presenting a collection before or alongside a physical shoot",
      "Beauty and accessories brands that need model-led campaign visuals",
    ],
    included: [
      "A garment identity profile covering colour, cut, fabric, trim and any print or detail that must not drift",
      "Identity-locked AI models, exclusive to you, so one person wears the whole collection",
      "Lookbook, campaign and e-commerce stills in multiple poses and settings",
      "One consistent grade across the set, with high-resolution files",
      "Two revision rounds and commercial usage rights",
    ],
    how: [
      ["Send the garments", "You share clear photos of each piece from several angles, plus references for the look you want."],
      ["Lock the garment and the model", "Each garment and each model is described once in a permanent profile and reused word for word, so nothing drifts between images."],
      ["Style and generate", "Scenes, poses and lighting are directed for lookbook, campaign or e-commerce use."],
      ["Upscale, grade and deliver", "Stills are upscaled without invented detail, graded once as a set and delivered through a private link."],
    ],
    priceLabel: "Included in retainers from",
    priceNgn: "₦150,000 / month",
    priceUsd: "$280 / month",
    timeline: "Agreed per collection in the quote",
    faqs: [
      { q: "Can AI models wear my real clothes?", a: "Yes. SLIIQQUE works from photos of your real garments and holds their colour, cut and details consistent across images. The garment is never redesigned." },
      { q: "How much does AI fashion imagery cost in Nigeria?", a: "AI fashion stills are included in the stills allocation of SLIIQQUE retainers from ₦150,000 (US$280) a month, and a custom, exclusive AI model is ₦150,000 (US$280). One-off collections are quoted from a brief." },
      { q: "Are the models real people?", a: "No. The models are synthetic digital humans. SLIIQQUE does not create a likeness of a real person without their written consent and does not use AI models as fake customer reviews." },
      { q: "Can AI imagery replace a fashion photoshoot?", a: "For lookbooks, product pages, ads and social content it often can. Where exact fit or fabric behaviour must be documented, real garment photography is still the right tool, and SLIIQQUE will say so." },
    ],
    keywords: ["AI fashion imagery", "AI fashion photography Nigeria", "AI models for clothing brands", "AI lookbook", "virtual fashion models"],
    related: ["ai-photography", "ai-ugc-digital-humans"],
    gallery: [
      { id: "fashion-suit-full-length.jpg", alt: "AI fashion imagery: photorealistic AI model in a tailored textured suit, full length" },
      { id: "fashion-suit-three-quarter.jpg", alt: "The same AI model and suit in a three-quarter shot, garment held consistent" },
      { id: "fashion-suit-golden-hour.jpg", alt: "The same AI model and suit at golden hour, one grade across the set" },
    ],
  },
  {
    slug: "brand-launches-campaigns",
    name: "Brand Launches & Campaigns",
    title: "Brand Launch and Campaign Production",
    description:
      "A brand launch campaign from SLIIQQUE: concept, art direction, an AI commercial, UGC-style videos and launch stills. ₦900,000 / $1,700 in 21 days.",
    h1: "Brand launch and visual campaign production",
    answer:
      "A brand launch campaign is the set of creative assets built around a new product or brand: concept, art direction, a hero commercial, short-form content and stills that all follow the same rules. SLIIQQUE delivers a 21 day Brand Launch Campaign for ₦900,000 (US$1,700), covering concept and art direction, one 30 second AI commercial with cutdowns, six UGC-style videos and 20 launch stills.",
    forWho: [
      "Founders and brands launching a product, range or campaign",
      "Marketing teams that need a consistent look across ads, social and e-commerce",
      "Brands that want product cinematography without a traditional production",
    ],
    included: [
      "Concept and art direction: palette, typography, imagery and campaign system",
      "One 30 second AI commercial with platform cutdowns",
      "Six UGC-style short-form videos",
      "Twenty launch stills",
      "Two revision rounds and commercial usage rights",
    ],
    how: [
      ["Question first", "Every launch starts with one question: how should this brand look, feel and communicate?"],
      ["Concept and art direction", "SLIIQQUE agrees the direction in writing before production, so every asset follows the same rules."],
      ["Production", "The commercial, short-form videos and stills are produced as one system with locked identities and one grade."],
      ["Handover", "Final deliverables are assigned to you on full payment, with a 30 day window to fix anything that does not match the agreed scope."],
    ],
    priceLabel: "Brand Launch Campaign",
    priceNgn: "₦900,000",
    priceUsd: "$1,700",
    timeline: "21 days",
    faqs: [
      { q: "Do you design logos?", a: "No. SLIIQQUE does not offer logo design. Identity work means art direction, palette, typography, imagery and campaign systems, applied to the logo and brand assets you supply." },
      { q: "How much does a brand launch campaign cost?", a: "SLIIQQUE's Brand Launch Campaign is ₦900,000 (US$1,700) and takes 21 days. Ongoing launch content can also run on a monthly retainer from ₦150,000 (US$280)." },
      { q: "Who owns the campaign assets?", a: "On full payment the final deliverables of a one-off project are assigned to you, including commercial and paid-media use. SLIIQQUE keeps its tools, workflows and methods." },
    ],
    keywords: ["AI brand launch campaign", "visual campaign production Africa", "product cinematography Lagos", "product launch video production", "creative campaign agency Nigeria"],
    related: ["ai-commercials", "ai-photography", "ai-fashion-imagery"],
  },
];

export const serviceBySlug = (slug: string) => SERVICE_PAGES.find((s) => s.slug === slug);

/** Which concept projects show each service (from each work's service line). A service with no honest match lists none. */
export const SERVICE_WORKS: Record<string, string[]> = {
  "ai-commercials": ["ode"],
  "ai-ugc-digital-humans": ["ode"],
  "ai-photography": ["ala-skin", "ase"],
  "ai-fashion-imagery": [],
  "brand-launches-campaigns": ["ala-skin", "ode", "ase", "ile"],
};

export const servicesForWork = (work: string) => SERVICE_PAGES.filter((s) => SERVICE_WORKS[s.slug]?.includes(work));

/** Journal category -> the service page a reader of that post is most likely to need. */
const CATEGORY_SERVICE: Record<string, string> = {
  "Digital Humans": "ai-ugc-digital-humans",
  Process: "ai-commercials",
  "Post-production": "ai-photography",
  Commercials: "ai-commercials",
  Fashion: "ai-fashion-imagery",
  Studio: "brand-launches-campaigns",
};

export const serviceForCategory = (cat: string) => serviceBySlug(CATEGORY_SERVICE[cat] ?? "");

/** Site-wide FAQ (also the source for FAQPage schema and llms.txt). */
export const SITE_FAQ: Faq[] = [
  { q: "What is SLIIQQUE?", a: "SLIIQQUE is a premium creative studio based in Lagos, Nigeria, founded on 22 December 2025 by Gabriel Njoabozia. It produces AI commercials, AI UGC and digital humans, AI product photography, AI fashion imagery, brand launches, product cinematography and visual campaigns for brands in Nigeria, Africa and worldwide. AI is how SLIIQQUE produces; what it sells is creative systems." },
  { q: "Where is SLIIQQUE based and who does it work with?", a: "SLIIQQUE is based in Lagos, Nigeria and works with brands in Nigeria, across Africa and internationally. International clients are quoted and invoiced in US dollars." },
  { q: "What is an AI commercial?", a: "An AI commercial is a short cinematic advertisement produced with AI image and video tools under human art direction, without a conventional film shoot. SLIIQQUE's AI commercials start from ₦350,000 (US$650)." },
  { q: "What is AI UGC and what is a digital human?", a: "AI UGC is UGC-style short-form video presented by an AI-generated person. A digital human is a photorealistic AI person with a permanent, consistent identity, so the same person appears across every ad. A custom digital human from SLIIQQUE is ₦150,000 (US$280)." },
  { q: "How much do SLIIQQUE's services cost?", a: "Monthly retainers are ₦150,000 (US$280), ₦350,000 (US$650) and ₦750,000 (US$1,400). One-off projects are an AI commercial from ₦350,000 (US$650), a Product Photo Pack at ₦75,000 (US$140), a custom digital human at ₦150,000 (US$280) and a Brand Launch Campaign at ₦900,000 (US$1,700). Prices exclude taxes." },
  { q: "How long does a project take?", a: "An AI commercial takes 7 days, a Product Photo Pack 5 working days, a custom digital human 7 days and a Brand Launch Campaign 21 days, counted from the deposit and all required materials. Retainer content is delivered in batches agreed in a monthly plan." },
  { q: "How many revisions are included?", a: "Two revision rounds per deliverable batch. Further rounds are ₦15,000 (US$30) each." },
  { q: "How does payment work?", a: "One-off projects take a 50% deposit and 50% on delivery. Retainers are billed monthly in advance. Nigerian clients pay in naira and international clients in US dollars by bank transfer." },
  { q: "Who owns the final work?", a: "On full payment, final deliverables of a one-off project are assigned to the client, including commercial and paid-media use. Retainer content is licensed for perpetual use on the client's own channels, with paid-ad use included on the Scale retainer." },
  { q: "Does SLIIQQUE design logos?", a: "No. SLIIQQUE does not offer logo design. It works with the brand assets a client supplies." },
  { q: "Are AI-generated ads allowed on Meta, TikTok and YouTube?", a: "Generally yes, but platforms and regulators increasingly require labels for synthetic or AI-generated media. The client is responsible for required labelling, and SLIIQQUE supplies suggested disclosure wording on request." },
  { q: "Does SLIIQQUE create fake testimonials or deepfakes?", a: "No. Digital humans are synthetic and are not presented as real customers. SLIIQQUE does not make fabricated reviews, deepfakes of public figures or a likeness of a real person without written consent." },
  { q: "Does SLIIQQUE do AI fashion imagery?", a: "Yes. SLIIQQUE creates photorealistic AI models wearing a brand's clothes for lookbooks, campaigns and e-commerce, working from photos of the real garments. It is included in retainer stills from ₦150,000 (US$280) a month." },
  { q: "Is the work on this site client work?", a: "No. ÀLÀ, ODÈ, ÀSE and ILÉ are self-initiated concept projects for fictional brands, labelled as concept work. They show how SLIIQQUE works and do not show real sales or audience results." },
  { q: "How do I start a project?", a: "Email hello@sliiqque.space or call or WhatsApp +234 704 100 0085 with the product, audience, platforms and deadline. SLIIQQUE replies within one working day with a scope and quote." },
];
