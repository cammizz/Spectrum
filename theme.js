document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const toggleBtn = document.getElementById('theme-toggle'); // Botão do cabeçalho (Sol/Lua)
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');
    
    // --- 1. VERIFICAÇÃO INICIAL ---
    // Olha na memória do navegador se existe uma preferência salva
    const temaSalvo = localStorage.getItem('theme');
    
    if (temaSalvo === 'dark') {
        body.classList.add('dark-mode');
        atualizarIcones(true);
    } else {
        body.classList.remove('dark-mode');
        atualizarIcones(false);
    }

    // --- 2. FUNÇÃO AUXILIAR PARA ÍCONES ---
    function atualizarIcones(isDark) {
        // Só tenta mudar os ícones se eles existirem na página atual
        if (sunIcon && moonIcon) {
            if (isDark) {
                moonIcon.style.display = 'none';
                sunIcon.style.display = 'block';
                // Garante que o ícone fique branco (regra de CSS ajuda, mas isso reforça)
                if (toggleBtn) toggleBtn.style.color = '#fff'; 
            } else {
                moonIcon.style.display = 'block';
                sunIcon.style.display = 'none';
                if (toggleBtn) toggleBtn.style.color = ''; // Volta ao padrão
            }
        }
    }

    // --- 3. CLIQUE NO BOTÃO DO CABEÇALHO (SOL/LUA) ---
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');

            // Salva a decisão na memória
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            atualizarIcones(isDark);
        });
    }
});



//--------------->>>>>>>>>>>>>>>>>>>>>>>>> O scrip esquizofrênico do Tasso----------------------------------------//

function navigateTo(sectionId) {
    // 1. Ocultar todas as seções principais
    document.querySelectorAll('.main-content').forEach(section => {
        section.classList.add('hidden-section');
    });

    // 2. Mostrar a seção selecionada
    const targetSection = document.getElementById('content-' + sectionId);
    if (targetSection) {
        targetSection.classList.remove('hidden-section');
    }

    // 3. Atualizar o estilo dos links de navegação (Desktop e Mobile)
    const allNavLinks = document.querySelectorAll('#desktop-nav a, #mobile-nav a');
    allNavLinks.forEach(link => {
        link.classList.remove('text-sky-600');
        link.classList.add('text-gray-500'); 
    });

    const desktopLink = document.getElementById(`nav-${sectionId}-desktop`);
    if (desktopLink) {
        desktopLink.classList.add('text-sky-600');
        desktopLink.classList.remove('text-gray-500');
    }

    const mobileLink = document.getElementById(`nav-${sectionId}-mobile`);
    if (mobileLink) {
        mobileLink.classList.add('text-sky-600');
        mobileLink.classList.remove('text-gray-500');
    }
    
    if (sectionId === 'home') {
         switchTab('grupos');
    }
}

// Função para alternar a aba ativa
function switchTab(activeTabId) {
    document.getElementById('content-grupos').classList.add('hidden-tab');
    document.getElementById('content-explorar').classList.add('hidden-tab');
    document.getElementById('content-seguindo').classList.add('hidden-tab');

    const tabButtons = document.querySelectorAll('.flex.space-x-6 button');
    tabButtons.forEach(button => {
        button.classList.remove('border-sky-600', 'text-sky-600', 'font-semibold');
        button.classList.add('border-transparent', 'text-gray-500', 'hover:text-sky-600');
    });

    document.getElementById('content-' + activeTabId).classList.remove('hidden-tab');

    const activeTabButton = document.getElementById('tab-' + activeTabId);
    if (activeTabButton) {
        activeTabButton.classList.remove('border-transparent', 'text-gray-500', 'hover:text-sky-600');
        activeTabButton.classList.add('border-sky-600', 'text-sky-600', 'font-semibold');
    }
}

function toggleLike(postId) {
    const likeIcon = document.getElementById('like-icon-' + postId);
    const likeButton = document.getElementById('like-' + postId);
    const likeCountSpan = document.getElementById('like-count-' + postId);
    
    const isLiked = likeIcon.classList.toggle('liked-icon');
    let currentCount = parseInt(likeCountSpan.textContent);

    if (isLiked) {
        likeIcon.setAttribute('fill', 'currentColor');
        likeButton.classList.remove('text-gray-500');
        likeButton.classList.add('text-sky-500');
        currentCount += 1;
    } else {
        likeIcon.setAttribute('fill', 'none');
        likeButton.classList.remove('text-sky-500');
        likeButton.classList.add('text-gray-500');
        currentCount -= 1;
    }

    likeCountSpan.textContent = currentCount;
}

function toggleComments(postId) {
    const commentsDiv = document.getElementById('comments-' + postId);
    commentsDiv.classList.toggle('hidden-tab');
    if (!commentsDiv.classList.contains('hidden-tab')) {
        document.getElementById('post-' + postId).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function selectTheme(theme) {
    const searchInput = document.getElementById('search-input');
    searchInput.value = theme;
    searchInput.focus();
}

function loadMoreCommunities() {
    const moreDiv = document.getElementById('more-communities');
    const button = document.getElementById('load-more-btn');

    moreDiv.classList.toggle('hidden-tab');

    if (moreDiv.classList.contains('hidden-tab')) {
        button.textContent = 'Ver mais comunidades';
        button.classList.remove('bg-gray-500', 'hover:bg-gray-600');
        button.classList.add('bg-sky-500', 'hover:bg-sky-600');
    } else {
        button.textContent = 'Ver menos comunidades';
        button.classList.remove('bg-sky-500', 'hover:bg-sky-600');
        button.classList.add('bg-gray-500', 'hover:bg-gray-600');
    }

    if (!moreDiv.classList.contains('hidden-tab')) {
        moreDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

window.onload = function() {
    navigateTo('home');
};