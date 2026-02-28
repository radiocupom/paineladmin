export default function Loading() {
  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Skeleton do cabeçalho */}
      <div className="space-y-2">
        <div className="h-6 sm:h-7 md:h-8 w-32 sm:w-48 md:w-64 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-3 sm:h-4 w-24 sm:w-32 md:w-40 bg-gray-200 animate-pulse rounded"></div>
      </div>

      {/* Skeleton dos cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="space-y-2">
            {/* Card principal */}
            <div className="h-20 sm:h-24 md:h-28 lg:h-32 bg-gray-200 animate-pulse rounded-lg"></div>
            
            {/* Detalhes do card (visível apenas em telas maiores) */}
            <div className="hidden sm:block space-y-1">
              <div className="h-2 w-16 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-2 w-12 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton da tabela/lista (visível apenas em telas maiores) */}
      <div className="hidden lg:block space-y-3">
        <div className="h-8 w-full bg-gray-200 animate-pulse rounded"></div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-12 w-full bg-gray-200 animate-pulse rounded"></div>
        ))}
      </div>

      {/* Skeleton para mobile (cards adicionais) */}
      <div className="lg:hidden space-y-3">
        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}