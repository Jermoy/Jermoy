// Modal Handling
const bookingModal = document.getElementById('bookingModal');
const messageModal = document.getElementById('messageModal');
const closeButtons = document.getElementsByClassName('close-modal');

// Available viewing times
const viewingTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'
];

// Dashboard State Management
let dashboardState = {
    uploadedProperties: [],
    recentlyViewed: [],
    favorites: []
};

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    initializeDashboard();
    setupEventListeners();
});

function initializeDashboard() {
    // Load data from localStorage or API
    const savedState = localStorage.getItem('dashboardState');
    if (savedState) {
        dashboardState = JSON.parse(savedState);
        renderDashboard();
    }
}

function setupEventListeners() {
    // Modal close buttons
    Array.from(closeButtons).forEach(button => {
        button.addEventListener('click', () => {
            bookingModal.style.display = 'none';
            messageModal.style.display = 'none';
        });
    });

    // Property action buttons
    setupPropertyActions();
    
    // Window click to close modals
    window.addEventListener('click', (event) => {
        if (event.target === bookingModal || event.target === messageModal) {
            event.target.style.display = 'none';
        }
    });
}

function setupPropertyActions() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const propertyId = e.target.closest('.property-item').dataset.id;
            handleEditProperty(propertyId);
        });
    });

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const propertyId = e.target.closest('.property-item').dataset.id;
            handleDeleteProperty(propertyId);
        });
    });

    // Favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const propertyId = e.target.closest('.property-item').dataset.id;
            toggleFavorite(propertyId);
        });
    });
}

// Property Management Functions
function handleEditProperty(propertyId) {
    const property = findPropertyById(propertyId);
    if (!property) return;

    // Populate edit form
    const editForm = document.getElementById('editPropertyForm');
    if (editForm) {
        editForm.elements.title.value = property.title;
        editForm.elements.location.value = property.location;
        editForm.elements.price.value = property.price;
        
        editForm.onsubmit = (e) => {
            e.preventDefault();
            updateProperty(propertyId, {
                title: editForm.elements.title.value,
                location: editForm.elements.location.value,
                price: editForm.elements.price.value
            });
        };
    }
}

function handleDeleteProperty(propertyId) {
    if (confirm('Are you sure you want to delete this property?')) {
        deleteProperty(propertyId);
    }
}

function toggleFavorite(propertyId) {
    const property = findPropertyById(propertyId);
    if (!property) return;

    const isFavorite = dashboardState.favorites.includes(propertyId);
    if (isFavorite) {
        dashboardState.favorites = dashboardState.favorites.filter(id => id !== propertyId);
    } else {
        dashboardState.favorites.push(propertyId);
    }

    updateDashboardState();
    renderDashboard();
}

// CRUD Operations
function updateProperty(propertyId, updates) {
    const propertyIndex = dashboardState.uploadedProperties.findIndex(p => p.id === propertyId);
    if (propertyIndex === -1) return;

    dashboardState.uploadedProperties[propertyIndex] = {
        ...dashboardState.uploadedProperties[propertyIndex],
        ...updates,
        lastModified: new Date().toISOString()
    };

    updateDashboardState();
    renderDashboard();
}

function deleteProperty(propertyId) {
    dashboardState.uploadedProperties = dashboardState.uploadedProperties.filter(p => p.id !== propertyId);
    dashboardState.favorites = dashboardState.favorites.filter(id => id !== propertyId);
    
    updateDashboardState();
    renderDashboard();
}

// Helper Functions
function findPropertyById(propertyId) {
    return dashboardState.uploadedProperties.find(p => p.id === propertyId);
}

function updateDashboardState() {
    localStorage.setItem('dashboardState', JSON.stringify(dashboardState));
}

function renderDashboard() {
    renderUploadedProperties();
    renderRecentlyViewed();
    renderFavorites();
    updateSectionCounts();
}

// Section Rendering
function renderUploadedProperties() {
    const container = document.querySelector('.uploaded-properties .property-list');
    if (!container) return;

    container.innerHTML = dashboardState.uploadedProperties
        .map(property => createPropertyCard(property, true))
        .join('');
}

function renderRecentlyViewed() {
    const container = document.querySelector('.recently-viewed .property-list');
    if (!container) return;

    container.innerHTML = dashboardState.recentlyViewed
        .map(property => createPropertyCard(property, false, true))
        .join('');
}

function renderFavorites() {
    const container = document.querySelector('.favorited-properties .property-list');
    if (!container) return;

    container.innerHTML = dashboardState.favorites
        .map(propertyId => {
            const property = findPropertyById(propertyId);
            return property ? createPropertyCard(property, false, false, true) : '';
        })
        .join('');
}

function updateSectionCounts() {
    const sections = {
        'uploaded-properties': dashboardState.uploadedProperties.length,
        'recently-viewed': dashboardState.recentlyViewed.length,
        'favorited-properties': dashboardState.favorites.length
    };

    Object.entries(sections).forEach(([className, count]) => {
        const countElement = document.querySelector(`.${className} .section-count`);
        if (countElement) {
            countElement.textContent = count;
        }
    });
}

// Property Card Template
function createPropertyCard(property, showActions = false, showViewCount = false, isFavorite = false) {
    return `
        <div class="property-item" data-id="${property.id}">
            <div class="property-thumbnail">
                <img src="${property.image || '/api/placeholder/100/80'}" alt="${property.title}">
            </div>
            <div class="property-details">
                <h3 class="property-title">${property.title}</h3>
                <p class="property-location">${property.location}</p>
                <p class="property-price">${property.price}</p>
                ${showViewCount ? `<p class="view-count">Viewed ${getTimeAgo(property.lastViewed)}</p>` : ''}
            </div>
            ${showActions ? `
                <div class="property-actions">
                    <button class="action-btn edit-btn">Edit</button>
                    <button class="action-btn delete-btn">Delete</button>
                </div>
            ` : ''}
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" aria-label="Toggle favorite">
                ♥
            </button>
        </div>
    `;
}

function getTimeAgo(timestamp) {
    const minutes = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
}
