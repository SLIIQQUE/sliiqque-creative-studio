import "server-only";
import { getWorkEntries } from "@/lib/works";

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

/** 3 -> "three", 14 -> "14". */
export const countWord = (n: number) => WORDS[n] ?? String(n);

/** ["A", "B", "C"] -> "A, B and C". */
export const joinNames = (names: string[]) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`);

/** Facts about the published works, so counts and name lists on any page follow the admin. */
export async function getWorkFacts() {
  const works = await getWorkEntries();
  const names = works.map((w) => w.name);
  return {
    count: works.length,
    names,
    /** "ÀLÀ, ODÈ and ÀSE" */
    namesList: joinNames(names),
    /** "ÀLÀ skincare, ODÈ grooming and ÀSE spirits" */
    withCategories: joinNames(works.map((w) => `${w.name} ${w.category.split(" · ")[0].toLowerCase()}`)),
    noun: works.length === 1 ? "world" : "worlds",
  };
}
