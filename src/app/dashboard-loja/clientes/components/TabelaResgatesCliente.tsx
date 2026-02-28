'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';

interface TabelaResgatesClienteProps {
  resgates: any[];
  cupons: any[];
  formatarMoeda: (valor: number) => string;
  formatarData: (data: string) => string;
}

export function TabelaResgatesCliente({ 
  resgates, 
  cupons, 
  formatarMoeda, 
  formatarData 
}: TabelaResgatesClienteProps) {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-sm sm:text-base">
          Histórico de Resgates
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Todos os resgates realizados por este cliente
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Data</TableHead>
              <TableHead className="text-xs">Cupom</TableHead>
              <TableHead className="text-xs">Produto</TableHead>
              <TableHead className="text-xs">Qtd</TableHead>
              <TableHead className="text-xs">Valor</TableHead>
              <TableHead className="text-xs">Economia</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resgates.length > 0 ? (
              resgates.map((resgate) => {
                const cupom = cupons.find(c => c.id === resgate.cupomId);
                const valorOriginal = (cupom?.precoOriginal || 0) * resgate.quantidade;
                const valorPago = (cupom?.precoComDesconto || cupom?.precoOriginal || 0) * resgate.quantidade;
                
                return (
                  <TableRow key={resgate.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatarData(resgate.resgatadoEm)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono">{resgate.cupomCodigo}</span>
                    </TableCell>
                    <TableCell className="text-xs max-w-[150px] truncate">
                      {cupom?.nomeProduto || resgate.cupomDescricao}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-orange-50 text-xs">
                        {resgate.quantidade}x
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-green-600">
                      {formatarMoeda(valorPago)}
                    </TableCell>
                    <TableCell className="text-xs text-blue-600">
                      {formatarMoeda(valorOriginal - valorPago)}
                    </TableCell>
                    <TableCell>
                      {resgate.qrCodeValidado ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Validado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Nenhum resgate encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}