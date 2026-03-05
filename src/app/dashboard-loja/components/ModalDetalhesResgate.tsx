'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle2, Clock, AlertCircle, Tag, Package, Store, Calendar } from 'lucide-react';
import { ResgateLoja } from '@/services/dashboardLoja';
import { formatters } from '@/services/dashboardLoja';
import { useState } from 'react';

interface ModalDetalhesResgateProps {
  resgate: ResgateLoja | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModalDetalhesResgate({ resgate, open, onOpenChange }: ModalDetalhesResgateProps) {
  const [copiado, setCopiado] = useState(false);

  if (!open || !resgate) return null;

  const copiarCodigo = () => {
    navigator.clipboard.writeText(resgate.cupom.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // 🔥 Função simples para formatar telefone (já que não existe no formatters)
  const formatarTelefone = (telefone: string) => {
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
      return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
    } else if (numeros.length === 10) {
      return `(${numeros.slice(0,2)}) ${numeros.slice(2,6)}-${numeros.slice(6)}`;
    }
    return telefone;
  };

  const getStatusConfig = (status: string) => {
    const config = {
      pendente: { icon: Clock, text: 'Pendente', className: 'bg-yellow-100 text-yellow-700' },
      parcial: { icon: AlertCircle, text: 'Parcial', className: 'bg-orange-100 text-orange-700' },
      validado: { icon: CheckCircle2, text: 'Validado', className: 'bg-green-100 text-green-700' }
    };
    return config[status as keyof typeof config] || config.pendente;
  };

  const statusConfig = getStatusConfig(resgate.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold">Detalhes do Resgate</h2>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <span className="text-xl">×</span>
            </Button>
          </div>

          <div className="space-y-4">
            {/* Cliente */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                <Store className="h-3 w-3" /> CLIENTE
              </h3>
              <p className="font-medium">{resgate.cliente.nome}</p>
              <p className="text-sm text-gray-600">{resgate.cliente.email}</p>
              {resgate.cliente.whatsapp && (
                <p className="text-sm text-gray-600">
                  {formatarTelefone(resgate.cliente.whatsapp)}
                </p>
              )}
            </div>

            {/* Cupom */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <Tag className="h-4 w-4" />
                <h3 className="text-xs font-medium">CUPOM</h3>
              </div>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono font-bold text-orange-600">
                  {resgate.cupom.codigo}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={copiarCodigo}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copiado ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
            </div>

            {/* Produto */}
            {resgate.cupom.nomeProduto && (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-indigo-700 mb-2">
                  <Package className="h-4 w-4" />
                  <h3 className="text-xs font-medium">PRODUTO</h3>
                </div>
                <p className="text-sm">{resgate.cupom.nomeProduto}</p>
                {resgate.cupom.descricao && resgate.cupom.descricao !== resgate.cupom.nomeProduto && (
                  <p className="text-xs text-gray-500 mt-1">{resgate.cupom.descricao}</p>
                )}
              </div>
            )}

            {/* Valores */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Preço original</p>
                <p className="text-sm text-gray-400 line-through">
                  {formatters.moeda(resgate.cupom.precoOriginal || 0)}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Preço com desconto</p>
                <p className="text-sm font-medium text-green-600">
                  {formatters.moeda(resgate.cupom.precoComDesconto || 0)}
                </p>
              </div>
            </div>

            {/* Economia */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Economia</p>
              <p className="text-sm font-medium text-blue-600">
                {formatters.moeda(resgate.economia)}
              </p>
            </div>

            {/* Informações do resgate */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Data do resgate
                </p>
                <p className="text-sm">{formatters.data(resgate.resgatadoEm)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Quantidade</p>
                <p className="text-sm">{resgate.quantidade}x</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Quantidade validada</p>
                <p className="text-sm">{resgate.quantidadeValidada}x</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Badge className={`${statusConfig.className} flex items-center gap-1 mt-1 text-xs px-2 py-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.text}
                </Badge>
              </div>
            </div>

            {/* QR Codes */}
            {resgate.qrCodes && resgate.qrCodes.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">QR Codes do resgate</p>
                <div className="space-y-2">
                  {resgate.qrCodes.map((qr) => (
                    <div key={qr.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                      <span className="font-mono">{qr.id.slice(0, 8)}...</span>
                      <Badge variant={qr.validado ? 'default' : 'outline'} className="text-[10px]">
                        {qr.validado ? 'Validado' : 'Pendente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}