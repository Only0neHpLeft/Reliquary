import { createFileRoute } from "@tanstack/react-router";
import { Aperture, Wand2, Network, Mic, Hexagon, Sparkles } from "lucide-react";
import { APP_TITLE } from "@/shared/lib/version";

type VesselStatus = "Closed" | "Training" | "Planned" | "Deferred" | "Proposed";

interface Vessel {
  readonly name: string;
  readonly role: string;
  readonly note: string;
  readonly status: VesselStatus;
  readonly icon: typeof Aperture;
}

const VESSELS: readonly Vessel[] = [
  {
    name: "Aperture",
    role: "Text & vision foundation",
    note: "Neuromorphic baseline in training",
    status: "Closed",
    icon: Aperture,
  },
  {
    name: "Dantian",
    role: "Image generation",
    note: "Continuous flow matching, first commercial target",
    status: "Training",
    icon: Wand2,
  },
  {
    name: "Meridian",
    role: "Inference orchestration",
    note: "Local routing across vessels",
    status: "Planned",
    icon: Network,
  },
  {
    name: "Qi",
    role: "Speech-to-text (Qi-Ear)",
    note: "Deferred until Aperture neuromorphic ships",
    status: "Deferred",
    icon: Mic,
  },
  {
    name: "Gu",
    role: "Minecraft texture model",
    note: "Categorical autoregressive over palette tokens",
    status: "Proposed",
    icon: Hexagon,
  },
];

const STATUS_TONE: Record<VesselStatus, string> = {
  Closed: "border-foreground/15 text-foreground/55",
  Training: "border-foreground/15 text-foreground/55",
  Planned: "border-foreground/10 text-foreground/45",
  Deferred: "border-foreground/10 text-foreground/45",
  Proposed: "border-foreground/10 text-foreground/40",
};

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <section className="mx-auto flex min-h-screen max-w-3xl flex-col px-8 py-16">
      <header className="mb-14">
        <Sparkles className="mb-6 h-7 w-7 text-foreground/35" />
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Reliquary</h1>
        <p className="max-w-xl text-base leading-relaxed text-foreground/65">
          A vessel for the cultivation stack. Foundation models held local, not behind an API —
          download once, run forever.
        </p>
      </header>

      <div className="mb-3">
        <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-foreground/45">
          Vessels
        </h2>
        <p className="text-sm text-foreground/55">Five models, one shell.</p>
      </div>

      <ul className="mb-12 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {VESSELS.map((v) => (
          <li
            key={v.name}
            className="group rounded-xl border border-border bg-card/60 p-5 transition-colors hover:bg-card"
          >
            <div className="mb-2 flex items-center gap-2.5">
              <v.icon className="h-4 w-4 text-foreground/45" aria-hidden />
              <span className="text-sm font-semibold tracking-tight">{v.name}</span>
              <span
                className={`ml-auto rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${STATUS_TONE[v.status]}`}
              >
                {v.status}
              </span>
            </div>
            <p className="mb-1 text-sm text-foreground/75">{v.role}</p>
            <p className="text-xs leading-relaxed text-foreground/45">{v.note}</p>
          </li>
        ))}
      </ul>

      <footer className="mt-auto flex items-center justify-between border-t border-border pt-6 text-xs text-foreground/45">
        <span className="font-mono">{APP_TITLE}</span>
        <span>local-first &middot; no telemetry</span>
      </footer>
    </section>
  );
}
