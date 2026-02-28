'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Ticket, 
  Settings,
  BarChart,
  Shield,
  LogOut,
  ChevronDown,
  ChevronRight,
  List,
  Plus,
  UserPlus,
  UserPlus2,
  Terminal,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import authService from '@/services/auth';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Usuários',
    icon: Users,
    subItems: [
      {
        title: 'Listar Usuários',
        href: '/dashboard/usuarios',
        icon: List,
      },
      {
        title: 'Novo Administrador',
        href: '/dashboard/usuarios/novo',
        icon: UserPlus,
      },
    ],
  },
  {
    title: 'Lojas',
    icon: Store,
    subItems: [
      {
        title: 'Listar Lojas',
        href: '/dashboard/lojas',
        icon: List,
      },
      {
        title: 'Nova Loja + Usuário',
        href: '/dashboard/lojas/nova-com-usuario',
        icon: UserPlus2,
      },
    ],
  },
  {
    title: 'Cupons',
    icon: Ticket,
    subItems: [
      {
        title: 'Listar Cupons',
        href: '/dashboard/cupons',
        icon: List,
      },
      {
        title: 'Novo Cupom',
        href: '/dashboard/cupons/novo',
        icon: Plus,
      },
    ],
  }, 
  {
    title: 'Clientes',
    icon: Users,
    subItems: [
      {
        title: 'Listar Clientes',
        href: '/dashboard/clientes',
        icon: List,
      },
      {
        title: 'Novo Cliente',
        href: '/dashboard/clientes/novo',
        icon: UserPlus,
      },
    ],
  },
  {
    title: 'Logs do Sistema',
    href: '/dashboard/logs',
    icon: Terminal,
    roles: ['superadmin'],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = authService.getCurrentUser();
  const [openMenus, setOpenMenus] = useState<string[]>(['Usuários', 'Lojas']);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMenu = (title: string) => {
    setOpenMenus(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Fechar mobile ao mudar de rota
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isMenuOpen = (title: string) => openMenus.includes(title);

  // Filtra itens baseado na role do usuário
  const filteredItems = menuItems.filter(item => {
    if (item.roles) {
      return item.roles.includes(user?.role || '');
    }
    
    if (item.title === 'Usuários') {
      return user?.role === 'superadmin' || user?.role === 'admin';
    }
    if (item.title === 'Lojas') {
      return user?.role === 'superadmin' || user?.role === 'admin';
    }
    return true;
  });

  const isSubItemActive = (href: string) => pathname === href;

  return (
    <>
      {/* Botão do menu mobile */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-md border border-gray-200"
        aria-label="Abrir menu"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5 text-gray-600" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600" />
        )}
      </button>

      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-200 min-h-screen flex flex-col transition-all duration-300",
        // Mobile: posicionamento absoluto
        "fixed lg:relative z-50",
        isMobileOpen ? "left-0" : "-left-64 lg:left-0",
        "w-64",
        // Sombra no mobile
        isMobileOpen && "shadow-xl"
      )}>
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
          {/* Badge de Role */}
          <div className="mb-4 sm:mb-6 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Acesso como:</p>
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-900 capitalize truncate">
                {user?.role === 'superadmin' ? 'Super Admin' : 'Administrador'}
              </span>
            </div>
          </div>

          {/* Menu */}
          <nav className="space-y-1">
            {filteredItems.map((item) => {
              // Se for item com subitens
              if (item.subItems) {
                const isOpen = isMenuOpen(item.title);
                const Icon = item.icon;
                
                return (
                  <div key={item.title} className="space-y-1">
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className={cn(
                        'w-full flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors',
                        'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium truncate">{item.title}</span>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    
                    {isOpen && (
                      <div className="ml-4 sm:ml-6 pl-3 sm:pl-4 border-l border-gray-200 space-y-1">
                        {item.subItems.map((subItem) => {
                          const isActive = isSubItemActive(subItem.href);
                          const SubIcon = subItem.icon;
                          
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={cn(
                                'flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors',
                                isActive 
                                  ? 'bg-blue-50 text-blue-600' 
                                  : 'text-gray-600 hover:bg-gray-50'
                              )}
                            >
                              <SubIcon className={cn(
                                'h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0',
                                isActive ? 'text-blue-600' : 'text-gray-400'
                              )} />
                              <span className="text-xs sm:text-sm truncate">{subItem.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Se for item simples (sem subitens)
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors',
                    isActive 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className={cn(
                    'h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0',
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  )} />
                  <span className="text-xs sm:text-sm font-medium truncate">{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

       
      </aside>
    </>
  );
}