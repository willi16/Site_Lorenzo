import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Logo } from '@/components/layout/Logo';
import { currentUser, logout, type AdminUser } from '@/lib/adminApi';

const NAV = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/contenu/posts', label: 'Actualités', icon: FileText },
  { to: '/admin/contenu/projects', label: 'Réalisations', icon: Building2 },
  { to: '/admin/contenu/services', label: 'Services', icon: LayoutDashboard },
  { to: '/admin/contenu/testimonials', label: 'Témoignages', icon: Users },
  { to: '/admin/contenu/team', label: 'Équipe', icon: Users },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    currentUser()
      .then((u) => {
        if (!active) return;
        if (!u) {
          navigate('/admin/login', { replace: true, state: { from: location.pathname } });
          return;
        }
        setUser(u);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [navigate, location.pathname]);

  const signOut = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-100">
        <p className="text-sm text-ink-500">Vérification de la session…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-cream-100 lg:flex">
      <aside className="shrink-0 bg-navy-800 text-white lg:w-64">
        <div className="flex items-center justify-between px-5 py-5 lg:block">
          <Link to="/admin" className="inline-flex items-center">
            <Logo tone="light" />
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-6">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                    isActive
                      ? 'bg-clay-500 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-800/[0.07] bg-white px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest2 text-clay-600">
              Espace administration
            </p>
            <p className="mt-0.5 text-sm font-semibold text-navy-800">{user.name}</p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-navy-700/5 hover:text-navy-800"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Déconnexion
          </button>
        </header>

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
