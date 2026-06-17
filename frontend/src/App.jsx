import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Upload from './pages/Upload.jsx';
import DocumentDetails from './pages/DocumentDetails.jsx';
import Chat from './pages/Chat.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      {}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/documents/:id" element={<DocumentDetails />} />
        <Route path="/documents/:id/chat" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
