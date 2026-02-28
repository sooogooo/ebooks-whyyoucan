import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const chapterImages = {
  'preface': 'https://images.pexels.com/photos/4974914/pexels-photo-4974914.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'r01': 'https://images.pexels.com/photos/5940841/pexels-photo-5940841.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'r02': 'https://images.pexels.com/photos/6147276/pexels-photo-6147276.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'r03': 'https://images.pexels.com/photos/3760607/pexels-photo-3760607.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'r04': 'https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'r05': 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'r06': 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'r07': 'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'r08': 'https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'f01': 'https://images.pexels.com/photos/6147032/pexels-photo-6147032.jpeg?auto=compress&cs=tinysrgb&w=1200',
}

const chapterFiles = [
  { slug: 'preface', file: 'PREFACE.md', order: 0, type: 'preface' },
  { slug: 'r01', file: 'R01.md', order: 1, type: 'regular' },
  { slug: 'r02', file: 'R02.md', order: 2, type: 'regular' },
  { slug: 'r03', file: 'R03.md', order: 3, type: 'regular' },
  { slug: 'r04', file: 'R04.md', order: 4, type: 'regular' },
  { slug: 'r05', file: 'R05.md', order: 5, type: 'regular' },
  { slug: 'r06', file: 'R06.md', order: 6, type: 'regular' },
  { slug: 'r07', file: 'R07.md', order: 7, type: 'regular' },
  { slug: 'r08', file: 'R08.md', order: 8, type: 'regular' },
  { slug: 'f01', file: 'F01.md', order: 9, type: 'quick_guide' },
]

function extractTitleAndContent(markdown) {
  const lines = markdown.split('\n')
  let title = '未命名章节'
  let subtitle = ''
  let contentStart = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('# ')) {
      title = line.replace(/^#\s+/, '')
      contentStart = i + 1

      if (i + 1 < lines.length && !lines[i + 1].trim().startsWith('#')) {
        const nextLine = lines[i + 1].trim()
        if (nextLine && nextLine.length < 100) {
          subtitle = nextLine
          contentStart = i + 2
        }
      }
      break
    }
  }

  const content = lines.slice(contentStart).join('\n').trim()

  const wordCount = content.length
  const readingTime = Math.max(5, Math.ceil(wordCount / 400))

  return { title, subtitle, content, readingTime }
}

async function seedChapters() {
  console.log('Starting to seed chapter data...')

  for (const chapter of chapterFiles) {
    try {
      const filePath = path.join(__dirname, '..', chapter.file)

      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${chapter.file}, skipping...`)
        continue
      }

      const markdown = fs.readFileSync(filePath, 'utf-8')
      const { title, subtitle, content, readingTime } = extractTitleAndContent(markdown)

      const chapterData = {
        slug: chapter.slug,
        title,
        subtitle,
        content,
        chapter_order: chapter.order,
        chapter_type: chapter.type,
        reading_time: readingTime,
        image_url: chapterImages[chapter.slug] || chapterImages['r01'],
      }

      const { error } = await supabase
        .from('chapters')
        .upsert(chapterData, { onConflict: 'slug' })

      if (error) {
        console.error(`Error inserting ${chapter.slug}:`, error)
      } else {
        console.log(`✓ Seeded chapter: ${title} (${chapter.slug})`)
      }
    } catch (error) {
      console.error(`Error processing ${chapter.file}:`, error)
    }
  }

  console.log('\nData seeding completed!')
}

seedChapters()
