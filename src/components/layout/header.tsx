'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LogOut,
  User,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Store,
  Menu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import authService from '@/services/auth';
import { cn } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLojaDashboard = pathname?.startsWith('/dashboard-loja');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authService.logout();
    router.push('/');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="block">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900">RaioCupon</h1>
              <p className="text-xs text-gray-500">Carregando...</p>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo e título */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn(
            "h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center flex-shrink-0",
            isLojaDashboard
              ? "bg-gradient-to-br from-orange-500 to-amber-600"
              : "bg-gradient-to-br from-blue-600 to-purple-600"
          )}>
            {isLojaDashboard ? (
              <Store className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            ) : (
              <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            )}
          </div>
          <div className="block">
            <h1 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
              {isLojaDashboard ? 'Minha Loja' : 'RaioCupon Admin'}
            </h1>
            <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
              {isLojaDashboard ? 'Painel do Lojista' : 'Painel Administrativo'}
            </p>
          </div>
        </div>

        {/* Área direita - versão desktop e mobile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Badge do tipo de acesso - escondido em mobile muito pequeno */}
          {user && (
            <Badge
              variant="outline"
              className={cn(
                "gap-1 hidden sm:flex",
                isLojaDashboard
                  ? "border-orange-200 bg-orange-50 text-orange-700"
                  : "border-purple-200 bg-purple-50 text-purple-700"
              )}
            >
              {isLojaDashboard ? (
                <>
                  <Store className="h-3 w-3" />
                  <span className="hidden md:inline">Lojista</span>
                </>
              ) : (
                <>
                  <LayoutDashboard className="h-3 w-3" />
                  <span className="hidden md:inline">
                    {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                  </span>
                </>
              )}
            </Badge>
          )}

          {/* Notificações */}
          <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Perfil com Dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-1 sm:px-2 h-8 sm:h-10">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    <AvatarFallback className={cn(
                      "bg-gradient-to-br text-white text-xs sm:text-sm",
                      isLojaDashboard
                        ? "from-orange-500 to-amber-600"
                        : "from-blue-500 to-purple-600"
                    )}>
                      {getInitials(user.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
                      {user.nome}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">
                      {user.email}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 hidden lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-56">
                <DropdownMenuLabel className="truncate">
                  {user.nome}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      isLojaDashboard
                        ? '/dashboard-loja/perfil'
                        : '/dashboard/perfil'
                    )
                  }
                  className="cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Meu Perfil</span>
                </DropdownMenuItem>

                {isLojaDashboard && (
                  <DropdownMenuItem
                    onClick={() => router.push('/dashboard-loja/loja')}
                    className="cursor-pointer"
                  >
                    <Store className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Dados da Loja</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}