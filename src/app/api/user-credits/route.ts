import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const { uid } = await req.json()

  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', uid)
    .single()

  if (error || !data) {
    return NextResponse.json({ credits: 0 }, { status: 200 })
  }

  return NextResponse.json({ credits: data.credits })
}
