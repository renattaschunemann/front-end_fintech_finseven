"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Transaction } from "@/interfaces";
import { deleteTransaction } from "@/services/api";

// Initial mock generator to sync with other views
const generateMockTransactions = (): Transaction[] => {
  const list: Transaction[] = [];
  const startYear = 2024;
  const startMonth = 0;
  const endYear = 2026;
  const endMonth = 4; // May 2026

  let idCounter = 1;

  const accounts = ["Itaú", "Banco do Brasil"];
  
  const categoriesReceitas = ["Salário", "Comissão", "Hora Extra", "Bônus", "Freelancer"];
  const categoriesDespesas = [
    "Saúde", "Escola", "Transporte", "Alimentação", "Supermercado", 
    "Lazer", "Água", "Luz", "Internet", "Aluguel"
  ];
  const categoriesInvestimentos = [
    "Tesouro Direto", "CDB (Certificado de Depósito Bancário)", 
    "LCI e LCA", "Poupança", "Debênture",
    "Ações", "Fundos Imobiliários (FIIs)", "ETFs", "BDRs", "Criptomoedas"
  ];

  for (let year = startYear; year <= endYear; year++) {
    const minM = year === startYear ? startMonth : 0;
    const maxM = year === endYear ? endMonth : 11;

    for (let month = minM; month <= maxM; month++) {
      const padMonth = String(month + 1).padStart(2, "0");

      // Generate 2 records for each Receitas category
      categoriesReceitas.forEach((cat, index) => {
        // Record 1
        list.push({
          id: `tx-rec-${idCounter++}`,
          date: `${year}-${padMonth}-05`,
          category: cat,
          description: `${cat} Quinzenal A`,
          account: accounts[(index * 2) % accounts.length],
          value: year === 2026 && month === 4 ? Math.round((1200 + (month * 10) + (index * 150)) * 1.8) : 1200 + (month * 10) + (index * 150),
          type: "Receitas"
        });
        // Record 2
        list.push({
          id: `tx-rec-${idCounter++}`,
          date: `${year}-${padMonth}-20`,
          category: cat,
          description: `${cat} Quinzenal B`,
          account: accounts[(index * 2 + 1) % accounts.length],
          value: year === 2026 && month === 4 ? Math.round((1500 + (month * 15) + (index * 200)) * 1.8) : 1500 + (month * 15) + (index * 200),
          type: "Receitas"
        });
      });

      // Generate 2 records for each Despesas category
      categoriesDespesas.forEach((cat, index) => {
        // Record 1
        list.push({
          id: `tx-des-${idCounter++}`,
          date: `${year}-${padMonth}-10`,
          category: cat,
          description: `Pagamento ${cat} A`,
          account: accounts[(index * 3) % accounts.length],
          value: year === 2026 && month === 4 ? -Math.round((100 + (month * 5) + (index * 45)) * 1.8) : -(100 + (month * 5) + (index * 45)),
          type: "Despesas"
        });
        // Record 2
        list.push({
          id: `tx-des-${idCounter++}`,
          date: `${year}-${padMonth}-25`,
          category: cat,
          description: `Consumo ${cat} B`,
          account: accounts[(index * 3 + 1) % accounts.length],
          value: year === 2026 && month === 4 ? -Math.round((120 + (month * 7) + (index * 60)) * 1.8) : -(120 + (month * 7) + (index * 60)),
          type: "Despesas"
        });
      });

      // Generate 2 records for each Investimentos category
      categoriesInvestimentos.forEach((cat, index) => {
        // Record 1
        list.push({
          id: `tx-inv-${idCounter++}`,
          date: `${year}-${padMonth}-15`,
          category: cat,
          description: `Aporte ${cat} Inicial`,
          account: accounts[(index * 4) % accounts.length],
          value: year === 2026 && month === 4 ? Math.round((300 + (month * 20) + (index * 100)) * 1.8) : 300 + (month * 20) + (index * 100),
          type: "Investimentos"
        });
        // Record 2
        list.push({
          id: `tx-inv-${idCounter++}`,
          date: `${year}-${padMonth}-28`,
          category: cat,
          description: `Aporte ${cat} Complementar`,
          account: accounts[(index * 4 + 1) % accounts.length],
          value: year === 2026 && month === 4 ? Math.round((450 + (month * 25) + (index * 150)) * 1.8) : 450 + (month * 25) + (index * 150),
          type: "Investimentos"
        });
      });
    }
  }

  return list.sort((a, b) => b.date.localeCompare(a.date));
};

const INITIAL_TRANSACTIONS = generateMockTransactions();

// Predefined default categories based on user requirements
const DEFAULT_RECEITAS = ["Salário", "Comissão", "Hora Extra", "Bônus", "Freelancer", "Outras fontes"];
const DEFAULT_DESPESAS = [
  "Saúde", "Escola", "Transporte", "Alimentação", "Supermercado", 
  "Lazer", "Água", "Luz", "Internet", "Aluguel", "Outras fontes de despesa"
];

// Predefined investment classes grouped by type
const DEFAULT_INVESTIMENTOS_FIXA = [
  "Tesouro Direto", "CDB (Certificado de Depósito Bancário)", 
  "LCI e LCA", "Poupança", "Debênture"
];
const DEFAULT_INVESTIMENTOS_VARIAVEL = [
  "Ações", "Fundos Imobiliários (FIIs)", "ETFs", "BDRs"
];
const DEFAULT_INVESTIMENTOS_CRIPTO = ["Criptomoedas"];

export default function CategoriasPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeMenu, setActiveMenu] = useState("Categorias");

  // Selection form states
  const [selectedType, setSelectedType] = useState<"Receitas" | "Despesas" | "Investimentos">("Receitas");
  const [selectedCategory, setSelectedCategory] = useState("Salário");

  // Custom Category State
  const [customCategories, setCustomCategories] = useState<{
    Receitas: string[];
    Despesas: string[];
    Investimentos: string[];
  }>({ Receitas: [], Despesas: [], Investimentos: [] });

  const [writingCustom, setWritingCustom] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");

  // Date filter state
  const [dateFilter, setDateFilter] = useState<"30" | "60" | "90" | "all" | "custom">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  useEffect(() => {
    const loggedUser = localStorage.getItem("finseven-logged-user");
    if (!loggedUser) {
      router.push("/login");
    }
  }, [router]);

  // Load transactions, custom categories, theme and bank accounts
  useEffect(() => {
    // 1. Theme
    const savedTheme = localStorage.getItem("finseven-theme") as "dark" | "light";
    if (savedTheme && (savedTheme === "dark" || savedTheme === "light")) {
      setTheme(savedTheme);
    }

    // 2. Custom Categories
    const savedCustomCats = localStorage.getItem("finseven-custom-categories");
    if (savedCustomCats) {
      try {
        setCustomCategories(JSON.parse(savedCustomCats));
      } catch (e) {
        // use defaults
      }
    }

    // 3. Transactions
    const savedTxs = localStorage.getItem("finseven-transactions");
    if (savedTxs) {
      try {
        const parsed = JSON.parse(savedTxs) as Transaction[];
        const allowed = ["Itaú", "Banco do Brasil", "Outros"];
        const sanitized = parsed.map((t: any) => {
          if (!allowed.includes(t.account)) {
            return { ...t, account: t.type === "Receitas" ? "Banco do Brasil" : "Itaú" };
          }
          return t;
        });
        // Upgrade legacy mock dataset to the new high-density categories dataset
        const hasNewMockData = sanitized.some(tx => tx.id.startsWith("tx-rec-"));
        if (!hasNewMockData) {
          setTransactions(INITIAL_TRANSACTIONS);
        } else {
          setTransactions(sanitized);
        }
      } catch (e) {
        setTransactions(INITIAL_TRANSACTIONS);
      }
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
    }

    setIsLoaded(true);
  }, []);

  // Sync theme
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

  // Persist custom categories
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("finseven-custom-categories", JSON.stringify(customCategories));
    }
  }, [customCategories, isLoaded]);

  // Persist transactions
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("finseven-transactions", JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  // Adjust active selected category when selectedType changes
  useEffect(() => {
    if (selectedType === "Receitas") {
      setSelectedCategory("Salário");
      setWritingCustom(false);
    } else if (selectedType === "Despesas") {
      setSelectedCategory("Saúde");
      setWritingCustom(false);
    } else {
      setSelectedCategory("Tesouro Direto");
      setWritingCustom(false);
    }
  }, [selectedType]);

  // Toast auto-dismiss
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

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      showToast(`Tema alterado para Modo ${next === "dark" ? "Escuro" : "Claro"}!`, "info");
      return next;
    });
  };

  // Compile lists of available categories (combining default and custom ones)
  const availableCategoriesList = useMemo(() => {
    if (selectedType === "Receitas") {
      return [...DEFAULT_RECEITAS, ...customCategories.Receitas];
    }
    if (selectedType === "Despesas") {
      return [...DEFAULT_DESPESAS, ...customCategories.Despesas];
    }
    // Investimentos lists grouped
    return [
      ...DEFAULT_INVESTIMENTOS_FIXA,
      ...DEFAULT_INVESTIMENTOS_VARIAVEL,
      ...DEFAULT_INVESTIMENTOS_CRIPTO,
      ...customCategories.Investimentos,
      "Outras fontes de investimento"
    ];
  }, [selectedType, customCategories]);

  // Manage custom source input visibility
  const handleCategorySelectChange = (val: string) => {
    setSelectedCategory(val);
    if (
      val === "Outras fontes" || 
      val === "Outras fontes de despesa" || 
      val === "Outras fontes de investimento"
    ) {
      setWritingCustom(true);
      setCustomCategoryName("");
    } else {
      setWritingCustom(false);
    }
  };

  // Save new custom category
  const handleSaveCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = customCategoryName.trim();
    if (!cleanName) {
      showToast("Por favor, digite o nome da categoria.", "error");
      return;
    }

    // Check if category already exists
    if (availableCategoriesList.includes(cleanName)) {
      showToast("Esta categoria já existe.", "error");
      return;
    }

    setCustomCategories((prev) => {
      const updated = { ...prev };
      updated[selectedType] = [...updated[selectedType], cleanName];
      return updated;
    });

    setSelectedCategory(cleanName);
    setWritingCustom(false);
    setCustomCategoryName("");
    showToast(`Categoria "${cleanName}" cadastrada com sucesso!`, "success");
  };

  // Date window filters calculator
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Filter by type
      if (tx.type !== selectedType) return false;

      // 2. Filter by category
      if (tx.category !== selectedCategory) return false;

      // 3. Filter by date window relative to target dates
      if (dateFilter === "all") return true;

      const txTime = new Date(tx.date).getTime();
      const todayTime = new Date("2026-05-22").getTime(); // Baseline reference date for consistency

      if (dateFilter === "30") {
        const diffDays = (todayTime - txTime) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      if (dateFilter === "60") {
        const diffDays = (todayTime - txTime) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 60;
      }
      if (dateFilter === "90") {
        const diffDays = (todayTime - txTime) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 90;
      }
      if (dateFilter === "custom") {
        if (!startDate && !endDate) return true;
        if (startDate && endDate) {
          return tx.date >= startDate && tx.date <= endDate;
        }
        if (startDate) return tx.date >= startDate;
        if (endDate) return tx.date <= endDate;
      }

      return true;
    });
  }, [transactions, selectedType, selectedCategory, dateFilter, startDate, endDate]);

  // Statistics calculation for the filtered category transactions
  const categoryStats = useMemo(() => {
    let total = 0;
    filteredTransactions.forEach((tx) => {
      total += Math.abs(tx.value);
    });
    const count = filteredTransactions.length;
    const average = count > 0 ? total / count : 0;
    return { total, count, average };
  }, [filteredTransactions]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const formatDateForDisplay = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      const txToDelete = transactions.find(t => t.id === id);
      if (!txToDelete) return;
      try {
        await deleteTransaction(id, txToDelete.type);
        setTransactions(transactions.filter(t => t.id !== id));
        showToast("Transação excluída com sucesso!", "info");
      } catch (error) {
        showToast("Erro ao excluir transação no servidor.", "error");
      }
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
          } else if (menu === "Lançamento" || menu === "Transação") {
            router.push("/transacao");
          } else if (menu === "Receitas") {
            router.push("/receitas");
          } else if (menu === "Despesas") {
            router.push("/despesas");
          } else if (menu === "Investimentos") {
            router.push("/investimentos");
          } else if (menu === "Conta Bancária") {
            router.push("/conta-bancaria");
          } else if (menu === "Categorias") {
            setActiveMenu("Categorias");
          } else if (menu === "Perfil") {
            router.push("/perfil");
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
          onAddClick={() => router.push("/transacao")}
          showToast={showToast}
        />

        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Title */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/25 pb-4">
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Histórico & Cadastro de Categorias
              </h1>
              <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                Gerencie categorias personalizadas e consulte o extrato financeiro detalhado com filtros.
              </p>
            </div>
            <button
              onClick={() => router.push("/")}
              className={`text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all border cursor-pointer ${
                theme === "dark"
                  ? "bg-slate-800/40 border-slate-700/40 hover:bg-slate-800 hover:text-white text-slate-300"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-650"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Voltar ao Início</span>
            </button>
          </div>

          {/* Form Rows */}
          <div className="flex justify-center w-full">
            {/* Category Config */}
            <div className={`w-full max-w-2xl backdrop-blur-md border rounded-2xl p-6 shadow-md transition-all ${
              theme === "dark" ? "bg-[#101422]/70 border-slate-800/40 shadow-2xl shadow-black/30" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-850/50">
                <div className={`p-1.5 rounded-lg ${theme === "dark" ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-50 text-cyan-600"}`}>
                  <svg className="w-5 h-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
                <h3 className={`text-base font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-800"}`}>
                  Seleção de Categoria
                </h3>
              </div>

              <div className="space-y-4">
                {/* 3-Way Type Selection Buttons */}
                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2.5 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Fluxo Financeiro
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedType("Receitas")}
                      className={`py-3 px-3 rounded-xl text-xs font-extrabold tracking-wide transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                        selectedType === "Receitas"
                          ? "bg-emerald-600/15 border-emerald-500/40 text-emerald-450 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                          : theme === "dark"
                          ? "bg-[#070b13] border-slate-800/50 hover:bg-slate-800/30 text-slate-400"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Receita</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedType("Despesas")}
                      className={`py-3 px-3 rounded-xl text-xs font-extrabold tracking-wide transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                        selectedType === "Despesas"
                          ? "bg-rose-600/15 border-rose-500/40 text-rose-450 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                          : theme === "dark"
                          ? "bg-[#070b13] border-slate-800/50 hover:bg-slate-800/30 text-slate-400"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                      </svg>
                      <span>Despesa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedType("Investimentos")}
                      className={`py-3 px-3 rounded-xl text-xs font-extrabold tracking-wide transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                        selectedType === "Investimentos"
                          ? "bg-cyan-600/15 border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                          : theme === "dark"
                          ? "bg-[#070b13] border-slate-800/50 hover:bg-slate-800/30 text-slate-400"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>Investimento</span>
                    </button>
                  </div>
                </div>

                {/* Dropdown Select for Category */}
                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Categorias Disponíveis
                  </label>
                  
                  {selectedType === "Investimentos" ? (
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategorySelectChange(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none cursor-pointer ${
                        theme === "dark"
                          ? "bg-[#070b13] border-slate-800/70 text-slate-250 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-200"
                      }`}
                    >
                      <optgroup label="Renda Fixa">
                        {DEFAULT_INVESTIMENTOS_FIXA.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Renda Variável">
                        {DEFAULT_INVESTIMENTOS_VARIAVEL.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Criptomoedas">
                        {DEFAULT_INVESTIMENTOS_CRIPTO.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </optgroup>
                      {customCategories.Investimentos.length > 0 && (
                        <optgroup label="Customizadas">
                          {customCategories.Investimentos.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </optgroup>
                      )}
                      <option value="Outras fontes de investimento">Outras fontes de investimento (Nova Categoria)</option>
                    </select>
                  ) : (
                    <select
                      value={selectedCategory}
                      onChange={(e) => handleCategorySelectChange(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none cursor-pointer ${
                        theme === "dark"
                          ? "bg-[#070b13] border-slate-800/70 text-slate-250 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30"
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-cyan-500 focus:bg-white focus:ring-1 focus:ring-cyan-200"
                      }`}
                    >
                      {availableCategoriesList.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === "Outras fontes"
                            ? "Outras fontes (Nova Categoria)"
                            : cat === "Outras fontes de despesa"
                            ? "Outras fontes de despesa (Nova Categoria)"
                            : cat}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Custom Source Input & Registration Form */}
                {writingCustom && (
                  <form onSubmit={handleSaveCustomCategory} className="border border-dashed border-slate-800/40 p-4 rounded-xl space-y-3 bg-slate-900/10 animate-fade-in mt-3">
                    <div>
                      <label className={`text-[9px] font-bold uppercase tracking-wider block mb-1.5 ${
                        theme === "dark" ? "text-slate-400" : "text-slate-500"
                      }`}>
                        Nome da Nova Categoria
                      </label>
                      <input
                        type="text"
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        required
                        placeholder="Ex: Consultoria, Academia, etc."
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all outline-none ${
                          theme === "dark"
                            ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 placeholder-slate-600"
                            : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200 placeholder-slate-400"
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/20 text-blue-400 font-bold py-2 px-3 rounded-lg text-xs transition-all cursor-pointer hover:scale-[1.005] active:scale-[0.995]"
                    >
                      Salvar Categoria Customizada
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Statistics for Filtered Window */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`backdrop-blur-md border rounded-2xl p-5 shadow-sm transition-all ${
              theme === "dark" ? "bg-[#101422]/70 border-slate-800/40" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  Volume de Transações ({selectedCategory})
                </span>
                <div className={`p-2 rounded-xl ${
                  selectedType === "Receitas"
                    ? theme === "dark" ? "bg-emerald-500/10 text-emerald-450" : "bg-emerald-50 text-emerald-600"
                    : selectedType === "Despesas"
                    ? theme === "dark" ? "bg-rose-500/10 text-rose-450" : "bg-rose-50 text-rose-600"
                    : theme === "dark" ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-50 text-cyan-600"
                }`}>
                  <svg className="w-5 h-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <span className={`text-2xl font-black ${
                  selectedType === "Receitas"
                    ? "text-emerald-450"
                    : selectedType === "Despesas"
                    ? "text-rose-450"
                    : "text-cyan-400"
                }`}>
                  {formatCurrency(categoryStats.total)}
                </span>
              </div>
            </div>

            <div className={`backdrop-blur-md border rounded-2xl p-5 shadow-sm transition-all ${
              theme === "dark" ? "bg-[#101422]/70 border-slate-800/40" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  Quantidade de Registros
                </span>
                <div className={`p-2 rounded-xl ${theme === "dark" ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                  <svg className="w-5 h-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <span className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {categoryStats.count} Transações
                </span>
              </div>
            </div>

            <div className={`backdrop-blur-md border rounded-2xl p-5 shadow-sm transition-all ${
              theme === "dark" ? "bg-[#101422]/70 border-slate-800/40" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  Média por Transação
                </span>
                <div className={`p-2 rounded-xl ${theme === "dark" ? "bg-violet-500/10 text-violet-400" : "bg-violet-50 text-violet-600"}`}>
                  <svg className="w-5 h-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <span className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {formatCurrency(categoryStats.average)}
                </span>
              </div>
            </div>
          </div>

          {/* Historical Log & Filters */}
          <div className={`backdrop-blur-md border rounded-2xl p-6 shadow-md transition-all ${
            theme === "dark" ? "bg-[#101422]/70 border-slate-800/40" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className={`text-base font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-800"}`}>
                  Histórico de Transações
                </h3>
                <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  Filtre as transações de <span className="font-bold underline">{selectedCategory}</span> por períodos.
                </p>
              </div>

              {/* Date Presets and Date Pickers */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Presets Button Row */}
                <div className={`flex rounded-xl p-1 border ${
                  theme === "dark" ? "bg-[#070b13]/80 border-slate-800/50" : "bg-slate-100/80 border-slate-200"
                }`}>
                  {[
                    { id: "30", label: "30 dias" },
                    { id: "60", label: "60 dias" },
                    { id: "90", label: "90 dias" },
                    { id: "all", label: "Todos" },
                    { id: "custom", label: "Personalizado" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setDateFilter(preset.id as any)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer select-none ${
                        dateFilter === preset.id
                          ? theme === "dark"
                            ? "bg-blue-650 text-white shadow-sm"
                            : "bg-blue-600 text-white shadow-sm"
                          : theme === "dark"
                          ? "text-slate-400 hover:text-slate-200"
                          : "text-slate-500 hover:text-slate-850"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom Range Picker Fields */}
                {dateFilter === "custom" && (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      onClick={(e) => (e.currentTarget as any).showPicker?.()}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all outline-none cursor-pointer ${
                        theme === "dark"
                          ? "bg-[#070b13] border-slate-800/60 text-slate-200 focus:border-blue-500/50"
                          : "bg-slate-50 border-slate-250 text-slate-800 focus:border-blue-500"
                      }`}
                    />
                    <span className="text-slate-500 text-xs font-bold">até</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      onClick={(e) => (e.currentTarget as any).showPicker?.()}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all outline-none cursor-pointer ${
                        theme === "dark"
                          ? "bg-[#070b13] border-slate-800/60 text-slate-200 focus:border-blue-500/50"
                          : "bg-slate-50 border-slate-250 text-slate-800 focus:border-blue-500"
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Filtered History Table */}
            <div className={`w-full overflow-x-auto rounded-xl border ${
              theme === "dark" ? "border-slate-800/30" : "border-slate-200"
            }`}>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className={`text-[10px] font-bold uppercase tracking-wider border-b ${
                    theme === "dark" ? "bg-slate-900/60 text-slate-400 border-slate-800/40" : "bg-slate-50 text-slate-500 border-slate-200"
                  }`}>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Conta Financeira</th>
                    <th className="px-6 py-4">Valor</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>

                <tbody className={`divide-y text-xs font-semibold ${
                  theme === "dark" ? "divide-slate-800/30 text-slate-350" : "divide-slate-100 text-slate-700"
                }`}>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        Nenhuma transação encontrada para a categoria <span className="font-bold underline">"{selectedCategory}"</span> no filtro de data selecionado.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => {
                      const isIncome = tx.value > 0;
                      return (
                        <tr 
                          key={tx.id} 
                          className={`transition-colors duration-150 group ${
                            theme === "dark" ? "hover:bg-slate-800/20" : "hover:bg-slate-50"
                          }`}
                        >
                          <td className={`px-6 py-4 font-bold ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                            {formatDateForDisplay(tx.date)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] uppercase font-extrabold tracking-wider ${
                              tx.type === "Investimentos"
                                ? "bg-cyan-950/40 border border-cyan-800/35 text-cyan-400"
                                : isIncome 
                                ? "bg-emerald-950/40 border border-emerald-800/35 text-emerald-400" 
                                : "bg-rose-950/40 border border-rose-800/35 text-rose-400"
                            }`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${tx.type === "Investimentos" ? "bg-cyan-400" : isIncome ? "bg-emerald-400" : "bg-rose-400"}`} />
                              {tx.category}
                            </span>
                          </td>
                          <td className={`px-6 py-4 ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                            {tx.description}
                          </td>
                          <td className={`px-6 py-4 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                            {tx.account}
                          </td>
                          <td className={`px-6 py-4 font-black text-sm ${tx.type === "Investimentos" ? "text-cyan-450" : isIncome ? "text-emerald-450" : "text-rose-455"}`}>
                            {isIncome ? "+ " : "- "}{formatCurrency(Math.abs(tx.value))}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className={`bg-transparent text-[10px] font-bold px-2 py-1.5 rounded-lg transition-all cursor-pointer border ${
                                theme === "dark" 
                                  ? "hover:bg-rose-600/10 border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-350" 
                                  : "hover:bg-rose-50 border-rose-200 text-rose-650 hover:text-rose-700"
                              }`}
                              title="Excluir transação"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
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

      {/* Theme Switcher Float Action */}
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
    </div>
  );
}
