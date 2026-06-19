import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const login = (role, pin) =>
  api.post(`/auth/${role}`, { pin }).then((r) => r.data)

export const listRecords = (params) =>
  api.get('/records', { params }).then((r) => r.data)

export const getRecord = (id) =>
  api.get(`/records/${id}`).then((r) => r.data)

export const createRecord = (body) =>
  api.post('/records', body).then((r) => r.data)

export const updateRecord = (id, body) =>
  api.put(`/records/${id}`, body).then((r) => r.data)

export const deleteRecord = (id) =>
  api.delete(`/records/${id}`)

export default api
