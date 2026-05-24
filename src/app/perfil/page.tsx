"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Transaction } from "@/interfaces";

function PerfilContent() {
  const router = useRouter();
  
  // Theme state
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Perfil");

  // User details state
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [originalCpf, setOriginalCpf] = useState("");

  // Statistics
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Sync theme
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

  // Auth Guard & Loading Initial Data
  useEffect(() => {
    const loggedUserJson = localStorage.getItem("finseven-logged-user");
    if (!loggedUserJson) {
      router.push("/login");
      return;
    }

    try {
      const loggedUser = JSON.parse(loggedUserJson);
      setNome(loggedUser.name || "");
      setCpf(formatCpf(loggedUser.cpf || ""));
      setEmail(loggedUser.email || "");
      setOriginalCpf(loggedUser.cpf || "");
    } catch (e) {
      router.push("/login");
      return;
    }

    // Load transactions for statistics
    const savedTxs = localStorage.getItem("finseven-transactions");
    if (savedTxs) {
      try {
        setTransactions(JSON.parse(savedTxs));
      } catch (e) {
        // ignore
      }
    }

    setIsLoaded(true);
  }, [router]);

  // Toast Auto-Dismiss
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
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      showToast(`Tema alterado para Modo ${next === "dark" ? "Escuro" : "Claro"}!`, "info");
      return next;
    });
  };

  // CPF input format helper
  const formatCpf = (val: string) => {
    const numbersOnly = val.replace(/\D/g, "");
    let formatted = numbersOnly;

    if (numbersOnly.length > 3) {
      formatted = `${numbersOnly.slice(0, 3)}.${numbersOnly.slice(3)}`;
    }
    if (numbersOnly.length > 6) {
      formatted = `${formatted.slice(0, 7)}.${numbersOnly.slice(6)}`;
    }
    if (numbersOnly.length > 9) {
      formatted = `${formatted.slice(0, 11)}-${numbersOnly.slice(9, 11)}`;
    }
    return formatted;
  };

  const handleCpfChange = (val: string) => {
    setCpf(formatCpf(val));
  };

  // Stats calculation
  const stats = useMemo(() => {
    let totalTransacoes = transactions.length;
    let totalReceitas = 0;
    let totalDespesas = 0;
    let totalInvestido = 0;

    transactions.forEach(t => {
      if (t.type === "Receitas") {
        totalReceitas += t.value;
      } else if (t.type === "Despesas") {
        totalDespesas += Math.abs(t.value);
      } else if (t.type === "Investimentos") {
        totalInvestido += t.value;
      }
    });

    const carryOver = 4631.25;
    const balance = totalReceitas - totalDespesas;
    const netWorth = carryOver + balance;

    return {
      totalTransacoes,
      netWorth,
      totalReceitas,
      totalDespesas,
      totalInvestido
    };
  }, [transactions]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  // Profile Save handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      showToast("Por favor, preencha um CPF válido com 11 dígitos.", "error");
      return;
    }

    if (!nome.trim()) {
      showToast("Por favor, preencha seu nome.", "error");
      return;
    }

    if (!email.includes("@")) {
      showToast("Por favor, preencha um e-mail válido.", "error");
      return;
    }

    if (password && password.length < 6) {
      showToast("A nova senha deve ter no mínimo 6 caracteres.", "error");
      return;
    }

    if (password && password !== confirmPassword) {
      showToast("As senhas não coincidem.", "error");
      return;
    }

    // Get current registered users
    const usersJson = localStorage.getItem("finseven-users");
    let users = usersJson ? JSON.parse(usersJson) : [];

    // Check if new CPF belongs to someone else
    if (cleanCpf !== originalCpf) {
      const userConflict = users.find((u: any) => u.cpf === cleanCpf);
      if (userConflict) {
        showToast("O novo CPF informado já está cadastrado por outro usuário.", "error");
        return;
      }
    }

    // Update user inside simulation array
    let userIndex = users.findIndex((u: any) => u.cpf === originalCpf);
    const updatedUser: any = {
      name: nome.trim(),
      cpf: cleanCpf,
      email: email.trim(),
    };

    if (userIndex !== -1) {
      // Retain existing password if a new one is not provided
      updatedUser.password = password || users[userIndex].password;
      users[userIndex] = updatedUser;
    } else {
      // In case logged-user exists but not in db, register them
      updatedUser.password = password || "admin123";
      users.push(updatedUser);
    }

    // Save updated registries
    localStorage.setItem("finseven-users", JSON.stringify(users));

    // Update current active session
    localStorage.setItem("finseven-logged-user", JSON.stringify({
      name: updatedUser.name,
      cpf: updatedUser.cpf,
      email: updatedUser.email
    }));

    setOriginalCpf(cleanCpf);
    setPassword("");
    setConfirmPassword("");

    showToast("Perfil atualizado com sucesso!", "success");

    // Force sidebar to update user info state
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0b0f19] text-slate-400">
        Carregando painel de perfil...
      </div>
    );
  }

  const initials = nome
    ? nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

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
            router.push("/categorias");
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
        />

        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}>
              Configurações de Perfil
            </h1>
            <p className={`text-xs mt-1 ${
              theme === "dark" ? "text-slate-400" : "text-slate-500"
            }`}>
              Gerencie seus dados pessoais, credenciais de acesso e visualize o resumo da sua carteira.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Column */}
            <div className={`lg:col-span-2 p-6 rounded-3xl border backdrop-blur-md transition-all ${
              theme === "dark" 
                ? "bg-[#101422]/70 border-slate-800/60 shadow-[0_15px_30px_rgba(0,0,0,0.2)]" 
                : "bg-white border-slate-200/80 shadow-[0_15px_30px_rgba(15,23,42,0.04)]"
            }`}>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-extrabold flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
                  {initials}
                </div>
                <div>
                  <h3 className={`text-md font-bold ${theme === "dark" ? "text-slate-100" : "text-slate-800"}`}>
                    Sua Foto de Perfil
                  </h3>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}>
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Administrador FinSeven"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none ${
                        theme === "dark"
                          ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}>
                      CPF
                    </label>
                    <input
                      type="text"
                      required
                      value={cpf}
                      onChange={(e) => handleCpfChange(e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none ${
                        theme === "dark"
                          ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none ${
                      theme === "dark"
                        ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                        : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200"
                    }`}
                  />
                </div>

                <hr className={`border-dashed my-6 ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`} />

                <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
                  Alterar Senha de Acesso (Opcional)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}>
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none ${
                        theme === "dark"
                          ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                      theme === "dark" ? "text-slate-400" : "text-slate-500"
                    }`}>
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua nova senha"
                      className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none ${
                        theme === "dark"
                          ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30"
                          : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl text-xs transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-blue-500/10"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>

            {/* Resume / Stats Column */}
            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border backdrop-blur-md transition-all ${
                theme === "dark" 
                  ? "bg-[#101422]/70 border-slate-800/60 shadow-[0_15px_30px_rgba(0,0,0,0.2)]" 
                  : "bg-white border-slate-200/80 shadow-[0_15px_30px_rgba(15,23,42,0.04)]"
              }`}>
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${theme === "dark" ? "text-slate-350" : "text-slate-700"}`}>
                  Resumo da Carteira
                </h3>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-2xl border transition-all ${
                    theme === "dark" ? "bg-[#070b13] border-slate-850" : "bg-slate-50 border-slate-150"
                  }`}>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Saldo Líquido</span>
                    <span className={`text-lg font-black tracking-tight ${theme === "dark" ? "text-cyan-400" : "text-cyan-600"}`}>
                      {formatCurrency(stats.netWorth)}
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl border transition-all ${
                    theme === "dark" ? "bg-[#070b13] border-slate-850" : "bg-slate-50 border-slate-150"
                  }`}>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Total Receitas</span>
                    <span className="text-lg font-black tracking-tight text-emerald-500">
                      {formatCurrency(stats.totalReceitas)}
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl border transition-all ${
                    theme === "dark" ? "bg-[#070b13] border-slate-850" : "bg-slate-50 border-slate-150"
                  }`}>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Total Despesas</span>
                    <span className="text-lg font-black tracking-tight text-rose-500">
                      {formatCurrency(-stats.totalDespesas)}
                    </span>
                  </div>

                  <div className={`p-4 rounded-2xl border transition-all ${
                    theme === "dark" ? "bg-[#070b13] border-slate-850" : "bg-slate-50 border-slate-150"
                  }`}>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Investido</span>
                    <span className="text-lg font-black tracking-tight text-violet-500">
                      {formatCurrency(stats.totalInvestido)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status details card */}
              <div className={`p-6 rounded-3xl border backdrop-blur-md transition-all text-center relative overflow-hidden ${
                theme === "dark" 
                  ? "bg-slate-900/40 border-slate-800/40 text-slate-400" 
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}>
                <div className="absolute top-[-10%] right-[-10%] w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                <span className="text-[10px] font-bold uppercase block mb-1 text-blue-400">Resumo da Conta</span>
                
                <div className="grid grid-cols-2 gap-4 mt-4 text-left">
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-wider block text-slate-500">Status</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block animate-ping" />
                      Ativo
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-bold uppercase tracking-wider block text-slate-500">Transações</span>
                    <span className={`text-xs font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                      {stats.totalTransacoes} registros
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-[#0b0f19] text-slate-400">
        Carregando perfil...
      </div>
    }>
      <PerfilContent />
    </Suspense>
  );
}
