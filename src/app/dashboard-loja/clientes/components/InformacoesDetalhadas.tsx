'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Globe, 
  Instagram, 
  Facebook, 
  Twitter,
  Gift,
  Clock,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';

interface InformacoesDetalhadasProps {
  cliente: {
    id: string;
    nome: string;
    email: string;
    whatsapp: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    pais: string;
    genero?: string;
    dataNascimento?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    receberOfertas: boolean;
    comoConheceu?: string;
    observacoes?: string;
    ativo: boolean;
    createdAt: string;
    updatedAt: string;
    ultimoLogin?: string;
  };
}

export function InformacoesDetalhadas({ cliente }: InformacoesDetalhadasProps) {
  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatarDataNascimento = (data?: string) => {
    if (!data) return 'Não informado';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarTelefone = (telefone: string) => {
    // Formata (XX) XXXXX-XXXX
    const numeros = telefone.replace(/\D/g, '');
    if (numeros.length === 11) {
      return `(${numeros.slice(0,2)}) ${numeros.slice(2,7)}-${numeros.slice(7)}`;
    }
    return telefone;
  };

  return (
    <div className="space-y-4">
      {/* Card de Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <User className="h-4 w-4" />
            Status da Conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {cliente.ativo ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700 font-medium">Ativo</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 font-medium">Inativo</span>
                </>
              )}
            </div>
            <Badge variant={cliente.receberOfertas ? "default" : "secondary"}>
              {cliente.receberOfertas ? 'Recebe ofertas' : 'Não recebe ofertas'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Card de Informações Pessoais */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <User className="h-4 w-4" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Nome completo</p>
              <p className="font-medium">{cliente.nome}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Gênero</p>
              <p className="font-medium">{cliente.genero || 'Não informado'}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Data de nascimento</p>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatarDataNascimento(cliente.dataNascimento)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Como conheceu</p>
              <p className="font-medium">{cliente.comoConheceu || 'Não informado'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Contato */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Contato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </p>
              <a href={`mailto:${cliente.email}`} className="font-medium hover:text-orange-600 hover:underline">
                {cliente.email}
              </a>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Phone className="h-3 w-3" /> WhatsApp
              </p>
              <a 
                href={`https://wa.me/${cliente.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-orange-600 hover:underline"
              >
                {formatarTelefone(cliente.whatsapp)}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Localização */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Localização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500">Bairro</p>
              <p className="font-medium">{cliente.bairro || 'Não informado'}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">Cidade/Estado</p>
              <p className="font-medium">
                {cliente.cidade && cliente.estado 
                  ? `${cliente.cidade}/${cliente.estado}`
                  : 'Não informado'}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-gray-500">País</p>
              <p className="font-medium flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {cliente.pais}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Redes Sociais */}
      {(cliente.instagram || cliente.facebook || cliente.tiktok) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Redes Sociais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {cliente.instagram && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Instagram className="h-3 w-3" /> Instagram
                  </p>
                  <a 
                    href={`https://instagram.com/${cliente.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-orange-600 hover:underline"
                  >
                    {cliente.instagram}
                  </a>
                </div>
              )}

              {cliente.facebook && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Facebook className="h-3 w-3" /> Facebook
                  </p>
                  <a 
                    href={`https://facebook.com/${cliente.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-orange-600 hover:underline"
                  >
                    {cliente.facebook}
                  </a>
                </div>
              )}

              {cliente.tiktok && (
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Twitter className="h-3 w-3" /> TikTok
                  </p>
                  <a 
                    href={`https://tiktok.com/@${cliente.tiktok.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium hover:text-orange-600 hover:underline"
                  >
                    {cliente.tiktok}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card de Observações */}
      {cliente.observacoes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{cliente.observacoes}</p>
          </CardContent>
        </Card>
      )}

      {/* Card de Datas do Sistema */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-gray-500">ID do Cliente</p>
              <p className="font-mono">{cliente.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Cadastrado em</p>
              <p>{formatarData(cliente.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-500">Última atualização</p>
              <p>{formatarData(cliente.updatedAt)}</p>
            </div>
            {cliente.ultimoLogin && (
              <div>
                <p className="text-gray-500">Último login</p>
                <p>{formatarData(cliente.ultimoLogin)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}