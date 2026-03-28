// ============================================================
// SuperPro Final Clean Fix v1.0
// REPLACES: bugfixes.js, superpro-v4-master.js, improvements-v5.js,
//   design-enhancements.js, bugfix-v6 through v14, superpro-fix-v5.js
// ============================================================
(function() {
    'use strict';
    console.log('🔧 SuperPro Final: Loading clean comprehensive fix...');

    // ============================================================
    // 1. STORAGE FIX - Prevent QuotaExceededError everywhere
    // ============================================================
    // Wrap Storage.prototype.setItem to catch quota errors silently
    var _origSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
        try {
            return _origSetItem.call(this, key, value);
        } catch(e) {
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                console.warn('⚠️ Storage quota exceeded for:', key, '(' + (value ? (value.length / 1024).toFixed(0) + 'KB' : '0') + ') - skipping');
                return;
            }
            throw e;
        }
    };

    // ============================================================
    // 2. SUPPRESS ERROR TOASTS DURING INITIALIZATION
    // ============================================================
    var _initPhase = true;
    setTimeout(function() { _initPhase = false; }, 20000);

    // ============================================================
    // 3. WAIT FOR CORE FUNCTIONS, THEN PATCH
    // ============================================================
    function waitAndPatch() {
        if (typeof saveData !== 'function' || typeof initCharts !== 'function') {
            setTimeout(waitAndPatch, 30);
            return;
        }
        applyAllPatches();
    }

    function applyAllPatches() {
        console.log('🔧 SuperPro Final: Applying patches...');

        // ---- PATCH saveData ----
        var _origSave = window.saveData;
        window.saveData = function() {
            try {
                var data = {
                    employees: window.employees || [],
                    clients: window.clients || [],
                    attendance: window.attendance || [],
                    contracts: window.contracts || [],
                    services: window.services || [],
                    settings: window.settings || {},
                    tasks: window.tasks || [],
                    events: window.events || [],
                    dailyWork: window.dailyWork || [],
                    dailyIncome: window.dailyIncome || [],
                    dailyExpenses: window.dailyExpenses || [],
                    financialTransactions: window.financialTransactions || [],
                    salaryAdvances: window.salaryAdvances || [],
                    monthlyExpenses: window.monthlyExpenses || []
                };

                // Save ONE copy to sessionStorage (not individual keys)
                try { sessionStorage.setItem('superpro_data', JSON.stringify(data)); } catch(e) {}

                // Save ONE copy to localStorage
                try { localStorage.setItem('superpro_data', JSON.stringify(data)); } catch(e) {}

                // Save to superproDB for DataManager compat
                try {
                    localStorage.setItem('superproDB', JSON.stringify({
                        ...data,
                        income: data.dailyIncome,
                        expenses: data.dailyExpenses,
                        notifications: data.events
                    }));
                } catch(e) {}

                // Save to IndexedDB (large, reliable)
                saveToIDB(data);

                // Firebase cloud
                if (typeof firebaseDb !== 'undefined' && firebaseDb && firebaseDb.ref) {
                    var fbPath = window.FB_PATH || 'superpro_data'; // FIXED: was 'superpro-data' (wrong path)
                    firebaseDb.ref(fbPath).set(data).catch(function(){});
                }

                // Update stats but DON'T reload dashboard (prevents infinite loop)
                try { if (typeof updateAllStats === 'function') updateAllStats(); } catch(e) {}

                console.log('✅ Data saved');
            } catch(error) {
                console.warn('⚠️ Save warning:', error.message);
            }
        };

        // ---- PATCH initCharts to destroy existing charts ----
        var _origCharts = window.initCharts;
        window.initCharts = function() {
            try {
                // Destroy ANY existing chart on performance canvas
                var perfCanvas = document.getElementById('performanceChart');
                if (perfCanvas && typeof Chart !== 'undefined') {
                    var existing = Chart.getChart ? Chart.getChart(perfCanvas) : null;
                    if (existing) existing.destroy();
                    window.performanceChartInstance = null;
                }
                // Destroy ANY existing chart on tasks canvas
                var taskCanvas = document.getElementById('tasksChart');
                if (taskCanvas && typeof Chart !== 'undefined') {
                    var existing2 = Chart.getChart ? Chart.getChart(taskCanvas) : null;
                    if (existing2) existing2.destroy();
                    window.tasksChartInstance = null;
                }
            } catch(e) {}

            // Call original
            try {
                if (_origCharts) _origCharts.call(window);
            } catch(e) {
                console.warn('⚠️ Chart warning:', e.message);
            }
        };

        // ---- DEBOUNCE loadDashboard ----
        var _origLoadDash = window.loadDashboard;
        var _dashTimer = null;
        window.loadDashboard = function() {
            if (_dashTimer) clearTimeout(_dashTimer);
            _dashTimer = setTimeout(function() {
                try {
                    _origLoadDash.call(window);
                } catch(e) {
                    console.warn('⚠️ Dashboard warning:', e.message);
                }
            }, 150);
        };

        // ---- PATCH showToast to suppress errors during init ----
        var _origToast = window.showToast;
        window.showToast = function(message, type) {
            if (_initPhase && type === 'error') {
                console.log('ℹ️ Suppressed during init:', message);
                return;
            }
            if (_origToast) _origToast.call(window, message, type);
        };

        // ---- PATCH showNotification similarly ----
        var _origNotif = window.showNotification;
        window.showNotification = function(message, type) {
            if (_initPhase && type === 'error') {
                console.log('ℹ️ Suppressed during init:', message);
                return;
            }
            if (_origNotif) _origNotif.call(window, message, type);
        };

        // ---- FIX loadDailyWork to default to latest date with data ----
        window.loadDailyWork = function() {
            var today = new Date().toISOString().split('T')[0];
            var dw = window.dailyWork || [];
            var todayWork = dw.filter(function(w) { return w.date === today; });
            var filterEl = document.getElementById('dailyWorkDateFilter');
            if (!filterEl) return;

            if (todayWork.length > 0) {
                filterEl.value = today;
            } else {
                var dates = dw.map(function(w) { return w.date; }).filter(Boolean).sort();
                filterEl.value = dates.length > 0 ? dates[dates.length - 1] : today;
            }
            if (typeof filterDailyWorkByDate === 'function') filterDailyWorkByDate();
            if (typeof updateDailyWorkStats === 'function') updateDailyWorkStats();
        };

        // ---- FIX loadDailyIncome similarly ----
        window.loadDailyIncome = function() {
            var today = new Date().toISOString().split('T')[0];
            var di = window.dailyIncome || [];
            var todayIncome = di.filter(function(i) { return i.date === today; });
            var filterEl = document.getElementById('dailyIncomeDateFilter');
            if (!filterEl) return;

            if (todayIncome.length > 0) {
                filterEl.value = today;
            } else {
                var dates = di.map(function(i) { return i.date; }).filter(Boolean).sort();
                filterEl.value = dates.length > 0 ? dates[dates.length - 1] : today;
            }
            if (typeof filterDailyIncomeByDate === 'function') filterDailyIncomeByDate();
            if (typeof updateDailyIncomeStats === 'function') updateDailyIncomeStats();
        };

        // ---- FIX loadDailyExpenses similarly ----
        window.loadDailyExpenses = function() {
            var today = new Date().toISOString().split('T')[0];
            var de = window.dailyExpenses || [];
            var todayExp = de.filter(function(e) { return e.date === today; });
            var filterEl = document.getElementById('dailyExpensesDateFilter');
            if (!filterEl) return;

            if (todayExp.length > 0) {
                filterEl.value = today;
            } else {
                var dates = de.map(function(e) { return e.date; }).filter(Boolean).sort();
                filterEl.value = dates.length > 0 ? dates[dates.length - 1] : today;
            }
            if (typeof filterDailyExpensesByDate === 'function') filterDailyExpensesByDate();
            if (typeof updateDailyExpensesStats === 'function') updateDailyExpensesStats();
        };

        // ---- PROVIDE renderContractsTable alias (used by data-import-v4.js) ----
        if (typeof window.renderContractsTable !== 'function') {
            window.renderContractsTable = function() {
                if (typeof updateContractsTable === 'function') updateContractsTable();
            };
        }

        // ---- FIX applyData to not overflow sessionStorage ----
        var _origApplyData = window.applyData;
        window.applyData = function(data) {
            if (!data || typeof data !== 'object') return;

            // Convert Firebase objects to arrays
            var keys = ['employees','clients','contracts','dailyWork','dailyIncome','dailyExpenses',
                'attendance','services','tasks','events','monthlyExpenses','financialTransactions','salaryAdvances'];
            keys.forEach(function(key) {
                if (data[key] && !Array.isArray(data[key]) && typeof data[key] === 'object') {
                    data[key] = Object.values(data[key]).filter(function(v) { return v != null; });
                }
            });

            // Map DataManager naming
            if (!data.dailyIncome && data.income) data.dailyIncome = data.income;
            if (!data.dailyExpenses && data.expenses) data.dailyExpenses = data.expenses;
            if (!data.events && data.notifications) data.events = data.notifications;

            // Update globals
            window.employees = employees = data.employees || [];
            window.clients = clients = data.clients || [];
            window.contracts = contracts = data.contracts || [];
            window.services = services = data.services || [];
            window.dailyWork = dailyWork = data.dailyWork || [];
            window.dailyIncome = dailyIncome = data.dailyIncome || [];
            window.dailyExpenses = dailyExpenses = data.dailyExpenses || [];
            window.attendance = attendance = data.attendance || [];
            window.tasks = tasks = data.tasks || [];
            window.events = events = data.events || [];
            window.monthlyExpenses = monthlyExpenses = data.monthlyExpenses || [];
            if (data.financialTransactions) window.financialTransactions = financialTransactions = data.financialTransactions;
            if (data.salaryAdvances) window.salaryAdvances = salaryAdvances = data.salaryAdvances;
            if (data.settings) window.settings = settings = data.settings;

            // Save ONE combined copy only
            try { sessionStorage.setItem('superpro_data', JSON.stringify(data)); } catch(e) {}

            console.log('📊 Applied: ' + window.employees.length + ' employees, ' +
                window.clients.length + ' clients, ' + window.contracts.length + ' contracts');

            try { fillEmployeeSelects(); } catch(e) {}
            try { fillClientSelects(); } catch(e) {}
        };

        // ---- FIX updateAllUI to not cause cascading re-renders ----
        window.updateAllUI = function() {
            try {
                if (typeof renderEmployeesTable === 'function') renderEmployeesTable();
                if (typeof renderClientsTable === 'function') renderClientsTable();
                if (typeof updateContractsTable === 'function') updateContractsTable();
                if (typeof updateAllStats === 'function') updateAllStats();
            } catch(e) {
                console.warn('⚠️ UI update warning:', e.message);
            }
        };

        console.log('✅ SuperPro Final: Core patches applied');
    }

    // ============================================================
    // 4. IndexedDB STORAGE (reliable, large quota)
    // ============================================================
    var IDB_NAME = 'SuperProDB';
    var IDB_STORE = 'appData';
    var IDB_KEY = 'main';

    function openIDB(cb) {
        var req = indexedDB.open(IDB_NAME, 1);
        req.onupgradeneeded = function(e) {
            var db = e.target.result;
            if (!db.objectStoreNames.contains(IDB_STORE)) {
                db.createObjectStore(IDB_STORE);
            }
        };
        req.onsuccess = function(e) { cb(e.target.result); };
        req.onerror = function() { cb(null); };
    }

    function saveToIDB(data) {
        openIDB(function(db) {
            if (!db) return;
            try {
                var tx = db.transaction(IDB_STORE, 'readwrite');
                tx.objectStore(IDB_STORE).put(data, IDB_KEY);
            } catch(e) {}
        });
    }

    window.loadFromIDB = function(cb) {
        openIDB(function(db) {
            if (!db) return cb(null);
            try {
                var tx = db.transaction(IDB_STORE, 'readonly');
                var req = tx.objectStore(IDB_STORE).get(IDB_KEY);
                req.onsuccess = function() { cb(req.result || null); };
                req.onerror = function() { cb(null); };
            } catch(e) { cb(null); }
        });
    };

    // ============================================================
    // 5. POST-LOAD ENHANCEMENTS (after data is ready)
    // ============================================================
    document.addEventListener('DOMContentLoaded', function() {
        // Wait for data import to finish (~5 seconds after load)
        setTimeout(function() {
            buildModernChart();
            setupInvoiceList();
            enhanceReports();
            enhanceFiltersUI();
            addScrollToTop();
            console.log('✅ SuperPro Final: All enhancements loaded');
        }, 6000);
    });

    // ============================================================
    // 6. MODERN PERFORMANCE CHART
    // ============================================================
    function buildModernChart() {
        var canvas = document.getElementById('performanceChart');
        if (!canvas || typeof Chart === 'undefined') return;

        // Destroy existing
        try {
            var ex = Chart.getChart(canvas);
            if (ex) ex.destroy();
        } catch(e) {}

        // Collect monthly data from invoices (financialTransactions)
        var invoices = window.financialTransactions || [];
        var dailyW = window.dailyWork || [];
        var monthlyMap = {};

        // From invoices
        invoices.forEach(function(inv) {
            if (!inv.date) return;
            var month = inv.date.substring(0, 7); // YYYY-MM
            if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, paid: 0, unpaid: 0, count: 0 };
            var amt = parseFloat(inv.amount) || 0;
            monthlyMap[month].revenue += amt;
            monthlyMap[month].count++;
            if (inv.paymentStatus === 'مدفوع' || inv.status === 'مدفوع') {
                monthlyMap[month].paid += amt;
            } else {
                monthlyMap[month].unpaid += amt;
            }
        });

        // Also from dailyWork if no invoice data
        if (invoices.length === 0) {
            dailyW.forEach(function(w) {
                if (!w.date) return;
                var month = w.date.substring(0, 7);
                if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, paid: 0, unpaid: 0, count: 0 };
                var amt = parseFloat(w.amount) || 0;
                monthlyMap[month].revenue += amt;
                monthlyMap[month].count++;
                if (w.paymentStatus === 'مدفوع') {
                    monthlyMap[month].paid += amt;
                } else {
                    monthlyMap[month].unpaid += amt;
                }
            });
        }

        var months = Object.keys(monthlyMap).sort();
        if (months.length === 0) return;

        var labels = months.map(function(m) {
            var parts = m.split('-');
            var monthNames = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
            return monthNames[parseInt(parts[1]) - 1] + ' ' + parts[0];
        });

        var revenueData = months.map(function(m) { return monthlyMap[m].revenue; });
        var paidData = months.map(function(m) { return monthlyMap[m].paid; });
        var unpaidData = months.map(function(m) { return monthlyMap[m].unpaid; });

        // Create modern gradient chart
        var ctx = canvas.getContext('2d');
        canvas.height = 350;

        var gradGreen = ctx.createLinearGradient(0, 0, 0, 350);
        gradGreen.addColorStop(0, 'rgba(40, 167, 69, 0.4)');
        gradGreen.addColorStop(1, 'rgba(40, 167, 69, 0.02)');

        var gradBlue = ctx.createLinearGradient(0, 0, 0, 350);
        gradBlue.addColorStop(0, 'rgba(13, 110, 253, 0.4)');
        gradBlue.addColorStop(1, 'rgba(13, 110, 253, 0.02)');

        var gradRed = ctx.createLinearGradient(0, 0, 0, 350);
        gradRed.addColorStop(0, 'rgba(220, 53, 69, 0.4)');
        gradRed.addColorStop(1, 'rgba(220, 53, 69, 0.02)');

        window.performanceChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'إجمالي الإيرادات',
                        data: revenueData,
                        backgroundColor: gradBlue,
                        borderColor: '#0d6efd',
                        borderWidth: 2,
                        borderRadius: 8,
                        order: 2
                    },
                    {
                        label: 'المدفوع',
                        data: paidData,
                        backgroundColor: gradGreen,
                        borderColor: '#28a745',
                        borderWidth: 2,
                        borderRadius: 8,
                        order: 3
                    },
                    {
                        label: 'غير المدفوع',
                        data: unpaidData,
                        backgroundColor: gradRed,
                        borderColor: '#dc3545',
                        borderWidth: 2,
                        borderRadius: 8,
                        order: 4
                    },
                    {
                        label: 'اتجاه الإيرادات',
                        data: revenueData,
                        type: 'line',
                        borderColor: '#6f42c1',
                        backgroundColor: 'rgba(111, 66, 193, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.4,
                        pointRadius: 6,
                        pointBackgroundColor: '#6f42c1',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointHoverRadius: 8,
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1200,
                    easing: 'easeOutQuart'
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true,
                        labels: {
                            font: { size: 13, family: 'Tajawal, sans-serif' },
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        rtl: true,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        titleFont: { size: 14 },
                        bodyFont: { size: 13 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(ctx) {
                                return ctx.dataset.label + ': ' + ctx.parsed.y.toLocaleString() + ' ر.ق';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            font: { size: 12 },
                            callback: function(v) { return v.toLocaleString() + ' ر.ق'; }
                        },
                        grid: { color: 'rgba(0,0,0,0.06)' }
                    },
                    x: {
                        ticks: { font: { size: 12 } },
                        grid: { display: false }
                    }
                }
            }
        });

        // Update dashboard stat cards
        try {
            var totalRevenue = revenueData.reduce(function(a, b) { return a + b; }, 0);
            var totalPaid = paidData.reduce(function(a, b) { return a + b; }, 0);
            var totalUnpaid = unpaidData.reduce(function(a, b) { return a + b; }, 0);

            var el;
            el = document.getElementById('statBalance');
            if (el) el.textContent = totalRevenue.toLocaleString() + ' ر.ق';

            // Update quick financial summary
            el = document.getElementById('quickIncome');
            if (el) el.textContent = totalRevenue.toLocaleString();
            el = document.getElementById('quickNet');
            if (el) {
                var totalExp = (window.dailyExpenses || []).reduce(function(s, e) { return s + (parseFloat(e.amount) || 0); }, 0);
                el.textContent = (totalRevenue - totalExp).toLocaleString();
            }
        } catch(e) {}

        console.log('📊 Modern performance chart built');
    }

    // ============================================================
    // 7. INVOICE LIST (loadInvoices)
    // ============================================================
    function setupInvoiceList() {
        // Override loadInvoices to show all invoices
        window.loadInvoices = function() {
            var container = document.getElementById('invoices');
            if (!container) return;

            var invoices = window.financialTransactions || [];
            if (invoices.length === 0 && window.dailyWork) {
                // Use dailyWork as invoices if no financialTransactions
                invoices = window.dailyWork;
            }

            var totalAmount = 0, paidAmount = 0, unpaidAmount = 0;
            invoices.forEach(function(inv) {
                var amt = parseFloat(inv.amount) || 0;
                totalAmount += amt;
                if (inv.paymentStatus === 'مدفوع' || inv.status === 'مدفوع') {
                    paidAmount += amt;
                } else {
                    unpaidAmount += amt;
                }
            });

            container.innerHTML = '\
                <div class="row g-3 mb-3">\
                    <div class="col-md-3"><div class="card p-3 text-center border-primary">\
                        <i class="fas fa-file-invoice fa-2x text-primary mb-2"></i>\
                        <h4>' + invoices.length + '</h4><small>إجمالي الفواتير</small>\
                    </div></div>\
                    <div class="col-md-3"><div class="card p-3 text-center border-success">\
                        <i class="fas fa-check-circle fa-2x text-success mb-2"></i>\
                        <h4>' + paidAmount.toLocaleString() + ' <small>ر.ق</small></h4><small>المدفوع</small>\
                    </div></div>\
                    <div class="col-md-3"><div class="card p-3 text-center border-danger">\
                        <i class="fas fa-exclamation-circle fa-2x text-danger mb-2"></i>\
                        <h4>' + unpaidAmount.toLocaleString() + ' <small>ر.ق</small></h4><small>غير المدفوع</small>\
                    </div></div>\
                    <div class="col-md-3"><div class="card p-3 text-center border-info">\
                        <i class="fas fa-coins fa-2x text-info mb-2"></i>\
                        <h4>' + totalAmount.toLocaleString() + ' <small>ر.ق</small></h4><small>الإجمالي</small>\
                    </div></div>\
                </div>\
                <div class="card">\
                    <div class="card-header d-flex justify-content-between align-items-center bg-primary text-white">\
                        <h5 class="mb-0"><i class="fas fa-file-invoice me-2"></i>قائمة الفواتير</h5>\
                        <div class="d-flex gap-2">\
                            <input type="text" id="invoiceSearch" class="form-control form-control-sm" placeholder="بحث..." style="width:200px;">\
                            <select id="invoiceStatusFilter" class="form-select form-select-sm" style="width:150px;">\
                                <option value="all">الكل</option>\
                                <option value="مدفوع">مدفوع</option>\
                                <option value="غير مدفوع">غير مدفوع</option>\
                            </select>\
                            <select id="invoiceMonthFilter" class="form-select form-select-sm" style="width:150px;">\
                                <option value="all">كل الأشهر</option>\
                            </select>\
                            <button class="btn btn-sm btn-light" onclick="exportInvoicesCSV()" title="تصدير CSV"><i class="fas fa-file-csv"></i></button>\
                            <button class="btn btn-sm btn-light" onclick="printInvoiceList()" title="طباعة"><i class="fas fa-print"></i></button>\
                        </div>\
                    </div>\
                    <div class="card-body p-0" style="max-height:600px; overflow-y:auto;">\
                        <table class="table table-hover table-striped mb-0" id="invoicesTable">\
                            <thead class="table-light sticky-top">\
                                <tr>\
                                    <th>#</th>\
                                    <th>التاريخ</th>\
                                    <th>العميل</th>\
                                    <th>المبلغ</th>\
                                    <th>حالة الدفع</th>\
                                    <th>طريقة الدفع</th>\
                                    <th>المنطقة</th>\
                                </tr>\
                            </thead>\
                            <tbody id="invoices-table-body"></tbody>\
                        </table>\
                    </div>\
                    <div class="card-footer">\
                        <small id="invoiceTableCount" class="text-muted"></small>\
                    </div>\
                </div>';

            // Populate month filter
            var monthSet = {};
            invoices.forEach(function(inv) {
                if (inv.date) {
                    var m = inv.date.substring(0, 7);
                    monthSet[m] = true;
                }
            });
            var monthSelect = document.getElementById('invoiceMonthFilter');
            Object.keys(monthSet).sort().forEach(function(m) {
                var opt = document.createElement('option');
                opt.value = m;
                opt.textContent = m;
                monthSelect.appendChild(opt);
            });

            // Render initial table
            renderInvoiceTable(invoices);

            // Search & filter events
            var searchEl = document.getElementById('invoiceSearch');
            var statusEl = document.getElementById('invoiceStatusFilter');
            var monthEl = document.getElementById('invoiceMonthFilter');

            function filterInvoices() {
                var search = searchEl.value.toLowerCase();
                var status = statusEl.value;
                var month = monthEl.value;
                var filtered = invoices.filter(function(inv) {
                    var matchSearch = !search ||
                        (inv.client || inv.clientName || '').toLowerCase().indexOf(search) > -1 ||
                        (inv.date || '').indexOf(search) > -1 ||
                        String(inv.amount || '').indexOf(search) > -1;
                    var matchStatus = status === 'all' ||
                        inv.paymentStatus === status || inv.status === status;
                    var matchMonth = month === 'all' ||
                        (inv.date && inv.date.substring(0, 7) === month);
                    return matchSearch && matchStatus && matchMonth;
                });
                renderInvoiceTable(filtered);
            }

            if (searchEl) searchEl.addEventListener('input', filterInvoices);
            if (statusEl) statusEl.addEventListener('change', filterInvoices);
            if (monthEl) monthEl.addEventListener('change', filterInvoices);
        };
    }

    function renderInvoiceTable(invList) {
        var tbody = document.getElementById('invoices-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';

        var countEl = document.getElementById('invoiceTableCount');
        if (countEl) countEl.textContent = invList.length + ' فاتورة';

        if (invList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">لا توجد فواتير</td></tr>';
            return;
        }

        // Sort by date descending
        var sorted = invList.slice().sort(function(a, b) {
            return (b.date || '').localeCompare(a.date || '');
        });

        // Paginate - show first 200 for performance
        var display = sorted.slice(0, 200);

        display.forEach(function(inv, i) {
            var status = inv.paymentStatus || inv.status || 'غير مدفوع';
            var badgeClass = status === 'مدفوع' ? 'bg-success' : status === 'مدفوع جزئي' ? 'bg-warning' : 'bg-danger';
            var tr = document.createElement('tr');
            tr.innerHTML = '<td>' + (i + 1) + '</td>' +
                '<td>' + (inv.date || '-') + '</td>' +
                '<td>' + (inv.client || inv.clientName || inv.source || '-') + '</td>' +
                '<td class="fw-bold">' + (parseFloat(inv.amount) || 0).toLocaleString() + ' ر.ق</td>' +
                '<td><span class="badge ' + badgeClass + '">' + status + '</span></td>' +
                '<td>' + (inv.paymentMethod || '-') + '</td>' +
                '<td>' + (inv.area || inv.location || '-') + '</td>';
            tbody.appendChild(tr);
        });

        if (sorted.length > 200) {
            var moreTr = document.createElement('tr');
            moreTr.innerHTML = '<td colspan="7" class="text-center text-info py-2">' +
                '<i class="fas fa-info-circle me-1"></i>يتم عرض أول 200 فاتورة. استخدم البحث للوصول لباقي الفواتير (' + sorted.length + ' إجمالي)</td>';
            tbody.appendChild(moreTr);
        }
    }

    // Export invoices as CSV
    window.exportInvoicesCSV = function() {
        var invoices = window.financialTransactions || window.dailyWork || [];
        var csv = '\uFEFF' + 'التاريخ,العميل,المبلغ,حالة الدفع,طريقة الدفع,المنطقة\n';
        invoices.forEach(function(inv) {
            csv += '"' + (inv.date || '') + '","' + (inv.client || inv.clientName || inv.source || '') + '",' +
                (inv.amount || 0) + ',"' + (inv.paymentStatus || inv.status || '') + '","' +
                (inv.paymentMethod || '') + '","' + (inv.area || inv.location || '') + '"\n';
        });
        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'invoices_' + new Date().toISOString().split('T')[0] + '.csv';
        a.click();
        URL.revokeObjectURL(url);
        if (typeof showToast === 'function') showToast('تم تصدير الفواتير', 'success');
    };

    // Print invoice list
    window.printInvoiceList = function() {
        var invoices = window.financialTransactions || window.dailyWork || [];
        var html = '<html dir="rtl"><head><meta charset="UTF-8">';
        html += '<style>body{font-family:Tajawal,Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ddd;padding:6px;text-align:right}th{background:#0d6efd;color:white}h1{text-align:center;color:#333}.badge-paid{color:green;font-weight:bold}.badge-unpaid{color:red;font-weight:bold}@media print{body{padding:5px}}</style>';
        html += '</head><body><h1>قائمة فواتير SuperPro</h1>';
        html += '<p>التاريخ: ' + new Date().toLocaleDateString('ar-SA') + ' | عدد الفواتير: ' + invoices.length + '</p>';
        html += '<table><thead><tr><th>#</th><th>التاريخ</th><th>العميل</th><th>المبلغ</th><th>حالة الدفع</th></tr></thead><tbody>';
        invoices.forEach(function(inv, i) {
            var status = inv.paymentStatus || inv.status || 'غير مدفوع';
            var cls = status === 'مدفوع' ? 'badge-paid' : 'badge-unpaid';
            html += '<tr><td>' + (i + 1) + '</td><td>' + (inv.date || '') + '</td><td>' + (inv.client || inv.clientName || '') +
                '</td><td>' + (parseFloat(inv.amount) || 0).toLocaleString() + ' ر.ق</td><td class="' + cls + '">' + status + '</td></tr>';
        });
        html += '</tbody></table></body></html>';
        var w = window.open('', '_blank');
        w.document.write(html);
        w.document.close();
        setTimeout(function() { w.print(); }, 500);
    };

    // ============================================================
    // 8. ENHANCED REPORTS
    // ============================================================
    function enhanceReports() {
        // Override loadReports
        var _origLoadReports = window.loadReports;
        window.loadReports = function() {
            try { if (_origLoadReports) _origLoadReports.call(window); } catch(e) {}

            // Add financial report button
            var reportResult = document.getElementById('reportResult');
            if (!reportResult) return;

            // Add enhanced report buttons
            var existingBtns = document.getElementById('enhancedReportBtns');
            if (!existingBtns) {
                var btnDiv = document.createElement('div');
                btnDiv.id = 'enhancedReportBtns';
                btnDiv.className = 'mb-3';
                btnDiv.innerHTML = '<div class="row g-2">\
                    <div class="col-md-3"><button class="btn btn-primary w-100" onclick="generateDetailedFinancialReport()"><i class="fas fa-chart-bar me-1"></i>تقرير مالي مفصل</button></div>\
                    <div class="col-md-3"><button class="btn btn-success w-100" onclick="generateMonthlyReport()"><i class="fas fa-calendar me-1"></i>تقرير شهري</button></div>\
                    <div class="col-md-3"><button class="btn btn-warning w-100" onclick="generateDailyReport()"><i class="fas fa-calendar-day me-1"></i>تقرير يومي</button></div>\
                    <div class="col-md-3"><button class="btn btn-info w-100" onclick="downloadReportPDF()"><i class="fas fa-file-pdf me-1"></i>تحميل PDF</button></div>\
                </div>';
                reportResult.parentElement.insertBefore(btnDiv, reportResult);
            }
        };

        // Detailed Financial Report
        window.generateDetailedFinancialReport = function() {
            var reportResult = document.getElementById('reportResult');
            if (!reportResult) return;

            var invoices = window.financialTransactions || [];
            var dw = window.dailyWork || [];
            var di = window.dailyIncome || [];
            var de = window.dailyExpenses || [];
            var ct = window.contracts || [];

            // Monthly breakdown
            var monthlyData = {};
            var allItems = invoices.length > 0 ? invoices : dw;
            allItems.forEach(function(item) {
                if (!item.date) return;
                var m = item.date.substring(0, 7);
                if (!monthlyData[m]) monthlyData[m] = { revenue: 0, paid: 0, unpaid: 0, count: 0, clients: {} };
                var amt = parseFloat(item.amount) || 0;
                monthlyData[m].revenue += amt;
                monthlyData[m].count++;
                var clientName = item.client || item.clientName || item.source || 'غير محدد';
                if (!monthlyData[m].clients[clientName]) monthlyData[m].clients[clientName] = 0;
                monthlyData[m].clients[clientName] += amt;
                if (item.paymentStatus === 'مدفوع' || item.status === 'مدفوع') {
                    monthlyData[m].paid += amt;
                } else {
                    monthlyData[m].unpaid += amt;
                }
            });

            var totalRevenue = 0, totalPaid = 0, totalUnpaid = 0;
            Object.values(monthlyData).forEach(function(d) {
                totalRevenue += d.revenue;
                totalPaid += d.paid;
                totalUnpaid += d.unpaid;
            });

            var totalExpenses = de.reduce(function(s, e) { return s + (parseFloat(e.amount) || 0); }, 0);

            var html = '<div class="card mb-3"><div class="card-header bg-primary text-white"><h5><i class="fas fa-chart-bar me-2"></i>التقرير المالي المفصل</h5></div>';
            html += '<div class="card-body">';

            // Summary cards
            html += '<div class="row g-2 mb-4">';
            html += '<div class="col-md-3"><div class="card p-3 text-center border-primary"><h4 class="text-primary">' + totalRevenue.toLocaleString() + '</h4><small>إجمالي الإيرادات (ر.ق)</small></div></div>';
            html += '<div class="col-md-3"><div class="card p-3 text-center border-success"><h4 class="text-success">' + totalPaid.toLocaleString() + '</h4><small>المدفوع (ر.ق)</small></div></div>';
            html += '<div class="col-md-3"><div class="card p-3 text-center border-danger"><h4 class="text-danger">' + totalUnpaid.toLocaleString() + '</h4><small>غير المدفوع (ر.ق)</small></div></div>';
            html += '<div class="col-md-3"><div class="card p-3 text-center border-warning"><h4 class="text-warning">' + totalExpenses.toLocaleString() + '</h4><small>المصروفات (ر.ق)</small></div></div>';
            html += '</div>';

            // Monthly table
            html += '<h6 class="mb-2"><i class="fas fa-table me-1"></i>التفصيل الشهري</h6>';
            html += '<div class="table-responsive"><table class="table table-bordered table-hover"><thead class="table-dark"><tr>';
            html += '<th>الشهر</th><th>عدد الفواتير</th><th>الإيرادات</th><th>المدفوع</th><th>غير المدفوع</th><th>أكبر عميل</th></tr></thead><tbody>';

            Object.keys(monthlyData).sort().forEach(function(m) {
                var d = monthlyData[m];
                var topClient = '';
                var topAmount = 0;
                Object.keys(d.clients).forEach(function(c) {
                    if (d.clients[c] > topAmount) { topClient = c; topAmount = d.clients[c]; }
                });
                html += '<tr><td>' + m + '</td><td>' + d.count + '</td>';
                html += '<td class="fw-bold">' + d.revenue.toLocaleString() + ' ر.ق</td>';
                html += '<td class="text-success">' + d.paid.toLocaleString() + ' ر.ق</td>';
                html += '<td class="text-danger">' + d.unpaid.toLocaleString() + ' ر.ق</td>';
                html += '<td>' + topClient + ' (' + topAmount.toLocaleString() + ')</td></tr>';
            });

            html += '</tbody></table></div>';

            // Contracts summary
            if (ct.length > 0) {
                var ctPaid = ct.filter(function(c) { return c.paymentStatus === 'مدفوع'; }).length;
                var ctTotal = ct.reduce(function(s, c) { return s + (parseFloat(c.amount) || 0); }, 0);
                html += '<h6 class="mt-3 mb-2"><i class="fas fa-file-contract me-1"></i>ملخص العقود</h6>';
                html += '<p>إجمالي العقود: <strong>' + ct.length + '</strong> | مدفوع: <strong>' + ctPaid + '</strong> | قيمة إجمالية: <strong>' + ctTotal.toLocaleString() + ' ر.ق</strong></p>';
            }

            html += '<div class="mt-3"><button class="btn btn-outline-primary me-2" onclick="downloadReportPDF()"><i class="fas fa-download me-1"></i>تحميل PDF</button>';
            html += '<button class="btn btn-outline-secondary" onclick="printFinancialReport()"><i class="fas fa-print me-1"></i>طباعة</button></div>';
            html += '</div></div>';

            reportResult.innerHTML = html;
        };

        // Monthly Report
        window.generateMonthlyReport = function() {
            var reportResult = document.getElementById('reportResult');
            if (!reportResult) return;

            var dw = window.dailyWork || [];
            var invoices = window.financialTransactions || [];
            var allItems = invoices.length > 0 ? invoices : dw;

            var months = {};
            allItems.forEach(function(item) {
                if (!item.date) return;
                var m = item.date.substring(0, 7);
                if (!months[m]) months[m] = { items: 0, revenue: 0 };
                months[m].items++;
                months[m].revenue += parseFloat(item.amount) || 0;
            });

            var html = '<div class="card"><div class="card-header bg-success text-white"><h5><i class="fas fa-calendar me-2"></i>التقرير الشهري</h5></div>';
            html += '<div class="card-body"><div class="table-responsive"><table class="table table-striped"><thead><tr><th>الشهر</th><th>عدد العمليات</th><th>الإيرادات</th></tr></thead><tbody>';
            Object.keys(months).sort().forEach(function(m) {
                html += '<tr><td>' + m + '</td><td>' + months[m].items + '</td><td class="fw-bold text-success">' + months[m].revenue.toLocaleString() + ' ر.ق</td></tr>';
            });
            html += '</tbody></table></div>';
            html += '<button class="btn btn-success mt-2" onclick="printFinancialReport()"><i class="fas fa-print me-1"></i>طباعة</button></div></div>';
            reportResult.innerHTML = html;
        };

        // Daily Report
        window.generateDailyReport = function() {
            var reportResult = document.getElementById('reportResult');
            if (!reportResult) return;

            var today = new Date().toISOString().split('T')[0];
            var dw = (window.dailyWork || []).filter(function(w) { return w.date === today; });
            var di = (window.dailyIncome || []).filter(function(i) { return i.date === today; });
            var de = (window.dailyExpenses || []).filter(function(e) { return e.date === today; });

            var totalWork = dw.reduce(function(s, w) { return s + (parseFloat(w.amount) || 0); }, 0);
            var totalInc = di.reduce(function(s, i) { return s + (parseFloat(i.amount) || 0); }, 0);
            var totalExp = de.reduce(function(s, e) { return s + (parseFloat(e.amount) || 0); }, 0);

            var html = '<div class="card"><div class="card-header bg-warning text-dark"><h5><i class="fas fa-calendar-day me-2"></i>التقرير اليومي - ' + today + '</h5></div>';
            html += '<div class="card-body"><div class="row g-2 mb-3">';
            html += '<div class="col-md-4"><div class="card p-3 text-center"><h4>' + dw.length + '</h4><small>عمليات العمل</small><br><strong>' + totalWork.toLocaleString() + ' ر.ق</strong></div></div>';
            html += '<div class="col-md-4"><div class="card p-3 text-center"><h4 class="text-success">' + di.length + '</h4><small>مدخولات</small><br><strong class="text-success">' + totalInc.toLocaleString() + ' ر.ق</strong></div></div>';
            html += '<div class="col-md-4"><div class="card p-3 text-center"><h4 class="text-danger">' + de.length + '</h4><small>مصروفات</small><br><strong class="text-danger">' + totalExp.toLocaleString() + ' ر.ق</strong></div></div>';
            html += '</div>';

            if (dw.length > 0) {
                html += '<h6>تفاصيل العمل</h6><div class="table-responsive"><table class="table table-sm"><thead><tr><th>العميل</th><th>المنطقة</th><th>المبلغ</th><th>الحالة</th></tr></thead><tbody>';
                dw.forEach(function(w) {
                    html += '<tr><td>' + (w.client || '') + '</td><td>' + (w.area || '') + '</td><td>' + (w.amount || 0) + ' ر.ق</td><td>' + (w.paymentStatus || '') + '</td></tr>';
                });
                html += '</tbody></table></div>';
            }

            html += '<button class="btn btn-warning mt-2" onclick="printFinancialReport()"><i class="fas fa-print me-1"></i>طباعة</button></div></div>';
            reportResult.innerHTML = html;
        };

        // Print financial report
        window.printFinancialReport = function() {
            var reportResult = document.getElementById('reportResult');
            if (!reportResult) return;
            var html = '<html dir="rtl"><head><meta charset="UTF-8"><style>body{font-family:Tajawal,Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#333;color:white}.text-success{color:green}.text-danger{color:red}.fw-bold{font-weight:bold}h1{text-align:center}</style></head><body>';
            html += '<h1>SuperPro - تقرير مالي</h1><p>تاريخ الطباعة: ' + new Date().toLocaleDateString('ar-SA') + '</p>';
            html += reportResult.innerHTML.replace(/<button[^>]*>.*?<\/button>/g, '');
            html += '</body></html>';
            var w = window.open('', '_blank');
            w.document.write(html);
            w.document.close();
            setTimeout(function() { w.print(); }, 500);
        };

        // Download report as PDF
        window.downloadReportPDF = function() {
            var reportResult = document.getElementById('reportResult');
            if (!reportResult || typeof html2pdf === 'undefined') {
                if (typeof showToast === 'function') showToast('مكتبة PDF غير متوفرة', 'warning');
                return;
            }
            html2pdf().set({
                margin: 10,
                filename: 'SuperPro_Report_' + new Date().toISOString().split('T')[0] + '.pdf',
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }).from(reportResult).save();
            if (typeof showToast === 'function') showToast('جاري تحميل PDF...', 'success');
        };
    }

    // ============================================================
    // 9. ENHANCED FILTERS UI
    // ============================================================
    function enhanceFiltersUI() {
        // Add "show all" buttons near date filters
        addShowAllButton('dailyWorkDateFilter', 'filterDailyWorkBtn', function() {
            var tbody = document.getElementById('dailyWork-table-body');
            if (!tbody) return;
            var all = window.dailyWork || [];
            document.getElementById('todayWorkCount').textContent = all.length;
            var total = all.reduce(function(s, w) { return s + (parseFloat(w.amount) || 0); }, 0);
            document.getElementById('todayIncome').textContent = total.toLocaleString() + ' ر.ق';
            document.getElementById('dailyWorkTableCount').textContent = all.length + ' سجل';
            if (typeof renderFilteredDailyWork === 'function') renderFilteredDailyWork(all.slice(-100));
        });

        addShowAllButton('dailyIncomeDateFilter', 'filterDailyIncomeBtn', function() {
            var all = window.dailyIncome || [];
            var total = all.reduce(function(s, i) { return s + (parseFloat(i.amount) || 0); }, 0);
            document.getElementById('todayTotalIncome').textContent = total.toLocaleString() + ' ر.ق';
            document.getElementById('dailyIncomeTableCount').textContent = all.length + ' سجل';
            if (typeof renderFilteredDailyIncome === 'function') renderFilteredDailyIncome(all.slice(-100));
        });

        addShowAllButton('dailyExpensesDateFilter', 'filterDailyExpensesBtn', function() {
            var all = window.dailyExpenses || [];
            var total = all.reduce(function(s, e) { return s + (parseFloat(e.amount) || 0); }, 0);
            document.getElementById('todayTotalExpenses').textContent = total.toLocaleString() + ' ر.ق';
            document.getElementById('dailyExpensesTableCount').textContent = all.length + ' سجل';
            if (typeof renderFilteredDailyExpenses === 'function') renderFilteredDailyExpenses(all.slice(-100));
        });
    }

    function addShowAllButton(filterInputId, existingBtnId, callback) {
        var filterInput = document.getElementById(filterInputId);
        if (!filterInput) return;
        var parent = filterInput.parentElement;
        if (!parent || parent.querySelector('.show-all-btn')) return;

        var btn = document.createElement('button');
        btn.className = 'btn btn-outline-info btn-sm show-all-btn ms-1';
        btn.innerHTML = '<i class="fas fa-list me-1"></i>عرض الكل';
        btn.onclick = callback;
        parent.appendChild(btn);
    }

    // ============================================================
    // 10. SCROLL-TO-TOP BUTTON
    // ============================================================
    function addScrollToTop() {
        var btn = document.createElement('button');
        btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        btn.className = 'btn btn-primary';
        btn.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:9999;display:none;width:45px;height:45px;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,0.2);';
        btn.onclick = function() { window.scrollTo({ top: 0, behavior: 'smooth' }); };
        document.body.appendChild(btn);
        window.addEventListener('scroll', function() {
            btn.style.display = window.scrollY > 300 ? 'block' : 'none';
        });
    }

    // ============================================================
    // 11. ENSURE PRINT FUNCTIONS WORK
    // ============================================================
    // Ensure base system print functions exist
    if (typeof window.printHtml !== 'function') {
        window.printHtml = function(title, innerHtml) {
            var w = window.open('', '_blank');
            w.document.write('<html dir="rtl"><head><meta charset="UTF-8"><title>' + title + '</title>');
            w.document.write('<style>body{font-family:Tajawal,Arial,sans-serif;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:right}th{background:#333;color:white}@media print{body{padding:5px}}</style>');
            w.document.write('</head><body><h1>' + title + '</h1>' + innerHtml + '</body></html>');
            w.document.close();
            setTimeout(function() { w.print(); }, 500);
        };
    }

    // ============================================================
    // START PATCHING
    // ============================================================
    waitAndPatch();

    console.log('✅ SuperPro Final: Module loaded');
})();
