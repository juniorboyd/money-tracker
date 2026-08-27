// CATEGORIES WITH ICONS AND COLORS MATCHING THE EXCEL TEMPLATE
const CATEGORIES = {
    expense: [
        { id: 'exp-food', name: 'อาหาร', icon: 'fa-utensils', color: '#f59e0b' },
        { id: 'exp-transport', name: 'ค่าเดินทาง', icon: 'fa-car', color: '#3b82f6' },
        { id: 'exp-rent', name: 'ค่าเช่า', icon: 'fa-house', color: '#8b5cf6' },
        { id: 'exp-utilities', name: 'สาธารณูปโภค', icon: 'fa-file-invoice-dollar', color: '#ef4444' },
        { id: 'exp-entertainment', name: 'บันเทิง', icon: 'fa-gamepad', color: '#ec4899' },
        { id: 'exp-shopping', name: 'ช้อปปิ้ง', icon: 'fa-bag-shopping', color: '#e040fb' },
        { id: 'exp-other', name: 'เบ็ดเตล็ด', icon: 'fa-icons', color: '#64748b' },
        { id: 'exp-delivery', name: 'Grab/Lineman/Shopee', icon: 'fa-truck-fast', color: '#ff5722' },
        { id: 'exp-tuition', name: 'ค่าเทอม', icon: 'fa-graduation-cap', color: '#6366f1' }
    ],
    income: [
        { id: 'inc-salary', name: 'เงินเดือน', icon: 'fa-money-bill-wave', color: '#10b981' },
        { id: 'inc-sales', name: 'ขายสินค้า', icon: 'fa-shop', color: '#f59e0b' },
        { id: 'inc-service', name: 'บริการ', icon: 'fa-handshake', color: '#3b82f6' },
        { id: 'inc-extra', name: 'รายได้เสริม', icon: 'fa-gift', color: '#ec4899' }
    ]
};

// INITIAL APP STATE
let state = {
    transactions: [],
    wallets: [],
    activeTab: 'dashboard',
    theme: 'light',
    activeWalletFilter: 'all',
    slipokKey: '',
    supabaseUrl: '',
    supabaseKey: ''
};

let supabaseClient = null;

// CHART VARIABLES
let dashboardExpenseChart = null;
let analyticsTrendChart = null;
let analyticsCategoryChart = null;

// DEFAULT WALLETS & SAMPLE DATA (FROM EXCEL DATED 22/08 - PRESENT)
const DEFAULT_WALLETS = [
    { id: 'w-cash', name: 'เงินสด', type: 'cash', balance: 0, color: '#10b981' },
    { id: 'w-bank', name: 'บัญชีธนาคาร', type: 'bank', balance: 0, color: '#3b82f6' },
    { id: 'w-saving', name: 'เงินออม', type: 'saving', balance: 0, color: '#8b5cf6' }
];

const SAMPLE_TRANSACTIONS = [
    { id: 't-excel-1', type: 'income', amount: 1500, categoryId: 'inc-extra', walletId: 'w-bank', date: '2026-08-22', time: '12:00', notes: 'รับโอนเข้า-พร้อมเพย์ (NBIDSD) - ค่ากินประจำสัปดาห์' },
    { id: 't-excel-2', type: 'expense', amount: 60, categoryId: 'exp-other', walletId: 'w-bank', date: '2026-08-22', time: '12:30', notes: 'โอนเงินออก-พร้อมเพย์ (MORWSW) - ค่าใช้จ่ายประจำวัน' },
    { id: 't-excel-3', type: 'expense', amount: 79, categoryId: 'exp-delivery', walletId: 'w-bank', date: '2026-08-22', time: '13:00', notes: 'หักบัญชีอัตโนมัติ (CGSWP) - Lineman' },
    { id: 't-excel-4', type: 'expense', amount: 70, categoryId: 'exp-other', walletId: 'w-bank', date: '2026-08-22', time: '13:30', notes: 'จ่ายค่าสินค้า/บริการ (MORPSW) - ค่าใช้จ่ายประจำวัน' },
    { id: 't-excel-5', type: 'expense', amount: 60, categoryId: 'exp-other', walletId: 'w-bank', date: '2026-08-23', time: '10:00', notes: 'โอนเงินออก-พร้อมเพย์ (MORISW) - ค่าใช้จ่ายประจำวัน' },
    { id: 't-excel-6', type: 'expense', amount: 65, categoryId: 'exp-other', walletId: 'w-bank', date: '2026-08-23', time: '11:00', notes: 'จ่ายค่าสินค้า/บริการ (MORPSW) - ค่าใช้จ่ายประจำวัน' },
    { id: 't-excel-7', type: 'expense', amount: 80, categoryId: 'exp-other', walletId: 'w-bank', date: '2026-08-24', time: '09:00', notes: 'จ่ายค่าสินค้า/บริการ (MORPSW) - ค่าใช้จ่ายประจำวัน' },
    { id: 't-excel-8', type: 'expense', amount: 70, categoryId: 'exp-other', walletId: 'w-bank', date: '2026-08-24', time: '10:00', notes: 'โอนเงินออก-พร้อมเพย์ (MORISW) - ค่าใช้จ่ายประจำวัน' },
    { id: 't-excel-9', type: 'expense', amount: 43, categoryId: 'exp-other', walletId: 'w-bank', date: '2026-08-24', time: '11:00', notes: 'จ่ายค่าสินค้า/บริการ (MORPSW) - ค่าใช้จ่ายประจำวัน' },
    { id: 't-excel-10', type: 'expense', amount: 89, categoryId: 'exp-other', walletId: 'w-bank', date: '2026-08-24', time: '12:00', notes: 'จ่ายค่าสินค้า/บริการ (MORPSW) - ค่าใช้จ่ายประจำวัน' },
    { id: 't-excel-11', type: 'expense', amount: 22, categoryId: 'exp-delivery', walletId: 'w-bank', date: '2026-08-24', time: '13:00', notes: 'หักบัญชีอัตโนมัติ (CGSWP) - Grab' },
    { id: 't-excel-12', type: 'expense', amount: 67, categoryId: 'exp-other', walletId: 'w-bank', date: '2026-08-24', time: '14:00', notes: 'โอนเงินออก (NBSWT) - ค่าใช้จ่ายประจำวัน' },
    { id: 't-excel-13', type: 'expense', amount: 78, categoryId: 'exp-delivery', walletId: 'w-bank', date: '2026-08-25', time: '10:00', notes: 'หักบัญชีอัตโนมัติ (CGSWP) - Lineman' },
    { id: 't-excel-14', type: 'expense', amount: 45, categoryId: 'exp-other', walletId: 'w-bank', date: '2026-08-25', time: '11:00', notes: 'จ่ายค่าสินค้า/บริการ (MORPSW) - ค่าใช้จ่ายประจำวัน' }
];

// APP LIFE-CYCLE
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initApp();
});

// LOAD DATA FROM LOCAL STORAGE OR SAMPLE INITIALIZATION
function loadData() {
    // Clear old state to force upgrade to Excel matching datasets (22/08 - Present)
    const isUpgraded = localStorage.getItem('money_lover_excel_upgrade_22_present');
    if (!isUpgraded) {
        localStorage.removeItem('money_lover_state');
        localStorage.setItem('money_lover_excel_upgrade_22_present', 'true');
    }

    const savedState = localStorage.getItem('money_lover_state');
    if (savedState) {
        try {
            state = JSON.parse(savedState);
            state.activeTab = 'dashboard';
            state.activeWalletFilter = 'all';
            setTimeout(() => {
                if (supabaseClient) syncFromSupabase();
            }, 500);
        } catch (e) {
            console.error('Error parsing stored data. Resetting state.', e);
            initDefaultData();
        }
    } else {
        initDefaultData();
    }
}

function initDefaultData() {
    state.wallets = [...DEFAULT_WALLETS];
    state.transactions = [...SAMPLE_TRANSACTIONS];
    state.theme = 'light';
    state.activeTab = 'dashboard';
    state.activeWalletFilter = 'all';
    saveState();
}

function saveState() {
    localStorage.setItem('money_lover_state', JSON.stringify(state));
    if (supabaseClient) {
        pushToSupabase();
    }
}

// INITIALIZE APP UI & LOGIC
function initApp() {
    // Theme setup
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeUI();

    // Populate SlipOK API Key field from state
    const keyField = document.getElementById('slipok-key');
    if (keyField) {
        keyField.value = state.slipokKey || '';
    }

    // Populate Supabase Settings
    const urlField = document.getElementById('supabase-url');
    if (urlField) urlField.value = state.supabaseUrl || '';
    const keyDbField = document.getElementById('supabase-key');
    if (keyDbField) keyDbField.value = state.supabaseKey || '';

    // Init Supabase client and sync
    initSupabase();


    // Tab switching setup
    setupTabs();

    // Setup Wallet Filter in Header
    populateWalletDropdowns();
    document.getElementById('header-wallet-select').value = state.activeWalletFilter;
    
    // Filter by wallet change
    document.getElementById('header-wallet-select').addEventListener('change', (e) => {
        state.activeWalletFilter = e.target.value;
        renderAll();
        showToast('เปลี่ยนการกรองกระเป๋าเงินแล้ว', 'info');
    });

    // Populate transaction categories in modals based on type selector change
    setupTransactionModalTypeToggle();

    // Setup Event Listeners
    setupEventListeners();

    // Render App
    renderAll();
}

// RENDER ALL SCREENS & UPDATE CHARTS
function renderAll() {
    // Re-calculate wallet virtual balances
    updateBalances();
    
    // Update Header and Summary Cards
    renderDashboardSummary();
    
    // Render tabs based on current state
    renderActiveTab();
}

function updateBalances() {
    // We compute the current balance of each wallet dynamically:
    // Initial Balance + (Incomes for that wallet) - (Expenses for that wallet)
    state.wallets.forEach(wallet => {
        let currentBalance = parseFloat(wallet.balance) || 0;
        state.transactions.forEach(t => {
            if (t.walletId === wallet.id) {
                const amt = parseFloat(t.amount) || 0;
                if (t.type === 'income') {
                    currentBalance += amt;
                } else if (t.type === 'expense') {
                    currentBalance -= amt;
                }
            }
        });
        wallet.currentBalance = currentBalance;
    });
}

// TAB MANAGEMENT
function setupTabs() {
    const menuButtons = document.querySelectorAll('.menu-item');
    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Quick Add Dashboard triggers
    document.getElementById('view-all-transactions').addEventListener('click', () => {
        switchTab('transactions');
    });
}

function switchTab(tabName) {
    state.activeTab = tabName;
    
    // Update active sidebar link
    document.querySelectorAll('.menu-item').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Show selected panel
    document.querySelectorAll('.tab-panel').forEach(panel => {
        if (panel.id === `panel-${tabName}`) {
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });

    // Update Header title
    const titles = {
        dashboard: 'แดชบอร์ด',
        transactions: 'รายการบัญชี',
        analytics: 'รายงาน & กราฟ',
        wallets: 'กระเป๋าเงิน'
    };
    document.getElementById('page-title').textContent = titles[tabName] || 'Money Lover';

    // Refresh layout rendering for specific tab
    renderActiveTab();
    
    // Close mobile menu if open
    document.querySelector('.sidebar').classList.remove('mobile-open');
}

function renderActiveTab() {
    if (state.activeTab === 'dashboard') {
        renderDashboard();
    } else if (state.activeTab === 'transactions') {
        renderTransactionsTab();
    } else if (state.activeTab === 'analytics') {
        renderAnalyticsTab();
    } else if (state.activeTab === 'wallets') {
        renderWalletsTab();
    }
}

// DASHBOARD RENDERING
function renderDashboardSummary() {
    let balanceTotal = 0;
    let incomeMonth = 0;
    let expenseMonth = 0;

    const currentYearMonth = new Date().toISOString().substring(0, 7); // 'YYYY-MM'

    // Balance calculations
    if (state.activeWalletFilter === 'all') {
        state.wallets.forEach(w => balanceTotal += w.currentBalance);
    } else {
        const found = state.wallets.find(w => w.id === state.activeWalletFilter);
        if (found) balanceTotal = found.currentBalance;
    }

    // Filtered transaction list for calculations
    const filteredTrans = getFilteredTransactions();

    filteredTrans.forEach(t => {
        if (t.date.substring(0, 7) === currentYearMonth) {
            const amt = parseFloat(t.amount) || 0;
            if (t.type === 'income') {
                incomeMonth += amt;
            } else if (t.type === 'expense') {
                expenseMonth += amt;
            }
        }
    });

    document.getElementById('total-balance').textContent = formatCurrency(balanceTotal);
    document.getElementById('monthly-income').textContent = formatCurrency(incomeMonth);
    document.getElementById('monthly-expense').textContent = formatCurrency(expenseMonth);
}

function renderDashboard() {
    const listContainer = document.getElementById('recent-transaction-list');
    listContainer.innerHTML = '';

    const filteredTrans = getFilteredTransactions();
    // Sort transactions by date descending, then time descending
    const sorted = [...filteredTrans].sort((a, b) => {
        const dateA = a.date + ' ' + (a.time || '00:00');
        const dateB = b.date + ' ' + (b.time || '00:00');
        return dateB.localeCompare(dateA);
    });

    // Slice first 5 recent
    const recents = sorted.slice(0, 5);

    if (recents.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-receipt"></i>
                <p>ยังไม่มีรายการบันทึกสำหรับตัวกรองนี้</p>
            </div>
        `;
    } else {
        recents.forEach(t => {
            const category = getCategoryById(t.categoryId, t.type);
            const wallet = state.wallets.find(w => w.id === t.walletId);
            
            const div = document.createElement('div');
            div.className = 'transaction-item';
            div.addEventListener('click', () => openEditTransactionModal(t.id));
            
            div.innerHTML = `
                <div class="trans-item-left">
                    <div class="trans-item-icon" style="background-color: ${category.color}15; color: ${category.color}">
                        <i class="fa-solid ${category.icon}"></i>
                    </div>
                    <div class="trans-item-details">
                        <span class="trans-item-category">${category.name}</span>
                        <span class="trans-item-notes">${t.notes || ''}</span>
                        <span class="trans-item-meta">${formatThaiDate(t.date)} • ${t.time || ''} • ${wallet ? wallet.name : ''}</span>
                    </div>
                </div>
                <div class="trans-item-right">
                    <span class="trans-item-amount ${t.type === 'income' ? 'text-success' : 'text-danger'}">
                        ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                    </span>
                    <div class="trans-item-actions">
                        <button class="action-btn edit-btn" onclick="event.stopPropagation(); openEditTransactionModal('${t.id}')"><i class="fa-solid fa-pen"></i></button>
                        <button class="action-btn delete-btn" onclick="event.stopPropagation(); deleteTransaction('${t.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            `;
            listContainer.appendChild(div);
        });
    }

    // Mini Chart Rendering
    renderDashboardExpenseChart(filteredTrans);
}

// RENDER TRANSACTIONS TAB AS EDITABLE TABLE
function renderTransactionsTab() {
    const searchVal = document.getElementById('filter-search').value.toLowerCase();
    const typeFilter = document.getElementById('filter-type').value;
    const categoryFilter = document.getElementById('filter-category').value;
    const monthFilter = document.getElementById('filter-month').value;

    let filtered = getFilteredTransactions();

    // Apply specific local page filters
    if (searchVal) {
        filtered = filtered.filter(t => (t.notes || '').toLowerCase().includes(searchVal));
    }
    if (typeFilter !== 'all') {
        filtered = filtered.filter(t => t.type === typeFilter);
    }
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(t => t.categoryId === categoryFilter);
    }
    if (monthFilter) {
        filtered = filtered.filter(t => t.date.startsWith(monthFilter));
    }

    // Count and update Badge
    document.getElementById('transaction-count').textContent = `${filtered.length} รายการ`;

    const tableBody = document.getElementById('full-transaction-table-body');
    tableBody.innerHTML = '';

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state" style="text-align: center; padding: 40px 0;">
                    <i class="fa-solid fa-receipt" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;"></i>
                    <p>ไม่พบรายการตามตัวกรองที่ระบุ</p>
                </td>
            </tr>
        `;
        return;
    }

    // Sort by date desc, then time desc
    filtered.sort((a, b) => {
        const dateA = a.date + ' ' + (a.time || '00:00');
        const dateB = b.date + ' ' + (b.time || '00:00');
        return dateB.localeCompare(dateA);
    });

    filtered.forEach(t => {
        const tr = document.createElement('tr');
        tr.setAttribute('data-id', t.id);
        
        // Generate options for category based on current type
        const catOptions = CATEGORIES[t.type].map(c => 
            `<option value="${c.id}" ${c.id === t.categoryId ? 'selected' : ''}>${c.name}</option>`
        ).join('');

        // Generate options for wallets
        const walletOptions = state.wallets.map(w => 
            `<option value="${w.id}" ${w.id === t.walletId ? 'selected' : ''}>${w.name}</option>`
        ).join('');

        tr.innerHTML = `
            <td>
                <input type="date" value="${t.date}" class="table-date-input" data-id="${t.id}">
            </td>
            <td>
                <select class="type-select-cell ${t.type}" data-id="${t.id}">
                    <option value="expense" ${t.type === 'expense' ? 'selected' : ''}>รายจ่าย</option>
                    <option value="income" ${t.type === 'income' ? 'selected' : ''}>รายรับ</option>
                </select>
            </td>
            <td>
                <select class="cat-select-cell" data-id="${t.id}">
                    ${catOptions}
                </select>
            </td>
            <td>
                <input type="number" step="0.01" value="${t.amount}" class="amount-input-cell ${t.type}" data-id="${t.id}">
            </td>
            <td>
                <select class="wallet-select-cell" data-id="${t.id}">
                    ${walletOptions}
                </select>
            </td>
            <td>
                <input type="text" value="${t.notes || ''}" class="notes-input-cell" data-id="${t.id}" placeholder="ไม่มีบันทึก">
            </td>
            <td style="text-align: center;">
                <button class="action-btn delete-btn" title="ลบ" data-id="${t.id}">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(tr);
    });
}

// ANALYTICS SCREEN RENDERING
function renderAnalyticsTab() {
    const filteredTrans = getFilteredTransactions();

    // Populate month options for Category Analytics
    populateAnalyticsMonthSelect(filteredTrans);
    
    // Trend Chart (Income vs Expense)
    renderTrendAnalytics(filteredTrans);

    // Category Breakdown Chart
    renderCategoryAnalytics(filteredTrans);
}

function populateAnalyticsMonthSelect(transactions) {
    const select = document.getElementById('analytics-category-month');
    const previousVal = select.value;
    select.innerHTML = '';

    // Find all unique year-months from transactions
    const months = [...new Set(transactions.map(t => t.date.substring(0, 7)))].sort().reverse();

    if (months.length === 0) {
        const option = document.createElement('option');
        option.value = new Date().toISOString().substring(0, 7);
        option.textContent = formatThaiMonthYear(option.value);
        select.appendChild(option);
        return;
    }

    months.forEach(m => {
        const option = document.createElement('option');
        option.value = m;
        option.textContent = formatThaiMonthYear(m);
        select.appendChild(option);
    });

    if (months.includes(previousVal)) {
        select.value = previousVal;
    } else {
        select.value = months[0];
    }
}

function renderTrendAnalytics(transactions) {
    const selectedYear = document.getElementById('analytics-trend-year').value;
    
    // Prepare 12 months array
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpense = Array(12).fill(0);

    transactions.forEach(t => {
        const dateObj = new Date(t.date);
        const year = dateObj.getFullYear().toString();
        const monthIdx = dateObj.getMonth();

        if (year === selectedYear) {
            const amt = parseFloat(t.amount) || 0;
            if (t.type === 'income') {
                monthlyIncome[monthIdx] += amt;
            } else if (t.type === 'expense') {
                monthlyExpense[monthIdx] += amt;
            }
        }
    });

    const ctx = document.getElementById('analytics-trend-chart').getContext('2d');
    
    if (analyticsTrendChart) {
        analyticsTrendChart.destroy();
    }

    const monthsLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    analyticsTrendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthsLabels,
            datasets: [
                {
                    label: 'รายรับ',
                    data: monthlyIncome,
                    backgroundColor: '#10b981',
                    borderRadius: 6
                },
                {
                    label: 'รายจ่าย',
                    data: monthlyExpense,
                    backgroundColor: '#f43f5e',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: getCSSColorVar('--text-primary'), font: { family: 'Prompt' } }
                }
            },
            scales: {
                x: { ticks: { color: getCSSColorVar('--text-secondary'), font: { family: 'Prompt' } }, grid: { display: false } },
                y: { ticks: { color: getCSSColorVar('--text-secondary'), font: { family: 'Prompt' } }, grid: { color: getCSSColorVar('--border-color') } }
            }
        }
    });
}

function renderCategoryAnalytics(transactions) {
    const selectedMonth = document.getElementById('analytics-category-month').value;
    const expenseList = transactions.filter(t => t.type === 'expense' && t.date.substring(0, 7) === selectedMonth);

    // Accumulate by Category
    const categoryTotals = {};
    let totalMonthExpense = 0;

    expenseList.forEach(t => {
        const amt = parseFloat(t.amount) || 0;
        categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + amt;
        totalMonthExpense += amt;
    });

    const breakdownListContainer = document.getElementById('category-breakdown-list');
    breakdownListContainer.innerHTML = '';

    const chartLabels = [];
    const chartData = [];
    const chartColors = [];

    // Sort categories by amount descending
    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    if (sortedCategories.length === 0) {
        breakdownListContainer.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-chart-line"></i>
                <p>ไม่มีรายจ่ายสำหรับเดือนนี้</p>
            </div>
        `;
        
        if (analyticsCategoryChart) {
            analyticsCategoryChart.destroy();
            analyticsCategoryChart = null;
        }
        return;
    }

    sortedCategories.forEach(([catId, total]) => {
        const catObj = getCategoryById(catId, 'expense');
        const percentage = totalMonthExpense > 0 ? ((total / totalMonthExpense) * 100).toFixed(1) : 0;

        chartLabels.push(catObj.name);
        chartData.push(total);
        chartColors.push(catObj.color);

        // Append item to list
        const itemDiv = document.createElement('div');
        itemDiv.className = 'category-breakdown-item';
        itemDiv.innerHTML = `
            <div class="breakdown-info">
                <div class="breakdown-label-group">
                    <span class="legend-color-dot" style="background-color: ${catObj.color}"></span>
                    <span>${catObj.name}</span>
                </div>
                <div class="breakdown-value-group">
                    <span>${formatCurrency(total)}</span>
                    <span class="breakdown-percentage">${percentage}%</span>
                </div>
            </div>
            <div class="breakdown-bar-wrapper">
                <div class="breakdown-bar" style="width: ${percentage}%; background-color: ${catObj.color}"></div>
            </div>
        `;
        breakdownListContainer.appendChild(itemDiv);
    });

    // Render Doughnut Chart
    const ctx = document.getElementById('analytics-category-chart').getContext('2d');
    if (analyticsCategoryChart) {
        analyticsCategoryChart.destroy();
    }

    analyticsCategoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartData,
                backgroundColor: chartColors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Display custom HTML breakdown list instead
                }
            },
            cutout: '65%'
        }
    });
}

// WALLETS MANAGEMENT SCREEN
function renderWalletsTab() {
    const grid = document.getElementById('wallets-grid-container');
    grid.innerHTML = '';

    state.wallets.forEach(w => {
        const card = document.createElement('div');
        card.className = 'wallet-card';
        card.style.background = `linear-gradient(135deg, ${w.color}, ${adjustColorBrightness(w.color, -20)})`;
        card.addEventListener('click', () => {
            // Apply filtering on dashboard/transactions for this wallet
            state.activeWalletFilter = w.id;
            document.getElementById('header-wallet-select').value = w.id;
            switchTab('dashboard');
            showToast(`กรองข้อมูลตามกระเป๋า ${w.name}`, 'success');
        });

        // Icon based on type
        const icons = {
            cash: 'fa-money-bill-1',
            bank: 'fa-building-columns',
            credit: 'fa-credit-card',
            saving: 'fa-piggy-bank'
        };
        const iconClass = icons[w.type] || 'fa-wallet';

        card.innerHTML = `
            <div class="wallet-card-header">
                <div class="wallet-name-label">
                    <h3>${w.name}</h3>
                    <span class="wallet-type-tag">${getWalletTypeName(w.type)}</span>
                </div>
                <div class="wallet-card-icon"><i class="fa-solid ${iconClass}"></i></div>
            </div>
            <div class="wallet-card-balance">
                <span>ยอดปัจจุบัน</span>
                <h2>${formatCurrency(w.currentBalance)}</h2>
            </div>
            <div class="wallet-card-actions">
                <button class="wallet-action-btn edit-btn" title="แก้ไข" onclick="event.stopPropagation(); openEditWalletModal('${w.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="wallet-action-btn delete-btn" title="ลบ" onclick="event.stopPropagation(); deleteWallet('${w.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// TRANSACTION MODAL OPERATIONS
function openAddTransactionModal() {
    document.getElementById('transaction-form').reset();
    document.getElementById('trans-id').value = '';
    document.getElementById('transaction-modal-title').textContent = 'บันทึกรายการใหม่';
    
    // Set default values
    const now = new Date();
    document.getElementById('trans-date').value = now.toISOString().substring(0, 10);
    document.getElementById('trans-time').value = now.toTimeString().substring(0, 5);
    
    // Tab initial check
    setTransactionTypeModal('expense');
    
    populateWalletOptionsInModal();
    openModal('transaction-modal');
}

function openEditTransactionModal(id) {
    const t = state.transactions.find(item => item.id === id);
    if (!t) return;

    document.getElementById('trans-id').value = t.id;
    document.getElementById('transaction-modal-title').textContent = 'แก้ไขรายการบันทึก';
    
    setTransactionTypeModal(t.type);
    
    document.getElementById('trans-amount').value = t.amount;
    document.getElementById('trans-date').value = t.date;
    document.getElementById('trans-time').value = t.time || '';
    document.getElementById('trans-notes').value = t.notes || '';
    
    populateWalletOptionsInModal();
    document.getElementById('trans-wallet').value = t.walletId;
    
    // Re-populate categories to match the correct income/expense type, and set selection
    populateCategoryOptionsInModal(t.type);
    document.getElementById('trans-category').value = t.categoryId;

    openModal('transaction-modal');
}

function setTransactionTypeModal(type) {
    const expenseTab = document.querySelector('.type-tab.expense');
    const incomeTab = document.querySelector('.type-tab.income');
    
    if (type === 'expense') {
        expenseTab.classList.add('active');
        expenseTab.querySelector('input').checked = true;
        incomeTab.classList.remove('active');
    } else {
        incomeTab.classList.add('active');
        incomeTab.querySelector('input').checked = true;
        expenseTab.classList.remove('active');
    }
    
    populateCategoryOptionsInModal(type);
}

function setupTransactionModalTypeToggle() {
    const tabs = document.querySelectorAll('.transaction-type-tabs .type-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Radio is hidden but we can set click triggers
            const radio = tab.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                setTransactionTypeModal(radio.value);
            }
        });
    });
}

function populateWalletOptionsInModal() {
    const select = document.getElementById('trans-wallet');
    select.innerHTML = '';
    state.wallets.forEach(w => {
        const option = document.createElement('option');
        option.value = w.id;
        option.textContent = `${w.name} (คงเหลือ ${formatCurrency(w.currentBalance)})`;
        select.appendChild(option);
    });
}

function populateCategoryOptionsInModal(type) {
    const select = document.getElementById('trans-category');
    select.innerHTML = '';
    CATEGORIES[type].forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        select.appendChild(option);
    });
}

function handleTransactionFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('trans-id').value;
    const type = document.querySelector('input[name="trans-type"]:checked').value;
    const amount = parseFloat(document.getElementById('trans-amount').value);
    const walletId = document.getElementById('trans-wallet').value;
    const categoryId = document.getElementById('trans-category').value;
    const date = document.getElementById('trans-date').value;
    const time = document.getElementById('trans-time').value;
    const notes = document.getElementById('trans-notes').value;

    if (!amount || amount <= 0) {
        showToast('กรุณาระบุจำนวนเงินที่ถูกต้อง', 'warning');
        return;
    }

    if (id) {
        // Edit Mode
        const idx = state.transactions.findIndex(t => t.id === id);
        if (idx !== -1) {
            state.transactions[idx] = { ...state.transactions[idx], type, amount, walletId, categoryId, date, time, notes };
            showToast('แก้ไขรายการเรียบร้อยแล้ว', 'success');
        }
    } else {
        // Add Mode
        const newTrans = {
            id: 't-' + Date.now(),
            type,
            amount,
            walletId,
            categoryId,
            date,
            time,
            notes
        };
        state.transactions.push(newTrans);
        showToast('เพิ่มรายการบันทึกแล้ว', 'success');
    }

    saveState();
    closeModal('transaction-modal');
    renderAll();
}

async function deleteTransaction(id) {
    if (confirm('คุณต้องการลบรายการบันทึกนี้ใช่หรือไม่?')) {
        state.transactions = state.transactions.filter(t => t.id !== id);
        saveState();
        if (supabaseClient) {
            try {
                await supabaseClient.from('transactions').delete().eq('id', id);
            } catch (err) {
                console.error("Failed to delete transaction on Supabase:", err);
            }
        }
        renderAll();
        showToast('ลบรายการบันทึกแล้ว', 'success');
    }
}

// WALLET MODAL OPERATIONS
function openAddWalletModal() {
    document.getElementById('wallet-form').reset();
    document.getElementById('wallet-id').value = '';
    document.getElementById('wallet-modal-title').textContent = 'เพิ่มกระเป๋าเงินใหม่';
    document.getElementById('wallet-balance').disabled = false; // Initial balance only editable on add
    
    // Tick first color
    const defaultColorInput = document.querySelector('.color-option input[value="#10b981"]');
    if (defaultColorInput) defaultColorInput.checked = true;

    openModal('wallet-modal');
}

function openEditWalletModal(id) {
    const w = state.wallets.find(item => item.id === id);
    if (!w) return;

    document.getElementById('wallet-id').value = w.id;
    document.getElementById('wallet-modal-title').textContent = 'แก้ไขกระเป๋าเงิน';
    document.getElementById('wallet-name').value = w.name;
    document.getElementById('wallet-type').value = w.type;
    document.getElementById('wallet-balance').value = w.balance;
    document.getElementById('wallet-balance').disabled = true; // Avoid confusing calculations

    // Tick color
    const colorInput = document.querySelector(`.color-option input[value="${w.color}"]`);
    if (colorInput) colorInput.checked = true;

    openModal('wallet-modal');
}

function handleWalletFormSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('wallet-id').value;
    const name = document.getElementById('wallet-name').value;
    const type = document.getElementById('wallet-type').value;
    const balance = parseFloat(document.getElementById('wallet-balance').value) || 0;
    const color = document.querySelector('input[name="wallet-color"]:checked').value;

    if (id) {
        // Edit Mode
        const idx = state.wallets.findIndex(w => w.id === id);
        if (idx !== -1) {
            state.wallets[idx].name = name;
            state.wallets[idx].type = type;
            state.wallets[idx].color = color;
            showToast('อัปเดตข้อมูลกระเป๋าเงินแล้ว', 'success');
        }
    } else {
        // Add Mode
        const newWallet = {
            id: 'w-' + Date.now(),
            name,
            type,
            balance,
            color
        };
        state.wallets.push(newWallet);
        showToast('เพิ่มกระเป๋าเงินใหม่สำเร็จ', 'success');
    }

    saveState();
    closeModal('wallet-modal');
    populateWalletDropdowns();
    renderAll();
}

function deleteWallet(id) {
    // Check if wallet is used by transactions
    const counts = state.transactions.filter(t => t.walletId === id).length;
    if (counts > 0) {
        if (!confirm(`กระเป๋านี้มีข้อมูลธุรกรรมอยู่ ${counts} รายการ หากคุณยืนยันการลบ ธุรกรรมเหล่านั้นจะยังคงอยู่แต่จะไม่มีกระเป๋าเงินอ้างอิง คุณแน่ใจหรือไม่?`)) {
            return;
        }
    } else {
        if (!confirm('คุณยืนยันที่จะลบกระเป๋าเงินนี้ใช่หรือไม่?')) return;
    }

    state.wallets = state.wallets.filter(w => w.id !== id);
    if (state.activeWalletFilter === id) {
        state.activeWalletFilter = 'all';
        document.getElementById('header-wallet-select').value = 'all';
    }
    
    saveState();
    if (supabaseClient) {
        try {
            await supabaseClient.from('wallets').delete().eq('id', id);
        } catch(err) {
            console.error("Failed to delete wallet on Supabase:", err);
        }
    }
    populateWalletDropdowns();
    renderAll();
    showToast('ลบกระเป๋าเงินแล้ว', 'success');
}

// SETUP DOM EVENT LISTENERS
function setupEventListeners() {
    // Quick Add Button
    document.getElementById('quick-add-btn').addEventListener('click', openAddTransactionModal);

    // Modal forms submission
    document.getElementById('transaction-form').addEventListener('submit', handleTransactionFormSubmit);
    document.getElementById('wallet-form').addEventListener('submit', handleWalletFormSubmit);

    // Add Wallet Click
    document.getElementById('add-wallet-btn').addEventListener('click', openAddWalletModal);

    // Clear filters toolbar on transactions page
    document.getElementById('clear-filters').addEventListener('click', () => {
        document.getElementById('filter-search').value = '';
        document.getElementById('filter-type').value = 'all';
        document.getElementById('filter-category').value = 'all';
        document.getElementById('filter-month').value = '';
        renderTransactionsTab();
        showToast('ล้างฟิลเตอร์กรองข้อมูลแล้ว', 'info');
    });

    // Subscribing page filters
    ['filter-search', 'filter-type', 'filter-category', 'filter-month'].forEach(id => {
        document.getElementById(id).addEventListener('input', renderTransactionsTab);
        document.getElementById(id).addEventListener('change', renderTransactionsTab);
    });

    // Populate dynamic categories to filter-category dropdown
    populateFilterCategoryDropdown();

    // Re-render trend analytic on year selector change
    document.getElementById('analytics-trend-year').addEventListener('change', () => {
        const filtered = getFilteredTransactions();
        renderTrendAnalytics(filtered);
    });

    // Re-render category analytic on month select change
    document.getElementById('analytics-category-month').addEventListener('change', () => {
        const filtered = getFilteredTransactions();
        renderCategoryAnalytics(filtered);
    });

    // Close Modal actions
    document.querySelectorAll('.close-modal-btn, .cancel-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            closeModal(modalId);
        });
    });

    // Theme toggler
    document.getElementById('theme-toggle').addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', state.theme);
        saveState();
        updateThemeUI();
        renderAll();
        showToast(`สลับใช้งานโหมด ${state.theme === 'light' ? 'สว่าง' : 'มืด'}`, 'info');
    });

    // Mobile menu toggle
    document.querySelector('.mobile-menu-toggle').addEventListener('click', () => {
        document.querySelector('.sidebar').classList.add('mobile-open');
    });

    // Mobile menu close button
    const closeSidebarBtn = document.querySelector('.mobile-sidebar-close');
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.remove('mobile-open');
        });
    }


    // Backup & Restore Buttons
    document.getElementById('backup-btn').addEventListener('click', backupData);
    document.getElementById('restore-btn').addEventListener('click', () => {
        document.getElementById('restore-input').click();
    });
    document.getElementById('restore-input').addEventListener('change', restoreData);

    // Dynamic table inline editing event listeners
    const tableBody = document.getElementById('full-transaction-table-body');
    if (tableBody) {
        tableBody.addEventListener('change', handleTableChange);
        tableBody.addEventListener('click', handleTableClick);
    }

    // SlipOK API Key update
    const keyField = document.getElementById('slipok-key');
    if (keyField) {
        keyField.addEventListener('change', (e) => {
            state.slipokKey = e.target.value;
            saveState();
            showToast('บันทึก API Key สำเร็จ', 'success');
        });
    }

    // Slip upload event triggers
    const slipBtn = document.getElementById('header-upload-slip-btn');
    const slipInput = document.getElementById('slip-file-input');
    if (slipBtn && slipInput) {
        slipBtn.addEventListener('click', () => {
            slipInput.click();
        });
        slipInput.addEventListener('change', handleSlipUpload);
    }


}

// INLINE TABLE EDITING HANDLERS
function handleTableChange(e) {
    const target = e.target;
    const transId = target.getAttribute('data-id');
    if (!transId) return;

    const t = state.transactions.find(item => item.id === transId);
    if (!t) return;

    let changed = false;

    if (target.classList.contains('table-date-input')) {
        t.date = target.value;
        changed = true;
    } else if (target.classList.contains('type-select-cell')) {
        t.type = target.value;
        // Reset category to the first option of the new type
        t.categoryId = CATEGORIES[t.type][0].id;
        changed = true;
    } else if (target.classList.contains('cat-select-cell')) {
        t.categoryId = target.value;
        changed = true;
    } else if (target.classList.contains('amount-input-cell')) {
        t.amount = parseFloat(target.value) || 0;
        changed = true;
    } else if (target.classList.contains('wallet-select-cell')) {
        t.walletId = target.value;
        changed = true;
    } else if (target.classList.contains('notes-input-cell')) {
        t.notes = target.value;
        changed = true;
    }

    if (changed) {
        saveState();
        updateBalances();
        renderDashboardSummary();
        
        // If type changed or category changed, re-draw the row to keep select lists & classes consistent
        if (target.classList.contains('type-select-cell') || target.classList.contains('cat-select-cell')) {
            renderTransactionsTab();
        }
        
        showToast('บันทึกการเปลี่ยนแปลงแล้ว', 'success');
    }
}

function handleTableClick(e) {
    const btn = e.target.closest('.delete-btn');
    if (btn) {
        const transId = btn.getAttribute('data-id');
        if (transId) {
            deleteTransaction(transId);
        }
    }
}


// SLIP UPLOAD AND OCR TEXT DECODING LOGIC
function handleSlipUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    showToast('กำลังวิเคราะห์สลิปด้วย AI (OCR)... กรุณารอสักครู่', 'info');

    const reader = new FileReader();
    reader.onload = function(event) {
        const imageSrc = event.target.result;
        
        // Run Tesseract.js OCR
        Tesseract.recognize(
            imageSrc,
            'tha+eng',
            { 
                logger: m => console.log(m)
            }
        ).then(({ data: { text } }) => {
            console.log("OCR Result Text:\n", text);
            processSlipOCRText(text);
        }).catch(err => {
            console.error("OCR Error:", err);
            showToast('การอ่านข้อความล้มเหลว กรุณาลองใช้อีกครั้งหรือใช้รูปภาพที่ชัดขึ้น', 'danger');
        }).finally(() => {
            document.getElementById('slip-file-input').value = '';
        });
    };
    reader.readAsDataURL(file);
}

// PROCESS TEXT AND EXTRACT TRANSACTION DETAILS
function processSlipOCRText(text) {
    const todayStr = new Date().toISOString().substring(0, 10);
    const todayTimeStr = new Date().toTimeString().substring(0, 5);

    // Normalize whitespace
    const cleanText = text.replace(/\s+/g, ' ');

    // Detect Bank Name
    let bankName = 'ธนาคารทั่วไป';
    if (cleanText.includes('กรุงไทย') || cleanText.toLowerCase().includes('krungthai')) {
        bankName = 'ธนาคารกรุงไทย';
    } else if (cleanText.includes('กสิกร') || cleanText.toLowerCase().includes('kasikorn')) {
        bankName = 'ธนาคารกสิกรไทย';
    } else if (cleanText.includes('ไทยพาณิชย์') || cleanText.toLowerCase().includes('scb')) {
        bankName = 'ธนาคารไทยพาณิชย์';
    } else if (cleanText.includes('ทหารไทยธนชาต') || cleanText.toLowerCase().includes('ttb')) {
        bankName = 'ธนาคารทหารไทยธนชาต';
    } else if (cleanText.includes('กรุงเทพ') || cleanText.toLowerCase().includes('bangkok bank')) {
        bankName = 'ธนาคารกรุงเทพ';
    } else if (cleanText.includes('กรุงศรี') || cleanText.toLowerCase().includes('krungsri')) {
        bankName = 'ธนาคารกรุงศรีอยุธยา';
    } else if (cleanText.includes('ออมสิน') || cleanText.toLowerCase().includes('gsb')) {
        bankName = 'ธนาคารออมสิน';
    }

    // Parse Amount from Text
    let amount = null;

    const patterns = [
        /จำนวนเงิน\s*([0-9,]+\.[0-9]{2})\s*บาท/i,
        /จำนวนเงิน\s*([0-9,]+\.[0-9]{2})/i,
        /ยอดเงิน\s*([0-9,]+\.[0-9]{2})/i,
        /Amount\s*[:\s]*([0-9,]+\.[0-9]{2})/i,
        /([0-9,]+\.[0-9]{2})\s*บาท/i
    ];

    for (const regex of patterns) {
        const match = cleanText.match(regex);
        if (match) {
            const val = parseFloat(match[1].replace(/,/g, ''));
            if (!isNaN(val) && val > 0) {
                amount = val;
                break;
            }
        }
    }

    // Fallback: If regex failed, get the largest valid non-zero decimal
    if (amount === null) {
        const allDecimals = cleanText.match(/[0-9]+,[0-9]{3}\.[0-9]{2}|[0-9]+\.[0-9]{2}/g);
        if (allDecimals && allDecimals.length > 0) {
            const candidates = allDecimals
                .map(d => parseFloat(d.replace(/,/g, '')))
                .filter(v => !isNaN(v) && v > 0);
            
            if (candidates.length > 0) {
                // Usually the transaction amount is the largest decimal number (ignoring balance if balance is not matched)
                amount = Math.max(...candidates);
            }
        }
    }

    if (amount !== null && amount > 0) {
        const newTrans = {
            id: 't-ocr-' + Date.now(),
            type: 'expense',
            amount: amount,
            walletId: 'w-bank', // bank transfer wallet
            categoryId: 'exp-other', // default other
            date: todayStr,
            time: todayTimeStr,
            notes: 'สแกนยอดเงินอัตโนมัติจากสลิป (' + bankName + ')'
        };

        state.transactions.push(newTrans);
        saveState();
        renderAll();
        showToast('สแกนสลิปสำเร็จ! บันทึกยอดเงิน ' + formatCurrency(amount), 'success');
    } else {
        showToast('ไม่สามารถตรวจจับจำนวนเงินจากสลิปได้อัตโนมัติ กรุณากรอกด้วยตัวเอง', 'warning');
        openAddTransactionModal();
    }
}

// HELPER DROPDOWNS POPULATOR
function populateWalletDropdowns() {
    const select = document.getElementById('header-wallet-select');
    select.innerHTML = '<option value="all">กระเป๋าเงินทั้งหมด</option>';
    
    state.wallets.forEach(w => {
        const option = document.createElement('option');
        option.value = w.id;
        option.textContent = `${w.name} (฿${(w.currentBalance || 0).toLocaleString()})`;
        select.appendChild(option);
    });
}

function populateFilterCategoryDropdown() {
    const select = document.getElementById('filter-category');
    select.innerHTML = '<option value="all">ทุกหมวดหมู่</option>';
    
    const all = [...CATEGORIES.expense, ...CATEGORIES.income];
    all.forEach(c => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = c.name;
        select.appendChild(option);
    });
}

// BACKUP & RESTORE SYSTEMS
function backupData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `money_lover_backup_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('ดาวน์โหลดไฟล์สำรองข้อมูลเรียบร้อย', 'success');
}

function restoreData(e) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const parsed = JSON.parse(event.target.result);
            if (parsed.transactions && parsed.wallets) {
                state.transactions = parsed.transactions;
                state.wallets = parsed.wallets;
                state.theme = parsed.theme || 'light';
                state.activeWalletFilter = 'all';
                saveState();
                
                // Re-initialize theme
                document.documentElement.setAttribute('data-theme', state.theme);
                updateThemeUI();
                
                populateWalletDropdowns();
                renderAll();
                showToast('กู้คืนข้อมูลสำเร็จ!', 'success');
            } else {
                showToast('รูปแบบไฟล์สำรองข้อมูลไม่ถูกต้อง', 'danger');
            }
        } catch (err) {
            showToast('เกิดข้อผิดพลาดในการอ่านไฟล์', 'danger');
        }
    };
    if (e.target.files[0]) {
        fileReader.readAsText(e.target.files[0]);
    }
}

// DASHBOARD EXPENSE DOUGHNUT MINI CHART
function renderDashboardExpenseChart(transactions) {
    const currentYearMonth = new Date().toISOString().substring(0, 7);
    const expenseList = transactions.filter(t => t.type === 'expense' && t.date.substring(0, 7) === currentYearMonth);
    
    const totals = {};
    let totalExpense = 0;
    
    expenseList.forEach(t => {
        const amt = parseFloat(t.amount) || 0;
        totals[t.categoryId] = (totals[t.categoryId] || 0) + amt;
        totalExpense += amt;
    });

    const legendContainer = document.getElementById('dashboard-expense-legend');
    legendContainer.innerHTML = '';

    const labels = [];
    const data = [];
    const colors = [];

    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
        legendContainer.innerHTML = '<div style="font-size: 13px; color: var(--text-muted); text-align: center; width: 100%;">ไม่มีข้อมูลรายจ่ายเดือนนี้</div>';
        if (dashboardExpenseChart) {
            dashboardExpenseChart.destroy();
            dashboardExpenseChart = null;
        }
        return;
    }

    sorted.forEach(([catId, total]) => {
        const catObj = getCategoryById(catId, 'expense');
        const percentage = totalExpense > 0 ? ((total / totalExpense) * 100).toFixed(0) : 0;
        
        labels.push(catObj.name);
        data.push(total);
        colors.push(catObj.color);

        // Generate Custom Legend
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-label-group">
                <span class="legend-color-dot" style="background-color: ${catObj.color}"></span>
                <span>${catObj.name}</span>
            </div>
            <span class="legend-value">${formatCurrency(total)} (${percentage}%)</span>
        `;
        legendContainer.appendChild(item);
    });

    const ctx = document.getElementById('dashboard-expense-chart').getContext('2d');
    
    if (dashboardExpenseChart) {
        dashboardExpenseChart.destroy();
    }

    dashboardExpenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Using custom legend instead
                }
            },
            cutout: '70%'
        }
    });
}

// UTILITY HELPERS
function getFilteredTransactions() {
    if (state.activeWalletFilter === 'all') {
        return state.transactions;
    } else {
        return state.transactions.filter(t => t.walletId === state.activeWalletFilter);
    }
}

function getCategoryById(id, type) {
    const list = CATEGORIES[type] || [];
    return list.find(c => c.id === id) || { name: 'อื่นๆ', icon: 'fa-icons', color: '#64748b' };
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Choose icon based on type
    const icons = {
        success: 'fa-circle-check',
        danger: 'fa-circle-exclamation',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };
    const iconClass = icons[type] || 'fa-circle-info';
    
    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);

    // Fade out and remove after 3s
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateThemeUI() {
    const themeBtn = document.getElementById('theme-toggle');
    const themeText = document.getElementById('theme-text');
    
    if (state.theme === 'dark') {
        themeBtn.querySelector('i').className = 'fa-solid fa-sun';
        themeText.textContent = 'โหมดสว่าง';
    } else {
        themeBtn.querySelector('i').className = 'fa-solid fa-moon';
        themeText.textContent = 'โหมดมืด';
    }
}

function formatCurrency(amount) {
    return '฿' + (parseFloat(amount) || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatThaiDate(dateStr) {
    // dateStr is 'YYYY-MM-DD'
    const d = new Date(dateStr);
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
}

function formatThaiMonthYear(yearMonthStr) {
    // yearMonthStr is 'YYYY-MM'
    const parts = yearMonthStr.split('-');
    const date = new Date(parts[0], parseInt(parts[1]) - 1, 1);
    return date.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' });
}

function getWalletTypeName(type) {
    const mapping = {
        cash: 'เงินสด',
        bank: 'บัญชีธนาคาร',
        credit: 'บัตรเครดิต',
        saving: 'เงินฝากออมทรัพย์'
    };
    return mapping[type] || type;
}

function adjustColorBrightness(hex, percent) {
    let R = parseInt(hex.substring(1, 3), 16);
    let G = parseInt(hex.substring(3, 5), 16);
    let B = parseInt(hex.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    R = (R > 0) ? R : 0;
    G = (G > 0) ? G : 0;
    B = (B > 0) ? B : 0;

    const rHex = R.toString(16).padStart(2, '0');
    const gHex = G.toString(16).padStart(2, '0');
    const bHex = B.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
}

function getCSSColorVar(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}




// SUPABASE CLIENT INITIALIZATION & DATA SYNC
function initSupabase() {
    let url = state.supabaseUrl;
    // Auto-format project ID to full supabase.co URL if only ID is provided
    if (url && !url.startsWith('http') && !url.includes('.')) {
        url = `https://${url.trim()}.supabase.co`;
    }
    if (url && state.supabaseKey) {
        try {
            supabaseClient = supabase.createClient(url, state.supabaseKey);
            console.log("Supabase (PostgreSQL) Client Connected.");
        } catch(e) {
            console.error("Supabase Init Error:", e);
            supabaseClient = null;
        }
    } else {
        supabaseClient = null;
    }
}

async function syncFromSupabase() {
    if (!supabaseClient) return;
    showToast('กำลังซิงค์ข้อมูลกับ PostgreSQL...', 'info');
    try {
        // Fetch wallets
        const { data: dbWallets, error: wErr } = await supabaseClient.from('wallets').select('*');
        if (wErr) throw wErr;
        
        // Fetch transactions
        const { data: dbTrans, error: tErr } = await supabaseClient.from('transactions').select('*');
        if (tErr) throw tErr;

        if (dbWallets && dbWallets.length > 0) {
            state.wallets = dbWallets.map(w => ({
                id: w.id,
                name: w.name,
                type: w.type,
                balance: parseFloat(w.balance) || 0,
                color: w.color,
                currentBalance: parseFloat(w.current_balance) || 0
            }));
        }

        if (dbTrans) {
            state.transactions = dbTrans.map(t => ({
                id: t.id,
                type: t.type,
                amount: parseFloat(t.amount) || 0,
                walletId: t.wallet_id,
                categoryId: t.category_id,
                date: t.date,
                time: t.time || '00:00',
                notes: t.notes || ''
            }));
        }

        localStorage.setItem('money_lover_state', JSON.stringify(state));
        populateWalletDropdowns();
        renderAll();
        showToast('ซิงค์ข้อมูลกับ PostgreSQL สำเร็จ!', 'success');
    } catch(err) {
        console.error("Supabase Pull Error:", err);
        showToast('การเชื่อมต่อกับ PostgreSQL ล้มเหลว จะบันทึกข้อมูลในเครื่องชั่วคราว', 'warning');
    }
}

async function pushToSupabase() {
    if (!supabaseClient) return;
    try {
        const walletsData = state.wallets.map(w => ({
            id: w.id,
            name: w.name,
            type: w.type,
            balance: w.balance,
            color: w.color,
            current_balance: w.currentBalance || w.balance
        }));

        const transData = state.transactions.map(t => ({
            id: t.id,
            type: t.type,
            amount: t.amount,
            wallet_id: t.walletId,
            category_id: t.categoryId,
            date: t.date,
            time: t.time || '00:00',
            notes: t.notes || ''
        }));

        if (walletsData.length > 0) {
            await supabaseClient.from('wallets').upsert(walletsData, { onConflict: 'id' });
        }
        if (transData.length > 0) {
            await supabaseClient.from('transactions').upsert(transData, { onConflict: 'id' });
        }
    } catch(err) {
        console.error("Supabase Push Error:", err);
    }
}
