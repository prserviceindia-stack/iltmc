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
    
    // Get dynamic pages
    const members = await database.collection('members').find({ status: { $in: ['active', 'veteran'] } }).toArray()
    const rides = await database.collection('rides').find({ isPublic: true }).toArray()
    const events = await database.collection('events').find({ isPublic: true }).toArray()
    const blogPosts = await database.collection('blog').find({ published: true }).toArray()
    
    const currentDate = new Date().toISOString().split('T')[0]
    
    // Static pages
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'weekly' },
      { url: '#about', priority: '0.8', changefreq: 'monthly' },
      { url: '#members', priority: '0.8', changefreq: 'weekly' },
      { url: '#rides', priority: '0.8', changefreq: 'weekly' },
      { url: '#events', priority: '0.8', changefreq: 'weekly' },
      { url: '#gallery', priority: '0.7', changefreq: 'weekly' },
      { url: '#join', priority: '0.9', changefreq: 'monthly' },
      { url: '#contact', priority: '0.7', changefreq: 'monthly' },
    ]
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`
    
    // Add static pages
    for (const page of staticPages) {
      sitemap += `  <url>
    <loc>${baseUrl}/${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`
    }
    
    // Add blog posts
    for (const post of blogPosts) {
      const lastmod = post.updatedAt || post.createdAt || new Date()
      sitemap += `  <url>
    <loc>${baseUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`
    }
    
    sitemap += `</urlset>`
    
    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    })
  } catch (error) {
    console.error('Sitemap generation error:', error)
    
    // Return basic sitemap on error
    const basicSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`
    
    return new Response(basicSitemap, {
      headers: {
        'Content-Type': 'application/xml'
      }
    })
  }
}
