#!/bin/bash

# Inicia o backend Express na porta 3000
echo "🚀 Iniciando backend Express..."
node server.js &
BACKEND_PID=$!

# Aguarda o backend iniciar
sleep 2

# Inicia o frontend Vite
echo "🚀 Iniciando frontend Vite..."
npm run dev:vite

# Cleanup ao finalizar
trap "kill $BACKEND_PID" EXIT
