'use client'

import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'

const schema = z.object({
  first_name_1: z.string().min(1),
  first_name_2: z.string().min(1),
  anecdotes: z.array(z.string()).min(1),
  music_style: z.string().min(1),
  tone: z.string().min(1)
})

type FormData = z.infer<typeof schema>

export default function WeddingForm() {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name_1: '',
      first_name_2: '',
      anecdotes: [''],
      music_style: '',
      tone: ''
    }
  })
  const { register, handleSubmit, setValue, watch } = methods
  const [step, setStep] = useState(1)
  const anecdotes = watch('anecdotes')
  const [loading, setLoading] = useState(false)
  const [credits, setCredits] = useState<number | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  // Récupération de l'utilisateur
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login') // redirige si non connecté
      } else {
        const id = data.user.id
        setUserId(id)
        
        fetch('/api/create-user', {
          method: 'POST',
          body: JSON.stringify({ id, email: data.user.email })
        })
        
        // Récupère les crédits liés à ce user
        const res = await fetch('/api/user-credits', {
          method: 'POST',
          body: JSON.stringify({ uid: id })
        })
        const result = await res.json()
        setCredits(result.credits)
      }
    }

    getUser()
  }, [router])

  const onSubmit = async (data: FormData) => {
    setLoading(true)

    const res = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({ ...data, uid: userId })
    })

    if (res.status === 403) {
      alert("Vous n'avez plus de crédits.")
      setLoading(false)
      return
    }

    const result = await res.json()
    const encodedLyrics = encodeURIComponent(result.lyrics)
    const encodedPrenom1 = encodeURIComponent(data.first_name_1)
    const encodedPrenom2 = encodeURIComponent(data.first_name_2)

    window.location.href = `/result?lyrics=${encodedLyrics}&p1=${encodedPrenom1}&p2=${encodedPrenom2}`
  }

  if (!userId || credits === null) return <p className="text-center mt-10">Chargement...</p>

  return (
    <FormProvider {...methods}>
      <div className="max-w-xl mx-auto p-6">
        <div className="mb-4 text-sm text-gray-700 bg-yellow-100 border border-yellow-300 p-3 rounded">
          🪙 <strong>Crédits disponibles :</strong> {credits}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <>
              <h2 className="text-xl font-bold">👰 Les prénoms</h2>
              <input {...register('first_name_1')} placeholder="Prénom 1" className="border p-2 w-full" />
              <input {...register('first_name_2')} placeholder="Prénom 2" className="border p-2 w-full" />
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
              >
                Suivant
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-bold">📖 Les anecdotes</h2>
              {anecdotes.map((_, index) => (
                <input
                  key={index}
                  {...register(`anecdotes.${index}` as const)}
                  placeholder={`Anecdote ${index + 1}`}
                  className="border p-2 w-full mb-2"
                />
              ))}
              <button
                type="button"
                onClick={() => setValue('anecdotes', [...anecdotes, ''])}
                className="text-sm text-blue-600"
              >
                + Ajouter une anecdote
              </button>
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => setStep(1)}
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  type="button"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Suivant
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-bold">🎶 Style et ton</h2>
              <input {...register('music_style')} placeholder="Ex: pop, rock, jazz..." className="border p-2 w-full" />
              <input {...register('tone')} placeholder="Ex: romantique, drôle, émouvant..." className="border p-2 w-full" />
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => setStep(2)}
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500'}`}
                >
                  {loading ? 'Génération en cours...' : '🎤 Générer la chanson (1 crédit)'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </FormProvider>
  )
}
