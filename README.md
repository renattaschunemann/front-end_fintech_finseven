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

## ⚙️ Instruções de Inicialização

Certifique-se de ter o **Node.js (v18+)** e o **Java JDK 17+** instalados na sua máquina.

### 1. Inicializando o Backend (Spring Boot)

1. Abra um terminal na pasta do backend `Fase_7Integration_finseven/Fintech-FinSeven`.
2. Certifique-se de que as configurações de conexão com o banco de dados Oracle estão corretas no arquivo `src/main/resources/application.properties` (caso utilize um banco local ou cloud específico).
3. Execute o comando Maven Wrapper para compilar e iniciar o servidor Spring Boot:

   **No Windows (PowerShell/CMD):**
   ```bash
   .\mvnw spring-boot:run
   ```

   **No Linux/macOS:**
   ```bash
   chmod +x mvnw
   ./mvnw spring-boot:run
   ```
4. O servidor do backend estará rodando no endereço: `http://localhost:8080`

---

### 2. Inicializando o Frontend (Next.js)

1. Abra um terminal na pasta do frontend `front-end_fintech_finseven`.
2. Instale as dependências de pacotes do Node.js:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento do Next.js:
   ```bash
   npm run dev
   ```
4. O frontend estará disponível e rodando no endereço: `http://localhost:3000`

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
