import { HeroSearch } from "@/components/hero-search";
import { HomeSections } from "@/components/home-sections";
import { ListingSection } from "@/components/listing-section";
import { getListings } from "@/lib/api";
import type { SearchParams } from "@/lib/types";

type RawSearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: { searchParams: RawSearchParams }) {
  const raw = await searchParams;
  const params: SearchParams = {
    area: first(raw.area),
    type: first(raw.type),
    mode: first(raw.mode),
    min_price: first(raw.min_price),
    max_price: first(raw.max_price),
    beds: first(raw.beds),
    sort: first(raw.sort),
    cursor: first(raw.cursor),
  };
  const result = await getListings(params);

  return (
    <>
      <HeroSearch params={params} />
      <ListingSection result={result} params={params} />
      <HomeSections />
    </>
  );
}
