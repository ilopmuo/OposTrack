import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../supabaseClient'

export const MAX_ROUNDS = 4

export function useData() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*, topics(*)')
      .order('position', { ascending: true })
      .order('position', { referencedTable: 'topics', ascending: true })

    if (error) {
      toast.error('Error cargando los datos')
      console.error(error)
      return
    }
    setGroups(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Toggle round ───────────────────────────────────────────────────────────
  const toggleRound = useCallback(async (topicId, roundIndex) => {
    // Optimistic update
    setGroups(prev => prev.map(g => ({
      ...g,
      topics: g.topics.map(t => {
        if (t.id !== topicId) return t
        const newRounds = [...t.rounds]
        newRounds[roundIndex] = !newRounds[roundIndex]
        return { ...t, rounds: newRounds }
      })
    })))

    // Find current rounds for the topic
    const topic = groups.flatMap(g => g.topics).find(t => t.id === topicId)
    if (!topic) return
    const newRounds = [...topic.rounds]
    newRounds[roundIndex] = !newRounds[roundIndex]

    const { error } = await supabase
      .from('topics')
      .update({ rounds: newRounds })
      .eq('id', topicId)

    if (error) {
      toast.error('Error guardando')
      fetchAll() // revert via re-fetch
    }
  }, [groups, fetchAll])

  // ── Save notes ─────────────────────────────────────────────────────────────
  const saveNotes = useCallback(async (topicId, notes) => {
    setGroups(prev => prev.map(g => ({
      ...g,
      topics: g.topics.map(t => t.id === topicId ? { ...t, notes } : t)
    })))

    const { error } = await supabase
      .from('topics')
      .update({ notes })
      .eq('id', topicId)

    if (error) {
      toast.error('Error guardando nota')
      fetchAll()
    } else {
      toast.success('Nota guardada')
    }
  }, [fetchAll])

  // ── Computed stats ─────────────────────────────────────────────────────────
  function getGlobalStats() {
    let totalRounds = 0, doneRounds = 0, totalTopics = 0
    for (const g of groups) {
      totalTopics += g.topics.length
      for (const t of g.topics) {
        totalRounds += MAX_ROUNDS
        doneRounds  += t.rounds.filter(Boolean).length
      }
    }
    const pct = totalRounds ? Math.round(doneRounds / totalRounds * 100) : 0
    const completedTopics = groups.flatMap(g => g.topics).filter(t => t.rounds.filter(Boolean).length === MAX_ROUNDS).length
    const startedTopics   = groups.flatMap(g => g.topics).filter(t => { const d = t.rounds.filter(Boolean).length; return d > 0 && d < MAX_ROUNDS }).length
    return { totalRounds, doneRounds, totalTopics, pct, completedTopics, startedTopics }
  }

  function getGroupStats(group) {
    const total = group.topics.length * MAX_ROUNDS
    const done  = group.topics.reduce((s, t) => s + t.rounds.filter(Boolean).length, 0)
    return { total, done, pct: total ? Math.round(done / total * 100) : 0 }
  }

  function getFocusSuggestions() {
    return groups
      .flatMap(g => g.topics.map(t => ({ topic: t, groupName: g.name, done: t.rounds.filter(Boolean).length })))
      .filter(x => x.done < MAX_ROUNDS)
      .sort((a, b) => a.done - b.done)
      .slice(0, 6)
  }

  return { groups, loading, toggleRound, saveNotes, getGlobalStats, getGroupStats, getFocusSuggestions }
}
