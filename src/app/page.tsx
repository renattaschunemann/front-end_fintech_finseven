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
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from "@/services/api";



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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeMenu, setActiveMenu] = useState("Home");
  const [dateFilter, setDateFilter] = useState<"today" | "7days" | "30days" | "all">("all");
  const [formType, setFormType] = useState<"Receitas" | "Despesas" | "Investimentos">("Despesas");
  const [formCategory, setFormCategory] = useState("Supermercado");
  const [formDescription, setFormDescription] = useState("");
  const [formAccount, setFormAccount] = useState("Itaú");
  const [formValue, setFormValue] = useState("");
  const [formDate, setFormDate] = useState("2026-05-23");
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);
  const [userId, setUserId] = useState<number>(1);

  useEffect(() => {
    const loggedUser = localStorage.getItem("finseven-logged-user");
    if (!loggedUser) {
      router.push("/login");
      return;
    }
    try {
      const parsed = JSON.parse(loggedUser);
      if (parsed.id) {
        setUserId(Number(parsed.id));
      }
    } catch (e) {}
  }, [router]);

  useEffect(() => {
    const loadAPI = async () => {
      try {
        const apiTxs = await fetchTransactions();
        setTransactions(apiTxs);
      } catch (error) {
        showToast("Não foi possível carregar as transações do servidor.", "error");
        setTransactions([]);
      }
      setIsLoaded(true);
    };

    loadAPI();
  }, []);

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
    if (dateFilter === "all") return transactions;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return transactions.filter(t => {
      const tDate = new Date(t.date + "T00:00:00");
      const diffTime = today.getTime() - tDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (dateFilter === "today") {
        return diffDays === 0;
      }
      if (dateFilter === "7days") {
        return diffDays >= 0 && diffDays <= 7;
      }
      if (dateFilter === "30days") {
        return diffDays >= 0 && diffDays <= 30;
      }
      return true;
    });
  }, [transactions, dateFilter]);

  const CARRYOVER_BALANCE = 4631.25;

  const stats = useMemo(() => {
    const isFiltered = dateFilter !== "all";
    const now = new Date();
    const padMonth = String(now.getMonth() + 1).padStart(2, "0");
    const currentMonthPrefix = `${now.getFullYear()}-${padMonth}`;

    const targetTxs = isFiltered ? filteredTransactions : transactions.filter(t => t.date.startsWith(currentMonthPrefix));

    let receitasDoMes = 0;
    let despesasDoMes = 0;
    targetTxs.forEach(t => {
      if (t.value > 0) {
        receitasDoMes += t.value;
      } else {
        despesasDoMes += Math.abs(t.value);
      }
    });

    const balancoDoMes = receitasDoMes - despesasDoMes;
    // Current Balance is either calculated on top of carryover or from selected transactions if filtered
    const saldoAtual = isFiltered ? balancoDoMes : CARRYOVER_BALANCE + balancoDoMes;

    let receitasLabel = "Receitas do Mês";
    let despesasLabel = "Despesas do Mês";
    let balancoLabel = "Balanço do Mês";

    if (isFiltered) {
      const labelMap = {
        today: "Hoje",
        "7days": "7 Dias",
        "30days": "30 Dias"
      };
      const periodLabel = labelMap[dateFilter as "today" | "7days" | "30days"] || "Período";
      receitasLabel = `Receitas (${periodLabel})`;
      despesasLabel = `Despesas (${periodLabel})`;
      balancoLabel = `Balanço (${periodLabel})`;
    }

    return {
      saldoAtual,
      receitasDoMes,
      despesasDoMes,
      balancoDoMes,
      receitasLabel,
      despesasLabel,
      balancoLabel
    };
  }, [transactions, filteredTransactions, dateFilter]);

  const chartData = useMemo(() => {
    const monthsData = [];
    const shortMonthNames = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];

    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      // Calculate target month and year
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthIdx = d.getMonth();
      
      // "Mês/Ano" format (e.g. "Dez/25", "Jan/26", "Mai/26")
      const monthLabel = `${shortMonthNames[monthIdx]}/${String(year).slice(-2)}`;

      // Filter transactions for this specific month/year prefix
      const padMonth = String(monthIdx + 1).padStart(2, "0");
      const prefix = `${year}-${padMonth}`;
      
      const monthTxs = transactions.filter(t => t.date.startsWith(prefix));

      let receitas = 0;
      let despesas = 0;
      monthTxs.forEach(t => {
        if (t.value > 0) {
          receitas += t.value;
        } else {
          despesas += Math.abs(t.value);
        }
      });

      // Decouple the chart month total from the table date filter to always show full month totals
      monthsData.push({
        name: monthLabel,
        receitas: receitas,
        despesas: despesas
      });
    }

    return monthsData;
  }, [transactions, stats]);

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
    setFormDate("2026-05-23");
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

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const valNum = parseFloat(formValue.replace(",", "."));
    if (isNaN(valNum) || valNum <= 0) {
      showToast("Por favor, digite um valor válido.", "error");
      return;
    }
    const tempTx: Omit<Transaction, "id"> = {
      date: formDate,
      category: formCategory,
      description: formDescription || (formType === "Receitas" ? "Receita avulsa" : formType === "Investimentos" ? "Investimento avulso" : "Despesa avulsa"),
      account: formAccount,
      value: formType === "Receitas" ? valNum : formType === "Investimentos" ? valNum : -valNum,
      type: formType
    };
    try {
      const savedTx = await createTransaction(tempTx, userId);
      setTransactions([savedTx, ...transactions]);
      setIsAddModalOpen(false);
      showToast(`${formType === "Receitas" ? "Receita salva" : formType === "Investimentos" ? "Investimento cadastrado" : "Despesa salva"} com sucesso!`);
    } catch (error) {
      showToast("Erro ao salvar transação no servidor.", "error");
    }
  };

  const handleEditTransaction = async (e: React.FormEvent) => {
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
      value: formType === "Receitas" ? valNum : formType === "Investimentos" ? valNum : -valNum,
      type: formType
    };
    try {
      const savedTx = await updateTransaction(updatedTx, userId);
      setTransactions(transactions.map(t => t.id === editingTransaction.id ? savedTx : t));
      setIsEditModalOpen(false);
      setEditingTransaction(null);
      showToast("Transação atualizada com sucesso!");
    } catch (error) {
      showToast("Erro ao atualizar transação no servidor.", "error");
    }
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
          if (menu === "Lançamento" || menu === "Transação") {
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
            router.push("/categorias");
          } else if (menu === "Perfil") {
            router.push("/perfil");
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
          onAddClick={() => router.push("/transacao")}
          showToast={showToast}
          onDateFilterChange={(filter) => setDateFilter(filter)}
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
            transactions={filteredTransactions}
            theme={theme}
            onEditClick={handleOpenEditModal}
            onDeleteClick={handleDeleteTransaction}
            formatCurrency={formatCurrency}
            formatDateForDisplay={formatDateForDisplay}
            onQuickAddClick={(type) => router.push("/transacao?type=" + type)}
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
