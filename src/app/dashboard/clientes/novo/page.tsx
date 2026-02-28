'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, User, Phone, MapPin, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import clienteService from '@/services/cliente';

export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Estados para cada campo
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [genero, setGenero] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [pais, setPais] = useState('Brasil');
  const [receberOfertas, setReceberOfertas] = useState(true);
  
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [comoConheceu, setComoConheceu] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validar = () => {
    const novosErros: Record<string, string> = {};

    if (!nome) novosErros.nome = 'Nome é obrigatório';
    if (!email) novosErros.email = 'Email é obrigatório';
    else if (!email.includes('@')) novosErros.email = 'Email inválido';
    
    if (!senha) novosErros.senha = 'Senha é obrigatória';
    else if (senha.length < 6) novosErros.senha = 'Senha deve ter no mínimo 6 caracteres';
    
    if (!whatsapp) novosErros.whatsapp = 'WhatsApp é obrigatório';
    else if (whatsapp.replace(/\D/g, '').length < 10) {
      novosErros.whatsapp = 'WhatsApp deve ter no mínimo 10 dígitos';
    }
    
    if (!genero) novosErros.genero = 'Gênero é obrigatório';
    if (!dataNascimento) novosErros.dataNascimento = 'Data de nascimento é obrigatória';
    
    if (!bairro) novosErros.bairro = 'Bairro é obrigatório';
    if (!cidade) novosErros.cidade = 'Cidade é obrigatória';
    if (!estado) novosErros.estado = 'Estado é obrigatório';

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validar()) return;

    try {
      setLoading(true);
      
      const dados = {
        nome,
        email,
        senha,
        whatsapp,
        genero,
        dataNascimento,
        pais,
        receberOfertas,
        bairro,
        cidade,
        estado,
        instagram: instagram || undefined,
        facebook: facebook || undefined,
        tiktok: tiktok || undefined,
        comoConheceu: comoConheceu || undefined,
        observacoes: observacoes || undefined,
      };

      await clienteService.criar(dados);
      toast.success('Cliente criado com sucesso!');
      router.push('/dashboard/clientes');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao criar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['superadmin', 'admin']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 sm:h-9 sm:w-9 self-start"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Novo Cliente
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Cadastre um novo cliente no sistema
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Informações do Cliente</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Preencha todos os campos obrigatórios (*)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <form onSubmit={onSubmit} className="space-y-6 sm:space-y-8">
              <Tabs defaultValue="dados" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                  <TabsTrigger value="dados" className="text-[10px] sm:text-xs py-1.5 sm:py-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Dados Pessoais</span>
                    <span className="xs:hidden">Dados</span>
                  </TabsTrigger>
                  <TabsTrigger value="endereco" className="text-[10px] sm:text-xs py-1.5 sm:py-2">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Endereço</span>
                    <span className="xs:hidden">End.</span>
                  </TabsTrigger>
                  <TabsTrigger value="social" className="text-[10px] sm:text-xs py-1.5 sm:py-2">
                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden xs:inline">Redes Sociais</span>
                    <span className="xs:hidden">Social</span>
                  </TabsTrigger>
                </TabsList>

                {/* Aba de Dados Pessoais */}
                <TabsContent value="dados" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="nome" className="text-xs sm:text-sm">
                        Nome completo <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Digite o nome completo"
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.nome && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.nome}</p>
                      )}
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="email" className="text-xs sm:text-sm">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="cliente@email.com"
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.email && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="senha" className="text-xs sm:text-sm">
                        Senha <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="senha"
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="••••••"
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.senha && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.senha}</p>
                      )}
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="whatsapp" className="text-xs sm:text-sm">
                        WhatsApp <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="whatsapp"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.whatsapp && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.whatsapp}</p>
                      )}
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="genero" className="text-xs sm:text-sm">
                        Gênero <span className="text-red-500">*</span>
                      </Label>
                      <Select value={genero} onValueChange={setGenero}>
                        <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                          <SelectValue placeholder="Selecione o gênero" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MASCULINO">Masculino</SelectItem>
                          <SelectItem value="FEMININO">Feminino</SelectItem>
                          <SelectItem value="OUTRO">Outro</SelectItem>
                          <SelectItem value="NAO_INFORMAR">Prefiro não informar</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.genero && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.genero}</p>
                      )}
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="dataNascimento" className="text-xs sm:text-sm">
                        Data de Nascimento <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="dataNascimento"
                        type="date"
                        value={dataNascimento}
                        onChange={(e) => setDataNascimento(e.target.value)}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.dataNascimento && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.dataNascimento}</p>
                      )}
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="pais" className="text-xs sm:text-sm">País</Label>
                      <Input
                        id="pais"
                        value={pais}
                        onChange={(e) => setPais(e.target.value)}
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="receberOfertas"
                          checked={receberOfertas}
                          onCheckedChange={setReceberOfertas}
                          className="scale-75 sm:scale-100"
                        />
                        <Label htmlFor="receberOfertas" className="text-xs sm:text-sm">
                          Receber ofertas por WhatsApp 
                        </Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Aba de Endereço */}
                <TabsContent value="endereco" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="bairro" className="text-xs sm:text-sm">
                        Bairro <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="bairro"
                        value={bairro}
                        onChange={(e) => setBairro(e.target.value)}
                        placeholder="Digite o bairro"
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.bairro && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.bairro}</p>
                      )}
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="cidade" className="text-xs sm:text-sm">
                        Cidade <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="cidade"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        placeholder="Digite a cidade"
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                      {errors.cidade && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.cidade}</p>
                      )}
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="estado" className="text-xs sm:text-sm">
                        Estado <span className="text-red-500">*</span>
                      </Label>
                      <Select value={estado} onValueChange={setEstado}>
                        <SelectTrigger className="h-8 sm:h-10 text-xs sm:text-sm">
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] sm:max-h-[300px]">
                          <SelectItem value="AC">Acre</SelectItem>
                          <SelectItem value="AL">Alagoas</SelectItem>
                          <SelectItem value="AP">Amapá</SelectItem>
                          <SelectItem value="AM">Amazonas</SelectItem>
                          <SelectItem value="BA">Bahia</SelectItem>
                          <SelectItem value="CE">Ceará</SelectItem>
                          <SelectItem value="DF">Distrito Federal</SelectItem>
                          <SelectItem value="ES">Espírito Santo</SelectItem>
                          <SelectItem value="GO">Goiás</SelectItem>
                          <SelectItem value="MA">Maranhão</SelectItem>
                          <SelectItem value="MT">Mato Grosso</SelectItem>
                          <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                          <SelectItem value="MG">Minas Gerais</SelectItem>
                          <SelectItem value="PA">Pará</SelectItem>
                          <SelectItem value="PB">Paraíba</SelectItem>
                          <SelectItem value="PR">Paraná</SelectItem>
                          <SelectItem value="PE">Pernambuco</SelectItem>
                          <SelectItem value="PI">Piauí</SelectItem>
                          <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                          <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                          <SelectItem value="RO">Rondônia</SelectItem>
                          <SelectItem value="RR">Roraima</SelectItem>
                          <SelectItem value="SC">Santa Catarina</SelectItem>
                          <SelectItem value="SP">São Paulo</SelectItem>
                          <SelectItem value="SE">Sergipe</SelectItem>
                          <SelectItem value="TO">Tocantins</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.estado && (
                        <p className="text-[10px] sm:text-xs text-red-500">{errors.estado}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Aba de Redes Sociais */}
                <TabsContent value="social" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="instagram" className="text-xs sm:text-sm">Instagram</Label>
                      <Input
                        id="instagram"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="@usuario"
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="facebook" className="text-xs sm:text-sm">Facebook</Label>
                      <Input
                        id="facebook"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="facebook.com/usuario"
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="tiktok" className="text-xs sm:text-sm">TikTok</Label>
                      <Input
                        id="tiktok"
                        value={tiktok}
                        onChange={(e) => setTiktok(e.target.value)}
                        placeholder="@usuario"
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="comoConheceu" className="text-xs sm:text-sm">Como conheceu a empresa?</Label>
                      <Input
                        id="comoConheceu"
                        value={comoConheceu}
                        onChange={(e) => setComoConheceu(e.target.value)}
                        placeholder="Instagram, Facebook, indicação..."
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="space-y-1 sm:space-y-2 sm:col-span-2">
                      <Label htmlFor="observacoes" className="text-xs sm:text-sm">Observações</Label>
                      <Input
                        id="observacoes"
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Alguma observação importante sobre o cliente?"
                        className="h-8 sm:h-10 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Botões */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm bg-gradient-to-r from-blue-500 to-purple-600"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Criar Cliente
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}