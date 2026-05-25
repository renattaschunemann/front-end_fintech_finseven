import React from "react";

export interface Transaction {
  id: string;
  date: string;
  category: string;
  description: string;
  account: string;
  value: number;
  type: "Receitas" | "Despesas" | "Investimentos";
}

export interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  theme: "dark" | "light";
  showToast: (msg: string, type: "success" | "info" | "error") => void;
}

export interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
  theme: "dark" | "light";
  onAddClick?: () => void;
  showToast: (msg: string, type: "success" | "info" | "error") => void;
  onDateFilterChange?: (filter: "today" | "7days" | "30days" | "all") => void;
}

export interface StatsCardsProps {
  stats: {
    saldoAtual: number;
    receitasDoMes: number;
    despesasDoMes: number;
    investimentosDoMes: number;
    receitasLabel?: string;
    despesasLabel?: string;
    investimentosLabel?: string;
  };
  formatCurrency: (val: number) => string;
}

export interface ChartProps {
  chartData: Array<{
    name: string;
    receitas: number;
    despesas: number;
  }>;
  theme: "dark" | "light";
  formatCurrency: (val: number) => string;
}

export interface TransactionTableProps {
  transactions: Transaction[];
  theme: "dark" | "light";
  onEditClick: (tx: Transaction) => void;
  onDeleteClick: (id: string) => void;
  formatCurrency: (val: number) => string;
  formatDateForDisplay: (dateStr: string) => string;
  onQuickAddClick?: (type: "Receitas" | "Despesas" | "Investimentos") => void;
}

export interface AddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formType: "Receitas" | "Despesas" | "Investimentos";
  setFormType: (type: "Receitas" | "Despesas" | "Investimentos") => void;
  formDescription: string;
  setFormDescription: (desc: string) => void;
  formValue: string;
  setFormValue: (val: string) => void;
  formDate: string;
  setFormDate: (date: string) => void;
  formAccount: string;
  setFormAccount: (acc: string) => void;
  formCategory: string;
  setFormCategory: (cat: string) => void;
  theme: "dark" | "light";
}

export interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formType: "Receitas" | "Despesas" | "Investimentos";
  setFormType: (type: "Receitas" | "Despesas" | "Investimentos") => void;
  formDescription: string;
  setFormDescription: (desc: string) => void;
  formValue: string;
  setFormValue: (val: string) => void;
  formDate: string;
  setFormDate: (date: string) => void;
  formAccount: string;
  setFormAccount: (acc: string) => void;
  formCategory: string;
  setFormCategory: (cat: string) => void;
  theme: "dark" | "light";
}
