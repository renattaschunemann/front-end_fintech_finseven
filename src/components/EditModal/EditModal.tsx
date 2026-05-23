"use client";

import React from "react";
import "./EditModal.css";
import { EditModalProps } from "@/interfaces";

export default function EditModal({
  isOpen,
  onClose,
  onSubmit,
  formType,
  setFormType,
  formDescription,
  setFormDescription,
  formValue,
  setFormValue,
  formDate,
  setFormDate,
  formAccount,
  setFormAccount,
  formCategory,
  setFormCategory,
  theme,
}: EditModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300" />
      
      <div className={`border rounded-2xl w-full max-w-md shadow-2xl relative z-10 p-6 overflow-hidden transition-all animateFadeIn ${
        theme === "dark" ? "bg-[#0f1422] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-800"}`}>
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Editar Lançamento
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className={`text-xs font-bold uppercase tracking-wider block mb-2.5 ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}>Tipo de Fluxo</label>
            <div className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all w-fit ${
              formType === "Receitas"
                ? "bg-emerald-600/15 border-emerald-500/40 text-emerald-400 glowGreen"
                : formType === "Investimentos"
                ? "bg-cyan-600/15 border-cyan-500/40 text-cyan-400 glowCyan"
                : "bg-rose-600/15 border-rose-500/40 text-rose-400 glowRed"
            }`}>
              {formType === "Receitas" && "Receita (+)"}
              {formType === "Despesas" && "Despesa (-)"}
              {formType === "Investimentos" && "Investimento"}
            </div>
          </div>

          <div>
            <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}>Descrição</label>
            <input
              type="text"
              required
              placeholder="Descrição..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                theme === "dark" 
                  ? "bg-[#070b13] border-slate-800/80 text-slate-200 placeholder-slate-600" 
                  : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}>Valor (R$)</label>
              <input
                type="text"
                required
                placeholder="0.00"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  theme === "dark" 
                    ? "bg-[#070b13] border-slate-800/80 text-slate-200 placeholder-slate-600" 
                    : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                }`}
              />
            </div>

            <div>
              <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}>Data</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                onClick={(e) => (e.currentTarget as any).showPicker?.()}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer ${
                  theme === "dark" 
                    ? "bg-[#070b13] border-slate-800/80 text-slate-200" 
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}>Conta</label>
              <select
                value={formAccount}
                onChange={(e) => setFormAccount(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none transition-colors focus:border-blue-500 ${
                  theme === "dark" ? "bg-[#070b13] border-slate-800/80 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <option value="Itaú">Itaú</option>
                <option value="Bradesco">Bradesco</option>
                <option value="Caixa Econômica">Caixa Econômica</option>
                <option value="NuBank">NuBank</option>
                <option value="Carteira">Carteira</option>
              </select>
            </div>

            <div>
              <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}>Categoria</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none transition-colors focus:border-blue-500 ${
                  theme === "dark" ? "bg-[#070b13] border-slate-800/80 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                {formType === "Receitas" ? (
                  <>
                    <option value="Salário">Salário</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Rendimentos">Rendimentos</option>
                    <option value="Outros">Outros</option>
                  </>
                ) : formType === "Investimentos" ? (
                  <>
                    <option value="Ações">Ações</option>
                    <option value="FIIs">FIIs</option>
                    <option value="Renda Fixa">Renda Fixa</option>
                    <option value="Cripto">Cripto</option>
                    <option value="Outros">Outros</option>
                  </>
                ) : (
                  <>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Supermercado">Supermercado</option>
                    <option value="Aluguel">Aluguel</option>
                    <option value="Lazer">Lazer</option>
                    <option value="Transporte">Transporte</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Outros">Outros</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800/60 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_12px_rgba(59,130,246,0.2)] hover:scale-[1.01]"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
