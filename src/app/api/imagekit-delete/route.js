import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import ImageKit from 'imagekit'

const imagekit = new ImageKit({
  publicKey:   process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey:  process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
})

export async function POST(req) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    // Extract fileId from ImageKit URL
    // URL format: https://ik.imagekit.io/xxx/vetcare/certificates/filename.pdf
    const urlObj  = new URL(url)
    const path    = urlObj.pathname // e.g. /xxx/vetcare/certificates/cert-123.pdf

    // Search for file by path to get fileId
    const files = await imagekit.listFiles({ searchQuery: `name="${path.split('/').pop()}"` })
    if (files?.length > 0) {
      await imagekit.deleteFile(files[0].fileId)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[imagekit-delete]', err)
    // Don't fail hard — DB will still be cleared
    return NextResponse.json({ success: true, note: 'File may not have been deleted from ImageKit' })
  }
}
