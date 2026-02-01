import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout';
import {
  DashboardPage,
  TransactionsPage,
  InventoryPage,
  SuppliersPage,
  CustomersPage,
  SettingsPage,
  NotFoundPage,
} from './pages';
import { SupabaseProvider } from './context/SupabaseContext';
import { QueryProvider } from './context/QueryContext';
import './App.css';

function App() {
  return (
    <SupabaseProvider>
      <QueryProvider>
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/suppliers" element={<SuppliersPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </QueryProvider>
    </SupabaseProvider>
  );
}

export default App;
