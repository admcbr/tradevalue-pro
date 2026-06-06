import type { Category, CategoryField, FieldOption, CompletenessItem, Estimation, CompanyRules } from './types'
import { DEFAULT_CATEGORIES } from './defaults'

const KEYS = {
  categories:  'tv_categories',
  estimations: 'tv_estimations',
  rules:       'tv_company_rules',
  overrides:   'tv_cat_overrides',   // per-category user edits for default cats
}

export function genId() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36) }

// ─── Company rules ────────────────────────────────────────────────────────────

const DEFAULT_RULES: CompanyRules = {
  default_buy_percent: 20, default_sell_percent: 5,
  min_buy_price: 2000, max_buy_price: 60000,
  min_market_price: 2000, max_market_price: 90000,
}

export function getCompanyRules(): CompanyRules {
  if (typeof window === 'undefined') return DEFAULT_RULES
  try { return JSON.parse(localStorage.getItem(KEYS.rules) || 'null') ?? DEFAULT_RULES }
  catch { return DEFAULT_RULES }
}
export function saveCompanyRules(r: CompanyRules) {
  localStorage.setItem(KEYS.rules, JSON.stringify(r))
}

// ─── Categories ───────────────────────────────────────────────────────────────

function getOverrides(): Record<string, Partial<Category>> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(KEYS.overrides) || '{}') }
  catch { return {} }
}
function saveOverride(id: string, patch: Partial<Category>) {
  const ov = getOverrides()
  ov[id] = { ...(ov[id] || {}), ...patch }
  localStorage.setItem(KEYS.overrides, JSON.stringify(ov))
}

function getCustomCategories(): Category[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEYS.categories) || '[]') }
  catch { return [] }
}

export function getAllCategories(): Category[] {
  const overrides = getOverrides()
  const defaults = DEFAULT_CATEGORIES.map(cat => {
    const ov = overrides[cat.id]
    return ov ? { ...cat, ...ov } : cat
  })
  const custom = getCustomCategories()
  return [...defaults, ...custom].filter(c => c.is_active)
}

export function getCategoryById(id: string): Category | undefined {
  return getAllCategories().find(c => c.id === id)
}

export function saveCategory(cat: Category) {
  if (cat.is_default) {
    // For default cats: store only the mutable parts as an override
    saveOverride(cat.id, {
      fields: cat.fields,
      completeness: cat.completeness,
      rules: cat.rules,
      blocked_brands: cat.blocked_brands,
      blocked_models: cat.blocked_models,
    })
  } else {
    const custom = getCustomCategories()
    const idx = custom.findIndex(c => c.id === cat.id)
    if (idx >= 0) custom[idx] = cat; else custom.push(cat)
    localStorage.setItem(KEYS.categories, JSON.stringify(custom))
  }
}

export function deleteCategory(id: string) {
  const custom = getCustomCategories().filter(c => c.id !== id)
  localStorage.setItem(KEYS.categories, JSON.stringify(custom))
}

export function addOptionToField(categoryId: string, fieldId: string, option: FieldOption) {
  const cat = getAllCategories().find(c => c.id === categoryId)
  if (!cat) return
  const fields = cat.fields.map(f =>
    f.id === fieldId ? { ...f, options: [...f.options, option] } : f
  )
  saveCategory({ ...cat, fields })
}

export function addFieldToCategory(categoryId: string, field: CategoryField) {
  const cat = getAllCategories().find(c => c.id === categoryId)
  if (!cat) return
  saveCategory({ ...cat, fields: [...cat.fields, field] })
}

export function addCompletenessItem(categoryId: string, item: CompletenessItem) {
  const cat = getAllCategories().find(c => c.id === categoryId)
  if (!cat) return
  saveCategory({ ...cat, completeness: [...cat.completeness, item] })
}

export function updateCompletenessItem(categoryId: string, itemId: string, patch: Partial<CompletenessItem>) {
  const cat = getAllCategories().find(c => c.id === categoryId)
  if (!cat) return
  const completeness = cat.completeness.map(c => c.id === itemId ? { ...c, ...patch } : c)
  saveCategory({ ...cat, completeness })
}

export function createCategory(name: string, icon: string): Category {
  const cat: Category = {
    id: 'cat_' + genId(), company_id: '1', name, icon,
    is_default: false, is_active: true,
    fields: [], completeness: [], blocked_brands: [], blocked_models: [],
    rules: { buy_percent: 20, sell_percent: 5, min_buy_price: 2000, max_buy_price: 50000, min_market_price: 3000, max_market_price: 80000 },
  }
  saveCategory(cat)
  return cat
}

// ─── Estimations ──────────────────────────────────────────────────────────────

export function getAllEstimations(): Estimation[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEYS.estimations) || '[]') }
  catch { return [] }
}

export function saveEstimation(est: Estimation) {
  const all = getAllEstimations()
  const idx = all.findIndex(e => e.id === est.id)
  if (idx >= 0) all[idx] = est; else all.unshift(est)
  localStorage.setItem(KEYS.estimations, JSON.stringify(all))
}

export function deleteEstimation(id: string) {
  const all = getAllEstimations().filter(e => e.id !== id)
  localStorage.setItem(KEYS.estimations, JSON.stringify(all))
}

export function updateDealStatus(id: string, status: string, price?: number) {
  const all = getAllEstimations()
  const idx = all.findIndex(e => e.id === id)
  if (idx < 0) return
  all[idx] = { ...all[idx], deal_status: status as any, ...(price ? { actual_price: price } : {}) }
  localStorage.setItem(KEYS.estimations, JSON.stringify(all))
}
