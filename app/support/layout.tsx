import Sidebar from '@/components/layout/Sidebar'
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar />
      <main style={{ flex:1, overflowY:'auto', background:'#09090E' }}>{children}</main>
    </div>
  )
}
