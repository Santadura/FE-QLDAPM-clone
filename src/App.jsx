import { useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Classes from './pages/Classes'
import PlaceholderPage from './pages/PlaceholderPage'
import { ROLES } from './config/roles'

function App() {
  // Demo: chon role de xem giao dien tuong ung (thay bang thong tin dang nhap that khi noi BE)
  const [roleKey, setRoleKey] = useState('ADMIN')
  const role = ROLES[roleKey]

  // Gom toan bo path tu tat ca section cua role hien tai, tranh trung route
  const allItems = useMemo(() => {
    const items = []
    const seen = new Set()
    role.sections.forEach((section) =>
      section.items.forEach((item) => {
        if (!seen.has(item.path)) {
          seen.add(item.path)
          items.push(item)
        }
      })
    )
    return items
  }, [role])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout role={role} onChangeRole={setRoleKey} />}>
          {allItems.map((item) =>
            item.path === '/' ? (
              <Route key={item.path} index element={<Dashboard role={role} />} />
            ) : item.path === '/students' ? (
              <Route key={item.path} path="students" element={<Students />} />
            ) : item.path.startsWith('/classes') ? (
              <Route
                key={item.path}
                path={item.path.slice(1)}
                element={<Classes />}
              />
            ) : (
              <Route
                key={item.path}
                path={item.path.slice(1)}
                element={<PlaceholderPage title={item.label} />}
              />
            )
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
