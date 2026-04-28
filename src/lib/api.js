// Client-side fetch helpers — all call Next.js API routes → MySQL via Drizzle

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

const makeApi = (base) => ({
  getAll:  (query = '') => request(`/api/${base}${query}`),
  getById: (id)         => request(`/api/${base}/${id}`),
  create:  (data)       => request(`/api/${base}`, { method: 'POST', body: JSON.stringify(data) }),
  update:  (id, data)   => request(`/api/${base}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:  (id)         => request(`/api/${base}/${id}`, { method: 'DELETE' }),
})

// Patients API with pagination + search
export const patientsApi = {
  ...makeApi('patients'),
  getPaginated: ({ page = 1, limit = 50, search = '', species = '', status = '' } = {}) => {
    const offset = (page - 1) * limit
    const params = new URLSearchParams({ limit, offset, search, species, status })
    return request(`/api/patients?${params}`)
  },
  getById: (id) => request(`/api/patients/${id}`),
  create:  (data) => request('/api/patients', { method: 'POST', body: JSON.stringify(data) }),
  update:  (id, data) => request(`/api/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:  (id) => request(`/api/patients/${id}`, { method: 'DELETE' }),
}

export const ownersApi        = makeApi('owners')
export const appointmentsApi  = makeApi('appointments')
export const visitRecordsApi  = makeApi('visit-records')
export const prescriptionsApi = makeApi('prescriptions')
export const labRequestsApi   = makeApi('lab-requests')
export const vaccinationsApi  = makeApi('vaccinations')
export const weightRecordsApi = makeApi('weight-records')
export const patientPhotosApi = makeApi('patient-photos')

export const searchApi = {
  search: (params) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/api/search?${qs}`)
  }
}
