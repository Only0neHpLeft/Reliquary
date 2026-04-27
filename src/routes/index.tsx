import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex h-full items-center justify-center px-8">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/[0.05]">
          <Sparkles className="h-5 w-5 text-foreground/55" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Reliquary</h1>
        <p className="mt-2 text-sm text-foreground/55">Layout shell. Content lands here.</p>
      </div>
    </div>
  );
}
