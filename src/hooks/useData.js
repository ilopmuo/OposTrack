import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../supabaseClient'

export const MAX_ROUNDS = 3

export function useData(userId) {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('groups')
      .select('*, topics(*)')
      .order('position', { ascending: true })
      .order('position', { referencedTable: 'topics', ascending: true })

    if (error) { toast.error('Error cargando los datos'); console.error(error); return }
    setGroups(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { if (userId) fetchAll() }, [fetchAll, userId])

  // ── Create group ───────────────────────────────────────────────────────────
  const createGroup = useCallback(async (name) => {
    const position = groups.length
    const { data, error } = await supabase
      .from('groups')
      .insert({ name: name.trim(), position, user_id: userId })
      .select('*, topics(*)')
      .single()

    if (error) { toast.error('Error creando bloque'); return }
    setGroups(prev => [...prev, data])
    toast.success('Bloque creado')
  }, [groups, userId])

  // ── Rename group ───────────────────────────────────────────────────────────
  const renameGroup = useCallback(async (groupId, name) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, name } : g))
    const { error } = await supabase.from('groups').update({ name }).eq('id', groupId)
    if (error) { toast.error('Error guardando'); fetchAll() }
  }, [fetchAll])

  // ── Delete group ───────────────────────────────────────────────────────────
  const deleteGroup = useCallback(async (groupId) => {
    setGroups(prev => prev.filter(g => g.id !== groupId))
    const { error } = await supabase.from('groups').delete().eq('id', groupId)
    if (error) { toast.error('Error eliminando bloque'); fetchAll() }
    else toast.success('Bloque eliminado')
  }, [fetchAll])

  // ── Create topic ───────────────────────────────────────────────────────────
  const createTopic = useCallback(async (groupId, name) => {
    const group = groups.find(g => g.id === groupId)
    const position = group ? group.topics.length : 0
    const rounds = Array(MAX_ROUNDS).fill(false)

    const { data, error } = await supabase
      .from('topics')
      .insert({ group_id: groupId, name: name.trim(), position, rounds })
      .select()
      .single()

    if (error) { toast.error('Error creando tema'); return }
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, topics: [...g.topics, data] } : g
    ))
  }, [groups])

  // ── Rename topic ───────────────────────────────────────────────────────────
  const renameTopic = useCallback(async (topicId, name) => {
    setGroups(prev => prev.map(g => ({
      ...g,
      topics: g.topics.map(t => t.id === topicId ? { ...t, name } : t)
    })))
    const { error } = await supabase.from('topics').update({ name }).eq('id', topicId)
    if (error) { toast.error('Error guardando'); fetchAll() }
  }, [fetchAll])

  // ── Delete topic ───────────────────────────────────────────────────────────
  const deleteTopic = useCallback(async (topicId) => {
    setGroups(prev => prev.map(g => ({
      ...g,
      topics: g.topics.filter(t => t.id !== topicId)
    })))
    const { error } = await supabase.from('topics').delete().eq('id', topicId)
    if (error) { toast.error('Error eliminando'); fetchAll() }
  }, [fetchAll])

  // ── Toggle round ───────────────────────────────────────────────────────────
  const toggleRound = useCallback(async (topicId, roundIndex) => {
    setGroups(prev => prev.map(g => ({
      ...g,
      topics: g.topics.map(t => {
        if (t.id !== topicId) return t
        const r = [...t.rounds]
        r[roundIndex] = !r[roundIndex]
        return { ...t, rounds: r }
      })
    })))

    const topic = groups.flatMap(g => g.topics).find(t => t.id === topicId)
    if (!topic) return
    const updated = [...topic.rounds]
    updated[roundIndex] = !updated[roundIndex]

    const { error } = await supabase.from('topics').update({ rounds: updated }).eq('id', topicId)
    if (error) { toast.error('Error guardando'); fetchAll() }
  }, [groups, fetchAll])

  // ── Import from CSV ────────────────────────────────────────────────────────
  const importData = useCallback(async (parsedGroups) => {
    const startPosition = groups.length
    for (let i = 0; i < parsedGroups.length; i++) {
      const g = parsedGroups[i]
      const { data: group, error: gErr } = await supabase
        .from('groups')
        .insert({ name: g.name, position: startPosition + i, user_id: userId })
        .select('id')
        .single()
      if (gErr) throw gErr

      const topicsToInsert = g.topics.map((name, j) => ({
        group_id: group.id,
        name,
        position: j,
        rounds: Array(MAX_ROUNDS).fill(false),
        notes: '',
      }))
      const { error: tErr } = await supabase.from('topics').insert(topicsToInsert)
      if (tErr) throw tErr
    }
    await fetchAll()
    const total = parsedGroups.reduce((s, g) => s + g.topics.length, 0)
    toast.success(`${total} temas importados en ${parsedGroups.length} bloques`)
  }, [groups.length, userId, fetchAll])

  // ── Save notes ─────────────────────────────────────────────────────────────
  const saveNotes = useCallback(async (topicId, notes) => {
    setGroups(prev => prev.map(g => ({
      ...g,
      topics: g.topics.map(t => t.id === topicId ? { ...t, notes } : t)
    })))
    const { error } = await supabase.from('topics').update({ notes }).eq('id', topicId)
    if (error) { toast.error('Error guardando nota'); fetchAll() }
    else toast.success('Nota guardada')
  }, [fetchAll])

  // ── Stats ──────────────────────────────────────────────────────────────────
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

  return {
    groups, loading,
    createGroup, renameGroup, deleteGroup,
    createTopic, renameTopic, deleteTopic,
    toggleRound, saveNotes, importData,
    getGlobalStats, getGroupStats, getFocusSuggestions,
  }
}
