import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Activity, ArrowDownRight, ArrowRight, Check, CheckCircle2, Circle, Clock3, Flame, Leaf, ListTodo, Plus, RotateCcw, Sparkles, Target, Trash2, X } from 'lucide-react'

type Priority = 'High' | 'Medium' | 'Low'
type Task = {
  id: string
  title: string
  due: string
  minutes: number
  priority: Priority
  done: boolean
  createdAt: number
}
type Draft = { title: string; due: string; minutes: string; priority: Priority }

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const dateOffset = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const seed: Task[] = [
  { id: 'seed-1', title: 'Finish data structures assignment', due: dateOffset(1), minutes: 90, priority: 'High', done: false, createdAt: 1 },
  { id: 'seed-2', title: 'Review calculus problem set', due: today(), minutes: 45, priority: 'High', done: false, createdAt: 2 },
  { id: 'seed-3', title: 'Prepare slides for group project', due: dateOffset(2), minutes: 60, priority: 'Medium', done: false, createdAt: 3 },
  { id: 'seed-4', title: 'Read research paper', due: dateOffset(4), minutes: 35, priority: 'Low', done: false, createdAt: 4 },
]
const emptyDraft: Draft = { title: '', due: dateOffset(1), minutes: '30', priority: 'Medium' }

function dayDiff(due: string) {
  const start = new Date(`${today()}T00:00:00`).getTime()
  const end = new Date(`${due}T00:00:00`).getTime()
  return Math.round((end - start) / 86400000)
}
function dueLabel(due: string) {
  const d = dayDiff(due)
  if (d < 0) return `${Math.abs(d)}d overdue`
  if (d === 0) return 'Due today'
  if (d === 1) return 'Due tomorrow'
  return `Due in ${d} days`
}
function scoreTask(task: Task) {
  const days = dayDiff(task.due)
  const urgency = days < 0 ? 55 : days === 0 ? 48 : days === 1 ? 38 : days <= 3 ? 25 : days <= 7 ? 14 : 5
  const importance = task.priority === 'High' ? 28 : task.priority === 'Medium' ? 17 : 7
  const effort = task.minutes <= 30 ? 12 : task.minutes <= 60 ? 8 : task.minutes <= 90 ? 5 : 2
  return urgency + importance + effort
}
function explain(task: Task) {
  const days = dayDiff(task.due)
  const deadline = days < 0 ? 'it is already overdue' : days === 0 ? 'it is due today' : days === 1 ? 'its deadline is tomorrow' : `its deadline is in ${days} days`
  const importance = task.priority === 'High' ? 'you marked it high importance' : task.priority === 'Medium' ? 'it has medium importance' : 'it has lower stated importance'
  return `Prioritized because ${deadline} and ${importance}.`
}
function formatMinutes(total: number) {
  const h = Math.floor(total / 60), m = total % 60
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m} min`
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('focusforge.tasks.v1')
      return saved ? JSON.parse(saved) as Task[] : seed
    } catch { return seed }
  })
  const [available, setAvailable] = useState(120)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [recovery, setRecovery] = useState(false)
  const [filter, setFilter] = useState<'All' | 'Open' | 'Done'>('All')
  const [notice, setNotice] = useState('')
  useEffect(() => { localStorage.setItem('focusforge.tasks.v1', JSON.stringify(tasks)) }, [tasks])

  const pending = useMemo(() => tasks.filter(t => !t.done).sort((a, b) => scoreTask(b) - scoreTask(a)), [tasks])
  const completed = tasks.filter(t => t.done)
  const totalMinutes = pending.reduce((sum, t) => sum + t.minutes, 0)
  const todayTasks = pending.filter(t => dayDiff(t.due) <= 0)
  const scheduled = useMemo(() => {
    let remaining = available
    const blocks: { task: Task; start: number; end: number }[] = []
    const unscheduled: Task[] = []
    for (const task of pending) {
      if (task.minutes <= remaining) {
        blocks.push({ task, start: available - remaining, end: available - remaining + task.minutes })
        remaining -= task.minutes
      } else unscheduled.push(task)
    }
    return { blocks, unscheduled, remaining }
  }, [pending, available])
  const recommendations = pending.slice(0, 3)
  const visibleTasks = tasks.filter(t => filter === 'All' || (filter === 'Open' ? !t.done : t.done)).sort((a, b) => Number(a.done) - Number(b.done) || scoreTask(b) - scoreTask(a))

  function openNew() { setEditingId(null); setDraft({ ...emptyDraft, due: dateOffset(1) }); setShowForm(true) }
  function openEdit(task: Task) {
    setEditingId(task.id)
    setDraft({ title: task.title, due: task.due, minutes: String(task.minutes), priority: task.priority })
    setShowForm(true)
  }
  function submitTask(e: FormEvent) {
    e.preventDefault()
    const minutes = Number(draft.minutes)
    if (!draft.title.trim() || !Number.isFinite(minutes) || minutes < 5 || minutes > 1440) {
      setNotice('Add a title and a duration between 5 and 1,440 minutes.')
      return
    }
    if (editingId) {
      setTasks(old => old.map(t => t.id === editingId ? { ...t, title: draft.title.trim(), due: draft.due, minutes, priority: draft.priority } : t))
      setNotice('Task updated.')
    } else {
      setTasks(old => [...old, { id: crypto.randomUUID(), title: draft.title.trim(), due: draft.due, minutes, priority: draft.priority, done: false, createdAt: Date.now() }])
      setNotice('Task added and prioritized.')
    }
    setShowForm(false); setRecovery(false)
  }
  function toggleDone(id: string) {
    setTasks(old => old.map(t => t.id === id ? { ...t, done: !t.done } : t))
    setNotice('Progress updated. Your plan has been recalculated.')
  }
  function deleteTask(id: string) {
    setTasks(old => old.filter(t => t.id !== id))
    setNotice('Task deleted.')
  }
  function resetDemo() {
    setTasks(seed); setAvailable(120); setRecovery(false); setFilter('All')
    setNotice('Demo tasks restored.')
  }

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-[#20251f]">
      <header className="sticky top-0 z-20 border-b border-[#e7e8e1] bg-[#f7f7f4]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#254c38] text-white"><Activity size={21}/></div>
            <div><div className="text-lg font-bold tracking-tight">FocusForge</div><div className="text-xs text-[#73796f]">Fall behind. Regain control.</div></div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-[#e3e5dc] bg-white px-3 py-2 text-sm text-[#687066] sm:flex"><span className="h-2 w-2 rounded-full bg-[#4c956c]"/>{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
          <button onClick={openNew} className="flex items-center gap-2 rounded-xl bg-[#254c38] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1b3d2b]"><Plus size={17}/> <span className="hidden sm:inline">Add task</span><span className="sm:hidden">Add</span></button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
        <section className="mb-8 grid gap-6 lg:grid-cols-[1.45fr_0.8fr]">
          <div className="relative overflow-hidden rounded-3xl bg-[#254c38] p-6 text-white sm:p-8">
            <div className="absolute -right-10 -top-12 h-56 w-56 rounded-full border border-white/10"/><div className="absolute -right-2 -top-4 h-40 w-40 rounded-full border border-white/10"/>
            <div className="relative max-w-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-[#d8eadb]"><Leaf size={14}/> A calmer way forward</div>
              <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">You don't need to catch up on everything. <span className="text-[#b7d6bb]">Just start with the next thing.</span></h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#d3e0d5]">FocusForge turns a crowded backlog into a realistic plan—one manageable step at a time.</p>
              <button onClick={() => setRecovery(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#f0f5eb] px-4 py-3 text-sm font-semibold text-[#254c38] transition hover:bg-white"><Sparkles size={17}/> I'm overwhelmed <ArrowRight size={16}/></button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Metric icon={<ListTodo size={18}/>} label="Tasks left" value={String(pending.length)} hint={`${completed.length} completed`} />
            <Metric icon={<Clock3 size={18}/>} label="Work remaining" value={formatMinutes(totalMinutes)} hint={`${formatMinutes(available)} available today`} />
            <Metric icon={<Flame size={18}/>} label="Due today / late" value={String(todayTasks.length)} hint="Needs attention" />
            <Metric icon={<Target size={18}/>} label="Today's capacity" value={totalMinutes <= available ? 'On track' : `${formatMinutes(totalMinutes - available)} over`} hint={totalMinutes <= available ? 'Work fits your time' : 'Plan needs a reset'} />
          </div>
        </section>

        {notice && <div role="status" className="mb-5 flex items-center justify-between rounded-xl border border-[#d9e6d7] bg-[#edf5eb] px-4 py-3 text-sm text-[#2c5c3d]">{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={16}/></button></div>}

        {recovery && <section className="mb-8 rounded-3xl border border-[#d7e5d5] bg-[#eef5eb] p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="max-w-2xl"><div className="flex items-center gap-2 text-sm font-semibold text-[#326445]"><Sparkles size={17}/> OVERWHELM RECOVERY MODE</div><h2 className="mt-2 text-2xl font-semibold tracking-tight">Let's make the next hour manageable.</h2><p className="mt-2 text-sm leading-6 text-[#586b59]">These actions are ranked from your real task list using deadline urgency, importance, and a small-task advantage. You can complete any step here; the rest of your plan updates automatically.</p></div>
            <button onClick={() => setRecovery(false)} aria-label="Close recovery mode" className="self-end rounded-lg p-2 text-[#526552] hover:bg-white sm:self-start"><X size={18}/></button>
          </div>
          {recommendations.length ? <div className="mt-5 grid gap-3 md:grid-cols-3">
            {recommendations.map((task, i) => <div key={task.id} className="flex flex-col rounded-2xl border border-[#dce7d8] bg-white p-4">
              <div className="flex items-center justify-between"><span className="rounded-full bg-[#e9f2e6] px-2.5 py-1 text-xs font-semibold text-[#326445]">STEP 0{i + 1}</span><span className="flex items-center gap-1 text-xs text-[#697568]"><Clock3 size={13}/>{formatMinutes(task.minutes)}</span></div>
              <h3 className="mt-4 font-semibold leading-5">{task.title}</h3><p className="mt-2 text-xs leading-5 text-[#697568]">{explain(task)}</p>
              <div className="mt-4 flex-1"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${dayDiff(task.due) <= 0 ? 'bg-[#fbe9e4] text-[#9a4935]' : 'bg-[#f1f0e9] text-[#656b5f]'}`}>{dueLabel(task.due)}</span></div>
              <button onClick={() => toggleDone(task.id)} className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#254c38] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#1b3d2b]"><Check size={16}/> Mark complete</button>
            </div>)}
          </div> : <div className="mt-5 rounded-2xl bg-white p-6 text-center"><CheckCircle2 className="mx-auto text-[#43845a]" size={28}/><p className="mt-2 font-semibold">You cleared your backlog.</p><p className="mt-1 text-sm text-[#697568]">Take a breath or add a new task when you're ready.</p></div>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/75 px-4 py-3"><div className="text-sm text-[#526552]"><strong>{pending.length}</strong> tasks remain · <strong>{formatMinutes(totalMinutes)}</strong> of estimated work</div><button onClick={() => { setAvailable(Math.max(15, available - 30)); setNotice('Available time reduced by 30 minutes. The schedule has been recalculated.') }} className="text-sm font-semibold text-[#326445] underline decoration-[#b3cbb0] underline-offset-4">I have 30 minutes less</button></div>
        </section>}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-[#e6e7df] bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold tracking-tight">Your task list</h2><p className="mt-1 text-sm text-[#7a8075]">Ranked by deadline, importance, and effort.</p></div><div className="flex rounded-lg bg-[#f4f5f0] p-1">{(['All','Open','Done'] as const).map(f => <button key={f} onClick={() => setFilter(f)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${filter === f ? 'bg-white text-[#254c38] shadow-sm' : 'text-[#777d73]'}`}>{f}</button>)}</div></div>
            <div className="mt-5 space-y-2">
              {visibleTasks.length ? visibleTasks.map((task, index) => <TaskRow key={task.id} task={task} rank={index + 1} onToggle={() => toggleDone(task.id)} onEdit={() => openEdit(task)} onDelete={() => deleteTask(task.id)}/>) : <div className="rounded-2xl border border-dashed border-[#dfe3d9] px-5 py-10 text-center"><ListTodo size={26} className="mx-auto text-[#9aa295]"/><p className="mt-3 font-medium">Nothing here yet</p><p className="mt-1 text-sm text-[#7a8075]">Add a task to give your day some structure.</p><button onClick={openNew} className="mt-4 text-sm font-semibold text-[#326445]">+ Add your first task</button></div>}
            </div>
            <button onClick={openNew} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#d5dbd0] py-3 text-sm font-semibold text-[#4f6654] transition hover:border-[#8bb393] hover:bg-[#f8faf6]"><Plus size={16}/> Add a task</button>
          </section>

          <section className="rounded-3xl border border-[#e6e7df] bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold tracking-tight">Today's plan</h2><p className="mt-1 text-sm text-[#7a8075]">A capacity-aware plan, not wishful thinking.</p></div><div className="rounded-xl bg-[#f1f4ed] p-2 text-[#4b6d4e]"><Clock3 size={18}/></div></div>
            <div className="mt-5 rounded-2xl bg-[#f7f8f4] p-4">
              <div className="flex items-center justify-between text-sm"><label htmlFor="capacity" className="font-medium">Available focus time</label><span className="font-semibold text-[#254c38]">{formatMinutes(available)}</span></div>
              <input id="capacity" type="range" min="30" max="480" step="15" value={available} onChange={e => setAvailable(Number(e.target.value))} className="mt-4 w-full accent-[#326445]"/>
              <div className="flex justify-between text-xs text-[#858b80]"><span>30 min</span><span>8 hours</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e2e6dc]"><div className="h-full rounded-full bg-[#4f8b5d] transition-all" style={{ width: `${Math.min(100, totalMinutes / available * 100)}%` }}/></div>
              <div className="mt-2 flex justify-between gap-2 text-xs"><span className="text-[#73796f]">{formatMinutes(Math.min(totalMinutes, available))} schedulable</span><span className={totalMinutes > available ? 'font-semibold text-[#a44c36]' : 'text-[#4b7d53]'}>{totalMinutes > available ? `${formatMinutes(totalMinutes - available)} won't fit` : 'Fits your capacity'}</span></div>
            </div>
            <div className="mt-5"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Suggested sequence</h3><span className="text-xs text-[#858b80]">{scheduled.blocks.length} blocks</span></div>
              {scheduled.blocks.length ? <div className="space-y-3">{scheduled.blocks.map(({ task, start, end }) => <div key={task.id} className="flex gap-3"><div className="flex w-14 shrink-0 flex-col items-center"><span className="text-xs font-semibold text-[#526552]">{formatClock(start)}</span><div className="my-1 w-px flex-1 bg-[#e1e7dc]"/><span className="text-[10px] text-[#959b91]">{formatClock(end)}</span></div><div className="mb-1 min-w-0 flex-1 rounded-xl border border-[#e8ebe4] p-3"><div className="flex items-start gap-2"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#6c9a70]"/><div className="min-w-0 flex-1"><p className="text-sm font-medium leading-5">{task.title}</p><p className="mt-1 text-xs text-[#858b80]">{formatMinutes(task.minutes)} · {dueLabel(task.due)}</p></div><button aria-label={`Complete ${task.title}`} onClick={() => toggleDone(task.id)} className="rounded-md p-1 text-[#819080] hover:bg-[#edf5eb] hover:text-[#326445]"><CheckCircle2 size={17}/></button></div></div></div>)}</div> : <p className="rounded-xl bg-[#f7f8f4] p-4 text-sm text-[#7a8075]">No tasks fit this time window. Increase your capacity or choose a shorter next action.</p>}
              {scheduled.unscheduled.length > 0 && <div className="mt-3 rounded-xl border border-[#f0d8ce] bg-[#fff6f2] p-3"><div className="flex items-center gap-2 text-xs font-semibold text-[#9a4935]"><ArrowDownRight size={15}/>{scheduled.unscheduled.length} task{scheduled.unscheduled.length > 1 ? 's' : ''} won't fit today</div><ul className="mt-2 space-y-1 pl-5 text-xs text-[#875b4e]">{scheduled.unscheduled.map(t => <li key={t.id} className="list-disc">{t.title} · {formatMinutes(t.minutes)}</li>)}</ul><button onClick={() => setRecovery(true)} className="mt-3 text-xs font-semibold text-[#9a4935] underline underline-offset-4">Recover your plan</button></div>}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[#edf0e9] pt-4"><div><p className="text-sm font-semibold">Progress today</p><p className="mt-1 text-xs text-[#858b80]">{completed.length} of {tasks.length} tasks complete</p></div><div className="relative h-12 w-12"><svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90"><circle cx="18" cy="18" r="15.5" fill="none" stroke="#e8ebe4" strokeWidth="3"/><circle cx="18" cy="18" r="15.5" fill="none" stroke="#4f8b5d" strokeWidth="3" strokeDasharray={`${tasks.length ? completed.length / tasks.length * 97.4 : 0} 97.4`} strokeLinecap="round"/></svg><span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{tasks.length ? Math.round(completed.length / tasks.length * 100) : 0}%</span></div></div>
          </section>
        </div>
        <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-[#e4e6de] pt-5 text-xs text-[#858b80] sm:flex-row sm:items-center"><p>FocusForge · A next-step planner for overwhelmed students.</p><div className="flex flex-wrap items-center gap-4"><span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#6c9a70]"/> Saved on this device</span><button onClick={resetDemo} className="inline-flex items-center gap-1.5 font-medium hover:text-[#254c38]"><RotateCcw size={13}/> Reset demo tasks</button></div></footer>
      </main>

      {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#15251b]/40 p-4" onMouseDown={e => { if (e.target === e.currentTarget) setShowForm(false) }}><div role="dialog" aria-modal="true" aria-labelledby="task-form-title" className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-7"><div className="flex items-start justify-between"><div><h2 id="task-form-title" className="text-xl font-semibold">{editingId ? 'Edit task' : 'Add a task'}</h2><p className="mt-1 text-sm text-[#7a8075]">Make it specific, then let FocusForge help with the order.</p></div><button onClick={() => setShowForm(false)} aria-label="Close form" className="rounded-lg p-2 text-[#73796f] hover:bg-[#f2f4ef]"><X size={18}/></button></div><form onSubmit={submitTask} className="mt-6 space-y-4"><div><label htmlFor="title" className="mb-1.5 block text-sm font-medium">Task title</label><input autoFocus id="title" value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Finish lab report introduction" maxLength={120} required className="w-full rounded-xl border border-[#dfe3d9] px-3.5 py-3 text-sm outline-none focus:border-[#6d9b76]"/></div><div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="due" className="mb-1.5 block text-sm font-medium">Deadline</label><input id="due" type="date" value={draft.due} onChange={e => setDraft({ ...draft, due: e.target.value })} required className="w-full rounded-xl border border-[#dfe3d9] px-3 py-3 text-sm"/></div><div><label htmlFor="minutes" className="mb-1.5 block text-sm font-medium">Estimated minutes</label><input id="minutes" type="number" min="5" max="1440" step="5" value={draft.minutes} onChange={e => setDraft({ ...draft, minutes: e.target.value })} required className="w-full rounded-xl border border-[#dfe3d9] px-3 py-3 text-sm"/></div></div><div><label htmlFor="priority" className="mb-1.5 block text-sm font-medium">Importance</label><select id="priority" value={draft.priority} onChange={e => setDraft({ ...draft, priority: e.target.value as Priority })} className="w-full rounded-xl border border-[#dfe3d9] px-3 py-3 text-sm"><option>High</option><option>Medium</option><option>Low</option></select></div><p className="rounded-xl bg-[#f5f7f2] p-3 text-xs leading-5 text-[#73796f]">FocusForge will rank this task using its deadline, importance, and estimated duration. You can change any detail later.</p><div className="flex gap-3 pt-1"><button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-xl border border-[#dfe3d9] px-4 py-3 text-sm font-semibold">Cancel</button><button type="submit" className="flex-1 rounded-xl bg-[#254c38] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1b3d2b]">{editingId ? 'Save changes' : 'Add task'}</button></div></form></div></div>}
    </div>
  )
}

function Metric({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint: string }) {
  return <div className="rounded-2xl border border-[#e6e7df] bg-white p-4 sm:p-5"><div className="flex items-center gap-2 text-[#6d786b]">{icon}<span className="text-xs font-medium">{label}</span></div><div className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">{value}</div><div className="mt-1 text-xs text-[#858b80]">{hint}</div></div>
}
function TaskRow({ task, rank, onToggle, onEdit, onDelete }: { task: Task; rank: number; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  const days = dayDiff(task.due)
  return <div className={`group flex gap-3 rounded-2xl border p-3 transition hover:border-[#d0d9cb] sm:p-3.5 ${task.done ? 'border-[#edf0e9] bg-[#fafbf9]' : 'border-[#e9ebe5] bg-white'}`}>
    <button onClick={onToggle} aria-label={task.done ? `Reopen ${task.title}` : `Complete ${task.title}`} className={`mt-0.5 shrink-0 ${task.done ? 'text-[#4f8b5d]' : 'text-[#a2aaa0] hover:text-[#4f8b5d]'}`}>{task.done ? <CheckCircle2 size={21}/> : <Circle size={21}/>}</button>
    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${task.priority === 'High' ? 'bg-[#fbe9e4] text-[#a44c36]' : task.priority === 'Medium' ? 'bg-[#fbf1d8] text-[#8b6b22]' : 'bg-[#edf0e9] text-[#687361]'}`}>{task.priority}</span>{!task.done && <span className="text-[10px] font-medium text-[#8b9187]">#{rank} priority</span>}</div><p className={`mt-1.5 break-words text-sm font-semibold leading-5 ${task.done ? 'text-[#8a9086] line-through' : 'text-[#292e28]'}`}>{task.title}</p><div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#858b80]"><span className="inline-flex items-center gap-1"><Clock3 size={12}/>{formatMinutes(task.minutes)}</span><span className={`inline-flex items-center gap-1 ${!task.done && days <= 0 ? 'font-semibold text-[#a44c36]' : ''}`}><span className="h-1 w-1 rounded-full bg-current"/>{dueLabel(task.due)}</span></div><p className="mt-2 text-[11px] leading-4 text-[#8a9086]">{explain(task)}</p></div>
    <div className="flex shrink-0 flex-col gap-1 opacity-100 sm:opacity-0 sm:transition group-hover:opacity-100 group-focus-within:opacity-100"><button onClick={onEdit} aria-label={`Edit ${task.title}`} className="rounded-lg p-2 text-[#7b8378] hover:bg-[#f0f3ed] hover:text-[#254c38]"><span className="text-xs font-semibold">Edit</span></button><button onClick={onDelete} aria-label={`Delete ${task.title}`} className="rounded-lg p-2 text-[#9a8078] hover:bg-[#fff0eb] hover:text-[#a44c36]"><Trash2 size={15}/></button></div>
  </div>
}
function formatClock(offset: number) {
  const d = new Date()
  d.setHours(9, 0, 0, 0)
  d.setMinutes(d.getMinutes() + offset)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}
