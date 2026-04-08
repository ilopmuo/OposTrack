import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

function pad(n) { return String(n).padStart(2, '0') }
function dateStr(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }

export function useCalendarTasks(userId, year, month) {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(true)

  const firstDay = new Date(year, month, 1)
  const lastDay  = new Date(year, month + 1, 0)
  const from     = dateStr(firstDay)
  const to       = dateStr(lastDay)

  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('calendar_tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('date', from)
      .lte('date', to)
      .order('position', { ascending: true })
    setTasks(data ?? [])
    setLoading(false)
  }, [userId, from, to])

  useEffect(() => { fetch() }, [fetch])

  const tasksForDay = useCallback((date) =>
    tasks.filter(t => t.date === dateStr(date))
  , [tasks])

  const addTask = useCallback(async (date, text) => {
    const d   = dateStr(date)
    const pos = tasks.filter(t => t.date === d).length
    const { data, error } = await supabase
      .from('calendar_tasks')
      .insert({ user_id: userId, date: d, text, done: false, position: pos })
      .select()
      .single()
    if (!error && data) setTasks(prev => [...prev, data])
  }, [tasks, userId])

  const toggleTask = useCallback(async (id, done) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !done } : t))
    await supabase.from('calendar_tasks').update({ done: !done }).eq('id', id)
  }, [])

  const deleteTask = useCallback(async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    await supabase.from('calendar_tasks').delete().eq('id', id)
  }, [])

  const editTask = useCallback(async (id, text) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t))
    await supabase.from('calendar_tasks').update({ text }).eq('id', id)
  }, [])

  return { tasks, loading, tasksForDay, addTask, toggleTask, deleteTask, editTask }
}
