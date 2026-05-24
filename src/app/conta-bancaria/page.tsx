"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  agency: string;
  accountNumber: string;
  initialBalance: number;
  accountType: "Conta Corrente" | "Conta Salário" | "Conta Poupança";
}

const BANKS = [
  { code: "001", name: "Banco do Brasil S.A" },
  { code: "033", name: "Banco Santander S.A" },
  { code: "104", name: "Caixa Econômica Federal" },
  { code: "237", name: "Banco Bradesco S.A" },
  { code: "341", name: "Itaú Unibanco" },
  { code: "077", name: "Banco Inter S.A" },
  { code: "208", name: "Banco BTG Pactual S.A." },
  { code: "212", name: "Banco Original S.A" },
  { code: "260", name: "Nu Pagamentos S.A. (Nubank)" },
  { code: "336", name: "Banco C6 S.A. (C6 Bank)" },
  { code: "655", name: "Banco Neon S.A." },
  { code: "004", name: "Banco do Nordeste do Brasil S.A." },
  { code: "003", name: "Banco da Amazônia S.A." },
  { code: "024", name: "Banco BANDEPE S.A." },
  { code: "041", name: "Banco do Estado do Rio Grande do Sul S.A. (Banrisul)" },
  { code: "070", name: "Banco de Brasília S.A. (BRB)" },
  { code: "096", name: "Banco B3 S.A" },
  { code: "121", name: "Banco Agibank S.A." },
  { code: "246", name: "Banco ABC Brasil S.A." },
  { code: "318", name: "Banco BMG S.A." },
  { code: "422", name: "Banco Safra S.A." },
  { code: "745", name: "Banco Citibank S.A." },
];

export default function ContaBancariaPage() {
  const router = useRouter();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeMenu, setActiveMenu] = useState("Conta Bancária");

  
  const [selectedBankName, setSelectedBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [agency, setAgency] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [initialBalance, setInitialBalance] = useState("");
  const [accountType, setAccountType] = useState<"Conta Corrente" | "Conta Salário" | "Conta Poupança">("Conta Corrente");
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  useEffect(() => {
    const loggedUser = localStorage.getItem("finseven-logged-user");
    if (!loggedUser) {
      router.push("/login");
    }
  }, [router]);

  
  useEffect(() => {
    const loadAPI = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/bancos");
        if (!res.ok) throw new Error("Erro ao buscar bancos.");
        const data = await res.json();
        const mapped = data.map((item: any) => ({
          id: String(item.idBanco),
          bankName: item.nome,
          bankCode: item.nome.includes("Brasil") ? "001" : item.nome.includes("Itaú") ? "341" : "341",
          agency: item.agencia || "0000",
          accountNumber: item.conta,
          initialBalance: item.saldo,
          accountType: item.tipo || "Conta Corrente"
        }));
        setBankAccounts(mapped);
      } catch (error) {
        showToast("Erro ao carregar contas bancárias do servidor.", "error");
        setBankAccounts([]);
      }
      setIsLoaded(true);
    };

    loadAPI();

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
    const matched = BANKS.find((b) => b.name === selectedBankName);
    if (matched) {
      setBankCode(matched.code);
    } else {
      setBankCode("");
    }
  }, [selectedBankName]);

  
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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const handleRegisterAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBankName) {
      showToast("Por favor, selecione um banco.", "error");
      return;
    }
    if (!agency.trim()) {
      showToast("Por favor, informe a agência.", "error");
      return;
    }
    if (!accountNumber.trim()) {
      showToast("Por favor, informe o número da conta.", "error");
      return;
    }

    const parsedBalance = parseFloat(initialBalance.replace(",", "."));
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      showToast("O saldo inicial não pode ser negativo.", "error");
      return;
    }

    
    const isDuplicate = bankAccounts.some(
      (acc) =>
        acc.id !== (editingAccount?.id ?? "") &&
        acc.bankCode === bankCode &&
        acc.accountNumber.trim().toLowerCase() === accountNumber.trim().toLowerCase()
    );

    if (isDuplicate) {
      showToast("Esta conta já está cadastrada para o banco selecionado.", "error");
      return;
    }

    try {
      const payload = {
        nome: selectedBankName,
        agencia: agency.trim(),
        conta: accountNumber.trim(),
        tipo: accountType,
        saldo: parsedBalance
      };

      if (editingAccount) {
        
        const res = await fetch(`http://localhost:8080/api/bancos/${editingAccount.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Falha ao atualizar conta bancária.");

        const savedItem = await res.json();
        const updatedAccounts = bankAccounts.map((acc) => 
          acc.id === editingAccount.id 
            ? {
                id: String(savedItem.idBanco),
                bankName: savedItem.nome,
                bankCode: bankCode,
                agency: savedItem.agencia || "0000",
                accountNumber: savedItem.conta,
                initialBalance: savedItem.saldo,
                accountType: savedItem.tipo || "Conta Corrente"
              }
            : acc
        );

        setBankAccounts(updatedAccounts);
        setEditingAccount(null);
        showToast("Conta bancária atualizada com sucesso!", "success");
      } else {
        
        const res = await fetch("http://localhost:8080/api/bancos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Falha ao salvar conta bancária.");

        const savedItem = await res.json();
        const newAccount: BankAccount = {
          id: String(savedItem.idBanco),
          bankName: savedItem.nome,
          bankCode: bankCode,
          agency: savedItem.agencia || "0000",
          accountNumber: savedItem.conta,
          initialBalance: savedItem.saldo,
          accountType: savedItem.tipo || "Conta Corrente"
        };

        setBankAccounts([newAccount, ...bankAccounts]);
        showToast("Conta bancária cadastrada com sucesso!", "success");
      }

      
      setSelectedBankName("");
      setBankCode("");
      setAgency("");
      setAccountNumber("");
      setInitialBalance("");
      setAccountType("Conta Corrente");
    } catch (error: any) {
      showToast("Erro ao processar conta bancária no servidor: " + error.message, "error");
    }
  };

  const handleEditClick = (account: BankAccount) => {
    setEditingAccount(account);
    setSelectedBankName(account.bankName);
    setAgency(account.agency);
    setAccountNumber(account.accountNumber);
    setInitialBalance(String(account.initialBalance));
    setAccountType(account.accountType);
    showToast(`Editando conta do banco ${account.bankName}`, "info");
  };

  const handleCancelEdit = () => {
    setEditingAccount(null);
    setSelectedBankName("");
    setBankCode("");
    setAgency("");
    setAccountNumber("");
    setInitialBalance("");
    setAccountType("Conta Corrente");
  };

  const handleDeleteAccount = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta conta bancária?")) {
      try {
        const res = await fetch(`http://localhost:8080/api/bancos/${id}`, {
          method: "DELETE"
        });

        if (!res.ok) throw new Error("Erro ao deletar.");

        setBankAccounts(bankAccounts.filter((acc) => acc.id !== id));
        showToast("Conta bancária excluída com sucesso!", "info");
      } catch (error) {
        showToast("Erro ao excluir conta bancária no servidor.", "error");
      }
    }
  };

  
  const totalBalance = useMemo(() => {
    return bankAccounts.reduce((sum, acc) => sum + acc.initialBalance, 0);
  }, [bankAccounts]);

  const bankBrandStyles = (code: string) => {
    switch (code) {
      case "260": 
        return {
          bg: "bg-purple-600/10 border-purple-500/20 text-purple-400",
          iconColor: "text-purple-400",
          glow: "shadow-[0_0_15px_rgba(168,85,247,0.15)]",
        };
      case "341": 
        return {
          bg: "bg-orange-600/10 border-orange-500/20 text-orange-400",
          iconColor: "text-orange-400",
          glow: "shadow-[0_0_15px_rgba(249,115,22,0.15)]",
        };
      case "237": 
      case "033": 
        return {
          bg: "bg-rose-600/10 border-rose-500/20 text-rose-400",
          iconColor: "text-rose-400",
          glow: "shadow-[0_0_15px_rgba(244,63,94,0.15)]",
        };
      case "104": 
        return {
          bg: "bg-blue-600/10 border-blue-500/20 text-blue-400",
          iconColor: "text-blue-400",
          glow: "shadow-[0_0_15px_rgba(59,130,246,0.15)]",
        };
      case "001": 
        return {
          bg: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
          iconColor: "text-yellow-400",
          glow: "shadow-[0_0_15px_rgba(234,179,8,0.15)]",
        };
      case "336": 
        return {
          bg: "bg-slate-700/15 border-slate-650/20 text-slate-300",
          iconColor: "text-slate-300",
          glow: "shadow-[0_0_15px_rgba(148,163,184,0.1)]",
        };
      case "077": 
        return {
          bg: "bg-orange-500/15 border-orange-400/20 text-orange-450",
          iconColor: "text-orange-450",
          glow: "shadow-[0_0_15px_rgba(249,115,22,0.1)]",
        };
      case "208": 
        return {
          bg: "bg-indigo-900/20 border-indigo-700/20 text-indigo-400",
          iconColor: "text-indigo-400",
          glow: "shadow-[0_0_15px_rgba(99,102,241,0.1)]",
        };
      case "212": 
        return {
          bg: "bg-emerald-600/10 border-emerald-500/20 text-emerald-400",
          iconColor: "text-emerald-400",
          glow: "shadow-[0_0_15px_rgba(16,185,129,0.15)]",
        };
      case "121": 
        return {
          bg: "bg-sky-500/10 border-sky-400/20 text-sky-400",
          iconColor: "text-sky-400",
          glow: "shadow-[0_0_15px_rgba(56,189,248,0.15)]",
        };
      default:
        return {
          bg: "bg-cyan-600/10 border-cyan-500/20 text-cyan-400",
          iconColor: "text-cyan-400",
          glow: "shadow-[0_0_15px_rgba(6,182,212,0.15)]",
        };
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
            setActiveMenu("Conta Bancária");
          } else if (menu === "Categorias") {
            router.push("/categorias");
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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/25 pb-4">
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                Contas Bancárias
              </h1>
              <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                Cadastre e acompanhe os seus bancos e contas de fluxo no sistema.
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

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className={`backdrop-blur-md border rounded-2xl p-5 shadow-sm transition-all ${
              theme === "dark" ? "bg-[#101422]/70 border-slate-800/40" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  Bancos Cadastrados
                </span>
                <div className={`p-2 rounded-xl ${theme === "dark" ? "bg-cyan-500/10 text-cyan-400" : "bg-cyan-50 text-cyan-600"}`}>
                  <svg className="w-5 h-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <span className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {new Set(bankAccounts.map(acc => acc.bankCode)).size}
                </span>
              </div>
            </div>

            <div className={`backdrop-blur-md border rounded-2xl p-5 shadow-sm transition-all ${
              theme === "dark" ? "bg-[#101422]/70 border-slate-800/40" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  Contas Ativas
                </span>
                <div className={`p-2 rounded-xl ${theme === "dark" ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                  <svg className="w-5 h-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <span className={`text-2xl font-black ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  {bankAccounts.length}
                </span>
              </div>
            </div>

            <div className={`backdrop-blur-md border rounded-2xl p-5 shadow-sm transition-all md:col-span-2 lg:col-span-1 ${
              theme === "dark" ? "bg-[#101422]/70 border-slate-800/40" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  Saldo Inicial Total
                </span>
                <div className={`p-2 rounded-xl ${theme === "dark" ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"}`}>
                  <svg className="w-5 h-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3">
                <span className={`text-2xl font-black text-blue-450 ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
                  {formatCurrency(totalBalance)}
                </span>
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {}
            <div className={`lg:col-span-5 backdrop-blur-md border rounded-2xl p-6 shadow-md transition-all ${
              theme === "dark" ? "bg-[#101422]/70 border-slate-800/40 shadow-2xl shadow-black/30" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-850/50">
                <div className={`p-1.5 rounded-lg ${
                  editingAccount 
                    ? theme === "dark" ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-600"
                    : theme === "dark" ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
                }`}>
                  {editingAccount ? (
                    <svg className="w-5 h-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <h3 className={`text-base font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-800"}`}>
                  {editingAccount ? `Editar Conta: ${editingAccount.bankName}` : "Cadastrar Nova Conta"}
                </h3>
              </div>

              <form onSubmit={handleRegisterAccount} className="space-y-4">
                {}
                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Banco
                  </label>
                  <select
                    value={selectedBankName}
                    onChange={(e) => setSelectedBankName(e.target.value)}
                    required
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none appearance-none cursor-pointer ${
                      theme === "dark"
                        ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                        : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200"
                    }`}
                  >
                    <option value="" disabled>-- Selecione o Banco --</option>
                    {BANKS.map((bank) => (
                      <option key={bank.code} value={bank.name}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {}
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}>
                      Nº Banco (Preenchido)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={bankCode}
                      placeholder="---"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-bold tracking-widest text-center cursor-not-allowed outline-none select-none ${
                        theme === "dark"
                          ? "bg-[#04080e] border-slate-800/70 text-blue-400/90"
                          : "bg-slate-100 border-slate-250 text-blue-700/90"
                      }`}
                    />
                  </div>

                  {}
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}>
                      Agência
                    </label>
                    <input
                      type="text"
                      value={agency}
                      onChange={(e) => setAgency(e.target.value)}
                      required
                      placeholder="0001"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none ${
                        theme === "dark"
                          ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 placeholder-slate-600"
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200 placeholder-slate-400"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {}
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}>
                      Nº Conta (Letra/Nº)
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      required
                      placeholder="12345-X"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none ${
                        theme === "dark"
                          ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 placeholder-slate-600"
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200 placeholder-slate-400"
                      }`}
                    />
                  </div>

                  {}
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}>
                      Saldo Inicial (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      required
                      placeholder="0,00"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none ${
                        theme === "dark"
                          ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 placeholder-slate-600"
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200 placeholder-slate-400"
                      }`}
                    />
                  </div>
                </div>

                {}
                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Tipo de Conta
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setAccountType("Conta Corrente")}
                      className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                        accountType === "Conta Corrente"
                          ? "bg-blue-600/15 border-blue-500/40 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                          : theme === "dark"
                          ? "bg-[#070b13] border-slate-800/50 hover:bg-slate-800/30 text-slate-400"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                      </svg>
                      <span>Conta Corrente</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountType("Conta Poupança")}
                      className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                        accountType === "Conta Poupança"
                          ? "bg-amber-600/15 border-amber-500/40 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                          : theme === "dark"
                          ? "bg-[#070b13] border-slate-800/50 hover:bg-slate-800/30 text-slate-400"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Conta Poupança</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountType("Conta Salário")}
                      className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer border ${
                        accountType === "Conta Salário"
                          ? "bg-violet-600/15 border-violet-500/40 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                          : theme === "dark"
                          ? "bg-[#070b13] border-slate-800/50 hover:bg-slate-800/30 text-slate-400"
                          : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Conta Salário</span>
                    </button>
                  </div>
                </div>

                {}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    type="submit"
                    className={`flex-1 font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                      editingAccount
                        ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/10"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
                    }`}
                  >
                    {editingAccount ? "Salvar Alterações" : "Cadastrar Conta"}
                  </button>
                  
                  {editingAccount && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className={`px-4 py-3.5 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                        theme === "dark"
                          ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            {}
            <div className={`lg:col-span-7 backdrop-blur-md border rounded-2xl p-6 shadow-md transition-all ${
              theme === "dark" ? "bg-[#101422]/70 border-slate-800/40" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-850/50">
                <div>
                  <h3 className={`text-base font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-800"}`}>
                    Contas Bancárias Ativas
                  </h3>
                  <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    Listagem e consulta detalhada de contas bancárias por banco.
                  </p>
                </div>
              </div>

              {bankAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className={`p-4 rounded-full mb-3 ${theme === "dark" ? "bg-slate-900/60 text-slate-600" : "bg-slate-50 text-slate-400"}`}>
                    <svg className="w-8 h-8 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className={`text-sm font-semibold mb-1 ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                    Nenhuma conta cadastrada
                  </span>
                  <span className={`text-xs max-w-xs ${theme === "dark" ? "text-slate-500" : "text-slate-450"}`}>
                    Preencha o formulário ao lado para cadastrar sua primeira conta bancária no sistema.
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  {bankAccounts.map((account) => {
                    const brand = bankBrandStyles(account.bankCode);
                    return (
                      <div
                        key={account.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl transition-all hover:scale-[1.005] ${brand.glow} ${
                          theme === "dark"
                            ? "bg-[#0b0f19]/80 border-slate-800/40 hover:bg-slate-900/40"
                            : "bg-slate-50/60 border-slate-200 hover:bg-slate-100/60"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {}
                          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-xs font-bold border transition-all ${brand.bg}`}>
                            {account.bankCode}
                          </div>

                          <div>
                            <span className={`text-sm font-extrabold block tracking-wide ${theme === "dark" ? "text-slate-100" : "text-slate-850"}`}>
                              {account.bankName}
                            </span>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-[11px] font-semibold text-slate-500">
                              <span>Ag: <strong className={theme === "dark" ? "text-slate-350" : "text-slate-700"}>{account.agency}</strong></span>
                              <span className="h-1 w-1 bg-slate-700 rounded-full" />
                              <span>Conta: <strong className={theme === "dark" ? "text-slate-350" : "text-slate-700"}>{account.accountNumber}</strong></span>
                              <span className="h-1 w-1 bg-slate-700 rounded-full" />
                              {}
                              <span className={`inline-block px-2 py-0.5 text-[9px] uppercase font-extrabold tracking-wider rounded ${
                                account.accountType === "Conta Corrente"
                                  ? theme === "dark" ? "bg-blue-950/40 text-blue-400 border border-blue-800/35" : "bg-blue-50 text-blue-600 border border-blue-200"
                                  : account.accountType === "Conta Poupança"
                                  ? theme === "dark" ? "bg-amber-950/40 text-amber-400 border border-amber-800/35" : "bg-amber-50 text-amber-600 border border-amber-200"
                                  : theme === "dark" ? "bg-violet-950/40 text-violet-400 border border-violet-800/35" : "bg-violet-50 text-violet-600 border border-violet-200"
                              }`}>
                                {account.accountType}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-5 pl-15 sm:pl-0 border-t sm:border-t-0 border-slate-800/10 pt-2 sm:pt-0">
                          <div className="text-left sm:text-right">
                            <span className={`text-[10px] font-bold uppercase tracking-wider block ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>
                              Saldo Inicial
                            </span>
                            <span className={`text-sm font-black tracking-wide ${theme === "dark" ? "text-slate-100" : "text-slate-900"}`}>
                              {formatCurrency(account.initialBalance)}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditClick(account)}
                              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                                theme === "dark"
                                  ? "bg-slate-900/60 border-slate-800/50 hover:bg-amber-950/20 text-slate-500 hover:text-amber-400 hover:border-amber-500/20"
                                  : "bg-white border-slate-200 hover:bg-amber-50 text-slate-450 hover:text-amber-600 hover:border-amber-200"
                              }`}
                              title="Editar conta"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(account.id)}
                              className={`p-2 rounded-xl transition-all cursor-pointer border ${
                                theme === "dark"
                                  ? "bg-slate-900/60 border-slate-800/50 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 hover:border-rose-500/20"
                                  : "bg-white border-slate-200 hover:bg-rose-50 text-slate-450 hover:text-rose-600 hover:border-rose-200"
                              }`}
                              title="Remover conta"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {}
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
