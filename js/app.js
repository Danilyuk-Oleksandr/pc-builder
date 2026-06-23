// ===== CURRENT BUILD STATE =====
const currentBuild = {
    cpu: null,
    gpu: null,
    ram: null,
    ssd: null,
    psu: null
};

// ===== DOM ELEMENTS =====
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalComponents = document.getElementById('modal-components');
const closeModalBtn = document.getElementById('close-modal');
const resetButton = document.getElementById('reset-button');

const cpuButton = document.querySelector('.cpu-card .select-btn');
const gpuButton = document.querySelector('.gpu-card .select-btn');
const ramButton = document.querySelector('.ram-card .select-btn');
const ssdButton = document.querySelector('.ssd-card .select-btn');
const psuButton = document.querySelector('.psu-card .select-btn');

// ===== MODAL FUNCTIONS =====

function openModal(type, dataArray) {
    modalTitle.textContent = `Choose ${type.toUpperCase()}`;
    modalComponents.innerHTML = '';

    dataArray.forEach((item, index) => {
        const componentItem = document.createElement('div');
        componentItem.className = 'component-item';

        // Build display name and detail text based on component type
        let detailText = '';
        if (type === 'cpu') {
            detailText = `Socket: ${item.socket} | Power: ${item.power}W | Gaming: ${item.gamingScore}`;
        } else if (type === 'gpu') {
            detailText = `FPS: ${item.fps} | Power: ${item.power}W | Gaming: ${item.gamingScore}`;
        } else if (type === 'ram') {
            detailText = `Size: ${item.size}`;
        } else if (type === 'ssd') {
            detailText = `Capacity: ${item.capacity}`;
        } else if (type === 'psu') {
            detailText = `Wattage: ${item.wattage}W`;
        }

        componentItem.innerHTML = `
            <div class="component-item-info">
                <span class="component-item-name">${item.name}</span>
                <span class="component-item-detail">${detailText}</span>
            </div>
            <span class="component-item-price">${item.price}$</span>
            <button class="choose-btn" data-index="${index}" data-type="${type}">Choose</button>
        `;

        modalComponents.appendChild(componentItem);
    });

    // Add event listeners to all Choose buttons
    document.querySelectorAll('.choose-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            const index = parseInt(btn.dataset.index);
            selectComponent(type, dataArray[index]);
        });
    });

    modal.classList.add('open');
}

function closeModal() {
    modal.classList.remove('open');
}

closeModalBtn.addEventListener('click', closeModal);

// Close modal when clicking outside modal-content
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// ===== COMPONENT SELECTION =====

function selectComponent(type, component) {
    currentBuild[type] = component;

    // Update the selected-component display in the card
    updateSelectedDisplay(type, component);

    // Update build summary
    updateBuildSummary();

    // Update total price
    updateTotalPrice();

    // Check compatibility
    checkCompatibility();

    // Update performance
    updatePerformance();

    // Close modal
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

    // Check if all components are selected
    const allSelected = currentBuild.cpu && currentBuild.gpu &&
                        currentBuild.ram && currentBuild.ssd && currentBuild.psu;

    if (!allSelected) {
        compatEl.textContent = 'Incomplete build';
        compatEl.className = 'result-value compatibility-value incomplete';
        return;
    }

    // Calculate total power consumption
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

    // If CPU or GPU not selected yet
    if (!currentBuild.cpu || !currentBuild.gpu) {
        perfEl.textContent = 'Waiting...';
        perfEl.className = 'result-value performance-value waiting';
        return;
    }

    // Calculate total gaming score
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
        { id: 'summary-cpu', key: 'cpu', label: 'CPU' },
        { id: 'summary-gpu', key: 'gpu', label: 'GPU' },
        { id: 'summary-ram', key: 'ram', label: 'RAM' },
        { id: 'summary-ssd', key: 'ssd', label: 'SSD' },
        { id: 'summary-psu', key: 'psu', label: 'PSU' }
    ];

    components.forEach(comp => {
        const el = document.getElementById(comp.id);
        if (currentBuild[comp.key]) {
            el.textContent = currentBuild[comp.key].name;
            el.classList.add('selected');
        } else {
            el.textContent = '—';
            el.classList.remove('selected');
        }
    });
}

// ===== RESET BUILD =====

function resetBuild() {
    // Reset all components to null
    currentBuild.cpu = null;
    currentBuild.gpu = null;
    currentBuild.ram = null;
    currentBuild.ssd = null;
    currentBuild.psu = null;

    // Clear selected displays
    ['cpu', 'gpu', 'ram', 'ssd', 'psu'].forEach(type => {
        clearSelectedDisplay(type);
    });

    // Reset total price
    updateTotalPrice();

    // Reset compatibility
    const compatEl = document.getElementById('compatibility-status');
    compatEl.textContent = 'Waiting...';
    compatEl.className = 'result-value compatibility-value waiting';

    // Reset performance
    const perfEl = document.getElementById('performance-status');
    perfEl.textContent = 'Waiting...';
    perfEl.className = 'result-value performance-value waiting';

    // Reset build summary
    updateBuildSummary();

    // Close modal if open
    closeModal();
}

resetButton.addEventListener('click', resetBuild);

// ===== EVENT LISTENERS FOR SELECT BUTTONS =====

cpuButton.addEventListener('click', () => openModal('cpu', cpus));
gpuButton.addEventListener('click', () => openModal('gpu', gpus));
ramButton.addEventListener('click', () => openModal('ram', rams));
ssdButton.addEventListener('click', () => openModal('ssd', ssds));
psuButton.addEventListener('click', () => openModal('psu', psus));
