"use client";

import React from "react";
import { Transaction, TransactionTableProps } from "@/interfaces";

export default function TransactionTable({
  transactions,
  theme,
  onEditClick,
  onDeleteClick,
  formatCurrency,
  formatDateForDisplay,
  onQuickAddClick,
}: TransactionTableProps) {
  return (
    <div className={`backdrop-blur border rounded-2xl p-6 shadow-md transition-all ${
      theme === "dark" ? "bg-[#101422]/70 border-slate-800/40" : "bg-white border-slate-200 shadow-sm"
    }`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className={`text-lg font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-800"}`}>Últimos Lançamentos</h3>
          <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Listagem de movimentações financeiras recentes no sistema.</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onQuickAddClick("Receitas")}
            className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            + Receita
          </button>
          <button 
            onClick={() => onQuickAddClick("Despesas")}
            className="bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            + Despesa
          </button>
        </div>
      </div>

      <div className={`w-full overflow-x-auto rounded-xl border ${
        theme === "dark" ? "border-slate-800/30" : "border-slate-200"
      }`}>
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className={`text-xs font-bold uppercase tracking-wider border-b ${
              theme === "dark" ? "bg-slate-900/60 text-slate-400 border-slate-800/40" : "bg-slate-50 text-slate-500 border-slate-200"
            }`}>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Conta</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className={`divide-y text-xs font-semibold ${
            theme === "dark" ? "divide-slate-800/30 text-slate-300" : "divide-slate-100 text-slate-650"
          }`}>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                  Nenhum lançamento cadastrado neste mês.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isIncome = tx.value > 0;
                return (
                  <tr 
                    key={tx.id} 
                    className={`transition-colors duration-150 group ${
                      theme === "dark" ? "hover:bg-slate-800/20" : "hover:bg-slate-50"
                    }`}
                  >
                    <td className={`px-6 py-4 font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      {formatDateForDisplay(tx.date)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        isIncome 
                          ? "bg-emerald-950/40 border border-emerald-800/35 text-emerald-400" 
                          : "bg-rose-950/40 border border-rose-800/35 text-rose-400"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${isIncome ? "bg-emerald-400" : "bg-rose-400"}`} />
                        {tx.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                      {tx.description}
                    </td>
                    <td className={`px-6 py-4 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                      {tx.account}
                    </td>
                    <td className={`px-6 py-4 font-bold text-sm ${isIncome ? "text-emerald-400" : "text-rose-400"}`}>
                      {isIncome ? "+ " : "- "}{formatCurrency(Math.abs(tx.value))}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEditClick(tx)}
                          className={`bg-transparent text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer border ${
                            theme === "dark" 
                              ? "hover:bg-blue-600/10 border-blue-500/20 hover:border-blue-500/40 text-blue-400 hover:text-blue-300" 
                              : "hover:bg-blue-50 border-blue-200 text-blue-650 hover:text-blue-700"
                          }`}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => onDeleteClick(tx.id)}
                          className={`bg-transparent text-[10px] font-bold px-2 py-1.5 rounded-lg transition-all cursor-pointer border ${
                            theme === "dark" 
                              ? "hover:bg-rose-600/10 border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300" 
                              : "hover:bg-rose-50 border-rose-200 text-rose-650 hover:text-rose-700"
                          }`}
                          title="Excluir lançamento"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
