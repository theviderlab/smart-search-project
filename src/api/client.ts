import axios from 'axios'

const envBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined
const apiKey = import.meta.env.VITE_API_KEY as string | undefined

const baseURL = envBaseUrl ? envBaseUrl.replace(/\/+$/, '') : '/api'

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    ...(apiKey ? { 'X-API-Key': apiKey } : {}),
  },
})

export const ACCOUNT = (import.meta.env.VITE_ACCOUNT as string | undefined) ?? ''
