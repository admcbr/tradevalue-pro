// ─── Field & Option types ────────────────────────────────────────────────────

export type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'date'

export type ImpactType =
  | 'none'
  | 'add_amount'      // +N ₴
  | 'sub_amount'      // −N ₴
  | 'add_percent'     // +N %
  | 'sub_percent'     // −N %
  | 'block'           // reject estimation

export interface FieldOption {
  id: string
  field_id: string
  name: string
  impact_type: ImpactType
  impact_value: number   // 0 if none/block
  block_estimation: boolean
  sort_order: number
}

export interface CategoryField {
  id: string
  category_id: string
  name: string
  type: FieldType
  is_required: boolean
  affects_price: boolean
  show_in_stats: boolean
  sort_order: number
  options: FieldOption[]   // populated for select fields
}

// ─── Completeness ────────────────────────────────────────────────────────────

export interface CompletenessItem {
  id: string
  category_id: string
  name: string
  impact_type: ImpactType
  impact_value: number
  block_estimation: boolean
  is_active: boolean
  sort_order: number
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string
  company_id: string
  name: string
  icon: string
  is_default: boolean   // shipped with app
  is_active: boolean
  fields: CategoryField[]
  completeness: CompletenessItem[]
  rules: CategoryRules
  blocked_brands: string[]
  blocked_models: string[]
}

// ─── Rules ───────────────────────────────────────────────────────────────────

export interface CategoryRules {
  buy_percent: number
  sell_percent: number
  min_buy_price: number
  max_buy_price: number
  min_market_price: number
  max_market_price: number
}

export interface CompanyRules {
  default_buy_percent: number
  default_sell_percent: number
  min_buy_price: number
  max_buy_price: number
  min_market_price: number
  max_market_price: number
}

// ─── Estimation ──────────────────────────────────────────────────────────────

export type EstimationStatus = 'good' | 'caution' | 'rejected' | 'not_evaluated'
export type DealStatus = 'estimated' | 'bought' | 'refused' | 'sold'
export type EvalType = 'buyout' | 'tradein'

export interface EstimationValue {
  field_id: string
  field_name: string
  option_id?: string
  value: string
}

export interface Estimation {
  id: string
  company_id: string
  category_id: string
  category_name: string
  user_id: string
  user_name: string
  eval_type: EvalType
  market_price: number
  buy_price: number
  sell_price: number
  profit: number
  profitability: number
  status: EstimationStatus
  deal_status: DealStatus
  explanation: string[]
  blocked_reason?: string
  values: EstimationValue[]
  completeness_values: string[]   // ids of present items
  comment: string
  created_at: string
}

// ─── Result (transient, not stored) ──────────────────────────────────────────

export interface EstimationResult {
  status: EstimationStatus
  buy_price: number
  sell_price: number
  profit: number
  profitability: number
  explanation: string[]
  blocked_reason?: string
}

// ─── User & Permissions ──────────────────────────────────────────────────────

export type HistoryScope = 'none' | 'own' | 'all' | 'branch'
export type StatsScope   = 'none' | 'own' | 'all'
export type RulesAccess  = 'none' | 'add_options' | 'add_fields' | 'full'

export interface UserPermissions {
  can_view_history: boolean
  history_scope: HistoryScope
  can_view_statistics: boolean
  statistics_scope: StatsScope
  can_edit_rules: RulesAccess
  can_add_categories: boolean
}

export type UserRole = 'owner' | 'admin' | 'manager' | 'viewer'

export interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  company_id: string
  permissions: UserPermissions
}
