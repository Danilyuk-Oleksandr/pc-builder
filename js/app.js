// ===== CURRENT BUILD STATE =====
const currentBuild = {
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

// ===== BRAND FILTER MAP =====
const brandMap = {
    cpu: ['AMD', 'Intel'],
    gpu: ['NVIDIA', 'AMD'],
    ram: ['Corsair', 'G.Skill', 'Kingston'],
    ssd: ['Samsung', 'WD'],
    psu: ['Corsair', 'Seasonic']
};

// ===== MODAL FUNCTIONS =====

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
    if (e.target === modal) {
        closeModal();
    }
});

// ===== RENDER COMPONENTS (search + sort + filter) =====

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
        modalComponents.innerHTML = '<p style="text-align:center;color:#6a6a8e;padding:2rem;">No components found.</p>';
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

// ===== COMPONENT SELECTION =====

function selectComponent(type, component) {
    currentBuild[type] = component;

    updateSelectedDisplay(type, component);
    updateBuildSummary();
    updateTotalPrice();
    checkCompatibility();
    updatePerformance();
    if (typeof updateFPSCalculator === 'function') updateFPSCalculator();
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

// ===== TOTAL PRICE =====

function updateTotalPrice() {
    let total = 0;

    if (currentBuild.cpu) total += currentBuild.cpu.price;
    if (currentBuild.gpu) total += currentBuild.gpu.price;
    if (currentBuild.ram) total += currentBuild.ram.price;
    if (currentBuild.ssd) total += currentBuild.ssd.price;
    if (currentBuild.psu) total += currentBuild.psu.price;

    const priceElement = document.querySelector('.price-value');
    priceElement.textContent = `${total}$`;
}

// ===== COMPATIBILITY CHECK =====

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

// ===== PERFORMANCE ESTIMATE =====

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

// ===== BUILD SUMMARY =====

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

// ===== RESET BUILD =====

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
    updateBuildSummary();

    const compatEl = document.getElementById('compatibility-status');
    compatEl.textContent = 'Waiting...';
    compatEl.className = 'result-value compatibility-value waiting';

    const perfEl = document.getElementById('performance-status');
    perfEl.textContent = 'Waiting...';
    perfEl.className = 'result-value performance-value waiting';

    // Reset FPS calculator
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

// ===== SAVE / LOAD / CLEAR =====

function saveBuild() {
    localStorage.setItem('pcBuild', JSON.stringify(currentBuild));

    // Also save to history
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

        // Render history if available
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
        updateBuildSummary();
        checkCompatibility();
        updatePerformance();
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

// ===== TOAST NOTIFICATION =====

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast show ' + type;

    setTimeout(() => {
        toast.className = 'toast';
    }, 2500);
}

// ===== THEME TOGGLE =====

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

// ===== EVENT LISTENERS FOR SELECT BUTTONS =====

cpuButton.addEventListener('click', () => openModal('cpu', cpus));
gpuButton.addEventListener('click', () => openModal('gpu', gpus));
ramButton.addEventListener('click', () => openModal('ram', rams));
ssdButton.addEventListener('click', () => openModal('ssd', ssds));
psuButton.addEventListener('click', () => openModal('psu', psus));

// ===== INIT =====
loadBuild();
loadTheme();
