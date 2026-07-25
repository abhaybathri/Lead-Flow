import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getLead, updateLead, getNotes, createNote, getActivity } from '../api/leads'
import { getUsers } from '../api/admin'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import Input from '../components/ui/Input'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']

// ─── Activity Timeline ────────────────────────────────────────────────────────
const ACTION_ICONS = { lead_created: '🌱', status_changed: '🔄', lead_assigned: '👤', note_added: '📝' }

function formatActivity(a, allUsers) {
  const actor = a.actor?.name || 'System'
  switch (a.action) {
    case 'lead_created':
      return a.actor ? `${actor} created this lead` : 'Lead submitted via public form'
    case 'status_changed':
      return `${actor} changed status from "${a.metadata?.from}" → "${a.metadata?.to}"`
    case 'lead_assigned': {
      const prevName = a.metadata?.previousAssigneeName || null
      const newName = a.metadata?.newAssigneeName || null
      if (!prevName && newName) return `${actor} assigned this lead to ${newName}`
      if (prevName && !newName) return `${actor} unassigned this lead (was ${prevName})`
      if (prevName && newName) return `${actor} reassigned from ${prevName} to ${newName}`
      return `${actor} updated assignment`
    }
    case 'note_added':
      return `${actor} added a note`
    default:
      return `${actor}: ${a.action}`
  }
}

function ActivityItem({ activity, allUsers }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-base">
        {ACTION_ICONS[activity.action] || '•'}
      </div>
      <div className="flex-1 min-w-0 pb-4 border-b last:border-0">
        <p className="text-sm text-gray-800">{formatActivity(activity, allUsers)}</p>
        <p className="text-xs text-gray-400 mt-0.5">{new Date(activity.createdAt).toLocaleString()}</p>
      </div>
    </div>
  )
}

// ─── Assignment Section (Admin only) ─────────────────────────────────────────
function AssignSection({ lead, users, onUpdated }) {
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(lead.assignedTo?._id || '')

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateLead(lead._id, { assignedTo: selected || null })
      toast.success(selected ? 'Lead assigned' : 'Lead unassigned')
      onUpdated(res.data.data.lead)
    } catch {
      toast.error('Failed to update assignment')
    } finally {
      setSaving(false)
    }
  }

  const currentId = lead.assignedTo?._id || ''
  const changed = selected !== currentId

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>Assignment</span>
        {lead.assignedTo && <span className="text-xs text-gray-400 font-normal">— currently {lead.assignedTo.name}</span>}
      </h3>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Select value={selected} onChange={e => setSelected(e.target.value)} label="Assign to">
            <option value="">Unassigned</option>
            {users.map(u => (
              <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
            ))}
          </Select>
        </div>
        <Button onClick={handleSave} loading={saving} disabled={!changed} className="flex-shrink-0">
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LeadDetail() {
  const { leadId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [lead, setLead] = useState(null)
  const [notes, setNotes] = useState([])
  const [activities, setActivities] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({})

  const refreshActivity = async () => {
    const res = await getActivity(leadId)
    setActivities(res.data.data.activities)
  }

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [leadRes, notesRes, activityRes] = await Promise.all([
          getLead(leadId), getNotes(leadId), getActivity(leadId),
        ])
        const l = leadRes.data.data.lead
        setLead(l)
        setForm({
          name: l.name, email: l.email, phone: l.phone || '',
          company: l.company || '', requirement: l.requirement,
          source: l.source || '', status: l.status,
          assignedTo: l.assignedTo?._id || '',
        })
        setNotes(notesRes.data.data.notes)
        setActivities(activityRes.data.data.activities)
      } catch (err) {
        if (err.response?.status === 403) { toast.error('You do not have access to this lead'); navigate('/leads') }
        else if (err.response?.status === 404) { toast.error('Lead not found'); navigate('/leads') }
        else toast.error('Failed to load lead')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
    if (user.role === 'admin') {
      getUsers().then(res => setAllUsers(res.data.data.users.filter(u => u.isActive))).catch(() => {})
    }
  }, [leadId, user.role, navigate])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { ...form, assignedTo: form.assignedTo || null }
      const res = await updateLead(leadId, payload)
      setLead(res.data.data.lead)
      setEditMode(false)
      toast.success('Lead updated')
      await refreshActivity()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update lead')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus) => {
    if (lead.status === newStatus) return
    try {
      const res = await updateLead(leadId, { status: newStatus })
      setLead(res.data.data.lead)
      setForm(f => ({ ...f, status: newStatus }))
      toast.success('Status updated')
      await refreshActivity()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      const res = await createNote(leadId, noteText)
      setNotes([res.data.data.note, ...notes])
      setNoteText('')
      toast.success('Note added')
      await refreshActivity()
    } catch {
      toast.error('Failed to add note')
    } finally {
      setAddingNote(false)
    }
  }

  const handleAssigned = async (updatedLead) => {
    setLead(updatedLead)
    setForm(f => ({ ...f, assignedTo: updatedLead.assignedTo?._id || '' }))
    await refreshActivity()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>
  if (!lead) return null

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button onClick={() => navigate('/leads')} className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Leads
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <Badge label={lead.status} />
            {lead.assignedTo
              ? <span className="text-sm text-gray-500">Assigned to <strong>{lead.assignedTo.name}</strong></span>
              : <span className="text-sm text-orange-500">Unassigned</span>
            }
            {lead.company && <span className="text-sm text-gray-400">· {lead.company}</span>}
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {!editMode
            ? <Button variant="secondary" onClick={() => setEditMode(true)}>Edit Lead</Button>
            : <>
                <Button variant="secondary" onClick={() => setEditMode(false)} disabled={saving}>Cancel</Button>
                <Button onClick={handleSave} loading={saving}>Save Changes</Button>
              </>
          }
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Lead Info */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Lead Information</h3>
            {editMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  <Input label="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Requirement</label>
                  <textarea rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" value={form.requirement} onChange={e => setForm({...form, requirement: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Source" value={form.source} onChange={e => setForm({...form, source: e.target.value})} />
                  <Select label="Status" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </Select>
                </div>
              </div>
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                {[
                  ['Email', lead.email],
                  ['Phone', lead.phone || '—'],
                  ['Company', lead.company || '—'],
                  ['Source', lead.source || '—'],
                  ['Created', new Date(lead.createdAt).toLocaleDateString()],
                  ['Submitted by', lead.createdBy?.name || 'Public form'],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</dt>
                    <dd className="font-medium text-gray-900 mt-1">{value}</dd>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <dt className="text-gray-400 text-xs font-medium uppercase tracking-wider">Requirement</dt>
                  <dd className="font-medium text-gray-900 mt-1 leading-relaxed">{lead.requirement}</dd>
                </div>
              </dl>
            )}
          </div>

          {/* Status */}
          {!editMode && (
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Pipeline Status</h3>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize border ${
                      lead.status === s
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assignment — Admin, not in edit mode */}
          {user.role === 'admin' && !editMode && (
            <AssignSection lead={lead} users={allUsers} onUpdated={handleAssigned} />
          )}

          {/* Notes */}
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Notes <span className="text-gray-400 font-normal text-sm">({notes.length})</span></h3>
            <form onSubmit={handleAddNote} className="flex gap-2 mb-5">
              <input
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add a note about this lead..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
              />
              <Button type="submit" loading={addingNote} disabled={!noteText.trim()}>Add</Button>
            </form>
            {notes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No notes yet. Add the first one above.</p>
            ) : (
              <div className="space-y-3">
                {notes.map(note => (
                  <div key={note._id} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-800 leading-relaxed">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                        {note.author?.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-gray-600">{note.author?.name}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Activity Timeline */}
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Activity Timeline</h3>
          {activities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No activity recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {activities.map(a => (
                <ActivityItem key={a._id} activity={a} allUsers={allUsers} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
