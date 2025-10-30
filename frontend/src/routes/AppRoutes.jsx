import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Landing from '../pages/Landing';
import Marketplace from '../pages/Marketplace';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';

export default function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-orders" element={<Dashboard />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </Layout>
  );
}
