"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Form States
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  // Sync and load theme
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
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
  }, [theme]);

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

  // CPF masking logic
  const handleCpfChange = (val: string) => {
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

    setCpf(formatted);
  };

  // Switch between tabs
  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    // Reset fields
    setNome("");
    setCpf("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  // Submit handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      showToast("Por favor, preencha um CPF válido com 11 dígitos.", "error");
      return;
    }

    if (password.length < 6) {
      showToast("A senha deve ter no mínimo 6 caracteres.", "error");
      return;
    }

    // Get current registered users
    const usersJson = localStorage.getItem("finseven-users");
    let users = usersJson ? JSON.parse(usersJson) : [];

    if (activeTab === "register") {
      if (!nome.trim()) {
        showToast("Por favor, preencha seu nome.", "error");
        return;
      }

      if (!email.includes("@")) {
        showToast("Por favor, preencha um e-mail válido.", "error");
        return;
      }

      if (password !== confirmPassword) {
        showToast("As senhas não coincidem.", "error");
        return;
      }

      // Check if CPF is already registered
      const userExists = users.find((u: any) => u.cpf === cleanCpf);
      if (userExists) {
        showToast("Este CPF já está cadastrado no sistema.", "error");
        return;
      }

      const newUser = {
        name: nome.trim(),
        cpf: cleanCpf,
        email: email.trim(),
        password: password
      };

      // Save user to simulated registry
      users.push(newUser);
      localStorage.setItem("finseven-users", JSON.stringify(users));

      // Authenticate active session
      localStorage.setItem("finseven-logged-user", JSON.stringify({
        name: newUser.name,
        cpf: newUser.cpf,
        email: newUser.email
      }));

      showToast("Cadastro realizado com sucesso! Bem-vindo.", "success");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } else {
      // Login flow
      const matchedUser = users.find((u: any) => u.cpf === cleanCpf && u.password === password);

      if (!matchedUser) {
        // Fallback default admin user if database is empty to ease initial usage
        if (cleanCpf === "12345678900" && password === "admin123") {
          const defaultAdmin = {
            name: "Administrador FinSeven",
            cpf: "12345678900",
            email: "admin@finseven.com"
          };
          localStorage.setItem("finseven-logged-user", JSON.stringify(defaultAdmin));
          
          // Seed the users database if empty
          if (users.length === 0) {
            localStorage.setItem("finseven-users", JSON.stringify([{ ...defaultAdmin, password: "admin123" }]));
          }

          showToast("Login administrativo realizado com sucesso!", "success");
          setTimeout(() => {
            router.push("/");
          }, 1000);
          return;
        }

        showToast("CPF ou senha inválidos.", "error");
        return;
      }

      // Authenticate session
      localStorage.setItem("finseven-logged-user", JSON.stringify({
        name: matchedUser.name,
        cpf: matchedUser.cpf,
        email: matchedUser.email
      }));

      showToast("Login realizado com sucesso!", "success");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col justify-center items-center p-4 transition-colors duration-500 overflow-hidden font-sans relative ${
      theme === "dark" ? "bg-[#0b0f19] text-slate-100" : "bg-[#f8fafc] text-slate-800"
    }`}>
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Toast Alert */}
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

      {/* Main Container */}
      <div className="w-full max-w-md z-10 space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <img
              src="/logo.png"
              alt="FinSeven Logo"
              className="h-20 w-auto object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
          <p className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
            Sua gestão financeira inteligente, simplificada.
          </p>
        </div>

        {/* Auth Glassmorphic Card */}
        <div className={`backdrop-blur-xl border rounded-3xl p-8 shadow-2xl transition-all duration-300 ${
          theme === "dark" ? "bg-[#101422]/65 border-slate-800/40 shadow-black/45" : "bg-white/80 border-slate-200 shadow-slate-200/50"
        }`}>
          {/* Tab Selector */}
          <div className={`grid grid-cols-2 p-1 rounded-2xl mb-6 ${
            theme === "dark" ? "bg-[#070b13]/60" : "bg-slate-100"
          }`}>
            <button
              onClick={() => handleTabChange("login")}
              className={`py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "login"
                  ? theme === "dark"
                    ? "bg-blue-600/15 border border-blue-500/20 text-blue-400 shadow-md"
                    : "bg-white border border-slate-200 text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-400"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => handleTabChange("register")}
              className={`py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "register"
                  ? theme === "dark"
                    ? "bg-blue-600/15 border border-blue-500/20 text-blue-400 shadow-md"
                    : "bg-white border border-slate-200 text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-400"
              }`}
            >
              Novo Cadastro
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "register" && (
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
                  placeholder="Seu nome"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none ${
                    theme === "dark"
                      ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 placeholder-slate-600"
                      : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200 placeholder-slate-400"
                  }`}
                />
              </div>
            )}

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
                    ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 placeholder-slate-600"
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200 placeholder-slate-400"
                }`}
              />
            </div>

            {activeTab === "register" && (
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
                      ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 placeholder-slate-600"
                      : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200 placeholder-slate-400"
                  }`}
                />
              </div>
            )}

            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                theme === "dark" ? "text-slate-400" : "text-slate-500"
              }`}>
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none ${
                  theme === "dark"
                    ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 placeholder-slate-600"
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200 placeholder-slate-400"
                }`}
              />
            </div>

            {activeTab === "register" && (
              <div>
                <label className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                  theme === "dark" ? "text-slate-400" : "text-slate-500"
                }`}>
                  Confirmar Senha
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all outline-none ${
                    theme === "dark"
                      ? "bg-[#070b13] border-slate-800/70 text-slate-200 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 placeholder-slate-600"
                      : "bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-200 placeholder-slate-400"
                  }`}
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md hover:scale-[1.005] active:scale-[0.995] cursor-pointer mt-6 shadow-blue-500/10"
            >
              {activeTab === "login" ? "Acessar Carteira" : "Criar Minha Conta"}
            </button>
          </form>
        </div>

        {/* Demo Tip Card */}
        {activeTab === "login" && (
          <div className={`p-4 rounded-2xl border text-center transition-all ${
            theme === "dark" ? "bg-slate-900/40 border-slate-800/30 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
          }`}>
            <span className="text-[10px] font-bold uppercase block mb-1 text-cyan-400">Dica de Acesso Rápido</span>
            <p className="text-xs font-semibold leading-relaxed">
              CPF de teste: <span className="font-mono text-blue-400 select-all">12345678900</span> &bull; Senha: <span className="font-mono text-blue-400 select-all">admin123</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
