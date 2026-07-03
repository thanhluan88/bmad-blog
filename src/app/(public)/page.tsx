import { redirect } from "next/navigation";
import { PMP_HUB_SLUG } from "@/lib/pmp-quiz";

export default function HomePage() {
  redirect(`/p/${PMP_HUB_SLUG}`);
}
