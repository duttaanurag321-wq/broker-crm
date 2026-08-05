import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { CALL_OUTCOMES } from '../lib/constants.js'
import { todayStr, formatDateHuman, localDayBoundsUTC } from '../lib/helpers.js'
import { IconReports } from '../components/Icons.jsx'

export default function DailyReport() {
  const { user } = useAuth()
  const [date, setDate] = useState(todayStr())
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { startISO, endISO } = localDayBoundsUTC(date)

    const [{ data: acts }, { data: newLeads }] = await Promise.all([
      supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startISO)
        .lte('created_at', endISO)
        .order('created_at', { ascending: true }),
      supabase.from('leads').select('id').eq('assigned_to', user.id).gte('created_at', startISO).lte('created_at', endISO)
    ])

    const calls = (acts || []).filter((a) => a.type === 'call')

    // A lead called 2-3 times in one day should count once, with its
    // latest outcome for the day — the report reflects leads, not calls.
    const latestPerLead = new Map()
    calls.forEach((a) => latestPerLead.set(a.lead_id, a)) // acts sorted ascending, so last write wins = latest

    const outcomeCounts = {}
    CALL_OUTCOMES.forEach((o) => (outcomeCounts[o.key] = 0))
    latestPerLead.forEach((a) => {
      if (a.call_outcome && outcomeCounts[a.call_outcome] !== undefined) outcomeCounts[a.call_outcome]++
    })
    const answered = latestPerLead.size - outcomeCounts.NP - outcomeCounts.NR - outcomeCounts.OFF

    const stageMoves = (key) => (acts || []).filter((a) => a.stage_at_time === key).length

    setStats({
      totalLeadsContacted: latestPerLead.size,
      answered,
      totalLeads: (newLeads || []).length,
      outcomeCounts,
      svScheduled: stageMoves('sv_scheduled'),
      svDone: stageMoves('sv_done'),
      negoScheduled: stageMoves('negotiation_scheduled'),
      negoDone: stageMoves('negotiation_done'),
      loginProcess: stageMoves('login_process'),
      won: stageMoves('won'),
      lost: stageMoves('lost')
    })
    setLoading(false)
  }, [user.id, date])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <TopBar title="Daily Report" subtitle={formatDateHuman(date)} />

      <div className="px-4 flex items-center gap-2 mb-4">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayStr()} className="rounded-xl border border-line bg-white px-3 py-2 text-sm" />
        <button onClick={() => setDate(todayStr())} className="press text-xs font-semibold text-accent px-2">
          Today
        </button>
        <Link to="/reports/sv" className="press ml-auto text-xs font-semibold text-accent flex items-center gap-1">
          <IconReports size={14} /> SV Report
        </Link>
      </div>

      {loading || !stats ? (
        <p className="text-center text-muted text-sm py-14">Crunching the numbers…</p>
      ) : (
        <div className="px-4 space-y-4 pb-8">
          <div className="grid grid-cols-2 gap-3">
            <Stat label="Leads called" value={stats.totalLeadsContacted} color="#0071E3" />
            <Stat
              label="Answered"
              value={stats.answered}
              color="#34C759"
              sub={stats.totalLeadsContacted ? `${Math.round((stats.answered / stats.totalLeadsContacted) * 100)}% connect rate` : null}
            />
            <Stat label="New leads received" value={stats.totalLeads} color="#5E5CE6" />
            <Stat label="Won today" value={stats.won} color="#34C759" />
          </div>

          <Section title="Leads by outcome">
            <div className="grid grid-cols-3 gap-2">
              {CALL_OUTCOMES.map((o) => (
                <div key={o.key} className="bg-white rounded-xl border border-line/60 py-3 text-center">
                  <p className="text-lg font-bold" style={{ color: o.color }}>
                    {stats.outcomeCounts[o.key]}
                  </p>
                  <p className="text-[10px] text-muted font-medium mt-0.5">{o.key}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Pipeline movement today">
            <div className="bg-white rounded-2xl border border-line/60 shadow-card divide-y divide-line">
              <MoveRow label="SV Scheduled" value={stats.svScheduled} />
              <MoveRow label="SV Done" value={stats.svDone} />
              <MoveRow label="Negotiation Scheduled" value={stats.negoScheduled} />
              <MoveRow label="Negotiation Done" value={stats.negoDone} />
              <MoveRow label="Login Process" value={stats.loginProcess} />
              <MoveRow label="Won" value={stats.won} highlight="success" />
              <MoveRow label="Lost" value={stats.lost} highlight="danger" />
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-line/60 shadow-card p-4">
      <p className="text-[28px] font-bold leading-none" style={{ color }}>
        {value}
      </p>
      <p className="text-xs text-muted font-medium mt-1.5">{label}</p>
      {sub && <p className="text-[10px] text-muted mt-0.5">{sub}</p>}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-sm font-semibold mb-2">{title}</p>
      {children}
    </div>
  )
}

function MoveRow({ label, value, highlight }) {
  const color = highlight === 'success' ? 'text-success' : highlight === 'danger' ? 'text-danger' : 'text-ink'
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  )
}
