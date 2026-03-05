'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  Ticket, 
  QrCode,
  BarChart3,
  Settings,
  LogOut,
  Store,
  Gift,
  History,
  HelpCircle,
  Users,
  Scan,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import authService from '@/services/auth';
import { lojaDashboardService } from '@/services/dashboardLoja';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard-loja',
    icon: LayoutDashboard,
  },
  {
    title: "Validar QR Code",
    href: "/dashboard-loja/scan",
    icon: Scan,
  },
  {
    title: 'Meus Cupons',
    href: '/dashboard-loja/cupons',
    icon: Ticket,
  },
  {
    title: 'Criar Cupom',
    href: '/dashboard-loja/cupons/novo',
    icon: Gift,
  },
  {
    title: 'Clientes',
    href: '/dashboard-loja/clientes',
    icon: Users,
  },
];

export function SidebarLoja() {
  const pathname = usePathname();
  const user = authService.getCurrentUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // KPIs - APENAS OS 4 QUE APARECEM NA IMAGEM
  const [cuponsAtivos, setCuponsAtivos] = useState(0);
  const [resgatesMes, setResgatesMes] = useState(0);
  const [qrCodes, setQrCodes] = useState(0);
  const [mediaResgates, setMediaResgates] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarResumo = async () => {
      try {
        setLoading(true);
        const data = await lojaDashboardService.getKPIs();
        
        setCuponsAtivos(data.cupons.ativos);
        setResgatesMes(data.resgates.mes);
        setQrCodes(data.qrCodes.total);
        
        const media = data.cupons.total > 0 
          ? Number((data.resgates.total / data.cupons.total).toFixed(1))
          : 0;
        setMediaResgates(media);
        
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Erro ao carregar dados do dashboard:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    carregarResumo();
  }, []);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/';
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  // Fechar mobile ao mudar de rota
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Botão do menu mobile - visível apenas em telas pequenas */}
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
        "bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] transition-all duration-300",
        // Mobile: posicionamento absoluto
        "fixed lg:relative z-50",
        isMobileOpen ? "left-0" : "-left-64 lg:left-0",
        // Largura responsiva
        isCollapsed ? "w-20" : "w-64",
        // Sombra no mobile
        isMobileOpen && "shadow-xl"
      )}>
        <div className="p-4 h-full flex flex-col">
          {/* Botão de colapsar - escondido em mobile */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full mb-6 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-center">
              <Store className={cn(
                "h-5 w-5 text-gray-500 transition-transform",
                isCollapsed ? "rotate-180" : ""
              )} />
            </div>
          </button>

          {/* Informações da Loja - versão expandida */}
          {!isCollapsed && (
            <div className="mb-6 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Store className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                    {user?.nome || 'CarlosChef'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-orange-600 font-medium">
                    Plano Premium
                  </p>
                </div>
              </div>
              
              {/* KPIs - EXATAMENTE COMO NA IMAGEM: 2x2 */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-orange-200">
                {/* Primeira linha */}
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">Cupons Ativos</p>
                  {loading ? (
                    <div className="h-5 w-8 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-sm sm:text-base font-bold text-gray-900">
                      {cuponsAtivos}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">Resgates/Mês</p>
                  {loading ? (
                    <div className="h-5 w-8 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-sm sm:text-base font-bold text-gray-900">
                      {resgatesMes}
                    </p>
                  )}
                </div>

                {/* Segunda linha */}
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">QR Codes</p>
                  {loading ? (
                    <div className="h-5 w-8 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-sm sm:text-base font-bold text-gray-900">
                      {qrCodes}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">Média/ Cupom</p>
                  {loading ? (
                    <div className="h-5 w-8 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <p className="text-sm sm:text-base font-bold text-gray-900">
                      {mediaResgates}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Versão colapsada - informações mínimas */}
          {isCollapsed && (
            <div className="mb-6 flex justify-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Store className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            </div>
          )}

          {/* Menu */}
          <nav className="space-y-1 flex-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors',
                    isCollapsed ? 'justify-center' : '',
                    isActive 
                      ? 'bg-orange-50 text-orange-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className={cn(
                    'h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0',
                    isActive ? 'text-orange-600' : 'text-gray-400'
                  )} />
                  {!isCollapsed && (
                    <span className="text-xs sm:text-sm font-medium truncate">{item.title}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}