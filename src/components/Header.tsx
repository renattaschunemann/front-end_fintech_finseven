"use client";

import React from "react";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  theme: "dark" | "light";
  onAddClick: () => void;
  showToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function Header({
  setSidebarOpen,
  theme,
  onAddClick,
  showToast,
}: HeaderProps) {
  return (
    <header className={`px-6 py-5 border-b flex items-center justify-between sticky top-0 backdrop-blur-md z-20 transition-all ${
      theme === "dark" ? "border-slate-800/40 bg-[#0b0f19]/90" : "border-slate-200 bg-slate-50/90"
    }`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className={`xl:hidden p-2 rounded-xl transition-colors ${
            theme === "dark" ? "bg-slate-800/50 hover:bg-slate-800 text-slate-300 hover:text-slate-100" : "bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-800"
          }`}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Meu Painel</h1>
          <p className={`text-xs hidden sm:block ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Acompanhe e controle sua vida financeira em tempo real.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onAddClick}
          className="bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
        >
          <svg className="w-4 h-4 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          <span>+ Lançamento</span>
        </button>

        <button 
          onClick={() => showToast("Painel compartilhado!", "success")}
          className={`border text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
            theme === "dark" 
              ? "bg-slate-800/50 hover:bg-slate-800 border-slate-700/40 hover:border-slate-700 text-slate-300 hover:text-slate-100" 
              : "bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.316-2.158m0 0a3 3 0 10-1.222-2.316L7.462 8.426a3 3 0 100 7.148l4.316 2.158a3 3 0 101.222-2.316" />
          </svg>
          <span className="hidden md:inline">Compartilhar</span>
        </button>

        <button 
          onClick={() => showToast("Exportando dados em formato XLSX...", "success")}
          className={`border text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
            theme === "dark" 
              ? "bg-slate-800/50 hover:bg-slate-800 border-slate-700/40 hover:border-slate-700 text-slate-300 hover:text-slate-100" 
              : "bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="hidden md:inline">Exportar</span>
        </button>

        <div className="relative">
          <button 
            onClick={() => showToast("Modo de filtragem selecionado", "info")}
            className={`border text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              theme === "dark" 
                ? "bg-slate-800/50 hover:bg-slate-800 border-slate-700/40 hover:border-slate-700 text-slate-300 hover:text-slate-100" 
                : "bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Hoje</span>
            <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
