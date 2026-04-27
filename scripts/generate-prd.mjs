import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, PageBreak, ShadingType,
} from 'docx'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const mdPath = path.resolve(__dirname, '../PRD.md')
const outPath = path.resolve(__dirname, '../PRD.docx')

const md = fs.readFileSync(mdPath, 'utf-8')
const lines = md.split('\n')

// ── Color palette ─────────────────────────────────────────
const PINK    = 'FD85AB'
const DARK    = '3D3D3D'
const GRAY    = '888888'
const LIGHTBG = 'FDF6E3'
const BORDER_COLOR = 'E8DFA8'

// ── Helpers ───────────────────────────────────────────────
const borderNone = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const cellBorders = {
  top:    { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  left:   { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
  right:  { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
}
const headerBorders = {
  top:    { style: BorderStyle.SINGLE, size: 8, color: PINK },
  bottom: { style: BorderStyle.SINGLE, size: 8, color: PINK },
  left:   { style: BorderStyle.SINGLE, size: 4, color: PINK },
  right:  { style: BorderStyle.SINGLE, size: 4, color: PINK },
}

function textRun(text, opts = {}) {
  return new TextRun({ text, font: '微软雅黑', size: 22, ...opts })
}

function heading1(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: '微软雅黑', size: 36, bold: true, color: PINK })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: PINK } },
  })
}

function heading2(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: '微软雅黑', size: 28, bold: true, color: DARK })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 80 },
  })
}

function heading3(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: '微软雅黑', size: 24, bold: true, color: GRAY })],
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 60 },
  })
}

function heading4(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: '微软雅黑', size: 22, bold: true, color: DARK })],
    spacing: { before: 160, after: 40 },
  })
}

function para(text, opts = {}) {
  // Handle inline bold **text**
  const parts = text.split(/\*\*(.*?)\*\*/g)
  const runs = parts.map((p, i) =>
    i % 2 === 1
      ? textRun(p, { bold: true, ...opts })
      : textRun(p, opts)
  )
  return new Paragraph({
    children: runs,
    spacing: { after: 60 },
    ...opts.paraOpts,
  })
}

function bullet(text, level = 0) {
  const clean = text.replace(/^[-*]\s+/, '').replace(/^\[[ x]\]\s+/, '')
  const isDone = /^\[x\]/i.test(text.replace(/^[-*]\s+/, ''))
  const parts = clean.split(/\*\*(.*?)\*\*/g)
  const runs = parts.map((p, i) =>
    i % 2 === 1
      ? textRun(p, { bold: true, color: DARK, strike: isDone })
      : textRun(p, { color: isDone ? GRAY : DARK, strike: isDone })
  )
  return new Paragraph({
    children: runs,
    bullet: { level },
    spacing: { after: 40 },
  })
}

function codeBlock(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Courier New', size: 18, color: DARK })],
    spacing: { after: 40 },
    shading: { type: ShadingType.SOLID, color: 'F5F5F5', fill: 'F5F5F5' },
    indent: { left: 360 },
  })
}

function makeTable(rows) {
  const isHeader = (i) => i === 0
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    rows: rows.map((cells, ri) =>
      new TableRow({
        children: cells.map(cell =>
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({
                text: cell.trim(),
                font: '微软雅黑',
                size: isHeader(ri) ? 22 : 20,
                bold: isHeader(ri),
                color: isHeader(ri) ? 'FFFFFF' : DARK,
              })],
              alignment: AlignmentType.LEFT,
            })],
            borders: isHeader(ri) ? headerBorders : cellBorders,
            shading: isHeader(ri)
              ? { type: ShadingType.SOLID, color: PINK, fill: PINK }
              : undefined,
          })
        ),
      })
    ),
  })
}

// ── Parse markdown ────────────────────────────────────────
const children = []

let inCode = false
let inTable = false
let tableRows = []

// Title block (first 4 lines)
children.push(
  new Paragraph({
    children: [new TextRun({ text: '盐音（Yanyin）', font: '微软雅黑', size: 56, bold: true, color: PINK })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 400, after: 80 },
  }),
  new Paragraph({
    children: [new TextRun({ text: '产品需求文档（PRD）', font: '微软雅黑', size: 36, color: DARK })],
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
  }),
)

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]

  // Skip title lines already added
  if (i < 3) continue

  // Code block toggle
  if (line.startsWith('```')) {
    inCode = !inCode
    if (!inCode) children.push(new Paragraph({ spacing: { after: 80 } }))
    continue
  }
  if (inCode) { children.push(codeBlock(line)); continue }

  // Table row
  if (line.startsWith('|')) {
    if (!inTable) inTable = true
    const cells = line.split('|').slice(1, -1)
    // Skip separator row
    if (cells.every(c => /^[\s:-]+$/.test(c))) continue
    tableRows.push(cells)
    continue
  } else if (inTable) {
    children.push(makeTable(tableRows))
    children.push(new Paragraph({ spacing: { after: 80 } }))
    tableRows = []
    inTable = false
  }

  // Headings
  if (line.startsWith('#### ')) { children.push(heading4(line.slice(5))); continue }
  if (line.startsWith('### '))  { children.push(heading3(line.slice(4))); continue }
  if (line.startsWith('## '))   { children.push(heading2(line.slice(3))); continue }
  if (line.startsWith('# '))    { children.push(heading1(line.slice(2))); continue }

  // Horizontal rule → page break feel
  if (/^---+$/.test(line.trim())) {
    children.push(new Paragraph({ spacing: { before: 160, after: 160 } }))
    continue
  }

  // Bullet / checkbox
  if (/^(\s*)([-*]|\[[ x]\])/.test(line)) {
    const indent = line.match(/^(\s*)/)[1].length
    children.push(bullet(line.trim(), Math.floor(indent / 2)))
    continue
  }

  // Blank line
  if (!line.trim()) {
    children.push(new Paragraph({ spacing: { after: 40 } }))
    continue
  }

  // Normal paragraph
  children.push(para(line.replace(/^>\s*/, '')))
}

// Flush table if file ended in table
if (inTable && tableRows.length) {
  children.push(makeTable(tableRows))
}

// ── Build document ────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: '微软雅黑', size: 22, color: DARK },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1440, bottom: 1440, left: 1800, right: 1800 },
      },
    },
    children,
  }],
})

const buf = await Packer.toBuffer(doc)
fs.writeFileSync(outPath, buf)
console.log('✓ PRD.docx 生成成功：', outPath)
