// ===== CURRENT BUILD STATE =====
const currentBuild = {
    cpu: null,
    gpu: null,
    ram: null,
    ssd: null,
    psu: null
};

// ===== SAVED BUILD STATE (for comparison) =====
let savedBuild = {
    cpu: null,
    gpu: null,
    ram: null,
    ssd: null,
    psu: null
};

// ===== CURRENT MODAL STATE =====
let currentModalType = '';
let currentModalData = [];
let currentBrandFilter = 'All';
let currentSort = 'default';
let currentSearch = '';

// ===== DOM ELEMENTS =====
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalComponents = document.getElementById('modal-components');
const closeModalBtn = document.getElementById('close-modal');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const filterButtons = document.getElementById('filter-buttons');
const resetButton = document.getElementById('reset-button');
const saveButton = document.getElementById('save-build-button');
const clearButton = document.getElementById('clear-build-button');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('theme-toggle');

const cpuButton = document.querySelector('.cpu-card .select-btn');
const gpuButton = document.querySelector('.gpu-card .select-btn');
const ramButton = document.querySelector('.ram-card .select-btn');
const ssdButton = document.querySelector('.ssd-card .select-btn');
const psuButton = document.querySelector('.psu-card .select-btn');

// Comparison elements
const compareButton = document.getElementById('compare-button');
const swapButton = document.getElementById('swap-button');
const comparisonResult = document.getElementById('comparison-result');

// ===== BRAND FILTER MAP =====
const brandMap = {
    cpu: ['AMD', 'Intel'],
    gpu: ['NVIDIA', 'AMD'],
    ram: ['Corsair', 'G.Skill', 'Kingston'],
    ssd: ['Samsung', 'WD'],
    psu: ['Corsair', 'Seasonic']
};

// ========================================
// MODAL FUNCTIONS
// ========================================

function openModal(type, dataArray) {
    currentModalType = type;
    currentModalData = [...dataArray];
    currentBrandFilter = 'All';
    currentSearch = '';
    currentSort = 'default';

    modalTitle.textContent = `Choose ${type.toUpperCase()}`;
    searchInput.value = '';
    sortSelect.value = 'default';

    renderFilterButtons(type);
    renderComponents();

    modal.classList.add('open');
}

function renderFilterButtons(type) {
    filterButtons.innerHTML = '';

    const brands = brandMap[type] || [];
    if (brands.length === 0) return;

    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.textContent = 'All';
    allBtn.addEventListener('click', () => {
        currentBrandFilter = 'All';
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        allBtn.classList.add('active');
        renderComponents();
    });
    filterButtons.appendChild(allBtn);

    brands.forEach(brand => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = brand;
        btn.addEventListener('click', () => {
            currentBrandFilter = brand;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderComponents();
        });
        filterButtons.appendChild(btn);
    });
}

function closeModal() {
    modal.classList.remove('open');
}

closeModalBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// ========================================
// RENDER COMPONENTS (search + sort + filter)
// ========================================

function renderComponents() {
    modalComponents.innerHTML = '';

    let filtered = currentBrandFilter === 'All'
        ? [...currentModalData]
        : currentModalData.filter(item => item.brand === currentBrandFilter);

    if (currentSearch.length > 0) {
        const search = currentSearch.toLowerCase();
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(search) ||
            item.brand.toLowerCase().includes(search)
        );
    }

    if (currentSort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    }

    if (filtered.length === 0) {
        modalComponents.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem;">No components found.</p>';
        return;
    }

    filtered.forEach((item) => {
        const originalIndex = currentModalData.indexOf(item);
        const componentItem = document.createElement('div');
        componentItem.className = 'component-item';

        let detailText = '';
        if (currentModalType === 'cpu') {
            detailText = `${item.socket} | ${item.power}W | Score: ${item.gamingScore}`;
        } else if (currentModalType === 'gpu') {
            detailText = `${item.fps} FPS | ${item.power}W | Score: ${item.gamingScore}`;
        } else if (currentModalType === 'ram') {
            detailText = `Size: ${item.size}`;
        } else if (currentModalType === 'ssd') {
            detailText = `Capacity: ${item.capacity}`;
        } else if (currentModalType === 'psu') {
            detailText = `Wattage: ${item.wattage}W`;
        }

        const fallbackSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#1a1a3e" rx="12"/><text x="100" y="80" text-anchor="middle" fill="#00d4ff" font-size="16" font-family="Arial">${item.brand || 'PC'}</text></svg>`;
        const fallbackSrc = 'data:image/svg+xml,' + encodeURIComponent(fallbackSVG);

        componentItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='${fallbackSrc}';">
            <div class="component-item-info">
                <span class="component-item-name">${item.name}</span>
                <span class="component-item-detail">${detailText}</span>
            </div>
            <div class="component-item-right">
                <span class="component-item-price">${item.price}$</span>
                <button class="choose-btn" data-index="${originalIndex}">Choose</button>
            </div>
        `;

        modalComponents.appendChild(componentItem);
    });

    document.querySelectorAll('.choose-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            selectComponent(currentModalType, currentModalData[index]);
        });
    });
}

searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    renderComponents();
});

sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderComponents();
});

// ========================================
// COMPONENT SELECTION
// ========================================

function selectComponent(type, component) {
    currentBuild[type] = component;

    updateSelectedDisplay(type, component);
    updateBuildSummary();
    updateTotalPrice();
    updateProgressBar();
    checkCompatibility();
    updatePerformance();
    updateGamingBadge();
    if (typeof updateFPSCalculator === 'function') updateFPSCalculator();
    updateComparisonCurrent();
    closeModal();
}

function updateSelectedDisplay(type, component) {
    const selectedEl = document.getElementById(`selected-${type}`);
    if (component) {
        selectedEl.textContent = `${component.name} — ${component.price}$`;
        selectedEl.classList.add('active');
    }
}

function clearSelectedDisplay(type) {
    const selectedEl = document.getElementById(`selected-${type}`);
    selectedEl.textContent = 'Not selected';
    selectedEl.classList.remove('active');
}

// ========================================
// TOTAL PRICE
// ========================================

function getTotalPrice(build) {
    let total = 0;
    if (build.cpu) total += build.cpu.price;
    if (build.gpu) total += build.gpu.price;
    if (build.ram) total += build.ram.price;
    if (build.ssd) total += build.ssd.price;
    if (build.psu) total += build.psu.price;
    return total;
}

function updateTotalPrice() {
    const total = getTotalPrice(currentBuild);
    const priceElement = document.querySelector('.price-value');
    priceElement.textContent = `${total}$`;
}

// ========================================
// PROGRESS BAR
// ========================================

function updateProgressBar() {
    const total = getTotalPrice(currentBuild);
    const bar = document.getElementById('progress-bar');
    const label = document.getElementById('progress-label');

    let percentage = 0;
    let tier = '';
    let tierClass = '';

    if (total === 0) {
        percentage = 0;
        tier = 'Budget';
        tierClass = 'budget';
    } else if (total <= 700) {
        percentage = (total / 2500) * 100;
        tier = 'Budget';
        tierClass = 'budget';
    } else if (total <= 1200) {
        percentage = (total / 2500) * 100;
        tier = 'Mid-range';
        tierClass = 'mid-range';
    } else if (total <= 2000) {
        percentage = (total / 2500) * 100;
        tier = 'High-End';
        tierClass = 'high-end';
    } else {
        percentage = Math.min((total / 2500) * 100, 100);
        tier = 'Extreme';
        tierClass = 'extreme';
    }

    bar.style.width = `${percentage}%`;
    bar.className = `progress-bar ${tierClass}`;
    label.textContent = tier;
}

// ========================================
// GAMING BADGE
// ========================================

function updateGamingBadge() {
    const badgeValue = document.querySelector('#gaming-badge .badge-value');
    const badgeLabel = document.querySelector('#gaming-badge .badge-label');

    if (!currentBuild.cpu || !currentBuild.gpu) {
        badgeLabel.textContent = 'Badge';
        badgeValue.textContent = '—';
        badgeValue.className = 'badge-value';
        return;
    }

    const totalScore = currentBuild.cpu.gamingScore + currentBuild.gpu.gamingScore;
    let badge, badgeClass;

    if (totalScore < 120) {
        badge = 'Office';
        badgeClass = 'office';
    } else if (totalScore <= 180) {
        badge = 'Gaming';
        badgeClass = 'gaming';
    } else if (totalScore <= 250) {
        badge = 'Creator';
        badgeClass = 'creator';
    } else {
        badge = 'Enthusiast';
        badgeClass = 'enthusiast';
    }

    badgeLabel.textContent = 'Badge';
    badgeValue.textContent = badge;
    badgeValue.className = `badge-value ${badgeClass}`;
}

// ========================================
// COMPATIBILITY CHECK
// ========================================

function checkCompatibility() {
    const compatEl = document.getElementById('compatibility-status');

    const allSelected = currentBuild.cpu && currentBuild.gpu &&
                        currentBuild.ram && currentBuild.ssd && currentBuild.psu;

    if (!allSelected) {
        compatEl.textContent = 'Incomplete build';
        compatEl.className = 'result-value compatibility-value incomplete';
        return;
    }

    const totalPower = currentBuild.cpu.power + currentBuild.gpu.power;
    const psuWattage = currentBuild.psu.wattage;

    if (totalPower > psuWattage) {
        compatEl.textContent = `Power supply is too weak (${totalPower}W > ${psuWattage}W)`;
        compatEl.className = 'result-value compatibility-value incompatible';
    } else {
        compatEl.textContent = `Compatible (${totalPower}W / ${psuWattage}W)`;
        compatEl.className = 'result-value compatibility-value compatible';
    }
}

// ========================================
// PERFORMANCE ESTIMATE
// ========================================

function updatePerformance() {
    const perfEl = document.getElementById('performance-status');

    if (!currentBuild.cpu || !currentBuild.gpu) {
        perfEl.textContent = 'Waiting...';
        perfEl.className = 'result-value performance-value waiting';
        return;
    }

    const totalScore = currentBuild.cpu.gamingScore + currentBuild.gpu.gamingScore;

    if (totalScore < 120) {
        perfEl.textContent = 'Low (1080p Low)';
        perfEl.className = 'result-value performance-value low';
    } else if (totalScore <= 180) {
        perfEl.textContent = 'Medium (1080p High)';
        perfEl.className = 'result-value performance-value medium';
    } else if (totalScore <= 250) {
        perfEl.textContent = 'High (1440p Ultra)';
        perfEl.className = 'result-value performance-value high';
    } else {
        perfEl.textContent = 'Ultra (4K Gaming)';
        perfEl.className = 'result-value performance-value ultra';
    }
}

// ========================================
// BUILD SUMMARY
// ========================================

function updateBuildSummary() {
    const components = [
        { id: 'summary-cpu', key: 'cpu' },
        { id: 'summary-gpu', key: 'gpu' },
        { id: 'summary-ram', key: 'ram' },
        { id: 'summary-ssd', key: 'ssd' },
        { id: 'summary-psu', key: 'psu' }
    ];

    components.forEach(comp => {
        const el = document.getElementById(comp.id);
        if (currentBuild[comp.key]) {
            el.textContent = `${currentBuild[comp.key].name} ($${currentBuild[comp.key].price})`;
            el.classList.add('selected');
        } else {
            el.textContent = '—';
            el.classList.remove('selected');
        }
    });
}

// ========================================
// COMPARISON FUNCTIONS
// ========================================

function updateComparisonCurrent() {
    const types = ['cpu', 'gpu', 'ram', 'ssd', 'psu'];
    types.forEach(type => {
        const el = document.getElementById(`comp-current-${type}`);
        if (el) {
            el.textContent = currentBuild[type] ? currentBuild[type].name : '—';
        }
    });
    const priceEl = document.getElementById('comp-current-price');
    if (priceEl) priceEl.textContent = `${getTotalPrice(currentBuild)}$`;
}

function updateComparisonSaved() {
    const types = ['cpu', 'gpu', 'ram', 'ssd', 'psu'];
    types.forEach(type => {
        const el = document.getElementById(`comp-saved-${type}`);
        if (el) {
            el.textContent = savedBuild[type] ? savedBuild[type].name : '—';
        }
    });
    const priceEl = document.getElementById('comp-saved-price');
    if (priceEl) priceEl.textContent = `${getTotalPrice(savedBuild)}$`;
}

function loadSavedBuildForComparison(build) {
    // Find full component objects from data arrays
    const arrays = { cpu: cpus, gpu: gpus, ram: rams, ssd: ssds, psu: psus };
    const types = ['cpu', 'gpu', 'ram', 'ssd', 'psu'];
    
    types.forEach(type => {
        savedBuild[type] = (arrays[type] || []).find(item => item.name === build[type]) || null;
    });

    updateComparisonSaved();
    showToast('Build loaded for comparison!', 'success');
}

// Compare Builds
function compareBuilds() {
    const currentPrice = getTotalPrice(currentBuild);
    const savedPrice = getTotalPrice(savedBuild);

    if (currentPrice === 0 && savedPrice === 0) {
        showToast('Select builds to compare first', 'error');
        return;
    }

    // Price difference
    const priceDiff = currentPrice - savedPrice;
    const priceEl = document.getElementById('result-price');
    if (priceDiff === 0 && currentPrice > 0) {
        priceEl.textContent = 'Same price';
        priceEl.className = 'result-value-text neutral';
    } else if (priceDiff > 0) {
        priceEl.textContent = `Current is ${priceDiff}$ more expensive`;
        priceEl.className = 'result-value-text worse';
    } else if (priceDiff < 0) {
        priceEl.textContent = `Current is ${Math.abs(priceDiff)}$ cheaper`;
        priceEl.className = 'result-value-text better';
    } else {
        priceEl.textContent = '—';
        priceEl.className = 'result-value-text neutral';
    }

    // Gaming performance difference
    const currentScore = (currentBuild.cpu?.gamingScore || 0) + (currentBuild.gpu?.gamingScore || 0);
    const savedScore = (savedBuild.cpu?.gamingScore || 0) + (savedBuild.gpu?.gamingScore || 0);
    const perfEl = document.getElementById('result-performance');

    if (currentScore === 0 && savedScore === 0) {
        perfEl.textContent = '—';
        perfEl.className = 'result-value-text neutral';
    } else if (savedScore === 0) {
        perfEl.textContent = 'Current build score: ' + currentScore;
        perfEl.className = 'result-value-text neutral';
    } else {
        const percentDiff = Math.round(((currentScore - savedScore) / savedScore) * 100);
        if (percentDiff > 0) {
            perfEl.textContent = `Gaming Performance +${percentDiff}%`;
            perfEl.className = 'result-value-text better';
        } else if (percentDiff < 0) {
            perfEl.textContent = `Gaming Performance ${percentDiff}%`;
            perfEl.className = 'result-value-text worse';
        } else {
            perfEl.textContent = 'Same gaming performance';
            perfEl.className = 'result-value-text neutral';
        }
    }

    // Power consumption difference
    const currentPower = (currentBuild.cpu?.power || 0) + (currentBuild.gpu?.power || 0);
    const savedPower = (savedBuild.cpu?.power || 0) + (savedBuild.gpu?.power || 0);
    const powerEl = document.getElementById('result-power');

    if (currentPower === 0 && savedPower === 0) {
        powerEl.textContent = '—';
        powerEl.className = 'result-value-text neutral';
    } else if (savedPower === 0) {
        powerEl.textContent = `Current power draw: ${currentPower}W`;
        powerEl.className = 'result-value-text neutral';
    } else {
        const powerDiff = currentPower - savedPower;
        if (powerDiff > 0) {
            powerEl.textContent = `Current uses +${powerDiff}W more power`;
            powerEl.className = 'result-value-text worse';
        } else if (powerDiff < 0) {
            powerEl.textContent = `Current uses ${Math.abs(powerDiff)}W less power`;
            powerEl.className = 'result-value-text better';
        } else {
            powerEl.textContent = 'Same power consumption';
            powerEl.className = 'result-value-text neutral';
        }
    }

    // Show result
    comparisonResult.classList.add('visible');
}

// Swap Builds
function swapBuilds() {
    const temp = { ...currentBuild };
    
    // Swap currentBuild with savedBuild
    currentBuild.cpu = savedBuild.cpu;
    currentBuild.gpu = savedBuild.gpu;
    currentBuild.ram = savedBuild.ram;
    currentBuild.ssd = savedBuild.ssd;
    currentBuild.psu = savedBuild.psu;

    savedBuild.cpu = temp.cpu;
    savedBuild.gpu = temp.gpu;
    savedBuild.ram = temp.ram;
    savedBuild.ssd = temp.ssd;
    savedBuild.psu = temp.psu;

    // Update all UI
    ['cpu', 'gpu', 'ram', 'ssd', 'psu'].forEach(type => {
        updateSelectedDisplay(type, currentBuild[type]);
    });
    updateBuildSummary();
    updateTotalPrice();
    updateProgressBar();
    checkCompatibility();
    updatePerformance();
    updateGamingBadge();
    if (typeof updateFPSCalculator === 'function') updateFPSCalculator();
    updateComparisonCurrent();
    updateComparisonSaved();

    showToast('Builds swapped!', 'success');
}

compareButton.addEventListener('click', compareBuilds);
swapButton.addEventListener('click', swapBuilds);

// Make functions available globally for history.js
window.updateFPSCalculator = function() {
    if (typeof gameSelect !== 'undefined') {
        gameSelect.dispatchEvent(new Event('change'));
    }
};
window.loadSavedBuildForComparison = loadSavedBuildForComparison;
window.updateComparisonCurrent = updateComparisonCurrent;
window.updateComparisonSaved = updateComparisonSaved;
window.updateBuildSummary = updateBuildSummary;
window.updateTotalPrice = updateTotalPrice;
window.updateProgressBar = updateProgressBar;
window.checkCompatibility = checkCompatibility;
window.updatePerformance = updatePerformance;
window.updateGamingBadge = updateGamingBadge;

// ========================================
// RESET BUILD
// ========================================

function resetBuild() {
    currentBuild.cpu = null;
    currentBuild.gpu = null;
    currentBuild.ram = null;
    currentBuild.ssd = null;
    currentBuild.psu = null;

    ['cpu', 'gpu', 'ram', 'ssd', 'psu'].forEach(type => {
        clearSelectedDisplay(type);
    });

    updateTotalPrice();
    updateProgressBar();
    updateBuildSummary();
    updateGamingBadge();
    updateComparisonCurrent();

    const compatEl = document.getElementById('compatibility-status');
    compatEl.textContent = 'Waiting...';
    compatEl.className = 'result-value compatibility-value waiting';

    const perfEl = document.getElementById('performance-status');
    perfEl.textContent = 'Waiting...';
    perfEl.className = 'result-value performance-value waiting';

    const fpsValueEl = document.getElementById('fps-value');
    if (fpsValueEl) {
        fpsValueEl.textContent = '—';
        fpsValueEl.className = 'fps-value';
    }
    const gameSelectEl = document.getElementById('game-select');
    if (gameSelectEl) gameSelectEl.value = 'none';

    showToast('Build reset successfully', 'success');
}

resetButton.addEventListener('click', resetBuild);

// ========================================
// SAVE / LOAD / CLEAR
// ========================================

function saveBuild() {
    localStorage.setItem('pcBuild', JSON.stringify(currentBuild));

    const allSelected = currentBuild.cpu && currentBuild.gpu &&
                        currentBuild.ram && currentBuild.ssd && currentBuild.psu;

    if (allSelected) {
        let total = currentBuild.cpu.price + currentBuild.gpu.price +
                    currentBuild.ram.price + currentBuild.ssd.price + currentBuild.psu.price;

        const buildEntry = {
            id: Date.now(),
            cpu: currentBuild.cpu.name,
            gpu: currentBuild.gpu.name,
            ram: currentBuild.ram.name,
            ssd: currentBuild.ssd.name,
            psu: currentBuild.psu.name,
            totalPrice: total,
            date: new Date().toLocaleDateString('en-GB', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        let buildHistory = [];
        const savedHistory = localStorage.getItem('pcBuildHistory');
        if (savedHistory) {
            try {
                buildHistory = JSON.parse(savedHistory);
            } catch (e) {
                buildHistory = [];
            }
        }

        buildHistory.unshift(buildEntry);
        localStorage.setItem('pcBuildHistory', JSON.stringify(buildHistory));

        if (typeof renderBuildHistory === 'function') {
            window.buildHistory = buildHistory;
            renderBuildHistory();
        }

        showToast('Build saved & added to history!', 'success');
    } else {
        showToast('Build successfully saved!', 'success');
    }
}

function loadBuild() {
    const saved = localStorage.getItem('pcBuild');
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        Object.keys(currentBuild).forEach(key => {
            if (data[key]) {
                currentBuild[key] = data[key];
                updateSelectedDisplay(key, data[key]);
            }
        });

        updateTotalPrice();
        updateProgressBar();
        updateBuildSummary();
        checkCompatibility();
        updatePerformance();
        updateGamingBadge();
        updateComparisonCurrent();
    } catch (e) {
        console.warn('Failed to load saved build:', e);
    }
}

function clearBuild() {
    localStorage.removeItem('pcBuild');
    resetBuild();
    showToast('Build cleared from storage', 'error');
}

saveButton.addEventListener('click', saveBuild);
clearButton.addEventListener('click', clearBuild);

// ========================================
// TOAST NOTIFICATION
// ========================================

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast show ' + type;

    setTimeout(() => {
        toast.className = 'toast';
    }, 2500);
}

// ========================================
// THEME TOGGLE
// ========================================

function loadTheme() {
    const savedTheme = localStorage.getItem('pcTheme');
    if (savedTheme === 'light') {
        document.body.classList.add('light');
        themeToggle.textContent = '☀️';
    }
}

function toggleTheme() {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    themeToggle.textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('pcTheme', isLight ? 'light' : 'dark');
}

themeToggle.addEventListener('click', toggleTheme);

// ========================================
// EVENT LISTENERS FOR SELECT BUTTONS
// ========================================

cpuButton.addEventListener('click', () => openModal('cpu', cpus));
gpuButton.addEventListener('click', () => openModal('gpu', gpus));
ramButton.addEventListener('click', () => openModal('ram', rams));
ssdButton.addEventListener('click', () => openModal('ssd', ssds));
psuButton.addEventListener('click', () => openModal('psu', psus));

// ========================================
// INIT
// ========================================
loadBuild();
loadTheme();
updateProgressBar();
updateGamingBadge();
updateComparisonCurrent();
