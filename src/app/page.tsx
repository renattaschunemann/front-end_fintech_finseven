"use client";

import { useState, useMemo, useEffect } from "react";

interface Transaction {
  id: string;
  date: string; 
  category: string;
  description: string;
  account: string;
  value: number; 
  type: "Receitas" | "Despesas";
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    date: "2025-12-10",
    category: "Despesas",
    description: "Cartão de Crédito",
    account: "Bradesco",
    value: -1110.50,
    type: "Despesas",
  },
  {
    id: "tx-2",
    date: "2025-12-09",
    category: "Receitas",
    description: "Salário",
    account: "Caixa Econômica",
    value: 4500.00,
    type: "Receitas",
  },
  {
    id: "tx-3",
    date: "2025-12-08",
    category: "Despesas",
    description: "Supermercado",
    account: "Itaú",
    value: -320.75,
    type: "Despesas",
  },
  {
    id: "tx-4",
    date: "2025-12-05",
    category: "Receitas",
    description: "Freelance",
    account: "NuBank",
    value: 800.00,
    type: "Receitas",
  }
];

const MONTHLY_HISTORICAL_DATA = [
  { name: "Julho", receitas: 5300, despesas: 4100 },
  { name: "Agosto", receitas: 5500, despesas: 4500 },
  { name: "Setembro", receitas: 5100, despesas: 4800 },
  { name: "Outubro", receitas: 5800, despesas: 4200 },
  { name: "Novembro", receitas: 5600, despesas: 4900 },
];

export default function Home() {

  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const [activeMenu, setActiveMenu] = useState("Home");

  const [currentFilter, setCurrentFilter] = useState("Dezembro");

  const [formType, setFormType] = useState<"Receitas" | "Despesas">("Despesas");
  const [formCategory, setFormCategory] = useState("Despesas");
  const [formDescription, setFormDescription] = useState("");
  const [formAccount, setFormAccount] = useState("Itaú");
  const [formValue, setFormValue] = useState("");
  const [formDate, setFormDate] = useState("2025-12-10");

  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

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

  const CARRYOVER_BALANCE = 4631.25;

  const stats = useMemo(() => {
    const currentMonthTxs = transactions.filter(t => t.date.startsWith("2025-12"));

    let receitasDoMes = 0;
    let despesasDoMes = 0;

    currentMonthTxs.forEach(t => {
      if (t.value > 0) {
        receitasDoMes += t.value;
      } else {
        despesasDoMes += Math.abs(t.value);
      }
    });

    const balancoDoMes = receitasDoMes - despesasDoMes;
    const saldoAtual = CARRYOVER_BALANCE + balancoDoMes;

    return {
      saldoAtual,
      receitasDoMes,
      despesasDoMes,
      balancoDoMes
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    return [
      ...MONTHLY_HISTORICAL_DATA,
      {
        name: "Dezembro",
        receitas: stats.receitasDoMes,
        despesas: stats.despesasDoMes
      }
    ];
  }, [stats]);

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

  const handleOpenAddModal = (type: "Receitas" | "Despesas" = "Despesas") => {
    setFormType(type);
    setFormCategory(type === "Receitas" ? "Receitas" : "Despesas");
    setFormDescription("");
    setFormAccount("Itaú");
    setFormValue("");
    setFormDate("2025-12-11");
    setIsAddModalOpen(true);
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

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const valNum = parseFloat(formValue.replace(",", "."));
    if (isNaN(valNum) || valNum <= 0) {
      showToast("Por favor, digite um valor válido.", "error");
      return;
    }

    const newTx: Transaction = {
      id: "tx-" + Date.now(),
      date: formDate,
      category: formCategory,
      description: formDescription || (formType === "Receitas" ? "Receita avulsa" : "Despesa avulsa"),
      account: formAccount,
      value: formType === "Receitas" ? valNum : -valNum,
      type: formType
    };

    setTransactions([newTx, ...transactions]);
    setIsAddModalOpen(false);
    showToast(`${formType === "Receitas" ? "Receita" : "Despesa"} lançada com sucesso!`);
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
      value: formType === "Receitas" ? valNum : -valNum,
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

  const [activeTooltip, setActiveTooltip] = useState<{
    x: number;
    y: number;
    month: string;
    receitas: number;
    despesas: number;
  } | null>(null);

  const chartHeight = 250;
  const chartWidth = 700;
  const paddingLeft = 45;
  const paddingRight = 10;
  const paddingTop = 25;
  const paddingBottom = 30;

  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const graphWidth = chartWidth - paddingLeft - paddingRight;

  const maxVal = 6000; 

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
                className="h-9 w-auto object-contain drop-shadow-[0_0_8px_rgba(34,211,238,0.25)] hover:scale-102 transition-transform duration-300"
              />
              <p className={`text-[7px] font-bold uppercase tracking-[0.2em] leading-none pl-1 mt-1 transition-colors ${
                theme === "dark" ? "text-cyan-500" : "text-cyan-600"
              }`}>
                Gestão de Finanças Pessoais
              </p>
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
                      ? "bg-blue-600/15 text-blue-400 border border-blue-500/20 glow-blue shadow-md"
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
              {["Mês atual", "Último trimestre", "Investimento anual", "Balanço Mensal"].map((rep, idx) => (
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

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

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
              onClick={() => handleOpenAddModal("Despesas")}
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

        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">

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

          <div className={`backdrop-blur border rounded-2xl p-6 shadow-md relative transition-all ${
            theme === "dark" ? "bg-[#101422]/70 border-slate-800/40" : "bg-white border-slate-200 shadow-sm"
          }`}>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <h3 className={`text-base font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-800"}`}>Receitas vs. Despesas Mensais</h3>
                <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>Visão geral do fluxo de caixa histórico e atual.</p>
              </div>

              <div className="flex items-center gap-5 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-emerald-500" />
                  <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>Receitas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-rose-500" />
                  <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>Despesas</span>
                </div>
              </div>
            </div>

            <div className="w-full overflow-x-auto relative min-h-[260px] flex items-center justify-center">

              <div className="min-w-[650px] w-full max-w-[750px] relative">

                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto">

                  {Array.from({ length: 7 }).map((_, i) => {
                    const val = i * 1000;
                    const y = chartHeight - paddingBottom - (val / maxVal) * graphHeight;

                    return (
                      <g key={i}>

                        {i > 0 && (
                          <line 
                            x1={paddingLeft} 
                            y1={y} 
                            x2={chartWidth - paddingRight} 
                            y2={y} 
                            stroke={theme === "dark" ? "#1e293b" : "#e2e8f0"} 
                            strokeWidth="1" 
                            strokeDasharray="4 4" 
                          />
                        )}

                        <text 
                          x={paddingLeft - 10} 
                          y={y + 4} 
                          fill={theme === "dark" ? "#64748b" : "#475569"} 
                          fontSize="10" 
                          fontWeight="bold"
                          textAnchor="end"
                        >
                          {val === 0 ? "0" : val.toLocaleString("pt-BR")}
                        </text>
                      </g>
                    );
                  })}

                  <line 
                    x1={paddingLeft} 
                    y1={chartHeight - paddingBottom} 
                    x2={chartWidth - paddingRight} 
                    y2={chartHeight - paddingBottom} 
                    stroke={theme === "dark" ? "#334155" : "#cbd5e1"} 
                    strokeWidth="1.5" 
                  />

                  {chartData.map((d, index) => {
                    const monthWidth = graphWidth / chartData.length;
                    const groupCenterX = paddingLeft + index * monthWidth + monthWidth / 2;

                    const barWidth = Math.max(16, monthWidth * 0.18);
                    const gap = 4; 

                    const recHeight = (d.receitas / maxVal) * graphHeight;
                    const recX = groupCenterX - barWidth - gap / 2;
                    const recY = chartHeight - paddingBottom - recHeight;

                    const despHeight = (d.despesas / maxVal) * graphHeight;
                    const despX = groupCenterX + gap / 2;
                    const despY = chartHeight - paddingBottom - despHeight;

                    const isHovered = activeTooltip?.month === d.name;

                    return (
                      <g key={d.name} className="transition-all duration-300">

                        <rect
                          x={recX}
                          y={recY}
                          width={barWidth}
                          height={Math.max(2, recHeight)}
                          rx="4"
                          fill={isHovered ? "#34d399" : "#059669"}
                          className="animate-bar-grow cursor-pointer transition-all duration-200 hover:brightness-125"
                          onMouseEnter={(e) => {
                            setActiveTooltip({
                              x: recX + barWidth / 2,
                              y: recY - 10,
                              month: d.name,
                              receitas: d.receitas,
                              despesas: d.despesas
                            });
                          }}
                          onMouseLeave={() => setActiveTooltip(null)}
                        />

                        <rect
                          x={despX}
                          y={despY}
                          width={barWidth}
                          height={Math.max(2, despHeight)}
                          rx="4"
                          fill={isHovered ? "#fb7185" : "#dc2626"}
                          className="animate-bar-grow cursor-pointer transition-all duration-200 hover:brightness-125"
                          onMouseEnter={(e) => {
                            setActiveTooltip({
                              x: despX + barWidth / 2,
                              y: despY - 10,
                              month: d.name,
                              receitas: d.receitas,
                              despesas: d.despesas
                            });
                          }}
                          onMouseLeave={() => setActiveTooltip(null)}
                        />

                        <rect
                          x={paddingLeft + index * monthWidth}
                          y={paddingTop}
                          width={monthWidth}
                          height={graphHeight}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => {
                            setActiveTooltip({
                              x: groupCenterX,
                              y: Math.min(recY, despY) - 10,
                              month: d.name,
                              receitas: d.receitas,
                              despesas: d.despesas
                            });
                          }}
                          onMouseLeave={() => setActiveTooltip(null)}
                        />

                        <text
                          x={groupCenterX}
                          y={chartHeight - paddingBottom + 18}
                          fill={d.name === "Dezembro" ? (theme === "dark" ? "#67e8f9" : "#0891b2") : (theme === "dark" ? "#64748b" : "#475569")}
                          fontSize="10"
                          fontWeight={d.name === "Dezembro" ? "bold" : "semibold"}
                          textAnchor="middle"
                          className="transition-colors"
                        >
                          {d.name}
                        </text>
                      </g>
                    );
                  })}

                </svg>

                {activeTooltip && (
                  <div 
                    className={`absolute border rounded-xl p-3.5 shadow-2xl z-30 transition-all duration-200 pointer-events-none w-56 animate-fade-in text-[11px] font-semibold ${
                      theme === "dark" ? "bg-slate-950/95 border-slate-800 text-slate-300" : "bg-white/95 border-slate-200 text-slate-700"
                    }`}
                    style={{
                      left: `${(activeTooltip.x / chartWidth) * 100}%`,
                      top: `${(activeTooltip.y / chartHeight) * 100 - 30}%`,
                      transform: "translate(-50%, -100%)"
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2">
                      <span className={`font-bold text-xs ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>{activeTooltip.month}</span>
                      {activeTooltip.month === "Dezembro" && (
                        <span className="bg-cyan-950/80 text-cyan-400 border border-cyan-800/30 text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded">Ativo</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-emerald-500">
                        <span className="opacity-80">Receitas:</span>
                        <span className="font-extrabold">{formatCurrency(activeTooltip.receitas)}</span>
                      </div>
                      <div className="flex items-center justify-between text-rose-500">
                        <span className="opacity-80">Despesas:</span>
                        <span className="font-extrabold">{formatCurrency(activeTooltip.despesas)}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-300/35 pt-1.5 text-slate-500">
                        <span className="opacity-80">Balanço:</span>
                        <span className={`font-extrabold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                          {formatCurrency(activeTooltip.receitas - activeTooltip.despesas)}
                        </span>
                      </div>
                    </div>

                    <div className={`w-2.5 h-2.5 border-r border-b absolute bottom-[-5px] left-1/2 -translate-x-1/2 rotate-45 ${
                      theme === "dark" ? "bg-slate-950 border-slate-800/80" : "bg-white border-slate-200"
                    }`} />
                  </div>
                )}

              </div>

            </div>

          </div>

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
                  onClick={() => handleOpenAddModal("Receitas")}
                  className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  + Receita
                </button>
                <button 
                  onClick={() => handleOpenAddModal("Despesas")}
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
                                onClick={() => handleOpenEditModal(tx)}
                                className={`bg-transparent text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer border ${
                                  theme === "dark" 
                                    ? "hover:bg-blue-600/10 border-blue-500/20 hover:border-blue-500/40 text-blue-400 hover:text-blue-300" 
                                    : "hover:bg-blue-50 border-blue-200 text-blue-650 hover:text-blue-700"
                                }`}
                              >
                                Editar
                              </button>

                              <button 
                                onClick={() => handleDeleteTransaction(tx.id)}
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

        </div>

      </main>

      <button 
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

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div onClick={() => setIsAddModalOpen(false)} className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300" />

          <div className={`border rounded-2xl w-full max-w-md shadow-2xl relative z-10 p-6 overflow-hidden animate-fade-in transition-all ${
            theme === "dark" ? "bg-[#0f1422] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>

            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-800"}`}>
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Novo Lançamento
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">

              <div>
                <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}>Tipo de Fluxo</label>
                <div className="grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    onClick={() => {
                      setFormType("Receitas");
                      setFormCategory("Receitas");
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      formType === "Receitas"
                        ? "bg-emerald-600/15 border-emerald-500/40 text-emerald-400 glow-green"
                        : theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800/40"
                        : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200/50"
                    }`}
                  >
                    Receita (+)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType("Despesas");
                      setFormCategory("Despesas");
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      formType === "Despesas"
                        ? "bg-rose-600/15 border-rose-500/40 text-rose-400 glow-red"
                        : theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800/40"
                        : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200/50"
                    }`}
                  >
                    Despesa (-)
                  </button>

                </div>
              </div>

              <div>
                <label className={`text-xs font-bold uppercase tracking-wider block mb-1.5 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}>Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Supermercado Semanal, Salário FIAP, etc."
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
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
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
                        <option value="Receitas">Receitas</option>
                        <option value="Salário">Salário</option>
                        <option value="Investimentos">Investimentos</option>
                        <option value="Freelance">Freelance</option>
                      </>
                    ) : (
                      <>
                        <option value="Despesas">Despesas</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Supermercado">Supermercado</option>
                        <option value="Aluguel">Aluguel</option>
                        <option value="Lazer">Lazer</option>
                      </>
                    )}
                  </select>
                </div>

              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800/60 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:scale-[1.01]"
                >
                  Confirmar Lançamento
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {isEditModalOpen && editingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          <div onClick={() => {
            setIsEditModalOpen(false);
            setEditingTransaction(null);
          }} className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300" />

          <div className={`border rounded-2xl w-full max-w-md shadow-2xl relative z-10 p-6 overflow-hidden animate-fade-in transition-all ${
            theme === "dark" ? "bg-[#0f1422] border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>

            <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
              <h3 className={`text-lg font-bold flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-slate-800"}`}>
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar Lançamento
              </h3>
              <button onClick={() => {
                setIsEditModalOpen(false);
                setEditingTransaction(null);
              }} className="text-slate-400 hover:text-slate-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditTransaction} className="space-y-4">

              <div>
                <label className={`text-xs font-bold uppercase tracking-wider block mb-2 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}>Tipo de Fluxo</label>
                <div className="grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    onClick={() => {
                      setFormType("Receitas");
                      setFormCategory("Receitas");
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      formType === "Receitas"
                        ? "bg-emerald-600/15 border-emerald-500/40 text-emerald-400 glow-green"
                        : theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800/40"
                        : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200/50"
                    }`}
                  >
                    Receita (+)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormType("Despesas");
                      setFormCategory("Despesas");
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      formType === "Despesas"
                        ? "bg-rose-600/15 border-rose-500/40 text-rose-400 glow-red"
                        : theme === "dark"
                        ? "bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800/40"
                        : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200/50"
                    }`}
                  >
                    Despesa (-)
                  </button>

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
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
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
                        <option value="Receitas">Receitas</option>
                        <option value="Salário">Salário</option>
                        <option value="Investimentos">Investimentos</option>
                        <option value="Freelance">Freelance</option>
                      </>
                    ) : (
                      <>
                        <option value="Despesas">Despesas</option>
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="Supermercado">Supermercado</option>
                        <option value="Aluguel">Aluguel</option>
                        <option value="Lazer">Lazer</option>
                      </>
                    )}
                  </select>
                </div>

              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800/60 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingTransaction(null);
                  }}
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
      )}

    </div>
  );
}
