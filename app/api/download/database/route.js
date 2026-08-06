import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export async function GET() {
  try {
    const client = new MongoClient(process.env.MONGO_URL || 'mongodb://localhost:27017')
    await client.connect()
    const db = client.db()
    
    // Get all collections
    const collections = await db.listCollections().toArray()
    const exportData = {}
    
    for (const col of collections) {
      const data = await db.collection(col.name).find({}).toArray()
      // Remove MongoDB _id and sensitive data
      exportData[col.name] = data.map(doc => {
        const { _id, password, aadhaarCard, drivingLicense, ...rest } = doc
        return rest
      })
    }
    
    await client.close()
    
    const jsonString = JSON.stringify(exportData, null, 2)
    
    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="iltmc-database-export.json"'
      }
    })
  } catch (error) {
    console.error('Database export error:', error)
    return NextResponse.json({ error: 'Failed to export database' }, { status: 500 })
  }
}
