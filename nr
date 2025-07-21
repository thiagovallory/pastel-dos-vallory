#!/bin/bash

# Script personalizado para o projeto Pastel dos Vallory
# Uso: ./nr [comando]

case "$1" in
  "dev"|"")
    echo "🚀 Iniciando frontend e backend..."
    npm run dev
    ;;
  "host")
    echo "🌐 Iniciando com --host (acesso via rede)..."
    npm run dev:host
    ;;
  "install")
    echo "📦 Instalando todas as dependências..."
    npm run install:all
    ;;
  "build")
    echo "🔨 Fazendo build do frontend..."
    npm run build
    ;;
  "start")
    echo "▶️  Iniciando apenas o backend..."
    npm run start
    ;;
  *)
    echo "❓ Comandos disponíveis:"
    echo "  ./nr dev     - Inicia frontend e backend"
    echo "  ./nr host    - Inicia com --host (acesso via rede)"
    echo "  ./nr install - Instala todas as dependências"
    echo "  ./nr build   - Faz build do frontend"
    echo "  ./nr start   - Inicia apenas o backend"
    ;;
esac 