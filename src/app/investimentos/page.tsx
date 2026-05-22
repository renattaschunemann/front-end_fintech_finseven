"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Transaction } from "@/interfaces";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TransactionTable from "@/components/TransactionTable";
import EditModal from "@/components/EditModal";

function InvestimentosContent() {
  const router = useRouter();
  const generateMockTransactions = (): Transaction[] => {
    const list: Transaction[] = [];
    const startYear = 2024;
    const startMonth = 0;
    const endYear = 2026;
    const endMonth = 4;

    let idCounter = 1;

    const accounts = ["NuBank", "Itaú", "Bradesco", "Caixa Econômica", "Santander"];
    const categoriesReceitas = ["Salário", "Freelance", "Rendimentos", "Outros"];
    const categoriesDespesas = ["Supermercado", "Aluguel", "Transporte", "Lazer", "Saúde", "Outros"];
    const categoriesInvestimentos = ["Tesouro Direto", "Ações", "FIIs", "Cripto", "Renda Fixa", "Outros"];

    const descReceitas = [
      ["Salário Mensal", "Rendimento Mensal", "Prêmio Trimestral"],
      ["Projeto Freelance", "Consultoria Técnica", "Desenvolvimento Web"],
      ["Rendimento FIIs", "Dividendos Ações", "Aplicação Renda Fixa"],
      ["Reembolso Despesas", "Venda de Usado", "Bônus Anual"]
    ];

    const descDespesas = [
      ["Compras Mensais", "Feira de Orgânicos", "Padaria e Lanches"],
      ["Aluguel Residencial", "Condomínio", "Conta de Luz e Água"],
      ["Combustível", "Mensalidade Metrô", "Aplicativo de Corrida"],
      ["Cinema e Jantar", "Viagem Fim de Semana", "Assinatura Streaming"],
      ["Consulta Médica", "Farmácia", "Exames Clínicos"],
      ["Material de Escritório", "Presente de Aniversário", "Manutenção Casa"]
    ];

    const descInvestimentos = [
      ["Tesouro IPCA+ 2029", "Tesouro Selic 2027", "Tesouro Prefixado 2031"],
      ["Ações ITUB4", "Ações VALE3", "Ações PETR4"],
      ["Cotas MXRF11", "Cotas HGLG11", "Cotas KNRI11"],
      ["Compra Bitcoin", "Compra Ethereum", "Aporte Cripto Basket"],
      ["CDB Liquidez Diária", "LCI 90% CDI", "Debêntures Incentivadas"],
      ["Aporte Fundo Multimercado", "Previdência Privada", "Investimento Internacional"]
    ];

    for (let year = startYear; year <= endYear; year++) {
      const minM = year === startYear ? startMonth : 0;
      const maxM = year === endYear ? endMonth : 11;

      for (let month = minM; month <= maxM; month++) {
        const padMonth = String(month + 1).padStart(2, "0");

        for (let i = 0; i < 3; i++) {
          const dayReceita = String(5 + i * 7).padStart(2, "0");
          const dateStr = `${year}-${padMonth}-${dayReceita}`;
          
          const catIdx = (year + month + i) % categoriesReceitas.length;
          const cat = categoriesReceitas[catIdx];
          const descList = descReceitas[catIdx];
          const desc = descList[i % descList.length];
          const value = 2000 + ((year - startYear) * 300) + (month * 50) + (i * 250);

          list.push({
            id: `tx-gen-${idCounter++}`,
            date: dateStr,
            category: cat,
            description: desc,
            account: accounts[idCounter % accounts.length],
            value: value,
            type: "Receitas"
          });
        }

        for (let i = 0; i < 3; i++) {
          const dayDespesa = String(10 + i * 8).padStart(2, "0");
          const dateStr = `${year}-${padMonth}-${dayDespesa}`;

          const catIdx = (year + month + i) % categoriesDespesas.length;
          const cat = categoriesDespesas[catIdx];
          const descList = descDespesas[catIdx];
          const desc = descList[i % descList.length];
          const value = 150 + (month * 15) + (i * 120);

          list.push({
            id: `tx-gen-${idCounter++}`,
            date: dateStr,
            category: cat,
            description: desc,
            account: accounts[idCounter % accounts.length],
            value: -value,
            type: "Despesas"
          });
        }

        for (let i = 0; i < 3; i++) {
          const dayInvest = String(15 + i * 6).padStart(2, "0");
          const dateStr = `${year}-${padMonth}-${dayInvest}`;

          const catIdx = (year + month + i) % categoriesInvestimentos.length;
          const cat = categoriesInvestimentos[catIdx];
          const descList = descInvestimentos[catIdx];
          const desc = descList[i % descList.length];
          const value = 200 + (month * 20) + (i * 150);

          list.push({
            id: `tx-gen-${idCounter++}`,
            date: dateStr,
            category: cat,
            description: desc,
            account: accounts[idCounter % accounts.length],
            value: value,
            type: "Investimentos"
          });
        }
      }
    }

    return list.sort((a, b) => b.date.localeCompare(a.date));
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeMenu, setActiveMenu] = useState("Investimentos");

  const [activeFilter, setActiveFilter] = useState<"30" | "69" | "90" | "custom" | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [formType, setFormType] = useState<"Receitas" | "Despesas" | "Investimentos">("Investimentos");
  const [formCategory, setFormCategory] = useState("Investimentos");
  const [formDescription, setFormDescription] = useState("");
  const [formAccount, setFormAccount] = useState("Itaú");
  const [formValue, setFormValue] = useState("");
  const [formDate, setFormDate] = useState("2025-12-10");

  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("finseven-transactions");
    const initialTxs = generateMockTransactions();
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasInvestments = parsed.some((t: any) => t.type === "Investimentos");
        if (parsed.length < 10 || !hasInvestments) {
          setTransactions(initialTxs);
        } else {
          setTransactions(parsed);
        }
      } catch (e) {
        setTransactions(initialTxs);
      }
    } else {
      setTransactions(initialTxs);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("finseven-transactions", JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

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

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      showToast(`Tema alterado para Modo ${next === "dark" ? "Escuro" : "Claro"}!`, "info");
      return next;
    });
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return transactions.filter(t => {
      if (t.type !== "Investimentos") return false;

      if (activeFilter === "all") return true;

      const txDate = new Date(t.date + "T00:00:00");

      if (activeFilter === "30") {
        const limit = new Date(today);
        limit.setDate(limit.getDate() - 30);
        return txDate >= limit && txDate <= today;
      }
      if (activeFilter === "69") {
        const limit = new Date(today);
        limit.setDate(limit.getDate() - 69);
        return txDate >= limit && txDate <= today;
      }
      if (activeFilter === "90") {
        const limit = new Date(today);
        limit.setDate(limit.getDate() - 90);
        return txDate >= limit && txDate <= today;
      }
      if (activeFilter === "custom") {
        if (!startDate || !endDate) return true;
        const start = new Date(startDate + "T00:00:00");
        const end = new Date(endDate + "T00:00:00");
        return txDate >= start && txDate <= end;
      }
      return true;
    });
  }, [transactions, activeFilter, startDate, endDate]);

  const totalPeriodo = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + Math.abs(t.value), 0);
  }, [filteredTransactions]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  const formatDateForDisplay = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setFormType(tx.type);
    setFormCategory(tx.category);
    setFormDescription(tx.description);
    setFormAccount(tx.account);
    setFormValue(Math.abs(tx.value).toString());
    setFormDate(tx.date);
    setIsEditModalOpen(true);
  };

  const handleEditTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    const valNum = parseFloat(formValue.replace(",", "."));
    if (isNaN(valNum) || valNum <= 0) {
      showToast("Por favor, digite um valor válido.", "error");
      return;
    }
    const updatedTx: Transaction = {
      ...editingTransaction,
      date: formDate,
      category: formCategory,
      description: formDescription,
      account: formAccount,
      value: formType === "Receitas" ? valNum : formType === "Despesas" ? -valNum : valNum,
      type: formType
    };
    setTransactions(transactions.map(t => t.id === editingTransaction.id ? updatedTx : t));
    setIsEditModalOpen(false);
    setEditingTransaction(null);
    showToast("Lançamento atualizado com sucesso!");
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este lançamento?")) {
      setTransactions(transactions.filter(t => t.id !== id));
      showToast("Lançamento excluído com sucesso!", "info");
    }
  };

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
            router.push("/lancamento");
          } else if (menu === "Receitas") {
            router.push("/receitas");
          } else if (menu === "Despesas") {
            router.push("/despesas");
          } else if (menu === "Investimentos") {
            setActiveMenu("Investimentos");
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
          onAddClick={() => router.push("/lancamento?type=Investimentos")}
          showToast={showToast}
        />

        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-extrabold tracking-tight ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}>
                Meus Investimentos
              </h1>
              <p className={`text-xs mt-1 ${
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}>
                Gerencie e acompanhe o crescimento e aportes de sua carteira de investimentos.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-2xl p-4 shadow-lg border border-cyan-400/20 w-full md:w-80 group relative overflow-hidden glowCyan">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-115 transition-transform duration-300">
                <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-bold text-cyan-100 uppercase tracking-widest opacity-90">
                  Total Investido no Período
                </p>
                <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {formatCurrency(totalPeriodo)}
                </p>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-3xl border backdrop-blur-md transition-all ${
            theme === "dark" 
              ? "bg-[#101422]/70 border-slate-800/60 shadow-[0_15px_30px_rgba(0,0,0,0.2)]" 
              : "bg-white border-slate-200/80 shadow-[0_15px_30px_rgba(15,23,42,0.04)]"
          }`}>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-4 ${
              theme === "dark" ? "text-slate-300" : "text-slate-700"
            }`}>
              Filtro de Período
            </h2>
            
            <div className="flex flex-col lg:flex-row gap-6 items-end justify-between">
              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                {[
                  { id: "all", label: "Todos" },
                  { id: "30", label: "Últimos 30 Dias" },
                  { id: "69", label: "Últimos 69 Dias" },
                  { id: "90", label: "Últimos 90 Dias" }
                ].map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setActiveFilter(f.id as any);
                      showToast(`Filtrando por: ${f.label}`, "info");
                    }}
                    className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      activeFilter === f.id
                        ? "bg-cyan-600/15 border-cyan-500/45 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                        : theme === "dark"
                        ? "bg-[#070b13] border-slate-800/50 hover:bg-slate-800/30 text-slate-400 hover:text-slate-250"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-850"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
                <div className="flex-1 sm:flex-initial">
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}>De</label>
                  <input
                    id="filter-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onBlur={(e) => setStartDate(e.target.value)}
                    className={`w-full sm:w-40 border rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none transition-colors focus:ring-1 focus:ring-cyan-500 select-text ${
                      theme === "dark" 
                        ? "bg-[#070b13] border-slate-800/80 text-slate-200" 
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                </div>

                <div className="flex-1 sm:flex-initial">
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}>Até</label>
                  <input
                    id="filter-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    onBlur={(e) => setEndDate(e.target.value)}
                    className={`w-full sm:w-40 border rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none transition-colors focus:ring-1 focus:ring-cyan-500 select-text ${
                      theme === "dark" 
                        ? "bg-[#070b13] border-slate-800/80 text-slate-200" 
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    let startVal = startDate;
                    let endVal = endDate;
                    if (!startVal) {
                      const el = document.getElementById("filter-start-date") as HTMLInputElement;
                      if (el && el.value) {
                        startVal = el.value;
                      }
                    }
                    if (!endVal) {
                      const el = document.getElementById("filter-end-date") as HTMLInputElement;
                      if (el && el.value) {
                        endVal = el.value;
                      }
                    }
                    const normalizeDate = (d: string) => {
                      if (!d) return "";
                      const clean = d.trim();
                      if (clean.includes("/")) {
                        const parts = clean.split("/");
                        if (parts.length === 3) {
                          if (parts[2].length === 4) {
                            return `${parts[2]}-${parts[1]}-${parts[0]}`;
                          }
                          if (parts[0].length === 4) {
                            return `${parts[0]}-${parts[1]}-${parts[2]}`;
                          }
                        }
                      }
                      return clean;
                    };
                    const normStart = normalizeDate(startVal);
                    const normEnd = normalizeDate(endVal);
                    if (normStart) setStartDate(normStart);
                    if (normEnd) setEndDate(normEnd);
                    if (!normStart || !normEnd) {
                      showToast("Por favor, selecione ambas as datas para filtrar.", "error");
                      return;
                    }
                    if (new Date(normStart) > new Date(normEnd)) {
                      showToast("A data inicial não pode ser posterior à data final.", "error");
                      return;
                    }
                    setActiveFilter("custom");
                    showToast("Filtro personalizado de data aplicado!", "success");
                  }}
                  className={`w-full sm:w-auto py-2.5 px-5 rounded-xl text-xs font-bold text-white shadow-lg transition-all duration-200 cursor-pointer text-center bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/20 hover:scale-[1.02]`}
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>

          <TransactionTable
            transactions={filteredTransactions}
            theme={theme}
            onEditClick={handleOpenEditModal}
            onDeleteClick={handleDeleteTransaction}
            formatCurrency={formatCurrency}
            formatDateForDisplay={formatDateForDisplay}
            onQuickAddClick={(type) => router.push("/lancamento?type=" + type)}
          />
        </div>
      </main>

      <button 
        type="button"
        onClick={toggleTheme}
        className={`fixed bottom-6 right-6 z-30 h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group ${
          theme === "dark"
            ? "bg-violet-600 text-white shadow-violet-500/30 hover:shadow-violet-500/50 hover:bg-violet-500"
            : "bg-amber-500 text-white shadow-amber-500/30 hover:shadow-amber-500/50 hover:bg-amber-450"
        }`}
        title={theme === "dark" ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
      >
        {theme === "dark" ? (
          <svg className="w-5.5 h-5.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg className="w-5.5 h-5.5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
          </svg>
        )}
      </button>

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleEditTransaction}
        formType={formType}
        setFormType={setFormType}
        formDescription={formDescription}
        setFormDescription={setFormDescription}
        formValue={formValue}
        setFormValue={setFormValue}
        formDate={formDate}
        setFormDate={setFormDate}
        formAccount={formAccount}
        setFormAccount={setFormAccount}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        theme={theme}
      />
    </div>
  );
}

export default function InvestimentosPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-[#0b0f19] text-slate-400">
        Carregando investimentos...
      </div>
    }>
      <InvestimentosContent />
    </Suspense>
  );
}
