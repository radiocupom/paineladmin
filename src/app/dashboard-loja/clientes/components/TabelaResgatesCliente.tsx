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
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

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
  
  // Função para determinar o status e configuração visual
  const getStatusConfig = (quantidadeTotal: number, quantidadeValidada: number) => {
    if (quantidadeValidada === 0) {
      return {
        label: 'Pendente',
        icon: Clock,
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        iconClass: 'text-yellow-600'
      };
    } else if (quantidadeValidada === quantidadeTotal) {
      return {
        label: 'Validado',
        icon: CheckCircle2,
        className: 'bg-green-100 text-green-700',
        iconClass: 'text-green-600'
      };
    } else {
      return {
        label: 'Parcial',
        icon: AlertCircle,
        className: 'bg-orange-100 text-orange-700',
        iconClass: 'text-orange-600'
      };
    }
  };

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
              <TableHead className="text-xs">Validados</TableHead>
              <TableHead className="text-xs">Valor Pago</TableHead>
              <TableHead className="text-xs">Economia</TableHead>
              <TableHead className="text-xs">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resgates.length > 0 ? (
              resgates.map((resgate) => {
                const cupom = cupons.find(c => c.id === resgate.cupomId);
                
                // 🔥 Dados do resgate com fallbacks seguros
                const quantidadeTotal = resgate.quantidade || 1;
                // Usar quantidadeValidada se disponível, senão usar qrCodeValidado para compatibilidade
                const quantidadeValidada = resgate.quantidadeValidada ?? (resgate.qrCodeValidado ? quantidadeTotal : 0);
                
                // Calcular valores baseado na quantidade validada
                const precoUnitario = cupom?.precoComDesconto || cupom?.precoOriginal || 0;
                const precoOriginalUnitario = cupom?.precoOriginal || 0;
                
                const valorPago = precoUnitario * quantidadeValidada;
                const valorOriginalTotal = precoOriginalUnitario * quantidadeTotal;
                const economia = (precoOriginalUnitario - precoUnitario) * quantidadeValidada;
                
                // Obter configuração do status
                const statusConfig = getStatusConfig(quantidadeTotal, quantidadeValidada);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <TableRow key={resgate.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatarData(resgate.resgatadoEm || resgate.data)}
                    </TableCell>
                    
                    <TableCell>
                      <span className="text-xs font-mono">
                        {resgate.cupomCodigo || cupom?.codigo}
                      </span>
                    </TableCell>
                    
                    <TableCell className="text-xs max-w-[150px] truncate">
                      {cupom?.nomeProduto || resgate.cupomDescricao || cupom?.descricao}
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className="bg-gray-50 text-xs">
                        {quantidadeTotal}x
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        {quantidadeValidada}/{quantidadeTotal}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-xs font-medium text-green-600">
                      {formatarMoeda(valorPago)}
                    </TableCell>
                    
                    <TableCell className="text-xs text-blue-600">
                      {formatarMoeda(economia)}
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={`${statusConfig.className} text-xs`}>
                        <StatusIcon className={`h-3 w-3 mr-1 ${statusConfig.iconClass}`} />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
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