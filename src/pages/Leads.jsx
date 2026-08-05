import { useEffect, useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'
import TopBar from '../components/TopBar.jsx'
import LeadCard from '../components/LeadCard.jsx'
import { IconPlus, IconUpload, IconSearch } from '../components/Icons.jsx'

export default function Leads() {
  const { user } = useAuth()
  const [leads, setLeads] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('assigned_to', user.id)
      .not('status', 'in', '("won","lost")')
      .order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }, [user.id])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    if (!query.trim()) return leads
    const q = query.toLowerCase()
    return leads.filter(
      (l) => l.name?.toLowerCase().includes(q) || l.phone?.includes(q) || l.location_preference?.toLowerCase().includes(q)
    )
  }, [leads, query])

  return (
    <div>
      <TopBar
        title="Leads"
        subtitle={`${leads.length} total`}
        right={
          <div className="flex gap-2">
            <Link to="/leads/upload" className="press h-10 w-10 rounded-full bg-white border border-line flex items-center justify-center text-ink shadow-card">
              <IconUpload size={18} />
            </Link>
            <Link to="/leads/new" className="press h-10 w-10 rounded-full bg-accent flex items-center justify-center text-white shadow-pop">
              <IconPlus size={20} />
            </Link>
          </div>
        }
      />

      <div className="px-4 mt-2 mb-3">
        <div className="flex items-center gap-2 bg-white rounded-xl border border-line px-3 py-2.5">
          <IconSearch size={17} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, location"
            className="flex-1 text-sm outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="px-4 space-y-3 pb-4">
        {loading && <p className="text-center text-muted text-sm py-10">Loading leads…</p>}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">📋</p>
            <p className="font-semibold">{leads.length === 0 ? 'No leads yet' : 'No matches'}</p>
            <p className="text-sm text-muted mt-1">
              {leads.length === 0 ? 'Add your first lead or bulk upload from a sheet.' : 'Try a different search.'}
            </p>
          </div>
        )}
        {filtered.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
        {!loading && leads.length > 0 && (
          <p className="text-center text-[11px] text-muted pt-2 pb-4">Won and Lost leads are kept out of this list — nothing is deleted.</p>
        )}
      </div>
    </div>
  )
}
