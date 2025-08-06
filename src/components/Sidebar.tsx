import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Settings, BarChart3, Users, LogOut, Home } from 'lucide-react';
import { useAuthStore } from '@/lib/stores';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { signOut } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Facturas', href: '/invoices', icon: FileText },
    { name: 'Configuración', href: '/settings', icon: Settings },
    { name: 'Reportes', href: '/reports', icon: BarChart3 },
    { name: 'Clientes', href: '/clients', icon: Users },
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
    <div className={`w-72 bg-[#0D0D0D] border-r border-[#FFFFFF14] flex flex-col flex-1 h-full ${className}`}>
      {/* Logo */}
      <div className="p-6 border-b border-[#FFFFFF14]">
        <h1 className="text-2xl font-bold text-[#7F5AF0]">Invoicer</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-3 rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-300 ${
                  isActive
                    ? 'bg-[#7F5AF0] text-white'
                    : 'text-[#A1A1AA] hover:text-white hover:bg-[#FFFFFF14]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className={isActive ? 'font-medium' : ''}>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-[#FFFFFF14]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#FFFFFF14] cursor-pointer flex-1">
            <div className="w-8 h-8 bg-[#7F5AF0] rounded-full flex items-center justify-center text-sm font-bold text-white">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">
                {user?.email || 'Usuario'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 text-[#A1A1AA] hover:text-white transition-colors ml-2"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}; 