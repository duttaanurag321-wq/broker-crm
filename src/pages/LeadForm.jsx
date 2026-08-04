import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { LEAD_SOURCES, PROPERTY_TYPES } from '../lib/constants.js'
import { normalizeIndianPhone, todayStr } from '../lib/helpers.js'

const empty = {
  name: '',
  phone: '',
  source: LEAD_SOURCES[0],
  property_type: PROPERTY_TYPES[0],
  budget_min: '',
  budget_max: '',
  location_preference: '',
  notes: '',
  next_action: 'Make first call',
  next_followup_date: todayStr(),
  next_followup_time: ''
}

export default function LeadForm() {
  const { id } = useParams()
  const editing = !!id
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editing) return
    supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setForm({ ...empty, ...data })
      })
  }, [id, editing])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Name is required.')
    if (!form.phone.trim()) return setError('Phone number is required.')
    if (!form.next_followup_date) return setError('A first follow-up date is required for every lead.')

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        phone: normalizeIndianPhone(form.phone),
        source: form.source,
        property_type: form.property_type,
        budget_min: form.budget_min || null,
        budget_max: form.budget_max || null,
        location_preference: form.location_preference || null,
        notes: form.notes || null,
        next_action: form.next_action || 'Make first call',
        next_followup_date: form.next_followup_date,
        next_followup_time: form.next_followup_time || null
      }

      if (editing) {
        const { error } = await supabase.from('leads').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id)
        if (error) throw error
        navigate(`/leads/${id}`)
      } else {
        const { data, error } = await supabase
          .from('leads')
          .insert({ ...payload, status: 'new', created_by: user.id, assigned_to: user.id })
          .select()
          .single()
        if (error) throw error
        navigate(`/leads/${data.id}`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <TopBar title={editing ? 'Edit Lead' : 'New Lead'} back />
      <form onSubmit={handleSubmit} className="px-4 mt-2 space-y-4 pb-10">
        <Field label="Name">
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className="input" placeholder="Full name" />
        </Field>
        <Field label="Phone (India)">
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="input" placeholder="98765 43210" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Source">
            <select value={form.source} onChange={(e) => set('source', e.target.value)} className="input">
              {LEAD_SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Property type">
            <select value={form.property_type} onChange={(e) => set('property_type', e.target.value)} className="input">
              {PROPERTY_TYPES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Budget min (₹)">
            <input type="number" value={form.budget_min} onChange={(e) => set('budget_min', e.target.value)} className="input" placeholder="4000000" />
          </Field>
          <Field label="Budget max (₹)">
            <input type="number" value={form.budget_max} onChange={(e) => set('budget_max', e.target.value)} className="input" placeholder="5500000" />
          </Field>
        </div>
        <Field label="Location preference">
          <input value={form.location_preference} onChange={(e) => set('location_preference', e.target.value)} className="input" placeholder="Sevoke Road, Siliguri" />
        </Field>
        <Field label="Notes">
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} className="input" placeholder="Anything relevant about this lead" />
        </Field>

        <div className="bg-white rounded-2xl border border-line p-4">
          <p className="text-sm font-semibold mb-3">First follow-up (required)</p>
          <Field label="Next action">
            <input value={form.next_action} onChange={(e) => set('next_action', e.target.value)} className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Field label="Date">
              <input type="date" value={form.next_followup_date} onChange={(e) => set('next_followup_date', e.target.value)} className="input" />
            </Field>
            <Field label="Time (optional)">
              <input type="time" value={form.next_followup_time} onChange={(e) => set('next_followup_time', e.target.value)} className="input" />
            </Field>
          </div>
        </div>

        {error && <p className="text-sm text-danger font-medium">{error}</p>}

        <button type="submit" disabled={saving} className="press w-full py-3.5 rounded-xl bg-accent text-white font-semibold disabled:opacity-50">
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Add lead'}
        </button>
      </form>

      <style>{`.input { width:100%; border-radius: 0.75rem; border: 1px solid #E5E5EA; padding: 0.65rem 0.85rem; font-size: 0.9rem; background: #F5F5F7; }`}</style>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}
