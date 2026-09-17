const API_URL = 'https://wordle.votee.dev:8000/word/hello'

function calcCharFrequency(candidates) {
    const frequency = new Map()

    for (const candidate of candidates) {
        const seen = new Set()

        for (const char of candidate) {
            if (!seen.has(char)) {
                frequency.set(char, (frequency.get(char) ?? 0) + 1)
                seen.add(char)
            }
        }
    }

    return frequency
}

function pickCandidate(candidates) {
    const frequency = calcCharFrequency(candidates)
    let count = 0, max = 0
    let best = candidates[0]

    for (const candidate of candidates) {
        const seen = new Set()
        count = 0

        for (const char of candidate) {
            if (!seen.has(char)) {
                count += frequency.get(char) ?? 0
                seen.add(char)
            }
        }

        if (count > max) {
            max = count
            best = candidate
        }
    }

    return best
}

async function getFeedback(url) {
    const res = await fetch(url)
    if (!res.ok) {
        console.log('FETCH VOTEE API ERROR')
        return
    }
    const feedback = await res.json()
    return feedback.map((obj) => obj.result)
} // ['correct', 'present', 'absent']

function shouldKeep(guess, candidate, feedback) {
    for (let i = 0; i < feedback.length; i++) {
        const result = feedback[i]
        const sourceChar = guess[i]
        const targetChar = candidate[i]

        if (result === 'correct') {
            if (sourceChar !== targetChar) return false
        } else if (result === 'present') {
            if (!candidate.includes(sourceChar) || sourceChar === targetChar) return false
        } else if (result === 'absent') {
            if (candidate.includes(sourceChar)) return false
        }
    }

    return true
}

export async function* solve(candidates, url) {
    while (candidates.length > 0) {
        const guess = pickCandidate(candidates)
        const newUrl = new URL(url)

        newUrl.searchParams.set('guess', guess)
        const feedback = await getFeedback(newUrl.toString())

        if (!feedback.includes('present') && !feedback.includes('absent')) {
            yield `${guess} ${feedback} FOUND!`
            return
        }

        yield `${guess} ${feedback} CONTINUE....`
        candidates = candidates.filter((candidate) => shouldKeep(guess, candidate, feedback))

        await new Promise((res) => setTimeout(res, 1000))
    }
}

if (typeof window === 'undefined') {
    try {
        const fs = await import('node:fs')
        const path = await import('node:path')

        const size = new URL(API_URL).searchParams.get('size') ?? new URL(API_URL).pathname.split('/')[2].length
        const filePath = path.join(process.cwd(), 'candidates', `${size}.json`)
        const candidates = JSON.parse(fs.readFileSync(filePath, 'utf8'))

        for await (const result of solve(candidates, API_URL)) {
            console.log(result)
        }
    } catch (e) {
        console.log('ERROR: ', e)
    }
}