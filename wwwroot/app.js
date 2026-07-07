/* ==========================================================================
   ANSHAISHA HOME COOKED FOOD - INTERACTIVE PROTOTYPE JAVASCRIPT
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. DATA MODELS & STATE MANAGEMENT
// --------------------------------------------------------------------------

// In-Memory Database State
const state = {
    // Current user context
    currentView: 'admin-mob', // admin-mob | cust-mob | admin-desk | cust-desk
    activeAdminTab: 'dash',   // dash | menu | orders | payments | finances
    activeDeskTab: 'dashboard',
    activeCustTab: 'menu',    // menu | orders | profile
    
    // Kitchen Open/Close Today & Future Booking state variables
    kitchenClosedToday: false,
    customerOrderingDate: 'today',
    customerSelectedFutureDate: '',
    dashboardOrdersExpanded: false,
    isCustomerLoggedIn: false,
    
    // Admin Security PIN Entry
    enteredPin: '',
    isAdminUnlocked: false,

    // Active Daily Menu Details
    menu: {
        session: 'Lunch', // Lunch | Dinner
        graphicTemplate: 'saffron', // saffron | mint | dark
        mealDescription: "1 Dal Tadka, 1 Aloo Gobhi Sabji, 4 Rotis, 1 Bowl Rice, Salad, Chutney",
        mealPrice: 200,
        addons: {
            roti: 10,
            rice: -20,
            sabji: 40
        },
        items: []
    },

    // Kitchen Orders DB
    orders: [],

    // Order History Ledger (Archived orders from previous days)
    orderHistory: [],

    // Outstanding Payments DB
    payments: [],

    // Business Expenses DB (Logged Today)
    expenses: [],

    // Global stats calculated dynamically
    stats: {
        revenue: 0,
        expenses: 0,
        profit: 0
    },

    // Customer Shopping Cart state
    cart: [],
    customerProfile: {
        name: '',
        phone: '',
        avatar: '👩‍💼'
    },
    customerAddress: {
        tower: 'Alexander',
        floor: '1',
        flat: '1'
    },

    // Customer Database List & Stats (Analytics)
    customersList: [],

    // Usability Testing Loggers
    usability: {
        taps: 0,
        startTime: null,
        activeWorkflow: null,
        lastReport: '-'
    },
    
    // App announcements
    announcements: [],
    
    // Leave status
    leave: {
        declared: false,
        dates: [],
        reason: ''
    }
};

// Default preset items copy to recover during reset
const initialBackup = JSON.parse(JSON.stringify(state));

// --------------------------------------------------------------------------
// BACKEND SYNC AND VIEW REFRESHING LOGIC
// --------------------------------------------------------------------------
async function syncStateWithBackend(isAutoInterval = false) {
    try {
        const res = await fetch('/api/state');
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        
        state.kitchenClosedToday = data.kitchenClosedToday;
        state.menu = data.menu;
        state.orders = data.orders;
        state.orderHistory = data.orderHistory;
        state.payments = data.payments;
        state.expenses = data.expenses;
        state.stats = data.stats;
        state.customersList = data.customersList;
        state.announcements = data.announcements;
        state.leave = data.leave;

        // Re-render simulator quick profiles list if loaded
        if (typeof renderQuickProfiles === 'function') {
            renderQuickProfiles();
        }

        // Sync kitchen status UI elements
        if (typeof updateKitchenClosedTodayUI === 'function') {
            updateKitchenClosedTodayUI(state.kitchenClosedToday);
        }

        refreshActiveView(isAutoInterval);
    } catch (e) {
        console.error('Error syncing state:', e);
    }
}

function refreshActiveView(isAutoInterval = false) {
    if (state.currentView === 'admin-mob') {
        if (state.isAdminUnlocked) {
            if (state.activeAdminTab === 'dash') renderAdminDashboard();
            else if (state.activeAdminTab === 'menu') {
                if (!isAutoInterval) renderAdminMenuBuilder();
            }
            else if (state.activeAdminTab === 'orders') renderAdminOrders();
            else if (state.activeAdminTab === 'payments') renderAdminPayments();
            else if (state.activeAdminTab === 'finances') renderAdminFinances();
        }
    } else if (state.currentView === 'cust-mob') {
        if (state.isCustomerLoggedIn) {
            if (state.activeCustTab === 'menu') renderCustomerMenu();
            else if (state.activeCustTab === 'orders') renderCustomerTracking();
            else if (state.activeCustTab === 'profile') {
                if (!isAutoInterval) renderCustomerProfileTab();
            }
        }
    } else if (state.currentView === 'admin-desk') {
        renderAdminDesktop();
    } else if (state.currentView === 'cust-desk') {
        renderCustomerDesktop();
    }
}

// --------------------------------------------------------------------------
// 2. USABILITY TRACKER & METRICS
// --------------------------------------------------------------------------

function trackTap() {
    state.usability.taps++;
    const tapCountEl = document.getElementById('tap-count');
    if (tapCountEl) tapCountEl.textContent = state.usability.taps;
}

function startWorkflow(workflowName) {
    state.usability.startTime = performance.now();
    state.usability.activeWorkflow = workflowName;
    state.usability.taps = 1; // Count first tap
    const tapCountEl = document.getElementById('tap-count');
    if (tapCountEl) tapCountEl.textContent = state.usability.taps;
    const lastActionEl = document.getElementById('last-action');
    if (lastActionEl) lastActionEl.textContent = `In Progress: ${workflowName}`;
    const actionTimerEl = document.getElementById('action-timer');
    if (actionTimerEl) actionTimerEl.textContent = "0.0s";
}

function completeWorkflow(successMessage) {
    if (!state.usability.startTime) return;
    const duration = ((performance.now() - state.usability.startTime) / 1000).toFixed(1);
    
    state.usability.lastReport = `${state.usability.activeWorkflow} in ${state.usability.taps} taps (${duration}s)`;
    const lastActionEl = document.getElementById('last-action');
    if (lastActionEl) lastActionEl.textContent = state.usability.lastReport;
    const actionTimerEl = document.getElementById('action-timer');
    if (actionTimerEl) actionTimerEl.textContent = `${duration}s`;
    
    // Display custom usability toast
    showToast(`⏱️ Usability Success: ${successMessage} completed in ${state.usability.taps} taps, ${duration}s!`, 'usability');
    
    // Verify checklist criteria compliance
    checkUsabilityCompliance(state.usability.activeWorkflow, state.usability.taps, parseFloat(duration));
    
    // Clear workflow state
    state.usability.startTime = null;
    state.usability.activeWorkflow = null;
}

function checkUsabilityCompliance(workflow, taps, seconds) {
    if (workflow === 'Publish Menu' && seconds <= 120) {
        markGoalSuccess('goal-menu');
    } else if (workflow === 'Accept Order' && seconds <= 5) {
        markGoalSuccess('goal-accept');
    } else if (workflow === 'Record Payment' && seconds <= 10) {
        markGoalSuccess('goal-payment');
    } else if (workflow === 'Check Profit' && seconds <= 15) {
        markGoalSuccess('goal-profit');
    }
}

function markGoalSuccess(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.classList.add('success');
    }
}

// --------------------------------------------------------------------------
// 3. SOUND CHIME (WEB AUDIO API)
// --------------------------------------------------------------------------

function playNotificationSound() {
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        
        // High soft chime note 1
        const osc1 = context.createOscillator();
        const gain1 = context.createGain();
        osc1.connect(gain1);
        gain1.connect(context.destination);
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, context.currentTime); // A5
        osc1.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.15); // E6
        
        gain1.gain.setValueAtTime(0.12, context.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.35);
        
        osc1.start(context.currentTime);
        osc1.stop(context.currentTime + 0.4);
        
        // Slightly delayed harmony note
        setTimeout(() => {
            const osc2 = context.createOscillator();
            const gain2 = context.createGain();
            osc2.connect(gain2);
            gain2.connect(context.destination);
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1046.5, context.currentTime); // C6
            osc2.frequency.exponentialRampToValueAtTime(1760, context.currentTime + 0.15); // A6
            
            gain2.gain.setValueAtTime(0.08, context.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.35);
            
            osc2.start(context.currentTime);
            osc2.stop(context.currentTime + 0.35);
        }, 120);

    } catch (e) {
        console.warn("Audio Context block by browser safety. Action recorded silently.");
    }
}

// --------------------------------------------------------------------------
// 4. SCREEN ROUTING & LOCK CONTROLLER
// --------------------------------------------------------------------------

function switchView(viewName) {
    trackTap();
    state.currentView = viewName;
    
    // Toggle active switcher button style
    document.querySelectorAll('.view-switcher button').forEach(btn => btn.classList.remove('active'));
    
    // Toggle visible canvases
    document.querySelectorAll('.canvas-view').forEach(view => view.classList.remove('active'));
    
    if (viewName === 'admin-mob') {
        const switcherBtn = document.getElementById('btn-admin-mob');
        if (switcherBtn) switcherBtn.classList.add('active');
        document.getElementById('view-admin-mob').classList.add('active');
        if (state.isAdminUnlocked) {
            adminSwitchTab(state.activeAdminTab);
        } else {
            showAdminLoginScreen();
        }
    } else if (viewName === 'cust-mob') {
        const switcherBtn = document.getElementById('btn-cust-mob');
        if (switcherBtn) switcherBtn.classList.add('active');
        document.getElementById('view-cust-mob').classList.add('active');
        
        if (state.isCustomerLoggedIn) {
            document.getElementById('cust-login-screen').classList.remove('active');
            document.getElementById('cust-login-screen').style.display = 'none';
            document.getElementById('customer-app-shell').classList.add('active');
            document.getElementById('customer-app-shell').style.display = 'flex';
            custSwitchTab(state.activeCustTab || 'menu');
        } else {
            document.getElementById('cust-login-screen').classList.add('active');
            document.getElementById('cust-login-screen').style.display = 'flex';
            document.getElementById('customer-app-shell').classList.remove('active');
            document.getElementById('customer-app-shell').style.display = 'none';
        }
    } else if (viewName === 'admin-desk') {
        const switcherBtn = document.getElementById('btn-admin-desk');
        if (switcherBtn) switcherBtn.classList.add('active');
        document.getElementById('view-admin-desk').classList.add('active');
        renderAdminDesktop();
    } else if (viewName === 'cust-desk') {
        const switcherBtn = document.getElementById('btn-cust-desk');
        if (switcherBtn) switcherBtn.classList.add('active');
        document.getElementById('view-cust-desk').classList.add('active');
        renderCustomerDesktop();
    }
}

function showAdminLoginScreen() {
    state.enteredPin = '';
    updatePinDots();
    document.getElementById('admin-login-screen').classList.add('active');
    document.getElementById('admin-app-shell').classList.remove('active');
}

function pressPin(digit) {
    trackTap();
    if (state.enteredPin.length < 4) {
        state.enteredPin += digit;
        updatePinDots();
    }
    
    if (state.enteredPin.length === 4) {
        setTimeout(submitPin, 200);
    }
}

function clearPin() {
    trackTap();
    state.enteredPin = '';
    updatePinDots();
}

function updatePinDots() {
    const dots = document.querySelectorAll('.pin-dots .dot');
    dots.forEach((dot, index) => {
        if (index < state.enteredPin.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

function quickLogin() {
    state.enteredPin = '1234';
    submitPin();
}

function submitPin() {
    if (state.enteredPin === '1234') {
        state.isAdminUnlocked = true;
        localStorage.setItem('adminUnlocked', 'true');
        
        // Switch Screen view
        document.getElementById('admin-login-screen').classList.remove('active');
        document.getElementById('admin-app-shell').classList.add('active');
        
        // Initial Render
        recalculateFinances();
        adminSwitchTab('dash');
    } else {
        showToast("❌ Incorrect PIN. Please try again.", "error");
        clearPin();
    }
}

function logoutAdmin() {
    trackTap();
    state.isAdminUnlocked = false;
    localStorage.removeItem('adminUnlocked');
    showAdminLoginScreen();
    showToast("🔒 Admin screen locked.", "info");
}

function adminSwitchTab(tabName) {
    trackTap();
    state.activeAdminTab = tabName;
    
    // If user opens finance tab, start check profit workflow
    if (tabName === 'finances') {
        startWorkflow('Check Profit');
        setTimeout(() => {
            completeWorkflow('Profit Checked');
        }, 100);
    }

    // Toggle active class on tab buttons
    const navItems = document.querySelectorAll('.app-nav-bar .nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Toggle active tab content
    document.querySelectorAll('#admin-app-shell .tab-content').forEach(c => c.classList.remove('active'));
    
    if (tabName === 'dash') {
        navItems[0].classList.add('active');
        document.getElementById('tab-admin-dash').classList.add('active');
        renderAdminDashboard();
    } else if (tabName === 'menu') {
        navItems[1].classList.add('active');
        document.getElementById('tab-admin-menu').classList.add('active');
        startWorkflow('Publish Menu');
        renderAdminMenuBuilder();
    } else if (tabName === 'orders') {
        navItems[2].classList.add('active');
        document.getElementById('tab-admin-orders').classList.add('active');
        renderAdminOrders();
    } else if (tabName === 'payments') {
        navItems[3].classList.add('active');
        document.getElementById('tab-admin-payments').classList.add('active');
        renderAdminPayments();
    } else if (tabName === 'finances') {
        navItems[4].classList.add('active');
        document.getElementById('tab-admin-finances').classList.add('active');
        renderAdminFinances();
    }
}

// --------------------------------------------------------------------------
// 5. CORE WORKFLOWS: MENU BUILDER
// --------------------------------------------------------------------------

function renderAdminMenuBuilder() {
    // Sync editor box value
    document.getElementById('complete-meal-desc-input').value = state.menu.mealDescription;
    document.getElementById('rate-extra-roti').value = state.menu.addons.roti;
    const rateNoRiceEl = document.getElementById('rate-no-rice');
    if (rateNoRiceEl) {
        rateNoRiceEl.value = Math.abs(state.menu.addons.rice);
    }
    document.getElementById('rate-extra-sabji').value = state.menu.addons.sabji;

    // Render other optional presets
    const container = document.getElementById('optional-presets-list');
    container.innerHTML = '';
    
    state.menu.items.forEach(d => {
        if (d.isMeal) return; // Meal handles separately
        const chip = document.createElement('label');
        chip.className = `preset-chip ${d.checked ? 'active' : ''}`;
        chip.innerHTML = `
            <input type="checkbox" ${d.checked ? 'checked' : ''} value="${d.name}" data-price="${d.price}" onchange="togglePresetChip(this)">
            <span>🍛 ${d.name.split(' (')[0]} (₹${d.price})</span>
        `;
        container.appendChild(chip);
    });
}

function togglePresetChip(checkbox) {
    trackTap();
    const isChecked = checkbox.checked;
    const value = checkbox.value;
    
    const chip = checkbox.parentElement;
    if (isChecked) {
        chip.classList.add('active');
    } else {
        chip.classList.remove('active');
    }
    
    // Update local state
    const dish = state.menu.items.find(d => d.name === value || d.name.startsWith(value));
    if (dish) {
        dish.checked = isChecked;
    }
    
    // Toggle Editor visibility
    if (value === 'Anshaisha Complete Meal') {
        const editorBox = document.getElementById('meal-details-editor-box');
        editorBox.style.display = isChecked ? 'flex' : 'none';
    }
}

async function addCustomDish() {
    trackTap();
    const nameInput = document.getElementById('custom-dish-name');
    const priceInput = document.getElementById('custom-dish-price');
    const name = nameInput.value.trim();
    const price = parseInt(priceInput.value);
    
    if (!name || isNaN(price) || price <= 0) {
        showToast("⚠️ Type a valid dish name and price", "info");
        return;
    }
    
    try {
        const res = await fetch('/api/menu/items/custom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price })
        });
        if (!res.ok) throw new Error("Failed to add custom dish");
        
        await syncStateWithBackend();
        
        nameInput.value = '';
        priceInput.value = '';
        
        showToast(`🍽️ Added "${name}" to presets!`, 'success');
    } catch (e) {
        showToast("❌ Error: " + e.message, "danger");
    }
}

async function publishDailyMenu() {
    trackTap();
    const selectedSession = document.querySelector('input[name="menu-time"]:checked').value;
    const mealDesc = document.getElementById('complete-meal-desc-input').value.trim();
    const rotiRate = parseInt(document.getElementById('rate-extra-roti').value) || 10;
    const riceRate = 0; // Default flat discount for No Rice (disabled as option is removed from builder)
    const sabjiRate = parseInt(document.getElementById('rate-extra-sabji').value) || 40;
    
    const activeDishes = state.menu.items.filter(item => item.checked);
    if (activeDishes.length === 0) {
        showToast("⚠️ Select at least 1 dish to publish!", "info");
        return;
    }

    const checkedItemIds = activeDishes.map(item => item.id);
    
    try {
        const res = await fetch('/api/menu/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session: selectedSession,
                mealDescription: mealDesc,
                addonRoti: rotiRate,
                addonRice: riceRate,
                addonSabji: sabjiRate,
                checkedItemIds: checkedItemIds
            })
        });
        
        if (!res.ok) throw new Error("Failed to publish menu.");
        
        await syncStateWithBackend();
        
        // Compile WhatsApp preview message
        const isTodaySelected = document.getElementById('menu-date-today').checked;
        const targetDate = new Date();
        if (!isTodaySelected) {
            targetDate.setDate(targetDate.getDate() + 1);
        }
        const dateStr = targetDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
        let msg = `*Menu for ${dateStr}* 🍛 *${selectedSession.toUpperCase()} SPECIAL*\n`;
        msg += `From *Anshaisha Home Cooked Food* 🏡\n\n`;
        
        activeDishes.forEach(d => {
            if (d.isMeal) {
                msg += `🍱 *${d.name}* - ₹${d.price}\n`;
                msg += `_(${state.menu.mealDescription})_\n`;
                msg += `➕ *Custom Add-ons Available:* Extra Roti (+₹${state.menu.addons.roti}), No Rice (-₹${Math.abs(state.menu.addons.rice)}), Extra Sabji (+₹${state.menu.addons.sabji})\n\n`;
            } else {
                msg += `🍛 *${d.name.split(' (')[0]}* - ₹${d.price}\n`;
            }
        });
        
        msg += `🔗 Order in 30 seconds here: ${window.location.origin}/index.html\n`;
        msg += `_Please order by ${selectedSession === 'Lunch' ? '11:30 AM' : '6:30 PM'}._`;
        
        document.getElementById('whatsapp-msg-content').innerHTML = msg.replace(/\n/g, '<br>');
        
        // Open Dialog modal
        openModal('whatsapp-share-modal');
    } catch (e) {
        showToast("❌ Error: " + e.message, "danger");
    }
}

function triggerWhatsAppShareSuccess() {
    trackTap();
    closeModal('whatsapp-share-modal');
    
    // Sync to simulator label
    const summaryList = state.menu.items.filter(item => item.checked).map(item => item.name.split(' (')[0]);
    document.getElementById('sim-active-menu-label').textContent = `${state.menu.session}: ${summaryList[0]}`;
    document.getElementById('dash-current-menu-summary').textContent = summaryList.join(', ');
    
    showToast("🚀 Shared to Alexander, Ceaser, & Napoleon tower WhatsApp groups!", "success");
    
    // Complete Usability metric
    completeWorkflow('Daily Menu Published');
    
    // Switch to dashboard tab
    adminSwitchTab('dash');
}

// --------------------------------------------------------------------------
// 6. CORE WORKFLOWS: ORDER MANAGEMENT & IMPERSONATION
// --------------------------------------------------------------------------

function renderAdminDashboard() {
    const listContainer = document.getElementById('dashboard-orders-list');
    const newContainer = document.getElementById('dashboard-new-orders-container');
    if (!listContainer || !newContainer) return;
    
    listContainer.innerHTML = '';
    newContainer.innerHTML = '';
    
    // Live update of notification badge, menu summary, and payments alert
    const newOrdersCount = state.orders.filter(o => o.status === 'New').length;
    const badgeEl = document.getElementById('order-badge-count');
    if (badgeEl) badgeEl.textContent = newOrdersCount;
    
    const menuSummary = state.menu.items.filter(item => item.checked).map(item => item.name.split(' (')[0]);
    const menuSummaryEl = document.getElementById('dash-current-menu-summary');
    if (menuSummaryEl) {
        menuSummaryEl.textContent = menuSummary.join(', ') || 'No active menu published today';
    }
    
    const unpaidCount = state.payments.length;
    const unpaidSum = state.payments.reduce((acc, curr) => acc + curr.amount, 0);
    const alertBanner = document.getElementById('dash-payments-alert');
    if (alertBanner) {
        if (unpaidCount === 0) {
            alertBanner.style.display = 'none';
        } else {
            alertBanner.style.display = 'flex';
            const countEl = document.getElementById('due-count');
            if (countEl) countEl.textContent = unpaidCount;
            const amtEl = document.getElementById('due-amount');
            if (amtEl) amtEl.textContent = `₹${unpaidSum}`;
        }
    }
    
    // Filter out New and Preparing orders for Today
    const newOrders = state.orders.filter(o => o.isToday && o.status === 'New');
    const preparingOrders = state.orders.filter(o => o.isToday && o.status === 'Preparing');
    
    // Update badge count in header/elsewhere if needed
    const countBadge = document.getElementById('dash-orders-count-badge');
    if (countBadge) countBadge.textContent = newOrders.length + preparingOrders.length;
    
    const preparingBadge = document.getElementById('dash-preparing-count-badge');
    if (preparingBadge) preparingBadge.textContent = preparingOrders.length;
    
    // Render New Orders (Always Expanded)
    if (newOrders.length > 0) {
        newOrders.forEach(o => {
            const card = createOrderCardElement(o, true);
            newContainer.appendChild(card);
        });
    } else {
        newContainer.innerHTML = `
            <div style="text-align: center; padding: 12px; background: #fff; border-radius: var(--radius-md); border: 1px dashed var(--app-border);">
                <small style="color: var(--text-muted); font-size: 10.5px;">✨ No new pending orders to accept</small>
            </div>
        `;
    }
    
    // Sync expanded state display for preparing queue
    const arrow = document.getElementById('dash-orders-expand-arrow');
    if (state.dashboardOrdersExpanded) {
        listContainer.style.display = 'flex';
        listContainer.classList.remove('hidden');
        if (arrow) arrow.textContent = 'Hide Queue ▴';
    } else {
        listContainer.style.display = 'none';
        listContainer.classList.add('hidden');
        if (arrow) arrow.textContent = 'Show Queue ▾';
    }
    
    if (preparingOrders.length === 0) {
        listContainer.innerHTML = `<div class="empty-state-text">🎉 No preparing orders in progress.</div>`;
        return;
    }
    
    preparingOrders.forEach(o => {
        const card = createOrderCardElement(o, true);
        listContainer.appendChild(card);
    });
}

function toggleDashboardOrdersExpanded() {
    trackTap();
    state.dashboardOrdersExpanded = !state.dashboardOrdersExpanded;
    renderAdminDashboard();
}

let activeOrderFilter = 'today'; // today | tomorrow | history

function renderAdminOrders() {
    const listContainer = document.getElementById('admin-orders-list');
    if (!listContainer) return;
    
    // Save selected order IDs
    const checkedIds = Array.from(listContainer.querySelectorAll('.order-bulk-checkbox:checked')).map(cb => cb.getAttribute('data-order-id'));
    
    listContainer.innerHTML = '';
    
    // Reset Select All
    const selectAllCheck = document.getElementById('bulk-select-all-checkbox');
    if (selectAllCheck) selectAllCheck.checked = false;
    const countSpan = document.getElementById('bulk-select-count');
    if (countSpan) countSpan.textContent = '0';
    
    // Count summary badges
    const todayCount = state.orders.filter(o => o.isToday).length;
    const tomorrowCount = state.orders.filter(o => !o.isToday).length;
    document.getElementById('count-today-orders').textContent = todayCount;
    document.getElementById('count-tomorrow-orders').textContent = tomorrowCount;
    document.getElementById('order-badge-count').textContent = state.orders.filter(o => o.status === 'New').length;
    
    let filtered = [];
    if (activeOrderFilter === 'today') {
        filtered = state.orders.filter(o => o.isToday);
    } else if (activeOrderFilter === 'tomorrow') {
        filtered = state.orders.filter(o => !o.isToday);
    } else { // history logs ledger
        // Combine active delivered orders + past orders list
        const activeDelivered = state.orders.filter(o => o.status === 'Delivered');
        filtered = [...activeDelivered, ...state.orderHistory];
    }
    
    if (filtered.length === 0) {
        listContainer.innerHTML = `<div class="empty-state-text">No orders found for this selection.</div>`;
        return;
    }
    
    filtered.forEach(o => {
        const card = createOrderCardElement(o, false);
        listContainer.appendChild(card);
    });
    
    // Restore selected checkboxes!
    checkedIds.forEach(id => {
        const cb = listContainer.querySelector(`.order-bulk-checkbox[data-order-id="${id}"]`);
        if (cb) cb.checked = true;
    });
    onOrderSelectChange();
}

function createOrderCardElement(o, isMini = false) {
    const card = document.createElement('div');
    card.className = `order-card ${o.status === 'New' ? 'new-pulse' : ''} ${!isMini ? 'has-checkbox' : ''}`;
    
    let statusClass = o.status === 'New' ? 'new' : o.status === 'Preparing' ? 'prep' : 'done';
    
    let checkboxHtml = '';
    if (!isMini) {
        checkboxHtml = `
            <input type="checkbox" class="order-bulk-checkbox order-card-checkbox" data-order-id="${o.id}" onchange="onOrderSelectChange()">
        `;
    }
    
    card.innerHTML = `
        ${checkboxHtml}
        <span class="order-status-badge ${statusClass}">${o.status}</span>
        <div class="order-header-row">
            <div class="order-cust-info">
                <h4>👤 ${o.customer}</h4>
                <p>📍 ${o.address} &bull; <small style="color:var(--primary); font-weight:700;">${o.remark || 'App Order'}</small></p>
            </div>
            <div class="order-meta-info">
                <span class="order-time">🕒 ${o.time || o.date || 'Today'}</span>
                <span class="order-price">₹${o.price}</span>
            </div>
        </div>
        <div class="order-details-text">${o.items}</div>
        <div class="order-card-actions" id="actions-${o.id}">
            <!-- Action buttons -->
        </div>
    `;
    
    const actionsBox = card.querySelector(`#actions-${o.id}`);
    
    if (o.status === 'New') {
        actionsBox.innerHTML = `
            <button class="card-btn reject" onclick="rejectOrder('${o.id}')">Reject</button>
            <button class="card-btn accept" onclick="acceptOrder('${o.id}')">Accept Order (1-Tap)</button>
        `;
    } else if (o.status === 'Preparing') {
        actionsBox.innerHTML = `
            <button class="card-btn secondary" style="flex:2;" onclick="deliverOrder('${o.id}')">
                🛵 Mark Prepared & Delivered (1-Tap)
            </button>
        `;
    } else {
        actionsBox.innerHTML = `
            <span class="green-success-tick" style="font-size: 11px; font-weight:700; color:var(--secondary); padding: 4px;">
                ✅ Food Delivered & Payment Complete
            </span>
        `;
    }
    
    return card;
}

function toggleOrderTimeFilter(day) {
    trackTap();
    activeOrderFilter = day;
    const tabs = document.querySelectorAll('.orders-sub-tabs .sub-tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    if (day === 'today') {
        tabs[0].classList.add('active');
    } else if (day === 'tomorrow') {
        tabs[1].classList.add('active');
    } else {
        tabs[2].classList.add('active');
    }
    renderAdminOrders();
}

async function acceptOrder(orderId) {
    startWorkflow('Accept Order');
    
    try {
        const res = await fetch(`/api/orders/${orderId}/accept`, {
            method: 'POST'
        });
        if (!res.ok) throw new Error("Failed to accept order");
        
        await syncStateWithBackend();
        showToast("👨‍🍳 Cooking started!", 'success');
        completeWorkflow('Order Accepted');
    } catch (e) {
        showToast("❌ Error: " + e.message, "danger");
    }
}

async function rejectOrder(orderId) {
    trackTap();
    try {
        const res = await fetch(`/api/orders/${orderId}/reject`, {
            method: 'POST'
        });
        if (!res.ok) throw new Error("Failed to reject order");
        
        await syncStateWithBackend();
        showToast("❌ Order cancelled/rejected", "info");
    } catch (e) {
        showToast("❌ Error: " + e.message, "danger");
    }
}

async function deliverOrder(orderId) {
    trackTap();
    try {
        const res = await fetch(`/api/orders/${orderId}/deliver`, {
            method: 'POST'
        });
        if (!res.ok) throw new Error("Failed to deliver order");
        
        await syncStateWithBackend();
        showToast("🛵 Food Delivered!", 'success');
    } catch (e) {
        showToast("❌ Error: " + e.message, "danger");
    }
}

// --------------------------------------------------------------------------
// ADMIN ORDER IMPERSONATION (Place phone/WhatsApp order)
// --------------------------------------------------------------------------

function openImpersonationModal() {
    trackTap();
    
    // Render check items checkboxes based on published menu
    const menuItemsBox = document.getElementById('imp-menu-items-selection');
    menuItemsBox.innerHTML = '';
    
    const activeDishes = state.menu.items.filter(item => item.checked);
    activeDishes.forEach(d => {
        const div = document.createElement('div');
        div.className = 'imp-item-row';
        div.innerHTML = `
            <label style="font-weight: 500; font-size:11px;">
                <input type="checkbox" name="imp-dish" value="${d.name.split(' (')[0]}" data-price="${d.price}" checked onchange="recalculateImpersonatedTotal()">
                ${d.name.split(' (')[0]} (₹${d.price})
            </label>
        `;
        menuItemsBox.appendChild(div);
    });

    // Reset Form Fields
    document.getElementById('imp-customer-select').value = "Amit Sharma";
    document.getElementById('imp-new-cust-fields').classList.add('hidden');
    document.getElementById('imp-opt-roti').checked = false;
    document.getElementById('imp-opt-norice').checked = false;
    document.getElementById('imp-opt-sabji').checked = false;
    document.getElementById('imp-order-remark').value = "Received order on Phone";
    
    recalculateImpersonatedTotal();
    openModal('impersonate-order-modal');
}

function syncImpersonatedCustomerFields(val) {
    trackTap();
    const fieldsBox = document.getElementById('imp-new-cust-fields');
    const modifiersBox = document.getElementById('imp-modifiers-box');

    if (val === 'New Walk-in') {
        fieldsBox.classList.remove('hidden');
    } else {
        fieldsBox.classList.add('hidden');
    }
    
    recalculateImpersonatedTotal();
}

function recalculateImpersonatedTotal() {
    let subtotal = 0;
    
    // Sum dishes checked
    const dishes = document.querySelectorAll('input[name="imp-dish"]:checked');
    dishes.forEach(d => {
        subtotal += parseInt(d.getAttribute('data-price'));
    });

    // Modifiers (only apply if Complete Meal is checked in selections)
    const completes = Array.from(dishes).filter(d => d.value.startsWith("Anshaisha Complete Meal"));
    if (completes.length > 0) {
        document.getElementById('imp-modifiers-box').style.display = 'block';
        
        const optRoti = document.getElementById('imp-opt-roti');
        const optRice = document.getElementById('imp-opt-norice');
        const optSabji = document.getElementById('imp-opt-sabji');
        
        if (optRoti && optRoti.checked) subtotal += parseInt(optRoti.getAttribute('data-price'));
        if (optRice && optRice.checked) subtotal += parseInt(optRice.getAttribute('data-price'));
        if (optSabji && optSabji.checked) subtotal += parseInt(optSabji.getAttribute('data-price'));
    } else {
        document.getElementById('imp-modifiers-box').style.display = 'none';
    }

    document.getElementById('imp-order-total-price').textContent = `₹${subtotal}`;
}

async function submitImpersonatedOrder() {
    trackTap();
    const selectVal = document.getElementById('imp-customer-select').value;
    const remark = document.getElementById('imp-order-remark').value.trim() || 'Received on Phone';
    
    let custName = selectVal;
    let phone = '9876543210';
    let tower = 'Alexander';
    let floor = '22';
    let flat = '08';
    
    if (selectVal === 'New Walk-in') {
        custName = document.getElementById('imp-cust-name').value.trim();
        phone = document.getElementById('imp-cust-phone').value.trim() || ("9" + Math.floor(100000000 + Math.random() * 900000000).toString());
        tower = document.getElementById('imp-cust-tower').value;
        floor = document.getElementById('imp-cust-floor').value;
        flat = document.getElementById('imp-cust-flat').value;
        
        if (!custName) {
            showToast("⚠️ Please enter a customer name", "info");
            return;
        }
    } else {
        // Fetch values from active customer object
        const c = state.customersList.find(item => item.name === selectVal);
        if (c) {
            phone = c.phone;
            tower = c.tower;
            floor = c.floor;
            flat = c.flat;
        }
    }

    // Compile items string
    const selectedDishes = Array.from(document.querySelectorAll('input[name="imp-dish"]:checked')).map(d => d.value);
    if (selectedDishes.length === 0) {
        showToast("⚠️ Select at least 1 dish item", "info");
        return;
    }

    let itemsDescription = selectedDishes.join(', ');
    
    // Append modifiers
    const isMealSelected = selectedDishes.some(d => d.startsWith("Anshaisha Complete Meal"));
    if (isMealSelected) {
        const modParts = [];
        if (document.getElementById('imp-opt-roti').checked) modParts.push("Extra Roti");
        if (document.getElementById('imp-opt-norice').checked) modParts.push("No Rice");
        if (document.getElementById('imp-opt-sabji').checked) modParts.push("Extra Sabji");
        if (modParts.length > 0) {
            itemsDescription += ` (${modParts.join(', ')})`;
        }
    }

    const price = parseInt(document.getElementById('imp-order-total-price').textContent.slice(1));
    const flatPadded = flat < 10 && !flat.toString().startsWith('0') ? `0${flat}` : flat;
    const address = `${tower} ${floor}${flatPadded}`;

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer: custName,
                phone: phone,
                tower: tower,
                floor: floor.toString(),
                flat: flat.toString(),
                address: address,
                items: itemsDescription,
                price: price,
                remark: remark,
                isToday: true
            })
        });

        if (!res.ok) throw new Error("Failed to submit impersonated order.");

        await syncStateWithBackend();

        // Sound chime & UI updates
        playNotificationSound();
        closeModal('impersonate-order-modal');
        showToast(`📞 Phone order logged for ${custName} (${address}) successfully!`, 'success');
    } catch (e) {
        showToast("❌ Error: " + e.message, "danger");
    }
}

// --------------------------------------------------------------------------
// 7. CORE WORKFLOWS: FINANCE & EXPENSES (Helper / Others)
// --------------------------------------------------------------------------

let selectedExpenseCategory = 'Vegetables';
let selectedExpenseIcon = '🥕';

function selectExpenseCategory(btn, category, icon) {
    trackTap();
    document.querySelectorAll('.expense-categories button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedExpenseCategory = category;
    selectedExpenseIcon = icon;
}

function setExpenseAmount(val) {
    trackTap();
    const input = document.getElementById('expense-amount');
    const current = parseInt(input.value) || 0;
    input.value = current + val;
}

async function submitExpense() {
    startWorkflow('Record Expense');
    
    const amountInput = document.getElementById('expense-amount');
    const notesInput = document.getElementById('expense-notes');
    const amount = parseInt(amountInput.value);
    const notes = notesInput.value.trim() || 'General';
    
    if (isNaN(amount) || amount <= 0) {
        showToast("⚠️ Please type a valid amount", "info");
        return;
    }
    
    try {
        const res = await fetch('/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category: selectedExpenseCategory,
                icon: selectedExpenseIcon,
                amount: amount,
                notes: notes
            })
        });
        
        if (!res.ok) throw new Error("Failed to add expense");

        await syncStateWithBackend();

        amountInput.value = '';
        notesInput.value = '';
        
        showToast(`📉 Cost of ₹${amount} logged for ${selectedExpenseCategory}!`, 'success');
        completeWorkflow('Record Expense');
    } catch (e) {
        showToast("❌ Error: " + e.message, "danger");
    }
}

function recalculateFinances() {
    // Profit = Revenue - Expenses
    state.stats.profit = state.stats.revenue - state.stats.expenses;
    
    // Update mobile widgets
    document.getElementById('dash-rev').textContent = `₹${state.stats.revenue}`;
    document.getElementById('dash-exp').textContent = `₹${state.stats.expenses}`;
    
    const dashProfit = document.getElementById('dash-profit');
    dashProfit.textContent = `₹${state.stats.profit}`;
    if (state.stats.profit < 0) {
        dashProfit.style.color = "var(--danger)";
    } else {
        dashProfit.style.color = "var(--secondary)";
    }
    
    // Update finances tab page numbers
    document.getElementById('fin-revenue').textContent = `₹${state.stats.revenue}`;
    document.getElementById('fin-expenses').textContent = `₹${state.stats.expenses}`;
    document.getElementById('fin-netprofit').textContent = `₹${state.stats.profit}`;
    
    // Update desktop widgets
    const dRev = document.getElementById('d-rev');
    if (dRev) dRev.textContent = `₹${state.stats.revenue}`;
    const dExp = document.getElementById('d-exp');
    if (dExp) dExp.textContent = `₹${state.stats.expenses}`;
    const dProfit = document.getElementById('d-profit');
    if (dProfit) dProfit.textContent = `₹${state.stats.profit}`;
}

function renderAdminFinances() {
    const list = document.getElementById('logged-expenses-list');
    list.innerHTML = '';
    
    state.expenses.forEach(e => {
        const item = document.createElement('li');
        item.innerHTML = `
            <div class="expense-info-tag">
                <span>${e.icon}</span>
                <div>
                    <strong>${e.category}</strong>
                    <small style="color:var(--text-muted); display:block;">${e.notes}</small>
                </div>
            </div>
            <span class="expense-amt">−₹${e.amount}</span>
        `;
        list.appendChild(item);
    });
}

// --------------------------------------------------------------------------
// 8. CORE WORKFLOWS: PAYMENTS FOLLOW-UP
// --------------------------------------------------------------------------

let activePaymentReminderId = null;

function renderAdminPayments() {
    const list = document.getElementById('admin-payments-list');
    list.innerHTML = '';
    
    const unpaidCount = state.payments.length;
    const unpaidSum = state.payments.reduce((acc, curr) => acc + curr.amount, 0);
    
    document.getElementById('due-count').textContent = unpaidCount;
    document.getElementById('due-amount').textContent = `₹${unpaidSum}`;
    
    if (unpaidCount === 0) {
        list.innerHTML = `<div class="empty-state-text">🎉 Wow! All payments cleared. Zero outstanding.</div>`;
        document.getElementById('dash-payments-alert').style.display = 'none';
        return;
    } else {
        document.getElementById('dash-payments-alert').style.display = 'flex';
    }
    
    state.payments.forEach(p => {
        const card = document.createElement('div');
        card.className = `payment-due-card ${p.level === 'critical' ? 'warning-level' : ''}`;
        
        card.innerHTML = `
            <div class="due-user-details">
                <h4>👤 ${p.customer}</h4>
                <p>🏡 ${p.address}</p>
                <div class="due-status-row">
                    <strong style="font-size:12px; color:var(--text-main)">₹${p.amount}</strong>
                    <span class="days-due-badge">${p.daysDue} days due</span>
                </div>
            </div>
            <div class="payment-actions-group">
                <button class="pay-btn wa-nudge" onclick="nudgePayment('${p.id}')">
                    <span>💬 Ping</span>
                </button>
                <button class="pay-btn mark-paid" onclick="markPaidWorkflow('${p.id}')">
                    <span>Mark Paid</span>
                </button>
            </div>
        `;
        list.appendChild(card);
    });
}

function nudgePayment(paymentId) {
    trackTap();
    const p = state.payments.find(item => item.id === paymentId);
    if (p) {
        activePaymentReminderId = paymentId;
        document.getElementById('rem-cust-name').textContent = p.customer;
        
        const text = `Hi ${p.customer}, this is Meenakashi from Anshaisha Home Kitchen. Friendly reminder for the pending payment of *₹${p.amount}* for lunch boxes. You can pay via UPI to *meenakashi@upi* or hand over cash. Thank you!`;
        document.getElementById('reminder-msg-content').textContent = text;
        
        openModal('payment-reminder-modal');
    }
}

function openWhatsAppChat(phone, message = '') {
    trackTap();
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone;
    }
    let url = `https://wa.me/${cleanPhone}`;
    if (message) {
        url += `?text=${encodeURIComponent(message)}`;
    }
    window.open(url, '_blank');
}

function sendReminderWhatsApp() {
    trackTap();
    closeModal('payment-reminder-modal');
    
    const p = state.payments.find(item => item.id === activePaymentReminderId);
    if (p) {
        const cust = state.customersList.find(c => c.name === p.customer);
        const phone = cust ? cust.phone : '9876543210';
        const text = `Hi ${p.customer}, this is Meenakashi from Anshaisha Home Kitchen. Friendly reminder for the pending payment of *₹${p.amount}* for lunch boxes. You can pay via UPI to *meenakashi@upi* or hand over cash. Thank you!`;
        
        openWhatsAppChat(phone, text);
        showToast(`💬 Opening WhatsApp reminder chat for ${p.customer}...`, 'success');
    }
}

async function markPaidWorkflow(paymentId) {
    startWorkflow('Record Payment');
    
    try {
        const res = await fetch(`/api/payments/${paymentId}/pay`, {
            method: 'POST'
        });
        if (!res.ok) throw new Error("Failed to mark payment as paid");

        await syncStateWithBackend();
        showToast(`💰 Payment recorded!`, 'success');
        completeWorkflow('Record Payment');
    } catch (e) {
        showToast("❌ Error: " + e.message, "danger");
    }
}

// --------------------------------------------------------------------------
// 9. SIMULATOR TRIGGERS & UTILITIES
// --------------------------------------------------------------------------

async function simulateNewOrder() {
    const firstNames = ["Rohan", "Sneha", "Karan", "Pooja", "Vikram", "Dr. Mehta"];
    const flats = ["101", "405", "1208", "2503", "3802", "1104"];
    const towers = ["Alexander", "Ceaser", "Napoleon"];
    const items = [
        "1x Complete Meal",
        "1x Complete Meal (Extra Roti)",
        "2x Complete Meal (No Rice)",
        "1x Paneer Butter Masala, 1x Chapatis"
    ];
    const prices = [200, 210, 360, 160];
    
    const randomIdx = Math.floor(Math.random() * firstNames.length);
    const chosenName = firstNames[randomIdx];
    const chosenTower = towers[Math.floor(Math.random() * towers.length)];
    const chosenFlat = flats[Math.floor(Math.random() * flats.length)];
    const itemStr = items[Math.floor(Math.random() * items.length)];
    const price = prices[Math.floor(Math.random() * prices.length)];
    
    const floorStr = chosenFlat.slice(0, -2) || '02';
    const flatStr = chosenFlat.slice(-2);
    const address = `${chosenTower} ${chosenFlat}`;

    const chosenPhone = "9" + Math.floor(100000000 + Math.random() * 900000000).toString();

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer: chosenName,
                phone: chosenPhone,
                tower: chosenTower,
                floor: floorStr,
                flat: flatStr,
                address: address,
                items: itemStr,
                price: price,
                remark: 'App Order',
                isToday: true
            })
        });

        if (!res.ok) throw new Error("Failed to simulate order.");

        await syncStateWithBackend();

        playNotificationSound();
        
        const banner = document.getElementById('incoming-order-banner');
        if (banner) {
            const titleEl = banner.querySelector('strong');
            if (titleEl) titleEl.textContent = 'New Order Received!';
            document.getElementById('banner-order-desc').textContent = `${address} - ₹${price}`;
            banner.classList.remove('hidden');
        }
        
        showToast(`🔔 Simulation: New Order from ${address}!`, 'info');
    } catch (e) {
        showToast("❌ Error simulating order: " + e.message, "danger");
    }
}

async function resetPrototypeData() {
    try {
        const res = await fetch('/api/reset', {
            method: 'POST'
        });
        if (!res.ok) throw new Error("Failed to reset database");

        await syncStateWithBackend();
        
        document.querySelectorAll('.goals-list li').forEach(li => li.className = '');
        
        const tapCountEl = document.getElementById('tap-count');
        if (tapCountEl) tapCountEl.textContent = '0';
        const actionTimerEl = document.getElementById('action-timer');
        if (actionTimerEl) actionTimerEl.textContent = '0.0s';
        const lastActionEl = document.getElementById('last-action');
        if (lastActionEl) lastActionEl.textContent = '-';
        
        showToast("🔄 Prototype data reset to default presets", "info");
    } catch (e) {
        showToast("❌ Error: " + e.message, "danger");
    }
}

// --------------------------------------------------------------------------
// 10. CUSTOMER MOBILE INTERACTIVE VIEWS
// --------------------------------------------------------------------------

function custSwitchTab(tabName) {
    trackTap();
    state.activeCustTab = tabName;
    
    // Toggle navigation highlights
    const navButtons = document.querySelectorAll('.customer-nav button');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    document.querySelectorAll('#view-cust-mob .tab-content').forEach(c => c.classList.remove('active'));
    
    if (tabName === 'menu') {
        navButtons[0].classList.add('active');
        document.getElementById('tab-cust-menu').classList.add('active');
        renderCustomerMenu();
    } else if (tabName === 'orders') {
        navButtons[1].classList.add('active');
        document.getElementById('tab-cust-orders').classList.add('active');
        renderCustomerTracking();
    } else if (tabName === 'profile') {
        navButtons[2].classList.add('active');
        document.getElementById('tab-cust-profile').classList.add('active');
        renderCustomerProfileTab();
    }
}

function renderCustomerMenu() {
    renderCustomerDateStrip();
    
    const list = document.getElementById('customer-menu-items');
    if (!list) return;
    list.innerHTML = '';
    
    document.getElementById('cust-menu-session-badge').textContent = `☀️ ${state.menu.session.toUpperCase()} SPECIAL`;
    
    // Check if selected date is closed (either today is closed, or selected date is in leave dates)
    const isTodaySelected = state.customerOrderingDate === 'today';
    const selectedDateStr = isTodaySelected ? '2026-06-21' : state.customerSelectedFutureDate;
    
    const isTodayClosed = isTodaySelected && state.kitchenClosedToday;
    const isLeaveDay = state.leave && state.leave.declared && state.leave.dates && state.leave.dates.includes(selectedDateStr);
    const isClosed = isTodayClosed || isLeaveDay;
    
    // Update Kitchen Status & Announcement Banner dynamically
    const bannerEl = document.getElementById('announcement-banner-view');
    if (bannerEl) {
        if (isClosed) {
            bannerEl.style.backgroundColor = 'var(--danger-light)';
            bannerEl.style.borderColor = 'rgba(216, 67, 21, 0.2)';
            bannerEl.style.color = 'var(--danger)';
            bannerEl.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: center; justify-content: center; text-align: center;">
                    <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.5px;">🔴 KITCHEN IS CLOSED</div>
                    <div style="font-size: 11px; font-weight: 600; opacity: 0.95;">No orders are being accepted for ${isTodaySelected ? 'Today' : new Date(selectedDateStr).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'})}.</div>
                </div>
            `;
        } else {
            bannerEl.style.backgroundColor = '#E8F5E9'; // light green
            bannerEl.style.borderColor = '#C8E6C9';
            bannerEl.style.color = '#2E7D32'; // dark green
            
            // If there is an announcement, display it. Otherwise show default open message
            const latestAnnouncement = state.announcements && state.announcements.length > 0 ? state.announcements[0] : `Lunch orders accepted till 11:30 AM. Fresh ingredients only!`;
            
            // Check if there are upcoming leave dates
            let holidayNotice = '';
            if (state.leave && state.leave.declared && state.leave.dates && state.leave.dates.length > 0) {
                const leaves = state.leave.dates.map(dateStr => {
                    const d = new Date(dateStr);
                    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                }).join(', ');
                holidayNotice = `<div style="margin-top: 4px; font-size: 11px; font-weight: 700; color: #D84315; background: #FFF3E0; border: 1px solid #FFE0B2; padding: 2px 8px; border-radius: 4px; display: inline-block;">🌴 Upcoming Holidays (Kitchen Closed): ${leaves}</div>`;
            }
            
            bannerEl.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 4px; align-items: center; justify-content: center; text-align: center;">
                    <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.5px;">🟢 KITCHEN IS OPEN FOR ORDERS</div>
                    <div style="font-size: 11.5px; font-weight: 600; opacity: 0.95;">📢 ${latestAnnouncement}</div>
                    ${holidayNotice}
                </div>
            `;
        }
    }
    
    const activeOrderContainer = document.getElementById('cust-active-order-container');
    if (activeOrderContainer) {
        activeOrderContainer.innerHTML = '';
        
        // Find my today's orders
        const myTodayOrders = state.orders.filter(o => 
            o.isToday && 
            (o.customer.toLowerCase() === state.customerProfile.name.toLowerCase() || 
             (o.tower === state.customerAddress.tower && o.floor === state.customerAddress.floor && o.flat === state.customerAddress.flat))
        );
        
        if (myTodayOrders.length > 0) {
            myTodayOrders.forEach(order => {
                let badgeColor = 'var(--primary)';
                if (order.status === 'Preparing') badgeColor = 'var(--secondary)';
                if (order.status === 'Delivered') badgeColor = '#795548';
                
                const card = document.createElement('div');
                card.style = "background-color: var(--primary-light); border: 1px solid rgba(245, 124, 0, 0.25); padding: 12px; border-radius: var(--radius-md); margin-top: 10px; display: flex; flex-direction: column; gap: 6px;";
                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size: 11px; font-weight:700; color: var(--primary-hover);">🍛 YOUR ACTIVE ORDER TODAY:</span>
                        <span style="background-color: ${badgeColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase;">${order.status}</span>
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: var(--text-main);">${order.items}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; font-size: 10px; color: var(--text-muted);">
                        <span>Order: <strong>${order.id}</strong></span>
                        <span>Total: <strong>₹${order.price}</strong></span>
                    </div>
                `;
                activeOrderContainer.appendChild(card);
            });
        }
    }
    
    if (isClosed) {
        const reason = isTodayClosed ? "Meenakashi has closed the kitchen for today's orders. No more orders will be accepted." : (state.leave.reason || "Kitchen closed for leave.");
        const displayDate = isTodaySelected ? "Today" : new Date(selectedDateStr).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'});
        
        list.innerHTML = `
            <div class="menu-blocked-banner">
                <span>🛑</span>
                <strong>Kitchen is Closed on ${displayDate}</strong>
                <p>${reason}</p>
                <small style="margin-top: 4px; color: var(--text-muted); font-size: 10px;">Please choose another date from the booking calendar strip above!</small>
            </div>
        `;
        updateCartFloatBar();
        return;
    }
    
    const activeDishes = state.menu.items.filter(item => item.checked);
    
    activeDishes.forEach(d => {
        const card = document.createElement('div');
        card.className = 'food-item-card';
        card.style.flexDirection = 'column'; // Allow modifications list to fit underneath
        
        let photoColor = 'saffron';
        
        // Find existing quantities in cart
        const cartItems = state.cart.filter(c => c.id === d.id);
        const totalQty = cartItems.reduce((acc, curr) => acc + curr.qty, 0);
        
        // Dynamic display name for Complete Meal
        const displayName = d.isMeal ? `Complete Meal (${state.menu.session})` : d.name;
        
        let innerHtml = `
            <div style="display:flex; gap:12px; width:100%;">
                <div class="food-image-placeholder ${photoColor}">🍛</div>
                <div class="food-info">
                    <div class="food-name-row">
                        <h4>${displayName}</h4>
                        <p class="food-desc-text">${d.isMeal ? state.menu.mealDescription : 'Fresh home-cooked ingredients only'}</p>
                    </div>
                    <div class="food-buy-row" style="margin-top: 6px;">
                        <span class="food-price-val" id="cust-price-label-${d.id}">₹${d.price}</span>
                        <div id="buy-control-${d.id}">
                            <button class="primary-action-btn" onclick="directPlaceOrder(${d.id})" style="padding: 6px 14px; font-size: 11px; font-weight: 700; border-radius: var(--radius-sm); border: none; cursor: pointer; margin: 0; min-width: 100px;">Place Order ➔</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modifier options inside Complete Meal card
        if (d.isMeal) {
            innerHtml += `
                <div class="complete-meal-add-ons-box" id="meal-addons-${d.id}" style="margin-top: 8px; border-top:1px dashed var(--app-border); padding-top:6px; width:100%; display:flex; flex-direction:column; gap:4px;">
                    <small style="font-weight:700; font-size:10px; color:var(--text-muted);">🍽️ CUSTOMIZE YOUR MEAL:</small>
                    <label style="font-size:11px; font-weight:500;">
                        <input type="checkbox" id="add-opt-roti-${d.id}" onchange="recalculateCustFoodPrice(${d.id})"> Extra Roti (+₹${state.menu.addons.roti})
                    </label>
                    ${state.menu.addons.rice < 0 ? `
                    <label style="font-size:11px; font-weight:500;">
                        <input type="checkbox" id="add-opt-norice-${d.id}" onchange="recalculateCustFoodPrice(${d.id})"> No Rice (-₹${Math.abs(state.menu.addons.rice)})
                    </label>
                    ` : `<input type="checkbox" id="add-opt-norice-${d.id}" style="display:none;" onchange="recalculateCustFoodPrice(${d.id})">`}
                    <label style="font-size:11px; font-weight:500;">
                        <input type="checkbox" id="add-opt-sabji-${d.id}" onchange="recalculateCustFoodPrice(${d.id})"> Extra Sabji (+₹${state.menu.addons.sabji})
                    </label>
                </div>
            `;
        }
        
        card.innerHTML = innerHtml;
        list.appendChild(card);
    });

    
    updateCartFloatBar();
}

function updateCartFloatBar() {
    const bar = document.getElementById('cart-float-bar');
    if (!bar) return;
    
    if (!state.cart || state.cart.length === 0) {
        bar.classList.add('hidden');
    } else {
        bar.classList.remove('hidden');
        const totalQty = state.cart.reduce((acc, curr) => acc + curr.qty, 0);
        const totalVal = state.cart.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
        
        const qtyEl = document.getElementById('cart-badge-qty');
        if (qtyEl) qtyEl.textContent = `${totalQty} Item${totalQty > 1 ? 's' : ''}`;
        
        const totalEl = document.getElementById('cart-float-total');
        if (totalEl) totalEl.textContent = `₹${totalVal}`;
    }
}

function recalculateCustFoodPrice(dishId) {
    const dish = state.menu.items.find(d => d.id === dishId);
    if (!dish) return;
    
    let currentPrice = dish.price;
    if (dish.isMeal) {
        if (document.getElementById(`add-opt-roti-${dishId}`).checked) currentPrice += state.menu.addons.roti;
        if (document.getElementById(`add-opt-norice-${dishId}`).checked) currentPrice += state.menu.addons.rice;
        if (document.getElementById(`add-opt-sabji-${dishId}`).checked) currentPrice += state.menu.addons.sabji;
    }
    
    document.getElementById(`cust-price-label-${dishId}`).textContent = `₹${currentPrice}`;
}

function directPlaceOrder(dishId) {
    trackTap();
    const dish = state.menu.items.find(d => d.id === dishId);
    if (!dish) return;
    
    // Clear cart and prepare 1-item checkout
    state.cart = [];
    
    let finalPrice = dish.price;
    let nameSuffix = [];
    
    // Check modifiers checked
    if (dish.isMeal) {
        const optRoti = document.getElementById(`add-opt-roti-${dishId}`);
        const optRice = document.getElementById(`add-opt-norice-${dishId}`);
        const optSabji = document.getElementById(`add-opt-sabji-${dishId}`);
        
        if (optRoti && optRoti.checked) {
            finalPrice += state.menu.addons.roti;
            nameSuffix.push("Extra Roti");
        }
        if (optRice && optRice.checked) {
            finalPrice += state.menu.addons.rice;
            nameSuffix.push("No Rice");
        }
        if (optSabji && optSabji.checked) {
            finalPrice += state.menu.addons.sabji;
            nameSuffix.push("Extra Sabji");
        }
    }
    
    const baseName = dish.isMeal ? `Complete Meal (${state.menu.session})` : dish.name;
    const finalName = nameSuffix.length > 0 ? `${baseName} (${nameSuffix.join(', ')})` : baseName;
    
    state.cart.push({
        id: dishId,
        name: finalName,
        price: finalPrice,
        qty: 1
    });
    
    // Uncheck boxes in UI
    if (dish.isMeal) {
        document.getElementById(`add-opt-roti-${dishId}`).checked = false;
        document.getElementById(`add-opt-norice-${dishId}`).checked = false;
        document.getElementById(`add-opt-sabji-${dishId}`).checked = false;
        recalculateCustFoodPrice(dishId);
    }
    
    // Open checkout modal immediately
    showCheckoutModal();
}

function addCustFoodToCart(dishId) {
    trackTap();
    const dish = state.menu.items.find(d => d.id === dishId);
    if (!dish) return;
    
    let finalPrice = dish.price;
    let nameSuffix = [];
    
    // Check modifiers checked
    if (dish.isMeal) {
        const optRoti = document.getElementById(`add-opt-roti-${dishId}`);
        const optRice = document.getElementById(`add-opt-norice-${dishId}`);
        const optSabji = document.getElementById(`add-opt-sabji-${dishId}`);
        
        if (optRoti && optRoti.checked) {
            finalPrice += state.menu.addons.roti;
            nameSuffix.push("Extra Roti");
        }
        if (optRice && optRice.checked) {
            finalPrice += state.menu.addons.rice;
            nameSuffix.push("No Rice");
        }
        if (optSabji && optSabji.checked) {
            finalPrice += state.menu.addons.sabji;
            nameSuffix.push("Extra Sabji");
        }
    }
    
    const baseName = dish.isMeal ? `Complete Meal (${state.menu.session})` : dish.name;
    const finalName = nameSuffix.length > 0 ? `${baseName} (${nameSuffix.join(', ')})` : baseName;
    
    // Check if duplicate matching customizations already exists in cart
    const cartIdx = state.cart.findIndex(c => c.name === finalName);
    
    if (cartIdx !== -1) {
        state.cart[cartIdx].qty += 1;
    } else {
        state.cart.push({
            id: dishId,
            name: finalName,
            price: finalPrice,
            qty: 1
        });
    }
    
    showToast(`🛒 Added "${finalName.split(' (')[0]}" to cart!`, 'success');
    
    // Uncheck boxes in UI
    if (dish.isMeal) {
        document.getElementById(`add-opt-roti-${dishId}`).checked = false;
        document.getElementById(`add-opt-norice-${dishId}`).checked = false;
        document.getElementById(`add-opt-sabji-${dishId}`).checked = false;
    }
    
    renderCustomerMenu();
    
    if (state.currentView === 'cust-desk') {
        renderCustomerDesktop();
    }
}

// --------------------------------------------------------------------------
// DUAL FLOORS SLIDER + TYPING SYNC
// --------------------------------------------------------------------------

function updateCustFloorLabel(val) {
    state.customerAddress.floor = val;
    document.getElementById('cust-floor-typed').value = val;
    updateGeneratedAddress();
}

function updateCustFloorTyped(val) {
    let num = parseInt(val) || 1;
    if (num < 1) num = 1;
    if (num > 40) num = 40;
    
    state.customerAddress.floor = num;
    document.getElementById('cust-floor-slider').value = num;
    updateGeneratedAddress();
}

function updateDeskFloorLabel(val) {
    state.customerAddress.floor = val;
    document.getElementById('desk-floor-typed').value = val;
    updateGeneratedAddress();
}

function updateDeskFloorTyped(val) {
    let num = parseInt(val) || 1;
    if (num < 1) num = 1;
    if (num > 40) num = 40;
    
    state.customerAddress.floor = num;
    document.getElementById('desk-floor-slider').value = num;
    updateGeneratedAddress();
}

function selectCustTower(towerName) {
    trackTap();
    state.customerAddress.tower = towerName;
    document.querySelectorAll('#cust-tower-group button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    updateGeneratedAddress();
}

function selectCustFlat(flatNum) {
    trackTap();
    state.customerAddress.flat = flatNum;
    document.querySelectorAll('.flat-selector-mini .flat-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    updateGeneratedAddress();
}

function updateGeneratedAddress() {
    const t = state.customerAddress.tower;
    const fl = state.customerAddress.floor;
    const flat = state.customerAddress.flat;
    
    const flatPadded = flat < 10 && !flat.toString().startsWith('0') ? `0${flat}` : flat;
    const addressStr = `${t} ${fl}${flatPadded}`;
    
    const mobAddr = document.getElementById('cust-generated-address');
    if (mobAddr) mobAddr.textContent = addressStr;
    
    const deskAddr = document.getElementById('desk-generated-address');
    if (deskAddr) deskAddr.textContent = `${addressStr}, Sai World Empire, Kharghar`;
    
    const profileAddrCompiled = document.getElementById('profile-address-compiled-lbl');
    if (profileAddrCompiled) profileAddrCompiled.textContent = `Address Compiled: ${addressStr}`;
}

function togglePaymentUpiDetails(val) {
    const box = document.getElementById('upi-payment-details-box');
    if (box) {
        box.style.display = val === 'now' ? 'block' : 'none';
    }
}

function resetDeliveryAddressToProfile() {
    trackTap();
    syncCheckoutAddressFromProfile();
    showToast("🔄 Address reset to profile defaults", "info");
}

function syncCheckoutAddressFromProfile() {
    const t = state.customerAddress.tower;
    const fl = state.customerAddress.floor;
    const flat = state.customerAddress.flat;

    const mobTowerGroup = document.getElementById('cust-tower-group');
    if (mobTowerGroup) {
        mobTowerGroup.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.trim().toLowerCase() === t.toLowerCase()) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    const deskTowerGroup = document.getElementById('desk-tower-group');
    if (deskTowerGroup) {
        deskTowerGroup.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.trim().toLowerCase() === t.toLowerCase()) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    const mobFloorTyped = document.getElementById('cust-floor-typed');
    if (mobFloorTyped) mobFloorTyped.value = fl;
    const mobFloorSlider = document.getElementById('cust-floor-slider');
    if (mobFloorSlider) mobFloorSlider.value = fl;
    const deskFloorTyped = document.getElementById('desk-floor-typed');
    if (deskFloorTyped) deskFloorTyped.value = fl;
    const deskFloorSlider = document.getElementById('desk-floor-slider');
    if (deskFloorSlider) deskFloorSlider.value = fl;

    const mobFlats = document.querySelectorAll('.flat-selector-mini .flat-btn');
    mobFlats.forEach(btn => {
        if (parseInt(btn.textContent) === parseInt(flat)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    const deskFlats = document.querySelectorAll('.flat-input-col .flat-btn');
    deskFlats.forEach(btn => {
        if (parseInt(btn.textContent) === parseInt(flat)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    updateGeneratedAddress();
}

function showCheckoutModal() {
    trackTap();
    const checkoutList = document.getElementById('cust-checkout-items');
    checkoutList.innerHTML = '';
    
    state.cart.forEach(c => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${c.qty}x ${c.name}</span>
            <span>₹${c.qty * c.price}</span>
        `;
        checkoutList.appendChild(li);
    });
    
    const total = state.cart.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
    document.getElementById('cust-checkout-total').textContent = `₹${total}`;
    document.getElementById('payment-confirm-amt').textContent = `₹${total}`;
    
    document.getElementById('payment-checkbox-confirm').checked = false;
    
    const payLaterRadio = document.getElementById('pay-method-later');
    if (payLaterRadio) payLaterRadio.checked = true;
    togglePaymentUpiDetails('later');

    syncCheckoutAddressFromProfile();
    
    openModal('customer-checkout-modal');
}

async function submitCustOrder() {
    trackTap();
    const isPayLater = document.getElementById('pay-method-later').checked;
    if (!isPayLater) {
        const confirmBox = document.getElementById('payment-checkbox-confirm');
        if (!confirmBox.checked) {
            showToast("⚠️ Please check the box to confirm you completed the UPI transfer.", "info");
            return;
        }
    }
    
    closeModal('customer-checkout-modal');
    
    const total = state.cart.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
    const flatPadded = state.customerAddress.flat < 10 && !state.customerAddress.flat.toString().startsWith('0') ? `0${state.customerAddress.flat}` : state.customerAddress.flat;
    const finalAddress = `${state.customerAddress.tower} ${state.customerAddress.floor}${flatPadded}`;
    
    const isTodaySelected = state.customerOrderingDate === 'today';
    const paymentSuffix = isPayLater ? ' (Pay Later)' : ' (UPI Paid Advance)';
    const remark = (isTodaySelected ? 'Placed on App' : 'Future Booked') + paymentSuffix;

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customer: state.customerProfile.name,
                phone: state.customerProfile.phone,
                tower: state.customerAddress.tower,
                floor: state.customerAddress.floor.toString(),
                flat: state.customerAddress.flat.toString(),
                address: finalAddress,
                items: state.cart.map(c => `${c.qty}x ${c.name}`).join(', '),
                price: total,
                remark: remark,
                isToday: isTodaySelected
            })
        });

        if (!res.ok) throw new Error("Failed to place customer order.");

        await syncStateWithBackend();

        // Sound & Toast updates
        playNotificationSound();
        
        const banner = document.getElementById('incoming-order-banner');
        if (banner) {
            const titleEl = banner.querySelector('strong');
            if (isTodaySelected) {
                if (titleEl) titleEl.textContent = 'New Order Received!';
                document.getElementById('banner-order-desc').textContent = `${finalAddress} - ₹${total}`;
            } else {
                const targetDate = state.customerSelectedFutureDate;
                const formattedDate = new Date(targetDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                if (titleEl) titleEl.textContent = '📅 New Future Order Received!';
                document.getElementById('banner-order-desc').textContent = `${finalAddress} - ₹${total} (For ${formattedDate})`;
            }
            banner.classList.remove('hidden');
        }
        
        state.cart = [];
        renderCustomerMenu();
        updateCartFloatBar();
        
        custSwitchTab('orders');
        showToast("🎉 Order placed successfully! Meenakashi has been notified.", "success");
    } catch (e) {
        showToast("❌ Error placing order: " + e.message, "danger");
    }
}

// --------------------------------------------------------------------------
// CUSTOMER PROFILE & TRACK HISTORY
// --------------------------------------------------------------------------

function renderCustomerProfileTab() {
    // Fill fields with current defaults
    document.getElementById('profile-name').value = state.customerProfile.name;
    document.getElementById('profile-phone').value = state.customerProfile.phone;
    
    // Highlight avatar
    document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('active'));
    const avatars = document.querySelectorAll('.avatar-option');
    if (state.customerProfile.avatar === '👩‍💼') avatars[0].classList.add('active');
    else if (state.customerProfile.avatar === '👨‍👩‍👦') avatars[1].classList.add('active');
    else if (state.customerProfile.avatar === '👴') avatars[2].classList.add('active');

    // Sync address fields
    document.getElementById('profile-tower').value = state.customerAddress.tower;
    document.getElementById('profile-floor').value = state.customerAddress.floor;
    document.getElementById('profile-flat').value = state.customerAddress.flat;
    
    // Sync security PIN field from local state
    const match = state.customersList.find(c => c.phone === state.customerProfile.phone);
    const pinEl = document.getElementById('profile-security-pin');
    if (pinEl) {
        pinEl.value = (match && match.pin) ? match.pin : '';
    }

    updateGeneratedAddress();
}

function selectAvatar(symbol) {
    trackTap();
    state.customerProfile.avatar = symbol;
    document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('active'));
    event.target.closest('.avatar-option').classList.add('active');
}

function syncProfileAddressChange() {
    state.customerAddress.tower = document.getElementById('profile-tower').value;
    state.customerAddress.floor = document.getElementById('profile-floor').value;
    state.customerAddress.flat = document.getElementById('profile-flat').value;
    
    updateGeneratedAddress();
}

async function saveCustomerProfile() {
    trackTap();
    
    // Retrieve old phone number before updating state
    let oldPhone = '';
    try {
        const savedProfile = JSON.parse(localStorage.getItem('customerProfile'));
        oldPhone = savedProfile ? savedProfile.phone : state.customerProfile.phone;
    } catch (e) {
        oldPhone = state.customerProfile.phone;
    }
    
    const newName = document.getElementById('profile-name').value.trim() || 'Amit Sharma';
    const newPhone = document.getElementById('profile-phone').value.trim() || '9876543210';
    
    syncProfileAddressChange();
    
    // Send update request to server!
    try {
        await fetch('/api/customers/profile/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                oldPhone: oldPhone,
                newPhone: newPhone,
                name: newName,
                tower: state.customerAddress.tower,
                floor: state.customerAddress.floor.toString(),
                flat: state.customerAddress.flat.toString()
            })
        });
    } catch (e) {
        console.error("Failed to update profile on backend", e);
    }
    
    state.customerProfile.name = newName;
    state.customerProfile.phone = newPhone;
    
    // Update localStorage
    localStorage.setItem('customerProfile', JSON.stringify(state.customerProfile));
    localStorage.setItem('customerAddress', JSON.stringify(state.customerAddress));

    // Sync UI elements and backend state
    document.getElementById('cust-header-greet').textContent = `Namaste ${state.customerProfile.name}! 👋`;
    
    const flatPadded = state.customerAddress.flat < 10 && !state.customerAddress.flat.toString().startsWith('0') ? `0${state.customerAddress.flat}` : state.customerAddress.flat;
    document.getElementById('cust-header-addr').textContent = `📍 ${state.customerAddress.tower} ${state.customerAddress.floor}${flatPadded}`;

    await syncStateWithBackend();

    // Read and save the optional security PIN
    const pinVal = document.getElementById('profile-security-pin').value.trim();
    if (pinVal && (pinVal.length !== 4 || isNaN(pinVal))) {
        showToast("⚠️ PIN must be exactly 4 digits.", "error");
        return;
    }

    try {
        const pinRes = await fetch('/api/customers/set-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: state.customerProfile.phone, pin: pinVal })
        });
        if (pinRes.ok) {
            showToast("💾 Profile Settings & Security PIN saved successfully!", "success");
            await syncStateWithBackend(); // Refresh state so new PIN is loaded
        } else {
            showToast("💾 Profile Settings saved (failed to save PIN).", "warning");
        }
    } catch (err) {
        console.error("Error setting PIN:", err);
        showToast("💾 Profile Settings saved (connection error for PIN).", "warning");
    }

    custSwitchTab('menu');
}

function renderCustomerTracking() {
    const list = document.getElementById('customer-order-tracking-list');
    list.innerHTML = '';
    
    // Find active orders for current logged customer profile
    const myActive = state.orders.filter(o => o.isToday && o.customer === state.customerProfile.name);
    
    if (myActive.length === 0) {
        list.innerHTML = `<div class="empty-state-text">No active kitchen orders running today.</div>`;
    } else {
        myActive.forEach(o => {
            const card = document.createElement('div');
            card.className = 'tracking-card';
            
            let eta = o.status === 'New' ? 'Pending Approval' : o.status === 'Preparing' ? 'Cooking (15-20 min)' : 'Delivered';
            let step1 = 'active';
            let step2 = o.status === 'Preparing' || o.status === 'Delivered' ? 'active' : '';
            let step3 = o.status === 'Delivered' ? 'active' : '';
            
            card.innerHTML = `
                <div class="track-header">
                    <span class="track-id">Order ID: #${o.id}</span>
                    <span class="track-eta">${eta}</span>
                </div>
                <div class="timeline">
                    <div class="timeline-step ${step1}">
                        <h5>Order Received</h5>
                        <p>Sent to Meenakashi's kitchen</p>
                    </div>
                    <div class="timeline-step ${step2}">
                        <h5>Preparing / Cooking</h5>
                        <p>Meenakashi is preparing fresh food</p>
                    </div>
                    <div class="timeline-step ${step3}">
                        <h5>Arrived / Delivered</h5>
                        <p>Delivered to your door</p>
                    </div>
                </div>
                ${o.status === 'Delivered' ? `
                    <div class="feedback-box-tracker">
                        <h4>⭐ How was your meal?</h4>
                        <div class="emoji-rating-row">
                            <button class="emoji-btn" onclick="submitEmojiFeedback('😋')">😋</button>
                            <button class="emoji-btn" onclick="submitEmojiFeedback('😍')">😍</button>
                            <button class="emoji-btn" onclick="submitEmojiFeedback('👍')">👍</button>
                            <button class="emoji-btn" onclick="submitEmojiFeedback('🌶️')">🌶️</button>
                        </div>
                    </div>
                ` : ''}
            `;
            list.appendChild(card);
        });
    }

    // Render historical logs for the customer
    const historyList = document.getElementById('customer-past-orders-history');
    historyList.innerHTML = '';
    
    // Past archived history items + delivered today's items
    const myHistoryLogs = [
        ...state.orders.filter(o => o.status === 'Delivered' && o.customer === state.customerProfile.name),
        ...state.orderHistory.filter(h => h.customer === state.customerProfile.name)
    ];

    if (myHistoryLogs.length === 0) {
        historyList.innerHTML = `<div class="empty-state-text" style="font-size:10px;">No past order history found.</div>`;
        return;
    }

    myHistoryLogs.forEach(h => {
        const card = document.createElement('div');
        card.className = 'past-order-card';
        
        card.innerHTML = `
            <div class="past-order-info">
                <h5>${h.items}</h5>
                <p>🕒 ${h.date || 'Today'}</p>
            </div>
            <div class="past-order-meta">
                <span class="past-order-price">₹${h.price}</span>
                <span class="badge green" style="font-size:8px;">Cleared Paid</span>
            </div>
        `;
        historyList.appendChild(card);
    });
}

function submitEmojiFeedback(emoji) {
    trackTap();
    showToast(`❤️ Thank you! Rating of ${emoji} shared with Meenakashi.`, 'success');
}

// --------------------------------------------------------------------------
// 11. DESKTOP PORTAL RENDERING
// --------------------------------------------------------------------------

function renderAdminDesktop() {
    const tableBody = document.getElementById('desk-dashboard-orders');
    if (!tableBody) return;
    
    // Save selected order IDs
    const checkedIds = Array.from(tableBody.querySelectorAll('.order-bulk-checkbox-desk:checked')).map(cb => cb.getAttribute('data-order-id'));
    
    tableBody.innerHTML = '';
    
    // Reset Select All and Bulk Actions Bar
    const selectAllCheck = document.getElementById('bulk-select-all-checkbox-desk');
    if (selectAllCheck) selectAllCheck.checked = false;
    const deskBulkBar = document.getElementById('desk-bulk-actions-bar');
    if (deskBulkBar) deskBulkBar.style.display = 'none';
    const countSpanDesk = document.getElementById('bulk-select-count-desk');
    if (countSpanDesk) countSpanDesk.textContent = '0';
    
    state.orders.forEach(o => {
        const row = document.createElement('tr');
        let statusBadgeClass = o.status === 'New' ? 'new' : o.status === 'Preparing' ? 'prep' : 'done';
        let actionButtons = '';
        
        if (o.status === 'New') {
            actionButtons = `
                <button class="sim-action-btn primary small" onclick="acceptOrder('${o.id}')">Accept</button>
                <button class="sim-action-btn small" style="background-color:var(--danger);" onclick="rejectOrder('${o.id}')">Reject</button>
            `;
        } else if (o.status === 'Preparing') {
            actionButtons = `
                <button class="sim-action-btn primary small" style="background-color:var(--secondary);" onclick="deliverOrder('${o.id}')">Deliver</button>
            `;
        } else {
            actionButtons = `<span style="color:var(--secondary); font-weight:700">✓ Complete</span>`;
        }
        
        row.innerHTML = `
            <td style="text-align: center;"><input type="checkbox" class="order-bulk-checkbox-desk" data-order-id="${o.id}" onchange="onOrderSelectChangeDesk()" style="cursor: pointer; width: 15px; height: 15px;"></td>
            <td>${o.time.split(', ')[1] || 'Today'}</td>
            <td><strong>${o.customer}</strong></td>
            <td>${o.address}</td>
            <td><code>${o.items}</code></td>
            <td><strong>₹${o.price}</strong></td>
            <td><span class="order-status-badge ${statusBadgeClass}" style="position:static;">${o.status}</span></td>
            <td><div style="display:flex; gap:4px;">${actionButtons}</div></td>
        `;
        tableBody.appendChild(row);
    });
    
    // Restore selected checkboxes!
    checkedIds.forEach(id => {
        const cb = tableBody.querySelector(`.order-bulk-checkbox-desk[data-order-id="${id}"]`);
        if (cb) cb.checked = true;
    });
    onOrderSelectChangeDesk();
    
    const paymentsList = document.getElementById('desk-dashboard-payments');
    paymentsList.innerHTML = '';
    
    state.payments.forEach(p => {
        const div = document.createElement('div');
        div.className = 'payment-due-card';
        div.style.marginBottom = '8px';
        
        div.innerHTML = `
            <div class="due-user-details">
                <h4>👤 ${p.customer}</h4>
                <p>🏡 ${p.address} &bull; ₹${p.amount}</p>
            </div>
            <div class="payment-actions-group">
                <button class="pay-btn wa-nudge" style="padding:4px 8px; font-size:10px;" onclick="nudgePayment('${p.id}')">Ping</button>
                <button class="pay-btn mark-paid" style="padding:4px 8px; font-size:10px;" onclick="markPaidWorkflow('${p.id}')">Clear</button>
            </div>
        `;
        paymentsList.appendChild(div);
    });
    
    const pendingOrdersCount = document.getElementById('d-orders-count');
    if (pendingOrdersCount) pendingOrdersCount.textContent = state.orders.filter(o => o.status === 'New').length;
    
    recalculateFinances();
}

function renderCustomerDesktop() {
    const grid = document.getElementById('desk-customer-food-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // Check if selected date is closed
    const isTodaySelected = state.customerOrderingDate === 'today';
    const selectedDateStr = isTodaySelected ? '2026-06-21' : state.customerSelectedFutureDate;
    
    const isTodayClosed = isTodaySelected && state.kitchenClosedToday;
    const isLeaveDay = state.leave && state.leave.declared && state.leave.dates && state.leave.dates.includes(selectedDateStr);
    
    if (isTodayClosed || isLeaveDay) {
        const reason = isTodayClosed ? "Meenakashi has closed the kitchen for today's orders. No more orders will be accepted." : (state.leave.reason || "Kitchen closed for leave.");
        const displayDate = isTodaySelected ? "Today" : new Date(selectedDateStr).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'});
        
        grid.innerHTML = `
            <div class="menu-blocked-banner" style="grid-column: 1 / -1; margin: 20px 0; width: 100%;">
                <span>🛑</span>
                <strong>Kitchen is Closed on ${displayDate}</strong>
                <p>${reason}</p>
                <small style="margin-top: 4px; color: var(--text-muted);">Please select another date in the mobile simulator frame to place your booking.</small>
            </div>
        `;
        const placeBtn = document.getElementById('desk-place-order-btn');
        if (placeBtn) placeBtn.classList.add('disabled');
        return;
    }
    
    const activeDishes = state.menu.items.filter(item => item.checked);
    
    activeDishes.forEach(d => {
        const card = document.createElement('div');
        card.className = 'food-item-card';
        card.style.flexDirection = 'column';
        
        const displayName = d.isMeal ? `Complete Meal (${state.menu.session})` : d.name;
        
        let innerHtml = `
            <div style="display:flex; gap:12px; width:100%;">
                <div class="food-image-placeholder saffron">🍛</div>
                <div class="food-info">
                    <div class="food-name-row">
                        <h4>${displayName}</h4>
                        <p class="food-desc-text" style="font-size:11px;">${d.isMeal ? state.menu.mealDescription : 'Fresh home ingredients'}</p>
                    </div>
                    <div class="food-buy-row" style="margin-top:12px;">
                        <span class="food-price-val" id="desk-price-label-${d.id}" style="font-size:15px;">₹${d.price}</span>
                        <div id="desk-buy-${d.id}">
                            <button class="add-cart-btn" onclick="addCustFoodToCart(${d.id})">Add to Cart</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (d.isMeal) {
            innerHtml += `
                <div class="complete-meal-add-ons-box" id="desk-addons-${d.id}" style="margin-top: 10px; border-top:1px dashed var(--app-border); padding-top:8px; width:100%; display:flex; gap:16px;">
                    <small style="font-weight:700; color:var(--text-muted); display:block; align-self:center;">CUSTOMIZE:</small>
                    <label style="font-size:11px;"><input type="checkbox" id="add-opt-roti-${d.id}" onchange="recalculateCustFoodPrice(${d.id})"> Extra Roti (+₹${state.menu.addons.roti})</label>
                    ${state.menu.addons.rice < 0 ? `
                    <label style="font-size:11px;"><input type="checkbox" id="add-opt-norice-${d.id}" onchange="recalculateCustFoodPrice(${d.id})"> No Rice (-₹${Math.abs(state.menu.addons.rice)})</label>
                    ` : `<input type="checkbox" id="add-opt-norice-${d.id}" style="display:none;" onchange="recalculateCustFoodPrice(${d.id})">`}
                    <label style="font-size:11px;"><input type="checkbox" id="add-opt-sabji-${d.id}" onchange="recalculateCustFoodPrice(${d.id})"> Extra Sabji (+₹${state.menu.addons.sabji})</label>
                </div>
            `;
        }

        card.innerHTML = innerHtml;
        grid.appendChild(card);
    });
    
    // Render Cart lists
    const cartList = document.getElementById('desk-cart-list');
    cartList.innerHTML = '';
    
    if (state.cart.length === 0) {
        cartList.innerHTML = `<p class="empty-cart-text">Your cart is empty. Add items from the left!</p>`;
        document.getElementById('desk-place-order-btn').classList.add('disabled');
        document.getElementById('desk-cart-total-price').textContent = `₹0`;
        return;
    }
    
    document.getElementById('desk-place-order-btn').classList.remove('disabled');
    
    state.cart.forEach(c => {
        const item = document.createElement('div');
        item.style.display = 'flex';
        item.style.justify = 'space-between';
        item.style.fontSize = '12px';
        item.style.padding = '6px 0';
        item.style.borderBottom = '1px solid var(--app-border)';
        
        item.innerHTML = `
            <span>${c.qty}x ${c.name}</span>
            <strong>₹${c.qty * c.price}</strong>
        `;
        cartList.appendChild(item);
    });
    
    const total = state.cart.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
    document.getElementById('desk-cart-total-price').textContent = `₹${total}`;
    
    // Sync default profile values into checkout controls
    document.getElementById('desk-floor-typed').value = state.customerAddress.floor;
    document.getElementById('desk-floor-slider').value = state.customerAddress.floor;

    updateGeneratedAddress();
}

function selectDeskTower(towerName) {
    trackTap();
    state.customerAddress.tower = towerName;
    document.querySelectorAll('#desk-tower-group button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    updateGeneratedAddress();
}

function selectDeskFlat(flatNum) {
    trackTap();
    state.customerAddress.flat = flatNum;
    document.querySelectorAll('.flat-input-col .flat-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    updateGeneratedAddress();
}

function placeDeskOrder() {
    trackTap();
    if (state.cart.length === 0) return;
    
    const total = state.cart.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
    const flatPadded = state.customerAddress.flat < 10 && !state.customerAddress.flat.toString().startsWith('0') ? `0${state.customerAddress.flat}` : state.customerAddress.flat;
    const finalAddress = `${state.customerAddress.tower} ${state.customerAddress.floor}${flatPadded}`;
    
    const newOrd = {
        id: `ORD-${state.orders.length + 101}`,
        customer: 'Self Order (Desktop)',
        tower: state.customerAddress.tower,
        floor: state.customerAddress.floor,
        flat: state.customerAddress.flat,
        address: finalAddress,
        items: state.cart.map(c => `${c.qty}x ${c.name}`).join(', '),
        price: total,
        status: 'New',
        time: 'Today, ' + new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}),
        isToday: true,
        remark: 'Placed on App'
    };
    
    state.orders.unshift(newOrd);
    
    playNotificationSound();
    
    state.cart = [];
    renderCustomerDesktop();
    showToast(`🎉 Order for ${finalAddress} submitted to kitchen successfully!`, 'success');
}

// --------------------------------------------------------------------------
// 12. POPUPS & CUSTOMER LIST ANALYTICS
// --------------------------------------------------------------------------

function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
    history.pushState({ type: 'modal', id: id }, '');
}

function closeModal(id) {
    trackTap();
    document.getElementById(id).classList.add('hidden');
    if (history.state && history.state.type === 'modal' && history.state.id === id) {
        history.back();
    }
}

window.addEventListener('popstate', (event) => {
    const openModals = document.querySelectorAll('.modal-overlay:not(.hidden)');
    if (openModals.length > 0) {
        openModals.forEach(m => m.classList.add('hidden'));
        return;
    }
    
    if (state.currentView === 'cust-mob' && state.activeCustTab !== 'menu') {
        custSwitchTab('menu');
        history.pushState({ type: 'home' }, '');
    } else if (state.currentView === 'admin-mob' && state.activeAdminTab !== 'dash') {
        adminSwitchTab('dash');
        history.pushState({ type: 'home' }, '');
    }
});

function copyWhatsAppMessage() {
    trackTap();
    const text = document.getElementById('whatsapp-msg-content').innerText;
    navigator.clipboard.writeText(text).then(() => {
        showToast("📋 Message copied to clipboard!", "info");
    });
}

function copyUPI() {
    trackTap();
    navigator.clipboard.writeText("meenakashi@upi").then(() => {
        showToast("📋 UPI ID 'meenakashi@upi' copied!", "info");
    });
}

// Static dialog forms
function showAnnouncementModal() { trackTap(); openModal('announcement-modal'); }
function showLeaveModal() { trackTap(); openModal('leave-modal'); }
function showCustomerListModal() { 
    trackTap(); 
    renderCustomerListModal();
    openModal('customer-list-modal'); 
}
function showFeedbackModal() { 
    trackTap(); 
    renderFeedbackListModal();
    openModal('feedbacks-modal'); 
}

function publishAnnouncement() {
    trackTap();
    const txt = document.getElementById('announcement-text').value.trim();
    if (txt) {
        state.announcements.unshift(`Meenakashi: ${txt}`);
        const bannerText = document.getElementById('announcement-banner-view');
        if (bannerText) bannerText.innerHTML = `📢 <em>Meenakashi:</em> ${txt}`;
        closeModal('announcement-modal');
        showToast("📢 Announcement broadcasted to all customer menus!", "success");
        document.getElementById('announcement-text').value = '';
    }
}

function showLeaveModal() {
    trackTap();
    initLeaveState();
    
    // Sync close today checkbox
    const closeTodayCheck = document.getElementById('leave-close-today-checkbox');
    if (closeTodayCheck) {
        closeTodayCheck.checked = state.kitchenClosedToday;
    }
    
    // Sync reason
    const reasonInput = document.getElementById('leave-reason');
    if (reasonInput) {
        reasonInput.value = state.leave.reason || '';
    }
    
    // Set active tab styling
    const btnRange = document.getElementById('cal-mode-range');
    const btnMulti = document.getElementById('cal-mode-multi');
    if (btnRange) btnRange.className = `calendar-mode-tab ${leaveSelectMode === 'range' ? 'active' : ''}`;
    if (btnMulti) btnMulti.className = `calendar-mode-tab ${leaveSelectMode === 'multiple' ? 'active' : ''}`;
    
    renderLeaveCalendar();
    openModal('leave-modal');
}

// Leave Calendar States
let leaveCalendarMonthOffset = 0; // 0 = June 2026, 1 = July 2026, etc.
let leaveSelectMode = 'range'; // 'range' or 'multiple'
let tempLeaveDates = new Set(['2026-06-25', '2026-06-26']); // Preset default leaves
let rangeStart = null; // for range mode

// Sync with actual leave state on load
function initLeaveState() {
    tempLeaveDates = new Set(state.leave.dates || []);
}

function setLeaveSelectMode(mode) {
    trackTap();
    leaveSelectMode = mode;
    
    const btnRange = document.getElementById('cal-mode-range');
    const btnMulti = document.getElementById('cal-mode-multi');
    if (btnRange) btnRange.className = `calendar-mode-tab ${mode === 'range' ? 'active' : ''}`;
    if (btnMulti) btnMulti.className = `calendar-mode-tab ${mode === 'multiple' ? 'active' : ''}`;
    
    // Reset temporary variables for range
    rangeStart = null;
    tempLeaveDates.clear();
    
    renderLeaveCalendar();
}

function navigateLeaveCalendar(offset) {
    trackTap();
    leaveCalendarMonthOffset += offset;
    renderLeaveCalendar();
}

function renderLeaveCalendar() {
    const grid = document.getElementById('leave-calendar-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    // Base calendar on June 2026
    const baseDate = new Date(2026, 5, 1); 
    baseDate.setMonth(baseDate.getMonth() + leaveCalendarMonthOffset);
    
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    document.getElementById('calendar-month-label').textContent = `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const formatDateStr = (d) => {
        const mm = (month + 1) < 10 ? `0${month + 1}` : (month + 1);
        const dd = d < 10 ? `0${d}` : d;
        return `${year}-${mm}-${dd}`;
    };
    
    const todayStr = "2026-06-21"; // Simulated local date
    
    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement('div');
        blank.className = 'calendar-day-cell disabled';
        grid.appendChild(blank);
    }
    
    for (let d = 1; d <= totalDays; d++) {
        const cell = document.createElement('button');
        cell.className = 'calendar-day-cell';
        cell.textContent = d;
        
        const dateStr = formatDateStr(d);
        
        if (dateStr < todayStr) {
            cell.classList.add('disabled');
        } else {
            if (dateStr === todayStr) {
                cell.classList.add('today-cell');
            }
            if (tempLeaveDates.has(dateStr)) {
                cell.classList.add('active');
            }
            cell.onclick = (e) => {
                e.preventDefault();
                handleCalendarDayClick(dateStr);
            };
        }
        
        grid.appendChild(cell);
    }
    
    updateLeaveSummaryText();
}

function handleCalendarDayClick(dateStr) {
    trackTap();
    if (leaveSelectMode === 'multiple') {
        if (tempLeaveDates.has(dateStr)) {
            tempLeaveDates.delete(dateStr);
        } else {
            tempLeaveDates.add(dateStr);
        }
    } else {
        // Range Mode
        if (!rangeStart) {
            rangeStart = dateStr;
            tempLeaveDates.clear();
            tempLeaveDates.add(dateStr);
        } else {
            const date1 = new Date(rangeStart);
            const date2 = new Date(dateStr);
            
            let start = date1 < date2 ? rangeStart : dateStr;
            let end = date1 < date2 ? dateStr : rangeStart;
            
            tempLeaveDates.clear();
            
            let curr = new Date(start);
            const endDate = new Date(end);
            
            while (curr <= endDate) {
                const y = curr.getFullYear();
                const m = curr.getMonth() + 1;
                const d = curr.getDate();
                const formatted = `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
                tempLeaveDates.add(formatted);
                curr.setDate(curr.getDate() + 1);
            }
            
            rangeStart = null;
        }
    }
    renderLeaveCalendar();
}

function updateLeaveSummaryText() {
    const summarySpan = document.getElementById('leave-selected-summary-text');
    if (!summarySpan) return;
    
    const datesArr = Array.from(tempLeaveDates).sort();
    if (datesArr.length === 0) {
        summarySpan.textContent = "None";
        return;
    }
    
    const formatNiceDate = (dStr) => {
        const [y, m, d] = dStr.split('-');
        const dateObj = new Date(y, m - 1, d);
        return dateObj.toLocaleDateString('en-IN', {month: 'short', day: 'numeric'});
    };
    
    if (leaveSelectMode === 'range' && datesArr.length > 1) {
        summarySpan.textContent = `${formatNiceDate(datesArr[0])} to ${formatNiceDate(datesArr[datesArr.length - 1])} (${datesArr.length} days)`;
    } else {
        summarySpan.textContent = datesArr.map(d => formatNiceDate(d)).join(', ');
    }
}

async function saveLeave() {
    trackTap();
    const reason = document.getElementById('leave-reason').value.trim() || 'Kitchen closed';
    const datesArr = Array.from(tempLeaveDates).sort();
    const declared = datesArr.length > 0;
    
    try {
        const res = await fetch('/api/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                declared: declared,
                dates: datesArr,
                reason: declared ? reason : ''
            })
        });
        
        if (!res.ok) throw new Error("Failed to save leave configuration.");
        
        await syncStateWithBackend();
        
        if (!declared) {
            showToast("📅 Cleared all leave days.", "info");
        } else {
            let dateStr = '';
            if (datesArr.length === 1) {
                dateStr = new Date(datesArr[0]).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'});
            } else {
                const startStr = new Date(datesArr[0]).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'});
                const endStr = new Date(datesArr[datesArr.length - 1]).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'});
                dateStr = `${startStr} to ${endStr}`;
            }
            showToast(`📅 Kitchen marked closed for: ${dateStr}!`, "info");
        }
    } catch (e) {
        showToast("❌ Error saving leaves: " + e.message, "danger");
    }
    
    closeModal('leave-modal');
}

function renderCustomerListModal() {
    const list = document.getElementById('modal-customer-list');
    list.innerHTML = '';
    
    state.customersList.forEach(c => {
        const li = document.createElement('li');
        li.style.flexDirection = 'column';
        li.style.alignItems = 'stretch';
        li.style.gap = '4px';

        if (state.editingCustomerPhone === c.phone) {
            li.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:8px; width:100%; padding: 8px; background: rgba(0,0,0,0.02); border-radius: 8px;">
                    <div style="display:flex; gap:8px;">
                        <input type="text" id="edit-cust-name" value="${c.name}" placeholder="Name" style="flex:1; padding:6px; font-size:11px; border-radius:4px; border:1px solid var(--app-border);">
                        <input type="text" id="edit-cust-phone" value="${c.phone}" placeholder="Phone" style="flex:1; padding:6px; font-size:11px; border-radius:4px; border:1px solid var(--app-border);">
                    </div>
                    <div style="display:flex; gap:6px;">
                        <select id="edit-cust-tower" style="flex:1; padding:6px; font-size:11px; border-radius:4px; border:1px solid var(--app-border);">
                            <option value="Alexander" ${c.tower === 'Alexander' ? 'selected' : ''}>Alexander</option>
                            <option value="Ceaser" ${c.tower === 'Ceaser' ? 'selected' : ''}>Ceaser</option>
                            <option value="Napoleon" ${c.tower === 'Napoleon' ? 'selected' : ''}>Napoleon</option>
                        </select>
                        <input type="number" id="edit-cust-floor" value="${c.floor}" placeholder="Floor" style="width:50px; padding:6px; font-size:11px; border-radius:4px; border:1px solid var(--app-border);">
                        <input type="number" id="edit-cust-flat" value="${c.flat}" placeholder="Flat" style="width:50px; padding:6px; font-size:11px; border-radius:4px; border:1px solid var(--app-border);">
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:4px;">
                        <button class="secondary-action-btn" onclick="cancelEditCustomer()" style="padding:4px 8px; font-size:10px; margin:0;">Cancel</button>
                        <button class="primary-action-btn" onclick="saveCustomerEdit('${c.phone}')" style="padding:4px 8px; font-size:10px; margin:0;">Save</button>
                    </div>
                </div>
            `;
        } else {
            // Check if customer has a PIN configured
            const hasPinBadge = c.pin ? `<span style="font-size: 8.5px; background: rgba(255, 193, 7, 0.15); color: var(--warning); padding: 2px 6px; border-radius: 4px; font-weight: 700; margin-left: 6px; border: 1px solid rgba(255,193,7,0.3);">🔒 Secured</span>` : '';
            const resetPinButton = c.pin ? `<button class="ping-btn" style="background: rgba(220, 53, 69, 0.1); color: var(--danger); font-size: 9.5px; padding: 4px 8px; border-radius: 4px; border: 1px solid rgba(220,53,69,0.2); font-weight: 700; cursor: pointer; margin-right: 4px;" onclick="resetCustomerPin('${c.phone}')">Reset PIN</button>` : '';

            li.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="cust-db-name">
                        <h5 style="display: flex; align-items: center; margin: 0;">${c.name} ${hasPinBadge}</h5>
                        <p style="margin: 2px 0 0 0;">🏡 ${c.tower} ${c.floor}${c.flat < 10 && !c.flat.toString().startsWith('0') ? '0'+c.flat : c.flat} &bull; 📱 ${c.phone}</p>
                    </div>
                    <div class="cust-action-pings" style="display: flex; align-items: center; gap: 4px;">
                        ${resetPinButton}
                        <button class="ping-btn" onclick="startEditCustomer('${c.phone}')" style="background: rgba(245, 124, 0, 0.1); color: var(--primary); border: 1px solid rgba(245, 124, 0, 0.2); font-weight: 700;">✏️</button>
                        <button class="ping-btn" onclick="window.location.href='tel:${c.phone}'">📞</button>
                        <button class="ping-btn" onclick="openWhatsAppChat('${c.phone}')">💬</button>
                    </div>
                </div>
                
                <!-- Customer Analytics Panel -->
                <div class="cust-analytics-box" style="margin-top: 6px;">
                    <span>Orders: <strong>${c.orders}</strong></span>
                    <span>Revenue: <strong>₹${c.spent}</strong></span>
                    <span>Fav: <strong>${c.favorite}</strong></span>
                </div>
            `;
        }
        list.appendChild(li);
    });
}

async function resetCustomerPin(phone) {
    trackTap();
    if (!confirm("Are you sure you want to clear the security PIN for this customer? They will be able to log in without a PIN.")) {
        return;
    }

    try {
        const res = await fetch('/api/customers/reset-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phone })
        });
        if (res.ok) {
            const data = await res.json();
            showToast(`🔓 Security PIN cleared successfully.`, "success");
            await syncStateWithBackend(); // Refresh state so new PIN is loaded
            renderCustomerListModal(); // Re-render modal to update button and badge!
        } else {
            const errData = await res.json();
            showToast(`❌ Error: ${errData.message || "Failed to reset PIN."}`, "error");
        }
    } catch (err) {
        console.error("Error resetting customer PIN:", err);
        showToast("❌ Connection error during PIN reset.", "error");
    }
}

function startEditCustomer(phone) {
    trackTap();
    state.editingCustomerPhone = phone;
    renderCustomerListModal();
}

function cancelEditCustomer() {
    trackTap();
    state.editingCustomerPhone = null;
    renderCustomerListModal();
}

async function saveCustomerEdit(oldPhone) {
    trackTap();
    const name = document.getElementById('edit-cust-name').value.trim();
    const phone = document.getElementById('edit-cust-phone').value.trim();
    const tower = document.getElementById('edit-cust-tower').value;
    const floor = document.getElementById('edit-cust-floor').value.trim();
    const flat = document.getElementById('edit-cust-flat').value.trim();
    
    if (!name || !phone || !floor || !flat) {
        showToast("⚠️ Please fill all fields.", "error");
        return;
    }
    
    try {
        const res = await fetch('/api/customers/profile/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                oldPhone: oldPhone,
                newPhone: phone,
                name: name,
                tower: tower,
                floor: floor,
                flat: flat
            })
        });
        
        if (res.ok) {
            showToast("💾 Customer profile updated successfully!", "success");
            state.editingCustomerPhone = null;
            await syncStateWithBackend();
            renderCustomerListModal();
        } else {
            showToast("❌ Failed to update customer profile.", "error");
        }
    } catch (err) {
        console.error("Error updating customer profile", err);
        showToast("❌ Error updating customer profile.", "error");
    }
}

function renderFeedbackListModal() {
    const list = document.getElementById('modal-feedback-list');
    list.innerHTML = '';
    
    const feedbacks = [
        { name: "Amit Sharma", rating: "5 ★", text: "Best Complete Meal! Felt very light and fresh, dal tadka was amazing.", time: "Today" },
        { name: "Sonia Kapoor", rating: "4 ★", text: "Rotis were very soft even after 2 hours. Prompt delivery.", time: "Yesterday" },
        { name: "Mrs. Iyer", rating: "5 ★", text: "Healthy home cooked taste, thank you Meenakashi daughter.", time: "2 days ago" }
    ];
    
    feedbacks.forEach(f => {
        const card = document.createElement('div');
        card.className = 'f-msg-card';
        card.innerHTML = `
            <div class="f-header">
                <span>👤 ${f.name} &bull; <strong style="color:var(--primary)">${f.rating}</strong></span>
                <span style="color:var(--text-muted); font-size:9px">${f.time}</span>
            </div>
            <p class="f-msg">"${f.text}"</p>
        `;
        list.appendChild(card);
    });
}

// --------------------------------------------------------------------------
// TOAST MESSAGES MANAGER
// --------------------------------------------------------------------------

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast-msg ${type}`;
    
    let icon = type === 'success' ? '✅' : type === 'usability' ? '⏱️' : 'ℹ️';
    
    toast.innerHTML = `
        <span>${icon}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => {
            if (container.contains(toast)) container.removeChild(toast);
        }, 300);
    }, 4000);
}

// Initial setup on window load
window.addEventListener('DOMContentLoaded', () => {
    recalculateFinances();
    renderAdminDashboard();
    
    // Fetch and display app version with cache buster query parameter
    fetch('/version.txt?t=' + new Date().getTime())
        .then(res => res.text())
        .then(ver => {
            const cleanVer = ver.trim();
            const headerVer = document.getElementById('header-app-version');
            if (headerVer) headerVer.textContent = `v${cleanVer}`;
            
            const sidebarVer = document.getElementById('sidebar-app-version');
            if (sidebarVer) sidebarVer.textContent = `App Version: v${cleanVer}`;
            
            document.querySelectorAll('.app-version-label').forEach(el => {
                el.textContent = `v${cleanVer}`;
            });
            
            // Force client-side reload to refresh cache on version update
            const cachedVer = localStorage.getItem('client_app_version');
            if (cachedVer && cachedVer !== cleanVer) {
                localStorage.setItem('client_app_version', cleanVer);
                window.location.reload(true);
            } else {
                localStorage.setItem('client_app_version', cleanVer);
            }
        })
        .catch(err => console.error("Error loading version.txt:", err));
    
    // Push initial history state to intercept physical back button
    history.pushState({ type: 'home' }, '');
    
    // Autofill last used phone number in customer login
    const lastPhone = localStorage.getItem('last_customer_phone');
    const custPhoneInput = document.getElementById('cust-login-phone');
    if (custPhoneInput) {
        custPhoneInput.value = lastPhone || '';
    }
    
    // Set greeting and render quick login profiles on startup
    updateLoginScreenGreeting();
    renderQuickProfiles();
    
    // Set dynamic date in header
    const dateEl = document.getElementById('current-app-date');
    if (dateEl) {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }
    
    // Check if URL specifies hiding the simulator sidebar
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('nosim') === 'true' || urlParams.get('embed') === 'true') {
        document.body.classList.add('no-sim');
    }
    
    // Show/hide simulator quick login profiles based on dev mode
    const quickProfiles = document.getElementById('cust-login-quick-profiles');
    if (quickProfiles) {
        if (urlParams.has('dev')) {
            quickProfiles.style.display = 'block';
        } else {
            quickProfiles.style.display = 'none';
        }
    }
    
    // Show/hide admin quick unlock link based on dev mode
    const adminQuickUnlock = document.getElementById('admin-quick-unlock');
    if (adminQuickUnlock) {
        if (urlParams.has('dev')) {
            adminQuickUnlock.style.display = 'block';
        } else {
            adminQuickUnlock.style.display = 'none';
        }
    }
    
    // Restore session from localStorage if present
    if (localStorage.getItem('adminUnlocked') === 'true') {
        state.isAdminUnlocked = true;
        const loginEl = document.getElementById('admin-login-screen');
        const shellEl = document.getElementById('admin-app-shell');
        if (loginEl && shellEl) {
            loginEl.classList.remove('active');
            shellEl.classList.add('active');
        }
        recalculateFinances();
        adminSwitchTab('dash');
    }
    if (localStorage.getItem('isCustomerLoggedIn') === 'true') {
        state.isCustomerLoggedIn = true;
        try {
            state.customerProfile = JSON.parse(localStorage.getItem('customerProfile')) || state.customerProfile;
            state.customerAddress = JSON.parse(localStorage.getItem('customerAddress')) || state.customerAddress;
            
            // Update headers and text fields
            const greetEl = document.getElementById('cust-header-greet');
            if (greetEl) greetEl.textContent = `Namaste ${state.customerProfile.name}! 👋`;
            const addrEl = document.getElementById('cust-header-addr');
            if (addrEl) {
                const flatPadded = state.customerAddress.flat < 10 && !state.customerAddress.flat.toString().startsWith('0') ? `0${state.customerAddress.flat}` : state.customerAddress.flat;
                addrEl.textContent = `📍 ${state.customerAddress.tower} ${state.customerAddress.floor}${flatPadded}`;
            }
        } catch (err) {
            console.error("Failed to parse saved session", err);
        }
    }
    
    // Check if URL specifies loading in native mode for a specific role
    let role = urlParams.get('role');
    
    // In production, default to customer view without simulation if no role is explicitly set
    if (!role && !urlParams.has('dev')) {
        role = 'customer';
    }
    
    if (role === 'admin' || role === 'customer') {
        document.body.classList.add('native-device');
        document.body.classList.add('no-sim');
        
        if (role === 'admin') {
            switchView('admin-mob');
        } else {
            switchView('cust-mob');
        }
    }

    // Enable Pull-to-Refresh on mockup screens
    enablePullToRefresh('admin-phone-screen', syncStateWithBackend);
    enablePullToRefresh('cust-phone-screen', syncStateWithBackend);
});

// --------------------------------------------------------------------------
// PULL TO REFRESH IMPLEMENTATION
// --------------------------------------------------------------------------
function enablePullToRefresh(elementId, refreshCallback) {
    const el = document.getElementById(elementId);
    if (!el) return;

    let startY = 0;
    let currentY = 0;
    let pulling = false;
    
    const ptr = document.createElement('div');
    ptr.className = 'ptr-indicator';
    ptr.style = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-card);
        border-bottom: 1px solid var(--app-border);
        font-size: 11px;
        font-weight: 700;
        color: var(--primary);
        z-index: 1000;
        transform: translateY(-35px);
        transition: transform 0.2s ease, opacity 0.2s ease;
        opacity: 0;
        pointer-events: none;
    `;
    ptr.innerHTML = '⬇&nbsp; Pull to refresh';
    
    el.style.position = 'relative';
    el.appendChild(ptr);

    const onStart = (pageY) => {
        if (el.scrollTop === 0) {
            startY = pageY;
            pulling = true;
            ptr.style.transition = 'none';
        }
    };

    const onMove = (pageY) => {
        if (!pulling) return;
        currentY = pageY;
        const diff = currentY - startY;

        if (diff > 0) {
            const pullDist = Math.min(diff * 0.4, 55);
            ptr.style.opacity = Math.min(pullDist / 35, 1);
            ptr.style.transform = `translateY(${pullDist - 35}px)`;
            
            if (pullDist >= 45) {
                ptr.innerHTML = '🔄&nbsp; Release to refresh';
            } else {
                ptr.innerHTML = '⬇&nbsp; Pull to refresh';
            }
        }
    };

    const onEnd = async () => {
        if (!pulling) return;
        pulling = false;
        
        const diff = currentY - startY;
        if (diff > 80) {
            ptr.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
            ptr.style.transform = 'translateY(0)';
            ptr.innerHTML = '⏳&nbsp; Refreshing...';
            ptr.style.opacity = '1';
            
            try {
                await refreshCallback();
                ptr.innerHTML = '✅&nbsp; Done!';
            } catch (err) {
                ptr.innerHTML = '❌&nbsp; Failed';
            }
            
            setTimeout(() => {
                ptr.style.transform = 'translateY(-35px)';
                ptr.style.opacity = '0';
            }, 1000);
        } else {
            ptr.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
            ptr.style.transform = 'translateY(-35px)';
            ptr.style.opacity = '0';
        }
        startY = 0;
        currentY = 0;
    };

    el.addEventListener('touchstart', (e) => onStart(e.touches[0].pageY), { passive: true });
    el.addEventListener('touchmove', (e) => onMove(e.touches[0].pageY), { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });

    el.addEventListener('mousedown', (e) => {
        if (el.scrollTop === 0) {
            onStart(e.pageY);
            
            const onMouseMove = (moveEv) => {
                onMove(moveEv.pageY);
            };
            
            const onMouseUp = () => {
                onEnd();
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);
            };
            
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }
    });
}

// --------------------------------------------------------------------------
// 13. ADDITIONAL WORKFLOWS: KITCHEN TOGGLE & DATE SELECTION
// --------------------------------------------------------------------------

async function toggleKitchenClosedToday(isClosed) {
    trackTap();
    state.kitchenClosedToday = isClosed;
    
    try {
        await fetch('/api/kitchen/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isClosed: isClosed })
        });
    } catch (e) {
        console.error("Failed to save kitchen status to server", e);
    }

    updateKitchenClosedTodayUI(isClosed);

    if (isClosed) {
        showToast("🔴 Kitchen closed for today! Customers cannot place new orders for today.", "info");
    } else {
        showToast("🟢 Kitchen is open! Customers can now order for today.", "success");
    }
}

function updateKitchenClosedTodayUI(isClosed) {
    // Mobile UI Sync
    const dot = document.getElementById('k-status-indicator-dot');
    const desc = document.getElementById('k-status-msg-desc');
    const title = document.querySelector('.kitchen-status-toggle-card h4');
    const card = document.querySelector('.kitchen-status-toggle-card');
    const toggleMob = document.getElementById('kitchen-today-close-toggle');

    if (toggleMob) toggleMob.checked = isClosed;

    if (isClosed) {
        if (card) card.classList.add('closed');
        if (dot) dot.className = 'status-dot-large red';
        if (title) title.textContent = 'Kitchen is Closed';
        if (desc) desc.textContent = 'Orders blocked for Today';
    } else {
        if (card) card.classList.remove('closed');
        if (dot) dot.className = 'status-dot-large green';
        if (title) title.textContent = 'Kitchen is Open';
        if (desc) desc.textContent = 'Accepting today\'s lunch/dinner bookings';
    }

    // Desktop UI Sync
    const toggleDesk = document.getElementById('kitchen-today-close-toggle-desk');
    const dotDesk = document.getElementById('k-status-indicator-dot-desk');
    const textDesk = document.getElementById('k-status-text-desk');

    if (toggleDesk) toggleDesk.checked = isClosed;
    if (dotDesk) {
        dotDesk.style.backgroundColor = isClosed ? 'var(--danger)' : 'var(--success)';
    }
    if (textDesk) {
        textDesk.textContent = isClosed ? 'Closed Today' : 'Open Today';
    }

    // Leave Modal Sync
    const closeTodayCheck = document.getElementById('leave-close-today-checkbox');
    if (closeTodayCheck) {
        closeTodayCheck.checked = isClosed;
    }

    // Force sync Menu & Date Strip
    renderCustomerMenu();
    if (state.currentView === 'cust-desk') {
        renderCustomerDesktop();
    }
}

function selectCustomerOrderingDate(mode, val = '') {
    trackTap();
    const dateLabel = document.getElementById('cust-selected-order-date-label');

    if (mode === 'today') {
        state.customerOrderingDate = 'today';
        if (dateLabel) {
            dateLabel.textContent = 'Today (June 21)';
        }
    } else {
        state.customerOrderingDate = 'future';
        state.customerSelectedFutureDate = val;
        
        // Format nice date
        const niceDate = new Date(val).toLocaleDateString('en-IN', {weekday: 'short', month: 'short', day: 'numeric'});
        if (dateLabel) dateLabel.textContent = `Future: ${niceDate}`;
    }
    
    renderCustomerMenu();
    if (state.currentView === 'cust-desk') {
        renderCustomerDesktop();
    }
}

function openFutureDatePicker() {
    trackTap();
    const picker = document.getElementById('cust-future-date-picker');
    if (picker) {
        picker.classList.add('active');
        picker.focus();
        picker.click(); // Trigger native calendar selection
    }
}

// --------------------------------------------------------------------------
// 14. CUSTOMER DATE STRIP & CALENDAR HELPERS
// --------------------------------------------------------------------------

function renderCustomerDateStrip() {
    const strip = document.getElementById('customer-date-strip');
    if (!strip) return;
    strip.innerHTML = '';
    
    // We will generate the next 7 days starting from June 21, 2026 (local time)
    const baseDate = new Date(2026, 5, 21); // Sunday, June 21, 2026
    
    // Helper to check if a date (YYYY-MM-DD) is in leave list
    const isLeaveDate = (dStr) => {
        return state.leave && state.leave.declared && state.leave.dates && state.leave.dates.includes(dStr);
    };
    
    // Helper to format date YYYY-MM-DD
    const formatDateStr = (dateObj) => {
        const y = dateObj.getFullYear();
        const m = dateObj.getMonth() + 1;
        const d = dateObj.getDate();
        return `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
    };
    
    // We will render cards for next 7 days
    for (let i = 0; i < 7; i++) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + i);
        
        const dateStr = formatDateStr(d);
        const isToday = i === 0;
        
        // Check if closed (either today and kitchenClosedToday is true, or is in declared leave dates)
        const isClosed = (isToday && state.kitchenClosedToday) || isLeaveDate(dateStr);
        
        // Active selection?
        let isActive = false;
        if (state.customerOrderingDate === 'today' && isToday) {
            isActive = true;
        } else if (state.customerOrderingDate === 'future' && state.customerSelectedFutureDate === dateStr) {
            isActive = true;
        }
        
        // Create Card HTML
        const card = document.createElement('div');
        card.className = `cust-date-card ${isActive ? 'active' : ''} ${isClosed ? 'closed' : ''}`;
        
        const dayName = isToday ? 'Today' : d.toLocaleDateString('en-IN', {weekday: 'short'});
        const dayNum = d.getDate();
        const monthName = d.toLocaleDateString('en-IN', {month: 'short'});
        const statusLabel = isClosed ? '🔴 OFF' : '🟢 OPEN';
        
        card.innerHTML = `
            <span class="date-day">${dayName}</span>
            <span class="date-num">${dayNum}</span>
            <span class="date-month">${monthName}</span>
            <span class="date-status-lbl">${statusLabel}</span>
        `;
        
        // On click handler
        card.onclick = () => {
            if (isToday) {
                selectCustomerOrderingDate('today');
            } else {
                selectCustomerOrderingDate('date', dateStr);
            }
        };
        
        strip.appendChild(card);
    }
    
    // Render custom "More Dates..." card at the end
    let isCustomActive = state.customerOrderingDate === 'future' && !isPredefinedDate(state.customerSelectedFutureDate, baseDate);
    const customCard = document.createElement('div');
    customCard.className = `cust-date-card custom-picker-card ${isCustomActive ? 'active' : ''}`;
    
    let customLabelNum = '📅';
    let customLabelMonth = 'More';
    if (isCustomActive) {
        const custDateObj = new Date(state.customerSelectedFutureDate);
        customLabelNum = custDateObj.getDate();
        customLabelMonth = custDateObj.toLocaleDateString('en-IN', {month: 'short'});
    }
    
    customCard.innerHTML = `
        <span class="date-day">Custom</span>
        <span class="date-num">${customLabelNum}</span>
        <span class="date-month">${customLabelMonth}</span>
        <span class="date-status-lbl">${isCustomActive ? 'Selected' : 'Select'}</span>
    `;
    
    customCard.onclick = () => openFutureDatePicker();
    strip.appendChild(customCard);
}

function isPredefinedDate(dateStr, baseDate) {
    if (!dateStr) return false;
    for (let i = 0; i < 7; i++) {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + i);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const day = d.getDate();
        const dStr = `${y}-${m < 10 ? '0' + m : m}-${day < 10 ? '0' + day : day}`;
        if (dStr === dateStr) return true;
    }
    return false;
}

// --------------------------------------------------------------------------
// 15. BULK STATUS CHANGES FOR ORDERS
// --------------------------------------------------------------------------

function toggleBulkSelectAll(isChecked) {
    trackTap();
    const checkboxes = document.querySelectorAll('#admin-orders-list .order-bulk-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
    });
    updateBulkSelectCount();
}

function onOrderSelectChange() {
    trackTap();
    updateBulkSelectCount();
}

function updateBulkSelectCount() {
    const total = document.querySelectorAll('#admin-orders-list .order-bulk-checkbox').length;
    const checked = document.querySelectorAll('#admin-orders-list .order-bulk-checkbox:checked').length;
    
    const countSpan = document.getElementById('bulk-select-count');
    if (countSpan) countSpan.textContent = checked;
    
    const selectAllCheck = document.getElementById('bulk-select-all-checkbox');
    if (selectAllCheck) {
        selectAllCheck.checked = total > 0 && checked === total;
        selectAllCheck.indeterminate = checked > 0 && checked < total;
    }
}

async function runBulkAction(actionType) {
    trackTap();
    const checkboxes = document.querySelectorAll('#admin-orders-list .order-bulk-checkbox:checked');
    if (checkboxes.length === 0) {
        showToast("⚠️ Please select at least one order.", "info");
        return;
    }
    
    const orderIds = Array.from(checkboxes).map(cb => cb.getAttribute('data-order-id'));
    
    let url = '';
    if (actionType === 'accept') url = '/api/orders/bulk-accept';
    else if (actionType === 'deliver') url = '/api/orders/bulk-deliver';
    else if (actionType === 'reject') url = '/api/orders/bulk-delete';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderIds })
        });
        if (!res.ok) throw new Error("Bulk action failed");

        await syncStateWithBackend();

        showToast(`✨ Successfully updated selected orders!`, "success");
        playNotificationSound();

        const selectAllCheck = document.getElementById('bulk-select-all-checkbox');
        if (selectAllCheck) selectAllCheck.checked = false;
    } catch (e) {
        showToast("❌ Error: " + e.message, "danger");
    }
}

// Admin Desktop Bulk Actions
function toggleBulkSelectAllDesk(isChecked) {
    trackTap();
    const checkboxes = document.querySelectorAll('#desk-dashboard-orders .order-bulk-checkbox-desk');
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
    });
    updateBulkSelectCountDesk();
}

function onOrderSelectChangeDesk() {
    trackTap();
    updateBulkSelectCountDesk();
}

function updateBulkSelectCountDesk() {
    const total = document.querySelectorAll('#desk-dashboard-orders .order-bulk-checkbox-desk').length;
    const checked = document.querySelectorAll('#desk-dashboard-orders .order-bulk-checkbox-desk:checked').length;
    
    const countSpan = document.getElementById('bulk-select-count-desk');
    if (countSpan) countSpan.textContent = checked;
    
    const selectAllCheck = document.getElementById('bulk-select-all-checkbox-desk');
    if (selectAllCheck) {
        selectAllCheck.checked = total > 0 && checked === total;
        selectAllCheck.indeterminate = checked > 0 && checked < total;
    }
    
    const deskBulkBar = document.getElementById('desk-bulk-actions-bar');
    if (deskBulkBar) {
        deskBulkBar.style.display = checked > 0 ? 'flex' : 'none';
    }
}

async function runBulkActionDesk(actionType) {
    trackTap();
    const checkboxes = document.querySelectorAll('#desk-dashboard-orders .order-bulk-checkbox-desk:checked');
    if (checkboxes.length === 0) {
        showToast("⚠️ Please select at least one order.", "info");
        return;
    }
    
    const orderIds = Array.from(checkboxes).map(cb => cb.getAttribute('data-order-id'));
    
    let url = '';
    if (actionType === 'accept') url = '/api/orders/bulk-accept';
    else if (actionType === 'deliver') url = '/api/orders/bulk-deliver';
    else if (actionType === 'reject') url = '/api/orders/bulk-delete';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderIds })
        });
        if (!res.ok) throw new Error("Bulk action failed");

        await syncStateWithBackend();

        showToast(`✨ Successfully updated selected orders!`, "success");
        playNotificationSound();

        const selectAllCheck = document.getElementById('bulk-select-all-checkbox-desk');
        if (selectAllCheck) selectAllCheck.checked = false;
    } catch (e) {
        showToast("❌ Error: " + e.message, "danger");
    }
}

function switchDesktopSubtab(tabName) {
    trackTap();
    const links = document.querySelectorAll('.desk-menu-links li');
    links.forEach(l => l.classList.remove('active'));
    
    links.forEach(l => {
        if (l.textContent.toLowerCase().includes(tabName)) {
            l.classList.add('active');
        }
    });
    
    if (tabName !== 'dashboard') {
        showToast(`🖥️ The ${tabName.toUpperCase()} tab is optimized for Meenakashi's Mobile App. Switch to 'Admin Mobile' view on the left to test it!`, "info");
    }
}

// --------------------------------------------------------------------------
// 16. CUSTOMER LOGIN / LOGOUT LOGIC
// --------------------------------------------------------------------------

async function submitCustomerLogin() {
    trackTap();
    const phoneInput = document.getElementById('cust-login-phone');
    if (!phoneInput) return;
    const phone = phoneInput.value.trim();
    if (phone.length !== 10 || isNaN(phone)) {
        showToast("⚠️ Enter a valid 10-digit phone number.", "info");
        return;
    }

    const pinGroup = document.getElementById('cust-login-pin-group');
    const pinInput = document.getElementById('cust-login-pin');
    
    // Step 1: If PIN group is not visible, check if customer has a PIN
    if (pinGroup && pinGroup.style.display === 'none') {
        try {
            const initRes = await fetch('/api/customers/login/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone })
            });
            if (initRes.ok) {
                const initData = await initRes.json();
                if (initData.hasPin) {
                    // Show PIN input block and change focus
                    pinGroup.style.display = 'block';
                    pinInput.value = '';
                    pinInput.focus();
                    showToast("🔒 Secure account. Please enter your 4-digit PIN.", "info");
                    return; // Wait for PIN entry
                }
            }
        } catch (err) {
            console.error("Error during login init:", err);
        }
    }

    // Step 2: Verify Login with Phone and PIN
    const pinVal = pinInput ? pinInput.value.trim() : "";
    try {
        const verifyRes = await fetch('/api/customers/login/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phone, pin: pinVal })
        });

        if (!verifyRes.ok) {
            const errData = await verifyRes.json();
            showToast(`❌ ${errData.message || "Login failed."}`, "error");
            return;
        }

        const customer = await verifyRes.json();
        
        state.customerProfile.name = customer.name;
        state.customerProfile.phone = customer.phone;
        state.customerAddress.tower = customer.tower;
        state.customerAddress.floor = customer.floor;
        state.customerAddress.flat = customer.flat;
        
        showToast(`👋 Welcome back, ${customer.name}!`, "success");

        // Sync state to get latest order history
        await syncStateWithBackend();

        // Reset login elements
        if (pinGroup) pinGroup.style.display = 'none';
        if (pinInput) pinInput.value = '';

        state.isCustomerLoggedIn = true;
        localStorage.setItem('isCustomerLoggedIn', 'true');
        localStorage.setItem('last_customer_phone', customer.phone);
        localStorage.setItem('last_customer_name', customer.name);
        localStorage.setItem('customerProfile', JSON.stringify(state.customerProfile));
        localStorage.setItem('customerAddress', JSON.stringify(state.customerAddress));
        updateLoginScreenGreeting();
        
        // Update headers and text fields
        document.getElementById('cust-header-greet').textContent = `Namaste ${state.customerProfile.name}! 👋`;
        const flatPadded = state.customerAddress.flat < 10 && !state.customerAddress.flat.toString().startsWith('0') ? `0${state.customerAddress.flat}` : state.customerAddress.flat;
        document.getElementById('cust-header-addr').textContent = `📍 ${state.customerAddress.tower} ${state.customerAddress.floor}${flatPadded}`;
        
        // Hide login screen, show app shell
        document.getElementById('cust-login-screen').classList.remove('active');
        document.getElementById('cust-login-screen').style.display = 'none';
        document.getElementById('customer-app-shell').classList.add('active');
        document.getElementById('customer-app-shell').style.display = 'flex';
        
        custSwitchTab('menu');

    } catch (err) {
        showToast("❌ Connection error during verification.", "error");
        console.error(err);
    }
}

function quickCustomerLogin(name, phone, tower, floor, flat) {
    trackTap();
    state.customerProfile.name = name;
    state.customerProfile.phone = phone;
    state.customerAddress.tower = tower;
    state.customerAddress.floor = floor;
    state.customerAddress.flat = flat;
    
    // Reset login inputs
    const pinGroup = document.getElementById('cust-login-pin-group');
    if (pinGroup) pinGroup.style.display = 'none';
    const pinInput = document.getElementById('cust-login-pin');
    if (pinInput) pinInput.value = '';
    const phoneInput = document.getElementById('cust-login-phone');
    if (phoneInput) phoneInput.value = phone;

    state.isCustomerLoggedIn = true;
    localStorage.setItem('isCustomerLoggedIn', 'true');
    localStorage.setItem('last_customer_phone', phone);
    localStorage.setItem('last_customer_name', name);
    localStorage.setItem('customerProfile', JSON.stringify(state.customerProfile));
    localStorage.setItem('customerAddress', JSON.stringify(state.customerAddress));
    updateLoginScreenGreeting();
    
    // Update headers and text fields
    document.getElementById('cust-header-greet').textContent = `Namaste ${name}! 👋`;
    const flatPadded = flat < 10 && !flat.toString().startsWith('0') ? `0${flat}` : flat;
    document.getElementById('cust-header-addr').textContent = `📍 ${tower} ${floor}${flatPadded}`;
    
    // Hide login screen, show app shell
    document.getElementById('cust-login-screen').classList.remove('active');
    document.getElementById('cust-login-screen').style.display = 'none';
    document.getElementById('customer-app-shell').classList.add('active');
    document.getElementById('customer-app-shell').style.display = 'flex';
    
    showToast(`👋 Welcome back, ${name}!`, "success");
    custSwitchTab('menu');
}

function logoutCustomer() {
    trackTap();
    state.isCustomerLoggedIn = false;
    state.cart = [];
    
    localStorage.removeItem('isCustomerLoggedIn');
    localStorage.removeItem('customerProfile');
    localStorage.removeItem('customerAddress');
    
    // Refresh greeting and quick profiles list on logout
    updateLoginScreenGreeting();
    renderQuickProfiles();
    
    // Hide app shell, show login screen
    document.getElementById('cust-login-screen').classList.add('active');
    document.getElementById('cust-login-screen').style.display = 'flex';
    document.getElementById('customer-app-shell').classList.remove('active');
    document.getElementById('customer-app-shell').style.display = 'none';
    
    showToast("🚪 Logged out successfully", "info");
}

// Start-up Initial Load
syncStateWithBackend();

// Poll backend every 5 seconds to load newly placed customer orders
setInterval(() => syncStateWithBackend(true), 5000);

function updateLoginScreenGreeting() {
    const greetingEl = document.getElementById('cust-login-welcome-title');
    if (!greetingEl) return;
    const lastName = localStorage.getItem('last_customer_name');
    if (lastName) {
        greetingEl.textContent = `Welcome back, ${lastName}! 👋`;
    } else {
        greetingEl.textContent = 'Welcome Resident! 👋';
    }
}

function renderQuickProfiles() {
    const container = document.getElementById('cust-quick-login-container');
    if (!container) return;
    container.innerHTML = '';
    
    const amit = state.customersList.find(c => c.phone === '9876543210') || { name: 'Amit Sharma', phone: '9876543210', tower: 'Alexander', floor: '22', flat: '08' };
    const sonia = state.customersList.find(c => c.phone === '9930048123') || { name: 'Sonia Kapoor', phone: '9930048123', tower: 'Ceaser', floor: '14', flat: '02' };
    
    const profiles = [amit, sonia];
    profiles.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'sim-action-btn small';
        btn.style.cssText = 'padding: 4px 8px; font-size: 9.5px; margin: 0; background: #fff; border: 1px solid var(--app-border); cursor: pointer;';
        
        const shortName = p.name.split(' ')[0];
        const flatPadded = p.flat < 10 && !p.flat.toString().startsWith('0') ? `0${p.flat}` : p.flat;
        const towerShort = p.tower.substring(0, 4);
        btn.textContent = `${shortName} (${towerShort} ${p.floor}${flatPadded})`;
        
        btn.onclick = () => quickCustomerLogin(p.name, p.phone, p.tower, p.floor, p.flat);
        container.appendChild(btn);
    });
}

