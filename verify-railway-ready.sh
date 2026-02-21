#!/bin/bash

# Verificação Pré-Deploy Railway
# Execute: chmod +x verify-railway-ready.sh && ./verify-railway-ready.sh

echo "🔍 Verificando arquivos críticos para Railway..."
echo ""

ERRORS=0

# 1. server.js
if [ -f "server.js" ]; then
    echo "✅ server.js existe"
    if grep -q "express" server.js && grep -q "PORT" server.js; then
        echo "   ✓ Express configurado"
        echo "   ✓ PORT configurado"
    else
        echo "   ❌ server.js incompleto"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "❌ server.js NÃO ENCONTRADO"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 2. package.json
if [ -f "package.json" ]; then
    echo "✅ package.json existe"
    if grep -q '"express"' package.json; then
        echo "   ✓ Express nas dependências"
    else
        echo "   ❌ Express faltando"
        ERRORS=$((ERRORS + 1))
    fi
    if ! grep -q '"wrangler"' package.json; then
        echo "   ✓ Wrangler removido"
    else
        echo "   ⚠️  Wrangler ainda presente (OK se não causar erro)"
    fi
else
    echo "❌ package.json NÃO ENCONTRADO"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 3. package-lock.json
if [ -f "package-lock.json" ]; then
    SIZE=$(stat -f%z "package-lock.json" 2>/dev/null || stat -c%s "package-lock.json" 2>/dev/null)
    echo "✅ package-lock.json existe (${SIZE} bytes)"
    if grep -q '"express"' package-lock.json; then
        echo "   ✓ Express no lock file"
    else
        echo "   ❌ Express faltando no lock"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "❌ package-lock.json NÃO ENCONTRADO"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 4. railway.json
if [ -f "railway.json" ]; then
    echo "✅ railway.json existe"
    if grep -q "legacy-peer-deps" railway.json; then
        echo "   ✓ --legacy-peer-deps configurado"
    else
        echo "   ⚠️  --legacy-peer-deps faltando (pode causar erro)"
    fi
    if grep -q "node server.js" railway.json; then
        echo "   ✓ Start command correto"
    else
        echo "   ❌ Start command incorreto"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "❌ railway.json NÃO ENCONTRADO"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 5. tsconfig.json
if [ -f "tsconfig.json" ]; then
    echo "✅ tsconfig.json existe"
    if grep -q "tsconfig.worker" tsconfig.json; then
        echo "   ❌ Ainda referencia tsconfig.worker.json (vai causar erro)"
        ERRORS=$((ERRORS + 1))
    else
        echo "   ✓ Sem referência a tsconfig.worker"
    fi
    if grep -q "worker-configuration" tsconfig.json; then
        echo "   ❌ Ainda referencia worker-configuration.d.ts (vai causar erro)"
        ERRORS=$((ERRORS + 1))
    else
        echo "   ✓ Sem referência a worker-configuration"
    fi
else
    echo "❌ tsconfig.json NÃO ENCONTRADO"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 6. vite.config.ts
if [ -f "vite.config.ts" ]; then
    echo "✅ vite.config.ts existe"
    if grep -q "cloudflare" vite.config.ts; then
        echo "   ⚠️  Ainda menciona cloudflare (verificar se importado)"
    else
        echo "   ✓ Cloudflare plugin removido"
    fi
else
    echo "❌ vite.config.ts NÃO ENCONTRADO"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# 7. Git status
echo "📝 Status Git:"
if git rev-parse --git-dir > /dev/null 2>&1; then
    UNCOMMITTED=$(git status --porcelain | wc -l)
    if [ "$UNCOMMITTED" -eq "0" ]; then
        echo "   ✓ Todos os arquivos commitados"
    else
        echo "   ⚠️  $UNCOMMITTED arquivo(s) não commitado(s)"
        echo ""
        echo "   Arquivos pendentes:"
        git status --short | head -10
    fi
    
    echo ""
    echo "   Último commit:"
    git log --oneline -1
else
    echo "   ❌ Não é um repositório Git"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "================================"

if [ "$ERRORS" -eq "0" ]; then
    echo "✅ PRONTO PARA DEPLOY!"
    echo ""
    echo "Execute agora:"
    echo "  git push origin main"
    echo ""
    echo "Railway vai:"
    echo "  1. npm install --legacy-peer-deps"
    echo "  2. npm run build"
    echo "  3. node server.js"
    exit 0
else
    echo "❌ $ERRORS ERRO(S) ENCONTRADO(S)"
    echo ""
    echo "Corrija os erros acima antes de fazer deploy."
    exit 1
fi
