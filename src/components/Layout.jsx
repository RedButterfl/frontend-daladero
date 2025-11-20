import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useState } from 'react'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
    {/* Sidebar */}
    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    
    {/* Main content */}
    <div className="flex-1 flex flex-col lg:ml-64">
      {/* Header */}
      <Header onMenuClick={() => setSidebarOpen(true)} />
      
      {/* Page content */}
      <main className="flex-1 p-6 lg:p-8 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
    
    {/* Overlay mobile – fond noir semi-transparent en dark aussi */}
    {sidebarOpen && (
      <div 
        className="fixed inset-0 bg-black/60 dark:bg-black/70 z-40 lg:hidden transition-opacity"
        onClick={() => setSidebarOpen(false)}
      />
    )}
  </div>
)
}