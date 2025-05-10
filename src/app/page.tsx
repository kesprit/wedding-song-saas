'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase-client'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        router.push('/form') // redirige si déjà connecté
      } else {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) return <p className="text-center mt-10">Chargement...</p>

  return (
    <div className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">🎵 Créez votre chanson de mariage personnalisée</h1>
      <p className="mb-6 text-gray-700">
        Générez des paroles uniques à partir de vos anecdotes d’amour,
        puis recevez la chanson chantée en version audio générée par IA 💍✨
      </p>

      <a
        href="/login"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
      >
        ✉️ Se connecter pour commencer
      </a>
    </div>
  )
}
