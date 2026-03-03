'use client';

import { useEffect, useRef, useState } from 'react';
import { ProtectedRoute } from '@/app/dashboard/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scan,
  CheckCircle2,
  XCircle,
  Loader2,
  QrCode,
  RefreshCw,
  User,
  Calendar,
  Clock,
  Camera,
  CameraOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import jsQR from 'jsqr';
import { cn } from '@/lib/utils';

export default function ScanQRCodePage() {
  const { user } = useAuth();
  
  // Refs para câmera
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // States
  const [modo, setModo] = useState<'manual' | 'camera'>('manual');
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [validando, setValidando] = useState(false);
  const [codigoManual, setCodigoManual] = useState('');
  const [ultimoCodigo, setUltimoCodigo] = useState<string>('');
  const [resultadoDialog, setResultadoDialog] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  // ================= FUNÇÕES DA CÂMERA CORRIGIDAS =================
const iniciarCamera = async () => {
  try {
    setCameraError('');
    setDebugInfo('🔍 Solicitando permissão da câmera...');
    
    // Verificar se mediaDevices existe
    if (!navigator.mediaDevices) {
      setDebugInfo('❌ navigator.mediaDevices não existe');
      setCameraError('Navegador não suporta acesso à câmera');
      return;
    }

    if (!navigator.mediaDevices.getUserMedia) {
      setDebugInfo('❌ getUserMedia não suportado');
      setCameraError('getUserMedia não suportado');
      return;
    }

    setDebugInfo('✅ getUserMedia disponível, solicitando permissão...');
    
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    
    setDebugInfo('✅ Permissão concedida, stream obtida');
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      
      videoRef.current.onloadedmetadata = () => {
        setDebugInfo('✅ Metadata carregada, dando play...');
        videoRef.current?.play()
          .then(() => {
            setDebugInfo('✅ Vídeo tocando!');
            setCameraAtiva(true);
            setScanning(true);
            iniciarScan();
          })
          .catch((playError) => {
            setDebugInfo(`❌ Erro no play: ${playError.message}`);
            setCameraError('Erro ao iniciar reprodução');
          });
      };
    }
  } catch (error: any) {
    setDebugInfo(`❌ Erro: ${error.name} - ${error.message}`);
    
    let mensagem = 'Não foi possível acessar a câmera. ';
    if (error.name === 'NotAllowedError') mensagem += 'Permissão negada.';
    else if (error.name === 'NotFoundError') mensagem += 'Nenhuma câmera encontrada.';
    else if (error.name === 'NotReadableError') mensagem += 'Câmera em uso.';
    else mensagem += error.message;
    
    setCameraError(mensagem);
  }
};

// Adicione um estado para debug
const [debugInfo, setDebugInfo] = useState<string>('');
const pararCamera = () => {
  console.log('🛑 Parando câmera...');
  
  if (scanIntervalRef.current) {
    clearInterval(scanIntervalRef.current);
    scanIntervalRef.current = null;
  }
  
  if (videoRef.current?.srcObject) {
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(track => {
      track.stop();
      console.log('📹 Track parada:', track.kind);
    });
    videoRef.current.srcObject = null;
  }
  
  setCameraAtiva(false);
  setScanning(false);
  console.log('✅ Câmera parada');
};

const iniciarScan = () => {
  if (scanIntervalRef.current) {
    clearInterval(scanIntervalRef.current);
  }

  scanIntervalRef.current = setInterval(() => {
    if (!cameraAtiva || !videoRef.current || !canvasRef.current || validando) {
      return;
    }
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Verificar se o vídeo tem dados suficientes
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) return;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      
      if (code && code.data !== ultimoCodigo) {
        console.log('📌 QR Code detectado:', code.data.substring(0, 20) + '...');
        setUltimoCodigo(code.data);
        validarQRCode(code.data);
      }
    }
  }, 300); // Reduzi para 300ms para mais responsividade
};

  // ================= FUNÇÃO DE VALIDAÇÃO =================
  const validarQRCode = async (codigo: string) => {
    if (validando) return;
    
    try {
      setValidando(true);
      if (modo === 'camera') pararCamera();
      
      const token = localStorage.getItem('@raiocupon:token');
      
      const response = await fetch('https://api.radiocupom.online/api/front/validar-qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ codigo })
      });
      
      const data = await response.json();
      
      setResultado({
        success: response.ok,
        message: data.error || data.message || (response.ok ? 'Sucesso' : 'Erro'),
        valido: response.ok,
        data: data.data
      });
      
      if (response.ok) {
        toast.success('✅ QR Code validado!');
      } else {
        toast.warning(data.error || 'QR code inválido');
      }
      
    } catch (error: any) {
      setResultado({
        success: false,
        message: error.message || 'Erro ao validar QR code',
        valido: false
      });
      toast.error(error.message || 'Erro ao validar QR code');
    } finally {
      setResultadoDialog(true);
      setValidando(false);
    }
  };

  // ================= FUNÇÕES MANUAIS =================
  const validarManual = async () => {
    if (!codigoManual.trim()) {
      toast.error('Digite um código válido');
      return;
    }
    await validarQRCode(codigoManual.trim());
  };

  // ================= LIMPEZA =================
  useEffect(() => {
    return () => {
      pararCamera();
    };
  }, []);

  // ================= NOVA VALIDAÇÃO =================
  const novaValidacao = () => {
    setResultadoDialog(false);
    setResultado(null);
    setUltimoCodigo('');
    setCodigoManual('');
    
    if (modo === 'camera') {
      iniciarCamera();
    }
  };

  return (
    <ProtectedRoute allowedRoles={['loja']}>
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Validar QR Code
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Escaneie o QR code do cliente para validar o resgate
          </p>
        </div>

        {/* Tabs para escolher o modo */}
        <Tabs value={modo} onValueChange={(v) => setModo(v as 'manual' | 'camera')} className="mb-4 sm:mb-6">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1">
            <TabsTrigger value="manual" className="text-xs sm:text-sm py-1.5 sm:py-2 gap-1 sm:gap-2">
              <QrCode className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Modo Manual</span>
              <span className="xs:hidden">Manual</span>
            </TabsTrigger>
            <TabsTrigger value="camera" className="text-xs sm:text-sm py-1.5 sm:py-2 gap-1 sm:gap-2">
              <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Modo Câmera</span>
              <span className="xs:hidden">Câmera</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-sm sm:text-base">Inserir Código Manualmente</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Digite o código do QR code exibido pelo cliente
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
                <div className="flex flex-col xs:flex-row gap-2">
                  <Input
                    placeholder="Cole ou digite o código aqui..."
                    value={codigoManual}
                    onChange={(e) => setCodigoManual(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && validarManual()}
                    disabled={validando}
                    className="h-8 sm:h-9 text-xs sm:text-sm"
                  />
                  <Button 
                    onClick={validarManual}
                    disabled={validando || !codigoManual.trim()}
                    className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 gap-1 sm:gap-2 w-full xs:w-auto"
                  >
                    {validando ? (
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    ) : (
                      <Scan className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                    <span className="hidden xs:inline">Validar</span>
                    <span className="xs:hidden">OK</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="camera">
            <Card>
              <CardContent className="p-3 sm:p-6">
                {!cameraAtiva && !cameraError && (
  <div className="text-center py-8 sm:py-12">
    <Camera className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
    <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Câmera desativada</h3>
    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
      Clique no botão abaixo para ativar a câmera
    </p>
    <Button 
      onClick={iniciarCamera} 
      size="lg" 
      className="h-8 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 gap-1 sm:gap-2"
    >
      <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
      Ativar Câmera
    </Button>
  </div>
)}

              {cameraError && (
  <div className="bg-red-50 p-3 rounded-lg mt-2">
    <p className="text-xs text-red-700">{cameraError}</p>
  </div>
)}

{debugInfo && (
  <div className="bg-blue-50 p-3 rounded-lg mt-2">
    <p className="text-xs text-blue-700">{debugInfo}</p>
  </div>
)}
                {cameraAtiva && (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full rounded-lg border-2 border-orange-200"
                      style={{ maxHeight: '350px', objectFit: 'cover' }}
                    />
                    
                    {/* Overlay de scan */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 sm:w-64 sm:h-64 border-4 border-orange-500 rounded-lg opacity-50"></div>
                    </div>

                    {/* Indicador de scan */}
                    {scanning && (
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-sm flex items-center gap-1 sm:gap-2">
                        <Scan className="h-3 w-3 sm:h-4 sm:w-4 animate-pulse" />
                        <span className="hidden xs:inline">Escaneando...</span>
                        <span className="xs:hidden">Scan...</span>
                      </div>
                    )}

                    {validando && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="bg-white rounded-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-orange-600" />
                          <span className="text-xs sm:text-sm">Validando...</span>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
                      onClick={pararCamera}
                    >
                      <CameraOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      <span className="hidden xs:inline">Parar</span>
                      <span className="xs:hidden">Parar</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Canvas oculto para processamento da câmera */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Modal de resultado */}
        <Dialog open={resultadoDialog} onOpenChange={setResultadoDialog}>
          <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm sm:text-base">
                {resultado?.success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    <span className="text-green-600">QR Code Validado!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                    <span className="text-red-600">Falha na Validação</span>
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                {resultado?.message}
              </DialogDescription>
            </DialogHeader>

            {resultado?.data?.cliente && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  Dados do Cliente
                </h4>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm font-medium break-words">{resultado.data.cliente.nome}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600 break-words">{resultado.data.cliente.email}</p>
                </div>
              </div>
            )}

            {(resultado?.data?.validadoEm || resultado?.data?.primeiraValidacao) && (
              <div className="bg-gray-50 p-2 sm:p-3 rounded-lg">
                <div className="flex items-center gap-1 sm:gap-2 text-gray-500 mb-1">
                  <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="text-[10px] sm:text-xs">Validado em</span>
                </div>
                <p className="text-xs sm:text-sm font-medium">
                  {new Date(resultado.data.validadoEm || resultado.data.primeiraValidacao).toLocaleString('pt-BR')}
                </p>
              </div>
            )}

            <div className="flex flex-col xs:flex-row gap-2 justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => setResultadoDialog(false)}
                className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 w-full xs:w-auto"
              >
                Fechar
              </Button>
              <Button 
                onClick={novaValidacao} 
                className="h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4 gap-1 sm:gap-2 w-full xs:w-auto"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                Nova Validação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}