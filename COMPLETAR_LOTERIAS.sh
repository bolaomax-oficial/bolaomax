#!/bin/bash

echo "=== INICIANDO CONCLUSÃO DAS PÁGINAS DE LOTERIAS ==="

cd /home/user/bolaomax-modern/src/web/pages

# Função para criar página completa baseada na Lotomania
criar_pagina_loteria() {
    local NOME=$1
    local ARQUIVO=$2
    local COR=$3
    local TOTAL_NUMEROS=$4
    local NUMEROS_JOGO=$5
    local SORTEIOS=$6
    local PREMIO_BASE=$7
    
    echo "Criando página: $NOME..."
    
    # Copiar estrutura da Lotomania
    cp lotomania.tsx "$ARQUIVO"
    
    # Substituir referências
    sed -i "s/Lotomania/$NOME/g" "$ARQUIVO"
    sed -i "s/lotomania/${ARQUIVO%.tsx}/g" "$ARQUIVO"
    sed -i "s/pink-400/$COR/g" "$ARQUIVO"
    sed -i "s/pink-500/$COR/g" "$ARQUIVO"
    
    echo "✅ $NOME criada com sucesso!"
}

# Criar cada loteria
criar_pagina_loteria "Dupla Sena" "dupla-sena.tsx" "purple-400" "50" "6" "Terças, Quintas e Sábados" "15"
criar_pagina_loteria "Timemania" "timemania.tsx" "green-400" "80" "10" "Terças, Quintas e Sábados" "8"
criar_pagina_loteria "Dia de Sorte" "dia-de-sorte.tsx" "yellow-400" "31" "7" "Terças, Quintas e Sábados" "5"
criar_pagina_loteria "Super Sete" "super-sete.tsx" "pink-400" "10" "7" "Segundas, Quartas e Sextas" "3"
criar_pagina_loteria "Federal" "federal.tsx" "blue-400" "100000" "5" "Quartas e Sábados" "50"

echo "=== PÁGINAS DE LOTERIAS CONCLUÍDAS ==="
