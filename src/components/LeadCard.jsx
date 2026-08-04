import { useNavigate } from 'react-router-dom'
import { StagePill, OutcomePill } from './Pills.jsx'
import { IconWhatsapp, IconCall, IconCalendar } from './Icons.jsx'
import { displayPhone, whatsappLink, telLink, formatDateHuman, formatTime, budgetRange } from '../lib/helpers.js'

export default function LeadCard({ lead, onLogClick, showFollowUp = true }) {
  const navigate = useNavigate()
  const overdue = lead.next_followup_date && lead.next_followup_date < new Date().toISOString().slice(0, 10)

  return (
    <div
      className="bg-white rounded-2xl shadow-card border border-line/60 p-4 press cursor-pointer"
      onClick={() => navigate(`/leads/${lead.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-[15px] truncate">{lead.name}</p>
          <p className="text-sm text-muted">{displayPhone(lead.phone)}</p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <a
            href={telLink(lead.phone)}
            onClick={(e) => e.stopPropagation()}
            className="press h-9 w-9 rounded-full bg-accent/10 text-accent flex items-center justify-center"
          >
            <IconCall size={17} />
          </a>
          <a
            href={whatsappLink(lead.phone, `Hi ${lead.name?.split(' ')[0] || ''}, `)}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="press h-9 w-9 rounded-full bg-success/10 text-success flex items-center justify-center"
          >
            <IconWhatsapp size={16} />
          </a>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
        <StagePill stage={lead.status} />
        <OutcomePill code={lead.call_status} />
        {lead.budget_min || lead.budget_max ? (
          <span className="text-[11px] text-muted font-medium">{budgetRange(lead.budget_min, lead.budget_max)}</span>
        ) : null}
      </div>

      {showFollowUp && lead.next_followup_date && (
        <div
          className={`flex items-center gap-1.5 mt-3 pt-3 border-t border-line text-xs font-medium ${
            overdue ? 'text-danger' : 'text-muted'
          }`}
        >
          <IconCalendar size={14} />
          <span>
            Follow up {formatDateHuman(lead.next_followup_date)}
            {lead.next_followup_time ? ` · ${formatTime(lead.next_followup_time)}` : ''}
          </span>
          {lead.next_action && <span className="truncate">— {lead.next_action}</span>}
        </div>
      )}

      {onLogClick && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onLogClick(lead)
          }}
          className="press mt-3 w-full py-2.5 rounded-xl bg-accent text-white text-sm font-semibold"
        >
          Log call & follow-up
        </button>
      )}
    </div>
  )
}
