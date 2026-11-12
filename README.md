# Kasuality OS • Universal Color and K-UDA Design System
### Official Extension for Visual Studio Code and Cursor IDE

[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://www.kasuality.com)
[![OKLCH](https://img.shields.io/badge/Color_Space-OKLCH_Wide--Gamut-06B6D4.svg)](https://www.kasuality.com)
[![APCA](https://img.shields.io/badge/Accessibility-APCA_W3C_Ready-10B981.svg)](https://www.kasuality.com)
[![K-UDA](https://img.shields.io/badge/Architecture-K--UDA_Self--Healing-8B5CF6.svg)](https://www.kasuality.com/kuda/)
[![Languages](https://img.shields.io/badge/Languages-IT_%7C_EN_%7C_ES_%7C_FR_%7C_DE-F43F5E.svg)](https://www.kasuality.com)

**Kasuality** bridges the gap between digital design and modern front-end engineering. Developed for web developers, UI/UX engineers, and AI-driven workflows (Cursor and Windsurf), Kasuality brings **perceptual color science (OKLCH)**, **predictive contrast algorithms (APCA and WCAG)**, and **bitematic Self-Healing tokens (K-UDA)** directly inside your coding editor.

---

## ✨ Key Capabilities

### 1. K-UDA Bitematic Engine (Light and Dark Mode)
Never write separate, broken dark mode color overrides again:
* Generates **Self-Healing CSS** leveraging modern **CSS Relative Colors** (`oklch(from ...)`).
* Background and text colors adapt automatically under `@media (prefers-color-scheme: dark)` and `[data-theme="dark"]`, guaranteeing an **APCA Lc ≥ 75** readability score both in full daylight and at night.

### 2. The Gradient Doctor (OKLCH Zero Gray Dead Zone)
Traditional sRGB gradients suffer from an ugly, desaturated mud-gray dip in the center (the *"Gray Dead Zone"*).
* Kasuality generates **Progressive OKLCH Gradients**:
  ```css
  /* Universal Fallback */
  background: linear-gradient(90deg, var(--kas-primary), var(--kas-secondary));
  /* The Gradient Doctor (OKLCH Perceptual Interpolation) */
  background: linear-gradient(in oklch 90deg, var(--kas-primary), var(--kas-secondary));
  ```
* Smooth, vivid, and luminous transitions across your entire UI.

### 3. IntelliSense Autocomplete and Color Previews
* As you type in CSS, SCSS, HTML, JSX, TSX, Vue, or Tailwind, typing `kas-` or `--kas-` displays instant completions:
  - `--kas-primary`: CTA and Primary Action
  - `--kas-secondary`: Supporting Elements
  - `--kas-accent`: High-contrast indicators
  - `--kas-surface`: Card and Container Surfaces
  - `--kas-text`: Contrast-verified Body and Title Text
* Real color swatches appear inline next to your code.

### 4. Cursor AI Context Rules (.cursorrules and .mdc)
* Click **"Inietta Regole Cursor AI"** (Inject Cursor AI Rules) to automatically generate workspace configuration files.
* Commands Cursor's AI agent to:
  1. Strictly forbid hardcoded hex codes (`#ffffff`, `#3b82f6`).
  2. Consume active Kasuality K-UDA variables.
  3. Ensure all generated UI components are accessible by default.

### 5. Enterprise Team Cloud Sync (Live)
* Connect your team workspace license key (`kasuality.teamLicenseKey`).
* When the Art Director or Lead Designer approves a palette on [Kasuality.com](https://www.kasuality.com), your editor syncs tokens in real time (within 50ms) via secure WebSockets.

---

## 🚀 Quick Start Guide

### Installation from VSIX (Local Test)
1. In VS Code or Cursor, open the **Extensions** panel (`Ctrl+Shift+X` or `Cmd+Shift+X`).
2. Click the three dots menu (**...**) in the top right corner of the Extensions view.
3. Select **"Install from VSIX..."**.
4. Choose the `kasuality-vscode-1.0.1.vsix` file from your desktop.
5. The **Kasuality** activity bar icon will appear on your left sidebar!

### Commands
Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type:
* `Kasuality: Apri Pannello Design System` — Opens the sidebar studio.
* `Kasuality: Inserisci Token CSS K-UDA` — Injects full Self-Healing runtime CSS into current file.
* `Kasuality: Copia Token W3C DTCG JSON` — Copies DTCG compliant design tokens.
* `Kasuality: Inietta Regole Cursor AI` — Generates `.cursorrules` in your project root.
* `Kasuality: Ispeziona Contrasto e Spazio OKLCH` — Inspects selected hex color.

---

## 🌐 5 Languages Native Support

Switch seamlessly between languages via the header dropdown in the sidebar:
* 🇮🇹 **Italiano** (Nativo)
* 🇬🇧 **English** (International)
* 🇪🇸 **Español** (Completo)
* 🇫🇷 **Français** (Complet)
* 🇩🇪 **Deutsch** (Vollständig)

---

## 🔒 Privacy and Architecture
* **Zero telemetry tracking**: Your source code never leaves your computer.
* **W3C DTCG 2025.10 Compliant**: Built on official open design token standards.
* **Cloud Infrastructure**: Powered by Kasuality OS and Supabase Realtime Engine.

---

© 2026 Kasuality OS • [www.kasuality.com](https://www.kasuality.com)
