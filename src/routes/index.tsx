import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center p-12 text-center">
      <Sparkles className="mb-6 h-12 w-12 text-foreground/30" />
      <h1 className="mb-3 text-3xl font-bold tracking-tight">Reliquary</h1>
      <p className="max-w-md text-sm text-foreground/60">
        Vessel for the cultivation stack. Aperture, Dantian, Meridian, Qi, Gu — held local.
      </p>
    </section>
  );
}
