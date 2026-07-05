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
        items: [
            { id: 1, name: 'Anshaisha Complete Meal', price: 200, checked: true, isMeal: true },
            { id: 2, name: 'Paneer Butter Masala (Rich butter paneer gravy)', price: 130, checked: false },
            { id: 3, name: 'Dal Tadka (Hygienic home style yellow dal)', price: 100, checked: false },
            { id: 4, name: 'Jeera Rice (Basmati rice with cumin)', price: 80, checked: false },
            { id: 5, name: 'Chapatis (Soft whole wheat rotis - pack of 3)', price: 30, checked: false },
            { id: 6, name: 'Veg Biryani (Flavorful veg pulav with raita)', price: 140, checked: false }
        ]
    },

    // Kitchen Orders DB
    orders: [
        {
            id: 'ORD-101',
            customer: 'Amit Sharma',
            tower: 'Alexander',
            floor: '22',
            flat: '08',
            address: 'Alexander 2208',
            items: '1x Complete Meal (Extra Roti)',
            price: 210,
            status: 'Delivered', // New | Preparing | Delivered
            time: 'Today, 11:45 AM',
            isToday: true,
            remark: 'Placed on App'
        },
        {
            id: 'ORD-102',
            customer: 'Sonia Kapoor',
            tower: 'Ceaser',
            floor: '14',
            flat: '02',
            address: 'Ceaser 1402',
            items: '1x Complete Meal (No Rice)',
            price: 180,
            status: 'Preparing',
            time: 'Today, 12:10 PM',
            isToday: true,
            remark: 'Placed on App'
        },
        {
            id: 'ORD-103',
            customer: 'Major R. D. Singh',
            tower: 'Napoleon',
            floor: '05',
            flat: '04',
            address: 'Napoleon 0504',
            items: '2x Complete Meal',
            price: 400,
            status: 'New',
            time: 'Today, 12:15 PM',
            isToday: true,
            remark: 'Received on Phone'
        },
        {
            id: 'ORD-104',
            customer: 'Vikram Malhotra',
            tower: 'Alexander',
            floor: '11',
            flat: '05',
            address: 'Alexander 1105',
            items: '1x Paneer Butter Masala, 1x Jeera Rice',
            price: 210,
            status: 'New',
            time: 'Tomorrow, 12:00 PM',
            isToday: false,
            remark: 'Placed on App'
        }
    ],

    // Order History Ledger (Archived orders from previous days)
    orderHistory: [
        { id: 'ORD-098', date: 'June 18, 2026', customer: 'Amit Sharma', address: 'Alexander 2208', items: '1x Complete Meal (Extra Roti)', price: 210, status: 'Delivered', remark: 'Placed on App' },
        { id: 'ORD-097', date: 'June 17, 2026', customer: 'Sonia Kapoor', address: 'Ceaser 1402', items: '1x Complete Meal (No Rice)', price: 180, status: 'Delivered', remark: 'Received on Phone' },
        { id: 'ORD-096', date: 'June 16, 2026', customer: 'Rahul Verma', address: 'Alexander 3106', items: '2x Complete Meal', price: 400, status: 'Delivered', remark: 'Placed on App' },
        { id: 'ORD-095', date: 'June 15, 2026', customer: 'Mrs. Iyer', address: 'Napoleon 1801', items: '1x Complete Meal', price: 200, status: 'Delivered', remark: 'Received on Phone' },
        { id: 'ORD-094', date: 'June 14, 2026', customer: 'Amit Sharma', address: 'Alexander 2208', items: '1x Complete Meal', price: 200, status: 'Delivered', remark: 'Placed on App' }
    ],

    // Outstanding Payments DB
    payments: [
        { id: 'PAY-01', customer: 'Sonia Kapoor', tower: 'Ceaser', floor: '14', flat: '02', address: 'Ceaser 1402', amount: 320, daysDue: 3, level: 'warning' },
        { id: 'PAY-02', customer: 'Rahul Verma', tower: 'Alexander', floor: '31', flat: '06', address: 'Alexander 3106', amount: 560, daysDue: 5, level: 'critical' },
        { id: 'PAY-03', customer: 'Mrs. Iyer', tower: 'Napoleon', floor: '18', flat: '01', address: 'Napoleon 1801', amount: 250, daysDue: 1, level: 'normal' }
    ],

    // Business Expenses DB (Logged Today)
    expenses: [
        { id: 'EXP-01', category: 'Vegetables', icon: '🥕', amount: 450, notes: 'Tomato, onion, green chili' },
        { id: 'EXP-02', category: 'Packaging', icon: '📦', amount: 80, notes: 'Eco containers & bags' },
        { id: 'EXP-03', category: 'Gas', icon: '🔥', amount: 200, notes: 'Refill share' }
    ],

    // Global stats calculated dynamically
    stats: {
        revenue: 1950,
        expenses: 730,
        profit: 1220
    },

    // Customer Shopping Cart state
    cart: [],
    customerProfile: {
        name: 'Amit Sharma',
        phone: '9876543210',
        avatar: '👩‍💼'
    },
    customerAddress: {
        tower: 'Alexander',
        floor: '22',
        flat: '8'
    },

    // Customer Database List & Stats (Analytics)
    customersList: [
        { name: "Amit Sharma", tower: "Alexander", floor: "22", flat: "08", phone: "9876543210", orders: 12, spent: 2540, favorite: "Complete Meal" },
        { name: "Sonia Kapoor", tower: "Ceaser", floor: "14", flat: "02", phone: "9821034988", orders: 8, spent: 1680, favorite: "Paneer Butter Masala" },
        { name: "Rahul Verma", tower: "Alexander", floor: "31", flat: "06", phone: "9930048123", orders: 15, spent: 3120, favorite: "Complete Meal" },
        { name: "Mrs. Iyer", tower: "Napoleon", floor: "18", flat: "01", phone: "9819923455", orders: 6, spent: 1200, favorite: "Complete Meal" }
    ],

    // Usability Testing Loggers
    usability: {
        taps: 0,
        startTime: null,
        activeWorkflow: null,
        lastReport: '-'
    },
    
    // App announcements
    announcements: [
        "Meenakashi: Lunch orders accepted till 11:30 AM. Fresh ingredients only!"
    ],
    
    // Leave status
    leave: {
        declared: true,
        dates: ['2026-06-25', '2026-06-26'],
        reason: 'Kitchen closed for family function'
    }
};

// Default preset items copy to recover during reset
const initialBackup = JSON.parse(JSON.stringify(state));

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
        showToast("✅ Welcome Back, Meenakashi!", "success");
        
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
    document.getElementById('rate-no-rice').value = Math.abs(state.menu.addons.rice);
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

function addCustomDish() {
    trackTap();
    const nameInput = document.getElementById('custom-dish-name');
    const priceInput = document.getElementById('custom-dish-price');
    const name = nameInput.value.trim();
    const price = parseInt(priceInput.value);
    
    if (!name || isNaN(price) || price <= 0) {
        showToast("⚠️ Type a valid dish name and price", "info");
        return;
    }
    
    const newId = state.menu.items.length + 1;
    state.menu.items.push({
        id: newId,
        name: `${name} (Custom)`,
        price: price,
        checked: true
    });
    
    renderAdminMenuBuilder();
    
    nameInput.value = '';
    priceInput.value = '';
    
    showToast(`🍽️ Added "${name}" to presets!`, 'success');
}

function selectGraphicTemplate(card, templateName) {
    trackTap();
    document.querySelectorAll('.template-card').forEach(t => t.classList.remove('active'));
    card.classList.add('active');
    state.menu.graphicTemplate = templateName;
}

function publishDailyMenu() {
    trackTap();
    const selectedSession = document.querySelector('input[name="menu-time"]:checked').value;
    state.menu.session = selectedSession;
    
    // Read Editor values
    state.menu.mealDescription = document.getElementById('complete-meal-desc-input').value.trim();
    state.menu.addons.roti = parseInt(document.getElementById('rate-extra-roti').value) || 10;
    state.menu.addons.rice = -(parseInt(document.getElementById('rate-no-rice').value) || 20);
    state.menu.addons.sabji = parseInt(document.getElementById('rate-extra-sabji').value) || 40;
    
    const activeDishes = state.menu.items.filter(item => item.checked);
    if (activeDishes.length === 0) {
        showToast("⚠️ Select at least 1 dish to publish!", "info");
        return;
    }
    
    // Compile WhatsApp preview message
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
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
    
    msg += `🔗 Order in 30 seconds here: https://anshaisha.web.app/order\n`;
    msg += `_Please order by ${selectedSession === 'Lunch' ? '11:30 AM' : '6:30 PM'}._`;
    
    document.getElementById('whatsapp-msg-content').innerHTML = msg.replace(/\n/g, '<br>');
    
    // Open Dialog modal
    openModal('whatsapp-share-modal');
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

function acceptOrder(orderId) {
    startWorkflow('Accept Order');
    
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'Preparing';
        showToast(`👨‍🍳 Cooking started for ${order.customer} (${order.address})`, 'success');
        
        // Immediate UI refresh
        renderAdminDashboard();
        renderAdminOrders();
        
        // Sync desktop view if active
        if (state.currentView === 'admin-desk') {
            renderAdminDesktop();
        }
        
        completeWorkflow('Order Accepted');
    }
}

function rejectOrder(orderId) {
    trackTap();
    state.orders = state.orders.filter(o => o.id !== orderId);
    showToast("❌ Order cancelled/rejected", "info");
    renderAdminDashboard();
    renderAdminOrders();
    if (state.currentView === 'admin-desk') {
        renderAdminDesktop();
    }
}

function deliverOrder(orderId) {
    trackTap();
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'Delivered';
        
        // Automatically add order revenue to finance summary
        state.stats.revenue += order.price;
        recalculateFinances();
        
        showToast(`🛵 Delivered to ${order.address}! Revenue +₹${order.price} recorded.`, 'success');
        
        renderAdminDashboard();
        renderAdminOrders();
        if (state.currentView === 'admin-desk') {
            renderAdminDesktop();
        }
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

function submitImpersonatedOrder() {
    trackTap();
    const selectVal = document.getElementById('imp-customer-select').value;
    const remark = document.getElementById('imp-order-remark').value.trim() || 'Received on Phone';
    
    let custName = selectVal;
    let tower = 'Alexander';
    let floor = '22';
    let flat = '08';
    
    if (selectVal === 'New Walk-in') {
        custName = document.getElementById('imp-cust-name').value.trim();
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
    const flatPadded = flat < 10 && !flat.startsWith('0') ? `0${flat}` : flat;
    const address = `${tower} ${floor}${flatPadded}`;

    const newOrd = {
        id: `ORD-${state.orders.length + 101}`,
        customer: custName,
        tower: tower,
        floor: floor,
        flat: flat,
        address: address,
        items: itemsDescription,
        price: price,
        status: 'New',
        time: 'Today, ' + new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}),
        isToday: true,
        remark: remark
    };

    state.orders.unshift(newOrd);
    
    // Sound chime & UI updates
    playNotificationSound();
    closeModal('impersonate-order-modal');
    showToast(`📞 Phone order logged for ${custName} (${address}) successfully!`, 'success');

    renderAdminDashboard();
    renderAdminOrders();
    if (state.currentView === 'admin-desk') {
        renderAdminDesktop();
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

function submitExpense() {
    startWorkflow('Record Expense');
    
    const amountInput = document.getElementById('expense-amount');
    const notesInput = document.getElementById('expense-notes');
    const amount = parseInt(amountInput.value);
    const notes = notesInput.value.trim() || 'General';
    
    if (isNaN(amount) || amount <= 0) {
        showToast("⚠️ Please type a valid amount", "info");
        return;
    }
    
    // Add to state
    const newId = `EXP-${state.expenses.length + 1}`;
    state.expenses.push({
        id: newId,
        category: selectedExpenseCategory,
        icon: selectedExpenseIcon,
        amount: amount,
        notes: notes
    });
    
    // Subtract from state finance sheet
    state.stats.expenses += amount;
    recalculateFinances();
    
    // Render outputs
    renderAdminFinances();
    
    amountInput.value = '';
    notesInput.value = '';
    
    showToast(`📉 Cost of ₹${amount} logged for ${selectedExpenseCategory}!`, 'success');
    
    completeWorkflow('Record Expense');
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

function sendReminderWhatsApp() {
    trackTap();
    closeModal('payment-reminder-modal');
    showToast(`💬 Reminder message sent to WhatsApp successfully!`, 'success');
}

function markPaidWorkflow(paymentId) {
    startWorkflow('Record Payment');
    
    const index = state.payments.findIndex(item => item.id === paymentId);
    if (index !== -1) {
        const item = state.payments[index];
        
        // Remove from list
        state.payments.splice(index, 1);
        
        // Add to active today's revenue
        state.stats.revenue += item.amount;
        recalculateFinances();
        
        // Re-render
        renderAdminPayments();
        
        // Sync desktop view if active
        if (state.currentView === 'admin-desk') {
            renderAdminDesktop();
        }
        
        showToast(`💰 Payment of ₹${item.amount} recorded for ${item.customer}!`, 'success');
        
        completeWorkflow('Record Payment');
    }
}

// --------------------------------------------------------------------------
// 9. SIMULATOR TRIGGERS & UTILITIES
// --------------------------------------------------------------------------

function simulateNewOrder() {
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
    
    const newOrd = {
        id: `ORD-${state.orders.length + 101}`,
        customer: chosenName,
        tower: chosenTower,
        floor: chosenFlat.slice(0, -2) || '02',
        flat: chosenFlat.slice(-2),
        address: `${chosenTower} ${chosenFlat}`,
        items: itemStr,
        price: price,
        status: 'New',
        time: 'Today, ' + new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}),
        isToday: true,
        remark: 'App Order'
    };
    
    state.orders.unshift(newOrd);
    
    playNotificationSound();
    
    const banner = document.getElementById('incoming-order-banner');
    document.getElementById('banner-order-desc').textContent = `${newOrd.address} - ₹${newOrd.price}`;
    banner.classList.remove('hidden');
    
    renderAdminDashboard();
    renderAdminOrders();
    
    if (state.currentView === 'admin-desk') {
        renderAdminDesktop();
    }
    
    showToast(`🔔 Simulation: New Order from ${newOrd.address}!`, 'info');
}

function resetPrototypeData() {
    state.menu = JSON.parse(JSON.stringify(initialBackup.menu));
    state.orders = JSON.parse(JSON.stringify(initialBackup.orders));
    state.payments = JSON.parse(JSON.stringify(initialBackup.payments));
    state.expenses = JSON.parse(JSON.stringify(initialBackup.expenses));
    state.stats = JSON.parse(JSON.stringify(initialBackup.stats));
    state.cart = [];
    state.enteredPin = '';
    state.usability.taps = 0;
    state.usability.startTime = null;
    state.usability.activeWorkflow = null;
    state.usability.lastReport = '-';
    
    document.querySelectorAll('.goals-list li').forEach(li => li.className = '');
    
    const tapCountEl = document.getElementById('tap-count');
    if (tapCountEl) tapCountEl.textContent = '0';
    const actionTimerEl = document.getElementById('action-timer');
    if (actionTimerEl) actionTimerEl.textContent = '0.0s';
    const lastActionEl = document.getElementById('last-action');
    if (lastActionEl) lastActionEl.textContent = '-';
    
    recalculateFinances();
    showToast("🔄 Prototype data reset to default presets", "info");
    
    if (state.currentView === 'admin-mob') {
        if (state.isAdminUnlocked) adminSwitchTab('dash');
        else showAdminLoginScreen();
    } else if (state.currentView === 'admin-desk') {
        renderAdminDesktop();
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
    
    if (isTodayClosed || isLeaveDay) {
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
        
        let photoColor = state.menu.graphicTemplate;
        
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
                            <button class="add-cart-btn" onclick="addCustFoodToCart(${d.id})">Add +</button>
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
                    <label style="font-size:11px; font-weight:500;">
                        <input type="checkbox" id="add-opt-norice-${d.id}" onchange="recalculateCustFoodPrice(${d.id})"> No Rice (-₹${Math.abs(state.menu.addons.rice)})
                    </label>
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
    
    // Sync default profile values into checkout controls
    document.getElementById('cust-floor-typed').value = state.customerAddress.floor;
    document.getElementById('cust-floor-slider').value = state.customerAddress.floor;
    
    updateGeneratedAddress();
    openModal('customer-checkout-modal');
}

function submitCustOrder() {
    trackTap();
    const confirmBox = document.getElementById('payment-checkbox-confirm');
    if (!confirmBox.checked) {
        showToast("⚠️ Please check the box to confirm you completed the UPI transfer.", "info");
        return;
    }
    
    closeModal('customer-checkout-modal');
    
    const total = state.cart.reduce((acc, curr) => acc + (curr.qty * curr.price), 0);
    const flatPadded = state.customerAddress.flat < 10 && !state.customerAddress.flat.toString().startsWith('0') ? `0${state.customerAddress.flat}` : state.customerAddress.flat;
    const finalAddress = `${state.customerAddress.tower} ${state.customerAddress.floor}${flatPadded}`;
    
    const isTodaySelected = state.customerOrderingDate === 'today';
    const newOrd = {
        id: `ORD-${state.orders.length + 101}`,
        customer: state.customerProfile.name,
        tower: state.customerAddress.tower,
        floor: state.customerAddress.floor,
        flat: state.customerAddress.flat,
        address: finalAddress,
        items: state.cart.map(c => `${c.qty}x ${c.name}`).join(', '),
        price: total,
        status: 'New',
        time: isTodaySelected ? 'Today, ' + new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'}) : 'Booked: ' + state.customerSelectedFutureDate,
        isToday: isTodaySelected,
        remark: isTodaySelected ? 'Placed on App' : 'Future Booked'
    };
    
    state.orders.unshift(newOrd);
    
    // Sound & Toast updates
    playNotificationSound();
    
    const banner = document.getElementById('incoming-order-banner');
    document.getElementById('banner-order-desc').textContent = `${newOrd.address} - ₹${newOrd.price}`;
    banner.classList.remove('hidden');
    
    state.cart = [];
    renderCustomerMenu();
    updateCartFloatBar();
    
    custSwitchTab('orders');
    showToast("🎉 Order placed successfully! Meenakashi has been notified.", "success");
    
    renderAdminDashboard();
    renderAdminOrders();
    if (state.currentView === 'admin-desk') {
        renderAdminDesktop();
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
    state.customerProfile.name = document.getElementById('profile-name').value.trim() || 'Amit Sharma';
    state.customerProfile.phone = document.getElementById('profile-phone').value.trim() || '9876543210';
    
    syncProfileAddressChange();

    // Sync UI elements
    document.getElementById('cust-header-greet').textContent = `Namaste ${state.customerProfile.name}! 👋`;
    
    const flatPadded = state.customerAddress.flat < 10 && !state.customerAddress.flat.toString().startsWith('0') ? `0${state.customerAddress.flat}` : state.customerAddress.flat;
    document.getElementById('cust-header-addr').textContent = `📍 ${state.customerAddress.tower} ${state.customerAddress.floor}${flatPadded}`;

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
                    <label style="font-size:11px;"><input type="checkbox" id="add-opt-norice-${d.id}" onchange="recalculateCustFoodPrice(${d.id})"> No Rice (-₹${Math.abs(state.menu.addons.rice)})</label>
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
}

function closeModal(id) {
    trackTap();
    document.getElementById(id).classList.add('hidden');
}

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

function saveLeave() {
    trackTap();
    const reason = document.getElementById('leave-reason').value.trim() || 'Kitchen closed';
    const datesArr = Array.from(tempLeaveDates).sort();
    
    if (datesArr.length === 0) {
        state.leave = { declared: false, dates: [], reason: '' };
        
        const bannerText = document.getElementById('announcement-banner-view');
        if (bannerText) {
            bannerText.innerHTML = `📢 <em>Meenakashi:</em> Lunch orders accepted till 11:30 AM. Fresh ingredients only!`;
        }
        showToast("📅 Cleared all leave days.", "info");
    } else {
        state.leave = { declared: true, dates: datesArr, reason: reason };
        
        let dateStr = '';
        if (datesArr.length === 1) {
            dateStr = new Date(datesArr[0]).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'});
        } else {
            const startStr = new Date(datesArr[0]).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'});
            const endStr = new Date(datesArr[datesArr.length - 1]).toLocaleDateString('en-IN', {month: 'short', day: 'numeric'});
            dateStr = `${startStr} to ${endStr}`;
        }
        
        const bannerText = document.getElementById('announcement-banner-view');
        if (bannerText) {
            bannerText.innerHTML = `📢 <em>Meenakashi:</em> Kitchen Closed on (${dateStr}) due to: ${reason}`;
        }
        
        showToast(`📅 Kitchen marked closed for: ${dateStr}!`, "info");
    }
    
    closeModal('leave-modal');
    showToast(`📅 Kitchen marked closed for: ${dateStr}!`, "info");
}

function renderCustomerListModal() {
    const list = document.getElementById('modal-customer-list');
    list.innerHTML = '';
    
    state.customersList.forEach(c => {
        const li = document.createElement('li');
        li.style.flexDirection = 'column';
        li.style.alignItems = 'stretch';
        li.style.gap = '4px';

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
                    <button class="ping-btn" onclick="showToast('Calling ${c.name}...', 'info')">📞</button>
                    <button class="ping-btn" onclick="showToast('Opening WhatsApp chat...', 'info')">💬</button>
                </div>
            </div>
            
            <!-- Customer Analytics Panel -->
            <div class="cust-analytics-box" style="margin-top: 6px;">
                <span>Orders: <strong>${c.orders}</strong></span>
                <span>Revenue: <strong>₹${c.spent}</strong></span>
                <span>Fav: <strong>${c.favorite}</strong></span>
            </div>
        `;
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
});

// --------------------------------------------------------------------------
// 13. ADDITIONAL WORKFLOWS: KITCHEN TOGGLE & DATE SELECTION
// --------------------------------------------------------------------------

function toggleKitchenClosedToday(isClosed) {
    trackTap();
    state.kitchenClosedToday = isClosed;

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

    if (isClosed) {
        showToast("🔴 Kitchen closed for today! Customers cannot place new orders for today.", "info");
    } else {
        showToast("🟢 Kitchen is open! Customers can now order for today.", "success");
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
        showToast("🍛 Switched ordering date to Today", "info");
    } else {
        state.customerOrderingDate = 'future';
        state.customerSelectedFutureDate = val;
        
        // Format nice date
        const niceDate = new Date(val).toLocaleDateString('en-IN', {weekday: 'short', month: 'short', day: 'numeric'});
        if (dateLabel) dateLabel.textContent = `Future: ${niceDate}`;
        showToast(`📅 Booking for future date: ${niceDate}`, "success");
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
        const statusLabel = isClosed ? 'Closed' : 'Open';
        
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

function runBulkAction(actionType) {
    trackTap();
    const checkboxes = document.querySelectorAll('#admin-orders-list .order-bulk-checkbox:checked');
    if (checkboxes.length === 0) {
        showToast("⚠️ Please select at least one order.", "info");
        return;
    }
    
    let count = 0;
    checkboxes.forEach(cb => {
        const orderId = cb.getAttribute('data-order-id');
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
            if (actionType === 'accept' && order.status === 'New') {
                order.status = 'Preparing';
                count++;
            } else if (actionType === 'deliver' && order.status === 'Preparing') {
                order.status = 'Delivered';
                count++;
            } else if (actionType === 'reject' && order.status === 'New') {
                const idx = state.orders.findIndex(o => o.id === orderId);
                if (idx !== -1) {
                    state.orders.splice(idx, 1);
                    count++;
                }
            }
        }
    });
    
    if (count > 0) {
        showToast(`✨ Successfully updated ${count} orders!`, "success");
        playNotificationSound();
    } else {
        showToast("⚠️ No matching status changes could be applied to selected orders.", "info");
    }
    
    // Reset Select All
    const selectAllCheck = document.getElementById('bulk-select-all-checkbox');
    if (selectAllCheck) selectAllCheck.checked = false;
    
    // Refresh views
    renderAdminDashboard();
    renderAdminOrders();
    if (state.currentView === 'admin-desk') {
        renderAdminDesktop();
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

function runBulkActionDesk(actionType) {
    trackTap();
    const checkboxes = document.querySelectorAll('#desk-dashboard-orders .order-bulk-checkbox-desk:checked');
    if (checkboxes.length === 0) {
        showToast("⚠️ Please select at least one order.", "info");
        return;
    }
    
    let count = 0;
    checkboxes.forEach(cb => {
        const orderId = cb.getAttribute('data-order-id');
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
            if (actionType === 'accept' && order.status === 'New') {
                order.status = 'Preparing';
                count++;
            } else if (actionType === 'deliver' && order.status === 'Preparing') {
                order.status = 'Delivered';
                count++;
            } else if (actionType === 'reject' && order.status === 'New') {
                const idx = state.orders.findIndex(o => o.id === orderId);
                if (idx !== -1) {
                    state.orders.splice(idx, 1);
                    count++;
                }
            }
        }
    });
    
    if (count > 0) {
        showToast(`✨ Successfully updated ${count} orders!`, "success");
        playNotificationSound();
    } else {
        showToast("⚠️ No matching status changes could be applied to selected orders.", "info");
    }
    
    // Reset Select All
    const selectAllCheck = document.getElementById('bulk-select-all-checkbox-desk');
    if (selectAllCheck) selectAllCheck.checked = false;
    
    // Refresh views
    renderAdminDashboard();
    renderAdminOrders();
    renderAdminDesktop();
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
    
    // Hide app shell, show login screen
    document.getElementById('cust-login-screen').classList.add('active');
    document.getElementById('cust-login-screen').style.display = 'flex';
    document.getElementById('customer-app-shell').classList.remove('active');
    document.getElementById('customer-app-shell').style.display = 'none';
    
    showToast("🚪 Logged out successfully", "info");
}

