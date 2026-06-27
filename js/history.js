// ===== GAMES LIST FOR FPS CALCULATOR =====
const games = [
    { name: "Counter-Strike 2", difficulty: 0.85 },
    { name: "Fortnite", difficulty: 0.75 },
    { name: "GTA V", difficulty: 0.70 },
    { name: "Cyberpunk 2077", difficulty: 0.45 },
    { name: "Minecraft", difficulty: 0.95 }
];

// ===== DOM ELEMENTS FOR HISTORY & FPS =====
const historyGrid = document.getElementById('history-grid');
const clearHistoryBtn = document.getElementById('clear-history-button');
const gameSelect = document.getElementById('game-select');
const fpsValue = document.getElementById('fps-value');

// ===== POPULATE GAME SELECT =====

function populateGameSelect() {
    gameSelect.innerHTML = '<option value="none">— Choose a game —</option>';
    
    games.forEach((game, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = game.name;
        gameSelect.appendChild(option);
    });
}

// ===== FPS CALCULATOR =====

function calculateFPS(gameIndex) {
    if (!currentBuild.cpu || !currentBuild.gpu || gameIndex === 'none') {
        return null;
    }
    
    const game = games[parseInt(gameIndex)];
    const totalScore = currentBuild.cpu.gamingScore + currentBuild.gpu.gamingScore;
    
    const estimatedFPS = Math.round(totalScore * game.difficulty * 1.2);
    
    return estimatedFPS;
}

function updateFPSCalculator() {
    const gameIndex = gameSelect.value;
    const fps = calculateFPS(gameIndex);
    
    if (fps === null) {
        fpsValue.textContent = '—';
        fpsValue.className = 'fps-value';
        return;
    }
    
    fpsValue.textContent = `${fps} FPS`;
    
    if (fps < 60) {
        fpsValue.className = 'fps-value low-fps';
    } else if (fps <= 120) {
        fpsValue.className = 'fps-value medium-fps';
    } else {
        fpsValue.className = 'fps-value high-fps';
    }
}

gameSelect.addEventListener('change', updateFPSCalculator);

// ===== BUILD HISTORY FUNCTIONS =====

function loadBuildHistory() {
    const saved = localStorage.getItem('pcBuildHistory');
    
    if (saved) {
        try {
            window.buildHistory = JSON.parse(saved);
            renderBuildHistory();
        } catch (e) {
            console.warn('Failed to load build history:', e);
            window.buildHistory = [];
        }
    }
}

function renderBuildHistory() {
    const history = window.buildHistory || [];
    
    if (history.length === 0) {
        historyGrid.innerHTML = '<p class="history-empty">No saved builds yet. Start building and save your first build!</p>';
        return;
    }
    
    historyGrid.innerHTML = '';
    
    history.forEach((build) => {
        const historyCard = document.createElement('div');
        historyCard.className = 'history-card';
        
        historyCard.innerHTML = `
            <div class="history-card-header">
                <div class="history-card-title">PC Build</div>
                <div class="history-card-date">${build.date}</div>
            </div>
            <div class="history-card-components">
                <div class="history-component">
                    <span class="component-label">CPU:</span>
                    <span class="component-value">${build.cpu}</span>
                </div>
                <div class="history-component">
                    <span class="component-label">GPU:</span>
                    <span class="component-value">${build.gpu}</span>
                </div>
            </div>
            <div class="history-card-price">${build.totalPrice}$</div>
            <div class="history-card-actions">
                <button class="load-build-btn" data-build-id="${build.id}">📂 Load Build</button>
            </div>
        `;
        
        historyGrid.appendChild(historyCard);
    });
    
    // Attach event listeners to all Load Build buttons
    document.querySelectorAll('.load-build-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const buildId = parseInt(btn.dataset.buildId);
            loadBuildFromHistory(buildId);
        });
    });
}

function loadBuildFromHistory(buildId) {
    const history = window.buildHistory || [];
    const build = history.find(b => b.id === buildId);
    
    if (!build) {
        showToast('Build not found in history', 'error');
        return;
    }
    
    // Load the build into the saved build comparison
    if (typeof loadSavedBuildForComparison === 'function') {
        loadSavedBuildForComparison(build);
    }
    
    // Also set as current build
    currentBuild.cpu = findComponent('cpu', build.cpu);
    currentBuild.gpu = findComponent('gpu', build.gpu);
    currentBuild.ram = findComponent('ram', build.ram);
    currentBuild.ssd = findComponent('ssd', build.ssd);
    currentBuild.psu = findComponent('psu', build.psu);
    
    // Update all UI
    ['cpu', 'gpu', 'ram', 'ssd', 'psu'].forEach(type => {
        updateSelectedDisplay(type, currentBuild[type]);
    });
    
    updateBuildSummary();
    updateTotalPrice();
    checkCompatibility();
    updatePerformance();
    if (typeof updateFPSCalculator === 'function') updateFPSCalculator();
    if (typeof updateComparisonCurrent === 'function') updateComparisonCurrent();
    if (typeof updateGamingBadge === 'function') updateGamingBadge();
    
    showToast(`Build "${build.cpu} + ${build.gpu}" loaded!`, 'success');
    
    // Scroll to builder section
    document.getElementById('builder').scrollIntoView({ behavior: 'smooth' });
}

function findComponent(type, name) {
    const arrays = { cpu: cpus, gpu: gpus, ram: rams, ssd: ssds, psu: psus };
    return (arrays[type] || []).find(item => item.name === name) || null;
}

function clearBuildHistory() {
    window.buildHistory = [];
    localStorage.removeItem('pcBuildHistory');
    renderBuildHistory();
    showToast('Build history cleared', 'error');
}

clearHistoryBtn.addEventListener('click', clearBuildHistory);

// ===== INIT =====
populateGameSelect();
loadBuildHistory();
і