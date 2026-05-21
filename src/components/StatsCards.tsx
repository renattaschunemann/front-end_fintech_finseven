"use client";

import React from "react";

interface StatsCardsProps {
  stats: {
    saldoAtual: number;
    receitasDoMes: number;
    despesasDoMes: number;
    balancoDoMes: number;
  };
  formatCurrency: (val: number) => string;
}

export default function StatsCards({ stats, formatCurrency }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-2xl p-5 shadow-lg border border-blue-400/20 hover:scale-[1.015] hover:shadow-xl transition-all duration-300 glow-blue group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div className="space-y-3 relative z-10">
          <p className="text-xs font-bold text-blue-100 uppercase tracking-widest opacity-95">Saldo Atual</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{formatCurrency(stats.saldoAtual)}</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-2xl p-5 shadow-lg border border-emerald-400/20 hover:scale-[1.015] hover:shadow-xl transition-all duration-300 glow-green group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div className="space-y-3 relative z-10">
          <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest opacity-95">Receitas do Mês</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{formatCurrency(stats.receitasDoMes)}</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 rounded-2xl p-5 shadow-lg border border-rose-400/20 hover:scale-[1.015] hover:shadow-xl transition-all duration-300 glow-red group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
          </svg>
        </div>
        <div className="space-y-3 relative z-10">
          <p className="text-xs font-bold text-rose-100 uppercase tracking-widest opacity-95">Despesas do Mês</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{formatCurrency(stats.despesasDoMes)}</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 rounded-2xl p-5 shadow-lg border border-cyan-300/20 hover:scale-[1.015] hover:shadow-xl transition-all duration-300 glow-cyan group relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
          <svg className="w-20 h-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
          </svg>
        </div>
        <div className="space-y-3 relative z-10">
          <p className="text-xs font-bold text-cyan-100 uppercase tracking-widest opacity-95">Balanço do Mês</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{formatCurrency(stats.balancoDoMes)}</p>
        </div>
      </div>
    </div>
  );
}
