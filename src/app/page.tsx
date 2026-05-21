"use client";

import { useState, useMemo, useEffect } from "react";
import { Transaction } from "@/interfaces";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import Chart from "@/components/Chart";
import TransactionTable from "@/components/TransactionTable";
import AddModal from "@/components/AddModal";
import EditModal from "@/components/EditModal";

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

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeMenu, setActiveMenu] = useState("Home");
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
          if (menu === "Lançamento") {
            router.push("/lancamento");
          } else if (menu === "Receitas") {
            router.push("/receitas");
          } else if (menu === "Despesas") {
            router.push("/despesas");
          } else {
            setActiveMenu(menu);
          }
        }}
        theme={theme}
        showToast={showToast}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto animate-fade-in">
        <Header
          setSidebarOpen={setSidebarOpen}
          theme={theme}
          onAddClick={() => router.push("/lancamento")}
          showToast={showToast}
        />

        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <StatsCards
            stats={stats}
            formatCurrency={formatCurrency}
          />

          <Chart
            chartData={chartData}
            theme={theme}
            formatCurrency={formatCurrency}
          />

          <TransactionTable
            transactions={transactions}
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

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTransaction}
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
