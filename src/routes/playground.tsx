import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { PageStub } from "@/shared/components/page-stub";

export const Route = createFileRoute("/playground")({
  component: () => (
    <PageStub
      icon={Zap}
      title="Playground"
      note="Generate with any vessel — text, image, speech, textures. Lands after Aperture neuromorphic baseline."
    />
  ),
});
