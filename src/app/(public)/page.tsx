import { redirect } from "next/navigation";
import { getLatestHomePostSlug } from "@/lib/latest-home-post";
import { PMP_HUB_SLUG } from "@/lib/pmp-quiz";

export default async function HomePage() {
  const slug = await getLatestHomePostSlug();
  redirect(slug ? `/p/${slug}` : `/p/${PMP_HUB_SLUG}`);
}
