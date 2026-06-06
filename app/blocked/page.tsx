'use client'
import { useState } from 'react'
import { Plus, ShieldOff, AlertOctagon } from 'lucide-react'
import { useLang } from '@/lib/i18n'
import { Card, SectionLabel, RemovableTag } from '@/components/ui'

const C = { card2:'#141422', border2:'#282840', accent:'#6382FF', danger:'#F87171', text:'#EDEDF0', muted:'#8080AA', muted2:'#4A4A70', border:'#1E1E30' }
const fieldSt: React.CSSProperties = { flex:1, padding:'10px 14px', borderRadius:10, fontSize:13, fontWeight:500, color:C.text, background:C.card2, border:`1px solid ${C.border2}`, fontFamily:'inherit', outline:'none' }

export default function BlockedPage() {
  const { t } = useLang()
  const [brands, setBrands] = useState(['Prestigio','Irbis','DEXP','Ergo','Nomi'])
  const [models, setModels] = useState(['MacBook 2012','MacBook 2013','RTX 3080 Mining','iPhone 6'])
  const [newBrand, setNewBrand] = useState('')
  const [newModel, setNewModel] = useState('')

  const add = (list: string[], set: (v:string[])=>void, val: string, setVal: (v:string)=>void) => {
    const v = val.trim(); if(!v||list.includes(v))return; set([...list,v]); setVal('')
  }

  return (
    <div className='page-wrap' style={{ padding:'28px 32px', maxWidth:900 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:28, fontWeight:800, letterSpacing:-1, color:C.text }}>Заборонені бренди та моделі</h1>
        <p style={{ fontSize:13, color:C.muted, marginTop:4 }}>Ці позиції автоматично отримують відмову в оцінці</p>
      </div>
      <div className='rg-2' style={{ gap:16 }}>
        <Card style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <ShieldOff size={14} color={C.danger} />
            <SectionLabel style={{ marginBottom:0 }}>Заборонені бренди</SectionLabel>
          </div>
          <div style={{ minHeight:80, marginBottom:16, display:'flex', flexWrap:'wrap' }}>
            {brands.map(b => <RemovableTag key={b} onRemove={()=>setBrands(brands.filter(x=>x!==b))}>{b}</RemovableTag>)}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <input style={fieldSt} placeholder="Назва бренду" value={newBrand} onChange={e=>setNewBrand(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add(brands,setBrands,newBrand,setNewBrand)} />
            <button onClick={()=>add(brands,setBrands,newBrand,setNewBrand)} style={{ padding:'0 14px', borderRadius:10, border:`1px solid ${C.border2}`, background:C.card2, color:C.muted, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
              <Plus size={13} /> Додати
            </button>
          </div>
        </Card>
        <Card style={{ padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <AlertOctagon size={14} color={C.danger} />
            <SectionLabel style={{ marginBottom:0 }}>Заборонені моделі</SectionLabel>
          </div>
          <div style={{ minHeight:80, marginBottom:16, display:'flex', flexWrap:'wrap' }}>
            {models.map(m => <RemovableTag key={m} onRemove={()=>setModels(models.filter(x=>x!==m))}>{m}</RemovableTag>)}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <input style={fieldSt} placeholder="Назва моделі" value={newModel} onChange={e=>setNewModel(e.target.value)} onKeyDown={e=>e.key==='Enter'&&add(models,setModels,newModel,setNewModel)} />
            <button onClick={()=>add(models,setModels,newModel,setNewModel)} style={{ padding:'0 14px', borderRadius:10, border:`1px solid ${C.border2}`, background:C.card2, color:C.muted, cursor:'pointer', fontFamily:'inherit', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
              <Plus size={13} /> Додати
            </button>
          </div>
        </Card>
      </div>
      <div style={{ marginTop:16, padding:'16px 18px', borderRadius:12, background:'rgba(99,130,255,0.06)', border:'1px solid rgba(99,130,255,0.15)' }}>
        <p style={{ fontSize:12.5, color:C.muted, lineHeight:1.7 }}>
          💡 Глобальні заборони діють на всі категорії. Категорійні заборони налаштовуйте в налаштуваннях конкретної категорії.
        </p>
      </div>
    </div>
  )
}
