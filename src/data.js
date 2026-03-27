export const projects = [
  { id: 1, name: "PinTrader Platform (MyPinfo)", status: "active", priority: "high", notes: "Next.js 15 + Supabase, core features working" },
  { id: 2, name: "CRAZY4PINS", status: "stalled", priority: "medium-high", notes: "Mobile bugs, 500 errors unresolved" },
  { id: 3, name: "WeBuyDisneyPins.com", status: "done", priority: "medium", notes: "Production, stable" },
  { id: 4, name: "MyKitchen", status: "stalled", priority: "medium", notes: "Gemini AI + Firebase, no recent updates" },
  { id: 5, name: "Pin Price Scanner", status: "blocked", priority: "medium-low", notes: "eBay API auth issues" },
  { id: 6, name: "Arteaga Designs", status: "done", priority: "low", notes: "Production" },
  { id: 7, name: "Arteaga Party Favors", status: "stalled", priority: "low", notes: "Planning phase" },
  { id: 8, name: "Evo Dashboard", status: "active", priority: "medium", notes: "Task/cost tracker" },
  { id: 9, name: "OpenClaw/Evo", status: "active", priority: "high", notes: "Gateway stabilized today" },
];

export const initialTasks = [
  { id: 1, project: "PinTrader Platform", text: "Refine collection management UX", done: false },
  { id: 2, project: "PinTrader Platform", text: "Monitor GPT-4 Vision API costs at scale", done: false },
  { id: 3, project: "PinTrader Platform", text: "Implement caching for image search results", done: false },
  { id: 4, project: "PinTrader Platform", text: "Add rate limiting to API routes", done: false },
  { id: 5, project: "PinTrader Platform", text: "Mobile responsiveness verification", done: false },
  { id: 6, project: "CRAZY4PINS", text: "Fix mobile compatibility problems", done: false },
  { id: 7, project: "CRAZY4PINS", text: "Resolve intermittent 500 server errors", done: false },
  { id: 8, project: "CRAZY4PINS", text: "Fix shelves functionality bugs", done: false },
  { id: 9, project: "CRAZY4PINS", text: "Refactor shelves system / reduce tech debt", done: false },
  { id: 10, project: "Pin Price Scanner", text: "Resolve eBay API authentication issues", done: false },
  { id: 11, project: "Pin Price Scanner", text: "Fix CORS restrictions via Cloudflare Workers", done: false },
  { id: 12, project: "Evo / OpenClaw", text: "Stabilize gateway (crashed 20+ times today)", done: false },
  { id: 13, project: "Evo / OpenClaw", text: "Fix Discord token management", done: false },
  { id: 14, project: "Evo / OpenClaw", text: "Configure model fallbacks properly", done: false },
  { id: 15, project: "Evo / OpenClaw", text: "Set up daily summaries in #daily-logs", done: false },
  { id: 16, project: "MyKitchen", text: "Continue development (Gemini AI + Firebase)", done: false },
  { id: 17, project: "MyKitchen", text: "Prepare for iPage deployment", done: false },
];

export const memoryHighlights = [
  {
    project: "PinTrader Platform (MyPinfo)",
    highlights: [
      'Chose "Origin - Series - Character" naming convention for pins',
      "Four collection types: Own/Trade (detailed), Want/Watch (simple)",
      "AI: GPT-4 Vision image search ~$0.01/search, Quick Fill for forms",
      "Item management uses overlay + real-time auto-save",
      "Supabase with Row Level Security for all user data",
    ],
  },
  {
    project: "CRAZY4PINS",
    highlights: [
      "Shelves system added then removed (too complex) → per-card display",
      "Versions 3.0.2 → 3.3.0+",
      "iPage hosting with php.ini per directory",
      "Mobile 500 errors = PHP timeout, not fully resolved",
    ],
  },
  {
    project: "OpenClaw/Evo",
    highlights: [
      "Switched Anthropic (billing) → OpenAI Codex gpt-5.4 primary",
      "Discord token corruption caused 401 loop today",
      "Evo Dashboard built at ~/.openclaw/workspace/dashboard/",
      "Power watch monitoring active via LaunchAgent",
    ],
  },
];

// LIVE system data
export const models = [
  { provider: "Anthropic", model: "claude-opus-4-6", ctx: "977k", input: "text+image", status: "ok", label: "Default model", costIn: "$15/M", costOut: "$75/M" },
  { provider: "OpenAI Codex", model: "gpt-5.4", ctx: "200k", input: "text", status: "ok", label: "Main/webchat sessions", costIn: "~$2.50/M", costOut: "~$10/M" },
  { provider: "Anthropic", model: "claude-3-haiku", ctx: "200k", input: "text+image", status: "ok", label: "Cheap fallback", costIn: "$0.25/M", costOut: "$1.25/M" },
  { provider: "Local (Ollama)", model: "Llama 3.1 8B", ctx: "128k", input: "text", status: "ok", label: "Free local", costIn: "FREE", costOut: "FREE" },
];

export const sessions = [
  { key: "discord:#general", model: "claude-opus-4-6", kind: "group", status: "active" },
  { key: "main", model: "gpt-5.4", kind: "direct", status: "active" },
  { key: "new-start-now", model: "gpt-5.4", kind: "direct", status: "active" },
];

export const agents = [
  { name: "main", status: "active", sessions: 3, model: "claude-opus-4-6 / gpt-5.4", desc: "Primary agent — Discord, webchat, heartbeats" },
  { name: "web-dev", status: "bootstrapping", sessions: 0, model: "—", desc: "Web development agent (pending setup)" },
];

export const skills = [
  { name: "pin-scraper", location: "workspace", desc: "Disney pin data scraper (PinPics, eBay, Google Sheets)" },
  { name: "safe-exec", location: "workspace", desc: "Safe command execution with approval workflows" },
  { name: "sonoscli", location: "workspace", desc: "Sonos speaker control" },
  { name: "bash", location: "workspace", desc: "Reliable Bash scripting" },
  { name: "self-improving-agent", location: "workspace", desc: "Continuous learning from errors & corrections" },
  { name: "real-estate-video-factory", location: "workspace", desc: "Short-form property video automation" },
  { name: "skillboss", location: "global", desc: "Multi-AI gateway for fullstack apps & deployments" },
  { name: "carlos-desktop-manager", location: "global", desc: "Desktop backups & WhatNot automation" },
  { name: "summarize", location: "workspace", desc: "Content summarization" },
  { name: "felo-search", location: "workspace", desc: "Web search integration" },
  { name: "apple-remind-me", location: "workspace", desc: "Apple Reminders integration" },
  { name: "filesystem", location: "workspace", desc: "File system operations" },
];

export const costEstimates = {
  today: {
    label: "Today (Mar 26)",
    sessions: 3,
    estimatedTokens: "~17k",
    estimatedCost: "$0.30–0.80",
    note: "Most spend on claude-opus-4-6 (Discord) + gpt-5.4 (webchat)",
  },
  rates: [
    { model: "claude-opus-4-6", input: "$15/M tok", output: "$75/M tok", tier: "$$$$" },
    { model: "gpt-5.4", input: "~$2.50/M tok", output: "~$10/M tok", tier: "$$" },
    { model: "claude-3-haiku", input: "$0.25/M tok", output: "$1.25/M tok", tier: "$" },
    { model: "Llama 3.1 8B (local)", input: "FREE", output: "FREE", tier: "🆓" },
  ],
};
