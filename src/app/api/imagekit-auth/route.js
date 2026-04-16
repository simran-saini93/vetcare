import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import ImageKit from 'imagekit'

const imagekit = new ImageKit({
  publicKey:   process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey:  process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
})

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const result = imagekit.getAuthenticationParameters()
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: 'Failed to get auth' }, { status: 500 })
  }
}
