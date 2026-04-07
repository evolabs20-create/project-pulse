import { useEffect, useMemo, useState } from "react";
import { agents, costEstimates, initialTasks, memoryHighlights, models, projects, sessions, skills } from "./data";

const STORAGE_KEY = "pulse-tasks";

const STATUS_STYLES = {
  active: {
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/25",
    text: "text-emerald-200",
    pill: "text-emerald-300 bg-emerald-400/10 border-emerald-400/25",
    label: "Active",
    accent: "bg-emerald-400",
  },
  stalled: {
    bg: "bg-amber-400/10",
    border: "border-amber-400/25",
    text: "text-amber-100",
    pill: "text-amber-200 bg-amber-400/10 border-amber-400/25",
    label: "Stalled",
    accent: "bg-amber-400",
  },
  done: {
    bg: "bg-sky-400/10",
    border: "border-sky-400/25",
    text: "text-sky-100",
    pill: "text-sky-200 bg-sky-400/10 border-sky-400/25",
    label: "Done",
    accent: "bg-sky-400",
  },
  blocked: {
    bg: "bg-rose-400/10",
    border: "border-rose-400/25",
    text: "text-rose-100",
    pill: "text-rose-200 bg-rose-400/10 border-rose-400/25",
    label: "Blocked",
    accent: "bg-rose-400",
  },
};

const PRIORITY_STYLES = {
  high: "text-rose-300 bg-rose-400/10 border-rose-400/25",
  "medium-high": "text-orange-200 bg-orange-400/10 border-orange-400/25",
  medium: "text-amber-100 bg-amber-400/10 border-amber-400/25",
  "medium-low": "text-lime-100 bg-lime-400/10 border-lime-400/25",
  low: "text-emerald-100 bg-emerald-400/10 border-emerald-400/25",
};

const PRIORITY_ORDER = {
  high: 0,
  "medium-high": 1,
  medium: 2,
  "medium-low": 3,
  low: 4,
};

const STATUS_ORDER = { blocked: 0, stalled: 1, active: 2, done: 3 };

const PROJECT_ALIASES = {
  "pintrader platform (mypinfo)": "pintrader platform",
  "pintrader platform": "pintrader platform",
  crazy4pins: "crazy4pins",
  "webuydisneypins.com": "webuydisneypins.com",
  mykitchen: "mykitchen",
  "pin price scanner": "pin price scanner",
  "arteaga designs": "arteaga designs",
  "arteaga party favors": "arteaga party favors",
  "evo dashboard": "evo dashboard",
  "openclaw/evo": "evo / openclaw",
  "evo / openclaw": "evo / openclaw",
};

function normalizeProjectName(name) {
  return PROJECT_ALIASES[name.toLowerCase()] ?? name.toLowerCase();
}

function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm transition ${
        active
          ? "bg-white text-slate-950 shadow-lg shadow-cyan-500/10"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.stalled;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-semibold ${style.pill}`}>
      <span className={`h-2 w-2 rounded-full ${style.accent}`} />
      {style.label}
    </span>
  );
}

function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${PRIORITY_STYLES[priority]}`}>
      {priority.replace("-", " ")}
    </span>
  );
}

function SectionCard({ className = "", children }) {
  return (
    <section
      className={`rounded-3xl border border-white/10 bg-slate-950/65 p-5 shadow-[0_20px_80px_rgba(2,8,23,0.45)] backdrop-blur ${className}`}
    >
      {children}
    </section>
  );
}

function MetricCard({ label, value, hint, tone = "text-white" }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className={`mt-2 text-3xl font-semibold ${tone}`}>{value}</div>
      <div className="mt-1 text-sm text-slate-400">{hint}</div>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialTasks;
    } catch {
      return initialTasks;
    }
  });
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("projects");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const toggleTask = (id) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));
  };

  const {
    doneTasks,
    completion,
    projectSummaries,
    attentionTasks,
    totalProjects,
  } = useMemo(() => {
    const totalTasks = tasks.length;
    const completed = tasks.filter((task) => task.done).length;
    const grouped = tasks.reduce((acc, task) => {
      const key = normalizeProjectName(task.project);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(task);
      return acc;
    }, {});

    const summaries = projects
      .map((project) => {
        const key = normalizeProjectName(project.name);
        const projectTasks = grouped[key] ?? [];
        const openTasks = projectTasks.filter((task) => !task.done);
        const completedTasks = projectTasks.length - openTasks.length;
        const progress = projectTasks.length ? Math.round((completedTasks / projectTasks.length) * 100) : project.status === "done" ? 100 : 0;
        return {
          ...project,
          key,
          totalTasks: projectTasks.length,
          openTasks,
          completedTasks,
          progress,
          nextTask: openTasks[0]?.text ?? null,
        };
      })
      .sort((a, b) => {
        if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) {
          return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        }
        if (PRIORITY_ORDER[a.priority] !== PRIORITY_ORDER[b.priority]) {
          return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        }
        return b.openTasks.length - a.openTasks.length;
      });

    const rankedTasks = summaries
      .flatMap((project) =>
        project.openTasks.map((task) => ({
          ...task,
          projectName: project.name,
          projectStatus: project.status,
          priority: project.priority,
        })),
      )
      .sort((a, b) => {
        if (STATUS_ORDER[a.projectStatus] !== STATUS_ORDER[b.projectStatus]) {
          return STATUS_ORDER[a.projectStatus] - STATUS_ORDER[b.projectStatus];
        }
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      })
      .slice(0, 6);

    return {
      doneTasks: completed,
      completion: totalTasks ? Math.round((completed / totalTasks) * 100) : 0,
      projectSummaries: summaries,
      attentionTasks: rankedTasks,
      totalProjects: projects.length,
    };
  }, [tasks]);

  const filteredGroups = useMemo(() => {
    const visibleTasks = tasks.filter((task) => {
      if (filter === "open") return !task.done;
      if (filter === "done") return task.done;
      return true;
    });

    const grouped = visibleTasks.reduce((acc, task) => {
      const key = normalizeProjectName(task.project);
      if (!acc[key]) {
        const summary = projectSummaries.find((project) => project.key === key);
        acc[key] = {
          label: summary?.name ?? task.project,
          priority: summary?.priority ?? "medium",
          status: summary?.status ?? "stalled",
          tasks: [],
        };
      }
      acc[key].tasks.push(task);
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => {
      if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) {
        return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      }
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    });
  }, [filter, projectSummaries, tasks]);

  const activeProjects = projectSummaries.filter((project) => project.status === "active").length;
  const stalledProjects = projectSummaries.filter((project) => project.status === "stalled" || project.status === "blocked").length;
  const blockedProjects = projectSummaries.filter((project) => project.status === "blocked").length;
  const openTasks = tasks.length - doneTasks;

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(8,47,73,0.92),rgba(15,23,42,0.92),rgba(28,25,23,0.82))] p-6 shadow-[0_25px_100px_rgba(8,145,178,0.15)]">
          <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                Project Pulse Dashboard
              </div>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Cleaner triage for project health, open work, and operating context.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                This snapshot is based on the in-repo project, task, agent, model, and memory data. Task checkoffs persist in the browser; project statuses and notes remain data-driven.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Current focus</div>
                <div className="mt-2 text-lg font-semibold text-white">
                  {attentionTasks[0]?.projectName ?? "No active queue"}
                </div>
                <div className="mt-1 text-sm text-slate-300">
                  {attentionTasks[0]?.text ?? "No open tasks captured in the repo data."}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Cost snapshot</div>
                <div className="mt-2 text-2xl font-semibold text-emerald-300">{costEstimates.today.estimatedCost}</div>
                <div className="mt-1 text-sm text-slate-300">
                  {costEstimates.today.estimatedTokens} across {costEstimates.today.sessions} sessions
                </div>
                <div className="mt-2 text-xs text-slate-400">{costEstimates.today.note}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Projects" value={totalProjects} hint={`${activeProjects} active, ${stalledProjects} at risk`} />
          <MetricCard label="Open Tasks" value={openTasks} hint={`${doneTasks} completed locally`} tone="text-cyan-200" />
          <MetricCard label="Completion" value={`${completion}%`} hint="Based on tracked task checklist" tone="text-sky-200" />
          <MetricCard label="Blocked" value={blockedProjects} hint="Projects with stated blockers" tone="text-rose-200" />
          <MetricCard label="Models" value={models.length} hint={`${sessions.length} active sessions in snapshot`} tone="text-emerald-200" />
        </div>

        <nav className="mb-6 flex gap-2 overflow-x-auto rounded-full border border-white/10 bg-slate-950/60 p-2 backdrop-blur">
          {[
            ["projects", "Projects"],
            ["tasks", "Tasks"],
            ["models", "Models & Cost"],
            ["agents", "Agents & Skills"],
            ["memory", "Memory"],
          ].map(([key, label]) => (
            <Tab key={key} active={tab === key} onClick={() => setTab(key)}>
              {label}
            </Tab>
          ))}
        </nav>

        {tab === "projects" && (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
              <SectionCard>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Priority queue</h2>
                    <p className="mt-1 text-sm text-slate-400">
                      Ranked from blocked and stalled work first, then active projects by priority.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                    {attentionTasks.length} next actions
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {attentionTasks.map((task) => (
                    <div key={task.id} className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={task.projectStatus} />
                          <PriorityBadge priority={task.priority} />
                          <span className="text-sm font-medium text-white">{task.projectName}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-300">{task.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard>
                <h2 className="text-xl font-semibold text-white">Operational notes</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  <div className="rounded-2xl border border-amber-400/15 bg-amber-400/8 p-4">
                    <div className="font-medium text-amber-100">No deadline data is stored in the repo.</div>
                    <div className="mt-1 text-amber-50/80">
                      The dashboard now shows risk and open-work signals instead of implying a live deadline feed.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4">
                    <div className="font-medium text-cyan-100">Task/project naming is normalized in the UI.</div>
                    <div className="mt-1 text-cyan-50/80">
                      This reconciles names like “OpenClaw/Evo” and “Evo / OpenClaw” without rewriting source data.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/8 p-4">
                    <div className="font-medium text-emerald-100">GitHub Pages compatibility is preserved.</div>
                    <div className="mt-1 text-emerald-50/80">
                      The Vite base path remains unchanged and the dashboard still builds as a static site.
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {projectSummaries.map((project) => {
                const style = STATUS_STYLES[project.status] ?? STATUS_STYLES.stalled;
                return (
                  <SectionCard key={project.id} className={`border ${style.border} ${style.bg}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                          <StatusBadge status={project.status} />
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{project.notes}</p>
                      </div>
                      <PriorityBadge priority={project.priority} />
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Open</div>
                        <div className="mt-1 text-2xl font-semibold text-white">{project.openTasks.length}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Done</div>
                        <div className="mt-1 text-2xl font-semibold text-white">{project.completedTasks}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Progress</div>
                        <div className="mt-1 text-2xl font-semibold text-white">{project.progress}%</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                        <span>Task completion</span>
                        <span>
                          {project.completedTasks}/{project.totalTasks || 0}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className={`h-2 rounded-full ${style.accent}`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Next task</div>
                      <div className="mt-2 text-sm text-slate-200">
                        {project.nextTask ?? "No tracked tasks for this project in the repo snapshot."}
                      </div>
                    </div>
                  </SectionCard>
                );
              })}
            </div>
          </div>
        )}

        {tab === "tasks" && (
          <div className="space-y-5">
            <SectionCard className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Task tracker</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Checklist state is local to this browser; task text stays sourced from the repo.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["all", "open", "done"].map((value) => (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      filter === value
                        ? "border-cyan-300/30 bg-cyan-300/15 text-cyan-100"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    {value === "all" ? `All (${tasks.length})` : value === "open" ? `Open (${openTasks})` : `Done (${doneTasks})`}
                  </button>
                ))}
              </div>
            </SectionCard>

            <div className="space-y-4">
              {filteredGroups.map((group) => (
                <SectionCard key={group.label}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-white">{group.label}</h3>
                      <StatusBadge status={group.status} />
                      <PriorityBadge priority={group.priority} />
                    </div>
                    <div className="text-sm text-slate-400">{group.tasks.length} visible tasks</div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {group.tasks.map((task) => (
                      <label
                        key={task.id}
                        className={`flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3 transition hover:bg-white/[0.06] ${
                          task.done ? "opacity-55" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTask(task.id)}
                          className="mt-1 h-4 w-4 cursor-pointer accent-cyan-400"
                        />
                        <span className={`text-sm leading-6 ${task.done ? "text-slate-500 line-through" : "text-slate-200"}`}>
                          {task.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </SectionCard>
              ))}
            </div>
          </div>
        )}

        {tab === "models" && (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <SectionCard>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Model inventory</h2>
                    <p className="mt-1 text-sm text-slate-400">Current providers, context windows, and cost posture from the repo snapshot.</p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                    {models.length} configured
                  </div>
                </div>
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        <th className="pb-3 pr-4">Provider</th>
                        <th className="pb-3 pr-4">Model</th>
                        <th className="pb-3 pr-4">Context</th>
                        <th className="pb-3 pr-4">Input</th>
                        <th className="pb-3 pr-4">Output</th>
                        <th className="pb-3">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {models.map((model) => (
                        <tr key={model.model} className="border-t border-white/8 align-top">
                          <td className="py-3 pr-4 text-slate-200">{model.provider}</td>
                          <td className="py-3 pr-4">
                            <code className="rounded-lg bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">{model.model}</code>
                          </td>
                          <td className="py-3 pr-4 text-slate-300">{model.ctx}</td>
                          <td className="py-3 pr-4 font-mono text-xs text-emerald-200">{model.costIn}</td>
                          <td className="py-3 pr-4 font-mono text-xs text-rose-200">{model.costOut}</td>
                          <td className="py-3 text-slate-300">{model.label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard>
                <h2 className="text-xl font-semibold text-white">Spend context</h2>
                <div className="mt-4 rounded-2xl border border-emerald-400/15 bg-emerald-400/8 p-4">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-emerald-100/70">{costEstimates.today.label}</div>
                  <div className="mt-2 text-3xl font-semibold text-emerald-200">{costEstimates.today.estimatedCost}</div>
                  <div className="mt-1 text-sm text-emerald-50/80">
                    {costEstimates.today.estimatedTokens} across {costEstimates.today.sessions} sessions
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                  {costEstimates.today.note}
                </div>
                <div className="mt-4 space-y-2">
                  {costEstimates.rates.map((rate) => (
                    <div key={rate.model} className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                      <div>
                        <div className="text-sm text-white">{rate.model}</div>
                        <div className="text-xs text-slate-500">{rate.tier} cost tier</div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-emerald-200">In: {rate.input}</div>
                        <div className="text-rose-200">Out: {rate.output}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <SectionCard>
              <h2 className="text-xl font-semibold text-white">Active sessions</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {sessions.map((session) => (
                  <div key={session.key} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="text-sm font-medium text-white">{session.key}</div>
                    <div className="mt-1 text-sm text-slate-400">
                      {session.kind} · {session.status}
                    </div>
                    <code className="mt-3 inline-flex rounded-lg bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">{session.model}</code>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {tab === "agents" && (
          <div className="space-y-6">
            <SectionCard>
              <h2 className="text-xl font-semibold text-white">Agents</h2>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {agents.map((agent) => (
                  <div key={agent.name} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold text-white">{agent.name}</span>
                        <StatusBadge status={agent.status === "active" ? "active" : "stalled"} />
                      </div>
                      <div className="text-sm text-slate-400">{agent.sessions} sessions</div>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{agent.desc}</p>
                    <code className="mt-3 inline-flex rounded-lg bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">{agent.model}</code>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-white">Installed skills</h2>
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-300">
                  {skills.length} total
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {skills.map((skill) => (
                  <div key={skill.name} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-white">{skill.name}</span>
                      <span className="rounded-full border border-white/10 bg-slate-900 px-2 py-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        {skill.location}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{skill.desc}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {tab === "memory" && (
          <div className="space-y-4">
            {memoryHighlights.map((memory) => (
              <SectionCard key={memory.project}>
                <h2 className="text-xl font-semibold text-white">{memory.project}</h2>
                <ul className="mt-4 space-y-3">
                  {memory.highlights.map((highlight, index) => (
                    <li key={index} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-slate-300">
                      {highlight}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
