import { useState, useEffect } from "react";
import { projects, initialTasks, memoryHighlights, models, sessions, agents, skills, costEstimates } from "./data";

const STATUS_STYLES = {
  active:  { bg: "bg-green-500/15", border: "border-green-500/40", text: "text-green-400", label: "ACTIVE",  dot: "bg-green-400" },
  stalled: { bg: "bg-amber-500/15", border: "border-amber-500/40", text: "text-amber-400", label: "STALLED", dot: "bg-amber-400" },
  done:    { bg: "bg-blue-500/15",  border: "border-blue-500/40",  text: "text-blue-400",  label: "DONE",    dot: "bg-blue-400" },
  blocked: { bg: "bg-red-500/15",   border: "border-red-500/40",   text: "text-red-400",   label: "BLOCKED", dot: "bg-red-400" },
};
const PRI = { high: "text-red-400", "medium-high": "text-orange-400", medium: "text-amber-400", "medium-low": "text-yellow-300", low: "text-green-400" };

function Badge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.stalled;
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.bg} ${s.border} border ${s.text}`}><span className={`w-2 h-2 rounded-full ${s.dot}`}/>{s.label}</span>;
}

function Tab({ active, onClick, children }) {
  return <button onClick={onClick} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${active ? "bg-white/10 text-white" : "text-gray-500 hover:text-gray-300"}`}>{children}</button>;
}

export default function App() {
  const [tasks, setTasks] = useState(() => { try { return JSON.parse(localStorage.getItem("pulse-tasks")) || initialTasks; } catch { return initialTasks; } });
  const [filter, setFilter] = useState("all");
  const [tab, setTab] = useState("projects");

  useEffect(() => { localStorage.setItem("pulse-tasks", JSON.stringify(tasks)); }, [tasks]);
  const toggle = (id) => setTasks(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const groups = {}; tasks.forEach(t => { if (!groups[t.project]) groups[t.project] = []; groups[t.project].push(t); });
  const total = tasks.length, done = tasks.filter(t => t.done).length;
  const filtered = filter === "all" ? tasks : filter === "open" ? tasks.filter(t => !t.done) : tasks.filter(t => t.done);

  return (
    <div className="min-h-screen bg-[#0a0a14] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black"><span className="text-red-500">🔴</span> Project Pulse</h1>
            <p className="text-xs text-gray-500 mt-1">Synced: {new Date().toLocaleString()} · Say "Sync" to Evo to refresh</p>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-xs text-gray-500">Est. today</div>
            <div className="text-lg font-bold text-green-400">{costEstimates.today.estimatedCost}</div>
            <div className="text-xs text-gray-500">{costEstimates.today.estimatedTokens} tokens · {costEstimates.today.sessions} sessions</div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { l: "Active", v: projects.filter(p => p.status==="active").length, c: "text-green-400" },
            { l: "Stalled", v: projects.filter(p => p.status==="stalled"||p.status==="blocked").length, c: "text-amber-400" },
            { l: "Tasks Done", v: `${done}/${total}`, c: "text-blue-400" },
            { l: "Completion", v: `${total?Math.round(done/total*100):0}%`, c: "text-purple-400" },
            { l: "Models", v: models.length, c: "text-cyan-400" },
          ].map(s => (
            <div key={s.l} className="bg-[#0f0f1e] border border-gray-800/50 rounded-xl p-3">
              <div className="text-[10px] text-gray-500 uppercase font-semibold">{s.l}</div>
              <div className={`text-2xl font-black ${s.c} mt-0.5`}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#0f0f1e] border border-gray-800/50 rounded-xl p-1 overflow-x-auto">
          {[["projects","📊 Projects"],["tasks","✅ Tasks"],["models","🤖 Models & Cost"],["agents","🧩 Agents & Skills"],["memory","🧠 Memory"]].map(([k,l]) => (
            <Tab key={k} active={tab===k} onClick={()=>setTab(k)}>{l}</Tab>
          ))}
        </div>

        {/* PROJECTS TAB */}
        {tab === "projects" && (
          <>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6">
              <h2 className="text-sm font-bold text-red-400 mb-1">⏰ Upcoming Deadlines</h2>
              <p className="text-xs text-gray-500">No hard deadlines next 7 days. Priorities: CRAZY4PINS mobile, OpenClaw stability.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {projects.map(p => (
                <div key={p.id} className={`${STATUS_STYLES[p.status]?.bg} ${STATUS_STYLES[p.status]?.border} border rounded-xl p-4 hover:scale-[1.02] transition-transform`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-sm">{p.name}</h3>
                    <Badge status={p.status} />
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{p.notes}</p>
                  <span className={`text-xs font-semibold ${PRI[p.priority]}`}>● {p.priority.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* TASKS TAB */}
        {tab === "tasks" && (
          <>
            <div className="flex items-center gap-2 mb-4">
              {["all","open","done"].map(f => (
                <button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs border transition ${filter===f?"bg-white/10 border-white/20 text-white":"border-gray-800 text-gray-500"}`}>
                  {f==="all"?`All (${total})`:f==="open"?`Open (${total-done})`:`Done (${done})`}
                </button>
              ))}
            </div>
            <div className="bg-[#0f0f1e] border border-gray-800/50 rounded-xl divide-y divide-gray-800/30">
              {Object.entries(groups).map(([g, gt]) => {
                const vis = gt.filter(t => filtered.includes(t));
                if (!vis.length) return null;
                return (
                  <div key={g} className="p-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">{g}</h3>
                    {vis.map(t => (
                      <label key={t.id} className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-white/5 ${t.done?"opacity-40":""}`}>
                        <input type="checkbox" checked={t.done} onChange={()=>toggle(t.id)} className="mt-0.5 w-4 h-4 accent-green-500 cursor-pointer" />
                        <span className={`text-sm ${t.done?"line-through text-gray-500":"text-gray-200"}`}>{t.text}</span>
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* MODELS & COST TAB */}
        {tab === "models" && (
          <div className="space-y-6">
            <div className="bg-[#0f0f1e] border border-gray-800/50 rounded-xl p-5">
              <h2 className="text-lg font-bold text-cyan-400 mb-4">🤖 Active Models</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-xs text-gray-500 uppercase">
                    <th className="pb-3 pr-4">Provider</th><th className="pb-3 pr-4">Model</th><th className="pb-3 pr-4">Context</th><th className="pb-3 pr-4">Input Cost</th><th className="pb-3 pr-4">Output Cost</th><th className="pb-3">Status</th>
                  </tr></thead>
                  <tbody>{models.map(m => (
                    <tr key={m.model} className="border-t border-gray-800/30">
                      <td className="py-3 pr-4 text-gray-300 font-medium">{m.provider}</td>
                      <td className="py-3 pr-4"><code className="text-purple-400 text-xs bg-purple-500/10 px-2 py-0.5 rounded">{m.model}</code></td>
                      <td className="py-3 pr-4 text-gray-400">{m.ctx}</td>
                      <td className="py-3 pr-4 text-green-400 font-mono text-xs">{m.costIn}</td>
                      <td className="py-3 pr-4 text-red-400 font-mono text-xs">{m.costOut}</td>
                      <td className="py-3"><span className={`text-xs ${m.status==="ok"?"text-green-400":"text-amber-400"}`}>{m.status==="ok"?"✅":"⚠️"} {m.label}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#0f0f1e] border border-gray-800/50 rounded-xl p-5">
              <h2 className="text-lg font-bold text-green-400 mb-4">💰 Cost Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase">Estimated Today</div>
                  <div className="text-2xl font-black text-green-400 mt-1">{costEstimates.today.estimatedCost}</div>
                  <div className="text-xs text-gray-500 mt-1">{costEstimates.today.estimatedTokens} tokens across {costEstimates.today.sessions} sessions</div>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                  <div className="text-xs text-gray-500 uppercase">Note</div>
                  <div className="text-sm text-gray-300 mt-2">{costEstimates.today.note}</div>
                </div>
              </div>
              <h3 className="text-sm font-bold text-gray-400 mb-2">Rate Card</h3>
              <div className="space-y-2">
                {costEstimates.rates.map(r => (
                  <div key={r.model} className="flex items-center justify-between py-2 px-3 bg-white/[0.02] rounded-lg">
                    <span className="text-sm text-gray-300">{r.model}</span>
                    <div className="flex gap-4 text-xs">
                      <span className="text-green-400">In: {r.input}</span>
                      <span className="text-red-400">Out: {r.output}</span>
                      <span className="text-gray-500 font-bold w-10 text-right">{r.tier}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0f0f1e] border border-gray-800/50 rounded-xl p-5">
              <h2 className="text-lg font-bold text-amber-400 mb-4">📡 Active Sessions</h2>
              <div className="space-y-2">
                {sessions.map(s => (
                  <div key={s.key} className="flex items-center justify-between py-2 px-3 bg-white/[0.02] rounded-lg">
                    <div>
                      <span className="text-sm text-white font-medium">{s.key}</span>
                      <span className="text-xs text-gray-500 ml-2">{s.kind}</span>
                    </div>
                    <code className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">{s.model}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AGENTS & SKILLS TAB */}
        {tab === "agents" && (
          <div className="space-y-6">
            <div className="bg-[#0f0f1e] border border-gray-800/50 rounded-xl p-5">
              <h2 className="text-lg font-bold text-orange-400 mb-4">🧩 Agents</h2>
              {agents.map(a => (
                <div key={a.name} className="flex items-center justify-between py-3 px-4 mb-2 bg-white/[0.02] rounded-lg border border-gray-800/30">
                  <div>
                    <span className="text-white font-bold">{a.name}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${a.status==="active"?"bg-green-500/15 text-green-400 border border-green-500/30":"bg-amber-500/15 text-amber-400 border border-amber-500/30"}`}>{a.status}</span>
                    <div className="text-xs text-gray-500 mt-1">{a.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Sessions: {a.sessions}</div>
                    <code className="text-xs text-purple-400">{a.model}</code>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#0f0f1e] border border-gray-800/50 rounded-xl p-5">
              <h2 className="text-lg font-bold text-teal-400 mb-4">🔧 Installed Skills ({skills.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {skills.map(s => (
                  <div key={s.name} className="flex items-start gap-3 py-2.5 px-3 bg-white/[0.02] rounded-lg">
                    <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded mt-0.5">{s.location}</span>
                    <div>
                      <span className="text-sm text-white font-medium">{s.name}</span>
                      <div className="text-xs text-gray-500">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEMORY TAB */}
        {tab === "memory" && (
          <div className="space-y-4">
            {memoryHighlights.map(m => (
              <div key={m.project} className="bg-[#0f0f1e] border border-gray-800/50 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-3">{m.project}</h3>
                <ul className="space-y-2">
                  {m.highlights.map((h, i) => (
                    <li key={i} className="text-sm text-gray-400 pl-4 border-l-2 border-purple-500/40 leading-relaxed">{h}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
