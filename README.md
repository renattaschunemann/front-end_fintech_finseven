# FinSeven - Instruções e Autenticação 🚀

Este arquivo contém as especificações necessárias para a inicialização e teste do projeto integrador **FinSeven** (Frontend e Backend).

---

## ⚙️ 1. Instruções de Inicialização

### Backend (Spring Boot)
1. Certifique-se de ter o Java JDK 17+ instalado.
2. Abra o terminal na pasta `Fase_7Integration_finseven/Fintech-FinSeven`.
3. Inicie o servidor executando o comando Maven Wrapper:
   * **No Windows**: `.\mvnw spring-boot:run`
   * **No Linux/macOS**: `./mvnw spring-boot:run`
4. O servidor do backend estará rodando no endereço: `http://localhost:8080`

### Frontend (Next.js)
1. Certifique-se de ter o Node.js instalado.
2. Abra o terminal na pasta `front-end_fintech_finseven`.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. O frontend estará disponível e rodando no endereço: `http://localhost:3000`

---

## 🔑 2. Dados de Autenticação do Usuário de Teste (Login)

Para realizar os testes e a avaliação rápida da plataforma, utilize o usuário de teste padrão abaixo:

* **E-mail**: `admin@finseven.com`
* **Senha**: `admin123`

*Nota: Você também pode criar novas contas dinamicamente utilizando a aba "Cadastrar" na própria tela de autenticação, que persistirá os dados diretamente na base Oracle.*
