import { Link, NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-lg transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:text-slate-900'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-brand-700">
          <span className="text-xl">🧠</span> Smart Docs
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/upload" className={linkClass}>
            Upload
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            Profile
          </NavLink>
          <span className="mx-2 hidden text-sm text-slate-400 sm:inline">
            {user?.name}
          </span>
          <button onClick={handleLogout} className="btn-ghost">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
