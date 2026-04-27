import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly title: string;
  readonly subtitle?: string;
  readonly children: ReactNode;
  readonly maxWidth?: string;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-2xl",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] animate-[fade-in_150ms_ease] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`fixed inset-x-0 top-[10vh] z-[61] mx-auto w-full ${maxWidth} animate-[fade-up_200ms_cubic-bezier(0.16,1,0.3,1)] px-4`}
      >
        <div className="flex max-h-[80vh] flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-background/95 shadow-2xl backdrop-blur-xl">
          <header className="flex items-start justify-between gap-4 border-b border-foreground/[0.06] px-5 py-4">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
              {subtitle && (
                <p className="mt-0.5 text-xs text-foreground/45">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-foreground/55 transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-5">{children}</div>
        </div>
      </div>
    </>
  );
}
