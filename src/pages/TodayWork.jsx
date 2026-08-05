import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'
import TopBar from '../components/TopBar.jsx'
import RingProgress from '../components/RingProgress.jsx'
import LeadCard from '../components/LeadCard.jsx'
import FollowUpSheet from '../components/FollowUpSheet.jsx'
import { IconFire } from '../components/Icons.jsx'
import { todayStr, localDayBoundsUTC } from '../lib/helpers.js'

export default function TodayWork() {
  const { user, profile } = useAuth()
  const [leads, setLeads] = useState([])
  const [doneLeadIds, setDoneLeadIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [activeLead, setActiveLead] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const today = todayStr()
    const { startISO, endISO } = localDayBoundsUTC(today)

    const { data: due } = await supabase
      .from('leads')
      .select('*')
      .eq('assigned_to', user.id)
      .lte('next_followup_date', today)
      .not('status', 'in', '("won","lost")')
      .order('next_followup_date', { ascending: true })

    const { data: todaysActivities } = await supabase
      .from('activities')
      .select('lead_id')
      .eq('user_id', user.id)
      .gte('created_at', startISO)
      .lte('created_at', endISO)

    setLeads(due || [])
    setDoneLeadIds(new Set((todaysActivities || []).map((a) => a.lead_id)))
    setLoading(false)
  }, [user.id])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (leads.length === 0 && doneLeadIds.size > 0) {
      updateStreak()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads.length])

  async function updateStreak() {
    const today = todayStr()
    if (!profile || profile.last_completed_date === today) return
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const newStreak = profile.last_completed_date === yesterday ? (profile.streak_count || 0) + 1 : 1
    await supabase.from('profiles').update({ streak_count: newStreak, last_completed_date: today }).eq('id', user.id)
  }

  const doneToday = doneLeadIds.size
  // Leads still pending today, minus any that were already logged today
  // (covers the case where a lead's next follow-up got set back to today).
  const pendingLeads = leads.filter((l) => !doneLeadIds.has(l.id))
  const total = pendingLeads.length + doneToday
  const overdueCount = pendingLeads.filter((l) => l.next_followup_date < todayStr()).length

  return (
    <div>
      <TopBar
        title="Today's Work"
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
      />

      <div className="px-4 mt-2">
        <div className="bg-white rounded-2xl shadow-card border border-line/60 p-5 flex items-center gap-5">
          <RingProgress done={doneToday} total={Math.max(total, doneToday)} />
          <div className="flex-1">
            {pendingLeads.length === 0 ? (
              <>
                <p className="font-semibold text-[17px]">All clear 🎉</p>
                <p className="text-sm text-muted mt-0.5">Every follow-up for today is logged.</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-[17px]">{pendingLeads.length} to go</p>
                <p className="text-sm text-muted mt-0.5">
                  {overdueCount > 0 ? `${overdueCount} overdue — clear these first.` : 'All due today. Let\u2019s go.'}
                </p>
              </>
            )}
            {profile?.streak_count > 0 && (
              <div className="flex items-center gap-1 mt-2 text-warning text-xs font-semibold">
                <IconFire size={14} />
                {profile.streak_count} day streak
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 mt-5 space-y-3">
        {loading && <p className="text-center text-muted text-sm py-10">Loading today's list…</p>}
        {!loading && pendingLeads.length === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">✅</p>
            <p className="font-semibold">Nothing pending right now</p>
            <p className="text-sm text-muted mt-1">New follow-ups will show up here the moment they're due.</p>
          </div>
        )}
        {pendingLeads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onLogClick={setActiveLead} />
        ))}
      </div>

      <FollowUpSheet lead={activeLead} open={!!activeLead} onClose={() => setActiveLead(null)} onSaved={load} />
    </div>
  )
}
