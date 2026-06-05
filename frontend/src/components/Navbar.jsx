import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../api';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  async function handleLogout() {
    await logoutUser();
    onLogout();
    navigate('/login');
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-3">
      <h1 className="text-lg font-bold text-slate-800">Task Manager</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">{user.username}</span>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}