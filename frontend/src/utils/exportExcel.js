import ExcelJS from 'exceljs'
import { todayISO } from '../data/products'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const yn = (v) => (v ? 'Yes' : 'No')
const val = (v) => v ?? ''

function commonCols(r) {
  return [
    r.record_id,
    r.product_name,
    r.status,
    val(r.lot_number),
    r.date_of_production,
    r.use_by_date,
    val(r.batch_size),
    val(r.manager_check),
    r.created_at?.slice(0, 16).replace('T', ' ') ?? '',
    r.updated_at?.slice(0, 16).replace('T', ' ') ?? '',
  ]
}

const COMMON_HEADERS = [
  'Record ID', 'Product', 'Status', 'Lot Number',
  'Date of Production', 'Use By Date', 'Batch Size', 'Manager Check',
  'Created At', 'Updated At',
]

// Build ingredient header + data columns for a fixed list of ingredient names
function ingHeaders(names, hasBatch2 = true) {
  return names.flatMap((n) => [
    `${n} — Date/Code`,
    `${n} — Batch/Mill #1`,
    ...(hasBatch2 ? [`${n} — Batch/Mill #2`] : []),
    `${n} — Added`,
  ])
}

function ingRow(ings, names, hasBatch2 = true) {
  return names.flatMap((n) => {
    const ing = ings.find((i) => i.name === n) || {}
    return [
      val(ing.date_code),
      val(ing.batch_mill_1),
      ...(hasBatch2 ? [val(ing.batch_mill_2)] : []),
      ing.added ? 'Yes' : 'No',
    ]
  })
}

// Collect every unique ingredient name across a set of records
function collectIngNames(records) {
  const seen = new Set()
  const list = []
  for (const r of records) {
    for (const ing of (r.ingredients || [])) {
      if (!seen.has(ing.name)) { seen.add(ing.name); list.push(ing.name) }
    }
  }
  return list
}

function addSheet(wb, sheetName, headers, rows) {
  const ws = wb.addWorksheet(sheetName)
  ws.columns = headers.map((h) => ({ width: Math.max(h.length + 2, 14) }))
  const headerRow = ws.addRow(headers)
  headerRow.eachCell((cell) => { cell.font = { bold: true } })
  rows.forEach((row) => ws.addRow(row))
}

// ─────────────────────────────────────────────────────────────────────────────
// Type 1 — Dry Rub
// ─────────────────────────────────────────────────────────────────────────────
function buildType1(records) {
  const ingNames = collectIngNames(records)
  const headers = [
    ...COMMON_HEADERS,
    ...ingHeaders(ingNames, true),
    'CCP — Start Time', 'CCP — Name (Start)',
    'CCP — Finish Time', 'CCP — Name (Finish)',
    'CCP — Kg Produced', 'CCP — Supervisor', 'CCP — Corrective Actions',
  ]
  const rows = records.map((r) => {
    const ccp = r.form_data?.ccp || {}
    return [
      ...commonCols(r),
      ...ingRow(r.ingredients || [], ingNames, true),
      val(ccp.start_time), val(ccp.name_start),
      val(ccp.finish_time), val(ccp.name_finish),
      val(ccp.kg_produced), val(ccp.supervisor_name), val(ccp.corrective_actions),
    ]
  })
  return { headers, rows }
}

// ─────────────────────────────────────────────────────────────────────────────
// Type 2 — Marinade / Brine
// ─────────────────────────────────────────────────────────────────────────────
function buildType2(records) {
  const ingNames = collectIngNames(records)
  const headers = [
    ...COMMON_HEADERS,
    ...ingHeaders(ingNames, true),
    // Chicken Brine CCP
    'CCP — Start Time', 'CCP — Name (Start)', 'CCP — Finish Time', 'CCP — Name (Finish)', 'CCP — Kg Produced',
    // Asado Marinate
    'Prep — Start Time', 'Prep — Name (Start)', 'Prep — Finish Time', 'Prep — Name (Finish)',
    'Bags Produced',
    'Pack — Start Time', 'Pack — Name (Start)', 'Pack — Finish Time', 'Pack — Name (Finish)',
    'pH Reading',
    // Chicken Whole Marinate
    'Liquid Prep — Start Time', 'Liquid Prep — Name (Start)', 'Liquid Prep — Finish Time', 'Liquid Prep — Name (Finish)',
    'Tumbling — Start Time', 'Tumbling — Name (Start)', 'Tumbling — Finish Time', 'Tumbling — Name (Finish)',
    'Kg Produced',
    // Common
    'Supervisor Name', 'Corrective Actions',
  ]
  const rows = records.map((r) => {
    const fd = r.form_data || {}
    const ccp = fd.ccp || {}
    return [
      ...commonCols(r),
      ...ingRow(r.ingredients || [], ingNames, true),
      // Chicken Brine
      val(ccp.start_time), val(ccp.name_start), val(ccp.finish_time), val(ccp.name_finish), val(ccp.kg_produced),
      // Asado
      val(fd.prep_start_time), val(fd.prep_name_start), val(fd.prep_finish_time), val(fd.prep_name_finish),
      val(fd.bags_produced),
      val(fd.pack_start_time), val(fd.pack_name_start), val(fd.pack_finish_time), val(fd.pack_name_finish),
      val(fd.ph_reading),
      // Chicken Whole
      val(fd.liquid_start_time), val(fd.liquid_name_start), val(fd.liquid_finish_time), val(fd.liquid_name_finish),
      val(fd.tumble_start_time), val(fd.tumble_name_start), val(fd.tumble_finish_time), val(fd.tumble_name_finish),
      val(fd.kg_produced || ccp.kg_produced),
      // Common
      val(fd.supervisor_name || ccp.supervisor_name),
      val(fd.corrective_actions || ccp.corrective_actions),
    ]
  })
  return { headers, rows }
}

// ─────────────────────────────────────────────────────────────────────────────
// Type 3 — Cook + Blast Chill
// ─────────────────────────────────────────────────────────────────────────────
function buildType3(records) {
  const ingNames = collectIngNames(records)
  const headers = [
    ...COMMON_HEADERS,
    ...ingHeaders(ingNames, true),
    'Cooking — Start Time', 'Cooking — Name 1', 'Cooking — Finish Time', 'Cooking — Name 2',
    'Cooking — Temp After Cooking (°C)', 'Cooking — After Hold Time', 'Cooking — Hold Temp (°C)',
    'Packing — Start Time', 'Packing — Temp (°C)', 'Packing — Name 1',
    'Packing — Finish Time', 'Packing — Finish Temp (°C)', 'Packing — Name 2',
    'Blast Chilling — Start Time', 'Blast Chilling — Temp Going In (°C)', 'Blast Chilling — Name 1',
    'Blast Chilling — Finish Time', 'Blast Chilling — Temp Coming Out (°C)', 'Blast Chilling — Name 2',
    'Bags Produced', 'Supervisor Name', 'Corrective Actions',
    'Quality Check', 'Sample Taken',
  ]
  const rows = records.map((r) => {
    const fd = r.form_data || {}
    const c  = fd.cooking        || {}
    const p  = fd.packing        || {}
    const b  = fd.blast_chilling || {}
    return [
      ...commonCols(r),
      ...ingRow(r.ingredients || [], ingNames, true),
      val(c.start_time), val(c.name_1), val(c.finish_time), val(c.name_2),
      val(c.temp_after_cooking), val(c.after_hold_time), val(c.hold_temp),
      val(p.start_time), val(p.start_temp), val(p.name_1),
      val(p.finish_time), val(p.finish_temp), val(p.name_2),
      val(b.start_time), val(b.temp_going_in), val(b.name_1),
      val(b.finish_time), val(b.temp_coming_out), val(b.name_2),
      val(fd.bags_produced), val(fd.supervisor_name), val(fd.corrective_actions),
      val(fd.quality_check_value), yn(fd.sample_taken),
    ]
  })
  return { headers, rows }
}

// ─────────────────────────────────────────────────────────────────────────────
// Type 4 — Cook + Blast Chill + Sample Bag
// ─────────────────────────────────────────────────────────────────────────────
function buildType4(records) {
  const ingNames = collectIngNames(records)
  const uniquePackNames = [...new Set(
    records.flatMap((r) => (r.form_data?.pack_ingredients || []).map((i) => i.name))
  )]

  const headers = [
    ...COMMON_HEADERS,
    ...ingHeaders(ingNames, true),
    'Tumbling — Start Time', 'Tumbling — Finish Time',
    ...ingHeaders(uniquePackNames, true).map((h) => `Post-Rub: ${h}`),
    'Prep — Start Time', 'Name Filling', 'Prep — Finish Time', 'Name Packing',
    'Oven Number',
    'Cooking — Start Time', 'Cooking — Name 1', 'Cooking — Finish Time', 'Cooking — Name 2',
    'After Hold Time', 'Hold Temp (°C)',
    'Blast Chiller / Bath #',
    'Blast Chilling — Start Time', 'Blast Chilling — Temp In (°C)', 'Blast Chilling — Name 1',
    'Blast Chilling — Finish Time', 'Blast Chilling — Temp Out (°C)', 'Blast Chilling — Name 2',
    'Bags Produced', 'Supervisor Name', 'Corrective Actions',
    'Sample Taken',
    'Sample Date Code 1', 'Sample Date Code 2', 'Sample Date Code 3',
  ]

  const rows = records.map((r) => {
    const fd  = r.form_data || {}
    const pi  = fd.pack_ingredients || []
    const isB = r.product_key === 'barbacoa'
    return [
      ...commonCols(r),
      ...ingRow(r.ingredients || [], ingNames, true),
      val(fd.tumble_start_time), val(fd.tumble_finish_time),
      ...ingRow(pi, uniquePackNames, true),
      val(fd.prep_start_time), val(isB ? fd.name_filling : fd.prep_name),
      val(isB ? fd.prep_finish_time : fd.prep_finish_time_1),
      val(isB ? fd.name_packing : fd.name_filling),
      val(fd.oven_number),
      val(fd.cook_start_time), val(fd.cook_name_1), val(fd.cook_finish_time), val(fd.cook_name_2),
      val(fd.after_hold_time), val(fd.hold_temp),
      val(fd.blast_number),
      val(fd.blast_start_time), val(fd.blast_temp_in), val(fd.blast_name_1),
      val(fd.blast_finish_time), val(fd.blast_temp_out), val(fd.blast_name_2),
      val(fd.bags_produced), val(fd.supervisor_name), val(fd.corrective_actions),
      yn(fd.sample_taken),
      val(isB ? fd.sample_brisket_date_code : fd.sample_pork_date_code),
      val(isB ? fd.sample_bay_leaves_date_code : fd.sample_rub_date_code),
      val(isB ? '' : fd.sample_onions_date_code),
    ]
  })
  return { headers, rows }
}

// ─────────────────────────────────────────────────────────────────────────────
// Type 5 — Chicken Cooking (multi-batch, wide format)
// ─────────────────────────────────────────────────────────────────────────────
function buildType5(records) {
  const ingNames = collectIngNames(records)
  const batchCount = 5

  const ovenBatchHeaders = Array.from({ length: batchCount }, (_, i) => [
    `Oven Batch ${i+1} — Start`, `Oven Batch ${i+1} — Finish`,
    `Oven Batch ${i+1} — Temp 1 (°C)`, `Oven Batch ${i+1} — Temp 2 (°C)`, `Oven Batch ${i+1} — Temp 3 (°C)`,
    `Oven Batch ${i+1} — Comments`,
  ]).flat()

  const chillBatchHeaders = Array.from({ length: batchCount }, (_, i) => [
    `Chill Batch ${i+1} — Fridge`, `Chill Batch ${i+1} — Start`, `Chill Batch ${i+1} — Finish`,
    `Chill Batch ${i+1} — Temp Out 1 (°C)`, `Chill Batch ${i+1} — Temp Out 2 (°C)`,
    `Chill Batch ${i+1} — Comments`,
  ]).flat()

  const packRowHeaders = Array.from({ length: batchCount }, (_, i) => [
    `Pack Row ${i+1} — Start`, `Pack Row ${i+1} — Finish`,
    `Pack Row ${i+1} — # Bags`, `Pack Row ${i+1} — Temp (°C)`,
    `Pack Row ${i+1} — Corrective Actions`,
  ]).flat()

  const headers = [
    ...COMMON_HEADERS,
    ...ingHeaders(ingNames, true),
    'Oven Signatory 1', 'Oven Signatory 2',
    ...ovenBatchHeaders,
    'Chill Signatory 1', 'Chill Signatory 2',
    ...chillBatchHeaders,
    'Pack Signatory 1', 'Pack Signatory 2', 'Pack Signatory 3',
    ...packRowHeaders,
    'Supervisor Name', 'Samples Taken',
  ]

  const rows = records.map((r) => {
    const fd   = r.form_data || {}
    const ob   = fd.oven_batches    || Array.from({ length: batchCount }, () => ({}))
    const cb   = fd.chill_batches   || Array.from({ length: batchCount }, () => ({}))
    const pr   = fd.packing_rows    || Array.from({ length: batchCount }, () => ({}))
    const osig = fd.oven_signatories   || ['', '']
    const csig = fd.chill_signatories  || ['', '']
    const psig = fd.packing_signatories || ['', '', '']

    const ovenData = ob.slice(0, batchCount).flatMap((b) => [
      val(b.start_time), val(b.finish_time), val(b.temp_1), val(b.temp_2), val(b.temp_3), val(b.comments),
    ])
    const chillData = cb.slice(0, batchCount).flatMap((b) => [
      val(b.fridge), val(b.start_time), val(b.finish_time), val(b.temp_out_1), val(b.temp_out_2), val(b.comments),
    ])
    const packData = pr.slice(0, batchCount).flatMap((p) => [
      val(p.start_time), val(p.finish_time), val(p.bags), val(p.temperature), val(p.corrective_actions),
    ])

    return [
      ...commonCols(r),
      ...ingRow(r.ingredients || [], ingNames, true),
      val(osig[0]), val(osig[1]),
      ...ovenData,
      val(csig[0]), val(csig[1]),
      ...chillData,
      val(psig[0]), val(psig[1]), val(psig[2]),
      ...packData,
      val(fd.supervisor_name), yn(fd.samples_taken),
    ]
  })
  return { headers, rows }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
const SHEET_CONFIG = [
  { type: 1, name: 'Dry Rub',              build: buildType1 },
  { type: 2, name: 'Marinade & Brine',     build: buildType2 },
  { type: 3, name: 'Cook + Blast Chill',   build: buildType3 },
  { type: 4, name: 'Cook + BC + Sample',   build: buildType4 },
  { type: 5, name: 'Chicken Cooking',      build: buildType5 },
]

export async function downloadExcel(records) {
  const wb = new ExcelJS.Workbook()

  for (const { type, name, build } of SHEET_CONFIG) {
    const subset = records.filter((r) => r.form_type === type)
    if (subset.length === 0) continue
    const { headers, rows } = build(subset)
    addSheet(wb, name, headers, rows)
  }

  if (wb.worksheets.length === 0) return

  const buf  = await wb.xlsx.writeBuffer()
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `ccp-records-${todayISO()}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
