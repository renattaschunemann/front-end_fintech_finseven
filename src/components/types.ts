export interface Transaction {
  id: string;
  date: string;
  category: string;
  description: string;
  account: string;
  value: number;
  type: "Receitas" | "Despesas";
}
