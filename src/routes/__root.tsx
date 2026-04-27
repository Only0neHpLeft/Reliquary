import { createRootRoute, Outlet } from "@tanstack/react-router";
import { RouteErrorFallback } from "@/shared/components/error-boundary";

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RouteErrorFallback,
});

function RootLayout() {
  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased">
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
}
