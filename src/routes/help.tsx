import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { PageStub } from "@/shared/components/page-stub";

export const Route = createFileRoute("/help")({
  component: () => (
    <PageStub
      icon={HelpCircle}
      title="Help"
      note="Vessel guides, troubleshooting, keyboard shortcuts. Cmd+K to search anywhere."
    />
  ),
});
