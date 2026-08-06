import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)

export async function GET() {
  try {
    const zipPath = '/tmp/iltmc-website-download.zip'
    const appDir = process.cwd()
    
    // Create fresh zip file
    await execAsync(`cd ${appDir} && zip -r ${zipPath} . -x "node_modules/*" -x ".git/*" -x ".next/*" -x "dump/*" -x "*.log" -x ".emergent/*" -x "test_reports/*"`)
    
    // Read the zip file
    const zipBuffer = fs.readFileSync(zipPath)
    
    // Clean up
    fs.unlinkSync(zipPath)
    
    // Return the file
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="iltmc-website.zip"',
        'Content-Length': zipBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json({ error: 'Failed to create download package' }, { status: 500 })
  }
}
