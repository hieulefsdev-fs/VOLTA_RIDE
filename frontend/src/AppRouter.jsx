import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import AdminDashboard from './pages/admin/AdminDashboard';
import MainLayout from './components/layout/MainLayout';
import AiChatBox from './components/AiChatBox';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route element={<MainLayout />}>
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicles/:id" element={<VehicleDetail />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
      <AiChatBox />
    </BrowserRouter>
  );
}