import { Transaction } from "@/interfaces";

const BASE_URL = "http://localhost:8080/api";

// Helpers to map banks/accounts to IDs
export const getBancoId = (accountName: string): number => {
  const acc = accountName.toLowerCase();
  if (acc.includes("itau") || acc.includes("itaú")) return 1;
  if (acc.includes("brasil") || acc.includes("bb")) return 2;
  return 3; // Default Outros
};

// Dynamically resolve bank ID from name
export const resolveBancoId = async (accountName: string): Promise<number> => {
  try {
    const res = await fetch(`${BASE_URL}/bancos`);
    if (res.ok) {
      const data = await res.json();
      const matched = data.find((b: any) => b.nome.toLowerCase() === accountName.toLowerCase() || b.nome.toLowerCase().includes(accountName.toLowerCase()) || accountName.toLowerCase().includes(b.nome.toLowerCase()));
      if (matched) {
        return matched.idBanco;
      }
    }
  } catch (e) {
    console.error("Erro ao resolver ID do banco:", e);
  }
  // Fallback to static mapping
  return getBancoId(accountName);
};

export const getAccountNameFromId = (id: number): string => {
  if (id === 1) return "Itaú";
  if (id === 2) return "Banco do Brasil";
  return "Outros";
};

// Helpers to map categories to IDs
export const getCategoriaId = (category: string): number => {
  const mapping: Record<string, number> = {
    // Receitas
    "Salário": 1,
    "Comissão": 2,
    "Hora Extra": 3,
    "Bônus": 4,
    "Freelancer": 5,
    "Freelance": 5,
    "Rendimentos": 6,
    // Despesas
    "Saúde": 10,
    "Escola": 11,
    "Transporte": 12,
    "Alimentação": 13,
    "Supermercado": 14,
    "Lazer": 15,
    "Água": 16,
    "Luz": 17,
    "Internet": 18,
    "Aluguel": 19,
    "Cartão de Crédito": 20,
    // Investimentos
    "Tesouro Direto": 30,
    "CDB": 31,
    "LCI/LCA": 32,
    "Poupança": 33,
    "Debêntures": 34,
    "Ações": 35,
    "FIIs": 36,
    "ETFs": 37,
    "BDRs": 38,
    "Bitcoin": 39,
    "Ethereum": 40,
    "Solana": 41,
    "Stablecoins": 42,
  };
  return mapping[category] || 99; // 99 for Outros
};

export const getCategoryNameFromId = (id: number): string => {
  const revMapping: Record<number, string> = {
    1: "Salário",
    2: "Comissão",
    3: "Hora Extra",
    4: "Bônus",
    5: "Freelancer",
    6: "Rendimentos",
    10: "Saúde",
    11: "Escola",
    12: "Transporte",
    13: "Alimentação",
    14: "Supermercado",
    15: "Lazer",
    16: "Água",
    17: "Luz",
    18: "Internet",
    19: "Aluguel",
    20: "Cartão de Crédito",
    30: "Tesouro Direto",
    31: "CDB",
    32: "LCI/LCA",
    33: "Poupança",
    34: "Debêntures",
    35: "Ações",
    36: "FIIs",
    37: "ETFs",
    38: "BDRs",
    39: "Bitcoin",
    40: "Ethereum",
    41: "Solana",
    42: "Stablecoins",
  };
  return revMapping[id] || "Outros";
};

// Map backend structures to frontend Transaction interface
const mapBackendTransacaoToFrontend = (item: any): Transaction => {
  const isReceita = item.tipo === "RECEITA";
  return {
    id: `tx-api-${item.id}`,
    date: item.data,
    category: getCategoryNameFromId(item.idCategoria),
    description: item.descricao || "",
    account: getAccountNameFromId(item.idBanco),
    value: isReceita ? Math.abs(item.valor) : -Math.abs(item.valor),
    type: isReceita ? "Receitas" : "Despesas",
  };
};

const mapBackendInvestimentoToFrontend = (item: any): Transaction => {
  let category = "Outros";
  let description = item.produto || "";

  if (description.includes(" - ")) {
    const parts = description.split(" - ");
    category = parts[0];
    description = parts.slice(1).join(" - ");
  }

  return {
    id: `inv-api-${item.id}`,
    date: item.dataAplicacao,
    category: category,
    description: description,
    account: item.banco ? item.banco.nome : "Outros",
    value: Math.abs(item.valorAplicado),
    type: "Investimentos",
  };
};

// Fetch all transactions and investments from API
export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    const [txResponse, invResponse, bancosResponse] = await Promise.all([
      fetch(`${BASE_URL}/transacoes`),
      fetch(`${BASE_URL}/investimentos`),
      fetch(`${BASE_URL}/bancos`),
    ]);

    let bancosList: any[] = [];
    if (bancosResponse.ok) {
      bancosList = await bancosResponse.json();
    }

    const getBankName = (id: number): string => {
      const found = bancosList.find((b: any) => b.idBanco === id);
      return found ? found.nome : getAccountNameFromId(id);
    };

    let frontendTxs: Transaction[] = [];

    if (txResponse.ok) {
      const dbTxs = await txResponse.json();
      frontendTxs = frontendTxs.concat(dbTxs.map((item: any) => {
        const isReceita = item.tipo === "RECEITA";
        return {
          id: `tx-api-${item.id}`,
          date: item.data,
          category: getCategoryNameFromId(item.idCategoria),
          description: item.descricao || "",
          account: getBankName(item.idBanco),
          value: isReceita ? Math.abs(item.valor) : -Math.abs(item.valor),
          type: isReceita ? "Receitas" : "Despesas",
        };
      }));
    }

    if (invResponse.ok) {
      const dbInvs = await invResponse.json();
      frontendTxs = frontendTxs.concat(dbInvs.map(mapBackendInvestimentoToFrontend));
    }

    return frontendTxs.sort((a, b) => b.date.localeCompare(a.date));
  } catch (error) {
    console.error("Erro ao buscar transações da API:", error);
    throw error;
  }
};

// Create a new transaction (Receita, Despesa or Investimento)
export const createTransaction = async (tx: Omit<Transaction, "id">, userId: number): Promise<Transaction> => {
  try {
    const resolvedBancoId = await resolveBancoId(tx.account);

    if (tx.type === "Investimentos") {
      const payload = {
        produto: `${tx.category} - ${tx.description}`,
        valorAplicado: Math.abs(tx.value),
        taxaRendimento: 1.0,
        dataAplicacao: tx.date,
        banco: {
          idBanco: resolvedBancoId,
        },
        usuario: {
          id: userId,
        },
      };

      const res = await fetch(`${BASE_URL}/investimentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao criar investimento no servidor.");
      const data = await res.json();
      return mapBackendInvestimentoToFrontend(data);
    } else {
      const isReceita = tx.type === "Receitas";
      const endpoint = isReceita ? "receitas" : "despesas";
      const payload: any = {
        idBanco: resolvedBancoId,
        idCategoria: getCategoriaId(tx.category),
        valor: Math.abs(tx.value),
        data: tx.date,
        descricao: tx.description,
      };

      if (isReceita) {
        payload.origem = tx.category;
      } else {
        payload.formaPagamento = "Outros";
      }

      const res = await fetch(`${BASE_URL}/transacoes/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Erro ao criar ${tx.type.slice(0, -1).toLowerCase()} no servidor.`);
      const data = await res.json();
      return mapBackendTransacaoToFrontend(data);
    }
  } catch (error) {
    console.error("Erro ao criar transação:", error);
    throw error;
  }
};

// Update an existing transaction
export const updateTransaction = async (tx: Transaction, userId: number): Promise<Transaction> => {
  try {
    const rawId = tx.id.replace("tx-api-", "").replace("inv-api-", "");
    const resolvedBancoId = await resolveBancoId(tx.account);
    
    if (tx.type === "Investimentos") {
      const payload = {
        id: Number(rawId),
        produto: `${tx.category} - ${tx.description}`,
        valorAplicado: Math.abs(tx.value),
        taxaRendimento: 1.0,
        dataAplicacao: tx.date,
        banco: {
          idBanco: resolvedBancoId,
        },
        usuario: {
          id: userId,
        },
      };

      const res = await fetch(`${BASE_URL}/investimentos/${rawId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao atualizar investimento no servidor.");
      const data = await res.json();
      return mapBackendInvestimentoToFrontend(data);
    } else {
      const isReceita = tx.type === "Receitas";
      const endpoint = isReceita ? "receitas" : "despesas";
      const payload: any = {
        id: Number(rawId),
        idBanco: resolvedBancoId,
        idCategoria: getCategoriaId(tx.category),
        valor: Math.abs(tx.value),
        data: tx.date,
        descricao: tx.description,
      };

      if (isReceita) {
        payload.origem = tx.category;
      } else {
        payload.formaPagamento = "Outros";
      }

      const res = await fetch(`${BASE_URL}/transacoes/${endpoint}/${rawId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Erro ao atualizar ${tx.type.slice(0, -1).toLowerCase()} no servidor.`);
      const data = await res.json();
      return mapBackendTransacaoToFrontend(data);
    }
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    throw error;
  }
};

// Delete an existing transaction
export const deleteTransaction = async (txId: string, type: "Receitas" | "Despesas" | "Investimentos"): Promise<void> => {
  try {
    const rawId = txId.replace("tx-api-", "").replace("inv-api-", "");
    const endpoint = type === "Investimentos" ? `investimentos/${rawId}` : `transacoes/${rawId}`;

    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Erro ao deletar transação no servidor.");
  } catch (error) {
    console.error("Erro ao deletar transação:", error);
    throw error;
  }
};
