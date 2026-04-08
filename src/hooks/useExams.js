import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../supabaseClient'

export function useExams(userId) {
  const [exams, setExams]           = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading]       = useState(true)

  const fetchExams = useCallback(async () => {
    if (!userId) return
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('position', { ascending: true })
    if (error) { toast.error('Error cargando exámenes'); return }
    setExams(data ?? [])
    setLoading(false)
    // Select first exam by default if none selected yet
    setSelectedId(prev => {
      if (prev && data?.find(e => e.id === prev)) return prev
      return data?.[0]?.id ?? null
    })
  }, [userId])

  useEffect(() => { fetchExams() }, [fetchExams])

  const createExam = useCallback(async (name) => {
    const position = exams.length
    const { data, error } = await supabase
      .from('exams')
      .insert({ user_id: userId, name: name.trim(), position })
      .select()
      .single()
    if (error) { toast.error('Error creando examen'); return }
    setExams(prev => [...prev, data])
    setSelectedId(data.id)
    toast.success(`Examen "${name}" creado`)
    return data
  }, [exams.length, userId])

  const renameExam = useCallback(async (id, name) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, name } : e))
    const { error } = await supabase.from('exams').update({ name }).eq('id', id)
    if (error) { toast.error('Error guardando'); fetchExams() }
  }, [fetchExams])

  const deleteExam = useCallback(async (id) => {
    if (exams.length <= 1) { toast.error('Debes tener al menos un examen'); return }
    const { error } = await supabase.from('exams').delete().eq('id', id)
    if (error) { toast.error('Error eliminando examen'); return }
    const remaining = exams.filter(e => e.id !== id)
    setExams(remaining)
    if (selectedId === id) setSelectedId(remaining[0]?.id ?? null)
    toast.success('Examen eliminado')
  }, [exams, selectedId])

  const selectedExam = exams.find(e => e.id === selectedId) ?? null

  return {
    exams, selectedExam, selectedId, loading,
    setSelectedId, createExam, renameExam, deleteExam,
  }
}
