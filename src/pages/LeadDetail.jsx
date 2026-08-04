import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import TopBar from '../components/TopBar.jsx'
import { StagePill, OutcomePill } from '../components/Pills.jsx'
import FollowUpSheet from '../components/FollowUpSheet.jsx'
import { IconWhatsapp, IconCall, IconCalendar } from '../components/Icons.jsx'
import {
  displayPhone,
  whatsappLink,
  telLink,
  formatDateHuman,
  formatTime,
  budgetRange,
  formatINR
} from '../lib/helpers.js'

export default function LeadDetail() {
  const { id } = useParams()
  const [lead, setLead] = useState(null)
  const [activities, setActivities] = useState([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: leadData }, { data: acts }] = await Promise.all([
      supabase.from('leads').select('*').eq('id', id).single(),
      supabase.from('activities').select('*').eq('lead_id', id).order('created_at', { ascending: false })
    ])
    setLead(leadData)
    setActivities(acts || [])
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading || !lead) {
    return (
      <div>
        <TopBar title="Lead" back />
        <p className="text-center text-muted text-sm py-14">Loading…</p>
      </div>
    )
  }

  return (
    <div>
      <TopBar
        title={lead.name}
        back
        right={
          <Link to={`/leads/${id}/edit`} className="text-accent text-sm font-semibold press">
            Edit
          </Link>
        }
      />

      <div className="px-4 space-y-4">
        <div className="flex gap-2">
          <a href={telLink(lead.phone)} className="press flex-1 py-3 rounded-xl bg-accent text-white text-sm font-semibold flex items-center justify-center gap-2">
            <IconCall size={16} /> Call
          </a>
          <a
            href={whatsappLink(lead.phone, `Hi ${lead.name.split(' ')[0]}, `)}
            target="_blank"
            rel="noreferrer"
            className="press flex-1 py-3 rounded-xl bg-success text-white text-sm font-semibold flex items-center justify-center gap-2"
          >
            <IconWhatsapp size={16} /> WhatsApp
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-line/60 shadow-card p-4 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StagePill stage={lead.status} size="lg" />
            <OutcomePill code={lead.call_status} size="lg" />
          </div>
          <Row label="Phone" value={displayPhone(lead.phone)} />
          <Row label="Source" value={lead.source} />
          <Row label="Property type" value={lead.property_type} />
          <Row label="Budget" value={budgetRange(lead.budget_min, lead.budget_max)} sub={lead.budget_min || lead.budget_max ? `${formatINR(lead.budget_min)} – ${formatINR(lead.budget_max)}` : null} />
          <Row label="Location" value={lead.location_preference || '—'} />
          {lead.notes && <Row label="Notes" value={lead.notes} />}
        </div>

        <div className="bg-white rounded-2xl border border-line/60 shadow-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold mb-1">
            <IconCalendar size={16} className="text-accent" />
            Next follow-up
          </div>
          {lead.next_followup_date ? (
            <>
              <p className="text-[15px] font-medium mt-1">
                {formatDateHuman(lead.next_followup_date)}
                {lead.next_followup_time ? ` at ${formatTime(lead.next_followup_time)}` : ''}
              </p>
              <p className="text-sm text-muted mt-0.5">{lead.next_action}</p>
            </>
          ) : (
            <p className="text-sm text-muted mt-1">
              {lead.status === 'won' || lead.status === 'lost' ? 'Closed — no follow-up needed.' : 'No follow-up set.'}
            </p>
          )}
        </div>

        <button onClick={() => setSheetOpen(true)} className="press w-full py-3.5 rounded-xl bg-ink text-white font-semibold">
          Log call & update stage
        </button>

        <div>
          <p className="text-sm font-semibold mb-2 mt-2">Activity timeline</p>
          <div className="space-y-2 pb-8">
            {activities.length === 0 && <p className="text-sm text-muted py-6 text-center">No activity logged yet.</p>}
            {activities.map((a) => (
              <div key={a.id} className="bg-white rounded-xl border border-line/60 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {a.call_outcome && <OutcomePill code={a.call_outcome} />}
                    <span className="text-xs text-muted">
                      {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ·{' '}
                      {new Date(a.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                {a.next_action && <p className="text-sm mt-1.5">Next: {a.next_action}</p>}
                {a.followup_date && (
                  <p className="text-xs text-muted mt-0.5">
                    Follow up {formatDateHuman(a.followup_date)} {a.followup_time ? `· ${formatTime(a.followup_time)}` : ''}
                  </p>
                )}
                {a.notes && <p className="text-sm text-muted mt-1.5 italic">"{a.notes}"</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <FollowUpSheet lead={lead} open={sheetOpen} onClose={() => setSheetOpen(false)} onSaved={load} />
    </div>
  )
}

function Row({ label, value, sub }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted flex-shrink-0">{label}</span>
      <div className="text-right">
        <p className="font-medium">{value}</p>
        {sub && <p className="text-xs text-muted">{sub}</p>}
      </div>
    </div>
  )
}
