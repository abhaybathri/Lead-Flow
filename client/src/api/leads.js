import api from './axios'

export const getLeads = (params) => api.get('/leads', { params })
export const getLead = (id) => api.get(`/leads/${id}`)
export const createLead = (data) => api.post('/leads', data)
export const updateLead = (id, data) => api.patch(`/leads/${id}`, data)
export const deleteLead = (id) => api.delete(`/leads/${id}`)

export const getNotes = (leadId) => api.get(`/leads/${leadId}/notes`)
export const createNote = (leadId, content) => api.post(`/leads/${leadId}/notes`, { content })

export const getActivity = (leadId) => api.get(`/leads/${leadId}/activity`)

export const submitPublicLead = (data) => api.post('/public/leads', data)
