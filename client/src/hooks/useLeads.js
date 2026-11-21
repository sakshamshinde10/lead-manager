import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useDebounce } from './useDebounce'

// Everything the leads page needs from the server, in one place:
// the list (with search and status filter), the counts, the dropdown values,
// and the create / update / delete actions.
export function useLeads() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const debouncedSearch = useDebounce(search.trim(), 300)

  const [leads, setLeads] = useState([])
  const [stats, setStats] = useState(null)
  const [options, setOptions] = useState(null)

  // phase: "loading" (first load), "ready", or "error" (first load failed)
  const [phase, setPhase] = useState('loading')
  const [error, setError] = useState('')

  // Bumping this number makes the list and counts load again.
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  // Describes the request we WANT right now. We remember which request last
  // finished; while the two differ, a fetch is in flight. Working it out like
  // this (instead of setting a "loading" flag inside the effect) avoids an
  // extra render on every change.
  const requestKey = `${debouncedSearch}|${statusFilter}|${version}`
  const [loadedKey, setLoadedKey] = useState(null)
  const fetching = loadedKey !== requestKey

  // Dropdown values (statuses and sources) come from the server, once.
  useEffect(() => {
    api.get('/leads/options').then(setOptions).catch(() => {})
  }, [])

  // The list reloads when the search text, the filter, or `version` changes.
  useEffect(() => {
    // If the user keeps typing, the previous request is cancelled so an old,
    // slow response can never overwrite a newer one.
    const controller = new AbortController()

    const params = new URLSearchParams()
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (statusFilter) params.set('status', statusFilter)

    api
      .get(`/leads?${params}`, { signal: controller.signal })
      .then(({ leads }) => {
        setLeads(leads)
        setError('')
        setPhase('ready')
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        setError(err.message)
        setPhase((current) => (current === 'loading' ? 'error' : current))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadedKey(requestKey)
      })

    return () => controller.abort()
  }, [debouncedSearch, statusFilter, version, requestKey])

  // The counts reload whenever something changed.
  useEffect(() => {
    api.get('/leads/stats').then(setStats).catch(() => {})
  }, [version])

  const createLead = useCallback(
    async (values) => {
      await api.post('/leads', values)
      refresh()
    },
    [refresh],
  )

  const updateLead = useCallback(
    async (id, values) => {
      await api.patch(`/leads/${id}`, values)
      refresh()
    },
    [refresh],
  )

  const deleteLead = useCallback(
    async (id) => {
      await api.delete(`/leads/${id}`)
      refresh()
    },
    [refresh],
  )

  return {
    leads,
    stats,
    options,
    phase,
    error,
    fetching,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    hasFilters: Boolean(debouncedSearch || statusFilter),
    clearFilters: () => {
      setSearch('')
      setStatusFilter('')
    },
    retry: refresh,
    createLead,
    updateLead,
    deleteLead,
  }
}
