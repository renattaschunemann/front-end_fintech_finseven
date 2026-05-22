"use client";

import React from "react";
import "./Sidebar.css";
import { SidebarProps } from "@/interfaces";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeMenu,
  setActiveMenu,
  theme,
  showToast,
}: SidebarProps) {
  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r flex flex-col justify-between transition-all duration-300 xl:translate-x-0 xl:static xl:shrink-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
      } ${
        theme === "dark" ? "bg-[#070b13] border-slate-800/40" : "bg-white border-slate-200"
      }`}>
        <div className="flex flex-col overflow-y-auto grow">
          <div className="p-5 border-b border-slate-800/30 flex items-center justify-between">
            <div className="flex flex-col items-start gap-1">
              <img 
                src="/logo.png" 
                alt="FinSeven Logo" 
                className="h-[72px] w-auto object-contain drop-shadow-[0_0_8px_rgba(34,211,238,0.25)] hover:scale-102 transition-transform duration-300"
              />
            </div>
            <button onClick={() => setSidebarOpen(false)} className="xl:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800/50 hover:text-slate-100">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
 
          <nav className="p-4 space-y-1">
            {[
              { name: "Home", label: "Home", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              )},
              { name: "Lançamento", label: "Novo Lançamento", icon: (
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
              { name: "Receitas", label: "Receitas", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )},
              { name: "Despesas", label: "Despesas", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              )},
              { name: "Investimentos", label: "Investimentos", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              )},
              { name: "Contas", label: "Contas", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              )},
              { name: "Categorias", label: "Categorias", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              )},
              { name: "Relatórios", label: "Relatórios", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            ].map(item => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveMenu(item.name);
                  showToast(`Navegando para: ${item.label}`, "info");
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeMenu === item.name
                    ? theme === "dark"
                      ? "bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-md glowBlue"
                      : "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm"
                    : theme === "dark"
                    ? "text-slate-400 border border-transparent hover:bg-slate-800/40 hover:text-slate-200"
                    : "text-slate-500 border border-transparent hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 px-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 tracking-wider uppercase px-4 mb-2">
              <span>Relatórios Salvos</span>
              <button onClick={() => showToast("Criar novo relatório salvo", "info")} className="hover:text-slate-300 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="space-y-1">
              {["Mês atual", "Último trimestre", "Investimento anual", "Balanço Mensal"].map(rep => (
                <button
                  key={rep}
                  onClick={() => showToast(`Abrindo relatório: ${rep}`, "info")}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-medium transition-all border border-transparent ${
                    theme === "dark" 
                      ? "text-slate-400 hover:bg-slate-800/30 hover:text-slate-200 hover:border-slate-800/30" 
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-200"
                  }`}
                >
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{rep}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/40 space-y-1">
          <button 
            onClick={() => showToast("Abrindo configurações...", "info")} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium transition-all ${
              theme === "dark" ? "text-slate-400 hover:bg-slate-800/35 hover:text-slate-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Configurações</span>
          </button>

          <button 
            onClick={() => showToast("Saindo do sistema...", "error")} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </aside>
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm xl:hidden" />
      )}
    </>
  );
}
