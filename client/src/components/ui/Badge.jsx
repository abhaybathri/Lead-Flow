const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  proposal: 'bg-orange-100 text-orange-800',
  won: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
}

const ROLE_COLORS = {
  admin: 'bg-indigo-100 text-indigo-800',
  member: 'bg-gray-100 text-gray-700',
}

export default function Badge({ label, type = 'status' }) {
  const colors =
    type === 'role'
      ? ROLE_COLORS[label] || 'bg-gray-100 text-gray-700'
      : STATUS_COLORS[label] || 'bg-gray-100 text-gray-700'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors}`}>
      {label}
    </span>
  )
}
