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
            detailText = `Socket: ${item.socket} | Power: ${item.power}W`;
        } else if (type === 'gpu') {
            detailText = `FPS: ${item.fps} | Power: ${item.power}W`;
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
    const selectedEl = document.getElementById(`selected-${type}`);
    selectedEl.textContent = `${component.name} — ${component.price}$`;
    selectedEl.classList.add('active');

    // Update total price
    updateTotalPrice();

    // Close modal
    closeModal();
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

// ===== EVENT LISTENERS FOR SELECT BUTTONS =====

cpuButton.addEventListener('click', () => openModal('cpu', cpus));
gpuButton.addEventListener('click', () => openModal('gpu', gpus));
ramButton.addEventListener('click', () => openModal('ram', rams));
ssdButton.addEventListener('click', () => openModal('ssd', ssds));
psuButton.addEventListener('click', () => openModal('psu', psus));
