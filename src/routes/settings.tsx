import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { PageStub } from "@/shared/components/page-stub";

export const Route = createFileRoute("/settings")({
  component: () => (
    <PageStub
      icon={SettingsIcon}
      title="Settings"
      note="Theme, model paths, hotkeys, telemetry (off by default), storage."
    />
  ),
});
