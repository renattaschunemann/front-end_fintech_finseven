"use client";

import { useState, useEffect, useRef } from "react";
import { HeaderProps, Transaction } from "@/interfaces";
import { useRouter } from "next/navigation";

export default function Header({
  setSidebarOpen,
  theme,
  onAddClick,
  showToast,
  onDateFilterChange,
}: HeaderProps) {
  const router = useRouter();
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"today" | "7days" | "30days" | "all">("today");
  const [loggedUser, setLoggedUser] = useState<{ name: string; cpf: string; email: string } | null>(null);

  const shareRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userJson = localStorage.getItem("finseven-logged-user");
    if (userJson) {
      try {
        setLoggedUser(JSON.parse(userJson));
      } catch (e) {
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShareDropdownOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setDateDropdownOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = window.location.origin;
      navigator.clipboard.writeText(url)
        .then(() => {
          showToast("Link do painel copiado com sucesso! Compartilhe com quem quiser.", "success");
          setShareDropdownOpen(false);
        })
        .catch(() => {
          showToast("Não foi possível copiar o link automaticamente.", "error");
        });
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== "undefined") {
      const text = encodeURIComponent(
        "Ei! Olha só como está o meu painel financeiro do FinSeven! Rápido, intuitivo e moderno. Confere aí!"
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
      setShareDropdownOpen(false);
    }
  };

  const handleShareEmail = () => {
    if (typeof window !== "undefined") {
      const subject = encodeURIComponent("Meu Painel de Gestão Financeira FinSeven");
      const body = encodeURIComponent(
        "Olá! Estou utilizando o FinSeven para gerenciar minhas despesas, receitas e investimentos com um painel interativo incrível. Venha conferir!"
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      setShareDropdownOpen(false);
    }
  };

  const handleExportCSV = () => {
    try {
      const stored = localStorage.getItem("finseven-transactions");
      let txs: Transaction[] = [];
      if (stored) {
        txs = JSON.parse(stored);
      }
      
      if (txs.length === 0) {
        showToast("Nenhuma transação encontrada para exportar.", "info");
        return;
      }

      const headers = ["ID", "Data", "Categoria", "Descrição", "Conta Bancária", "Valor (R$)", "Tipo"];
      const rows = txs.map(t => [
        t.id,
        t.date,
        t.category,
        t.description,
        t.account,
        t.value.toFixed(2),
        t.type
      ]);

      const csvContent = "\uFEFF" + [
        headers.join(";"),
        ...rows.map(r => r.join(";"))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `extrato_finseven_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Exportação concluída! ${txs.length} transações salvas no arquivo CSV.`, "success");
    } catch (error) {
      showToast("Ocorreu um erro ao exportar os dados.", "error");
    }
  };

  const handleDateFilterSelect = (filter: "today" | "7days" | "30days" | "all") => {
    setSelectedFilter(filter);
    setDateDropdownOpen(false);
    
    let message = "Filtrando transações de hoje.";
    if (filter === "7days") {
      message = "Filtrando transações dos últimos 7 dias.";
    } else if (filter === "30days") {
      message = "Filtrando transações dos últimos 30 dias.";
    } else if (filter === "all") {
      message = "Mostrando todas as transações.";
    }

    showToast(message, "info");
    if (onDateFilterChange) {
      onDateFilterChange(filter);
    }
  };

  const getFilterLabel = () => {
    if (selectedFilter === "today") return "Hoje";
    if (selectedFilter === "7days") return "7 Dias";
    if (selectedFilter === "30days") return "30 Dias";
    return "Todos";
  };

  return (
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
        {onAddClick && (
          <button 
            onClick={onAddClick}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-sm font-extrabold px-6 py-3 rounded-2xl hover:scale-[1.04] transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.65)] border border-emerald-400/30 text-white cursor-pointer flex items-center justify-center"
          >
            <span>+ Transação</span>
          </button>
        )}

        <div className="relative" ref={shareRef}>
          <button 
            onClick={() => setShareDropdownOpen(!shareDropdownOpen)}
            className={`border text-xs font-semibold px-3 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              theme === "dark" 
                ? "bg-slate-800/50 hover:bg-slate-800 border-slate-700/40 hover:border-slate-700 text-slate-300 hover:text-slate-100" 
                : "bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
            } ${shareDropdownOpen ? (theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-300") : ""}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.316-2.158m0 0a3 3 0 10-1.222-2.316L7.462 8.426a3 3 0 100 7.148l4.316 2.158a3 3 0 101.222-2.316" />
            </svg>
            <span className="hidden md:inline">Compartilhar</span>
          </button>

          {shareDropdownOpen && (
            <div className={`absolute right-0 mt-2 w-48 rounded-2xl border p-1.5 shadow-xl backdrop-blur-xl z-30 ${
              theme === "dark" 
                ? "bg-[#101422]/95 border-slate-800/50 shadow-black/60 text-slate-200" 
                : "bg-white/95 border-slate-200 shadow-slate-200/55 text-slate-700"
            }`}>
              <button 
                onClick={handleCopyLink}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copiar Link
              </button>
              <button 
                onClick={handleShareWhatsApp}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
                }`}
              >
                <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                WhatsApp
              </button>
              <button 
                onClick={handleShareEmail}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Enviar por E-mail
              </button>
            </div>
          )}
        </div>

        <button 
          onClick={handleExportCSV}
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

        <div className="relative" ref={dateRef}>
          <button 
            onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
            className={`border text-xs font-semibold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              theme === "dark" 
                ? "bg-slate-800/50 hover:bg-slate-800 border-slate-700/40 hover:border-slate-700 text-slate-300 hover:text-slate-100" 
                : "bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
            } ${dateDropdownOpen ? (theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-300") : ""}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="capitalize">{getFilterLabel()}</span>
            <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dateDropdownOpen && (
            <div className={`absolute right-0 mt-2 w-48 rounded-2xl border p-1.5 shadow-xl backdrop-blur-xl z-30 ${
              theme === "dark" 
                ? "bg-[#101422]/95 border-slate-800/50 shadow-black/60 text-slate-200" 
                : "bg-white/95 border-slate-200 shadow-slate-200/55 text-slate-700"
            }`}>
              <button 
                onClick={() => handleDateFilterSelect("today")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  selectedFilter === "today" ? (theme === "dark" ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-600") : ""
                } ${theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-100"}`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${selectedFilter === "today" ? "bg-blue-500" : "bg-transparent"}`} />
                Hoje
              </button>
              <button 
                onClick={() => handleDateFilterSelect("7days")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  selectedFilter === "7days" ? (theme === "dark" ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-600") : ""
                } ${theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-100"}`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${selectedFilter === "7days" ? "bg-blue-500" : "bg-transparent"}`} />
                Últimos 7 dias
              </button>
              <button 
                onClick={() => handleDateFilterSelect("30days")}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  selectedFilter === "30days" ? (theme === "dark" ? "bg-blue-600/20 text-blue-400" : "bg-blue-50 text-blue-600") : ""
                } ${theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-100"}`}
              >
                <div className={`h-1.5 w-1.5 rounded-full ${selectedFilter === "30days" ? "bg-blue-500" : "bg-transparent"}`} />
                Últimos 30 dias
              </button>
            </div>
          )}
        </div>

        {loggedUser && (
          <div className="relative" ref={profileMenuRef}>
            <button 
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-extrabold flex items-center justify-center text-xs shadow-md shadow-blue-500/15 hover:scale-105 transition-transform cursor-pointer shrink-0 border border-blue-400/25 select-none"
            >
              {loggedUser.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
            </button>

            {profileMenuOpen && (
              <div className={`absolute right-0 mt-2 w-56 rounded-2xl border p-2 shadow-xl backdrop-blur-xl z-30 animate-fade-in ${
                theme === "dark" 
                  ? "bg-[#101422]/95 border-slate-800/50 shadow-black/60 text-slate-200" 
                  : "bg-white/95 border-slate-200 shadow-slate-200/55 text-slate-700"
              }`}>
                <div className="px-3 py-2.5 border-b border-slate-800/20 mb-1.5">
                  <p className={`text-xs font-bold truncate ${theme === "dark" ? "text-slate-100" : "text-slate-800"}`}>
                    {loggedUser.name}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate font-semibold">
                    {loggedUser.email}
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setProfileMenuOpen(false);
                    window.location.href = "/perfil";
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Meu Perfil
                </button>

                <button 
                  onClick={() => {
                    showToast("Abrindo configurações...", "info");
                    setProfileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    theme === "dark" ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                  Configurações
                </button>

                <div className={`border-t my-1.5 ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}></div>

                <button 
                  onClick={() => {
                    localStorage.removeItem("finseven-logged-user");
                    showToast("Sessão encerrada com sucesso!", "success");
                    setProfileMenuOpen(false);
                    window.location.href = "/login";
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
