# Reliquary

Desktop vessel for the cultivation stack — Aperture, Dantian, Meridian, Qi, Gu.

Local-first AI app shell built with Tauri v2, React 19, Tailwind v4, and shadcn/ui.

## Stack

- **Shell:** Tauri v2 (Rust backend + WebView)
- **UI:** React 19, TypeScript strict, Vite 8
- **Styling:** Tailwind CSS v4, shadcn/ui (`base-nova` style, neutral base, lucide icons)
- **Routing:** TanStack Router (file-based)
- **State:** Zustand
- **Animation:** Motion
- **Lint:** ESLint flat config + typescript-eslint

## Develop

```bash
bun install
bun run tauri dev   # first run: ~3-10min Rust compile
```

The Vite dev server runs on `http://127.0.0.1:1420`. Tauri attaches to it.

## Build

```bash
bun run tauri build
```

Produces a signed (when configured) macOS `.app`, Windows `.msi`, and Linux `.AppImage` / `.deb` per the `tauri.conf.json` bundle targets.

## Status

v0 thin shell. Feature work gated on Aperture neuromorphic baseline shipping. See the vault note in `obsidian-mind` at `reference/Reliquary — Desktop App.md` for scope and roadmap.
