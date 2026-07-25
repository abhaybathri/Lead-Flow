import { useState } from 'react'
import { Link } from 'react-router-dom'
import { submitPublicLead } from '../api/leads'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import toast from 'react-hot-toast'

const SOURCES = ['Website', 'Referral', 'LinkedIn', 'Google Ads', 'Cold Email', 'Event', 'Other']

function SuccessScreen({ onReset }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Requirement received</h2>
        <p className="text-gray-500 mt-3 leading-relaxed">
          Thank you for reaching out. Your requirement has been logged and a team member will review it shortly.
        </p>
        <div className="mt-8 bg-gray-50 rounded-xl border p-5 text-left space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">What happens next?</h3>
          {['Your lead has been created with status "New"', 'An admin will review and assign it to a team member', 'The assigned member will get in touch with you'].map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
              <p className="text-sm text-gray-600">{s}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={onReset} className="text-sm font-medium text-indigo-600 hover:underline px-4 py-2">
            Submit another requirement
          </button>
          <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-700 px-4 py-2">
            Back to home
          </Link>
        </div>
        <p className="mt-8 text-xs text-gray-400">
          Built for{' '}
          <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
            Digital Heroes Training Task
          </a>
        </p>
      </div>
    </div>
  )
}

export default function SubmitLead() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', requirement: '', source: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (!form.requirement.trim()) e.requirement = 'Please describe your requirement'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await submitPublicLead(form)
      setSubmitted(true)
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed. Please try again.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setForm({ name: '', email: '', phone: '', company: '', requirement: '', source: '' })
    setErrors({})
  }

  if (submitted) return <SuccessScreen onReset={handleReset} />

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">LeadFlow</span>
          </Link>
          <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors">
            Team Login →
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Left: Context */}
          <div className="lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              No account needed
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              Tell us what you're trying to build.
            </h1>
            <p className="mt-4 text-gray-500 leading-relaxed">
              Share a few details about your requirement and our team will review it, reach out, and help you figure out the best path forward.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: '📥', title: 'Your lead is logged immediately', desc: 'As soon as you submit, a new lead is created in our system with status "New".' },
                { icon: '👤', title: 'A team member is assigned', desc: 'Our admin reviews your requirement and assigns it to the right person.' },
                { icon: '📞', title: 'Someone gets in touch', desc: 'The assigned member will contact you using the details you provide.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-xs text-gray-400">
              Built for{' '}
              <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">
                Digital Heroes Training Task
              </a>
            </p>
          </div>

          {/* Right: Form */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Submit your requirement</h2>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" placeholder="John Smith" value={form.name} onChange={set('name')} error={errors.name} required autoComplete="name" />
                <Input label="Email Address" type="email" placeholder="john@example.com" value={form.email} onChange={set('email')} error={errors.email} required autoComplete="email" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Phone Number" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} autoComplete="tel" />
                <Input label="Company" placeholder="Your company name" value={form.company} onChange={set('company')} autoComplete="organization" />
              </div>
              <Select label="How did you hear about us?" value={form.source} onChange={set('source')}>
                <option value="">Select a source</option>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Describe your requirement <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-colors ${errors.requirement ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                  placeholder="Tell us what you're looking for, the problem you're trying to solve, or the project you have in mind..."
                  value={form.requirement}
                  onChange={set('requirement')}
                />
                {errors.requirement && <p className="text-xs text-red-600 mt-1">{errors.requirement}</p>}
              </div>
              <Button type="submit" loading={submitting} className="w-full" size="lg">
                {submitting ? 'Submitting...' : 'Submit Requirement'}
              </Button>
              <p className="text-xs text-gray-400 text-center">
                By submitting you agree that we may contact you using the details provided.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
