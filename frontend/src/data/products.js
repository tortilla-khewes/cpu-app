// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
export function addDays(dateStr, days) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
export function formatDate(isoDate) {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

function ing(name, std_quantity) {
  return { name, std_quantity, date_code: '', batch_mill_1: '', batch_mill_2: '', added: false }
}

function defaultCCP() {
  return { name_start: '', start_time: '', name_finish: '', finish_time: '', kg_produced: '', supervisor_name: '', corrective_actions: '' }
}

function defaultCookBlast() {
  return {
    cooking: { start_time: '', name_1: '', finish_time: '', name_2: '', temp_after_cooking: '', after_hold_time: '', hold_temp: '' },
    packing: { start_time: '', start_temp: '', name_1: '', finish_time: '', finish_temp: '', name_2: '' },
    blast_chilling: { start_time: '', temp_going_in: '', name_1: '', finish_time: '', temp_coming_out: '', name_2: '' },
    bags_produced: '',
    supervisor_name: '',
    corrective_actions: '',
    quality_check_value: '',
    sample_taken: false,
  }
}

function emptyBatch5() {
  return Array.from({ length: 5 }, () => ({}))
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPE 1 — Dry Rub
// ─────────────────────────────────────────────────────────────────────────────
const TYPE1 = {
  barbacoa_rub: {
    key: 'barbacoa_rub', name: 'Barbacoa Rub', form_type: 1,
    bags: 32, use_by_days: 8, batch_mill_columns: 2,
    lot_format: 'bags / date / month / year',
    ingredients: () => [
      ing('Cumin (gr)', '224g'),
      ing('Garlic Powder (gr)', '992g'),
      ing('Vegetable Bullion (gr)', '2.240kg'),
      ing('Salt (gr)', '64g'),
      ing('Chipotle Chilies (gr)', '32g'),
    ],
    defaultFormData: () => ({ ccp: defaultCCP() }),
  },
  pork_rub: {
    key: 'pork_rub', name: 'Pork Rub', form_type: 1,
    bags: 48, use_by_days: 8, batch_mill_columns: 1,
    lot_format: 'bags / date / month / year',
    ingredients: () => [
      ing('Cumin (gr)', '144g'),
      ing('Smoke Paprika (gr)', '1.680kg'),
      ing('Salt (gr)', '1.440kg'),
      ing('Vegetable Bullion (gr)', '1.920kg'),
    ],
    defaultFormData: () => ({ ccp: defaultCCP() }),
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPE 2 — Marinade / Brine
// ─────────────────────────────────────────────────────────────────────────────
const TYPE2 = {
  asado_marinate: {
    key: 'asado_marinate', name: 'Asado Marinate', form_type: 2,
    use_by_days: 24, batch_mill_columns: 2,
    lot_format: 'kg / date / month / year – batch',
    has_ph_check: true, ph_label: 'pH should be 5 or below',
    has_pack_role: true, quantity_unit: 'bags',
    ingredients: () => [
      ing('Orange Squash', '92 Lt'),
      ing('Lime Cordial', '11 Lt'),
      ing('Garlic Fresh', '47 Kg'),
      ing('Garlic Powder', '7 Kg'),
      ing('Guajillo Chili Flakes', '7 Kg'),
      ing('Achiote Paste', '16 Kg'),
      ing('Veg Bouillon', '55 Kg'),
      ing('Smoking Powder Sosa', '2 Kg'),
      ing('Water', '80 Lt'),
      ing('Vacuum Bags', ''),
    ],
    defaultFormData: () => ({
      prep_start_time: '', prep_name_start: '',
      prep_finish_time: '', prep_name_finish: '',
      bags_produced: '',
      pack_start_time: '', pack_name_start: '',
      pack_finish_time: '', pack_name_finish: '',
      supervisor_name: '',
      ph_reading: '',
      corrective_actions: '',
    }),
  },
  chicken_brine: {
    key: 'chicken_brine', name: 'Chicken Brine', form_type: 2,
    use_by_days: 2, batch_mill_columns: 1,
    lot_format: 'date / month / year – batch',
    has_ph_check: false, has_pack_role: false, quantity_unit: 'kg',
    ingredients: () => [
      ing('Water', '13.6 Lt'),
      ing('Sugar', '900g'),
      ing('Salt', '520g'),
    ],
    defaultFormData: () => ({ ccp: defaultCCP() }),
  },
  chicken_whole_marinate: {
    key: 'chicken_whole_marinate', name: 'Chicken Whole Marinate', form_type: 2,
    use_by_days: 2, batch_mill_columns: 2,
    lot_format: 'kg / date / month / year – batch',
    has_ph_check: false, has_tumbling: true, quantity_unit: 'kg',
    ingredients: () => [
      ing('Orange Squash', '5 Lt'),
      ing('Lime Cordial', '6 Lt'),
      ing('Cornflour', '800g'),
      ing('Garlic Fresh', '2.8 Kg'),
      ing('Garlic Powder', '2.8 Kg'),
      ing('Guajillo Chili Flakes', '400g'),
      ing('Achiote Paste', '1.2 Kg'),
      ing('Veg Bouillon', '2 Kg'),
      ing('Salt', '1.1 Kg'),
      ing('Smoking Powder Sosa', '200g'),
      ing('Chicken Leg Meat', '250 Kg'),
      ing('Brine', '15 Lt'),
    ],
    defaultFormData: () => ({
      liquid_start_time: '', liquid_name_start: '',
      liquid_finish_time: '', liquid_name_finish: '',
      tumble_start_time: '', tumble_name_start: '',
      tumble_finish_time: '', tumble_name_finish: '',
      kg_produced: '',
      supervisor_name: '',
      corrective_actions: '',
    }),
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPE 3 — Cook + Blast Chill
// ─────────────────────────────────────────────────────────────────────────────
const TYPE3 = {
  black_beans: {
    key: 'black_beans', name: 'Black Beans', form_type: 3,
    use_by_days: 14, batch_mill_columns: 2,
    quality_check: 'soft', quality_label: 'Have you tried them? Are they soft?',
    lot_format: 'date / month / year – batch',
    // Blast chilling threshold confirmed in source CCP document: "Need to be below 5°c"
    blast_chill_threshold: '5°C',
    ingredients: () => [
      ing('Black Beans', '140 Kg (5.6 bags)'),
      ing('Veg Bullion Powder', '3 Kg'),
      ing('Salt', '2 Kg'),
      ing('Yellow Onions Roasted', '12 Kg'),
      ing('Fresh Garlic Minced', '800g'),
      ing('Water', '280 Lt + 20 while cooking'),
      ing('Vacuum Bags', ''),
    ],
    defaultFormData: () => defaultCookBlast(),
  },
  pinto_beans: {
    key: 'pinto_beans', name: 'Pinto Beans', form_type: 3,
    use_by_days: 14, batch_mill_columns: 2,
    quality_check: 'soft', quality_label: 'Have you tried them? Are they soft?',
    lot_format: 'date / month / year – batch',
    // Blast chilling threshold confirmed in source CCP document: "Need to be below 5°c"
    blast_chill_threshold: '5°C',
    ingredients: () => [
      ing('Pinto Beans', '125 Kg'),
      ing('Diced Onion Roasted', '28 Kg'),
      ing('Minced Garlic', '2.6 Kg'),
      ing('Rapeseed Oil', '3 Lt'),
      ing('Pasilla Chili Flakes', '2.5 Kg'),
      ing('Salt', '2.2 Kg'),
      ing('Bouillon', '3.2 Kg'),
      ing('Bay Leaf', '30g'),
      ing('Water', '280 Lt + 15 when packing'),
      ing('Vacuum Bags', ''),
    ],
    defaultFormData: () => defaultCookBlast(),
  },
  roast_tomato_salsa: {
    key: 'roast_tomato_salsa', name: 'Roast Tomato Salsa', form_type: 3,
    use_by_days: 12, batch_mill_columns: 1,
    quality_check: 'ph', quality_label: 'pH should be 4.2 or below',
    lot_format: 'bags / date / month / year – batch',
    batch_sizes: [49, 98, 112, 126],
    ingredients_scaled: {
      49:  [ing('Tomato (washed)', '200 Kg'), ing('Jalapeno', '4.8 Kg'), ing('Onion Diced', '32.50 Kg'), ing('Garlic', '5.70 Kg'), ing('Salt', '3.10 Kg'), ing('Hot Water', '8 Lt'), ing('Vacuum Bags', '')],
      98:  [ing('Tomato (washed)', '402 Kg'), ing('Jalapeno', '9.5 Kg'),  ing('Onion Diced', '65 Kg'),    ing('Garlic', '11.40 Kg'),ing('Salt', '6.20 Kg'),  ing('Hot Water', '16 Lt'),ing('Vacuum Bags', '')],
      112: [ing('Tomato (washed)', '456 Kg'), ing('Jalapeno', '11 Kg'),   ing('Onion Diced', '75 Kg'),    ing('Garlic', '13 Kg'),   ing('Salt', '7.20 Kg'),  ing('Hot Water', '18 Lt'),ing('Vacuum Bags', '')],
      126: [ing('Tomato (washed)', '516 Kg'), ing('Jalapeno', '12.3 Kg'), ing('Onion Diced', '83 Kg'),    ing('Garlic', '14.6 Kg'), ing('Salt', '8.0 Kg'),   ing('Hot Water', '20 Lt'),ing('Vacuum Bags', '')],
    },
    defaultFormData: () => defaultCookBlast(),
  },
  salsa_roja: {
    key: 'salsa_roja', name: 'Salsa Roja', form_type: 3,
    use_by_days: 14, batch_mill_columns: 1,
    quality_check: 'ph', quality_label: 'pH should be 4.2 or below',
    lot_format: 'bags / date / month / year – batch',
    batch_sizes: [49, 98, 147],
    ingredients_scaled: {
      49:  [ing('Tin Tomato Plum', '30.6 Kg (12 Tins)'), ing('Tomato Paste', '2 Kg'),  ing('Garlic', '3.30 Kg'), ing('Onion Diced', '27.50 Kg'), ing('Chipotle Powder', '1.40 Kg'), ing('Paprika Powder', '660g'), ing('Guajillo Flakes', '5.90 Kg'), ing('Salt', '3.30 Kg'), ing('Habanero Paste', '30 Kg'), ing('Oil', '1.65 Lt'), ing('Water', '48 Lt'), ing('Vacuum Bag', '')],
      98:  [ing('Tin Tomato Plum', '58.65 Kg (24 Tins)'),ing('Tomato Paste', '4 Kg'),  ing('Garlic', '6.60 Kg'), ing('Onion Diced', '55 Kg'),    ing('Chipotle Powder', '2.85 Kg'), ing('Paprika Powder', '1.34 Kg'),ing('Guajillo Flakes', '12 Kg'),   ing('Salt', '6.70 Kg'), ing('Habanero Paste', '60 Kg'), ing('Oil', '3.35 Lt'),ing('Water', '97 Lt'), ing('Vacuum Bag', '')],
      147: [ing('Tin Tomato Plum', '94.35 Kg (36 Tins)'),ing('Tomato Paste', '6 Kg'),  ing('Garlic', '9.90 Kg'), ing('Onion Diced', '82.50 Kg'), ing('Chipotle Powder', '4.25 Kg'), ing('Paprika Powder', '2 Kg'),   ing('Guajillo Flakes', '17.90 Kg'),ing('Salt', '10 Kg'),  ing('Habanero Paste', '90 Kg'), ing('Oil', '5 Lt'),   ing('Water', '145 Lt'),ing('Vacuum Bag', '')],
    },
    defaultFormData: () => defaultCookBlast(),
  },
  salsa_pina_picanto: {
    key: 'salsa_pina_picanto', name: 'Salsa Pina Picanto', form_type: 3,
    use_by_days: 27, batch_mill_columns: 1,
    quality_check: 'ph', quality_label: 'pH must be 4 or below',
    lot_format: 'bags / date / month / year – batch',
    batch_sizes: [49, 98, 147],
    ingredients_scaled: {
      49:  [ing('Tinned Pineapple (inc. Water)', '120 Kg (40 Tins)'), ing('Habanero Paste', '7 Lt'),  ing('Lime Juice', '9 Lt'),  ing('Salt', '160g'),  ing('Red Chillis', '1.50 Kg'), ing('Water', '10 Lt'), ing('Vacuum Bag', '')],
      98:  [ing('Tinned Pineapple (inc. Water)', '240 Kg (80 Tins)'), ing('Habanero Paste', '14 Lt'), ing('Lime Juice', '18 Lt'), ing('Salt', '320g'),  ing('Red Chillis', '3 Kg'),    ing('Water', '20 Lt'), ing('Vacuum Bag', '')],
      147: [ing('Tinned Pineapple (inc. Water)', '360 Kg (120 Tins)'),ing('Habanero Paste', '21 Lt'), ing('Lime Juice', '27 Lt'), ing('Salt', '480g'),  ing('Red Chillis', '4.50 Kg'), ing('Water', '30 Lt'), ing('Vacuum Bag', '')],
    },
    defaultFormData: () => defaultCookBlast(),
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPE 4 — Cook + Blast Chill + Sample Bag
// ─────────────────────────────────────────────────────────────────────────────
const TYPE4 = {
  barbacoa: {
    key: 'barbacoa', name: 'Barbacoa', form_type: 4,
    use_by_days: 14, batch_mill_columns: 2,
    has_tumbling: true,
    lot_format: 'bags / date / month / year – batch',
    // Pre-rub ingredients (Table 1) — go in record.ingredients
    ingredients: () => [
      ing('Brisket (Kg)', '154.88 Kg'),
      ing('Barbacoa Rub (gr)', '5.152 Kg'),
      ing('Pasilla Chili Flakes', '1.60 Kg'),
    ],
    defaultFormData: () => ({
      // Fix 6: Tumbling times moved from per-row to section level
      tumble_start_time: '',
      tumble_finish_time: '',
      // Post-rub ingredients per bag (Table 2)
      pack_ingredients: [
        ing('Beef Rubbed', '5 Kg'),
        ing('Bay Leaves Washed', '2 per bag'),
        ing('Vacuum Pouches', ''),
      ],
      prep_start_time: '', name_filling: '',
      prep_finish_time: '', name_packing: '',
      oven_number: '',
      cook_start_time: '', cook_name_1: '', cook_finish_time: '', cook_name_2: '',
      after_hold_time: '', hold_temp: '',
      blast_number: '',
      blast_start_time: '', blast_temp_in: '', blast_name_1: '',
      blast_finish_time: '', blast_temp_out: '', blast_name_2: '',
      bags_produced: '',
      supervisor_name: '',
      corrective_actions: '',
      sample_brisket_date_code: '',
      sample_bay_leaves_date_code: '',
      sample_taken: false,
    }),
    sample_bag: [
      { name: 'Rubbed Brisket (Kg)', qty: '0.249 Gr' },
      { name: 'Bay Leaves (leaves)', qty: '1' },
      { name: 'Total', qty: '0.250 Gr' },
    ],
  },
  pork: {
    key: 'pork', name: 'Pork', form_type: 4,
    use_by_days: 14, batch_mill_columns: 2,
    has_tumbling: false,
    lot_format: 'bags / date / month / year – batch',
    ingredients: () => [
      ing('Pork Collar / Shoulder (Kg)', '4.640 Kg'),
      ing('Pork Rub (gr)', '108g'),
      ing('Diced Onions', '260g'),
      ing('Vacuum Pouches', ''),
    ],
    defaultFormData: () => ({
      prep_start_time: '', prep_name: '',
      prep_finish_time_1: '', name_filling: '',
      prep_finish_time_2: '', name_packing: '',
      oven_number: '',
      cook_start_time: '', cook_name_1: '', cook_finish_time: '', cook_name_2: '',
      after_hold_time: '', hold_temp: '',
      blast_number: '',
      blast_start_time: '', blast_temp_in: '', blast_name_1: '',
      blast_finish_time: '', blast_temp_out: '', blast_name_2: '',
      bags_produced: '',
      supervisor_name: '',
      corrective_actions: '',
      sample_pork_date_code: '',
      sample_rub_date_code: '',
      sample_onions_date_code: '',
      sample_taken: false,
    }),
    sample_bag: [
      { name: 'Pork (Kg)', qty: '232g' },
      { name: 'Pork Rub (gr)', qty: '5g' },
      { name: 'Onions', qty: '13g' },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPE 5 — Chicken Cooking (multi-batch)
// ─────────────────────────────────────────────────────────────────────────────
const TYPE5 = {
  chicken_asado: {
    key: 'chicken_asado', name: 'Chicken Asado', form_type: 5,
    use_by_days: 14, batch_mill_columns: 2,
    lot_format: 'date / month / year – batch',
    ingredients: () => [
      ing('Marinated Chicken', '250 Kg'),
      ing('Vacuum Pouches', ''),
    ],
    defaultFormData: () => ({
      oven_signatories: ['', ''],
      oven_batches: Array.from({ length: 5 }, () => ({ start_time: '', finish_time: '', temp_1: '', temp_2: '', temp_3: '', comments: '' })),
      chill_signatories: ['', ''],
      chill_batches: Array.from({ length: 5 }, () => ({ fridge: '', start_time: '', finish_time: '', temp_out_1: '', temp_out_2: '', comments: '' })),
      packing_signatories: ['', '', ''],
      packing_rows: Array.from({ length: 5 }, () => ({ start_time: '', finish_time: '', bags: '', temperature: '', corrective_actions: '' })),
      supervisor_name: '',
      samples_taken: false,
    }),
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
export const PRODUCTS = { ...TYPE1, ...TYPE2, ...TYPE3, ...TYPE4, ...TYPE5 }

export const PRODUCTS_BY_TYPE = {
  1: Object.values(TYPE1),
  2: Object.values(TYPE2),
  3: Object.values(TYPE3),
  4: Object.values(TYPE4),
  5: Object.values(TYPE5),
}

export const TYPE_LABELS = {
  1: 'Dry Rub',
  2: 'Marinade / Brine',
  3: 'Cook + Blast Chill',
  4: 'Cook + Blast Chill + Sample Bag',
  5: 'Chicken Cooking',
}

export const ALL_PRODUCTS = Object.values(PRODUCTS)
