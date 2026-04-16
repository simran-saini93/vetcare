import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name:  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key:     process.env.CLOUDINARY_API_KEY,
  api_secret:  process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { folder = 'vetcare' } = body

    const timestamp = Math.round(Date.now() / 1000)
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder, upload_preset: 'vetcare' },
      process.env.CLOUDINARY_API_SECRET
    )

    return NextResponse.json({
      signature,
      timestamp,
      cloudName:    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey:       process.env.CLOUDINARY_API_KEY,
      folder,
      uploadPreset: 'vetcare',
    })
  } catch (err) {
    console.error('[POST /api/upload]', err)
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 })
  }
}
