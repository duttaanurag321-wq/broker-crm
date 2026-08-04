import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'
import TopBar from '../components/TopBar.jsx'
import LeadCard from '../components/LeadCard.jsx'
import { STAGES } from '../lib/constants.js'

export default function Pipeline() {
  const { user } = useAuth()
  const [leads, setLeads] = useState([])
  const [activeStage, setActiveStage] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('assigned_to', user.id)
      .order('updated_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }, [user.id])

  useEffect(() => {
    load()
  }, [load])

  const counts = useMemo(() => {
    const c = { all: leads.length }
    STAGES.forEach((s) => (c[s.key] = leads.filter((l) => l.status === s.key).length))
    return c
  }, [leads])

  const filtered = activeStage === 'all' ? leads : leads.filter((l) => l.status === activeStage)

  return (
    <div>
      <TopBar title="Pipeline" subtitle={`${leads.length} total leads`} />

      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        <Chip label="All" count={counts.all} active={activeStage === 'all'} onClick={() => setActiveStage('all')} />
        {STAGES.map((s) => (
          <Chip
            key={s.key}
            label={s.label}
            count={counts[s.key] || 0}
            color={s.color}
            active={activeStage === s.key}
            onClick={() => setActiveStage(s.key)}
          />
        ))}
      </div>

      <div className="px-4 space-y-3 pb-4">
        {loading && <p className="text-center text-muted text-sm py-10">Loading pipeline…</p>}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted text-sm py-14">No leads in this stage yet.</p>
        )}
        {filtered.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </div>
    </div>
  )
}

function Chip({ label, count, active, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`press flex-shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold border ${
        active ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-line'
      }`}
    >
      {label} <span className={active ? 'opacity-70' : 'text-muted'}>{count}</span>
    </button>
  )
}
