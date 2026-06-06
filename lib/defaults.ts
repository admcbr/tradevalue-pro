import type { Category } from './types'

function id() { return Math.random().toString(36).slice(2, 9) }

export const DEFAULT_CATEGORIES: Category[] = [
  // ── Ноутбуки ────────────────────────────────────────────────────────────────
  {
    id: 'cat_laptop', company_id: '1', name: 'Ноутбуки', icon: '💻',
    is_default: true, is_active: true,
    blocked_brands: ['Prestigio', 'Irbis', 'DEXP', 'Ergo'],
    blocked_models: ['MacBook 2012', 'MacBook 2013'],
    rules: { buy_percent: 20, sell_percent: 5, min_buy_price: 3000, max_buy_price: 60000, min_market_price: 4000, max_market_price: 90000 },
    completeness: [
      { id: 'lc1', category_id: 'cat_laptop', name: 'Зарядний пристрій', impact_type: 'sub_amount', impact_value: 800, block_estimation: false, is_active: true, sort_order: 0 },
      { id: 'lc2', category_id: 'cat_laptop', name: 'Коробка', impact_type: 'add_amount', impact_value: 300, block_estimation: false, is_active: true, sort_order: 1 },
      { id: 'lc3', category_id: 'cat_laptop', name: 'Документи', impact_type: 'sub_amount', impact_value: 200, block_estimation: false, is_active: true, sort_order: 2 },
      { id: 'lc4', category_id: 'cat_laptop', name: 'Гарантія', impact_type: 'add_amount', impact_value: 500, block_estimation: false, is_active: true, sort_order: 3 },
      { id: 'lc5', category_id: 'cat_laptop', name: 'Сумка', impact_type: 'add_amount', impact_value: 200, block_estimation: false, is_active: true, sort_order: 4 },
    ],
    fields: [
      {
        id: 'lf_brand', category_id: 'cat_laptop', name: 'Бренд', type: 'select',
        is_required: true, affects_price: false, show_in_stats: true, sort_order: 0,
        options: [
          { id: id(), field_id: 'lf_brand', name: 'Apple',   impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'lf_brand', name: 'ASUS',    impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'lf_brand', name: 'Lenovo',  impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 2 },
          { id: id(), field_id: 'lf_brand', name: 'HP',      impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 3 },
          { id: id(), field_id: 'lf_brand', name: 'Dell',    impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 4 },
          { id: id(), field_id: 'lf_brand', name: 'MSI',     impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 5 },
          { id: id(), field_id: 'lf_brand', name: 'Acer',    impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 6 },
          { id: id(), field_id: 'lf_brand', name: 'Razer',   impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 7 },
          { id: id(), field_id: 'lf_brand', name: 'Samsung', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 8 },
        ],
      },
      {
        id: 'lf_model', category_id: 'cat_laptop', name: 'Модель', type: 'text',
        is_required: true, affects_price: false, show_in_stats: true, sort_order: 1, options: [],
      },
      {
        id: 'lf_cpu', category_id: 'cat_laptop', name: 'Процесор', type: 'select',
        is_required: true, affects_price: false, show_in_stats: true, sort_order: 2,
        options: [
          { id: id(), field_id: 'lf_cpu', name: 'Apple M1',          impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'lf_cpu', name: 'Apple M2',          impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'lf_cpu', name: 'Apple M3',          impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 2 },
          { id: id(), field_id: 'lf_cpu', name: 'Apple M4',          impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 3 },
          { id: id(), field_id: 'lf_cpu', name: 'Intel Core i5 11-го покоління', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 4 },
          { id: id(), field_id: 'lf_cpu', name: 'Intel Core i5 12-го покоління', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 5 },
          { id: id(), field_id: 'lf_cpu', name: 'Intel Core i5 13-го покоління', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 6 },
          { id: id(), field_id: 'lf_cpu', name: 'Intel Core i7 11-го покоління', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 7 },
          { id: id(), field_id: 'lf_cpu', name: 'Intel Core i7 12-го покоління', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 8 },
          { id: id(), field_id: 'lf_cpu', name: 'Intel Core i7 13-го покоління', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 9 },
          { id: id(), field_id: 'lf_cpu', name: 'Intel Core i9 12-го покоління', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 10 },
          { id: id(), field_id: 'lf_cpu', name: 'AMD Ryzen 5 5600H',  impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 11 },
          { id: id(), field_id: 'lf_cpu', name: 'AMD Ryzen 7 5800H',  impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 12 },
          { id: id(), field_id: 'lf_cpu', name: 'AMD Ryzen 7 6800H',  impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 13 },
          { id: id(), field_id: 'lf_cpu', name: 'AMD Ryzen 9 7945HX', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 14 },
        ],
      },
      {
        id: 'lf_gpu', category_id: 'cat_laptop', name: 'Відеокарта', type: 'select',
        is_required: false, affects_price: false, show_in_stats: true, sort_order: 3,
        options: [
          { id: id(), field_id: 'lf_gpu', name: 'Інтегрована',          impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'lf_gpu', name: 'NVIDIA RTX 3050',      impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'lf_gpu', name: 'NVIDIA RTX 3060',      impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 2 },
          { id: id(), field_id: 'lf_gpu', name: 'NVIDIA RTX 3070',      impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 3 },
          { id: id(), field_id: 'lf_gpu', name: 'NVIDIA RTX 4060',      impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 4 },
          { id: id(), field_id: 'lf_gpu', name: 'NVIDIA RTX 4070',      impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 5 },
          { id: id(), field_id: 'lf_gpu', name: 'AMD Radeon RX 6600M',  impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 6 },
          { id: id(), field_id: 'lf_gpu', name: 'AMD Radeon RX 7700M',  impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 7 },
        ],
      },
      {
        id: 'lf_ram', category_id: 'cat_laptop', name: 'Оперативна пам\'ять', type: 'select',
        is_required: true, affects_price: false, show_in_stats: true, sort_order: 4,
        options: [
          { id: id(), field_id: 'lf_ram', name: '4 GB',  impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'lf_ram', name: '8 GB',  impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'lf_ram', name: '16 GB', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 2 },
          { id: id(), field_id: 'lf_ram', name: '32 GB', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 3 },
          { id: id(), field_id: 'lf_ram', name: '64 GB', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 4 },
        ],
      },
      {
        id: 'lf_storage', category_id: 'cat_laptop', name: 'Накопичувач', type: 'select',
        is_required: true, affects_price: false, show_in_stats: true, sort_order: 5,
        options: [
          { id: id(), field_id: 'lf_storage', name: '128 GB SSD', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'lf_storage', name: '256 GB SSD', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'lf_storage', name: '512 GB SSD', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 2 },
          { id: id(), field_id: 'lf_storage', name: '1 TB SSD',   impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 3 },
          { id: id(), field_id: 'lf_storage', name: '2 TB SSD',   impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 4 },
        ],
      },
      {
        id: 'lf_screen', category_id: 'cat_laptop', name: 'Діагональ', type: 'select',
        is_required: false, affects_price: false, show_in_stats: false, sort_order: 6,
        options: [
          { id: id(), field_id: 'lf_screen', name: '13"',   impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'lf_screen', name: '14"',   impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'lf_screen', name: '15.6"', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 2 },
          { id: id(), field_id: 'lf_screen', name: '16"',   impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 3 },
          { id: id(), field_id: 'lf_screen', name: '17.3"', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 4 },
        ],
      },
      {
        id: 'lf_condition', category_id: 'cat_laptop', name: 'Стан', type: 'select',
        is_required: true, affects_price: true, show_in_stats: true, sort_order: 7,
        options: [
          { id: id(), field_id: 'lf_condition', name: 'A+ — як новий',    impact_type: 'add_percent', impact_value: 5,  block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'lf_condition', name: 'A — відмінний',    impact_type: 'none',        impact_value: 0,  block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'lf_condition', name: 'B — добрий',       impact_type: 'sub_percent', impact_value: 8,  block_estimation: false, sort_order: 2 },
          { id: id(), field_id: 'lf_condition', name: 'C — задовільний',  impact_type: 'sub_percent', impact_value: 18, block_estimation: false, sort_order: 3 },
          { id: id(), field_id: 'lf_condition', name: 'D — поганий',      impact_type: 'none',        impact_value: 0,  block_estimation: true,  sort_order: 4 },
        ],
      },
      {
        id: 'lf_battery', category_id: 'cat_laptop', name: 'Здоров\'я батареї (%)', type: 'number',
        is_required: false, affects_price: true, show_in_stats: true, sort_order: 8, options: [],
      },
      {
        id: 'lf_water', category_id: 'cat_laptop', name: 'Сліди залиття', type: 'checkbox',
        is_required: true, affects_price: true, show_in_stats: true, sort_order: 9,
        options: [
          { id: id(), field_id: 'lf_water', name: 'Так', impact_type: 'none', impact_value: 0, block_estimation: true,  sort_order: 0 },
          { id: id(), field_id: 'lf_water', name: 'Ні',  impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 1 },
        ],
      },
      {
        id: 'lf_bios', category_id: 'cat_laptop', name: 'Пароль BIOS', type: 'checkbox',
        is_required: true, affects_price: true, show_in_stats: true, sort_order: 10,
        options: [
          { id: id(), field_id: 'lf_bios', name: 'Так', impact_type: 'none', impact_value: 0, block_estimation: true,  sort_order: 0 },
          { id: id(), field_id: 'lf_bios', name: 'Ні',  impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 1 },
        ],
      },
    ],
  },

  // ── Смартфони ────────────────────────────────────────────────────────────────
  {
    id: 'cat_phone', company_id: '1', name: 'Смартфони', icon: '📱',
    is_default: true, is_active: true,
    blocked_brands: ['Prestigio', 'Nomi', 'DEXP'],
    blocked_models: ['iPhone 6', 'iPhone 6s'],
    rules: { buy_percent: 15, sell_percent: 5, min_buy_price: 1500, max_buy_price: 40000, min_market_price: 2000, max_market_price: 60000 },
    completeness: [
      { id: 'pc1', category_id: 'cat_phone', name: 'Коробка',        impact_type: 'add_amount', impact_value: 300, block_estimation: false, is_active: true, sort_order: 0 },
      { id: 'pc2', category_id: 'cat_phone', name: 'Кабель',         impact_type: 'sub_amount', impact_value: 200, block_estimation: false, is_active: true, sort_order: 1 },
      { id: 'pc3', category_id: 'cat_phone', name: 'Зарядний блок',  impact_type: 'sub_amount', impact_value: 300, block_estimation: false, is_active: true, sort_order: 2 },
      { id: 'pc4', category_id: 'cat_phone', name: 'Документи',      impact_type: 'sub_amount', impact_value: 100, block_estimation: false, is_active: true, sort_order: 3 },
      { id: 'pc5', category_id: 'cat_phone', name: 'Гарантія',       impact_type: 'add_amount', impact_value: 500, block_estimation: false, is_active: true, sort_order: 4 },
    ],
    fields: [
      { id: 'pf_brand', category_id: 'cat_phone', name: 'Бренд', type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 0,
        options: ['Apple','Samsung','Xiaomi','Google','OnePlus','Motorola','Huawei','Oppo','Realme','Nothing'].map((n,i) => ({ id: id(), field_id: 'pf_brand', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'pf_model', category_id: 'cat_phone', name: 'Модель', type: 'text', is_required: true, affects_price: false, show_in_stats: true, sort_order: 1, options: [] },
      { id: 'pf_storage', category_id: 'cat_phone', name: 'Пам\'ять', type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 2,
        options: ['64 GB','128 GB','256 GB','512 GB','1 TB'].map((n,i) => ({ id: id(), field_id: 'pf_storage', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'pf_battery', category_id: 'cat_phone', name: 'Стан батареї (%)', type: 'number', is_required: false, affects_price: true, show_in_stats: true, sort_order: 3, options: [] },
      { id: 'pf_body', category_id: 'cat_phone', name: 'Стан корпусу', type: 'select', is_required: true, affects_price: true, show_in_stats: true, sort_order: 4,
        options: [
          { id: id(), field_id: 'pf_body', name: 'Ідеальний',              impact_type: 'none',        impact_value: 0,  block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'pf_body', name: 'Мікропотертості',        impact_type: 'none',        impact_value: 0,  block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'pf_body', name: 'Подряпини',              impact_type: 'sub_percent', impact_value: 5,  block_estimation: false, sort_order: 2 },
          { id: id(), field_id: 'pf_body', name: 'Тріщина (рамка)',        impact_type: 'sub_percent', impact_value: 12, block_estimation: false, sort_order: 3 },
          { id: id(), field_id: 'pf_body', name: 'Тріщина (екран)',        impact_type: 'sub_percent', impact_value: 25, block_estimation: false, sort_order: 4 },
          { id: id(), field_id: 'pf_body', name: 'Розбитий екран',         impact_type: 'none',        impact_value: 0,  block_estimation: true,  sort_order: 5 },
        ] },
      { id: 'pf_faceid', category_id: 'cat_phone', name: 'Face ID / Touch ID', type: 'select', is_required: false, affects_price: true, show_in_stats: false, sort_order: 5,
        options: [
          { id: id(), field_id: 'pf_faceid', name: 'Працює',       impact_type: 'none',        impact_value: 0,  block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'pf_faceid', name: 'Не працює',    impact_type: 'sub_percent', impact_value: 15, block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'pf_faceid', name: 'Не підтримує', impact_type: 'none',        impact_value: 0,  block_estimation: false, sort_order: 2 },
        ] },
      { id: 'pf_icloud', category_id: 'cat_phone', name: 'iCloud / Google Account', type: 'select', is_required: true, affects_price: true, show_in_stats: false, sort_order: 6,
        options: [
          { id: id(), field_id: 'pf_icloud', name: 'Розблокований', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'pf_icloud', name: 'Заблокований',  impact_type: 'none', impact_value: 0, block_estimation: true,  sort_order: 1 },
        ] },
    ],
  },

  // ── Відеокарти ───────────────────────────────────────────────────────────────
  {
    id: 'cat_gpu', company_id: '1', name: 'Відеокарти', icon: '🎮',
    is_default: true, is_active: true,
    blocked_brands: [],
    blocked_models: ['RTX 3080 Mining', 'RX 580 Mining'],
    rules: { buy_percent: 30, sell_percent: 5, min_buy_price: 2000, max_buy_price: 50000, min_market_price: 3000, max_market_price: 80000 },
    completeness: [
      { id: 'gc1', category_id: 'cat_gpu', name: 'Коробка',     impact_type: 'add_amount', impact_value: 500,  block_estimation: false, is_active: true, sort_order: 0 },
      { id: 'gc2', category_id: 'cat_gpu', name: 'Документи',   impact_type: 'add_amount', impact_value: 200,  block_estimation: false, is_active: true, sort_order: 1 },
      { id: 'gc3', category_id: 'cat_gpu', name: 'Гарантія',    impact_type: 'add_amount', impact_value: 1000, block_estimation: false, is_active: true, sort_order: 2 },
      { id: 'gc4', category_id: 'cat_gpu', name: 'Пломби',      impact_type: 'none',       impact_value: 0,    block_estimation: true,  is_active: true, sort_order: 3 },
      { id: 'gc5', category_id: 'cat_gpu', name: 'Перехідники', impact_type: 'add_amount', impact_value: 100,  block_estimation: false, is_active: true, sort_order: 4 },
    ],
    fields: [
      { id: 'gf_brand', category_id: 'cat_gpu', name: 'Виробник', type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 0,
        options: ['ASUS','MSI','Gigabyte','Zotac','Sapphire','PowerColor','XFX','Palit','Gainward'].map((n,i) => ({ id: id(), field_id: 'gf_brand', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'gf_model', category_id: 'cat_gpu', name: 'Модель GPU', type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 1,
        options: ['RTX 4090','RTX 4080 Super','RTX 4080','RTX 4070 Ti Super','RTX 4070 Ti','RTX 4070 Super','RTX 4070','RTX 4060 Ti','RTX 4060','RTX 3090 Ti','RTX 3090','RTX 3080 Ti','RTX 3080','RTX 3070 Ti','RTX 3070','RTX 3060 Ti','RTX 3060','RX 7900 XTX','RX 7900 XT','RX 7800 XT','RX 7700 XT','RX 7600','RX 6900 XT','RX 6800 XT','RX 6700 XT','RX 6600 XT'].map((n,i) => ({ id: id(), field_id: 'gf_model', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'gf_vram', category_id: 'cat_gpu', name: "Об'єм VRAM", type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 2,
        options: ['4 GB','6 GB','8 GB','10 GB','12 GB','16 GB','20 GB','24 GB'].map((n,i) => ({ id: id(), field_id: 'gf_vram', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'gf_memtype', category_id: 'cat_gpu', name: 'Тип пам\'яті', type: 'select', is_required: false, affects_price: false, show_in_stats: false, sort_order: 3,
        options: ['GDDR6','GDDR6X','GDDR7'].map((n,i) => ({ id: id(), field_id: 'gf_memtype', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'gf_condition', category_id: 'cat_gpu', name: 'Стан', type: 'select', is_required: true, affects_price: true, show_in_stats: true, sort_order: 4,
        options: [
          { id: id(), field_id: 'gf_condition', name: 'Новий (з гарантією)', impact_type: 'add_percent', impact_value: 5,  block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'gf_condition', name: 'Б/у — як новий',      impact_type: 'none',        impact_value: 0,  block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'gf_condition', name: 'Б/у — добрий',        impact_type: 'sub_percent', impact_value: 8,  block_estimation: false, sort_order: 2 },
          { id: id(), field_id: 'gf_condition', name: 'Б/у — задовільний',   impact_type: 'sub_percent', impact_value: 20, block_estimation: false, sort_order: 3 },
        ] },
      { id: 'gf_mining', category_id: 'cat_gpu', name: 'Використовувалась для майнінгу', type: 'select', is_required: true, affects_price: true, show_in_stats: true, sort_order: 5,
        options: [
          { id: id(), field_id: 'gf_mining', name: 'Ні',        impact_type: 'none',        impact_value: 0,  block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'gf_mining', name: 'Так',       impact_type: 'sub_percent', impact_value: 30, block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'gf_mining', name: 'Невідомо',  impact_type: 'sub_percent', impact_value: 15, block_estimation: false, sort_order: 2 },
        ] },
    ],
  },

  // ── ПК ───────────────────────────────────────────────────────────────────────
  {
    id: 'cat_pc', company_id: '1', name: 'ПК', icon: '🖥',
    is_default: true, is_active: true,
    blocked_brands: [], blocked_models: [],
    rules: { buy_percent: 25, sell_percent: 5, min_buy_price: 3000, max_buy_price: 70000, min_market_price: 4000, max_market_price: 100000 },
    completeness: [
      { id: 'pcc1', category_id: 'cat_pc', name: 'Кабель живлення', impact_type: 'sub_amount', impact_value: 200, block_estimation: false, is_active: true, sort_order: 0 },
      { id: 'pcc2', category_id: 'cat_pc', name: 'Коробка',         impact_type: 'add_amount', impact_value: 300, block_estimation: false, is_active: true, sort_order: 1 },
    ],
    fields: [
      { id: 'pcf_cpu', category_id: 'cat_pc', name: 'Процесор', type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 0,
        options: ['Intel Core i5 12-го','Intel Core i5 13-го','Intel Core i7 12-го','Intel Core i7 13-го','Intel Core i9 13-го','AMD Ryzen 5 5600','AMD Ryzen 5 7600','AMD Ryzen 7 5700X','AMD Ryzen 7 7700X','AMD Ryzen 9 7900X'].map((n,i) => ({ id: id(), field_id: 'pcf_cpu', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'pcf_gpu', category_id: 'cat_pc', name: 'Відеокарта', type: 'select', is_required: false, affects_price: false, show_in_stats: true, sort_order: 1,
        options: ['Інтегрована','RTX 4060','RTX 4070','RTX 4080','RTX 4090','RTX 3060','RTX 3070','RTX 3080','RX 6700 XT','RX 6800 XT','RX 7800 XT'].map((n,i) => ({ id: id(), field_id: 'pcf_gpu', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'pcf_ram', category_id: 'cat_pc', name: 'Оперативна пам\'ять', type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 2,
        options: ['8 GB','16 GB','32 GB','64 GB','128 GB'].map((n,i) => ({ id: id(), field_id: 'pcf_ram', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'pcf_storage', category_id: 'cat_pc', name: 'Накопичувач', type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 3,
        options: ['256 GB SSD','512 GB SSD','1 TB SSD','2 TB SSD','1 TB HDD','2 TB HDD'].map((n,i) => ({ id: id(), field_id: 'pcf_storage', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'pcf_condition', category_id: 'cat_pc', name: 'Стан', type: 'select', is_required: true, affects_price: true, show_in_stats: true, sort_order: 4,
        options: [
          { id: id(), field_id: 'pcf_condition', name: 'A+ — як новий', impact_type: 'add_percent', impact_value: 5, block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'pcf_condition', name: 'A — відмінний', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'pcf_condition', name: 'B — добрий', impact_type: 'sub_percent', impact_value: 8, block_estimation: false, sort_order: 2 },
          { id: id(), field_id: 'pcf_condition', name: 'C — задовільний', impact_type: 'sub_percent', impact_value: 18, block_estimation: false, sort_order: 3 },
          { id: id(), field_id: 'pcf_condition', name: 'D — поганий', impact_type: 'none', impact_value: 0, block_estimation: true, sort_order: 4 },
        ] },
    ],
  },

  // ── Планшети ─────────────────────────────────────────────────────────────────
  {
    id: 'cat_tablet', company_id: '1', name: 'Планшети', icon: '📟',
    is_default: true, is_active: true,
    blocked_brands: ['Prestigio'], blocked_models: [],
    rules: { buy_percent: 18, sell_percent: 5, min_buy_price: 2000, max_buy_price: 35000, min_market_price: 3000, max_market_price: 50000 },
    completeness: [
      { id: 'tc1', category_id: 'cat_tablet', name: 'Коробка',       impact_type: 'add_amount', impact_value: 300, block_estimation: false, is_active: true, sort_order: 0 },
      { id: 'tc2', category_id: 'cat_tablet', name: 'Зарядний блок', impact_type: 'sub_amount', impact_value: 400, block_estimation: false, is_active: true, sort_order: 1 },
      { id: 'tc3', category_id: 'cat_tablet', name: 'Стілус',        impact_type: 'add_amount', impact_value: 500, block_estimation: false, is_active: true, sort_order: 2 },
      { id: 'tc4', category_id: 'cat_tablet', name: 'Клавіатура',    impact_type: 'add_amount', impact_value: 800, block_estimation: false, is_active: true, sort_order: 3 },
    ],
    fields: [
      { id: 'tf_brand', category_id: 'cat_tablet', name: 'Бренд', type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 0,
        options: ['Apple','Samsung','Lenovo','Microsoft','Huawei'].map((n,i) => ({ id: id(), field_id: 'tf_brand', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'tf_model', category_id: 'cat_tablet', name: 'Модель', type: 'text', is_required: true, affects_price: false, show_in_stats: true, sort_order: 1, options: [] },
      { id: 'tf_storage', category_id: 'cat_tablet', name: 'Пам\'ять', type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 2,
        options: ['64 GB','128 GB','256 GB','512 GB','1 TB'].map((n,i) => ({ id: id(), field_id: 'tf_storage', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'tf_condition', category_id: 'cat_tablet', name: 'Стан', type: 'select', is_required: true, affects_price: true, show_in_stats: true, sort_order: 3,
        options: [
          { id: id(), field_id: 'tf_condition', name: 'A+ — як новий', impact_type: 'add_percent', impact_value: 5, block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'tf_condition', name: 'A — відмінний', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'tf_condition', name: 'B — добрий', impact_type: 'sub_percent', impact_value: 8, block_estimation: false, sort_order: 2 },
          { id: id(), field_id: 'tf_condition', name: 'C — задовільний', impact_type: 'sub_percent', impact_value: 18, block_estimation: false, sort_order: 3 },
          { id: id(), field_id: 'tf_condition', name: 'D — поганий', impact_type: 'none', impact_value: 0, block_estimation: true, sort_order: 4 },
        ] },
    ],
  },

  // ── Консолі ───────────────────────────────────────────────────────────────────
  {
    id: 'cat_console', company_id: '1', name: 'Консолі', icon: '🕹',
    is_default: true, is_active: true,
    blocked_brands: [], blocked_models: [],
    rules: { buy_percent: 20, sell_percent: 5, min_buy_price: 2000, max_buy_price: 30000, min_market_price: 3000, max_market_price: 45000 },
    completeness: [
      { id: 'cc1', category_id: 'cat_console', name: 'Контролер',     impact_type: 'sub_amount', impact_value: 800, block_estimation: false, is_active: true, sort_order: 0 },
      { id: 'cc2', category_id: 'cat_console', name: 'Кабель HDMI',   impact_type: 'sub_amount', impact_value: 200, block_estimation: false, is_active: true, sort_order: 1 },
      { id: 'cc3', category_id: 'cat_console', name: 'Блок живлення', impact_type: 'sub_amount', impact_value: 400, block_estimation: false, is_active: true, sort_order: 2 },
      { id: 'cc4', category_id: 'cat_console', name: 'Коробка',       impact_type: 'add_amount', impact_value: 300, block_estimation: false, is_active: true, sort_order: 3 },
    ],
    fields: [
      { id: 'cf_brand', category_id: 'cat_console', name: 'Бренд', type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 0,
        options: ['Sony','Microsoft','Nintendo'].map((n,i) => ({ id: id(), field_id: 'cf_brand', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'cf_model', category_id: 'cat_console', name: 'Модель', type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 1,
        options: ['PlayStation 5','PlayStation 4 Pro','PlayStation 4','Xbox Series X','Xbox Series S','Xbox One X','Nintendo Switch OLED','Nintendo Switch'].map((n,i) => ({ id: id(), field_id: 'cf_model', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'cf_condition', category_id: 'cat_console', name: 'Стан', type: 'select', is_required: true, affects_price: true, show_in_stats: true, sort_order: 2,
        options: [
          { id: id(), field_id: 'cf_condition', name: 'A — відмінний', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'cf_condition', name: 'B — добрий', impact_type: 'sub_percent', impact_value: 10, block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'cf_condition', name: 'C — задовільний', impact_type: 'sub_percent', impact_value: 20, block_estimation: false, sort_order: 2 },
        ] },
      { id: 'cf_hacked', category_id: 'cat_console', name: 'Прошита (Jailbreak)', type: 'select', is_required: false, affects_price: true, show_in_stats: false, sort_order: 3,
        options: [
          { id: id(), field_id: 'cf_hacked', name: 'Ні',  impact_type: 'none',        impact_value: 0, block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'cf_hacked', name: 'Так', impact_type: 'sub_percent', impact_value: 10, block_estimation: false, sort_order: 1 },
        ] },
    ],
  },

  // ── Монітори ──────────────────────────────────────────────────────────────────
  {
    id: 'cat_monitor', company_id: '1', name: 'Монітори', icon: '🖥️',
    is_default: true, is_active: true,
    blocked_brands: [], blocked_models: [],
    rules: { buy_percent: 25, sell_percent: 5, min_buy_price: 1500, max_buy_price: 30000, min_market_price: 2000, max_market_price: 50000 },
    completeness: [
      { id: 'mc1', category_id: 'cat_monitor', name: 'Кабель живлення', impact_type: 'sub_amount', impact_value: 200, block_estimation: false, is_active: true, sort_order: 0 },
      { id: 'mc2', category_id: 'cat_monitor', name: 'Кабель HDMI/DP',  impact_type: 'sub_amount', impact_value: 200, block_estimation: false, is_active: true, sort_order: 1 },
      { id: 'mc3', category_id: 'cat_monitor', name: 'Підставка',       impact_type: 'sub_amount', impact_value: 300, block_estimation: false, is_active: true, sort_order: 2 },
      { id: 'mc4', category_id: 'cat_monitor', name: 'Коробка',         impact_type: 'add_amount', impact_value: 300, block_estimation: false, is_active: true, sort_order: 3 },
    ],
    fields: [
      { id: 'mf_brand', category_id: 'cat_monitor', name: 'Бренд', type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 0,
        options: ['LG','Samsung','ASUS','Acer','Dell','BenQ','AOC','MSI','Gigabyte'].map((n,i) => ({ id: id(), field_id: 'mf_brand', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'mf_model', category_id: 'cat_monitor', name: 'Модель', type: 'text', is_required: true, affects_price: false, show_in_stats: true, sort_order: 1, options: [] },
      { id: 'mf_size', category_id: 'cat_monitor', name: 'Діагональ', type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 2,
        options: ['21.5"','23.8"','24"','27"','31.5"','34"','38"','49"'].map((n,i) => ({ id: id(), field_id: 'mf_size', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'mf_res', category_id: 'cat_monitor', name: 'Роздільна здатність', type: 'select', is_required: false, affects_price: false, show_in_stats: true, sort_order: 3,
        options: ['FHD (1080p)','2K (1440p)','4K (2160p)','Ultrawide'].map((n,i) => ({ id: id(), field_id: 'mf_res', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'mf_panel', category_id: 'cat_monitor', name: 'Тип матриці', type: 'select', is_required: false, affects_price: false, show_in_stats: false, sort_order: 4,
        options: ['IPS','VA','TN','OLED','Mini-LED'].map((n,i) => ({ id: id(), field_id: 'mf_panel', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'mf_condition', category_id: 'cat_monitor', name: 'Стан', type: 'select', is_required: true, affects_price: true, show_in_stats: true, sort_order: 5,
        options: [
          { id: id(), field_id: 'mf_condition', name: 'A — відмінний',   impact_type: 'none',        impact_value: 0,  block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'mf_condition', name: 'B — добрий',      impact_type: 'sub_percent', impact_value: 8,  block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'mf_condition', name: 'C — задовільний', impact_type: 'sub_percent', impact_value: 18, block_estimation: false, sort_order: 2 },
          { id: id(), field_id: 'mf_condition', name: 'Є дефекти матриці', impact_type: 'none', impact_value: 0, block_estimation: true, sort_order: 3 },
        ] },
    ],
  },

  // ── Комплектуючі ─────────────────────────────────────────────────────────────
  {
    id: 'cat_parts', company_id: '1', name: 'Комплектуючі', icon: '⚙️',
    is_default: true, is_active: true,
    blocked_brands: [], blocked_models: [],
    rules: { buy_percent: 30, sell_percent: 5, min_buy_price: 500, max_buy_price: 20000, min_market_price: 800, max_market_price: 30000 },
    completeness: [
      { id: 'ptc1', category_id: 'cat_parts', name: 'Коробка',   impact_type: 'add_amount', impact_value: 200, block_estimation: false, is_active: true, sort_order: 0 },
      { id: 'ptc2', category_id: 'cat_parts', name: 'Гарантія',  impact_type: 'add_amount', impact_value: 300, block_estimation: false, is_active: true, sort_order: 1 },
    ],
    fields: [
      { id: 'ptf_type', category_id: 'cat_parts', name: 'Тип комплектуючого', type: 'select', is_required: true, affects_price: false, show_in_stats: true, sort_order: 0,
        options: ['Процесор','Материнська плата','Оперативна пам\'ять','Накопичувач SSD','Накопичувач HDD','Блок живлення','Кулер CPU','Корпус','Звукова карта','Мережева карта'].map((n,i) => ({ id: id(), field_id: 'ptf_type', name: n, impact_type: 'none' as const, impact_value: 0, block_estimation: false, sort_order: i })) },
      { id: 'ptf_brand', category_id: 'cat_parts', name: 'Бренд', type: 'text', is_required: true, affects_price: false, show_in_stats: true, sort_order: 1, options: [] },
      { id: 'ptf_model', category_id: 'cat_parts', name: 'Модель', type: 'text', is_required: true, affects_price: false, show_in_stats: true, sort_order: 2, options: [] },
      { id: 'ptf_condition', category_id: 'cat_parts', name: 'Стан', type: 'select', is_required: true, affects_price: true, show_in_stats: true, sort_order: 3,
        options: [
          { id: id(), field_id: 'ptf_condition', name: 'Новий', impact_type: 'add_percent', impact_value: 5, block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'ptf_condition', name: 'Б/у — добрий', impact_type: 'none', impact_value: 0, block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'ptf_condition', name: 'Б/у — задовільний', impact_type: 'sub_percent', impact_value: 15, block_estimation: false, sort_order: 2 },
          { id: id(), field_id: 'ptf_condition', name: 'Несправний', impact_type: 'none', impact_value: 0, block_estimation: true, sort_order: 3 },
        ] },
    ],
  },

  // ── Інше ─────────────────────────────────────────────────────────────────────
  {
    id: 'cat_other', company_id: '1', name: 'Інше', icon: '📦',
    is_default: true, is_active: true,
    blocked_brands: [], blocked_models: [],
    rules: { buy_percent: 25, sell_percent: 5, min_buy_price: 500, max_buy_price: 50000, min_market_price: 800, max_market_price: 80000 },
    completeness: [
      { id: 'oc1', category_id: 'cat_other', name: 'Коробка',  impact_type: 'add_amount', impact_value: 200, block_estimation: false, is_active: true, sort_order: 0 },
      { id: 'oc2', category_id: 'cat_other', name: 'Гарантія', impact_type: 'add_amount', impact_value: 300, block_estimation: false, is_active: true, sort_order: 1 },
    ],
    fields: [
      { id: 'of_name',  category_id: 'cat_other', name: 'Назва товару', type: 'text', is_required: true, affects_price: false, show_in_stats: true, sort_order: 0, options: [] },
      { id: 'of_brand', category_id: 'cat_other', name: 'Бренд',        type: 'text', is_required: false, affects_price: false, show_in_stats: true, sort_order: 1, options: [] },
      { id: 'of_condition', category_id: 'cat_other', name: 'Стан', type: 'select', is_required: true, affects_price: true, show_in_stats: true, sort_order: 2,
        options: [
          { id: id(), field_id: 'of_condition', name: 'A — добрий',      impact_type: 'none',        impact_value: 0,  block_estimation: false, sort_order: 0 },
          { id: id(), field_id: 'of_condition', name: 'B — задовільний', impact_type: 'sub_percent', impact_value: 15, block_estimation: false, sort_order: 1 },
          { id: id(), field_id: 'of_condition', name: 'C — поганий',     impact_type: 'none',        impact_value: 0,  block_estimation: true,  sort_order: 2 },
        ] },
    ],
  },
]
