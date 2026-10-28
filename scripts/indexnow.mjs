// Submit every URL in the live sitemap to IndexNow (Bing, Yandex, Naver, Seznam).
// The key is public by design: it must be served at /<key>.txt from public/.
// Usage: node scripts/indexnow.mjs [--dry]
const HOST = "studio.sliiqque.space";
const KEY = "19b48019398f4f8ab61c5e7d474980ea";
const dry = process.argv.includes("--dry");

const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()).filter((u) => new URL(u).host === HOST);
if (!urlList.length) throw new Error("No URLs found in sitemap.xml");

const keyRes = await fetch(`https://${HOST}/${KEY}.txt`);
if (!keyRes.ok || (await keyRes.text()).trim() !== KEY) throw new Error("IndexNow key file is not live, aborting");

console.log(`${urlList.length} URLs from sitemap`);
if (dry) process.exit(0);

const res = await fetch("https://api.indexnow.org/IndexNow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow responded ${res.status}`);
if (res.status !== 200 && res.status !== 202) throw new Error(await res.text());
