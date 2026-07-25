import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getLeads, deleteLead, createLead, updateLead } from '../api/leads'
import { getUsers } from '../api/admin'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Spinner from '../components/ui/Spinner'
import toast from 'react-hot-toast'

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']

// ─── Inline Assign Dropdown ───────────────────────────────────────────────────
function AssignDropdown({ lead, users, onAssigned }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAssign = async (userId) => {
    setSaving(true)
    setOpen(false)
    try {
      const res = await updateLead(lead._id, { assignedTo: userId || null })
      toast.success(userId ? 'Lead assigned' : 'Lead unassigned')
      onAssigned(res.data.data.lead)
    } catch {
      toast.error('Failed to update assignment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        disabled={saving}
        className="flex items-center gap-1.5 text-sm group"
        aria-label="Change assignment"
      >
        {saving ? (
          <Spinner size="sm" />
        ) : lead.assignedTo ? (
          <>
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
              {lead.assignedTo.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-700 group-hover:text-indigo-600 transition-colors">{lead.assignedTo.name}</span>
            <svg className="w-3 h-3 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        ) : (
          <span className="text-gray-400 hover:text-indigo-600 border border-dashed border-gray-300 hover:border-indigo-400 rounded-full px-2.5 py-0.5 text-xs transition-colors">
            + Assign
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border z-20 py-1 overflow-hidden">
          <div className="px-3 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider border-b">
            Assign to
          </div>
          <button
            onClick={() => handleAssign(null)}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">—</span>
            <span className="text-gray-500">Unassigned</span>
            {!lead.assignedTo && <span className="ml-auto text-indigo-500">✓</span>}
          </button>
          {users.map(u => (
            <button
              key={u._id}
              onClick={() => handleAssign(u._id)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700 truncate">{u.name}</span>
              {lead.assignedTo?._id === u._id && <span className="ml-auto text-indigo-500">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Create Lead Modal ────────────────────────────────────────────────────────
function CreateLeadModal({ open, onClose, onCreated, users }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', requirement: '', source: '', status: 'new', assignedTo: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const payload = { ...form }
      if (!payload.assignedTo) delete payload.assignedTo
      const res = await createLead(payload)
      toast.success('Lead created')
      onCreated(res.data.data.lead)
      onClose()
      setForm({ name: '', email: '', phone: '', company: '', requirement: '', source: '', status: 'new', assignedTo: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lead')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create New Lead">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <Input label="Company" value={form.company} onChange={e => setForm({...form, company: e.target.value})} />
        </div>
        <Input label="Requirement" value={form.requirement} onChange={e => setForm({...form, requirement: e.target.value})} required />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Source" value={form.source} onChange={e => setForm({...form, source: e.target.value})} />
          <Select label="Status" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </Select>
        </div>
        <Select label="Assign To" value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
          <option value="">Unassigned</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
        </Select>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>Create Lead</Button>
        </div>
      </form>
    </Modal>
  )
}

// ─── Mobile Lead Card ─────────────────────────────────────────────────────────
function LeadCard({ lead, user, users, onAssigned, onDelete }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Link to={`/leads/${lead._id}`} className="font-semibold text-gray-900 hover:text-indigo-600 truncate block">
            {lead.name}
          </Link>
          <p className="text-xs text-gray-500 truncate">{lead.email}</p>
        </div>
        <Badge label={lead.status} />
      </div>
      {lead.company && <p className="text-sm text-gray-500">{lead.company}</p>}
      <div className="flex items-center justify-between pt-1 border-t">
        {user.role === 'admin' ? (
          <AssignDropdown lead={lead} users={users} onAssigned={onAssigned} />
        ) : (
          <span className="text-xs text-gray-400">{lead.assignedTo?.name || 'Unassigned'}</span>
        )}
        <div className="flex gap-2">
          <Link to={`/leads/${lead._id}`}>
            <Button variant="ghost" size="sm">View</Button>
          </Link>
          {user.role === 'admin' && (
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => onDelete(lead._id)}>
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Leads() {
  const { user } = useAuth()
  const [leads, setLeads] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', status: '', assignedTo: '', page: 1 })
  const [memberUsers, setMemberUsers] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: filters.page, limit: 10 }
      if (filters.search) params.search = filters.search
      if (filters.status) params.status = filters.status
      if (filters.assignedTo && user.role === 'admin') params.assignedTo = filters.assignedTo
      const res = await getLeads(params)
      const { leads, total, page, limit, totalPages } = res.data.data
      setLeads(leads)
      setPagination({ total, page, limit, totalPages })
    } catch {
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [filters, user.role])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  useEffect(() => {
    if (user.role === 'admin') {
      getUsers()
        .then(res => setMemberUsers(res.data.data.users.filter(u => u.isActive)))
        .catch(() => {})
    }
  }, [user.role])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteLead(deleteTarget)
      toast.success('Lead deleted')
      setDeleteTarget(null)
      fetchLeads()
    } catch {
      toast.error('Failed to delete lead')
    } finally {
      setDeleting(false)
    }
  }

  const handleAssigned = (updatedLead) => {
    setLeads(prev => prev.map(l => l._id === updatedLead._id ? updatedLead : l))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setFilters(f => ({ ...f, page: 1 }))
  }

  const clearFilters = () => setFilters({ search: '', status: '', assignedTo: '', page: 1 })
  const hasFilters = filters.search || filters.status || filters.assignedTo

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
          <p className="text-gray-500 text-sm mt-1">
            {user.role === 'admin' ? `${pagination.total} total leads` : 'Your assigned leads'}
          </p>
        </div>
        {user.role === 'admin' && (
          <Button onClick={() => setShowCreate(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Lead
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-48">
          <Input
            placeholder="Search name, email, company..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="flex-1"
          />
          <Button type="submit" variant="secondary" size="md">Search</Button>
        </form>
        <Select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))} className="w-40">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </Select>
        {user.role === 'admin' && (
          <Select value={filters.assignedTo} onChange={e => setFilters(f => ({ ...f, assignedTo: e.target.value, page: 1 }))} className="w-44">
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {memberUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
          </Select>
        )}
        {hasFilters && (
          <Button variant="ghost" size="md" onClick={clearFilters}>Clear filters</Button>
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner /></div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-base font-medium">No leads found</p>
            <p className="text-sm mt-1">{hasFilters ? 'Try clearing your filters' : 'Leads submitted via the public form will appear here'}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Company</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Assigned To</th>
                    <th className="px-4 py-3 hidden xl:table-cell">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {leads.map(lead => (
                    <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <Link to={`/leads/${lead._id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                            {lead.name}
                          </Link>
                          <p className="text-xs text-gray-500">{lead.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-600">{lead.company || '—'}</td>
                      <td className="px-4 py-3"><Badge label={lead.status} /></td>
                      <td className="px-4 py-3">
                        {user.role === 'admin' ? (
                          <AssignDropdown lead={lead} users={memberUsers} onAssigned={handleAssigned} />
                        ) : (
                          <span className="text-gray-600 text-sm">{lead.assignedTo?.name || <span className="text-gray-300">—</span>}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden xl:table-cell text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/leads/${lead._id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                          {user.role === 'admin' && (
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget(lead._id)}>
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <p className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={pagination.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>Previous</Button>
                  <Button variant="secondary" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Spinner /></div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-xl border">
            <p className="font-medium">No leads found</p>
            <p className="text-sm mt-1">{hasFilters ? 'Try clearing your filters' : 'No leads yet'}</p>
          </div>
        ) : (
          <>
            {leads.map(lead => (
              <LeadCard key={lead._id} lead={lead} user={user} users={memberUsers} onAssigned={handleAssigned} onDelete={setDeleteTarget} />
            ))}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between py-3">
                <p className="text-sm text-gray-500">{pagination.page} / {pagination.totalPages} pages</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" disabled={pagination.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>Previous</Button>
                  <Button variant="secondary" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CreateLeadModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={() => fetchLeads()} users={memberUsers} />
      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} loading={deleting} title="Delete Lead" message="Are you sure you want to delete this lead? This action cannot be undone." />
    </div>
  )
}
