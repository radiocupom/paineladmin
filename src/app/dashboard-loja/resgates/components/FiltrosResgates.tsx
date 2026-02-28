'use client';

import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FiltrosResgatesProps {
  search: string;
  onSearchChange: (value: string) => void;
  cupomFiltro: string;
  onCupomChange: (value: string) => void;
  statusFiltro: string;
  onStatusChange: (value: string) => void;
  periodoFiltro: string;
  onPeriodoChange: (value: string) => void;
  cuponsPopulares: any[];
  mobileFiltersOpen: boolean;
  onToggleMobileFilters: () => void;
}

function Label({ children, className, ...props }: any) {
  return (
    <label className={cn("text-xs sm:text-sm font-medium text-gray-700", className)} {...props}>
      {children}
    </label>
  );
}

export function FiltrosResgates({
  search,
  onSearchChange,
  cupomFiltro,
  onCupomChange,
  statusFiltro,
  onStatusChange,
  periodoFiltro,
  onPeriodoChange,
  cuponsPopulares,
  mobileFiltersOpen,
  onToggleMobileFilters
}: FiltrosResgatesProps) {
  return (
    <>
      {/* Botão de filtros mobile */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={onToggleMobileFilters}
          className="w-full h-8 sm:h-9 text-xs sm:text-sm"
        >
          <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          {mobileFiltersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-sm sm:text-base">Filtros</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Refine a lista de resgates
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(
          "p-4 sm:p-6 pt-0 sm:pt-0 transition-all",
          !mobileFiltersOpen && 'hidden lg:block'
        )}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  placeholder="Cliente ou cupom..."
                  className="pl-7 sm:pl-10 h-8 sm:h-9 text-xs sm:text-sm"
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Cupom</Label>
              <Select value={cupomFiltro} onValueChange={onCupomChange}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos" className="text-xs sm:text-sm">Todos</SelectItem>
                  {(cuponsPopulares || []).map((cupom) => (
                    <SelectItem key={cupom.id} value={cupom.id} className="text-xs sm:text-sm">
                      {cupom.codigo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Status</Label>
              <Select value={statusFiltro} onValueChange={onStatusChange}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos" className="text-xs sm:text-sm">Todos</SelectItem>
                  <SelectItem value="validado" className="text-xs sm:text-sm">Validados</SelectItem>
                  <SelectItem value="pendente" className="text-xs sm:text-sm">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm">Período</Label>
              <Select value={periodoFiltro} onValueChange={onPeriodoChange}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos" className="text-xs sm:text-sm">Todos</SelectItem>
                  <SelectItem value="hoje" className="text-xs sm:text-sm">Hoje</SelectItem>
                  <SelectItem value="7dias" className="text-xs sm:text-sm">Últimos 7 dias</SelectItem>
                  <SelectItem value="30dias" className="text-xs sm:text-sm">Últimos 30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}