import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from './components/layout'
import {
  DashboardPage,
  TransactionsPage,
  SuppliersPage,
  CustomersPage,
  SettingsPage,
} from './pages'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App
