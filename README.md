# Pastel dos Vallory 🥟

Sistema de pedidos de pastéis com interface web responsiva para desktop e mobile.

## 🚀 Funcionalidades

- **Tela de Pedidos**: Interface para clientes fazerem pedidos
- **Tela de Administração**: Gerenciamento de sabores e valores
- **Lista de Pedidos**: Acompanhamento e controle de pedidos
- **Modo Escuro**: Interface adaptável com tema claro/escuro
- **Responsivo**: Funciona perfeitamente em desktop e mobile
- **Detecção Automática de IP**: Funciona automaticamente em redes locais

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🛠️ Instalação

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd pastel-dos-vallory
   ```

2. **Instale todas as dependências:**
   ```bash
   ./nr install
   ```
   ou
   ```bash
   npm run install:all
   ```

## 🚀 Como Executar

### **Comandos Rápidos (Recomendado):**

```bash
# Desenvolvimento local
./nr dev

# Acesso via rede (celular)
./nr host

# Apenas backend
./nr start

# Build do frontend
./nr build
```

### **Comandos NPM:**

```bash
# Desenvolvimento local
npm run dev

# Acesso via rede (celular)
npm run dev:host

# Apenas backend
npm run start

# Build do frontend
npm run build
```

## 🌐 Acesso

### **Desenvolvimento Local:**
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

### **Acesso via Rede (usando --host):**
- **Frontend:** http://192.168.x.x:5173 (IP da sua máquina)
- **Backend:** http://192.168.x.x:3001 (detectado automaticamente)

## 📱 Rotas da Aplicação

- **/** - Tela para pedir (página inicial)
- **/pedir** - Tela para pedir
- **/pedidos** - Lista de pedidos (controle)
- **/admin** - Administração de sabores

## 🗄️ Banco de Dados

O projeto usa SQLite com as seguintes tabelas:

- **sabores**: Nome, valor, status de produção
- **pedidos**: Pedidos realizados, valor total
- **itens_pedido**: Itens de cada pedido, valor unitário no momento da compra

### **Histórico de Valores:**
- Cada pedido registra o valor total no momento da compra
- Cada item registra o valor unitário no momento da compra
- Permite análise histórica mesmo se preços mudarem
- Facilita relatórios financeiros precisos

## 🎨 Interface

### **Tela de Pedidos:**
- Seleção de sabores disponíveis
- Controle de quantidades
- Cálculo automático do total
- Envio de pedidos

### **Administração:**
- Adicionar/editar sabores
- Definir valores
- Controlar disponibilidade
- Gerenciar quantidades

### **Lista de Pedidos:**
- Visualizar todos os pedidos
- Marcar como feito/pendente
- Editar quantidades
- Controle de status

## 🔧 Desenvolvimento

### **Estrutura do Projeto:**
```
pastel-dos-vallory/
├── frontend/          # React + Vite
├── backend/           # Node.js + Express
├── logs/              # Logs do sistema
├── package.json       # Scripts principais
└── nr                 # Script personalizado
```

### **Tecnologias:**
- **Frontend:** React, Vite, React Router
- **Backend:** Node.js, Express, SQLite
- **Estilização:** CSS inline (sem dependências externas)

## 📝 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `./nr dev` | Inicia frontend e backend |
| `./nr host` | Inicia com --host (acesso via rede) |
| `./nr install` | Instala todas as dependências |
| `./nr build` | Faz build do frontend |
| `./nr start` | Inicia apenas o backend |

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.

---

**Desenvolvido com ❤️ para o Pastel dos Vallory**
