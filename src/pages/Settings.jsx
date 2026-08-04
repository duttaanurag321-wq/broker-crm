import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import TopBar from '../components/TopBar.jsx'
import { IconFire } from '../components/Icons.jsx'

export default function Settings() {
  const { user, profile, signOut } = useAuth()
  const [totals, setTotals] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .then(({ count }) => setTotals((t) => ({ ...t, leads: count || 0 })))
    supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_to', user.id)
      .eq('status', 'won')
      .then(({ count }) => setTotals((t) => ({ ...t, won: count || 0 })))
  }, [user])

  return (
    <div>
      <TopBar title="Settings" />

      <div className="px-4 space-y-4">
        <div className="bg-white rounded-2xl border border-line/60 shadow-card p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-accent flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {(profile?.full_name || user?.email || '?')[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[16px] truncate">{profile?.full_name || 'Agent'}</p>
            <p className="text-sm text-muted truncate">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat label="Total leads" value={totals?.leads ?? '—'} />
          <Stat label="Deals won" value={totals?.won ?? '—'} />
          <Stat
            label="Streak"
            value={
              <span className="flex items-center gap-1 justify-center text-warning">
                <IconFire size={16} /> {profile?.streak_count || 0}
              </span>
            }
          />
        </div>

        <div className="bg-white rounded-2xl border border-line/60 shadow-card divide-y divide-line overflow-hidden">
          <SettingsRow label="Full name" value={profile?.full_name || '—'} />
          <SettingsRow label="Role" value={profile?.role === 'admin' ? 'Admin' : 'Agent'} />
        </div>

        <div className="bg-white rounded-2xl border border-line/60 shadow-card p-4">
          <p className="text-sm font-semibold mb-1">Adding teammates</p>
          <p className="text-xs text-muted leading-relaxed">
            New agents create their own account from the sign-in screen. To make someone an admin (able to see all
            leads, not just their own), update their role in the Supabase Table Editor under the{' '}
            <code className="bg-base px-1 rounded">profiles</code> table.
          </p>
        </div>

        <button onClick={signOut} className="press w-full py-3.5 rounded-xl bg-white border border-line text-danger font-semibold">
          Sign out
        </button>

        <p className="text-center text-xs text-muted pb-6">Broker CRM · built for the field, not the boardroom</p>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border border-line/60 shadow-card p-3.5 text-center">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[10px] text-muted font-medium mt-1">{label}</p>
    </div>
  )
}

function SettingsRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
