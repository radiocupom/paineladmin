'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ResgateAdaptado } from '../types/resgates.types';

interface ModalDetalhesResgateProps {
  resgate: ResgateAdaptado | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formatarData: (data: string) => string;
  formatarMoeda: (valor: number) => string;
  getStatusBadge: (validado?: boolean) => React.ReactNode;
}

export function ModalDetalhesResgate({
  resgate,
  open,
  onOpenChange,
  formatarData,
  formatarMoeda,
  getStatusBadge
}: ModalDetalhesResgateProps) {
  if (!resgate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-sm sm:text-base">Detalhes do Resgate</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Informações completas sobre este resgate
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Cliente</p>
              <p className="text-xs sm:text-sm font-medium break-all">{resgate.cliente.nome}</p>
              <p className="text-[10px] sm:text-xs text-gray-600 break-all">{resgate.cliente.email}</p>
              {resgate.cliente.whatsapp && (
                <p className="text-[10px] sm:text-xs text-gray-600 break-all">WhatsApp: {resgate.cliente.whatsapp}</p>
              )}
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Cupom</p>
              <p className="text-xs sm:text-sm font-mono font-medium break-all">{resgate.cupom.codigo}</p>
              <p className="text-[10px] sm:text-xs text-gray-600 break-all">{resgate.cupom.descricao}</p>
              {resgate.cupom.nomeProduto && (
                <p className="text-[10px] sm:text-xs text-gray-600 break-all">Produto: {resgate.cupom.nomeProduto}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Quantidade</p>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-orange-600">
                {resgate.quantidade}x
              </p>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500">Status</p>
              <div className="mt-1">
                {getStatusBadge(resgate.qrCodeValidado)}
              </div>
            </div>
          </div>

          {/* Informações de preço */}
          <div className="border-t pt-3 sm:pt-4">
            <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Valores</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 text-[10px] sm:text-xs">
              {resgate.cupom.precoOriginal && (
                <div>
                  <p className="text-gray-500">Preço Original:</p>
                  <p className="font-medium">{formatarMoeda(resgate.cupom.precoOriginal)}</p>
                </div>
              )}
              {resgate.cupom.precoComDesconto && (
                <div>
                  <p className="text-gray-500">Preço com Desconto:</p>
                  <p className="font-medium text-green-600">{formatarMoeda(resgate.cupom.precoComDesconto)}</p>
                </div>
              )}
              {resgate.cupom.percentualDesconto && (
                <div>
                  <p className="text-gray-500">Desconto:</p>
                  <p className="font-medium text-blue-600">{resgate.cupom.percentualDesconto}%</p>
                </div>
              )}
              {resgate.valorPago && (
                <div>
                  <p className="text-gray-500">Valor Pago:</p>
                  <p className="font-medium text-green-600">{formatarMoeda(resgate.valorPago)}</p>
                </div>
              )}
              {resgate.economia && (
                <div>
                  <p className="text-gray-500">Economia:</p>
                  <p className="font-medium text-blue-600">{formatarMoeda(resgate.economia)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t pt-3 sm:pt-4">
            <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Datas</p>
            <div className="grid grid-cols-1 gap-3 sm:gap-4 text-[10px] sm:text-xs">
              <div>
                <p className="text-gray-500">Resgate:</p>
                <p className="font-medium break-words">{formatarData(resgate.resgatadoEm)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}