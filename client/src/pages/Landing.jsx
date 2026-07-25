import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#for-teams', label: 'For Teams' },
  ]

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm border-b' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className={`text-lg font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>LeadFlow</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className={`text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-indigo-600' : 'text-indigo-100 hover:text-white'}`}>
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
              Team Login
            </Link>
            <Link to="/submit-lead" className="text-sm font-medium px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              Submit a Requirement
            </Link>
          </div>

          <button className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-gray-700' : 'text-white'}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden bg-white border-t shadow-lg rounded-b-xl py-4 px-4 space-y-1">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                {l.label}
              </a>
            ))}
            <div className="pt-3 border-t mt-3 space-y-2">
              <Link to="/login" className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">Team Login</Link>
              <Link to="/submit-lead" className="block px-3 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg text-center hover:bg-indigo-700">Submit a Requirement</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-700 pt-32 pb-24 overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full filter blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-300 rounded-full filter blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-800/60 text-indigo-200 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-indigo-700">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Lead Management, Simplified
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              Every lead deserves<br />
              <span className="text-indigo-300">a next step.</span>
            </h1>
            <p className="mt-6 text-lg text-indigo-200 leading-relaxed">
              Capture incoming opportunities, assign ownership, and track every conversation from first contact to outcome. Built for small sales teams who need clarity, not complexity.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/submit-lead" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                Submit a Requirement
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-800/60 text-white font-semibold rounded-xl hover:bg-indigo-800 border border-indigo-600 transition-colors">
                Team Login
              </Link>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold text-sm">Lead Pipeline</span>
                <span className="text-indigo-300 text-xs">Live</span>
              </div>
              {[
                { name: 'Rahul Sharma', company: 'TechCorp', status: 'new', color: 'bg-blue-400', assignee: 'Unassigned' },
                { name: 'Priya Patel', company: 'StartupXYZ', status: 'contacted', color: 'bg-yellow-400', assignee: 'Abhay K.' },
                { name: 'Amit Singh', company: 'EnterpriseABC', status: 'qualified', color: 'bg-purple-400', assignee: 'Abhay K.' },
                { name: 'Sara Johnson', company: 'GrowthCo', status: 'proposal', color: 'bg-orange-400', assignee: 'Demo Team' },
                { name: 'Carlos Ruiz', company: 'ScaleUp Inc', status: 'won', color: 'bg-green-400', assignee: 'Demo Team' },
              ].map((lead, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b border-white/10 last:border-0">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {lead.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{lead.name}</p>
                    <p className="text-indigo-300 text-xs truncate">{lead.company}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-white text-xs px-2 py-0.5 rounded-full ${lead.color}/30 border border-white/20 capitalize`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${lead.color}`} />
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Problems() {
  const problems = [
    { icon: '📋', title: 'Leads get lost in spreadsheets', desc: 'Without a system, promising enquiries disappear into email threads and shared docs that nobody updates.' },
    { icon: '❓', title: 'Nobody knows who owns a lead', desc: "When responsibility is unclear, leads stall. You can't follow up on something you didn't know was yours." },
    { icon: '⏰', title: 'Follow-ups are forgotten', desc: 'Without reminders or history, leads go cold. A missed follow-up is a missed opportunity.' },
    { icon: '📊', title: 'No visibility into sales activity', desc: "Managers can't coach what they can't see. A team without pipeline visibility is flying blind." },
  ]
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Sound familiar?</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">Most small sales teams run into the same problems when they outgrow their inbox.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((p, i) => (
            <div key={i} className="bg-white rounded-xl border p-6 shadow-sm">
              <div className="text-3xl mb-4">{p.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
      ),
      title: 'Centralised lead management',
      desc: 'All incoming leads in one place. No more digging through emails or spreadsheets.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      ),
      title: 'Clear lead ownership',
      desc: 'Assign leads to team members instantly. Everyone knows who is responsible.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
      ),
      title: 'Pipeline status tracking',
      desc: 'Move leads through stages: New → Contacted → Qualified → Proposal → Won or Lost.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
      ),
      title: 'Notes and conversation history',
      desc: 'Log every call, email, and meeting. Context is never lost when a lead is handed over.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      ),
      title: 'Full activity timeline',
      desc: 'See a complete, timestamped record of every action taken on every lead.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
      ),
      title: 'Role-based access control',
      desc: 'Admins see everything. Members see only their assigned leads. Security at every layer.',
    },
  ]

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Everything your team needs</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">Built for teams who want to close more deals without wrestling with complex software.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-xl border hover:border-indigo-200 hover:shadow-sm transition-all">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { n: '1', title: 'Visitor submits a requirement', desc: 'Anyone can fill in the public form with their name, email, and what they need. No account required.' },
    { n: '2', title: 'Lead enters the system', desc: 'The submission creates a new lead automatically, with status set to New and ready for review.' },
    { n: '3', title: 'Admin assigns it to a team member', desc: 'The admin sees the new lead on their dashboard and assigns it to the right person with a single click.' },
    { n: '4', title: 'Team member follows up', desc: 'The assigned member sees the lead in their view, contacts the prospect, and updates the status.' },
    { n: '5', title: 'Team tracks the entire journey', desc: 'Notes, status changes, and assignments are all timestamped in the activity timeline. Nothing is lost.' },
  ]
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
          <p className="text-gray-500 mt-3">From first contact to outcome in five clear steps.</p>
        </div>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-5 bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {s.n}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ForTeams() {
  return (
    <section id="for-teams" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Built for two kinds of people</h2>
            <p className="text-gray-500 mt-4 leading-relaxed">LeadFlow gives admins full visibility and control, while keeping members focused on their own work without distraction.</p>
            <div className="mt-8 space-y-5">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold text-sm">A</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Admins</h4>
                  <p className="text-sm text-gray-500 mt-1">See all leads, manage the team, assign work, and track outcomes across the whole pipeline.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center font-bold text-sm">M</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Members</h4>
                  <p className="text-sm text-gray-500 mt-1">See only the leads assigned to them, add notes, update statuses, and build a clear record of their activity.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl border p-6 space-y-3">
            {[
              { label: 'View all leads', admin: true, member: false },
              { label: 'Assign leads', admin: true, member: false },
              { label: 'Delete leads', admin: true, member: false },
              { label: 'Manage team members', admin: true, member: false },
              { label: 'View assigned leads', admin: true, member: true },
              { label: 'Update lead status', admin: true, member: true },
              { label: 'Add notes', admin: true, member: true },
              { label: 'View activity history', admin: true, member: true },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm text-gray-700">{row.label}</span>
                <div className="flex gap-6">
                  <span className={`text-xs font-medium ${row.admin ? 'text-green-600' : 'text-red-400'}`}>{row.admin ? '✓ Admin' : '✗ Admin'}</span>
                  <span className={`text-xs font-medium ${row.member ? 'text-green-600' : 'text-gray-300'}`}>{row.member ? '✓ Member' : '✗ Member'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function CTA() {
  return (
    <section className="py-20 bg-indigo-900">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl font-bold text-white">Ready to bring your leads into one place?</h2>
        <p className="text-indigo-300 mt-4 text-lg">Submit your requirement and our team will be in touch.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/submit-lead" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
            Submit a Requirement
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link to="/login" className="inline-flex items-center justify-center px-8 py-3 bg-indigo-800/60 text-white font-semibold rounded-xl hover:bg-indigo-800 border border-indigo-700 transition-colors">
            Team Login
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-semibold">LeadFlow</span>
        </div>
        <p className="text-sm text-center">
          Built for{' '}
          <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline font-medium">
            Digital Heroes Training Task
          </a>
        </p>
        <div className="flex gap-5 text-sm">
          <Link to="/submit-lead" className="hover:text-white transition-colors">Submit Lead</Link>
          <Link to="/login" className="hover:text-white transition-colors">Team Login</Link>
        </div>
      </div>
    </footer>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Problems />
      <Features />
      <HowItWorks />
      <ForTeams />
      <CTA />
      <Footer />
    </div>
  )
}
