import { useState, useEffect } from 'react'
import { getUsers, createUser, updateUserStatus } from '../../api/admin'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

function CreateUserModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await createUser(form)
      toast.success('Team member created')
      onCreated(res.data.data.user)
      onClose()
      setForm({ name: '', email: '', password: '', role: 'member' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Team Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <Input label="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
        <Input label="Password" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
        <Select label="Role" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </Select>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={submitting}>Create Member</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function Team() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [togglingId, setTogglingId] = useState(null)

  useEffect(() => {
    getUsers()
      .then(res => setUsers(res.data.data.users))
      .catch(() => toast.error('Failed to load team'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggleStatus = async (userId, currentStatus) => {
    setTogglingId(userId)
    try {
      const res = await updateUserStatus(userId, !currentStatus)
      setUsers(users.map(u => u._id === userId ? res.data.data.user : u))
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`)
    } catch {
      toast.error('Failed to update user status')
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
          <p className="text-gray-500 text-sm mt-1">{users.length} team members</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </Button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No team members yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3 hidden md:table-cell">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 hidden md:table-cell">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold text-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-gray-600">{u.email}</td>
                  <td className="px-5 py-4"><Badge label={u.role} type="role" /></td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${u.isActive ? 'text-green-700' : 'text-red-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-400'}`} />
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      variant={u.isActive ? 'ghost' : 'secondary'}
                      size="sm"
                      loading={togglingId === u._id}
                      onClick={() => handleToggleStatus(u._id, u.isActive)}
                      className={u.isActive ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : ''}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={(u) => setUsers([u, ...users])}
      />
    </div>
  )
}
