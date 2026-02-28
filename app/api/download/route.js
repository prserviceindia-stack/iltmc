import { readFileSync, existsSync } from 'fs'
import { NextResponse } from 'next/server'
import path from 'path'

export async function GET() {
  try {
    const filePath = '/app/iltmc_complete_package.tar.gz'
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Package file not found' }, { status: 404 })
    }
    
    const fileBuffer = readFileSync(filePath)
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="iltmc_complete_package.tar.gz"',
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
