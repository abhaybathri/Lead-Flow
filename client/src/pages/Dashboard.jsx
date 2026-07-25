import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getLeads } from '../api/leads'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'

function StatCard({ label, value, color, bgColor, icon }) {
  return (
    <div className="bg-white rounded-xl border p-5 shadow-sm flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${bgColor}`}>
        <span className="text-lg">{icon}</span>
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getLeads({ limit: 100 })
      .then(res => setLeads(res.data.data.leads))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner /></div>
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 text-sm text-indigo-600 hover:underline">Retry</button>
      </div>
    )
  }

  const count = (status) => leads.filter(l => l.status === status).length
  const unassigned = leads.filter(l => !l.assignedTo).length
  const recentLeads = [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)

  const adminStats = [
    { label: 'Total Leads', value: leads.length, color: 'text-gray-900', bgColor: 'bg-gray-100', icon: '📋' },
    { label: 'New', value: count('new'), color: 'text-blue-600', bgColor: 'bg-blue-50', icon: '🌱' },
    { label: 'Qualified', value: count('qualified'), color: 'text-purple-600', bgColor: 'bg-purple-50', icon: '⭐' },
    { label: 'Won', value: count('won'), color: 'text-green-600', bgColor: 'bg-green-50', icon: '🏆' },
    { label: 'Lost', value: count('lost'), color: 'text-red-500', bgColor: 'bg-red-50', icon: '❌' },
    { label: 'Unassigned', value: unassigned, color: unassigned > 0 ? 'text-orange-600' : 'text-gray-400', bgColor: 'bg-orange-50', icon: '👤' },
  ]

  const memberStats = [
    { label: 'Assigned Leads', value: leads.length, color: 'text-gray-900', bgColor: 'bg-gray-100', icon: '📋' },
    { label: 'New', value: count('new'), color: 'text-blue-600', bgColor: 'bg-blue-50', icon: '🌱' },
    { label: 'Qualified', value: count('qualified'), color: 'text-purple-600', bgColor: 'bg-purple-50', icon: '⭐' },
    { label: 'Won', value: count('won'), color: 'text-green-600', bgColor: 'bg-green-50', icon: '🏆' },
  ]

  const stats = user.role === 'admin' ? adminStats : memberStats

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user.role === 'admin' ? 'Dashboard' : 'My Dashboard'}
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            {user.role === 'admin' ? 'Overview of all leads' : 'Your assigned leads overview'}
          </p>
        </div>
        {user.role === 'admin' && unassigned > 0 && (
          <Link to="/leads?status=&assignedTo=unassigned" className="text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors">
            {unassigned} lead{unassigned !== 1 ? 's' : ''} need assignment
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* Status bar (admin only) */}
      {user.role === 'admin' && leads.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">Pipeline Distribution</h3>
            <span className="text-xs text-gray-400">{leads.length} total</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden gap-px">
            {[
              { status: 'new', color: 'bg-blue-400' },
              { status: 'contacted', color: 'bg-yellow-400' },
              { status: 'qualified', color: 'bg-purple-400' },
              { status: 'proposal', color: 'bg-orange-400' },
              { status: 'won', color: 'bg-green-400' },
              { status: 'lost', color: 'bg-red-400' },
            ].map(({ status, color }) => {
              const pct = (count(status) / leads.length) * 100
              return pct > 0 ? <div key={status} className={`${color} h-full transition-all`} style={{ width: `${pct}%` }} title={`${status}: ${count(status)}`} /> : null
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {[
              { label: 'New', color: 'bg-blue-400', status: 'new' },
              { label: 'Contacted', color: 'bg-yellow-400', status: 'contacted' },
              { label: 'Qualified', color: 'bg-purple-400', status: 'qualified' },
              { label: 'Proposal', color: 'bg-orange-400', status: 'proposal' },
              { label: 'Won', color: 'bg-green-400', status: 'won' },
              { label: 'Lost', color: 'bg-red-400', status: 'lost' },
            ].map(({ label, color, status }) => (
              <div key={status} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                {label} ({count(status)})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent leads */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Leads</h3>
          <Link to="/leads" className="text-sm text-indigo-600 hover:underline">View all →</Link>
        </div>
        {recentLeads.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <p className="text-sm font-medium">No leads yet</p>
            {user.role === 'admin' && (
              <p className="text-xs mt-1">
                Leads submitted via the{' '}
                <Link to="/submit-lead" className="text-indigo-500 hover:underline">public form</Link>{' '}
                will appear here.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {recentLeads.map(lead => (
              <Link key={lead._id} to={`/leads/${lead._id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {lead.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                  <p className="text-xs text-gray-400 truncate">{lead.company || lead.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {lead.assignedTo ? (
                    <span className="text-xs text-gray-400 hidden sm:block">{lead.assignedTo.name}</span>
                  ) : (
                    <span className="text-xs text-orange-400 hidden sm:block">Unassigned</span>
                  )}
                  <Badge label={lead.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
