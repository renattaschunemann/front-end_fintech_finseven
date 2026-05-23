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

      // Base monthly revenue varies smoothly between 11000 and 13800 BRL to keep the average perfectly between 10000 and 15000
      let monthlyBase = 11000 + (month * 200) + ((year - startYear) * 150);
      if (year === 2026 && month === 4) {
        // Set May 2026 to exactly 85% of the average of previous months (11950 BRL), since the user still has 7 days left in the month to record transactions
        monthlyBase = Math.round(11950 * 0.85); // 10158 BRL
      }

      const dist = [0.28, 0.34, 0.38];
      const recValues = dist.map(pct => Math.round(monthlyBase * pct));
      const despValues = recValues.map(v => Math.round(v * 0.85));

      for (let i = 0; i < 3; i++) {
        const dayReceita = String(5 + i * 7).padStart(2, "0");
        const dateStr = `${year}-${padMonth}-${dayReceita}`;
        
        const catIdx = (year + month + i) % categoriesReceitas.length;
        const cat = categoriesReceitas[catIdx];
        const descList = descReceitas[catIdx];
        const desc = descList[i % descList.length];
        const value = recValues[i];

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
        const value = despValues[i];

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
        let value = 200 + (month * 20) + (i * 150);
        if (year === 2026 && month === 4) {
          value = Math.round(value * 1.8);
        }

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

const INITIAL_TRANSACTIONS: Transaction[] = generateMockTransactions();

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
  const [dateFilter, setDateFilter] = useState<"today" | "7days" | "30days" | "all">("all");
  const [formType, setFormType] = useState<"Receitas" | "Despesas" | "Investimentos">("Despesas");
  const [formCategory, setFormCategory] = useState("Supermercado");
  const [formDescription, setFormDescription] = useState("");
  const [formAccount, setFormAccount] = useState("Itaú");
  const [formValue, setFormValue] = useState("");
  const [formDate, setFormDate] = useState("2026-05-23");
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  useEffect(() => {
    const loggedUser = localStorage.getItem("finseven-logged-user");
    if (!loggedUser) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const saved = localStorage.getItem("finseven-transactions");
    const mockUpdated = localStorage.getItem("finseven-mock-updated-may2026-v3");
    if (saved && mockUpdated === "true") {
      try {
        const parsed = JSON.parse(saved);
        const hasInvestments = parsed.some((t: any) => t.type === "Investimentos");
        if (parsed.length < 10 || !hasInvestments) {
          setTransactions(INITIAL_TRANSACTIONS);
          localStorage.setItem("finseven-mock-updated-may2026-v3", "true");
        } else {
          setTransactions(parsed);
        }
      } catch (e) {
        setTransactions(INITIAL_TRANSACTIONS);
        localStorage.setItem("finseven-mock-updated-may2026-v3", "true");
      }
    } else {
      setTransactions(INITIAL_TRANSACTIONS);
      localStorage.setItem("finseven-mock-updated-may2026-v3", "true");
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
          onAddClick={() => router.push("/lancamento")}
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
