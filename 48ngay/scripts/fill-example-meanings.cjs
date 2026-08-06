const fs = require('fs')
const path = require('path')

const filePath = path.resolve(__dirname, '..', 'src', 'data', 'course.json')
const raw = fs.readFileSync(filePath, 'utf8')
let data
try {
  data = JSON.parse(raw)
} catch (err) {
  console.error('Failed to parse course.json:', err.message)
  process.exit(1)
}

const dict = {
  'Build a strong English foundation.': 'Xây dựng nền tảng tiếng Anh vững chắc.',
  'Daily practice forms a habit.': 'Luyện tập hàng ngày tạo thành thói quen.',
  'Review old lessons every weekend.': 'Ôn lại các bài học cũ vào mỗi cuối tuần.',
  'Speaking daily boosts confidence.': 'Nói hàng ngày giúp tăng sự tự tin.',
  "Practice makes perfect.": 'Luyện tập sẽ khiến bạn hoàn thiện.',
  'I am a student.': 'Tôi là một học sinh.',
  "She's a teacher.": 'Cô ấy là một giáo viên.',
}

const repl = [
  ['\bBuild\b', 'Xây dựng'],
  ['\bbuild\b', 'xây dựng'],
  ['\bstrong\b', 'vững chắc'],
  ['\bEnglish\b', 'tiếng Anh'],
  ['\bfoundation\b', 'nền tảng'],
  ['\bDaily\b', 'Hàng ngày'],
  ['\bdaily\b', 'hàng ngày'],
  ['\bpractice\b', 'luyện tập'],
  ['\bforms\b', 'tạo thành'],
  ['\breview\b', 'ôn lại'],
  ['\bold\b', 'cũ'],
  ['\blessons\b', 'bài học'],
  ['\bspeaking\b', 'nói'],
  ['\bboosts\b', 'giúp tăng'],
  ['\bconfidence\b', 'sự tự tin'],
  ['\bI\b', 'Tôi'],
  ['\bYou\b', 'Bạn'],
  ['\bhe\b', 'anh ấy'],
  ['\bshe\b', 'cô ấy'],
]

function translate(text) {
  if (!text || typeof text !== 'string') return ''
  if (dict[text]) return dict[text]
  let out = text
  for (const [pat, sub] of repl) {
    out = out.replace(new RegExp(pat, 'g'), sub)
  }
  // If translation is same as input or too short, return a placeholder asking manual review
  if (out.trim() === text.trim() || out.split(' ').length < 2) {
    return (text + ' (dịch tự động — kiểm tra)')
  }
  // Ensure sentence ends with dot
  if (!/[.!?]$/.test(out.trim())) out = out.trim() + '.'
  return out
}

let updated = 0

for (const lesson of data) {
  if (!lesson.vocabularies || !Array.isArray(lesson.vocabularies)) continue
  for (const v of lesson.vocabularies) {
    if (v.example && (!v.exampleMeaning || String(v.exampleMeaning).trim() === '')) {
      v.exampleMeaning = translate(v.example)
      updated++
    }
  }
}

if (updated > 0) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log('Updated exampleMeaning for', updated, 'entries in', filePath)
} else {
  console.log('No missing exampleMeaning entries found.')
}
