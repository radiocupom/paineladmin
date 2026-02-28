'use client';

export function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4 border-4 border-orange-200 border-t-orange-600 rounded-full" />
        <p className="text-sm text-gray-500">Carregando...</p>
      </div>
    </div>
  );
}