import { createFileRoute } from "@tanstack/react-router";
import { Activity as ActivityIcon } from "lucide-react";
import { PageStub } from "@/shared/components/page-stub";

export const Route = createFileRoute("/activity")({
  component: () => (
    <PageStub
      icon={ActivityIcon}
      title="Activity"
      note="Live model status, recent runs, system events. Local logs only."
    />
  ),
});
