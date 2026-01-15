const canvas = document.getElementById("puzzleCanvas");
const ctx = canvas.getContext("2d");

const img = new Image();
img.src = "hora_planodefundo.jpg"; 

// --- CONFIGURAÇÕES ---
const cols = 6; 
const rows = 4; 
const tabSize = 15; 
const MAX_PUZZLE_WIDTH = 900; 
const MARGIN_LEFT = 50; 
const TRAY_PADDING = 10; 

// Variáveis de Estado
let pieces = [];
let pieceWidth, pieceHeight;
let puzzleWidth, puzzleHeight;
let startX, startY; 
let trayX, trayY; 
let trayWidth, trayHeight; 

let isGameOver = false; 
let resetButtonBounds = null; 
let exitButtonBounds = null;
let fireworkParticles = []; 
let lastFrameTime = 0; 

// --- FUNÇÃO AUXILIAR DE EMBARALHAMENTO (Fisher-Yates) ---
function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
    return array;
}

// --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
function initializeGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    isGameOver = false; 
    resetButtonBounds = null; 
    exitButtonBounds = null;
    fireworkParticles = []; 
    
    addEventListeners(); 
    
    calculateDimensions();
    generatePieces(); // CORRIGIDO: Agora gera todas as peças como soltas e embaralhadas
    organizeTrayPieces(); 
    drawGame();
};

img.onload = () => {
    initializeGame();
};

window.onresize = () => {
    initializeGame();
};

function calculateDimensions() {
    const availableWidthForPuzzle = canvas.width - MARGIN_LEFT - 250; 
    const targetWidth = Math.min(availableWidthForPuzzle, MAX_PUZZLE_WIDTH);
    puzzleWidth = targetWidth;
    
    const aspectRatio = img.height / img.width;
    puzzleHeight = puzzleWidth * aspectRatio;

    pieceWidth = puzzleWidth / cols;
    pieceHeight = puzzleHeight / rows;

    startX = MARGIN_LEFT;
    startY = 60; 
    
    trayX = startX + puzzleWidth + TRAY_PADDING * 2; 
    trayY = startY;
    trayWidth = canvas.width - trayX - TRAY_PADDING;
    trayHeight = canvas.height - TRAY_PADDING * 2;
}

function organizeTrayPieces() {
    // Apenas peças soltas (que não estão no quadro principal) vão para a bandeja
    const loosePieces = pieces.filter(p => !p.isLocked);
    
    const pieceDrawW = pieceWidth + tabSize * 2;
    const pieceDrawH = pieceHeight + tabSize * 2;
    
    let maxCols = Math.floor((trayWidth + TRAY_PADDING) / (pieceDrawW + TRAY_PADDING));
    
    if (maxCols < 1) maxCols = 1;
    
    let piecesPerRow = maxCols;
    
    loosePieces.forEach((p, index) => {
        const col = index % piecesPerRow;
        const row = Math.floor(index / piecesPerRow);
        
        const destX = trayX + col * (pieceDrawW + TRAY_PADDING);
        const destY = trayY + row * (pieceDrawH + TRAY_PADDING);
        
        p.trayX = destX;
        p.trayY = destY;

        if (!p.isDragging) {
            p.currentX = destX;
            p.currentY = destY;
        }
    });
}

function generatePieces() {
    // CORREÇÃO: Limpa completamente o array de peças antigas
    pieces = [];
    
    // --- Lógica de Geração de Encaixes ---
    const horizontalTabs = [];
    const verticalTabs = [];

    for (let r = 0; r < rows; r++) {
        horizontalTabs[r] = [];
        for (let c = 0; c < cols; c++) {
            horizontalTabs[r][c] = (c < cols - 1) ? (Math.random() > 0.5 ? 1 : -1) : 0;
        }
    }
    for (let r = 0; r < rows; r++) {
        verticalTabs[r] = [];
        for (let c = 0; c < cols; c++) {
            verticalTabs[r][c] = (r < rows - 1) ? (Math.random() > 0.5 ? 1 : -1) : 0;
        }
    }

    // --- Criação das Peças ---
    let allPieces = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // TODAS as peças são criadas como SOLTAS para o novo jogo
            allPieces.push({
                col: c,
                row: r,
                correctX: startX + c * pieceWidth,
                correctY: startY + r * pieceHeight,
                currentX: 0, 
                currentY: 0, 
                trayX: 0, 
                trayY: 0, 
                width: pieceWidth,
                height: pieceHeight,
                top: (r === 0) ? 0 : -verticalTabs[r-1][c],
                right: horizontalTabs[r][c],
                bottom: verticalTabs[r][c],
                left: (c === 0) ? 0 : -horizontalTabs[r][c-1],
                isLocked: false, // Inicia todas como SOLTAS
                isDragging: false
            });
        }
    }
    
    // Embaralha TUDO e define o array de peças
    shuffle(allPieces); 
    pieces = allPieces; 
}

// --- FUNÇÕES DE DESENHO E LÓGICA ---

function drawGame() {
    // Limpa a tela inteira. Essencial para remover a tela de vitória.
    ctx.clearRect(0, 0, canvas.width, canvas.height); 

    if (!isGameOver) {
        // 1. Desenha o Fantasma e a Borda
        ctx.save();
        ctx.globalAlpha = 0.3; 
        ctx.drawImage(img, startX, startY, puzzleWidth, puzzleHeight);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, puzzleWidth, puzzleHeight);
        ctx.restore();

        // 2. Desenha as peças
        const nonDragging = pieces.filter(p => !p.isDragging);
        const dragging = pieces.filter(p => p.isDragging);

        nonDragging.forEach(p => drawPiece(p));
        dragging.forEach(p => drawPiece(p));
    }
}

function drawPiece(p) {
    ctx.save();
    const drawX = p.currentX;
    const drawY = p.currentY;

    // --- CRIAÇÃO DO CAMINHO (SHAPE) ---
    ctx.beginPath();
    let x = drawX;
    let y = drawY;
    ctx.moveTo(x, y);

    if (p.top !== 0) { drawTab(ctx, x, y, x + pieceWidth, y, p.top); } else { ctx.lineTo(x + pieceWidth, y); }
    x += pieceWidth;
    if (p.right !== 0) { drawTab(ctx, x, y, x, y + pieceHeight, p.right); } else { ctx.lineTo(x, y + pieceHeight); }
    y += pieceHeight;
    if (p.bottom !== 0) { drawTab(ctx, x, y, x - pieceWidth, y, p.bottom); } else { ctx.lineTo(x - pieceWidth, y); }
    x -= pieceWidth;
    if (p.left !== 0) { drawTab(ctx, x, y, x, y - pieceHeight, p.left); } else { ctx.lineTo(x, y - pieceHeight); }

    ctx.closePath();
    
    // --- RECORTA E DESENHA A IMAGEM ---
    ctx.clip(); 

    const tabSizeAdjustedX = tabSize / puzzleWidth * img.width;
    const tabSizeAdjustedY = tabSize / puzzleHeight * img.height;
    
    const srcX = (p.col * (img.width / cols)) - tabSizeAdjustedX;
    const srcY = (p.row * (img.height / rows)) - tabSizeAdjustedY;
    const srcW = (img.width / cols) + 2 * tabSizeAdjustedX;
    const srcH = (img.height / rows) + 2 * tabSizeAdjustedY;

    const destX = drawX - tabSize;
    const destY = drawY - tabSize;
    const destW = pieceWidth + (tabSize * 2);
    const destH = pieceHeight + (tabSize * 2);

    ctx.drawImage(img, srcX, srcY, srcW, srcH, destX, destY, destW, destH);

    ctx.strokeStyle = p.isDragging ? "yellow" : "#2c3e50"; 
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function drawTab(ctx, x1, y1, x2, y2, type) {
    const xDiff = x2 - x1;
    const yDiff = y2 - y1;
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    
    const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    const normX = -yDiff / dist * type; 
    const normY = xDiff / dist * type;

    const tabH = tabSize; 
    const neck = tabSize * 0.4;

    const p1x = cx - (xDiff * 0.15);
    const p1y = cy - (yDiff * 0.15);
    const p2x = cx + (xDiff * 0.15);
    const p2y = cy + (yDiff * 0.15);

    ctx.bezierCurveTo(
        p1x + xDiff*0.05 + normX*neck, p1y + yDiff*0.05 + normY*neck,
        cx - xDiff*0.05 + normX*tabH, cy - yDiff*0.05 + normY*tabH,
        cx + normX*tabH, cy + normY*tabH
    );
    
    ctx.bezierCurveTo(
        cx + xDiff*0.05 + normX*tabH, cy + yDiff*0.05 + normY*tabH,
        p2x - xDiff*0.05 + normX*neck, p2y - yDiff*0.05 + normY*neck,
        x2, y2
    );
}

// --- FOGOS DE ARTIFÍCIO E TELA DE VITÓRIA ---

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 5;
        this.vy = (Math.random() - 0.5) * 5;
        this.alpha = 1;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.life = 100;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05; 
        this.alpha -= 0.02;
        this.life--;
    }

    draw() {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

const fireworkColors = ["#FFD700", "#FF4500", "#00FFFF", "#32CD32", "#FF69B4", "#FFFFFF"];

function launchFirework() {
    const startX = Math.random() * canvas.width;
    const startY = Math.random() * canvas.height * 0.5;
    const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];

    for (let i = 0; i < 50; i++) {
        fireworkParticles.push(new Particle(startX, startY, color));
    }
}


function drawWinScreen(timestamp) {
    if (!isGameOver) {
        // Se o jogo não está mais em estado de vitória, saímos do loop
        drawGame(); 
        return; 
    }
    
    // 1. Redesenha o jogo base
    drawGame(); 
    
    const screenW = canvas.width;
    const screenH = canvas.height;
    
    // 2. Fundo escurecido
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, screenW, screenH);
    
    // 3. Desenha e atualiza as partículas de fogo de artifício
    fireworkParticles.forEach((p, index) => {
        p.update();
        p.draw();
        if (p.life <= 0 || p.alpha <= 0) {
            fireworkParticles.splice(index, 1);
        }
    });

    // Lançamento contínuo de fogos de artifício
    if (Math.random() < 0.05) { 
        launchFirework();
    }


    // 4. Mensagem de Parabéns
    const centerX = screenW / 2;
    const centerY = screenH / 2;
    
    ctx.fillStyle = "white";
    ctx.font = "bold 60px 'Segoe UI'";
    ctx.textAlign = "center";
    ctx.fillText("🎉 PARABÉNS! QUEBRA-CABEÇA COMPLETO! 🎉", centerX, centerY - 40);

    // 5. Botão "Jogar Novamente"
    const buttonWidth = 300;
    const buttonHeight = 60;
    const buttonX = centerX - buttonWidth / 2;
    const buttonY = centerY + 50;

    // Desenha o botão
    ctx.fillStyle = "#27ae60"; // Verde
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    
    // Desenha o texto do botão
    ctx.fillStyle = "white";
    ctx.font = "bold 24px 'Segoe UI'";
    ctx.fillText("JOGAR NOVAMENTE", centerX, buttonY + buttonHeight * 0.65);
    
    // Define a área clicável
    resetButtonBounds = {
        x: buttonX,
        y: buttonY,
        w: buttonWidth,
        h: buttonHeight
    };

    const exitButtonY = buttonY + buttonHeight + 20; // Fica 20px abaixo do primeiro botão

    // Desenha o retângulo do botão
    ctx.fillStyle = "#e74c3c"; // Cor Vermelha (ou a cor que preferir)
    ctx.fillRect(buttonX, exitButtonY, buttonWidth, buttonHeight);

    // Desenha o texto do botão
    ctx.fillStyle = "white";
    // Usa a mesma fonte configurada anteriormente
    ctx.fillText("VOLTAR PARA ATIVIDADES", centerX, exitButtonY + buttonHeight * 0.65);

    // Define a área clicável do novo botão
    exitButtonBounds = {
        x: buttonX,
        y: exitButtonY,
        w: buttonWidth,
        h: buttonHeight
    };

    // 6. Loop de Animação
    requestAnimationFrame(drawWinScreen);
}


function checkWin() {
    const isOver = pieces.every(p => p.isLocked);

    if (isOver && !isGameOver) {
        isGameOver = true;
        
        // Remove apenas os listeners de movimento e drag para travar as peças
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        
        // Inicia a animação de fogos de artifício
        launchFirework();
        requestAnimationFrame(drawWinScreen);
    }
}

// FUNÇÃO DE RESET FINAL
function resetGame() {
    // 1. Desliga a flag, quebrando o loop requestAnimationFrame na próxima iteração
    isGameOver = false; 
    
    // 2. Reconfigura o jogo do zero (Isso chama calculateDimensions(), generatePieces(), organizeTrayPieces() e drawGame())
    initializeGame();
}

// --- CONTROLES MOUSE E TOUCH ---

let selectedPiece = null;
let startMouseX, startMouseY;
let startPieceX, startPieceY;

function handleStart(x, y) {
    // Lógica para detectar o clique no botão e reiniciar o jogo
    if (isGameOver && resetButtonBounds) {
        if (x > resetButtonBounds.x && x < resetButtonBounds.x + resetButtonBounds.w &&
            y > resetButtonBounds.y && y < resetButtonBounds.y + resetButtonBounds.h) {
            
            resetGame();
            return; 
        }

        if (exitButtonBounds && 
            x > exitButtonBounds.x && x < exitButtonBounds.x + exitButtonBounds.w &&
            y > exitButtonBounds.y && y < exitButtonBounds.y + exitButtonBounds.h) {
            
            // Coloque aqui o link do seu HTML
            window.location.href = '../atividades.html'; 
            return;
        }
    }

    
    if (isGameOver) return; 

    for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        if (p.isLocked) continue;

        const pieceDrawW = p.width + tabSize * 2;
        const pieceDrawH = p.height + tabSize * 2;

        if (x > p.currentX - tabSize && x < p.currentX - tabSize + pieceDrawW &&
            y > p.currentY - tabSize && y < p.currentY - tabSize + pieceDrawH) {
            
            selectedPiece = p;
            p.isDragging = true;
            startMouseX = x;
            startMouseY = y;
            startPieceX = p.currentX; 
            startPieceY = p.currentY;
            
            pieces.splice(i, 1);
            pieces.push(p);
            drawGame();
            return;
        }
    }
}

function handleMove(x, y) {
    if (!selectedPiece) return;
    
    const dx = x - startMouseX;
    const dy = y - startMouseY;
    
    selectedPiece.currentX = startPieceX + dx;
    selectedPiece.currentY = startPieceY + dy;
    
    drawGame();
}

function handleEnd() {
    if (!selectedPiece) return;

    const dist = Math.hypot(selectedPiece.currentX - selectedPiece.correctX, selectedPiece.currentY - selectedPiece.correctY);

    if (dist < 30) {
        selectedPiece.currentX = selectedPiece.correctX;
        selectedPiece.currentY = selectedPiece.correctY;
        selectedPiece.isLocked = true;
        
        organizeTrayPieces(); 
        checkWin(); 
    } else {
        selectedPiece.currentX = selectedPiece.trayX;
        selectedPiece.currentY = selectedPiece.trayY;
    }

    selectedPiece.isDragging = false;
    selectedPiece = null;
    drawGame();
}

// Funções Wrapper para Eventos
const handleMouseDown = (e) => handleStart(e.offsetX, e.offsetY);
const handleMouseMove = (e) => handleMove(e.offsetX, e.offsetY);
const handleMouseUp = handleEnd;

const handleTouchStart = (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleStart(x, y);
};

const handleTouchMove = (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    handleMove(x, y);
};

const handleTouchEnd = handleEnd;

// Função para adicionar todos os event listeners
function addEventListeners() {
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
    canvas.removeEventListener('touchend', handleTouchEnd);

    // Listeners Mouse (arrastar e clique no botão)
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    // Listeners Touch (Celular)
    canvas.addEventListener('touchstart', handleTouchStart, {passive: false});
    canvas.addEventListener('touchmove', handleTouchMove, {passive: false});
    canvas.addEventListener('touchend', handleTouchEnd);
}