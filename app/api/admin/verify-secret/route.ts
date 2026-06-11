import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { secret } = await request.json()
    const validSecret = process.env.ADMIN_SECRET_WORD
    if (!validSecret || secret !== validSecret) {
      return NextResponse.json({ valid: false }, { status: 403 })
    }
    return NextResponse.json({ valid: true })
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 })
  }
}
