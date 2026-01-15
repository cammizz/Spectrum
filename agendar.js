document.addEventListener('DOMContentLoaded', () => {
    
    // --- Lógica do Modo Escuro ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    // O "if" abaixo previne que o site quebre se o botão não existir
    if (themeToggle && sunIcon && moonIcon) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                sunIcon.style.display = 'block';
                moonIcon.style.display = 'none';
            } else {
                sunIcon.style.display = 'none';
                moonIcon.style.display = 'block';
            }
        });
    }

    // --- Lógica do Filtro e Dropdown ---
    const filtroBotoes = document.querySelectorAll('.filtro-btn');
    const cartoesMedicos = document.querySelectorAll('.medicos');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    const todosBotao = document.querySelector('.filtro-btn[data-filtro="todos"]');

    // Função auxiliar para fechar todos os dropdowns
    const fecharTodosDropdowns = () => {
        dropdownToggles.forEach(toggle => toggle.classList.remove('open'));
    };

    // Toggle Dropdown
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const estaAberto = toggle.classList.contains('open');
            fecharTodosDropdowns(); // Fecha outros para abrir este
            if (!estaAberto) toggle.classList.add('open');
        });
    });

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-toggle')) {
            fecharTodosDropdowns();
        }
    });

    // Filtragem de Médicos
    filtroBotoes.forEach(botao => {
        botao.addEventListener('click', (e) => {
            e.stopPropagation();
            fecharTodosDropdowns();

            // Atualiza classe visual do botão
            filtroBotoes.forEach(btn => btn.classList.remove('active'));
            botao.classList.add('active');

            const filtroValor = botao.dataset.filtro;

            cartoesMedicos.forEach(cartao => {
                const deveMostrar = filtroValor === 'todos' || cartao.classList.contains(filtroValor);
                // DICA: Use display flex ou block dependendo do seu CSS original.
                cartao.style.display = deveMostrar ? 'flex' : 'none';
            });
        });
    });

    // Ativa filtro inicial (com verificação de segurança)
    if (todosBotao) todosBotao.click();


    // =========================================
    // 2. Botão Agendar / Contato
    // =========================================
    // Usar delegação de eventos seria melhor, mas mantive sua lógica corrigida
    document.querySelectorAll('.agendar').forEach(botao => {
        botao.addEventListener('click', () => {
            const coluna = botao.closest('.coluna');
            if (!coluna) return; // Segurança

            const infoContato = coluna.querySelector('.contato-info');
            if (infoContato) {
                infoContato.style.display = 'flex';
                botao.style.display = 'none';
            }
        });
    });

    document.querySelectorAll('.fechar-contato').forEach(botao => {
        botao.addEventListener('click', () => {
            const contato = botao.closest('.contato-info');
            const coluna = contato ? contato.closest('.coluna') : null;

            if (contato && coluna) {
                contato.style.display = 'none';
                const btnAgendar = coluna.querySelector('.agendar');
                if (btnAgendar) btnAgendar.style.display = 'block';
            }
        });
    });


    // =========================================
    // 3. Grade de Dias (Calendário Dinâmico)
    // =========================================
    const grid = document.getElementById('grade');
    const elementoMes = document.getElementById('mes');
    const dataAtual = new Date();

    // Configura Mês Atual na Tela
    if (elementoMes) {
        const nomeMes = dataAtual.toLocaleString('pt-BR', { month: 'long' });
        elementoMes.textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
    }

    // Lógica de Cores (Estado)
    let corSelecionada = null;

    // --- CORREÇÃO: Seleção de Cor via JS em vez de inline HTML ---
    // Supondo que seus botões de cor tenham a classe .btn-cor e um data-cor="feliz"
    const botoesCor = document.querySelectorAll('.btn-cor'); 
    
    // Se você usa botões HTML, adicione listeners neles. 
    // Se não tiver botões com classe, mantive a função global abaixo como fallback.
    botoesCor.forEach(btn => {
        btn.addEventListener('click', () => {
            corSelecionada = btn.dataset.cor; // ou o valor que você usa
            // Opcional: feedback visual no botão de cor selecionado
        });
    });

    // Mantendo compatibilidade com seu HTML antigo (onclick="mudarCor(...)")
    window.mudarCor = function (cor) {
        corSelecionada = cor;
    };

    // --- CORREÇÃO: Cálculo exato de dias no mês ---
    if (grid) {
        grid.innerHTML = ''; // Limpa caso rode duas vezes
        const diasNoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0).getDate();

        for (let i = 1; i <= diasNoMes; i++) {
            const dia = document.createElement('div');
            dia.textContent = i;
            dia.classList.add('dia');

            dia.addEventListener('click', function() {
                if (!corSelecionada) {
                    alert('Escolha uma cor primeiro 😊');
                    return;
                }
                // Remove as classes de humor antigas (ajuste conforme suas classes reais)
                this.classList.remove('feliz', 'triste', 'raiva', 'neutro'); 
                this.classList.add(corSelecionada);
            });

            grid.appendChild(dia);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. CONFIGURAÇÕES INICIAIS E CHAVE DE SALVAMENTO
    // =========================================================
    const grid = document.getElementById('grade');
    const elementoMes = document.getElementById('mes');
    const dataAtual = new Date();
    
    // Chave única para salvar (ex: humor-2024-0)
    const chaveLocalStorage = `humor-${dataAtual.getFullYear()}-${dataAtual.getMonth()}`;

    let corSelecionada = null;
    let dadosSalvos = JSON.parse(localStorage.getItem(chaveLocalStorage)) || {};

    // Escreve o Mês
    if (elementoMes) {
        const nomeMes = dataAtual.toLocaleString('pt-BR', { month: 'long' });
        elementoMes.textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
    }

    // =========================================================
    // 2. FUNÇÃO DE SELEÇÃO DE HUMOR
    // =========================================================
    window.mudarCor = function (cor) {
        corSelecionada = cor;

        document.querySelectorAll('.legenda .btn').forEach(btn => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = 'none';
        });

        if (cor !== 'reset') {
            const btnAtivo = document.querySelector(`.btn-${cor}`);
            if (btnAtivo) {
                btnAtivo.style.transform = 'scale(1.15)';
                btnAtivo.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
            }
        }
    };

    // =========================================================
    // 3. FUNÇÃO DE SALVAR NO NAVEGADOR
    // =========================================================
    function salvarDados() {
        localStorage.setItem(chaveLocalStorage, JSON.stringify(dadosSalvos));
        atualizarResumo();
    }

    // =========================================================
    // 4. FUNÇÃO QUE CALCULA O RESUMO
    // =========================================================
    function atualizarResumo() {
        const contagem = { feliz: 0, triste: 0, raiva: 0, neutro: 0 };
        let totalMarcados = 0;

        Object.values(dadosSalvos).forEach(humor => {
            if (contagem.hasOwnProperty(humor)) {
                contagem[humor]++;
                totalMarcados++;
            }
        });

        const elPredominante = document.getElementById('predominante');
        const elLista = document.getElementById('lista-estatisticas');
        const elAviso = document.getElementById('aviso-raiva');

        if (!elPredominante || !elLista) return;

        if (totalMarcados === 0) {
            elPredominante.textContent = "Nenhum registro";
            elLista.innerHTML = "";
            if(elAviso) elAviso.style.display = 'none';
            return;
        }

        const maiorValor = Math.max(contagem.feliz, contagem.triste, contagem.raiva, contagem.neutro);
        let textoHumor = "Misto 🤔";
        
        if (contagem.feliz === maiorValor) textoHumor = "Feliz 😊";
        else if (contagem.neutro === maiorValor) textoHumor = "Neutro 😐";
        else if (contagem.triste === maiorValor) textoHumor = "Triste 🙁";
        else if (contagem.raiva === maiorValor) textoHumor = "Raiva 😠";

        elPredominante.textContent = textoHumor;

        elLista.innerHTML = `
            <li style="color: #4CAF50">😊 Feliz: ${contagem.feliz}</li>
            <li style="color: #FF9800">😐 Neutro: ${contagem.neutro}</li>
            <li style="color: #2196F3">🙁 Triste: ${contagem.triste}</li>
            <li style="color: #f44336">😠 Raiva: ${contagem.raiva}</li>
        `;

        if (elAviso) {
            if (contagem.raiva >= 4) {
                elAviso.style.display = 'block';
                elAviso.innerHTML = `⚠️ Atenção: ${contagem.raiva} dias de estresse. Respire fundo!`;
            } else {
                elAviso.style.display = 'none';
            }
        }
    }

    // =========================================================
    // 5. CRIAÇÃO DO CALENDÁRIO
    // =========================================================
    if (grid) {
        grid.innerHTML = '';
        const diasNoMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0).getDate();

        for (let i = 1; i <= diasNoMes; i++) {
            const dia = document.createElement('div');
            dia.textContent = i;
            dia.classList.add('dia');

            if (dadosSalvos[i]) {
                dia.classList.add(dadosSalvos[i]);
            }

            dia.addEventListener('click', function() {
                if (!corSelecionada) {
                    alert('Por favor, escolha um humor nos botões acima primeiro!');
                    return;
                }

                this.classList.remove('feliz', 'triste', 'raiva', 'neutro');

                if (corSelecionada === 'reset') {
                    delete dadosSalvos[i];
                } else {
                    this.classList.add(corSelecionada);
                    dadosSalvos[i] = corSelecionada;
                }
                salvarDados();
            });

            grid.appendChild(dia);
        }
        atualizarResumo();
    }


});