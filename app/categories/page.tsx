'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { Card, SectionLabel } from '@/components/ui'
import { getAllCategories, saveCategory, deleteCategory, createCategory } from '@/lib/store'
import { useLang } from '@/lib/i18n'
import type { Category } from '@/lib/types'

const C = {
  card: '#0E0E16', card2: '#141422', card3: '#1A1A2E',
  border: '#1E1E30', border2: '#282840',
  accent: '#6382FF', success: '#34D98A', danger: '#F87171', warning: '#FBBF24',
  text: '#EDEDF0', muted: '#8080AA', muted2: '#4A4A70',
}

const field: React.CSSProperties = {
  padding: '9px 13px', borderRadius: 9, fontSize: 13, fontWeight: 500,
  color: C.text, background: C.card2, border: `1px solid ${C.border2}`,
  fontFamily: 'inherit', outline: 'none', width: '100%',
}

const ICONS = ['💻','📱','🎮','🖥','📟','🕹','📦','🖥️','⚙️','🖨','📺','⌚','🎧','📷','🔋','🖱','📡','🗂','🔌','💡']

export default function CategoriesPage() {
  const { t, lang } = useLang()
  const [categories, setCategories] = useState<Category[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('📦')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  function refresh() { setCategories(getAllCategories()) }
  useEffect(() => { refresh() }, [])

  function handleCreate() {
    if (!newName.trim()) return
    createCategory(newName.trim(), newIcon)
    setNewName(''); setNewIcon('📦'); setShowAdd(false)
    refresh()
  }

  function handleDelete(id: string, isDefault: boolean) {
    if (isDefault) return alert('{t.system_cats} не можна видалити')
    if (!confirm('Видалити категорію?')) return
    deleteCategory(id)
    refresh()
  }

  function handleRename(cat: Category) {
    if (!editName.trim()) return
    saveCategory({ ...cat, name: editName.trim() })
    setEditingId(null)
    refresh()
  }

  function handleToggle(cat: Category) {
    saveCategory({ ...cat, is_active: !cat.is_active })
    refresh()
  }

  const systemCats = categories.filter(c => c.is_default)
  const customCats = getAllCategories().filter(c => !c.is_default)

  return (
    <div className='page-wrap' style={{ padding: '28px 32px', maxWidth: 800 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, color: C.text }}>{t.categories_title}</h1>
          <p style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
            Керуйте категоріями. Характеристики та параметри налаштовуються на сторінці «Нова оцінка».
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 10,
          border: 'none', background: 'linear-gradient(135deg,#6382FF,#A78BFA)',
          color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer',
          boxShadow: '0 0 20px rgba(99,130,255,0.3)',
        }}>
          <Plus size={14} /> {t.new_category}
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <Card style={{ padding: 24, marginBottom: 16, border: '1px solid rgba(99,130,255,0.25)' }}>
          <SectionLabel>{t.new_category}</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 7 }}>Назва</p>
              <input style={field} placeholder="напр. Принтери, Телевізори..." value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()} autoFocus />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted2, textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: 7 }}>Іконка</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setNewIcon(ic)} style={{
                    width: 38, height: 38, borderRadius: 9,
                    border: `1px solid ${newIcon === ic ? C.accent : C.border2}`,
                    background: newIcon === ic ? 'rgba(99,130,255,0.15)' : C.card2,
                    fontSize: 18, cursor: 'pointer',
                  }}>{ic}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleCreate} style={{
                padding: '10px 20px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg,#6382FF,#A78BFA)', color: '#fff',
                fontFamily: 'inherit', fontWeight: 700, fontSize: 13, cursor: 'pointer',
              }}>Створити</button>
              <button onClick={() => { setShowAdd(false); setNewName(''); setNewIcon('📦') }} style={{
                padding: '10px 16px', borderRadius: 10, border: `1px solid ${C.border2}`,
                background: 'transparent', color: C.muted, fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
              }}>Скасувати</button>
            </div>
          </div>
        </Card>
      )}

      {/* System categories */}
      <Card style={{ padding: 24, marginBottom: 16 }}>
        <SectionLabel>{t.system_cats}</SectionLabel>
        <p style={{ fontSize: 12, color: C.muted2, marginBottom: 16, marginTop: -8 }}>
          {t.system_cats_sub}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {systemCats.map(cat => (
            <CategoryRow key={cat.id} cat={cat}
              isEditing={editingId === cat.id}
              editName={editName}
              onEditStart={() => { setEditingId(cat.id); setEditName(cat.name) }}
              onEditChange={setEditName}
              onEditSave={() => handleRename(cat)}
              onEditCancel={() => setEditingId(null)}
              onToggle={() => handleToggle(cat)}
              onDelete={() => handleDelete(cat.id, cat.is_default)}
              canDelete={false} lang={lang}
            />
          ))}
        </div>
      </Card>

      {/* Custom categories */}
      <Card style={{ padding: 24 }}>
        <SectionLabel>{t.custom_cats}</SectionLabel>
        {customCats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: C.muted2 }}>
            <p style={{ fontSize: 13 }}>{t.no_custom_cats}</p>
            <p style={{ fontSize: 11, marginTop: 4 }}>Натисніть «{t.new_category}» щоб створити</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {customCats.map(cat => (
              <CategoryRow key={cat.id} cat={cat}
                isEditing={editingId === cat.id}
                editName={editName}
                onEditStart={() => { setEditingId(cat.id); setEditName(cat.name) }}
                onEditChange={setEditName}
                onEditSave={() => handleRename(cat)}
                onEditCancel={() => setEditingId(null)}
                onToggle={() => handleToggle(cat)}
                onDelete={() => handleDelete(cat.id, cat.is_default)}
                canDelete={true} lang={lang}
              />
            ))}
          </div>
        )}
      </Card>

      <div style={{ marginTop: 16, padding: '14px 18px', borderRadius: 12, background: 'rgba(99,130,255,0.06)', border: '1px solid rgba(99,130,255,0.15)' }}>
        <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
          💡 Щоб додати характеристики, параметри або правила до категорії — перейдіть на сторінку <strong style={{ color: C.text }}>«Нова оцінка»</strong>, оберіть категорію та натисніть кнопки <strong style={{ color: C.text }}>«+ Поле»</strong> або <strong style={{ color: C.text }}>«+ Пункт»</strong>.
        </p>
      </div>
    </div>
  )
}

function CategoryRow({ cat, isEditing, editName, onEditStart, onEditChange, onEditSave, onEditCancel, onToggle, onDelete, canDelete, lang }: {
  cat: Category; isEditing: boolean; editName: string; canDelete: boolean; lang: string
  onEditStart: () => void; onEditChange: (v: string) => void
  onEditSave: () => void; onEditCancel: () => void
  onToggle: () => void; onDelete: () => void
}) {
  const fieldsLabel = lang==='uk'?'полів':'полей'
  const complLabel = lang==='uk'?'пунктів комплектності':'пунктов комплектации'
  const saveLabel = lang==='uk'?'Зберегти':'Сохранить'
  const enabledLabel = lang==='uk'?'Увімк.':'Вкл.'
  const disabledLabel = lang==='uk'?'Вимк.':'Выкл.'
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 10,
      background: cat.is_active ? 'transparent' : 'rgba(255,255,255,0.02)',
      border: '1px solid transparent',
      opacity: cat.is_active ? 1 : 0.5, transition: 'all 0.15s',
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{cat.icon}</span>

      {isEditing ? (
        <input
          autoFocus
          value={editName}
          onChange={e => onEditChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onEditSave(); if (e.key === 'Escape') onEditCancel() }}
          style={{ flex: 1, padding: '5px 10px', borderRadius: 7, border: `1px solid ${C.accent}`, background: C.card2, color: C.text, fontFamily: 'inherit', fontSize: 13, fontWeight: 600, outline: 'none' }}
        />
      ) : (
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{cat.name}</p>
          <p style={{ fontSize: 11, color: C.muted2 }}>
            {cat.fields.length} {fieldsLabel} · {cat.completeness.length} {complLabel}
            {cat.is_default && <span style={{ marginLeft: 8, padding: '1px 6px', borderRadius: 4, background: 'rgba(99,130,255,0.1)', color: C.accent, fontSize: 10, fontWeight: 700 }}>SYS</span>}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {isEditing ? (
          <>
            <button onClick={onEditSave} style={{ padding: '5px 10px', borderRadius: 7, border: 'none', background: 'rgba(52,217,138,0.15)', color: '#34D98A', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Check size={12} /> Зберегти
            </button>
            <button onClick={onEditCancel} style={{ padding: '5px 8px', borderRadius: 7, border: `1px solid ${C.border2}`, background: 'transparent', color: C.muted, cursor: 'pointer' }}>
              <X size={13} />
            </button>
          </>
        ) : (
          <>
            {/* Toggle */}
            <button onClick={onToggle} style={{
              padding: '4px 12px', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              border: `1px solid ${cat.is_active ? 'rgba(52,217,138,0.25)' : C.border2}`,
              background: cat.is_active ? 'rgba(52,217,138,0.08)' : 'rgba(255,255,255,0.03)',
              color: cat.is_active ? '#34D98A' : C.muted2,
            }}>
              {cat.is_active ? 'Увімк.' : 'Вимк.'}
            </button>

            {/* Rename */}
            <button onClick={onEditStart} style={{ padding: '6px', borderRadius: 7, border: `1px solid ${C.border2}`, background: 'transparent', color: C.muted2, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Edit2 size={13} />
            </button>

            {/* Delete */}
            {canDelete && (
              <button onClick={onDelete} style={{ padding: '6px', borderRadius: 7, border: '1px solid rgba(248,113,113,0.2)', background: 'transparent', color: '#F87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Trash2 size={13} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
