'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Ticket, Loader2 } from 'lucide-react';
import { ResgateAdaptado } from '../types/resgates.types';

interface TabelaResgatesDesktopProps {
  resgates: ResgateAdaptado[];
  loading: boolean;
  onVerDetalhes: (resgate: ResgateAdaptado) => void;
  formatarMoeda: (valor: number) => string;
  getStatusBadge: (validado?: boolean) => React.ReactNode;
}

export function TabelaResgatesDesktop({ 
  resgates, 
  loading, 
  onVerDetalhes, 
  formatarMoeda,
  getStatusBadge 
}: TabelaResgatesDesktopProps) {
  return (
    <Card className="hidden lg:block">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base">Histórico de Resgates</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {resgates.length} resgates encontrados
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Cliente</TableHead>
              <TableHead className="text-xs">Cupom</TableHead>
              <TableHead className="text-xs">Qtd</TableHead>
              <TableHead className="text-xs">Valor</TableHead>
              <TableHead className="text-xs">Data/Hora</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto" />
                </TableCell>
              </TableRow>
            ) : resgates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Ticket className="h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-500">Nenhum resgate encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              resgates.map((resgate) => (
                <TableRow key={resgate.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                          {resgate.cliente.nome?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="max-w-[150px]">
                        <p className="text-xs font-medium truncate">{resgate.cliente.nome}</p>
                        <p className="text-[10px] text-gray-500 truncate">{resgate.cliente.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[120px]">
                      <p className="text-xs font-mono truncate">{resgate.cupom.codigo}</p>
                      <p className="text-[10px] text-gray-500 truncate">{resgate.cupom.descricao}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-orange-50 text-[10px] sm:text-xs">
                      {resgate.quantidade}x
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {resgate.valorPago ? (
                      <span className="text-xs font-medium text-green-600">
                        {formatarMoeda(resgate.valorPago)}
                      </span>
                    ) : resgate.cupom.precoOriginal ? (
                      <span className="text-xs text-gray-400 line-through">
                        {formatarMoeda(resgate.cupom.precoOriginal)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs whitespace-nowrap">
                        {new Date(resgate.resgatadoEm).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        {new Date(resgate.resgatadoEm).toLocaleTimeString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(resgate.qrCodeValidado)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onVerDetalhes(resgate)}
                      className="h-7 w-7"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}