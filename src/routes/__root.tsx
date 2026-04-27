import { createRootRoute, Outlet } from "@tanstack/react-router";
import { RouteErrorFallback } from "@/shared/components/error-boundary";
import { AppShell } from "@/shared/layout/app-shell";

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RouteErrorFallback,
});

function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
