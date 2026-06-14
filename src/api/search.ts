import { api } from './client'
import type { SearchRequest, SearchResponse } from '@/lib/types'

export async function searchDocuments(req: SearchRequest): Promise<SearchResponse> {
  const { data } = await api.post<SearchResponse>('/search', req)
  return data
}
