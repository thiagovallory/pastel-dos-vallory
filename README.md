# Pastel dos Vallory

Sistema de gerenciamento de vendas de pastel.

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Como Executar](#como-executar)
- [Fluxo de Uso](#fluxo-de-uso)
- [API Backend](#api-backend)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Licença](#licença)

---

## Sobre o Projeto

O **Pastel dos Vallory** é um sistema web para controle de pedidos de pastel, pensado para facilitar o atendimento, organização e administração de sabores e pedidos em tempo real.

---

## Funcionalidades

### Usuário

- Visualização dos sabores disponíveis para venda.
- Seleção de quantidades de cada sabor.
- Cálculo automático do valor total do pedido.
- Envio de pedidos para a cozinha.
- Visualização do status dos pedidos (pendente/feito).

### Administrador

- Visualização e gerenciamento dos pedidos em tempo real.
- Marcação de pedidos como "feito" ou "pendente".
- Edição das quantidades de cada sabor em pedidos já realizados.
- Cadastro de novos sabores.
- Marcação de quais sabores estão sendo feitos no momento.
- Controle de estoque (quantidade disponível de cada sabor).

---

## Estrutura do Projeto

```
pastel-dos-vallory/
  backend/    # API Node.js + Express + SQLite
  frontend/   # Aplicação React (Vite)
```

---

## Como Executar

### Pré-requisitos

- Node.js (v18+ recomendado)
- npm

### Backend

```bash
cd backend
npm install
node index.js
```

O backend será iniciado em `http://localhost:3001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend será iniciado em modo desenvolvimento (Vite), normalmente em `http://localhost:5173`.

---

## Fluxo de Uso

### Usuário

1. Acessa a tela inicial e visualiza os sabores disponíveis.
2. Seleciona a quantidade desejada de cada sabor.
3. Visualiza o valor total do pedido.
4. Envia o pedido.
5. Pode acompanhar o status dos pedidos realizados.

### Administrador

1. Acessa a tela de administração de pedidos.
2. Visualiza todos os pedidos em tempo real.
3. Marca pedidos como "feito" ou "pendente".
4. Pode editar quantidades de sabores em pedidos.
5. Acessa a tela de administração de sabores para adicionar novos sabores, marcar sabores em produção e ajustar estoque.

---

## API Backend

### Endpoints principais

- `POST /api/pedidos`  
  Cria um novo pedido.  
  **Body:** `{ sabor_1: 2, sabor_2: 0, ... }`

- `GET /api/pedidos`  
  Lista todos os pedidos, incluindo status e itens.

- `PATCH /api/pedidos/:id/feito`  
  Marca um pedido como feito ou pendente.  
  **Body:** `{ feito: 1 }` ou `{ feito: 0 }`

- `PATCH /api/pedidos/:pedidoId/sabor/:saborId`  
  Atualiza a quantidade de um sabor em um pedido.

- `GET /api/sabores`  
  Lista todos os sabores cadastrados.

- `POST /api/sabores`  
  Adiciona um novo sabor.  
  **Body:** `{ nome: "Queijo" }`

- `PATCH /api/sabores/:id`  
  Atualiza informações de um sabor (fazendo, quantidade).

---

## Tecnologias Utilizadas

- **Frontend:** React, Vite, React Router, React Swipeable
- **Backend:** Node.js, Express, SQLite, CORS
- **Banco de Dados:** SQLite

---

## Licença

Este projeto está sob a licença MIT.

# pastel-dos-vallory
