# FinSeven - Sistema de Controle Financeiro Pessoal 🚀

O **FinSeven** é um sistema completo de gestão de finanças pessoais desenvolvido como parte do projeto integrador da FIAP. Ele permite ao usuário realizar o controle de fluxo de caixa (Receitas, Despesas e Investimentos), gerenciar suas Contas Bancárias e customizar Categorias com persistência dinâmica no banco de dados Oracle Cloud.

---

## 🛠️ Tecnologias Utilizadas

### Frontend:
* **Framework**: Next.js 15 (React 19)
* **Estilização**: Vanilla CSS & TailwindCSS (para transições dinâmicas e layouts responsivos)
* **Ferramenta de Build**: Turbopack (`next dev`)

### Backend:
* **Framework**: Spring Boot (Java 17)
* **Persistência**: Spring Data JPA (Hibernate)
* **Banco de Dados**: Oracle Cloud Database (com configuração de Sequences)

---

## 🔑 Dados de Autenticação para Testes (Login)

Para fins de avaliação rápida e testes acadêmicos, definimos as seguintes credenciais padrão (Admin bypass):

* **E-mail**: `admin@finseven.com`
* **Senha**: `admin123`

> 💡 **Nota**: O usuário também pode usar a guia **"Cadastrar"** na própria tela de autenticação para registrar novas contas. O sistema enviará os dados para o endpoint `POST /api/usuarios`, salvando-os de forma 100% dinâmica no banco de dados Oracle, permitindo realizar o login com as credenciais recém-criadas.

---

## 💎 Funcionalidades Integradas de CRUD

* **Contas Bancárias (`/conta-bancaria`)**: Cadastrar, Listar e Deletar contas de bancos diretamente na base Oracle.
* **Transações (`/transacao`, `/receitas`, `/despesas`, `/investimentos`)**: Lançar transações e visualizar históricos detalhados integrados dinamicamente com filtros por datas e categorias.
* **Categorias Customizadas (`/categorias`)**: Cadastro e exclusão de categorias dinâmicas que se integram instantaneamente em todas as listas de seleção de transações da plataforma.
