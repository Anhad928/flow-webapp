<!-- prettier-ignore-start -->
<p align="center">
  <img src="https://raw.githubusercontent.com/YOUR-ORG/YOUR-REPO/main/.github/banner.png" width="720" alt="FlowGen banner">
</p>

<h1 align="center">FlowGen • Git-repo ↔️ Interactive Flowcharts</h1>

<p align="center">
  <a href="https://your-app.vercel.app"><img src="https://img.shields.io/website?down_color=red&down_message=offline&label=frontend&up_color=green&up_message=online&url=https%3A%2F%2Fyour-app.vercel.app" /></a>
  <a href="https://fly.io/apps/server-frosty-river-911"><img src="https://img.shields.io/website?down_color=red&down_message=offline&label=API&up_color=green&up_message=online&url=https%3A%2F%2Fserver-frosty-river-911.fly.dev%2Fhealth" /></a>
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
</p>

---

> **FlowGen** turns any public GitHub repository into an **interactive, draggable flow-chart** and a **ChatGPT-powered QA panel** in a single click.

| ✨ Feature | Demo |
|-----------|------|
| 🔍 **Paste a repo URL** & generate a Mermaid / React-Flow diagram | ![demo-flow](.github/demo-flow.gif) |
| 🤖 **Chat** with the code-base (Streaming GPT responses) | ![demo-chat](.github/demo-chat.gif) |
| 🖱️ Drag nodes, pan / zoom, export **SVG / New Tab** | ![demo-drag](.github/demo-drag.gif) |

---

## Table of Contents
1. [Quick start](#quick-start)
2. [Tech stack](#tech-stack)
3. [Environment Variables](#environment-variables)
4. [Local development](#local-development)
5. [Deployment](#deployment)
6. [Roadmap](#roadmap)
7. [Contributing](#contributing)
8. [License](#license)

---

## Quick start

```bash
# 1. clone
git clone https://github.com/you/flowgen.git
cd flowgen

# 2. server (Fly.io clone)
cd server
cp .env.example .env            # add OPENAI_API_KEY=
npm i && npm run dev            # http://localhost:4000

# 3. web-app
cd ../web
cp .env.example .env            # put VITE_API_URL=http://localhost:4000
npm i && npm run dev            # http://localhost:5173

```
## Tech Stack

| Layer | Main Tools & Libraries | Purpose / Notes |
|-------|-----------------------|-----------------|
| **Frontend** | **React 18**, **Vite**, **TypeScript**, **Tailwind CSS** | Lightning-fast dev server, strong typing, utility-first styling |
| **Diagram Engine** | **Mermaid v10** (static SVG) → **React-Flow** (interactive) | Generate repo flow-charts, drag / pan / zoom, live re-routing |
| **Icons & UI Sugar** | **lucide-react**, **Headless UI** | Accessible icons & components |
| **State / Data** | React Context + custom hooks | Simple—no external state manager needed |
| **Chat LLM** | **OpenAI Node SDK (GPT-4o)** | Streaming answers over Server-Sent Events |
| **Back-end** | **Express 5 (TypeScript)** | Tiny REST/SSE API (`/api/analyze`) |
| **GitHub API** | **@octokit/rest** | Fetch repo tree & metadata |
| **Build / Lint** | **ESLint**, **Prettier**, **ts-node / tsc** | Consistent code quality |
| **Testing** | **Vitest** | Fast TS-friendly unit tests |
| **Container** | **Node 18-alpine** Docker image | Slim production image (~55 MB) |
| **Hosting** | **Vercel (frontend)** • **Fly.io (API)** | Zero-config CDN + global edge compute |
| **CI / CD** | **GitHub Actions** | Auto-deploy to Vercel & Fly on push |
| **Assets / Export** | **file-saver**, **react-flow-to-image** | One-click SVG/PNG export |

