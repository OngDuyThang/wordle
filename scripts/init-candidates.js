import fs from 'node:fs'
import path from 'node:path'

const API_URL = 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt'
const CANDIDATES_PATH = path.join(process.cwd(), 'candidates') // 1.json, 5.json

async function init() {
    if (fs.existsSync(CANDIDATES_PATH) && fs.readdirSync(CANDIDATES_PATH).length > 0) {
        console.log('CANDIDATES ALREADY EXISTED')
        return
    }
    fs.mkdirSync(CANDIDATES_PATH, { recursive: true })

    const res = await fetch(API_URL)
    if (!res.ok) {
        console.log('FETCH CANDIDATES ERROR')
        return
    }
    const text = await res.text()

    const map = new Map()
    for (const rawCandidate of text.split('\n')) {
        const candidate = rawCandidate.trim().toLowerCase()
        const size = candidate.length

        if (size === 0) {
            continue
        }

        if (!map.has(size)) {
            map.set(size, [])
        }
        map.get(size).push(candidate)
    }

    for (const [size, candidates] of map.entries()) {
        const filePath = path.join(CANDIDATES_PATH, `${size}.json`)
        fs.writeFileSync(filePath, JSON.stringify(candidates))
    }
}

if (typeof window === 'undefined') {
    init().catch(e => console.log('ERROR: ', e))
}