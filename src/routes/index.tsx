import { createFileRoute } from "@tanstack/react-router";
import { SponsorWorkspace } from "@/components/sponsor-agent/sponsor-workspace";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sponsor Agent — Find sponsors for your event" },
      { name: "description", content: "Research relevant event sponsors, find verified contacts, and prepare sponsorship outreach." },
      { property: "og:title", content: "Sponsor Agent — Event sponsorship research" },
      { property: "og:description", content: "Find relevant sponsors and prepare evidence-backed outreach for your event." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <SponsorWorkspace />;
}
