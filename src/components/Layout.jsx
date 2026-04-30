import { Outlet } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'

export default function Layout({ session }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header session={session} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
      <Navigation />
    </div>
  )
}
