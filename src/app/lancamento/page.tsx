"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Transaction } from "@/interfaces";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

function LancamentoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeMenu, setActiveMenu] = useState("Lançamento");

  const [formType, setFormType] = useState<"Receitas" | "Despesas" | "Investimentos">("Despesas");
  const [formCategory, setFormCategory] = useState("Despesas");
  const [formDescription, setFormDescription] = useState("");
  const [formAccount, setFormAccount] = useState("Itaú");
  const [formValue, setFormValue] = useState("");
  const [formDate, setFormDate] = useState("2025-12-10");
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("finseven-transactions");
    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch (e) {
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("finseven-transactions", JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("finseven-theme") as "dark" | "light";
    if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
      localStorage.setItem("finseven-theme", "light");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
      localStorage.setItem("finseven-theme", "dark");
    }
  }, [theme]);

  useEffect(() => {
    if (typeParam === "Receitas" || typeParam === "Despesas" || typeParam === "Investimentos") {
      setFormType(typeParam);
      setFormCategory(typeParam);
    }
  }, [typeParam]);

  useEffect(() => {
    setFormCategory(formType);
  }, [formType]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
  };

  const getCategories = () => {
    if (formType === "Receitas") {
      return ["Receitas", "Salário", "Freelance", "Rendimentos", "Outros"];
    } else if (formType === "Investimentos") {
      return ["Investimentos", "Ações", "FIIs", "Renda Fixa", "Criptomoedas", "Outros"];
    } else {
      return ["Despesas", "Supermercado", "Aluguel", "Transporte", "Lazer", "Saúde", "Outros"];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valNum = parseFloat(formValue.replace(",", "."));
    if (isNaN(valNum) || valNum <= 0) {
      showToast("Por favor, digite um valor válido.", "error");
      return;
    }

    const defaultDesc = formType === "Receitas" 
      ? "Receita avulsa" 
      : formType === "Investimentos" 
      ? "Investimento avulso" 
      : "Despesa avulsa";

    const newTx: Transaction = {
      id: "tx-" + Date.now(),
      date: formDate,
      category: formCategory,
      description: formDescription || defaultDesc,
      account: formAccount,
      value: formType === "Receitas" ? valNum : -valNum,
      type: formType
    };

    setTransactions([newTx, ...transactions]);
    showToast("Lançamento efetuado com sucesso!", "success");

    setTimeout(() => {
      router.push("/");
    }, 1200);
  };

  const getThemeColor = () => {
    if (formType === "Receitas") return "emerald";
    if (formType === "Investimentos") return "cyan";
    return "rose";
  };

  const activeColor = getThemeColor();

  return (
    <div className={`flex h-screen w-screen transition-colors duration-300 overflow-hidden font-sans select-none animate-fade-in ${
      theme === "dark" ? "bg-[#0b0f19] text-slate-100" : "bg-[#f8fafc] text-slate-800"
    }`}>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-300 shadow-lg animate-bounce ${
          toast.type === "success" 
            ? "bg-emerald-950/95 border-emerald-500/35 text-emerald-300"
            : toast.type === "info"
            ? "bg-blue-950/95 border-blue-500/35 text-blue-300"
            : "bg-rose-950/95 border-rose-500/35 text-rose-300"
        }`}>
          <div className={`h-2 w-2 rounded-full ${
            toast.type === "success" ? "bg-emerald-400" : toast.type === "info" ? "bg-blue-400" : "bg-rose-400"
          }`} />
          {toast.message}
        </div>
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu}
        setActiveMenu={(menu) => {
          if (menu === "Home") {
            router.push("/");
          } else if (menu === "Lançamento") {
            setActiveMenu("Lançamento");
          } else if (menu === "Receitas") {
            router.push("/receitas");
          } else if (menu === "Despesas") {
            router.push("/despesas");
          } else if (menu === "Investimentos") {
            router.push("/investimentos");
          } else if (menu === "Conta Bancária") {
            router.push("/conta-bancaria");
          } else if (menu === "Categorias") {
            router.push("/categorias");
          } else {
            router.push("/?menu=" + menu);
          }
        }}
        theme={theme}
        showToast={showToast}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto animate-fade-in">
        <Header
          setSidebarOpen={setSidebarOpen}
          theme={theme}
          showToast={showToast}
        />

        <div className="p-6 max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center">
          <div className={`backdrop-blur-md border rounded-3xl p-8 shadow-2xl transition-all relative overflow-hidden animateFadeIn ${
            theme === "dark" 
              ? "bg-[#101422]/80 border-slate-800/60 shadow-[0_20px_50px_rgba(0,0,0,0.3)]" 
              : "bg-white border-slate-200/80 shadow-[0_20px_40px_rgba(15,23,42,0.06)]"
          }`}>
            <div className="flex items-center justify-between pb-5 border-b border-slate-850/60 mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${
                  activeColor === "emerald" 
                    ? "bg-emerald-500/10 text-emerald-400" 
                    : activeColor === "cyan" 
                    ? "bg-cyan-500/10 text-cyan-400" 
                    : "bg-rose-500/10 text-rose-400"
                }`}>
                  <svg className="w-6 h-6 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className={`text-xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-850"}`}>Novo Lançamento</h2>
                  <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Gere movimentações financeiras completas de fluxo.</p>
                </div>
              </div>

              <button 
                onClick={() => router.push("/")}
                className={`text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-all border cursor-pointer ${
                  theme === "dark" 
                    ? "bg-slate-800/40 border-slate-700/40 hover:bg-slate-800 hover:text-white text-slate-300" 
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-650"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Voltar</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className={`text-xs font-bold uppercase tracking-wider block mb-2.5 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}>Tipo de Lançamento</label>
                
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType("Receitas")}
                    className={`py-3.5 px-4 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                      formType === "Receitas"
                        ? "bg-emerald-600/15 border-emerald-500/45 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                        : theme === "dark"
                        ? "bg-[#070b13] border-slate-800/50 hover:bg-slate-800/30 text-slate-400 hover:text-slate-250"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Receita
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType("Despesas")}
                    className={`py-3.5 px-4 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                      formType === "Despesas"
                        ? "bg-rose-600/15 border-rose-500/45 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                        : theme === "dark"
                        ? "bg-[#070b13] border-slate-800/50 hover:bg-slate-800/30 text-slate-400 hover:text-slate-250"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    Despesa
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType("Investimentos")}
                    className={`py-3.5 px-4 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                      formType === "Investimentos"
                        ? "bg-cyan-600/15 border-cyan-500/45 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                        : theme === "dark"
                        ? "bg-[#070b13] border-slate-800/50 hover:bg-slate-800/30 text-slate-400 hover:text-slate-250"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Investimento
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}>Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-3 text-xs font-medium focus:outline-none transition-colors focus:ring-1 focus:ring-blue-500 ${
                      theme === "dark" 
                        ? "bg-[#070b13] border-slate-800/80 text-slate-200" 
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    {getCategories().map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}>Conta Financeira</label>
                  <select
                    value={formAccount}
                    onChange={(e) => setFormAccount(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-3 text-xs font-medium focus:outline-none transition-colors focus:ring-1 focus:ring-blue-500 ${
                      theme === "dark" 
                        ? "bg-[#070b13] border-slate-800/80 text-slate-200" 
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    {["NuBank", "Itaú", "Bradesco", "Caixa Econômica", "Santander", "Outros"].map(acc => (
                      <option key={acc} value={acc}>{acc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}>Valor (R$)</label>
                  <input
                    type="text"
                    required
                    placeholder="R$ 0,00"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-3 text-xs font-bold focus:outline-none transition-colors focus:ring-1 focus:ring-blue-500 ${
                      theme === "dark" 
                        ? "bg-[#070b13] border-slate-800/80 text-slate-200 placeholder-slate-650" 
                        : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}>Data do Lançamento</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    onClick={(e) => (e.currentTarget as any).showPicker?.()}
                    className={`w-full border rounded-xl px-3.5 py-3 text-xs font-medium focus:outline-none transition-colors focus:ring-1 focus:ring-blue-500 cursor-pointer ${
                      theme === "dark" 
                        ? "bg-[#070b13] border-slate-800/80 text-slate-200" 
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}>Descrição / Identificador</label>
                <input
                  type="text"
                  placeholder={
                    formType === "Receitas" 
                      ? "Ex: Salário Mensal" 
                      : formType === "Investimentos" 
                      ? "Ex: Ações de Tecnologia" 
                      : "Ex: Compras no Supermercado"
                  }
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-3 text-xs font-medium focus:outline-none transition-colors focus:ring-1 focus:ring-blue-500 ${
                    theme === "dark" 
                      ? "bg-[#070b13] border-slate-800/80 text-slate-200 placeholder-slate-650" 
                      : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400"
                  }`}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold cursor-pointer text-center transition-all ${
                    theme === "dark" 
                      ? "bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/40" 
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                  }`}
                >
                  Cancelar Lançamento
                </button>

                <button
                  type="submit"
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition-all duration-200 cursor-pointer text-center hover:scale-[1.02] ${
                    activeColor === "emerald"
                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                      : activeColor === "cyan"
                      ? "bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20"
                      : "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20"
                  }`}
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LancamentoPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-[#0b0f19] text-slate-400">
        Carregando formulário...
      </div>
    }>
      <LancamentoContent />
    </Suspense>
  );
}
