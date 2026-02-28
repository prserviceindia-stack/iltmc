import { MongoClient } from 'mongodb'

let client
let db

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME || 'iltmc')
  }
  return db
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://iltmc.com'
  
  try {
    const database = await connectToMongo()
    const seo = await database.collection('seo_settings').findOne({ key: 'global' })
    
    let robotsTxt = seo?.robotsTxt || `# ILTMC - Intrepidus Leones Tripura Motorcycle Club
# robots.txt

User-agent: *
Allow: /

# Disallow admin pages
Disallow: /admin
Disallow: /api/admin

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml`
    
    // Ensure sitemap URL is included
    if (!robotsTxt.includes('Sitemap:')) {
      robotsTxt += `\n\nSitemap: ${baseUrl}/sitemap.xml`
    }
    
    return new Response(robotsTxt, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Robots.txt generation error:', error)
    
    const defaultRobots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/admin

Sitemap: ${baseUrl}/sitemap.xml`
    
    return new Response(defaultRobots, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
  }
}
