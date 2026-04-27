import { type LucideIcon } from "lucide-react";

interface PageStubProps {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly note: string;
}

export function PageStub({ icon: Icon, title, note }: PageStubProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/[0.04]">
        <Icon className="h-5 w-5 text-foreground/45" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight text-foreground/85">{title}</h1>
      <p className="max-w-sm text-sm text-foreground/45">{note}</p>
      <span className="mt-1 rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
        Soon
      </span>
    </div>
  );
}
