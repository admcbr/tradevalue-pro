export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#07070C', minHeight: '100vh' }}>
      {children}
    </div>
  )
}
