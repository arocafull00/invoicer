import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '@/lib/stores';
import { useAuth } from '@/hooks/useAuth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { signOut } = useAuth();

  const navigation = [
    { name: 'Facturas', href: '/invoices', icon: FileText },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-surface/20">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-surface/20">
            <h1 className="text-xl font-bold text-primary">Invoicer</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-textMedium hover:text-text hover:bg-surface/50'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-surface/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-text">
                    {user?.email || 'Usuario'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-textMedium hover:text-text transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}; 