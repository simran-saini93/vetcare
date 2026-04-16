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

export const patientsApi      = makeApi('patients')
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
