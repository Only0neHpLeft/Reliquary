import { createFileRoute } from "@tanstack/react-router";
import { History as HistoryIcon } from "lucide-react";
import { PageStub } from "@/shared/components/page-stub";

export const Route = createFileRoute("/history")({
  component: () => (
    <PageStub
      icon={HistoryIcon}
      title="History"
      note="Every run, every output. Replay, fork, or export."
    />
  ),
});
