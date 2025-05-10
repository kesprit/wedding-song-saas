import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const uid = body.uid

  // 1. Vérifie crédits
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', uid)
    .single()

  if (!user || user.credits <= 0) {
    return NextResponse.json({ error: 'Plus de crédits' }, { status: 403 })
  }

  // 2. Génère les paroles
  const prompt = `
Tu es un auteur de chansons spécialisé en mariages.
Crée une chanson de mariage de style ${body.music_style}, dans un ton ${body.tone}.
Inspire-toi des anecdotes suivantes : ${body.anecdotes.join(', ')}.
Mentionne les prénoms des mariés : ${body.first_name_1} et ${body.first_name_2}.
Structure : couplets + refrain. Langue : français.
  `

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8
  })

  const lyrics = response.choices[0].message.content

  // 3. Enregistre la chanson
  await supabase.from('songs').insert([{
    prenom1: body.first_name_1,
    prenom2: body.first_name_2,
    anecdotes: body.anecdotes,
    style: body.music_style,
    tone: body.tone,
    lyrics,
    user_id: uid
  }])

  // 4. Déduis 1 crédit
  await supabase
    .from('users')
    .update({ credits: user.credits - 1 })
    .eq('id', uid)

  return NextResponse.json({ lyrics })
}
