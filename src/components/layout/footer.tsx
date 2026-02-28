'use client';

import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Grid principal - responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          
          {/* Coluna 1 - Logo e descrição */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">RC</span>
              </div>
              <span className="text-base sm:text-lg font-semibold text-gray-900">RaioCupon</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Plataforma completa para gerenciamento de cupons, resgates e fidelização de clientes.
              Simplificando a relação entre lojas e consumidores.
            </p>
            {/* Redes sociais */}
            <div className="flex gap-2 sm:gap-3">
              <a 
                href="#" 
                className="p-1.5 sm:p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
              </a>
              <a 
                href="#" 
                className="p-1.5 sm:p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <Twitter className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
              </a>
              <a 
                href="#" 
                className="p-1.5 sm:p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-700" />
              </a>
            </div>
          </div>

          {/* Coluna 2 - Links Rápidos */}
          <div className="col-span-1">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 sm:mb-4">
              Links Rápidos
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="/dashboard" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/lojas" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Lojas
                </Link>
              </li>
              <li>
                <Link href="/dashboard/cupons" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Cupons
                </Link>
              </li>
              <li>
                <Link href="/dashboard/relatorios" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Relatórios
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3 - Suporte */}
          <div className="col-span-1">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 sm:mb-4">
              Suporte
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <a href="#" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Documentação
                </a>
              </li>
              <li>
                <a href="#" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Status do Sistema
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 4 - Contato */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 sm:mb-4">
              Contato
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <a href="mailto:suporte@raiocupon.com" className="hover:text-blue-600 transition-colors">
                  suporte@raiocupon.com
                </a>
              </li>
              <li className="text-xs sm:text-sm text-gray-600">
                Segunda - Sexta, 9h - 18h
              </li>
            </ul>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-200 mt-6 sm:mt-8 lg:mt-10 pt-6 sm:pt-8 lg:pt-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Copyright */}
            <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              © {currentYear} RaioCupon. Todos os direitos reservados.
            </p>

            {/* Links legais - responsivo */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
              <a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-xs sm:text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Cookies
              </a>
            </div>

            {/* Made with love */}
            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
              Feito com <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 fill-red-500" /> por RaioCupon
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}