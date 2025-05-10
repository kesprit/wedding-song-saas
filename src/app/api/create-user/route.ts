import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { email, id } = await req.json()

  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('id', id)
    .single()

  if (!data) {
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ id, credits: 2 }])

    if (insertError) {
      console.error('Erreur insertion utilisateur :', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
