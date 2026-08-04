import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { toLocalDateStr, formatDateHuman } from '../lib/helpers.js'

function startOfWeek(d) {
  const dt = new Date(d)
  const day = dt.getDay() // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day // week starts Monday
  dt.setDate(dt.getDate() + diff)
  return dt
}

export default function SVReport() {
  const { user } = useAuth()
  const [range, setRange] = useState('week') // 'week' | 'month'
  const [anchor, setAnchor] = useState(new Date())
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  const { rangeStart, rangeEnd, days } = useMemo(() => {
    let start, end
    if (range === 'week') {
      start = startOfWeek(anchor)
      end = new Date(start)
      end.setDate(end.getDate() + 6)
    } else {
      start = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
      end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
    }
    const list = []
    const cur = new Date(start)
    while (cur <= end) {
      list.push(toLocalDateStr(cur))
      cur.setDate(cur.getDate() + 1)
    }
    return { rangeStart: start, rangeEnd: end, days: list }
  }, [range, anchor])

  const load = useCallback(async () => {
    setLoading(true)
    // Fetch broadly and bucket client-side — keeps the query simple and
    // robust; volumes for a single agent's activity log are small.
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', user.id)
      .in('stage_at_time', ['sv_scheduled', 'sv_done'])
      .order('created_at', { ascending: false })
      .limit(2000)
    setActivities(data || [])
    setLoading(false)
  }, [user.id])

  useEffect(() => {
    load()
  }, [load])

  const byDay = useMemo(() => {
    const map = {}
    days.forEach((d) => (map[d] = { scheduled: 0, done: 0 }))
    activities.forEach((a) => {
      if (a.stage_at_time === 'sv_scheduled' && a.followup_date && map[a.followup_date]) {
        map[a.followup_date].scheduled++
      }
      if (a.stage_at_time === 'sv_done') {
        const d = toLocalDateStr(a.created_at)
        if (map[d]) map[d].done++
      }
    })
    return map
  }, [activities, days])

  const totals = useMemo(() => {
    let scheduled = 0,
      done = 0
    Object.values(byDay).forEach((v) => {
      scheduled += v.scheduled
      done += v.done
    })
    return { scheduled, done }
  }, [byDay])

  function shift(delta) {
    const d = new Date(anchor)
    if (range === 'week') d.setDate(d.getDate() + delta * 7)
    else d.setMonth(d.getMonth() + delta)
    setAnchor(d)
  }

  const label =
    range === 'week'
      ? `${formatDateHuman(toLocalDateStr(rangeStart))} – ${formatDateHuman(toLocalDateStr(rangeEnd))}`
      : anchor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  return (
    <div>
      <TopBar title="Site Visit Report" subtitle="Scheduled vs. completed" />

      <div className="px-4 flex items-center gap-2 mb-3">
        <div className="flex bg-white rounded-full border border-line p-0.5">
          <button onClick={() => setRange('week')} className={`press px-3 py-1.5 rounded-full text-xs font-semibold ${range === 'week' ? 'bg-ink text-white' : 'text-muted'}`}>
            Week
          </button>
          <button onClick={() => setRange('month')} className={`press px-3 py-1.5 rounded-full text-xs font-semibold ${range === 'month' ? 'bg-ink text-white' : 'text-muted'}`}>
            Month
          </button>
        </div>
        <button onClick={() => shift(-1)} className="press h-8 w-8 rounded-full bg-white border border-line text-sm">
          ‹
        </button>
        <p className="text-xs font-semibold text-muted flex-1 text-center">{label}</p>
        <button onClick={() => shift(1)} className="press h-8 w-8 rounded-full bg-white border border-line text-sm">
          ›
        </button>
      </div>

      <div className="px-4 grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-2xl border border-line/60 shadow-card p-4">
          <p className="text-[28px] font-bold text-purple leading-none">{totals.scheduled}</p>
          <p className="text-xs text-muted font-medium mt-1.5">SV Scheduled</p>
        </div>
        <div className="bg-white rounded-2xl border border-line/60 shadow-card p-4">
          <p className="text-[28px] font-bold text-teal leading-none">{totals.done}</p>
          <p className="text-xs text-muted font-medium mt-1.5">SV Done</p>
          <p className="text-[10px] text-muted mt-0.5">
            {totals.scheduled ? `${Math.round((totals.done / totals.scheduled) * 100)}% completion` : '—'}
          </p>
        </div>
      </div>

      <div className="px-4 pb-8">
        {loading && <p className="text-center text-muted text-sm py-10">Loading…</p>}
        {!loading && (
          <div className="bg-white rounded-2xl border border-line/60 shadow-card divide-y divide-line overflow-hidden">
            {days.map((d) => {
              const v = byDay[d]
              const isToday = d === toLocalDateStr(new Date())
              if (v.scheduled === 0 && v.done === 0 && range === 'month') return null
              return (
                <div key={d} className={`flex items-center justify-between px-4 py-3 ${isToday ? 'bg-accent/5' : ''}`}>
                  <span className={`text-sm ${isToday ? 'font-semibold text-accent' : ''}`}>{formatDateHuman(d)}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-purple font-semibold">{v.scheduled} sched.</span>
                    <span className="text-teal font-semibold">{v.done} done</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
