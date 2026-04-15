// Robin Photo - Main Application JavaScript
// ============================================

// Wait for Firebase to be ready
function waitForFirebase() {
    return new Promise((resolve) => {
        if (window.firebaseReady) {
            resolve();
        } else {
            document.addEventListener('firebase-ready', resolve, { once: true });
        }
    });
}

// Use global Firebase services (loaded via CDN in index.html)
let auth, db, storage, googleProvider;

// Application State
// ============================================
const state = {
    user: null,
    currentUser: null,
    events: [],
    currentEvent: null,
    currentPhotos: [],
    currentPhotoIndex: 0,
    selectedFiles: [],
    isEditMode: false,
    editingEventId: null,
    searchQuery: '',
    sortBy: 'newest',
    filterVisibility: 'all'
};

// DOM Elements Cache
// ============================================
const elements = {};

// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', init);

async function init() {
    // Wait for Firebase to be ready
    await waitForFirebase();
    
    // Initialize Firebase services
    auth = window.auth;
    db = window.db;
    storage = window.storage;
    googleProvider = window.googleProvider;
    
    cacheElements();
    setupEventListeners();
    initTheme();
    checkAuthState();
}

// Cache DOM Elements for Performance
// ============================================
function cacheElements() {
    // Navigation
    elements.themeToggle = document.getElementById('theme-toggle');
    elements.userMenu = document.getElementById('user-menu');
    elements.userBtn = document.getElementById('user-btn');
    elements.userAvatar = document.getElementById('user-avatar');
    elements.userName = document.getElementById('user-name');
    elements.dropdownMenu = document.getElementById('dropdown-menu');
    elements.authButtons = document.getElementById('auth-buttons');
    elements.loginBtn = document.getElementById('login-btn');
    elements.signupBtn = document.getElementById('signup-btn');
    elements.logoutBtn = document.getElementById('logout-btn');
    
    // Sections
    elements.authSection = document.getElementById('auth-section');
    elements.dashboardSection = document.getElementById('dashboard-section');
    elements.eventsSection = document.getElementById('events-section');
    elements.eventDetailSection = document.getElementById('event-detail-section');
    elements.publicEventSection = document.getElementById('public-event-section');
    elements.loadingOverlay = document.getElementById('loading-overlay');
    
    // Auth Form
    elements.authForm = document.getElementById('auth-form');
    elements.authEmail = document.getElementById('auth-email');
    elements.authPassword = document.getElementById('auth-password');
    elements.authName = document.getElementById('auth-name');
    elements.nameGroup = document.getElementById('name-group');
    elements.authSubmit = document.getElementById('auth-submit');
    elements.googleBtn = document.getElementById('google-btn');
    elements.authSwitchText = document.getElementById('auth-switch-text');
    elements.authSwitchBtn = document.getElementById('auth-switch-btn');
    
    // Dashboard
    elements.totalEvents = document.getElementById('total-events');
    elements.totalPhotos = document.getElementById('total-photos');
    elements.createEventBtn = document.getElementById('create-event-btn');
    elements.recentEventsList = document.getElementById('recent-events-list');
    
    // Events
    elements.newEventBtn = document.getElementById('new-event-btn');
    elements.eventsGrid = document.getElementById('events-grid');
    elements.searchEvents = document.getElementById('search-events');
    elements.sortEvents = document.getElementById('sort-events');
    elements.filterVisibility = document.getElementById('filter-visibility');
    elements.emptyEvents = document.getElementById('empty-events');
    
    // Event Detail
    elements.eventCoverDisplay = document.getElementById('event-cover-display');
    elements.eventCoverImg = document.getElementById('event-cover-img');
    elements.eventCoverPlaceholder = document.getElementById('event-cover-placeholder');
    elements.eventNameDisplay = document.getElementById('event-name-display');
    elements.eventDescriptionDisplay = document.getElementById('event-description-display');
    elements.eventDateDisplay = document.getElementById('event-date-display').querySelector('span');
    elements.eventVisibilityDisplay = document.getElementById('event-visibility-display').querySelector('span');
    elements.eventPhotoCount = document.getElementById('event-photo-count').querySelector('span');
    elements.photosGrid = document.getElementById('photos-grid');
    elements.emptyPhotos = document.getElementById('empty-photos');
    elements.shareEventBtn = document.getElementById('share-event-btn');
    elements.editEventBtn = document.getElementById('edit-event-btn');
    elements.deleteEventBtn = document.getElementById('delete-event-btn');
    elements.uploadPhotosBtn = document.getElementById('upload-photos-btn');
    elements.downloadAllBtn = document.getElementById('download-all-btn');
    
    // Upload Area
    elements.uploadArea = document.getElementById('upload-area');
    elements.dropzone = document.getElementById('dropzone');
    elements.fileInput = document.getElementById('file-input');
    elements.uploadPreview = document.getElementById('upload-preview');
    elements.uploadProgress = document.getElementById('upload-progress');
    elements.progressFill = document.getElementById('progress-fill');
    elements.progressText = document.getElementById('progress-text');
    
    // Event Modal
    elements.eventModal = document.getElementById('event-modal');
    elements.eventModalTitle = document.getElementById('event-modal-title');
    elements.eventForm = document.getElementById('event-form');
    elements.eventName = document.getElementById('event-name');
    elements.eventDescription = document.getElementById('event-description');
    elements.eventDate = document.getElementById('event-date');
    elements.eventCover = document.getElementById('event-cover');
    elements.coverPreview = document.getElementById('cover-preview');
    elements.coverPreviewImg = document.getElementById('cover-preview-img');
    elements.coverPlaceholder = document.getElementById('cover-placeholder');
    elements.eventPublic = document.getElementById('event-public');
    elements.saveEventBtn = document.getElementById('save-event-btn');
    
    // Confirm Modal
    elements.confirmModal = document.getElementById('confirm-modal');
    elements.confirmMessage = document.getElementById('confirm-message');
    elements.confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    
    // Share Modal
    elements.shareModal = document.getElementById('share-modal');
    elements.shareLink = document.getElementById('share-link');
    elements.copyLinkBtn = document.getElementById('copy-link-btn');
    
    // Lightbox
    elements.lightbox = document.getElementById('lightbox');
    elements.lightboxImg = document.getElementById('lightbox-img');
    elements.lightboxClose = document.getElementById('lightbox-close');
    elements.lightboxPrev = document.getElementById('lightbox-prev');
    elements.lightboxNext = document.getElementById('lightbox-next');
    elements.lightboxCaptionInput = document.getElementById('lightbox-caption-input');
    elements.lightboxDownload = document.getElementById('lightbox-download');
    elements.lightboxDelete = document.getElementById('lightbox-delete');
    
    // Public Event
    elements.publicEventName = document.getElementById('public-event-name');
    elements.publicEventDescription = document.getElementById('public-event-description');
    elements.publicEventDate = document.getElementById('public-event-date');
    elements.publicPhotosGrid = document.getElementById('public-photos-grid');
    elements.emptyPublicPhotos = document.getElementById('empty-public-photos');
    
    // Toast Container
    elements.toastContainer = document.getElementById('toast-container');
}

// Event Listeners Setup
// ============================================
function setupEventListeners() {
    // Theme Toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // User Menu
    elements.userBtn?.addEventListener('click', toggleUserMenu);
    document.addEventListener('click', (e) => {
        if (!elements.userMenu?.contains(e.target)) {
            elements.dropdownMenu?.classList.add('hidden');
        }
    });
    
    // Auth
    elements.loginBtn?.addEventListener('click', () => showAuthForm('login'));
    elements.signupBtn?.addEventListener('click', () => showAuthForm('signup'));
    elements.authForm.addEventListener('submit', handleAuthSubmit);
    elements.googleBtn.addEventListener('click', handleGoogleSignIn);
    elements.authSwitchBtn.addEventListener('click', toggleAuthMode);
    elements.logoutBtn?.addEventListener('click', handleLogout);
    
    // Navigation Links
    document.querySelectorAll('[data-link]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(e.target.closest('[data-link]').dataset.link);
        });
    });
    
    // Dashboard
    elements.createEventBtn?.addEventListener('click', () => openEventModal());
    document.querySelectorAll('[data-action="create-event"]').forEach(btn => {
        btn.addEventListener('click', () => openEventModal());
    });
    document.querySelectorAll('[data-action="upload-photos"]').forEach(btn => {
        btn.addEventListener('click', toggleUploadArea);
    });
    document.querySelectorAll('[data-action="view-gallery"]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo('events'));
    });
    
    // Events
    elements.newEventBtn?.addEventListener('click', () => openEventModal());
    elements.searchEvents?.addEventListener('input', debounce(handleSearch, 300));
    elements.sortEvents?.addEventListener('change', handleSortChange);
    elements.filterVisibility?.addEventListener('change', handleFilterChange);
    
    // Event Detail
    document.querySelectorAll('[data-action="back-to-events"]').forEach(btn => {
        btn.addEventListener('click', () => navigateTo('events'));
    });
    elements.shareEventBtn?.addEventListener('click', openShareModal);
    elements.editEventBtn?.addEventListener('click', () => openEventModal(state.currentEvent));
    elements.deleteEventBtn?.addEventListener('click', () => confirmDeleteEvent());
    elements.uploadPhotosBtn?.addEventListener('click', toggleUploadArea);
    elements.downloadAllBtn?.addEventListener('click', downloadAllPhotos);
    
    // File Upload
    elements.dropzone?.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput?.addEventListener('change', handleFileSelect);
    elements.dropzone?.addEventListener('dragover', handleDragOver);
    elements.dropzone?.addEventListener('dragleave', handleDragLeave);
    elements.dropzone?.addEventListener('drop', handleDrop);
    
    // Event Modal
    elements.eventForm.addEventListener('submit', handleEventSubmit);
    elements.coverPreview?.addEventListener('click', () => elements.eventCover.click());
    elements.eventCover?.addEventListener('change', handleCoverSelect);
    elements.saveEventBtn.addEventListener('click', handleEventSubmit);
    
    // Confirm Modal
    elements.confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
    
    // Share Modal
    elements.copyLinkBtn?.addEventListener('click', copyShareLink);
    
    // Lightbox
    elements.lightboxClose?.addEventListener('click', closeLightbox);
    elements.lightboxPrev?.addEventListener('click', () => navigateLightbox(-1));
    elements.lightboxNext?.addEventListener('click', () => navigateLightbox(1));
    elements.lightboxDownload?.addEventListener('click', downloadCurrentPhoto);
    elements.lightboxDelete?.addEventListener('click', () => confirmDeletePhoto());
    elements.lightboxCaptionInput?.addEventListener('blur', updatePhotoCaption);
    elements.lightboxCaptionInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            elements.lightboxCaptionInput.blur();
        }
    });
    
    // Keyboard Navigation
    document.addEventListener('keydown', handleKeyboardNav);
    
    // Modal Close Buttons
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => closeAllModals());
    });
    
    // Modal Backdrop Click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', closeAllModals);
    });
}

// Theme Management
// ============================================
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Authentication
// ============================================
function checkAuthState() {
    window.onAuthStateChanged(auth, async (user) => {
        state.user = user;
        
        // Check for shared event link first
        const sharedEventId = new URLSearchParams(window.location.search).get('event');
        
        if (sharedEventId) {
            await loadSharedEvent(sharedEventId);
            return;
        }
        
        if (user) {
            state.currentUser = user;
            await loadUserData(user);
            updateAuthUI(user);
            showSection('dashboard');
            await loadDashboardData();
        } else {
            state.currentUser = null;
            updateAuthUI(null);
            showSection('auth');
        }
    });
}

function updateAuthUI(user) {
    if (user) {
        elements.authButtons.classList.add('hidden');
        elements.userMenu.classList.remove('hidden');
        elements.userName.textContent = user.displayName || user.email;
        elements.userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=6366f1&color=fff`;
    } else {
        elements.authButtons.classList.remove('hidden');
        elements.userMenu.classList.add('hidden');
    }
}

function showAuthForm(mode = 'login') {
    state.authMode = mode;
    if (mode === 'login') {
        elements.authSubmit.textContent = 'Login';
        elements.nameGroup.classList.add('hidden');
        elements.authSwitchText.textContent = "Don't have an account?";
        elements.authSwitchBtn.textContent = 'Sign Up';
    } else {
        elements.authSubmit.textContent = 'Sign Up';
        elements.nameGroup.classList.remove('hidden');
        elements.authSwitchText.textContent = 'Already have an account?';
        elements.authSwitchBtn.textContent = 'Login';
    }
}

function toggleAuthMode() {
    showAuthForm(state.authMode === 'login' ? 'signup' : 'login');
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = elements.authEmail.value;
    const password = elements.authPassword.value;
    const name = elements.authName.value;
    
    try {
        showLoading();
        if (state.authMode === 'login') {
            await window.signInWithEmailAndPassword(auth, email, password);
            showToast('Welcome back!', 'success');
        } else {
            const credential = await window.createUserWithEmailAndPassword(auth, email, password);
            await window.updateProfile(credential.user, { displayName: name });
            await saveUserData(credential.user);
            showToast('Account created successfully!', 'success');
        }
        closeAllModals();
    } catch (error) {
        console.error('Auth error details:', error);
        showToast(`${getAuthErrorMessage(error.code)} (${error.message})`, 'error');
    } finally {
        hideLoading();
    }
}

async function handleGoogleSignIn() {
    try {
        showLoading();
        const result = await window.signInWithPopup(auth, googleProvider);
        const user = result.user;
        
        const userDoc = await window.getDoc(window.doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await saveUserData(user);
        }
        
        showToast('Signed in with Google!', 'success');
        closeAllModals();
    } catch (error) {
        showToast(getAuthErrorMessage(error.code), 'error');
    } finally {
        hideLoading();
    }
}

async function handleLogout() {
    try {
        await window.signOut(auth);
        showToast('Logged out successfully', 'success');
        navigateTo('home');
    } catch (error) {
        showToast('Failed to logout', 'error');
    }
}

async function saveUserData(user) {
    await window.setDoc(window.doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        createdAt: window.serverTimestamp()
    }, { merge: true });
}

async function loadUserData(user) {
    const userDoc = await window.getDoc(window.doc(db, 'users', user.uid));
    if (userDoc.exists()) {
        state.currentUser = { uid: user.uid, ...userDoc.data() };
    }
}

function getAuthErrorMessage(code) {
    const messages = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Invalid email address',
        'auth/operation-not-allowed': 'Email/Password not enabled. Go to Firebase Console > Authentication > Sign-in method > Enable Email/Password',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/user-disabled': 'This account has been disabled',
        'auth/user-not-found': 'No account found with this email',
        'auth/wrong-password': 'Incorrect password',
        'auth/popup-closed-by-user': 'Sign-in popup was closed',
        'auth/network-request-failed': 'Network error occurred'
    };
    return messages[code] || `An error occurred: ${code}`;
}

// Navigation
// ============================================
function navigateTo(section) {
    switch (section) {
        case 'home':
        case 'dashboard':
            showSection('dashboard');
            loadDashboardData();
            break;
        case 'events':
            showSection('events');
            loadEvents();
            break;
        default:
            showSection('dashboard');
    }
}

function showSection(sectionName) {
    const sections = ['auth', 'dashboard', 'events', 'event-detail', 'public-event'];
    sections.forEach(section => {
        const el = document.getElementById(`${section}-section`);
        if (el) {
            el.classList.add('hidden');
        }
    });
    
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
}

// User Menu
// ============================================
function toggleUserMenu() {
    elements.dropdownMenu.classList.toggle('hidden');
}

// Dashboard
// ============================================
async function loadDashboardData() {
    if (!state.user) return;
    
    try {
        showLoading();
        
        // Get event count
        const eventsQuery = window.query(window.collection(db, 'events'), window.where('userId', '==', state.currentUser.uid));
        const eventsSnapshot = await window.getDocs(eventsQuery);
        const eventCount = eventsSnapshot.size;
        
        // Get photo count
        let photoCount = 0;
        for (const eventDoc of eventsSnapshot.docs) {
            const photosQuery = window.query(window.collection(db, 'photos'), window.where('eventId', '==', eventDoc.id));
            const photosSnapshot = await window.getDocs(photosQuery);
            photoCount += photosSnapshot.size;
        }
        
        elements.totalEvents.textContent = eventCount;
        elements.totalPhotos.textContent = photoCount;
        
        // Load recent events
        const recentEventsQuery = window.query(
            window.collection(db, 'events'),
            window.where('userId', '==', state.currentUser.uid),
            window.orderBy('createdAt', 'desc'),
            window.limit(3)
        );
        const recentEvents = await window.getDocs(recentEventsQuery);
        
        state.events = recentEvents.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderRecentEvents();
        loadPhotoCounts();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showToast('Failed to load dashboard data', 'error');
    } finally {
        hideLoading();
    }
}

function renderRecentEvents() {
    if (state.events.length === 0) {
        elements.recentEventsList.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <p>No events yet. Create your first event!</p>
            </div>
        `;
        return;
    }
    
    elements.recentEventsList.innerHTML = state.events.map(event => createEventCard(event)).join('');
    
    // Add click listeners
    elements.recentEventsList.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => openEventDetail(card.dataset.id));
    });
}

// Events Management
// ============================================
async function loadEvents() {
    if (!state.user) return;
    
    try {
        showLoading();
        
        const sortDirection = state.sortBy === 'newest' ? 'desc' : 'asc';
        
        const eventsQuery = window.query(
            window.collection(db, 'events'),
            window.where('userId', '==', state.currentUser.uid),
            window.orderBy('createdAt', sortDirection)
        );
        
        const snapshot = await window.getDocs(eventsQuery);
        
        state.events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Apply search filter
        if (state.searchQuery) {
            state.events = state.events.filter(event => 
                event.name.toLowerCase().includes(state.searchQuery.toLowerCase())
            );
        }
        
        // Apply visibility filter
        if (state.filterVisibility !== 'all') {
            state.events = state.events.filter(event => 
                event.isPublic === (state.filterVisibility === 'public')
            );
        }
        
        renderEvents();
        loadPhotoCounts();
        
    } catch (error) {
        console.error('Error loading events:', error);
        showToast('Failed to load events', 'error');
    } finally {
        hideLoading();
    }
}

function renderEvents() {
    if (state.events.length === 0) {
        elements.eventsGrid.classList.add('hidden');
        elements.emptyEvents.classList.remove('hidden');
        return;
    }
    
    elements.eventsGrid.classList.remove('hidden');
    elements.emptyEvents.classList.add('hidden');
    elements.eventsGrid.innerHTML = state.events.map(event => createEventCard(event)).join('');
    
    // Add click listeners
    elements.eventsGrid.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => openEventDetail(card.dataset.id));
    });
}

function createEventCard(event) {
    const coverUrl = event.coverImage || '';
    const date = event.date ? formatDate(event.date) : '';
    const visibilityIcon = event.isPublic ? 'globe' : 'lock';
    const visibilityText = event.isPublic ? 'Public' : 'Private';
    
    return `
        <div class="event-card" data-id="${event.id}">
            <div class="event-card-cover">
                ${coverUrl 
                    ? `<img src="${coverUrl}" alt="${event.name}" loading="lazy">`
                    : `<div class="event-card-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                    </div>`
                }
                <span class="event-card-badge">${visibilityText}</span>
            </div>
            <div class="event-card-content">
                <h3 class="event-card-title">${escapeHtml(event.name)}</h3>
                ${event.description ? `<p class="event-card-description">${escapeHtml(event.description)}</p>` : ''}
                <div class="event-card-meta">
                    ${date ? `
                        <span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            ${date}
                        </span>
                    ` : ''}
                    <span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span class="photo-count" data-event-id="${event.id}">Loading...</span>
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Load photo counts for event cards
async function loadPhotoCounts() {
    const photoCountElements = document.querySelectorAll('.photo-count[data-event-id]');
    
    for (const el of photoCountElements) {
        const eventId = el.dataset.eventId;
        try {
            const photosQuery = window.query(window.collection(db, 'photos'), window.where('eventId', '==', eventId));
            const snapshot = await window.getDocs(photosQuery);
            el.textContent = `${snapshot.size} photo${snapshot.size !== 1 ? 's' : ''}`;
        } catch (error) {
            el.textContent = '0 photos';
        }
    }
}

// Event Modal
// ============================================
function openEventModal(event = null) {
    if (event) {
        state.isEditMode = true;
        state.editingEventId = event.id;
        elements.eventModalTitle.textContent = 'Edit Event';
        elements.eventName.value = event.name || '';
        elements.eventDescription.value = event.description || '';
        elements.eventDate.value = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
        elements.eventPublic.checked = event.isPublic || false;
        
        if (event.coverImage) {
            elements.coverPreviewImg.src = event.coverImage;
            elements.coverPreviewImg.classList.remove('hidden');
            elements.coverPlaceholder.classList.add('hidden');
        }
    } else {
        state.isEditMode = false;
        state.editingEventId = null;
        elements.eventModalTitle.textContent = 'Create Event';
        elements.eventForm.reset();
        elements.coverPreviewImg.src = '';
        elements.coverPreviewImg.classList.add('hidden');
        elements.coverPlaceholder.classList.remove('hidden');
    }
    
    openModal(elements.eventModal);
}

async function handleEventSubmit(e) {
    e.preventDefault();
    
    const name = elements.eventName.value.trim();
    const description = elements.eventDescription.value.trim();
    const date = elements.eventDate.value ? new Date(elements.eventDate.value) : null;
    const isPublic = elements.eventPublic.checked;
    
    if (!name) {
        showToast('Please enter an event name', 'error');
        return;
    }
    
    try {
        showLoading();
        
        let coverImage = '';
        
        // Upload cover image if selected
        if (elements.selectedCoverFile) {
            coverImage = await uploadCoverImage(elements.selectedCoverFile);
        } else if (state.isEditMode && state.currentEvent?.coverImage) {
            coverImage = state.currentEvent.coverImage;
        }
        
        const eventData = {
            userId: state.currentUser.uid,
            name,
            description,
            date: date ? window.Timestamp.fromDate(date) : null,
            isPublic,
            coverImage,
            updatedAt: window.serverTimestamp()
        };
        
        if (state.isEditMode) {
            await window.updateDoc(window.doc(db, 'events', state.editingEventId), eventData);
            showToast('Event updated successfully!', 'success');
        } else {
            eventData.createdAt = window.serverTimestamp();
            await window.addDoc(window.collection(db, 'events'), eventData);
            showToast('Event created successfully!', 'success');
        }
        
        closeAllModals();
        elements.selectedCoverFile = null;
        
        // Refresh the current view
        if (state.currentEvent) {
            await loadEvents();
        }
        await loadEvents();
        await loadDashboardData();
        
    } catch (error) {
        console.error('Error saving event:', error);
        showToast('Failed to save event', 'error');
    } finally {
        hideLoading();
    }
}

async function uploadCoverImage(file) {
    const ref = window.storageRef(storage, `covers/${state.currentUser.uid}/${Date.now()}_${file.name}`);
    await window.uploadBytes(ref, file);
    return await window.storageGetDownloadURL(ref);
}

function handleCoverSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    elements.selectedCoverFile = file;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.coverPreviewImg.src = e.target.result;
        elements.coverPreviewImg.classList.remove('hidden');
        elements.coverPlaceholder.classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

// Event Detail
// ============================================
async function openEventDetail(eventId) {
    try {
        showLoading();
        
        const eventDoc = await window.getDoc(window.doc(db, 'events', eventId));
        
        if (!eventDoc.exists()) {
            showToast('Event not found', 'error');
            navigateTo('events');
            return;
        }
        
        state.currentEvent = { id: eventDoc.id, ...eventDoc.data() };
        
        // Check access
        if (!state.currentEvent.isPublic && state.currentEvent.userId !== state.currentUser?.uid) {
            showToast('You do not have access to this event', 'error');
            navigateTo('events');
            return;
        }
        
        // Update UI
        elements.eventNameDisplay.textContent = state.currentEvent.name;
        elements.eventDescriptionDisplay.textContent = state.currentEvent.description || 'No description';
        elements.eventDateDisplay.textContent = state.currentEvent.date ? formatDate(state.currentEvent.date) : 'No date';
        elements.eventVisibilityDisplay.textContent = state.currentEvent.isPublic ? 'Public' : 'Private';
        
        if (state.currentEvent.coverImage) {
            elements.eventCoverImg.src = state.currentEvent.coverImage;
            elements.eventCoverImg.classList.remove('hidden');
            elements.eventCoverPlaceholder.classList.add('hidden');
        } else {
            elements.eventCoverImg.classList.add('hidden');
            elements.eventCoverPlaceholder.classList.remove('hidden');
        }
        
        // Show section
        showSection('event-detail');
        
        // Load photos
        await loadPhotos(eventId);
        await loadPhotoCount();
        
        // Update visibility of edit buttons
        const isOwner = state.currentEvent.userId === state.currentUser?.uid;
        elements.editEventBtn.classList.toggle('hidden', !isOwner);
        elements.deleteEventBtn.classList.toggle('hidden', !isOwner);
        elements.uploadPhotosBtn.classList.toggle('hidden', !isOwner);
        elements.shareEventBtn.classList.toggle('hidden', !state.currentEvent.isPublic);
        elements.downloadAllBtn.classList.toggle('hidden', !isOwner);
        
    } catch (error) {
        console.error('Error opening event:', error);
        showToast('Failed to load event', 'error');
    } finally {
        hideLoading();
    }
}

async function loadPhotoCount() {
    try {
        const photosQuery = window.query(window.collection(db, 'photos'), window.where('eventId', '==', state.currentEvent.id));
        const snapshot = await window.getDocs(photosQuery);
        elements.eventPhotoCount.textContent = `${snapshot.size} photo${snapshot.size !== 1 ? 's' : ''}`;
    } catch (error) {
        elements.eventPhotoCount.textContent = '0 photos';
    }
}

// Photos Management
// ============================================
async function loadPhotos(eventId) {
    try {
        const photosQuery = window.query(
            window.collection(db, 'photos'),
            window.where('eventId', '==', eventId),
            window.orderBy('createdAt', 'desc')
        );
        const snapshot = await window.getDocs(photosQuery);
        
        state.currentPhotos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        renderPhotos();
        
    } catch (error) {
        console.error('Error loading photos:', error);
        showToast('Failed to load photos', 'error');
    }
}

function renderPhotos() {
    if (state.currentPhotos.length === 0) {
        elements.photosGrid.classList.add('hidden');
        elements.emptyPhotos.classList.remove('hidden');
        return;
    }
    
    elements.photosGrid.classList.remove('hidden');
    elements.emptyPhotos.classList.add('hidden');
    elements.photosGrid.innerHTML = state.currentPhotos.map((photo, index) => `
        <div class="photo-card" data-index="${index}" data-id="${photo.id}">
            <img src="${photo.url}" alt="${photo.caption || 'Photo'}" loading="lazy">
            <div class="photo-card-overlay">
                ${photo.caption ? `<p class="photo-card-caption">${escapeHtml(photo.caption)}</p>` : ''}
                <div class="photo-card-actions">
                    <button class="download-btn" title="Download">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                    </button>
                    <button class="delete-btn" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    elements.photosGrid.querySelectorAll('.photo-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.photo-card-actions')) {
                openLightbox(parseInt(card.dataset.index));
            }
        });
    });
    
    elements.photosGrid.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const photoId = btn.closest('.photo-card').dataset.id;
            downloadPhoto(photoId);
        });
    });
    
    elements.photosGrid.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const photoId = btn.closest('.photo-card').dataset.id;
            confirmDeletePhoto(photoId);
        });
    });
}

// File Upload
// ============================================
function toggleUploadArea() {
    elements.uploadArea.classList.toggle('hidden');
    if (!elements.uploadArea.classList.contains('hidden')) {
        elements.dropzone.scrollIntoView({ behavior: 'smooth' });
    }
}

function handleDragOver(e) {
    e.preventDefault();
    elements.dropzone.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.dropzone.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    elements.dropzone.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
}

function handleFiles(files) {
    state.selectedFiles = [...state.selectedFiles, ...files];
    renderUploadPreview();
}

function renderUploadPreview() {
    elements.uploadPreview.classList.remove('hidden');
    elements.uploadPreview.innerHTML = state.selectedFiles.map((file, index) => `
        <div class="upload-preview-item" data-index="${index}">
            <img src="${URL.createObjectURL(file)}" alt="Preview">
            <button class="remove-btn" data-index="${index}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');
    
    elements.uploadPreview.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            state.selectedFiles.splice(index, 1);
            if (state.selectedFiles.length === 0) {
                elements.uploadPreview.classList.add('hidden');
            } else {
                renderUploadPreview();
            }
        });
    });
    
    // Start upload
    uploadPhotos();
}

async function uploadPhotos() {
    if (state.selectedFiles.length === 0) return;
    
    elements.uploadProgress.classList.remove('hidden');
    const totalFiles = state.selectedFiles.length;
    let uploaded = 0;
    
    for (const file of state.selectedFiles) {
        try {
            // Compress image
            const compressedFile = await compressImage(file);
            
            // Upload to Storage
            const fileName = `${Date.now()}_${file.name}`;
            const ref = window.storageRef(storage, `photos/${state.currentUser.uid}/${state.currentEvent.id}/${fileName}`);
            const snapshot = await window.uploadBytes(ref, compressedFile);
            const downloadURL = await window.storageGetDownloadURL(snapshot.ref);
            
            // Save to Firestore
            await window.addDoc(window.collection(db, 'photos'), {
                userId: state.currentUser.uid,
                eventId: state.currentEvent.id,
                url: downloadURL,
                caption: '',
                createdAt: window.serverTimestamp()
            });
            
            uploaded++;
            const progress = Math.round((uploaded / totalFiles) * 100);
            elements.progressFill.style.width = `${progress}%`;
            elements.progressText.textContent = `Uploading ${uploaded} of ${totalFiles}...`;
            
        } catch (error) {
            console.error('Error uploading photo:', error);
            showToast(`Failed to upload ${file.name}`, 'error');
        }
    }
    
    // Reset
    state.selectedFiles = [];
    elements.uploadPreview.classList.add('hidden');
    elements.uploadProgress.classList.add('hidden');
    elements.progressFill.style.width = '0%';
    elements.fileInput.value = '';
    
    showToast(`${uploaded} photo${uploaded !== 1 ? 's' : ''} uploaded successfully!`, 'success');
    
    // Reload photos
    await loadPhotos(state.currentEvent.id);
    await loadPhotoCount();
    await loadDashboardData();
}

async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 1920;
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: 'image/jpeg', quality: 0.8 }));
                }, 'image/jpeg', 0.8);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Photo Actions
// ============================================
async function downloadPhoto(photoId) {
    const photo = state.currentPhotos.find(p => p.id === photoId);
    if (!photo) return;
    
    try {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `photo_${photoId}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        showToast('Failed to download photo', 'error');
    }
}

function downloadCurrentPhoto() {
    const photo = state.currentPhotos[state.currentPhotoIndex];
    if (photo) {
        downloadPhoto(photo.id);
    }
}

async function downloadAllPhotos() {
    if (state.currentPhotos.length === 0) {
        showToast('No photos to download', 'warning');
        return;
    }
    
    showToast(`Downloading ${state.currentPhotos.length} photos...`, 'success');
    
    for (const photo of state.currentPhotos) {
        await downloadPhoto(photo.id);
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Lightbox
// ============================================
function openLightbox(index) {
    state.currentPhotoIndex = index;
    updateLightbox();
    elements.lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function updateLightbox() {
    const photo = state.currentPhotos[state.currentPhotoIndex];
    if (!photo) return;
    
    elements.lightboxImg.src = photo.url;
    elements.lightboxImg.alt = photo.caption || 'Photo';
    elements.lightboxCaptionInput.value = photo.caption || '';
    
    // Show/hide navigation
    elements.lightboxPrev.style.display = state.currentPhotoIndex > 0 ? 'flex' : 'none';
    elements.lightboxNext.style.display = state.currentPhotoIndex < state.currentPhotos.length - 1 ? 'flex' : 'none';
}

function closeLightbox() {
    elements.lightbox.classList.add('hidden');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    const newIndex = state.currentPhotoIndex + direction;
    if (newIndex >= 0 && newIndex < state.currentPhotos.length) {
        state.currentPhotoIndex = newIndex;
        updateLightbox();
    }
}

async function updatePhotoCaption() {
    const photo = state.currentPhotos[state.currentPhotoIndex];
    if (!photo) return;
    
    const newCaption = elements.lightboxCaptionInput.value.trim();
    
    if (newCaption !== photo.caption) {
        try {
            await window.updateDoc(window.doc(db, 'photos', photo.id), { caption: newCaption });
            state.currentPhotos[state.currentPhotoIndex].caption = newCaption;
            showToast('Caption updated', 'success');
        } catch (error) {
            showToast('Failed to update caption', 'error');
        }
    }
}

// Delete Functions
// ============================================
let deleteCallback = null;

function confirmDeleteEvent() {
    elements.confirmMessage.textContent = `Are you sure you want to delete "${state.currentEvent.name}"? This will also delete all photos in this event.`;
    deleteCallback = async () => {
        try {
            showLoading();
            
            // Delete all photos
            const photosQuery = window.query(window.collection(db, 'photos'), window.where('eventId', '==', state.currentEvent.id));
            const photosSnapshot = await window.getDocs(photosQuery);
            
            for (const photoDoc of photosSnapshot.docs) {
                // Delete from storage
                try {
                    const photoRef = window.storageRef(storage, photoDoc.data().url);
                    await window.storageDelete(photoRef);
                } catch (e) {
                    console.warn('Could not delete photo file:', e);
                }
                // Delete from Firestore
                await window.deleteDoc(photoDoc.ref);
            }
            
            // Delete event
            await window.deleteDoc(window.doc(db, 'events', state.currentEvent.id));
            
            showToast('Event deleted successfully', 'success');
            state.currentEvent = null;
            closeAllModals();
            await loadEvents();
            await loadDashboardData();
            navigateTo('events');
            
        } catch (error) {
            console.error('Error deleting event:', error);
            showToast('Failed to delete event', 'error');
        } finally {
            hideLoading();
        }
    };
    openModal(elements.confirmModal);
}

function confirmDeletePhoto(photoId = null) {
    const targetPhoto = photoId 
        ? state.currentPhotos.find(p => p.id === photoId)
        : state.currentPhotos[state.currentPhotoIndex];
    
    elements.confirmMessage.textContent = `Are you sure you want to delete this photo?`;
    deleteCallback = async () => {
        try {
            showLoading();
            
            // Delete from storage
            try {
                const photoRef = window.storageRef(storage, targetPhoto.url);
                await window.storageDelete(photoRef);
            } catch (e) {
                console.warn('Could not delete photo file:', e);
            }
            
            // Delete from Firestore
            await window.deleteDoc(window.doc(db, 'photos', targetPhoto.id));
            
            showToast('Photo deleted', 'success');
            closeAllModals();
            closeLightbox();
            
            // Reload photos
            await loadPhotos(state.currentEvent.id);
            await loadPhotoCount();
            await loadDashboardData();
            
        } catch (error) {
            console.error('Error deleting photo:', error);
            showToast('Failed to delete photo', 'error');
        } finally {
            hideLoading();
        }
    };
    openModal(elements.confirmModal);
}

async function handleConfirmDelete() {
    if (deleteCallback) {
        await deleteCallback();
        deleteCallback = null;
    }
}

// Share Modal
// ============================================
function openShareModal() {
    if (!state.currentEvent) return;
    
    const shareUrl = `${window.location.origin}${window.location.pathname}?event=${state.currentEvent.id}`;
    elements.shareLink.value = shareUrl;
    openModal(elements.shareModal);
}

function copyShareLink() {
    elements.shareLink.select();
    document.execCommand('copy');
    showToast('Link copied to clipboard!', 'success');
}

// Search & Filter
// ============================================
function handleSearch(e) {
    state.searchQuery = e.target.value;
    loadEvents();
}

function handleSortChange(e) {
    state.sortBy = e.target.value;
    loadEvents();
}

function handleFilterChange(e) {
    state.filterVisibility = e.target.value;
    loadEvents();
}

// Modal Helpers
// ============================================
function openModal(modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    document.body.style.overflow = '';
}

// Keyboard Navigation
// ============================================
function handleKeyboardNav(e) {
    // Lightbox navigation
    if (!elements.lightbox.classList.contains('hidden')) {
        switch (e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                navigateLightbox(-1);
                break;
            case 'ArrowRight':
                navigateLightbox(1);
                break;
        }
    }
    
    // Modal escape
    if (e.key === 'Escape' && !elements.lightbox.classList.contains('hidden')) {
        closeLightbox();
    }
}

// Toast Notifications
// ============================================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${escapeHtml(message)}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Loading State
// ============================================
function showLoading() {
    elements.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
}

// Utility Functions
// ============================================
function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check for shared event link on load
async function loadSharedEvent(eventId) {
    try {
        showLoading();
        
        const eventDoc = await window.getDoc(window.doc(db, 'events', eventId));
        
        if (!eventDoc.exists()) {
            showToast('Event not found', 'error');
            return;
        }
        
        const eventData = { id: eventDoc.id, ...eventDoc.data() };
        
        if (!eventData.isPublic && eventData.userId !== state.currentUser?.uid) {
            showToast('This event is private', 'error');
            return;
        }
        
        elements.publicEventName.textContent = eventData.name;
        elements.publicEventDescription.textContent = eventData.description || '';
        elements.publicEventDate.textContent = eventData.date ? formatDate(eventData.date) : '';
        
        showSection('public-event');
        
        // Load public photos
        const photosQuery = window.query(
            window.collection(db, 'photos'),
            window.where('eventId', '==', eventId),
            window.orderBy('createdAt', 'desc')
        );
        const photosSnapshot = await window.getDocs(photosQuery);
        
        const photos = photosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (photos.length === 0) {
            elements.publicPhotosGrid.classList.add('hidden');
            elements.emptyPublicPhotos.classList.remove('hidden');
        } else {
            elements.publicPhotosGrid.classList.remove('hidden');
            elements.emptyPublicPhotos.classList.add('hidden');
            elements.publicPhotosGrid.innerHTML = photos.map((photo, index) => `
                <div class="photo-card" data-index="${index}">
                    <img src="${photo.url}" alt="${photo.caption || 'Photo'}" loading="lazy">
                    ${photo.caption ? `<div class="photo-card-overlay"><p class="photo-card-caption">${escapeHtml(photo.caption)}</p></div>` : ''}
                </div>
            `).join('');
            
            elements.publicPhotosGrid.querySelectorAll('.photo-card').forEach(card => {
                card.addEventListener('click', () => {
                    openLightbox(parseInt(card.dataset.index));
                    state.currentPhotos = photos;
                });
            });
        }
        
    } catch (error) {
        console.error('Error loading shared event:', error);
        showToast('Failed to load event', 'error');
    } finally {
        hideLoading();
    }
}

// Expose loadPhotoCounts globally for event cards
window.loadPhotoCounts = loadPhotoCounts;
