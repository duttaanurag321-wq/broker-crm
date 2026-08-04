import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Papa from 'papaparse'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/AuthContext.jsx'
import TopBar from '../components/TopBar.jsx'
import { normalizeIndianPhone, todayStr } from '../lib/helpers.js'

function guessField(headers, candidates) {
  const lower = headers.map((h) => h.toLowerCase().trim())
  for (const c of candidates) {
    const idx = lower.findIndex((h) => h.includes(c))
    if (idx !== -1) return headers[idx]
  }
  return null
}

export default function BulkUpload() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [mapping, setMapping] = useState(null)
  const [headers, setHeaders] = useState([])
  const [sheetUrl, setSheetUrl] = useState('')
  const [error, setError] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

  function handleParsed(data) {
    if (!data.length) {
      setError('No rows found in that file.')
      return
    }
    const hdrs = Object.keys(data[0])
    setHeaders(hdrs)
    setRows(data)
    setMapping({
      name: guessField(hdrs, ['name']),
      phone: guessField(hdrs, ['phone', 'mobile', 'contact']),
      budget_min: guessField(hdrs, ['budget min', 'min budget', 'budget_min']),
      budget_max: guessField(hdrs, ['budget max', 'max budget', 'budget_max', 'budget']),
      source: guessField(hdrs, ['source']),
      property_type: guessField(hdrs, ['property', 'type']),
      location_preference: guessField(hdrs, ['location', 'area', 'preference']),
      notes: guessField(hdrs, ['note', 'remark'])
    })
    setError('')
    setResult(null)
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => handleParsed(res.data)
    })
  }

  async function handleSheetImport() {
    setError('')
    if (!sheetUrl.trim()) return
    let csvUrl = sheetUrl.trim()
    // Convert a normal Google Sheets share link into its CSV export link.
    const m = csvUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    if (m && !csvUrl.includes('output=csv') && !csvUrl.includes('/pub')) {
      const gid = (csvUrl.match(/gid=([0-9]+)/) || [])[1] || '0'
      csvUrl = `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv&gid=${gid}`
    }
    try {
      const res = await fetch(csvUrl)
      if (!res.ok) throw new Error('Could not fetch that sheet. Make sure sharing is set to "Anyone with the link".')
      const text = await res.text()
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true })
      handleParsed(parsed.data)
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleImport() {
    if (!mapping?.name || !mapping?.phone) {
      setError('Map at least Name and Phone before importing.')
      return
    }
    setImporting(true)
    setError('')
    const today = todayStr()
    const payload = rows
      .map((r) => ({
        name: (r[mapping.name] || '').trim(),
        phone: normalizeIndianPhone(r[mapping.phone] || ''),
        budget_min: mapping.budget_min ? r[mapping.budget_min] || null : null,
        budget_max: mapping.budget_max ? r[mapping.budget_max] || null : null,
        source: mapping.source ? r[mapping.source] || 'Other' : 'Other',
        property_type: mapping.property_type ? r[mapping.property_type] || 'Apartment' : 'Apartment',
        location_preference: mapping.location_preference ? r[mapping.location_preference] || null : null,
        notes: mapping.notes ? r[mapping.notes] || null : null,
        status: 'new',
        next_action: 'Make first call',
        next_followup_date: today,
        created_by: user.id,
        assigned_to: user.id
      }))
      .filter((r) => r.name && r.phone)

    if (payload.length === 0) {
      setError('No valid rows to import — check your column mapping.')
      setImporting(false)
      return
    }

    const { error, count } = await supabase.from('leads').insert(payload, { count: 'exact' })
    setImporting(false)
    if (error) {
      setError(error.message)
      return
    }
    setResult({ imported: count ?? payload.length, skipped: rows.length - payload.length })
  }

  return (
    <div>
      <TopBar title="Bulk Upload" back />

      <div className="px-4 space-y-5 pb-10">
        <div className="bg-white rounded-2xl border border-line/60 shadow-card p-4">
          <p className="text-sm font-semibold mb-2">Option 1 — Upload a CSV file</p>
          <p className="text-xs text-muted mb-3">Export your Google Sheet as CSV (File → Download → .csv) and upload it here.</p>
          <label className="press block text-center py-3 rounded-xl border-2 border-dashed border-line text-sm font-medium text-accent cursor-pointer">
            Choose CSV file
            <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
          </label>
        </div>

        <div className="bg-white rounded-2xl border border-line/60 shadow-card p-4">
          <p className="text-sm font-semibold mb-2">Option 2 — Paste a Google Sheet link</p>
          <p className="text-xs text-muted mb-3">
            In Google Sheets: Share → "Anyone with the link" → Viewer. Then paste the link here — no download needed.
          </p>
          <div className="flex gap-2">
            <input
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="flex-1 rounded-xl border border-line px-3 py-2.5 text-sm bg-base"
            />
            <button onClick={handleSheetImport} className="press px-4 rounded-xl bg-ink text-white text-sm font-semibold">
              Fetch
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-danger font-medium">{error}</p>}

        {mapping && (
          <div className="bg-white rounded-2xl border border-line/60 shadow-card p-4 space-y-3">
            <p className="text-sm font-semibold">
              Map your columns <span className="text-muted font-normal">— {rows.length} rows found</span>
            </p>
            {[
              ['name', 'Name', true],
              ['phone', 'Phone', true],
              ['source', 'Source', false],
              ['property_type', 'Property type', false],
              ['budget_min', 'Budget min', false],
              ['budget_max', 'Budget max', false],
              ['location_preference', 'Location', false],
              ['notes', 'Notes', false]
            ].map(([key, label, required]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <span className="text-sm">
                  {label} {required && <span className="text-danger">*</span>}
                </span>
                <select
                  value={mapping[key] || ''}
                  onChange={(e) => setMapping((m) => ({ ...m, [key]: e.target.value || null }))}
                  className="rounded-lg border border-line px-2 py-1.5 text-xs bg-base max-w-[160px]"
                >
                  <option value="">— skip —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <button
              onClick={handleImport}
              disabled={importing}
              className="press w-full py-3 rounded-xl bg-accent text-white font-semibold disabled:opacity-50 mt-2"
            >
              {importing ? 'Importing…' : `Import ${rows.length} leads`}
            </button>
          </div>
        )}

        {result && (
          <div className="bg-success/10 rounded-2xl p-4 text-center">
            <p className="font-semibold text-success">Imported {result.imported} leads 🎉</p>
            <button onClick={() => navigate('/leads')} className="press text-sm text-accent font-medium mt-2">
              View leads
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
