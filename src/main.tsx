import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ThemeProvider } from "./shared/lib/theme";
import { ErrorBoundary } from "./shared/components/error-boundary";
import { applyWindowTitle } from "./shared/lib/version";
import { routeTree } from "./routeTree.gen";
import "./index.css";

void applyWindowTitle();

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
