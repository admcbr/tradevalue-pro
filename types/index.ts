export type UserRole = 'owner' | 'employee'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  company_id: string
  created_at: string
}

export interface Company {
  id: string
  name: string
  created_at: string
}

export type DeviceCategory =
  | 'laptop'
  | 'pc'
  | 'gpu'
  | 'phone'
  | 'tablet'
  | 'console'
  | 'other'

export type DeviceCondition = 'Aplus' | 'A' | 'B' | 'C' | 'D'

export type EstimationStatus =
  | 'good'
  | 'caution'
  | 'rejected'
  | 'not_evaluated'

export type DealStatus = 'estimated' | 'bought' | 'refused' | 'sold'

export interface CompanyRules {
  id: string
  company_id: string
  default_buy_percent: number
  default_sell_percent: number
  min_profit: number
  min_profitability: number
  max_buy_price: number
  min_buy_price: number
  max_market_price: number
  min_market_price: number
}

export interface CategoryRule {
  id: string
  company_id: string
  category: DeviceCategory
  buy_percent: number
  sell_percent: number
  is_enabled: boolean
}

export interface BlockedBrand {
  id: string
  company_id: string
  brand: string
}

export interface BlockedModel {
  id: string
  company_id: string
  model: string
}

export interface CustomField {
  id: string
  company_id: string
  name: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'date'
  options?: string[]
  required: boolean
}

export interface CustomRule {
  id: string
  company_id: string
  field_name: string
  operator: 'eq' | 'neq' | 'lt' | 'gt' | 'lte' | 'gte'
  value: string
  action_type: 'reject' | 'reduce_amount' | 'reduce_percent'
  action_value: string
}

export interface Estimation {
  id: string
  company_id: string
  user_id: string
  category: DeviceCategory
  brand: string
  model: string
  cpu?: string
  gpu?: string
  ram?: string
  storage?: string
  condition: DeviceCondition
  completeness: string[]
  market_price: number
  buy_price: number
  sell_price: number
  profit: number
  profitability: number
  status: EstimationStatus
  deal_status: DealStatus
  actual_buy_price?: number
  actual_sell_price?: number
  custom_fields_data: Record<string, unknown>
  explanation: string[]
  comment?: string
  created_at: string
  // joined
  user_name?: string
}

export interface EstimationFormData {
  category: DeviceCategory | ''
  brand: string
  model: string
  cpu: string
  gpu: string
  ram: string
  storage: string
  condition: DeviceCondition | ''
  market_price: string
  completeness: {
    charger: boolean
    box: boolean
    docs: boolean
    warranty: boolean
    bag: boolean
  }
  battery_health: string
  water_damage: boolean
  bios_password: boolean
  was_repaired: boolean
  comment: string
  custom_specs?: Record<string, string>
}

export interface EstimationResult {
  status: EstimationStatus
  buy_price: number
  sell_price: number
  profit: number
  profitability: number
  explanation: string[]
  blocked_reason?: string
}

export interface DashboardStats {
  total_estimations: number
  potential_profit: number
  avg_profitability: number
  rejection_count: number
  by_category: Record<string, number>
  by_manager: Array<{ name: string; count: number; profit: number }>
  rejection_reasons: Array<{ reason: string; count: number }>
  recent: Estimation[]
}
