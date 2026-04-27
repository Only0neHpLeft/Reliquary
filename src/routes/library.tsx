import { createFileRoute } from "@tanstack/react-router";
import { BookMarked } from "lucide-react";
import { PageStub } from "@/shared/components/page-stub";

export const Route = createFileRoute("/library")({
  component: () => (
    <PageStub
      icon={BookMarked}
      title="Library"
      note="Saved prompts, outputs, and reference material. Tag, search, and re-run."
    />
  ),
});
