"use client";

import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { SidebarProps } from "@/interfaces";
import { useRouter } from "next/navigation";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeMenu,
  setActiveMenu,
  theme,
  showToast,
}: SidebarProps) {
  const router = useRouter();
  const [loggedUser, setLoggedUser] = useState<{ name: string; cpf: string; email: string } | null>(null);

  const [activeReport, setActiveReport] = useState<"Mês atual" | "Último trimestre" | "Investimento anual" | "Balanço Mensal" | null>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("finseven-logged-user");
    if (userJson) {
      try {
        setLoggedUser(JSON.parse(userJson));
      } catch (e) {
        // ignore
      }
    }
  }, []);

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
              { name: "Conta Bancária", label: "Conta Bancária", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              )},
              { name: "Categorias", label: "Categorias", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              )},
              { name: "Perfil", label: "Meu Perfil", icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                  onClick={() => {
                    setActiveReport(rep as any);
                    showToast(`Gerando relatório: ${rep}`, "success");
                  }}
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
            onClick={() => {
              localStorage.removeItem("finseven-logged-user");
              showToast("Sessão encerrada com sucesso!", "success");
              router.push("/login");
            }} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {activeReport && (
        <ReportModal
          reportType={activeReport}
          onClose={() => setActiveReport(null)}
          theme={theme}
        />
      )}

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm xl:hidden" />
      )}
    </>
  );
}

/* ==========================================================================
   ReportModal - Subcomponent to render dynamic saved reports elegantly
   ========================================================================== */
interface ReportModalProps {
  reportType: "Mês atual" | "Último trimestre" | "Investimento anual" | "Balanço Mensal";
  onClose: () => void;
  theme: "dark" | "light";
}

function ReportModal({ reportType, onClose, theme }: ReportModalProps) {
  const [txs, setTxs] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const savedTxs = localStorage.getItem("finseven-transactions");
    const savedAccs = localStorage.getItem("finseven-bank-accounts");
    if (savedTxs) {
      try {
        setTxs(JSON.parse(savedTxs));
      } catch (e) {}
    }
    if (savedAccs) {
      try {
        setAccounts(JSON.parse(savedAccs));
      } catch (e) {}
    }
  }, [reportType]);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  // Computations for Mês atual (May 2026 based on our dataset)
  const currentMonthData = React.useMemo(() => {
    const now = new Date();
    const padMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentMonthPrefix = `${now.getFullYear()}-${padMonth}`; // "2026-05"

    const monthlyTxs = txs.filter(t => t.date.startsWith(currentMonthPrefix));
    let receitas = 0;
    let despesas = 0;
    let investimentos = 0;

    const categorySummary: { [cat: string]: number } = {};

    monthlyTxs.forEach(t => {
      if (t.type === "Receitas") {
        receitas += t.value;
      } else if (t.type === "Despesas") {
        despesas += Math.abs(t.value);
        categorySummary[t.category] = (categorySummary[t.category] || 0) + Math.abs(t.value);
      } else if (t.type === "Investimentos") {
        investimentos += Math.abs(t.value);
      }
    });

    const topCategories = Object.entries(categorySummary)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    return {
      receitas,
      despesas,
      investimentos,
      balanco: receitas - despesas - investimentos,
      topCategories,
      count: monthlyTxs.length
    };
  }, [txs]);

  // Computations for Último trimestre (Feb, Mar, Apr 2026)
  const quarterData = React.useMemo(() => {
    const months = [
      { name: "Fevereiro", prefix: "2026-02" },
      { name: "Março", prefix: "2026-03" },
      { name: "Abril", prefix: "2026-04" }
    ];

    let totalQuarterRevenues = 0;
    let totalQuarterExpenses = 0;

    const computed = months.map(m => {
      const monthTxs = txs.filter(t => t.date.startsWith(m.prefix));
      let rec = 0;
      let desp = 0;
      monthTxs.forEach(t => {
        if (t.type === "Receitas") rec += t.value;
        else if (t.type === "Despesas") desp += Math.abs(t.value);
      });
      totalQuarterRevenues += rec;
      totalQuarterExpenses += desp;
      return {
        ...m,
        receitas: rec,
        despesas: desp,
        balanco: rec - desp
      };
    });

    const savingsRate = totalQuarterRevenues > 0 
      ? Math.round(((totalQuarterRevenues - totalQuarterExpenses) / totalQuarterRevenues) * 100) 
      : 0;

    return {
      computed,
      savingsRate,
      avgIncome: totalQuarterRevenues / 3,
      avgExpenses: totalQuarterExpenses / 3
    };
  }, [txs]);

  // Computations for Investimento anual (Year 2026)
  const annualInvestments = React.useMemo(() => {
    const annualTxs = txs.filter(t => t.date.startsWith("2026") && t.type === "Investimentos");
    let total = 0;
    let fixa = 0;
    let variavel = 0;
    let cripto = 0;

    const fixaCategories = ["Tesouro Direto", "CDB", "LCI/LCA", "Poupança", "Debêntures"];
    const variavelCategories = ["Ações", "FIIs", "ETFs", "BDRs"];
    const criptoCategories = ["Bitcoin", "Ethereum", "Solana", "Stablecoins"];

    annualTxs.forEach(t => {
      const val = Math.abs(t.value);
      total += val;
      if (fixaCategories.includes(t.category)) fixa += val;
      else if (variavelCategories.includes(t.category)) variavel += val;
      else if (criptoCategories.includes(t.category)) cripto += val;
      else fixa += val; // Fallback
    });

    // 5 Years simulated projections at 10.5% average annual yield
    const projection = [];
    let currentCapital = total > 0 ? total : 25000; // fallback if no investments logged
    for (let yr = 1; yr <= 5; yr++) {
      currentCapital = currentCapital * 1.105;
      projection.push({ year: yr, val: currentCapital });
    }

    return {
      total,
      fixa,
      variavel,
      cripto,
      projection,
      fixaPct: total > 0 ? Math.round((fixa / total) * 100) : 40,
      variavelPct: total > 0 ? Math.round((variavel / total) * 100) : 35,
      criptoPct: total > 0 ? Math.round((cripto / total) * 100) : 25
    };
  }, [txs]);

  // Computations for Balanço Mensal (Itaú vs Banco do Brasil)
  const bankBalanceData = React.useMemo(() => {
    const now = new Date();
    const padMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentMonthPrefix = `${now.getFullYear()}-${padMonth}`; // "2026-05"

    const activeTxs = txs.filter(t => t.date.startsWith(currentMonthPrefix));

    let itauIn = 0;
    let itauOut = 0;
    let bbIn = 0;
    let bbOut = 0;

    activeTxs.forEach(t => {
      const val = Math.abs(t.value);
      if (t.account === "Itaú") {
        if (t.value > 0) itauIn += val;
        else itauOut += val;
      } else if (t.account === "Banco do Brasil") {
        if (t.value > 0) bbIn += val;
        else bbOut += val;
      }
    });

    const itauInitial = accounts.find(a => a.bankCode === "341")?.initialBalance || 12500;
    const bbInitial = accounts.find(a => a.bankCode === "001")?.initialBalance || 8500;

    const itauNet = itauIn - itauOut;
    const bbNet = bbIn - bbOut;

    const itauTotal = itauIn + itauOut;
    const bbTotal = bbIn + bbOut;
    const grandTotal = itauTotal + bbTotal;

    return {
      itauIn,
      itauOut,
      itauNet,
      itauCurrent: itauInitial + itauNet,
      bbIn,
      bbOut,
      bbNet,
      bbCurrent: bbInitial + bbNet,
      itauVolumePct: grandTotal > 0 ? Math.round((itauTotal / grandTotal) * 100) : 55,
      bbVolumePct: grandTotal > 0 ? Math.round((bbTotal / grandTotal) * 100) : 45
    };
  }, [txs, accounts]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300" />

      {/* Modal Container */}
      <div className={`border rounded-3xl w-full max-w-lg shadow-2xl relative z-10 p-6 overflow-hidden transition-all animateFadeIn ${
        theme === "dark" ? "bg-[#0b0f19] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
      }`}>
        {/* Glow Effects (Dark Theme) */}
        {theme === "dark" && (
          <>
            <div className="absolute -top-24 -left-24 h-48 w-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 h-48 w-48 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
          </>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/50 mb-5">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-base font-black tracking-tight">{reportType}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-800/40 hover:text-white transition-all cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-5 text-xs">

          {/* ================= REPORT: Mês Atual ================= */}
          {reportType === "Mês atual" && (
            <div className="space-y-4 animateFadeIn">
              <p className="text-slate-400 font-medium leading-relaxed">
                Demonstrativo de fluxos consolidados do mês corrente (<span className="text-blue-400 font-bold">Maio 2026</span>) calculado a partir de <strong className="text-slate-200">{currentMonthData.count} transações</strong> registradas.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className={`p-3 rounded-xl border ${theme === "dark" ? "bg-[#101524]/60 border-slate-800/40" : "bg-slate-50 border-slate-100"}`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Receitas (+)</span>
                  <span className="text-sm font-black text-emerald-400">{formatBRL(currentMonthData.receitas)}</span>
                </div>
                <div className={`p-3 rounded-xl border ${theme === "dark" ? "bg-[#101524]/60 border-slate-800/40" : "bg-slate-50 border-slate-100"}`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Despesas (-)</span>
                  <span className="text-sm font-black text-rose-450">{formatBRL(currentMonthData.despesas)}</span>
                </div>
                <div className={`p-3 rounded-xl border ${theme === "dark" ? "bg-[#101524]/60 border-slate-800/40" : "bg-slate-50 border-slate-100"}`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Investimentos</span>
                  <span className="text-sm font-black text-cyan-400">{formatBRL(currentMonthData.investimentos)}</span>
                </div>
                <div className={`p-3 rounded-xl border ${theme === "dark" ? "bg-[#101524]/60 border-slate-800/40" : "bg-slate-50 border-slate-100"}`}>
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Resultado Líquido</span>
                  <span className={`text-sm font-black ${currentMonthData.balanco >= 0 ? "text-blue-400" : "text-rose-400"}`}>
                    {formatBRL(currentMonthData.balanco)}
                  </span>
                </div>
              </div>

              {currentMonthData.topCategories.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Maiores Despesas do Mês</h4>
                  <div className="space-y-2.5">
                    {currentMonthData.topCategories.map(c => {
                      const totalDesp = currentMonthData.despesas > 0 ? currentMonthData.despesas : 1;
                      const pct = Math.round((c.value / totalDesp) * 100);
                      return (
                        <div key={c.name} className="space-y-1">
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-slate-300">{c.name}</span>
                            <span className="text-slate-400">{formatBRL(c.value)} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= REPORT: Último Trimestre ================= */}
          {reportType === "Último trimestre" && (
            <div className="space-y-4 animateFadeIn">
              <p className="text-slate-400 font-medium leading-relaxed">
                Análise trimestral de desempenho consolidando os meses de <span className="text-blue-400 font-semibold">Fev, Mar e Abr de 2026</span>.
              </p>

              <div className="space-y-3 pt-1">
                {quarterData.computed.map(m => {
                  const hasIncome = m.receitas > 0;
                  const rate = hasIncome ? Math.round(((m.receitas - m.despesas) / m.receitas) * 100) : 0;
                  return (
                    <div key={m.name} className={`p-3.5 rounded-2xl border ${
                      theme === "dark" ? "bg-[#101524]/60 border-slate-800/40" : "bg-slate-50 border-slate-100"
                    } flex items-center justify-between`}>
                      <div className="space-y-0.5">
                        <strong className="text-slate-200 text-xs">{m.name} 2026</strong>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                          <span className="text-emerald-400">Rec: {formatBRL(m.receitas)}</span>
                          <span>•</span>
                          <span className="text-rose-400">Desp: {formatBRL(m.despesas)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-black block ${m.balanco >= 0 ? "text-blue-400" : "text-rose-450"}`}>
                          {formatBRL(m.balanco)}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                          Sobras: {rate}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-blue-950/15 border-blue-900/30" : "bg-blue-50 border-blue-100"} flex items-center justify-between pt-3`}>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Taxa de Poupança Trimestral</span>
                  <p className="text-slate-300 font-medium">Percentual médio de receita líquida poupada</p>
                </div>
                <div className="h-12 w-12 rounded-full border-2 border-blue-500 flex items-center justify-center font-black text-blue-400 text-sm shadow-[0_0_12px_rgba(59,130,246,0.2)]">
                  {quarterData.savingsRate}%
                </div>
              </div>
            </div>
          )}

          {/* ================= REPORT: Investimento Anual ================= */}
          {reportType === "Investimento anual" && (
            <div className="space-y-4 animateFadeIn">
              <p className="text-slate-400 font-medium leading-relaxed">
                Consolidado de aportes efetuados no ano de <span className="text-blue-400 font-semibold">2026</span> e alocação percentual por classe de ativos de investimento.
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-slate-300 font-bold">Total Aplicado em 2026:</span>
                  <span className="text-base font-black text-cyan-400">{formatBRL(annualInvestments.total)}</span>
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-blue-500" /> Renda Fixa
                      </span>
                      <span className="text-slate-300">{formatBRL(annualInvestments.fixa)} ({annualInvestments.fixaPct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${annualInvestments.fixaPct}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-cyan-500" /> Renda Variável
                      </span>
                      <span className="text-slate-300">{formatBRL(annualInvestments.variavel)} ({annualInvestments.variavelPct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${annualInvestments.variavelPct}%` }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-amber-500" /> Criptomoedas
                      </span>
                      <span className="text-slate-300">{formatBRL(annualInvestments.cripto)} ({annualInvestments.criptoPct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${annualInvestments.criptoPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Projeção de Rendimento (Próximos 5 Anos)</h4>
                <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold text-slate-400">
                  {annualInvestments.projection.map(p => (
                    <div key={p.year} className={`p-2 rounded-xl border ${theme === "dark" ? "bg-[#101524]/40 border-slate-850" : "bg-slate-50 border-slate-100"}`}>
                      <span className="text-blue-400 block mb-1">Ano {p.year}</span>
                      <span className="text-slate-200 block text-[9px] font-semibold">{formatBRL(p.val).split(",")[0]}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-slate-500 mt-2 text-center italic">Calculado assumindo uma taxa média ponderada de 10,5% a.a. sem aportes adicionais.</p>
              </div>
            </div>
          )}

          {/* ================= REPORT: Balanço Mensal ================= */}
          {reportType === "Balanço Mensal" && (
            <div className="space-y-4 animateFadeIn">
              <p className="text-slate-400 font-medium leading-relaxed">
                Extrato consolidado por conta financeira ativa (<span className="text-blue-400 font-semibold">Itaú vs Banco do Brasil</span>) no período de Maio 2026.
              </p>

              <div className="space-y-3 pt-1">
                {/* Account 1: Itaú */}
                <div className={`p-3.5 rounded-2xl border ${theme === "dark" ? "bg-[#101524]/60 border-slate-800/40" : "bg-slate-50 border-slate-100"} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <strong className="text-blue-400 font-black text-xs">ITAÚ UNIBANCO (Conta Corrente)</strong>
                    <span className="text-slate-200 font-bold">{formatBRL(bankBalanceData.itauCurrent)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-500">
                    <div>
                      <span className="block text-[9px] text-slate-500">Entradas</span>
                      <span className="text-emerald-400 block text-xs">{formatBRL(bankBalanceData.itauIn)}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500">Saídas</span>
                      <span className="text-rose-400 block text-xs">{formatBRL(bankBalanceData.itauOut)}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] text-slate-500">Fluxo Líquido</span>
                      <span className={`block text-xs ${bankBalanceData.itauNet >= 0 ? "text-blue-400" : "text-rose-450"}`}>{formatBRL(bankBalanceData.itauNet)}</span>
                    </div>
                  </div>
                </div>

                {/* Account 2: Banco do Brasil */}
                <div className={`p-3.5 rounded-2xl border ${theme === "dark" ? "bg-[#101524]/60 border-slate-800/40" : "bg-slate-50 border-slate-100"} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <strong className="text-violet-400 font-black text-xs">BANCO DO BRASIL (Conta Salário)</strong>
                    <span className="text-slate-200 font-bold">{formatBRL(bankBalanceData.bbCurrent)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-500">
                    <div>
                      <span className="block text-[9px] text-slate-500">Entradas</span>
                      <span className="text-emerald-400 block text-xs">{formatBRL(bankBalanceData.bbIn)}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-500">Saídas</span>
                      <span className="text-rose-400 block text-xs">{formatBRL(bankBalanceData.bbOut)}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] text-slate-500">Fluxo Líquido</span>
                      <span className={`block text-xs ${bankBalanceData.bbNet >= 0 ? "text-blue-400" : "text-rose-450"}`}>{formatBRL(bankBalanceData.bbNet)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-1.5 space-y-2">
                <div className="flex items-center justify-between font-bold text-[10px] text-slate-500 uppercase tracking-wider">
                  <span>Proporção de Volume Movimentado</span>
                  <span>Itaú {bankBalanceData.itauVolumePct}% vs BB {bankBalanceData.bbVolumePct}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div className="h-full bg-blue-500 rounded-l-full" style={{ width: `${bankBalanceData.itauVolumePct}%` }} />
                  <div className="h-full bg-violet-500 rounded-r-full" style={{ width: `${bankBalanceData.bbVolumePct}%` }} />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800/50 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99]"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
}
