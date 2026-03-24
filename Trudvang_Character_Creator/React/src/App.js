import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login.js';
import ProtectedRoute from './ProtectedRoute.js';
import Dashboard from './Dashboard';
import CharacterSheet from './CharacterSheet';
import CharacterWizard from './CharacterWizard/WizardStepper';
import AdminPanel from './AdminPanel/ManageArchetypes';
import SiteHeader from './SiteHeader.js';
import './App.css';

export default function App() {
  return (
    <div className="App">
      <SiteHeader />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/create" element={
        <ProtectedRoute><CharacterWizard /></ProtectedRoute>
      } />
      <Route path="/character/:id" element={
        <ProtectedRoute><CharacterSheet /></ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </div>
  );
}
