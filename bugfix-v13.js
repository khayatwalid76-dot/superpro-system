/**
 * bugfix-v13.js — SuperPro System V13
 * ======================================
 * 1. إصلاح فلترة العقود (data-filter مطابقة + "قاربت على الانتهاء")
 * 2. إصلاح تسجيل الدخول عبر متصفحات مختلفة (Firebase أولاً)
 * 3. طباعة/تحميل الإقامات المنتهية والقريبة من الانتهاء
 * 4. طباعة/تحميل تقرير فواتير غير مدفوعة
 * 5. طباعة/تحميل تقارير العقود القريبة من الانتهاء (مدفوعة وغير مدفوعة)
 * 6. مراجعة وتحسين طباعة بيانات الموظف
 * 7. خصومات تأديبية للموظف من الراتب
 * 8. تحسين أداء الموبايل مع الحفاظ على البيانات والخصائص
 */
(function() {
    'use strict';
    console.log('🔧 SuperPro V13: Loading comprehensive improvements...');

    // ==========================================================
    // V13 CSS STYLES
    // ==========================================================
    const v13Style = document.createElement('style');
    v13Style.textContent = `
        /* ===== MOBILE OPTIMIZATION ===== */
        @media (max-width: 768px) {
            /* Sidebar mobile improvements */
            .sidebar {
                position: fixed !important;
                z-index: 9999 !important;
                width: 280px !important;
                transform: translateX(100%) !important;
                transition: transform 0.3s ease !important;
                height: 100vh !important;
                top: 0 !important;
                right: 0 !important;
                overflow-y: auto !important;
                box-shadow: -4px 0 20px rgba(0,0,0,0.3) !important;
            }
            html[dir="ltr"] .sidebar {
                transform: translateX(-100%) !important;
                right: auto !important;
                left: 0 !important;
            }
            .sidebar.show {
                transform: translateX(0) !important;
            }
            html[dir="ltr"] .sidebar.show {
                transform: translateX(0) !important;
            }

            /* Mobile menu toggle button */
            .v13-mobile-toggle {
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 10000;
                background: var(--primary, #2c3e50);
                color: white;
                border: none;
                border-radius: 50%;
                width: 48px;
                height: 48px;
                font-size: 22px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 3px 12px rgba(0,0,0,0.3);
                cursor: pointer;
                transition: all 0.2s;
            }
            html[dir="ltr"] .v13-mobile-toggle {
                right: auto;
                left: 10px;
            }
            .v13-mobile-toggle:active { transform: scale(0.9); }
            .v13-mobile-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.5);
                z-index: 9998;
                display: none;
            }
            .v13-mobile-overlay.show { display: block; }

            /* Content area on mobile */
            .content { margin: 0 !important; padding: 10px !important; padding-top: 60px !important; width: 100% !important; }

            /* Tables responsive on mobile */
            .table-responsive, .card-body { overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; }
            table { min-width: 600px; font-size: 13px !important; }
            table th, table td { padding: 6px 8px !important; white-space: nowrap; }

            /* Cards on mobile */
            .stat-card { padding: 12px !important; }
            .stat-card h2 { font-size: 1.3rem !important; }
            .stat-card p { font-size: 0.75rem !important; }

            /* Form improvements on mobile */
            .modal-dialog { margin: 10px !important; max-width: calc(100vw - 20px) !important; }
            .modal-body { max-height: 70vh !important; overflow-y: auto !important; }

            /* Date filter responsive */
            .date-filter-row {
                flex-direction: column !important;
                gap: 8px !important;
            }
            .date-filter-item { width: 100% !important; }
            .filter-buttons { width: 100% !important; display: flex; gap: 8px; }
            .filter-buttons .btn { flex: 1; }

            /* Button group scrollable on mobile */
            .btn-group { 
                display: flex !important; 
                flex-wrap: nowrap !important; 
                overflow-x: auto !important;
                -webkit-overflow-scrolling: touch !important;
                padding-bottom: 5px;
                max-width: 100%;
            }
            .btn-group .btn { white-space: nowrap !important; font-size: 12px !important; padding: 4px 10px !important; }

            /* Section title */
            .section-title { font-size: 1.2rem !important; }

            /* Print area hidden on mobile */
            .v13-report-actions { flex-direction: column !important; }
            .v13-report-actions .btn { width: 100% !important; }

            /* Row adjustments */
            .row.g-3 > [class*="col-md"] { margin-bottom: 8px; }

            /* Login screen mobile */
            .login-card { width: 95% !important; max-width: 400px !important; padding: 20px !important; }

            /* FAB mobile */
            .fab-container { bottom: 70px !important; }

            /* Navigation badges on mobile */
            .nav-link { padding: 8px 12px !important; font-size: 13px !important; }

            /* Hide less important columns on very small screens */
            .hide-mobile { display: none !important; }
        }

        @media (max-width: 480px) {
            table { min-width: 500px; font-size: 12px !important; }
            .stat-card h2 { font-size: 1.1rem !important; }
            .content { padding: 8px !important; padding-top: 55px !important; }
            .card { margin-bottom: 8px !important; }
            .card-body { padding: 10px !important; }
        }

        /* ===== REPORT STYLES ===== */
        .v13-report {
            direction: rtl;
            font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
            padding: 30px;
            max-width: 900px;
            margin: 0 auto;
            color: #333;
        }
        .v13-report h2 {
            text-align: center;
            color: #2c3e50;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .v13-report .report-subtitle {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .v13-report table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .v13-report table th {
            background: #2c3e50;
            color: white;
            padding: 10px 12px;
            text-align: right;
            font-size: 13px;
        }
        .v13-report table td {
            padding: 8px 12px;
            border-bottom: 1px solid #eee;
            font-size: 13px;
        }
        .v13-report table tr:nth-child(even) { background: #f8f9fa; }
        .v13-report .report-summary {
            background: #f0f7ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
        }
        .v13-report .summary-item {
            flex: 1;
            min-width: 120px;
            text-align: center;
        }
        .v13-report .summary-item .num {
            font-size: 1.5em;
            font-weight: bold;
            color: #2c3e50;
        }
        .v13-report .summary-item .label {
            font-size: 0.85em;
            color: #666;
        }
        .v13-report .report-footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
            color: #999;
            font-size: 0.85em;
        }
        .v13-report .badge-danger { background: #dc3545; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
        .v13-report .badge-warning { background: #ffc107; color: #333; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
        .v13-report .badge-success { background: #28a745; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
        .v13-report .badge-info { background: #17a2b8; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px; }

        /* Report action buttons */
        .v13-report-actions {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        .v13-report-actions .btn { min-width: 140px; }

        /* Disciplinary deductions table */
        .v13-deductions-container { margin-top: 15px; }
        .v13-deduction-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            margin: 1px;
        }

        /* Loading overlay for login */
        .v13-login-loading {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(255,255,255,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            z-index: 10;
            border-radius: inherit;
        }
        .v13-login-loading .spinner {
            width: 40px; height: 40px;
            border: 4px solid #e0e0e0;
            border-top: 4px solid #2c3e50;
            border-radius: 50%;
            animation: v13spin 0.8s linear infinite;
        }
        @keyframes v13spin { to { transform: rotate(360deg); } }

        /* Dashboard report buttons */
        .v13-dash-report-btn {
            padding: 5px 12px;
            font-size: 12px;
            border-radius: 6px;
            cursor: pointer;
            border: 1px solid #dee2e6;
            background: white;
            color: #495057;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        .v13-dash-report-btn:hover {
            background: #2c3e50;
            color: white;
            border-color: #2c3e50;
        }
        .v13-dash-report-btn i { font-size: 11px; }
    `;
    document.head.appendChild(v13Style);


    // ==========================================================
    // UTILITY FUNCTIONS
    // ==========================================================
    function v13Print(title, html) {
        if (typeof printHtml === 'function') {
            printHtml(title, html);
        } else {
            var area = document.getElementById('printArea');
            if (!area) {
                area = document.createElement('div');
                area.id = 'printArea';
                document.body.appendChild(area);
            }
            area.innerHTML = '<div style="font-size:20px;font-weight:800;margin-bottom:16px">' + title + '</div>' + html;
            document.body.classList.add('printing');
            setTimeout(function() { window.print(); }, 200);
            setTimeout(function() { document.body.classList.remove('printing'); area.innerHTML = ''; }, 2000);
        }
    }

    function v13Download(filename, html) {
        var fullHtml = '<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>' + filename + '</title>' +
            '<style>body{font-family:Segoe UI,Tahoma,Arial,sans-serif;direction:rtl;padding:20px;color:#333}' +
            'table{width:100%;border-collapse:collapse}th{background:#2c3e50;color:white;padding:10px;text-align:right}' +
            'td{padding:8px;border-bottom:1px solid #eee}.badge-danger{background:#dc3545;color:white;padding:3px 8px;border-radius:4px;font-size:12px}' +
            '.badge-warning{background:#ffc107;color:#333;padding:3px 8px;border-radius:4px;font-size:12px}' +
            '.badge-success{background:#28a745;color:white;padding:3px 8px;border-radius:4px;font-size:12px}' +
            '.badge-info{background:#17a2b8;color:white;padding:3px 8px;border-radius:4px;font-size:12px}' +
            'tr:nth-child(even){background:#f8f9fa}.report-summary{background:#f0f7ff;padding:15px;border-radius:8px;margin-bottom:15px;display:flex;gap:20px;flex-wrap:wrap}' +
            '.summary-item{flex:1;min-width:120px;text-align:center}.num{font-size:1.5em;font-weight:bold;color:#2c3e50}.label{font-size:0.85em;color:#666}' +
            '</style></head><body>' + html + '</body></html>';
        var blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'غير محدد';
        try {
            return new Date(dateStr).toLocaleDateString('ar-SA');
        } catch(e) {
            return dateStr;
        }
    }

    function getDaysDiff(dateStr) {
        if (!dateStr) return Infinity;
        var d = new Date(dateStr);
        var today = new Date();
        today.setHours(0,0,0,0);
        d.setHours(0,0,0,0);
        return Math.ceil((d - today) / (1000 * 3600 * 24));
    }

    function safeNum(v) { return parseFloat(v) || 0; }


    // ==========================================================
    // FIX 1: إصلاح فلترة العقود
    // ==========================================================
    function fixContractFiltering() {
        // Fix the "قاربت على الانتهاء" filter - its data-filter="منتهي" should match "near expiry" logic
        // Override updateContractsTable to handle all filters correctly
        window.updateContractsTable = function() {
            var searchEl = document.getElementById('contract-search');
            var searchTerm = searchEl ? searchEl.value.toLowerCase() : '';
            var activeBtn = document.querySelector('#contracts .btn-group .active');
            var activeFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';

            var contractsArr = window.contracts || [];
            var filtered = contractsArr.slice(); // copy

            // Apply search
            if (searchTerm) {
                filtered = filtered.filter(function(c) {
                    return (c.number && c.number.toLowerCase().indexOf(searchTerm) !== -1) ||
                           (c.client && c.client.toLowerCase().indexOf(searchTerm) !== -1) ||
                           (c.employee && c.employee.toLowerCase().indexOf(searchTerm) !== -1) ||
                           (c.contractNumber && c.contractNumber.toLowerCase().indexOf(searchTerm) !== -1);
                });
            }

            // Apply status filter
            var today = new Date();
            today.setHours(0,0,0,0);

            if (activeFilter === 'مدفوع') {
                filtered = filtered.filter(function(c) { return c.paymentStatus === 'مدفوع'; });
            } else if (activeFilter === 'غير مدفوع') {
                filtered = filtered.filter(function(c) { return c.paymentStatus === 'غير مدفوع'; });
            } else if (activeFilter === 'مدفوع جزئي') {
                filtered = filtered.filter(function(c) { return c.paymentStatus === 'مدفوع جزئي'; });
            } else if (activeFilter === 'عقود جزئية') {
                filtered = filtered.filter(function(c) { return c.type === 'جزئي'; });
            } else if (activeFilter === 'منتهي') {
                // FIX: This should show contracts NEAR EXPIRY (within 30 days), not already expired
                filtered = filtered.filter(function(c) {
                    if (!c.endDate) return false;
                    var endDate = new Date(c.endDate);
                    endDate.setHours(0,0,0,0);
                    var timeDiff = endDate.getTime() - today.getTime();
                    var daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    // Show contracts expiring within 30 days (including already expired within last 7 days)
                    return daysDiff <= 30 && daysDiff >= -7;
                });
            }
            // 'all' shows everything

            if (typeof window.renderFilteredContracts === 'function') {
                window.renderFilteredContracts(filtered);
            }

            // Update counter
            var counter = document.getElementById('contractsTableCount');
            if (counter) counter.textContent = filtered.length + ' عقد';
        };

        // Also fix the date filter apply button
        var applyBtn = document.getElementById('applyContractFilter');
        if (applyBtn) {
            // Remove old listeners by cloning
            var newApplyBtn = applyBtn.cloneNode(true);
            applyBtn.parentNode.replaceChild(newApplyBtn, applyBtn);
            
            newApplyBtn.addEventListener('click', function() {
                var fromDate = document.getElementById('contractFromDate').value;
                var toDate = document.getElementById('contractToDate').value;
                var month = document.getElementById('contractMonth').value;
                var contractsArr = window.contracts || [];
                var filtered = contractsArr.slice();

                if (fromDate) {
                    filtered = filtered.filter(function(c) { return c.startDate >= fromDate; });
                }
                if (toDate) {
                    filtered = filtered.filter(function(c) { return c.startDate <= toDate; });
                }
                if (month) {
                    filtered = filtered.filter(function(c) {
                        return (c.endDate && c.endDate.substring(0, 7) === month) ||
                               (c.startDate && c.startDate.substring(0, 7) === month);
                    });
                }

                if (typeof window.renderFilteredContracts === 'function') {
                    window.renderFilteredContracts(filtered);
                }
                var counter = document.getElementById('contractsTableCount');
                if (counter) counter.textContent = filtered.length + ' عقد';
            });
        }

        console.log('✅ V13: فلترة العقود تم إصلاحها');
    }


    // ==========================================================
    // FIX 2: إصلاح تسجيل الدخول عبر متصفحات مختلفة
    // ==========================================================
    function fixCrossBrowserLogin() {
        var USERS_FB_PATH = 'superpro_users';
        var _firebaseUsersLoaded = false;
        var _firebaseUsers = null;

        // Enhanced getLocalUsers that waits for Firebase
        function getLocalUsersEnhanced() {
            // Priority 1: Firebase data (if loaded)
            if (_firebaseUsers && Array.isArray(_firebaseUsers) && _firebaseUsers.length > 0) {
                return _firebaseUsers;
            }
            // Priority 2: localStorage
            try {
                var stored = localStorage.getItem('superpro_users');
                if (stored) {
                    var parsed = JSON.parse(stored);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                }
            } catch(e) {}
            // Priority 3: defaults
            return [
                { username: 'admin', password: '1234', role: 'admin', displayName: 'المدير' },
                { username: 'supervisor', password: '1234', role: 'supervisor', displayName: 'مشرف' },
                { username: 'viewer', password: '1234', role: 'viewer', displayName: 'عرض فقط' }
            ];
        }

        // Load users from Firebase on startup
        function loadFirebaseUsers(callback) {
            try {
                var db = window.firebaseDb;
                if (db && db.ref) {
                    db.ref(USERS_FB_PATH).once('value', function(snap) {
                        var data = snap.val();
                        if (data) {
                            var arr = Array.isArray(data) ? data : Object.values(data).filter(function(v) { return v != null; });
                            if (arr.length > 0) {
                                _firebaseUsers = arr;
                                _firebaseUsersLoaded = true;
                                // Update localStorage as cache
                                localStorage.setItem('superpro_users', JSON.stringify(arr));
                                // Update window.LOCAL_USERS if exists
                                if (window.LOCAL_USERS) {
                                    window.LOCAL_USERS.length = 0;
                                    arr.forEach(function(u) { window.LOCAL_USERS.push(u); });
                                }
                                console.log('☁️ V13: تم تحميل ' + arr.length + ' مستخدمين من Firebase');
                            }
                        }
                        _firebaseUsersLoaded = true;
                        if (callback) callback();
                    }).catch(function(err) {
                        console.warn('⚠️ V13: Firebase users load error:', err);
                        _firebaseUsersLoaded = true;
                        if (callback) callback();
                    });
                } else {
                    _firebaseUsersLoaded = true;
                    if (callback) callback();
                }
            } catch(e) {
                _firebaseUsersLoaded = true;
                if (callback) callback();
            }
        }

        // Override getLocalUsers globally
        window.getLocalUsers = getLocalUsersEnhanced;

        // Show loading on login screen while Firebase loads
        var loginCard = document.querySelector('.login-card, #loginScreen .card, #authLoginBtn')?.closest('.card, .login-card');
        
        // Load Firebase users immediately
        loadFirebaseUsers(function() {
            // Remove loading indicator if added
            var loadingEl = document.querySelector('.v13-login-loading');
            if (loadingEl) loadingEl.remove();
        });

        // Also re-patch the doLogin to use the enhanced getLocalUsers
        setTimeout(function() {
            var loginBtn = document.getElementById('authLoginBtn');
            var userInput = document.getElementById('authUsername');
            var passInput = document.getElementById('authPassword');
            var err = document.getElementById('authError');

            if (loginBtn) {
                var newLoginBtn = loginBtn.cloneNode(true);
                loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);

                var doLoginV13 = function() {
                    var username = (userInput ? userInput.value : '').trim();
                    var password = (passInput ? passInput.value : '').trim();

                    if (!username || !password) {
                        if (err) { err.textContent = '❌ يرجى إدخال اسم المستخدم وكلمة المرور'; err.style.display = 'block'; }
                        return;
                    }

                    // If Firebase hasn't loaded yet, wait a moment
                    if (!_firebaseUsersLoaded) {
                        if (err) { err.textContent = '⏳ جاري تحميل البيانات...'; err.style.display = 'block'; err.className = 'text-info'; }
                        setTimeout(doLoginV13, 500);
                        return;
                    }

                    var freshUsers = getLocalUsersEnhanced();
                    var u = freshUsers.find(function(x) { return x.username === username && x.password === password; });
                    
                    if (!u) {
                        if (err) { err.textContent = '❌ اسم المستخدم أو كلمة المرور غير صحيحة'; err.style.display = 'block'; err.className = 'text-danger'; }
                        return;
                    }

                    if (err) err.style.display = 'none';
                    if (typeof setCurrentUser === 'function') {
                        setCurrentUser({ username: u.username, role: u.role, displayName: u.displayName, loggedAt: new Date().toISOString() });
                    }
                    if (typeof showToast === 'function') {
                        showToast('مرحباً ' + u.displayName, 'success');
                    }
                };

                newLoginBtn.addEventListener('click', doLoginV13);
                if (userInput) userInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') doLoginV13(); });
                if (passInput) passInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') doLoginV13(); });
            }
        }, 1000);

        console.log('✅ V13: تسجيل الدخول عبر المتصفحات تم إصلاحه');
    }


    // ==========================================================
    // FIX 3: طباعة/تحميل الإقامات المنتهية والقريبة من الانتهاء
    // ==========================================================
    function getExpiringResidencies() {
        var emps = window.employees || [];
        var today = new Date();
        today.setHours(0,0,0,0);
        var results = [];

        emps.forEach(function(emp) {
            if (!emp || !emp.residencyExpiry) return;
            var expiry = new Date(emp.residencyExpiry);
            expiry.setHours(0,0,0,0);
            var daysDiff = Math.ceil((expiry - today) / (1000 * 3600 * 24));

            // Within 90 days or already expired
            if (daysDiff <= 90) {
                results.push({
                    name: emp.name || '',
                    nationality: emp.nationality || '',
                    job: emp.job || '',
                    phone: emp.phone || '',
                    expiryDate: emp.residencyExpiry,
                    daysDiff: daysDiff,
                    status: daysDiff < 0 ? 'منتهية' : daysDiff <= 7 ? 'عاجل' : daysDiff <= 30 ? 'قريبة' : 'تحذير'
                });
            }
        });

        // Sort by days remaining (most urgent first)
        results.sort(function(a, b) { return a.daysDiff - b.daysDiff; });
        return results;
    }

    function generateResidencyReportHtml() {
        var items = getExpiringResidencies();
        var expired = items.filter(function(i) { return i.daysDiff < 0; });
        var urgent = items.filter(function(i) { return i.daysDiff >= 0 && i.daysDiff <= 7; });
        var soon = items.filter(function(i) { return i.daysDiff > 7 && i.daysDiff <= 30; });
        var warning = items.filter(function(i) { return i.daysDiff > 30; });

        var html = '<div class="v13-report">' +
            '<h2>📋 تقرير الإقامات المنتهية والقريبة من الانتهاء</h2>' +
            '<p class="report-subtitle">تاريخ التقرير: ' + new Date().toLocaleDateString('ar-SA') + '</p>' +
            '<div class="report-summary">' +
            '<div class="summary-item"><div class="num" style="color:#dc3545">' + expired.length + '</div><div class="label">منتهية</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#fd7e14">' + urgent.length + '</div><div class="label">عاجل (7 أيام)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#ffc107">' + soon.length + '</div><div class="label">قريبة (30 يوم)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#17a2b8">' + warning.length + '</div><div class="label">تحذير (90 يوم)</div></div>' +
            '</div>';

        if (items.length === 0) {
            html += '<p style="text-align:center;color:#28a745;font-size:1.2em;padding:30px">✅ لا توجد إقامات منتهية أو قريبة من الانتهاء</p>';
        } else {
            html += '<table><thead><tr>' +
                '<th>#</th><th>الموظف</th><th>الجنسية</th><th>الوظيفة</th><th>الهاتف</th><th>تاريخ الانتهاء</th><th>المتبقي</th><th>الحالة</th>' +
                '</tr></thead><tbody>';

            items.forEach(function(item, idx) {
                var badge = item.status === 'منتهية' ? 'badge-danger' :
                           item.status === 'عاجل' ? 'badge-danger' :
                           item.status === 'قريبة' ? 'badge-warning' : 'badge-info';
                var remaining = item.daysDiff < 0 ? 'منتهية منذ ' + Math.abs(item.daysDiff) + ' يوم' :
                               item.daysDiff === 0 ? 'تنتهي اليوم' : item.daysDiff + ' يوم';

                html += '<tr>' +
                    '<td>' + (idx + 1) + '</td>' +
                    '<td><strong>' + item.name + '</strong></td>' +
                    '<td>' + item.nationality + '</td>' +
                    '<td>' + item.job + '</td>' +
                    '<td>' + item.phone + '</td>' +
                    '<td>' + formatDate(item.expiryDate) + '</td>' +
                    '<td>' + remaining + '</td>' +
                    '<td><span class="' + badge + '">' + item.status + '</span></td>' +
                    '</tr>';
            });

            html += '</tbody></table>';
        }

        html += '<div class="report-footer">تم إنشاء التقرير من نظام SuperPro بتاريخ ' + new Date().toLocaleDateString('ar-SA') + '</div></div>';
        return html;
    }

    window.printResidencyReport = function() {
        v13Print('تقرير الإقامات', generateResidencyReportHtml());
    };

    window.downloadResidencyReport = function() {
        v13Download('تقرير_الإقامات_' + new Date().toISOString().split('T')[0] + '.html', generateResidencyReportHtml());
        if (typeof showToast === 'function') showToast('تم تحميل تقرير الإقامات', 'success');
    };


    // ==========================================================
    // FIX 4: طباعة/تحميل تقرير فواتير غير مدفوعة
    // ==========================================================
    function getUnpaidInvoices() {
        var contractsArr = window.contracts || [];
        var results = [];

        contractsArr.forEach(function(c) {
            if (c.paymentStatus === 'غير مدفوع' || c.paymentStatus === 'مدفوع جزئي') {
                var remaining = safeNum(c.amount) - safeNum(c.paidAmount);
                if (remaining > 0) {
                    results.push({
                        number: c.number || c.contractNumber || '',
                        client: c.client || '',
                        employee: c.employee || '',
                        totalAmount: safeNum(c.amount),
                        paidAmount: safeNum(c.paidAmount),
                        remaining: remaining,
                        startDate: c.startDate || '',
                        endDate: c.endDate || '',
                        paymentStatus: c.paymentStatus || 'غير مدفوع',
                        status: c.status || ''
                    });
                }
            }
        });

        // Sort by remaining amount (highest first)
        results.sort(function(a, b) { return b.remaining - a.remaining; });
        return results;
    }

    function generateUnpaidInvoicesReportHtml() {
        var items = getUnpaidInvoices();
        var totalUnpaid = items.reduce(function(s, i) { return s + i.remaining; }, 0);
        var totalAmount = items.reduce(function(s, i) { return s + i.totalAmount; }, 0);
        var totalPaid = items.reduce(function(s, i) { return s + i.paidAmount; }, 0);

        var html = '<div class="v13-report">' +
            '<h2>📋 تقرير الفواتير غير المدفوعة</h2>' +
            '<p class="report-subtitle">تاريخ التقرير: ' + new Date().toLocaleDateString('ar-SA') + '</p>' +
            '<div class="report-summary">' +
            '<div class="summary-item"><div class="num">' + items.length + '</div><div class="label">عدد الفواتير</div></div>' +
            '<div class="summary-item"><div class="num">' + totalAmount.toLocaleString() + '</div><div class="label">إجمالي المبالغ (ر.ق)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#28a745">' + totalPaid.toLocaleString() + '</div><div class="label">المدفوع (ر.ق)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#dc3545">' + totalUnpaid.toLocaleString() + '</div><div class="label">المتبقي (ر.ق)</div></div>' +
            '</div>';

        if (items.length === 0) {
            html += '<p style="text-align:center;color:#28a745;font-size:1.2em;padding:30px">✅ جميع الفواتير مدفوعة</p>';
        } else {
            html += '<table><thead><tr>' +
                '<th>#</th><th>رقم العقد</th><th>العميل</th><th>الموظف</th><th>قيمة العقد</th><th>المدفوع</th><th>المتبقي</th><th>تاريخ البدء</th><th>تاريخ الانتهاء</th><th>الحالة</th>' +
                '</tr></thead><tbody>';

            items.forEach(function(item, idx) {
                var badge = item.paymentStatus === 'غير مدفوع' ? 'badge-danger' : 'badge-warning';
                html += '<tr>' +
                    '<td>' + (idx + 1) + '</td>' +
                    '<td>' + item.number + '</td>' +
                    '<td><strong>' + item.client + '</strong></td>' +
                    '<td>' + item.employee + '</td>' +
                    '<td>' + item.totalAmount.toLocaleString() + ' ر.ق</td>' +
                    '<td style="color:#28a745">' + item.paidAmount.toLocaleString() + ' ر.ق</td>' +
                    '<td style="color:#dc3545;font-weight:bold">' + item.remaining.toLocaleString() + ' ر.ق</td>' +
                    '<td>' + formatDate(item.startDate) + '</td>' +
                    '<td>' + formatDate(item.endDate) + '</td>' +
                    '<td><span class="' + badge + '">' + item.paymentStatus + '</span></td>' +
                    '</tr>';
            });

            html += '<tr style="background:#e8f5e9;font-weight:bold"><td colspan="6" style="text-align:left">الإجمالي</td>' +
                '<td style="color:#dc3545">' + totalUnpaid.toLocaleString() + ' ر.ق</td><td colspan="3"></td></tr>';
            html += '</tbody></table>';
        }

        html += '<div class="report-footer">تم إنشاء التقرير من نظام SuperPro بتاريخ ' + new Date().toLocaleDateString('ar-SA') + '</div></div>';
        return html;
    }

    window.printUnpaidInvoicesReport = function() {
        v13Print('تقرير الفواتير غير المدفوعة', generateUnpaidInvoicesReportHtml());
    };

    window.downloadUnpaidInvoicesReport = function() {
        v13Download('تقرير_فواتير_غير_مدفوعة_' + new Date().toISOString().split('T')[0] + '.html', generateUnpaidInvoicesReportHtml());
        if (typeof showToast === 'function') showToast('تم تحميل تقرير الفواتير غير المدفوعة', 'success');
    };


    // ==========================================================
    // FIX 5: طباعة/تحميل تقارير العقود القريبة من الانتهاء
    // ==========================================================
    function getExpiringContracts() {
        var contractsArr = window.contracts || [];
        var today = new Date();
        today.setHours(0,0,0,0);
        var results = [];

        contractsArr.forEach(function(c) {
            if (!c.endDate) return;
            var endDate = new Date(c.endDate);
            endDate.setHours(0,0,0,0);
            var daysDiff = Math.ceil((endDate - today) / (1000 * 3600 * 24));

            // Within 60 days or expired within last 30 days
            if (daysDiff <= 60 && daysDiff >= -30) {
                results.push({
                    number: c.number || c.contractNumber || '',
                    client: c.client || '',
                    employee: c.employee || '',
                    type: c.type || '',
                    amount: safeNum(c.amount),
                    paidAmount: safeNum(c.paidAmount),
                    remaining: safeNum(c.amount) - safeNum(c.paidAmount),
                    startDate: c.startDate || '',
                    endDate: c.endDate || '',
                    paymentStatus: c.paymentStatus || '',
                    status: c.status || '',
                    daysDiff: daysDiff
                });
            }
        });

        results.sort(function(a, b) { return a.daysDiff - b.daysDiff; });
        return results;
    }

    function generateExpiringContractsReportHtml(filterType) {
        var allItems = getExpiringContracts();
        var items = allItems;
        var title = 'تقرير العقود القريبة من الانتهاء';

        if (filterType === 'paid') {
            items = allItems.filter(function(i) { return i.paymentStatus === 'مدفوع'; });
            title = 'تقرير العقود القريبة من الانتهاء - المدفوعة';
        } else if (filterType === 'unpaid') {
            items = allItems.filter(function(i) { return i.paymentStatus !== 'مدفوع'; });
            title = 'تقرير العقود القريبة من الانتهاء - غير المدفوعة';
        }

        var expired = items.filter(function(i) { return i.daysDiff < 0; });
        var urgent = items.filter(function(i) { return i.daysDiff >= 0 && i.daysDiff <= 7; });
        var soon = items.filter(function(i) { return i.daysDiff > 7 && i.daysDiff <= 30; });
        var later = items.filter(function(i) { return i.daysDiff > 30; });
        var totalRemaining = items.reduce(function(s, i) { return s + i.remaining; }, 0);

        var html = '<div class="v13-report">' +
            '<h2>📋 ' + title + '</h2>' +
            '<p class="report-subtitle">تاريخ التقرير: ' + new Date().toLocaleDateString('ar-SA') + '</p>' +
            '<div class="report-summary">' +
            '<div class="summary-item"><div class="num" style="color:#dc3545">' + expired.length + '</div><div class="label">منتهية</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#fd7e14">' + urgent.length + '</div><div class="label">عاجل (7 أيام)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#ffc107">' + soon.length + '</div><div class="label">قريبة (30 يوم)</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#17a2b8">' + later.length + '</div><div class="label">خلال 60 يوم</div></div>' +
            '<div class="summary-item"><div class="num" style="color:#dc3545">' + totalRemaining.toLocaleString() + '</div><div class="label">مبالغ متبقية (ر.ق)</div></div>' +
            '</div>';

        if (items.length === 0) {
            html += '<p style="text-align:center;color:#28a745;font-size:1.2em;padding:30px">✅ لا توجد عقود قريبة من الانتهاء</p>';
        } else {
            html += '<table><thead><tr>' +
                '<th>#</th><th>رقم العقد</th><th>العميل</th><th>الموظف</th><th>النوع</th><th>قيمة العقد</th><th>المتبقي</th>' +
                '<th>تاريخ الانتهاء</th><th>المتبقي</th><th>حالة الدفع</th><th>الحالة</th>' +
                '</tr></thead><tbody>';

            items.forEach(function(item, idx) {
                var statusBadge = item.daysDiff < 0 ? 'badge-danger' :
                                 item.daysDiff <= 7 ? 'badge-danger' :
                                 item.daysDiff <= 30 ? 'badge-warning' : 'badge-info';
                var payBadge = item.paymentStatus === 'مدفوع' ? 'badge-success' :
                              item.paymentStatus === 'مدفوع جزئي' ? 'badge-warning' : 'badge-danger';
                var remaining = item.daysDiff < 0 ? 'منتهي منذ ' + Math.abs(item.daysDiff) + ' يوم' :
                               item.daysDiff === 0 ? 'ينتهي اليوم' : item.daysDiff + ' يوم';

                html += '<tr>' +
                    '<td>' + (idx + 1) + '</td>' +
                    '<td>' + item.number + '</td>' +
                    '<td><strong>' + item.client + '</strong></td>' +
                    '<td>' + item.employee + '</td>' +
                    '<td>' + item.type + '</td>' +
                    '<td>' + item.amount.toLocaleString() + ' ر.ق</td>' +
                    '<td style="color:#dc3545">' + item.remaining.toLocaleString() + ' ر.ق</td>' +
                    '<td>' + formatDate(item.endDate) + '</td>' +
                    '<td><span class="' + statusBadge + '">' + remaining + '</span></td>' +
                    '<td><span class="' + payBadge + '">' + item.paymentStatus + '</span></td>' +
                    '<td>' + item.status + '</td>' +
                    '</tr>';
            });

            html += '</tbody></table>';
        }

        html += '<div class="report-footer">تم إنشاء التقرير من نظام SuperPro بتاريخ ' + new Date().toLocaleDateString('ar-SA') + '</div></div>';
        return html;
    }

    window.printExpiringContractsReport = function(type) {
        v13Print('تقرير العقود القريبة من الانتهاء', generateExpiringContractsReportHtml(type || 'all'));
    };
    window.downloadExpiringContractsReport = function(type) {
        var suffix = type === 'paid' ? '_مدفوعة' : type === 'unpaid' ? '_غير_مدفوعة' : '';
        v13Download('تقرير_عقود_قريبة_انتهاء' + suffix + '_' + new Date().toISOString().split('T')[0] + '.html',
            generateExpiringContractsReportHtml(type || 'all'));
        if (typeof showToast === 'function') showToast('تم تحميل التقرير', 'success');
    };


    // ==========================================================
    // FIX 6: تحسين طباعة بيانات الموظف
    // ==========================================================
    function enhanceEmployeePrinting() {
        // Enhanced employee profile with more details
        window.getEnhancedEmployeeProfileHtml = function(emp) {
            if (!emp) return '';
            
            var totalSalary = safeNum(emp.salary) + safeNum(emp.housingAllowance) + safeNum(emp.transportAllowance) + 
                             safeNum(emp.foodAllowance) + safeNum(emp.otherAllowance);

            // Get disciplinary deductions if any
            var deductions = getDisciplinaryDeductions(emp.name);
            var totalDeductions = deductions.reduce(function(s, d) { return s + safeNum(d.amount); }, 0);

            // Get contracts for this employee
            var empContracts = (window.contracts || []).filter(function(c) { return c.employee === emp.name; });
            var contractsHtml = '';
            if (empContracts.length > 0) {
                contractsHtml = '<h3 style="color:#2c3e50;margin-top:20px;border-bottom:2px solid #2c3e50;padding-bottom:5px">العقود المرتبطة</h3><table>';
                contractsHtml += '<tr style="background:#2c3e50;color:white"><th style="padding:8px">رقم العقد</th><th style="padding:8px">العميل</th><th style="padding:8px">القيمة</th><th style="padding:8px">البدء</th><th style="padding:8px">الانتهاء</th><th style="padding:8px">حالة الدفع</th></tr>';
                empContracts.forEach(function(c) {
                    contractsHtml += '<tr><td style="padding:8px">' + (c.number || '') + '</td><td style="padding:8px">' + (c.client || '') + '</td>' +
                        '<td style="padding:8px">' + safeNum(c.amount).toLocaleString() + ' ر.ق</td>' +
                        '<td style="padding:8px">' + formatDate(c.startDate) + '</td><td style="padding:8px">' + formatDate(c.endDate) + '</td>' +
                        '<td style="padding:8px">' + (c.paymentStatus || '') + '</td></tr>';
                });
                contractsHtml += '</table>';
            }

            // Deductions section
            var deductionsHtml = '';
            if (deductions.length > 0) {
                deductionsHtml = '<h3 style="color:#c0392b;margin-top:20px;border-bottom:2px solid #c0392b;padding-bottom:5px">الخصومات التأديبية</h3><table>';
                deductionsHtml += '<tr style="background:#c0392b;color:white"><th style="padding:8px">التاريخ</th><th style="padding:8px">السبب</th><th style="padding:8px">المبلغ</th></tr>';
                deductions.forEach(function(d) {
                    deductionsHtml += '<tr><td style="padding:8px">' + formatDate(d.date) + '</td><td style="padding:8px">' + (d.reason || '') + '</td>' +
                        '<td style="padding:8px;color:#c0392b">' + safeNum(d.amount).toLocaleString() + ' ر.ق</td></tr>';
                });
                deductionsHtml += '<tr style="background:#fce4ec;font-weight:bold"><td colspan="2" style="padding:8px">إجمالي الخصومات</td>' +
                    '<td style="padding:8px;color:#c0392b">' + totalDeductions.toLocaleString() + ' ر.ق</td></tr>';
                deductionsHtml += '</table>';
            }

            // Residency status
            var residencyStatus = '';
            if (emp.residencyExpiry) {
                var days = getDaysDiff(emp.residencyExpiry);
                if (days < 0) residencyStatus = ' <span style="color:#dc3545;font-weight:bold">(منتهية)</span>';
                else if (days <= 30) residencyStatus = ' <span style="color:#fd7e14;font-weight:bold">(تنتهي خلال ' + days + ' يوم)</span>';
            }

            var initials = (emp.name || '?').charAt(0);

            return '<div class="employee-profile">' +
                '<div class="ep-header">' +
                '<div class="ep-avatar">' + initials + '</div>' +
                '<h2>' + (emp.name || '') + '</h2>' +
                '<p style="color:#666">' + (emp.job || '') + ' | ' + (emp.status || '') + '</p>' +
                '</div>' +
                '<h3 style="color:#2c3e50;border-bottom:2px solid #2c3e50;padding-bottom:5px">المعلومات الشخصية</h3>' +
                '<table>' +
                '<tr><td>الاسم الكامل</td><td>' + (emp.name || '') + '</td></tr>' +
                '<tr><td>الوظيفة</td><td>' + (emp.job || '') + '</td></tr>' +
                '<tr><td>الجنسية</td><td>' + (emp.nationality || '') + '</td></tr>' +
                '<tr><td>رقم الهاتف</td><td>' + (emp.phone || '') + '</td></tr>' +
                '<tr><td>الحالة</td><td>' + (emp.status || '') + '</td></tr>' +
                '<tr><td>تاريخ الانضمام</td><td>' + formatDate(emp.joinDate || emp.startDate) + '</td></tr>' +
                '<tr><td>رقم الإقامة</td><td>' + (emp.residencyNumber || emp.idNumber || '') + '</td></tr>' +
                '<tr><td>تاريخ انتهاء الإقامة</td><td>' + formatDate(emp.residencyExpiry) + residencyStatus + '</td></tr>' +
                '</table>' +
                '<h3 style="color:#2c3e50;margin-top:20px;border-bottom:2px solid #2c3e50;padding-bottom:5px">المعلومات المالية</h3>' +
                '<table>' +
                '<tr><td>الراتب الأساسي</td><td>' + safeNum(emp.salary).toLocaleString() + ' ر.ق</td></tr>' +
                '<tr><td>بدل سكن</td><td>' + safeNum(emp.housingAllowance).toLocaleString() + ' ر.ق</td></tr>' +
                '<tr><td>بدل مواصلات</td><td>' + safeNum(emp.transportAllowance).toLocaleString() + ' ر.ق</td></tr>' +
                '<tr><td>بدل طعام</td><td>' + safeNum(emp.foodAllowance).toLocaleString() + ' ر.ق</td></tr>' +
                '<tr><td>بدلات أخرى</td><td>' + safeNum(emp.otherAllowance).toLocaleString() + ' ر.ق</td></tr>' +
                '<tr style="background:#e8f5e9;font-weight:bold"><td>إجمالي الراتب</td><td>' + totalSalary.toLocaleString() + ' ر.ق</td></tr>' +
                (totalDeductions > 0 ? '<tr style="background:#fce4ec;font-weight:bold"><td>الخصومات التأديبية</td><td style="color:#c0392b">-' + totalDeductions.toLocaleString() + ' ر.ق</td></tr>' : '') +
                '</table>' +
                contractsHtml +
                deductionsHtml +
                '<div style="text-align:center;margin-top:30px;color:#999;font-size:0.85em">' +
                'تم الطباعة من نظام SuperPro بتاريخ ' + new Date().toLocaleDateString('ar-SA') +
                '</div></div>';
        };

        // Override printEmployeeProfile to use enhanced version
        window.printEmployeeProfile = function(index) {
            var emp = (window.employees || [])[index];
            if (!emp) { 
                if (typeof showToast === 'function') showToast('لم يتم العثور على الموظف', 'error');
                return;
            }
            v13Print('بيانات الموظف - ' + emp.name, window.getEnhancedEmployeeProfileHtml(emp));
        };

        window.downloadEmployeeProfile = function(index) {
            var emp = (window.employees || [])[index];
            if (!emp) return;
            v13Download('بيانات_' + emp.name + '.html', window.getEnhancedEmployeeProfileHtml(emp));
            if (typeof showToast === 'function') showToast('تم تحميل بيانات الموظف', 'success');
        };

        console.log('✅ V13: طباعة بيانات الموظف تم تحسينها');
    }


    // ==========================================================
    // FIX 7: خصومات تأديبية للموظف من الراتب
    // ==========================================================
    var DEDUCTIONS_KEY = 'superpro_disciplinary_deductions';

    function getDisciplinaryDeductions(employeeName) {
        var all = getAllDisciplinaryDeductions();
        if (employeeName) {
            return all.filter(function(d) { return d.employee === employeeName; });
        }
        return all;
    }

    function getAllDisciplinaryDeductions() {
        try {
            var stored = localStorage.getItem(DEDUCTIONS_KEY);
            if (stored) return JSON.parse(stored);
        } catch(e) {}
        return [];
    }

    function saveDisciplinaryDeductions(deductions) {
        localStorage.setItem(DEDUCTIONS_KEY, JSON.stringify(deductions));
        // Also save to Firebase
        try {
            if (window.firebaseDb && window.firebaseDb.ref) {
                window.firebaseDb.ref('disciplinary_deductions').set(deductions);
            }
        } catch(e) {}
    }

    function loadDeductionsFromFirebase() {
        try {
            if (window.firebaseDb && window.firebaseDb.ref) {
                window.firebaseDb.ref('disciplinary_deductions').once('value', function(snap) {
                    var data = snap.val();
                    if (data) {
                        var arr = Array.isArray(data) ? data : Object.values(data).filter(function(v) { return v != null; });
                        if (arr.length > 0) {
                            localStorage.setItem(DEDUCTIONS_KEY, JSON.stringify(arr));
                        }
                    }
                });
            }
        } catch(e) {}
    }

    window.addDisciplinaryDeduction = function(employeeName, amount, reason, date) {
        if (!employeeName || !amount) {
            if (typeof showToast === 'function') showToast('يرجى إدخال اسم الموظف والمبلغ', 'error');
            return false;
        }
        var deductions = getAllDisciplinaryDeductions();
        deductions.push({
            id: Date.now().toString(),
            employee: employeeName,
            amount: safeNum(amount),
            reason: reason || 'خصم تأديبي',
            date: date || new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        });
        saveDisciplinaryDeductions(deductions);
        if (typeof showToast === 'function') showToast('تم إضافة الخصم التأديبي', 'success');
        if (typeof logActivity === 'function') logActivity('خصم تأديبي', employeeName + ' - ' + amount + ' ر.ق - ' + reason);
        return true;
    };

    window.removeDisciplinaryDeduction = function(id) {
        var deductions = getAllDisciplinaryDeductions();
        deductions = deductions.filter(function(d) { return d.id !== id; });
        saveDisciplinaryDeductions(deductions);
        if (typeof showToast === 'function') showToast('تم حذف الخصم', 'success');
    };

    window.showDisciplinaryDeductionModal = function(employeeName) {
        // Remove old modal if exists
        var oldModal = document.getElementById('v13DeductionModal');
        if (oldModal) oldModal.remove();

        var emps = window.employees || [];
        var empOptions = emps.map(function(e) {
            var sel = e.name === employeeName ? ' selected' : '';
            return '<option value="' + e.name + '"' + sel + '>' + e.name + '</option>';
        }).join('');

        var existingDeductions = employeeName ? getDisciplinaryDeductions(employeeName) : getAllDisciplinaryDeductions();
        var deductionsListHtml = '';
        if (existingDeductions.length > 0) {
            deductionsListHtml = '<h6 class="mt-3">الخصومات الحالية:</h6><div class="table-responsive"><table class="table table-sm"><thead><tr><th>التاريخ</th><th>الموظف</th><th>السبب</th><th>المبلغ</th><th>إجراء</th></tr></thead><tbody>';
            existingDeductions.forEach(function(d) {
                deductionsListHtml += '<tr><td>' + (d.date || '') + '</td><td>' + (d.employee || '') + '</td><td>' + (d.reason || '') + '</td>' +
                    '<td class="text-danger">' + safeNum(d.amount).toLocaleString() + ' ر.ق</td>' +
                    '<td><button class="btn btn-sm btn-outline-danger" onclick="removeDisciplinaryDeduction(\'' + d.id + '\');document.getElementById(\'v13DeductionModal\').remove();showDisciplinaryDeductionModal(\'' + (employeeName || '') + '\')"><i class="fas fa-trash"></i></button></td></tr>';
            });
            var total = existingDeductions.reduce(function(s, d) { return s + safeNum(d.amount); }, 0);
            deductionsListHtml += '<tr style="font-weight:bold;background:#fce4ec"><td colspan="3">الإجمالي</td><td class="text-danger">' + total.toLocaleString() + ' ر.ق</td><td></td></tr>';
            deductionsListHtml += '</tbody></table></div>';
        }

        var modalHtml = '<div class="modal fade" id="v13DeductionModal" tabindex="-1">' +
            '<div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header bg-danger text-white">' +
            '<h5 class="modal-title"><i class="fas fa-gavel me-2"></i>خصومات تأديبية</h5>' +
            '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>' +
            '<div class="modal-body">' +
            '<div class="row g-3">' +
            '<div class="col-md-6"><label class="form-label">الموظف</label><select id="v13DeductEmployee" class="form-select">' +
            '<option value="">اختر الموظف</option>' + empOptions + '</select></div>' +
            '<div class="col-md-6"><label class="form-label">المبلغ (ر.ق)</label><input type="number" id="v13DeductAmount" class="form-control" min="1" placeholder="0"></div>' +
            '<div class="col-md-6"><label class="form-label">السبب</label><select id="v13DeductReason" class="form-select">' +
            '<option value="تأخر عن العمل">تأخر عن العمل</option>' +
            '<option value="غياب بدون إذن">غياب بدون إذن</option>' +
            '<option value="إهمال في العمل">إهمال في العمل</option>' +
            '<option value="مخالفة سلوكية">مخالفة سلوكية</option>' +
            '<option value="تلف معدات">تلف معدات</option>' +
            '<option value="شكوى عميل">شكوى عميل</option>' +
            '<option value="أخرى">أخرى</option>' +
            '</select></div>' +
            '<div class="col-md-6"><label class="form-label">التاريخ</label><input type="date" id="v13DeductDate" class="form-control" value="' + new Date().toISOString().split('T')[0] + '"></div>' +
            '<div class="col-12"><label class="form-label">ملاحظات إضافية</label><input type="text" id="v13DeductNotes" class="form-control" placeholder="ملاحظات..."></div>' +
            '</div>' +
            deductionsListHtml +
            '</div><div class="modal-footer">' +
            '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>' +
            '<button type="button" class="btn btn-danger" id="v13SaveDeduction"><i class="fas fa-plus me-1"></i>إضافة الخصم</button>' +
            '</div></div></div></div>';

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        var modal = new bootstrap.Modal(document.getElementById('v13DeductionModal'));
        modal.show();

        document.getElementById('v13SaveDeduction').addEventListener('click', function() {
            var emp = document.getElementById('v13DeductEmployee').value;
            var amount = document.getElementById('v13DeductAmount').value;
            var reason = document.getElementById('v13DeductReason').value;
            var notes = document.getElementById('v13DeductNotes').value;
            var date = document.getElementById('v13DeductDate').value;

            if (notes) reason += ' - ' + notes;

            if (addDisciplinaryDeduction(emp, amount, reason, date)) {
                modal.hide();
                document.getElementById('v13DeductionModal').remove();
                // Reopen to show updated list
                setTimeout(function() { showDisciplinaryDeductionModal(emp); }, 300);
            }
        });
    };

    // Patch salary calculation to include disciplinary deductions
    function patchPayrollCalculation() {
        var origCalc = window.calculatePayrollRows;
        if (!origCalc) return;

        window.calculatePayrollRows = function(params) {
            var rows = origCalc(params);
            
            rows.forEach(function(row) {
                // Get disciplinary deductions for this employee in this month
                var empDeductions = getDisciplinaryDeductions(row.employee);
                var monthDeductions = empDeductions.filter(function(d) {
                    return d.date && d.date.substring(0, 7) === params.month;
                });
                var disciplinaryTotal = monthDeductions.reduce(function(s, d) { return s + safeNum(d.amount); }, 0);

                // Add to existing deductions
                row.disciplinaryDeductions = disciplinaryTotal;
                row.deductions = (row.deductions || 0) + disciplinaryTotal;
                row.net = Math.max(0, Math.round(
                    safeNum(row.baseSalary) + safeNum(row.overtimeAllowance) + safeNum(row.allowances) - 
                    safeNum(row.deductions) - safeNum(row.advances)
                ));

                if (disciplinaryTotal > 0) {
                    row.status = row.status === 'مكتمل' ? 'خصم تأديبي' : row.status + ' + تأديبي';
                }
            });

            return rows;
        };
    }

    // Add deduction button to employee actions
    function addDeductionButtonToEmployees() {
        var tbody = document.getElementById('employees-table-body');
        if (!tbody) return;

        tbody.querySelectorAll('tr').forEach(function(tr, idx) {
            var lastTd = tr.querySelector('td:last-child');
            if (!lastTd) return;
            var btnGroup = lastTd.querySelector('.btn-group');
            if (!btnGroup || btnGroup.querySelector('.v13-deduct-btn')) return;

            var emp = (window.employees || [])[idx];
            if (!emp) return;

            var deductBtn = document.createElement('button');
            deductBtn.type = 'button';
            deductBtn.className = 'btn btn-outline-danger quick-action-btn v13-deduct-btn';
            deductBtn.title = 'خصم تأديبي';
            deductBtn.innerHTML = '<i class="fas fa-gavel"></i>';
            deductBtn.onclick = function(e) { e.stopPropagation(); showDisciplinaryDeductionModal(emp.name); };
            btnGroup.appendChild(deductBtn);
        });
    }


    // ==========================================================
    // FIX 8: تحسين أداء الموبايل
    // ==========================================================
    function setupMobileOptimizations() {
        // Only add mobile toggle on small screens
        if (window.innerWidth > 768) return;

        // Create mobile menu toggle button
        var existingToggle = document.querySelector('.v13-mobile-toggle');
        if (existingToggle) return;

        var toggle = document.createElement('button');
        toggle.className = 'v13-mobile-toggle';
        toggle.innerHTML = '<i class="fas fa-bars"></i>';
        toggle.setAttribute('aria-label', 'القائمة');
        document.body.appendChild(toggle);

        // Create overlay
        var overlay = document.createElement('div');
        overlay.className = 'v13-mobile-overlay';
        document.body.appendChild(overlay);

        var sidebar = document.querySelector('.sidebar');

        toggle.addEventListener('click', function() {
            if (sidebar) {
                sidebar.classList.toggle('show');
                overlay.classList.toggle('show');
                toggle.innerHTML = sidebar.classList.contains('show') ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            }
        });

        overlay.addEventListener('click', function() {
            if (sidebar) sidebar.classList.remove('show');
            overlay.classList.remove('show');
            toggle.innerHTML = '<i class="fas fa-bars"></i>';
        });

        // Close sidebar when clicking a nav link on mobile
        document.querySelectorAll('.sidebar .nav-link').forEach(function(link) {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768 && sidebar) {
                    setTimeout(function() {
                        sidebar.classList.remove('show');
                        overlay.classList.remove('show');
                        toggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }, 200);
                }
            });
        });

        // Improve touch scrolling for tables
        document.querySelectorAll('.card-body, .table-responsive').forEach(function(el) {
            el.style.webkitOverflowScrolling = 'touch';
        });

        console.log('✅ V13: تحسينات الموبايل مفعلة');
    }


    // ==========================================================
    // ADD REPORT BUTTONS TO DASHBOARD & SECTIONS
    // ==========================================================
    function addReportButtons() {
        // 1. Add buttons to dashboard residency alerts section
        var residencyHeader = document.querySelector('#residencyAlertsCount, #expiringResidencyCount');
        if (!residencyHeader) {
            // Find by looking at dashboard cards
            document.querySelectorAll('.stat-card p, .card p').forEach(function(p) {
                if (p.textContent.indexOf('إقامات') !== -1) {
                    var card = p.closest('.card, .stat-card');
                    if (card && !card.querySelector('.v13-dash-report-btn')) {
                        var btnContainer = document.createElement('div');
                        btnContainer.style.marginTop = '8px';
                        btnContainer.innerHTML = '<button class="v13-dash-report-btn" onclick="printResidencyReport()"><i class="fas fa-print"></i> طباعة</button> ' +
                            '<button class="v13-dash-report-btn" onclick="downloadResidencyReport()"><i class="fas fa-download"></i> تحميل</button>';
                        card.querySelector('.stat-card, .card-body') ? card.querySelector('.stat-card, .card-body').appendChild(btnContainer) : card.appendChild(btnContainer);
                    }
                }
            });
        }

        // 2. Add report buttons to the employee section for residencies
        var employeesSection = document.getElementById('employees');
        if (employeesSection && !employeesSection.querySelector('.v13-residency-report-btns')) {
            var empCards = employeesSection.querySelectorAll('.stat-card p');
            empCards.forEach(function(p) {
                if (p.textContent.indexOf('إقامات') !== -1) {
                    var card = p.closest('.stat-card, .col-md-3');
                    if (card) {
                        var div = document.createElement('div');
                        div.className = 'v13-residency-report-btns';
                        div.style.marginTop = '8px';
                        div.innerHTML = '<button class="v13-dash-report-btn" onclick="printResidencyReport()" title="طباعة تقرير الإقامات"><i class="fas fa-print"></i></button> ' +
                            '<button class="v13-dash-report-btn" onclick="downloadResidencyReport()" title="تحميل تقرير الإقامات"><i class="fas fa-download"></i></button>';
                        card.appendChild(div);
                    }
                }
            });
        }

        // 3. Add unpaid invoices report buttons to contracts section
        var contractsSection = document.getElementById('contracts');
        if (contractsSection) {
            // Add to the unpaid contracts card
            var unpaidCard = document.getElementById('unpaidContractsCount');
            if (unpaidCard) {
                var card = unpaidCard.closest('.stat-card, .card');
                if (card && !card.querySelector('.v13-unpaid-btns')) {
                    var div = document.createElement('div');
                    div.className = 'v13-unpaid-btns';
                    div.style.marginTop = '8px';
                    div.innerHTML = '<button class="v13-dash-report-btn" onclick="printUnpaidInvoicesReport()" title="طباعة الفواتير غير المدفوعة"><i class="fas fa-print"></i></button> ' +
                        '<button class="v13-dash-report-btn" onclick="downloadUnpaidInvoicesReport()" title="تحميل الفواتير غير المدفوعة"><i class="fas fa-download"></i></button>';
                    card.appendChild(div);
                }
            }

            // Add to the expiring contracts card  
            var expiringCard = document.getElementById('expiringContractsCount');
            if (expiringCard) {
                var card2 = expiringCard.closest('.stat-card, .card');
                if (card2 && !card2.querySelector('.v13-expiring-btns')) {
                    var div2 = document.createElement('div');
                    div2.className = 'v13-expiring-btns';
                    div2.style.marginTop = '8px';
                    div2.innerHTML = '<button class="v13-dash-report-btn" onclick="printExpiringContractsReport(\'all\')" title="طباعة العقود القريبة من الانتهاء"><i class="fas fa-print"></i></button> ' +
                        '<button class="v13-dash-report-btn" onclick="downloadExpiringContractsReport(\'all\')" title="تحميل العقود القريبة من الانتهاء"><i class="fas fa-download"></i></button>';
                    card2.appendChild(div2);
                }
            }

            // Add comprehensive report buttons area after the contract stats
            var statsRow = contractsSection.querySelector('.row.g-3.mb-4');
            if (statsRow && !contractsSection.querySelector('.v13-contracts-reports')) {
                var reportsDiv = document.createElement('div');
                reportsDiv.className = 'card mb-3 v13-contracts-reports';
                reportsDiv.innerHTML = '<div class="card-body">' +
                    '<h6><i class="fas fa-file-alt me-2"></i>تقارير العقود</h6>' +
                    '<div class="v13-report-actions">' +
                    '<button class="btn btn-outline-danger btn-sm" onclick="printExpiringContractsReport(\'all\')"><i class="fas fa-print me-1"></i>طباعة العقود المنتهية/القريبة</button>' +
                    '<button class="btn btn-outline-danger btn-sm" onclick="downloadExpiringContractsReport(\'all\')"><i class="fas fa-download me-1"></i>تحميل العقود المنتهية/القريبة</button>' +
                    '<button class="btn btn-outline-success btn-sm" onclick="printExpiringContractsReport(\'paid\')"><i class="fas fa-print me-1"></i>طباعة المنتهية المدفوعة</button>' +
                    '<button class="btn btn-outline-success btn-sm" onclick="downloadExpiringContractsReport(\'paid\')"><i class="fas fa-download me-1"></i>تحميل المنتهية المدفوعة</button>' +
                    '<button class="btn btn-outline-warning btn-sm" onclick="printExpiringContractsReport(\'unpaid\')"><i class="fas fa-print me-1"></i>طباعة المنتهية غير المدفوعة</button>' +
                    '<button class="btn btn-outline-warning btn-sm" onclick="downloadExpiringContractsReport(\'unpaid\')"><i class="fas fa-download me-1"></i>تحميل المنتهية غير المدفوعة</button>' +
                    '<button class="btn btn-outline-info btn-sm" onclick="printUnpaidInvoicesReport()"><i class="fas fa-print me-1"></i>طباعة فواتير غير مدفوعة</button>' +
                    '<button class="btn btn-outline-info btn-sm" onclick="downloadUnpaidInvoicesReport()"><i class="fas fa-download me-1"></i>تحميل فواتير غير مدفوعة</button>' +
                    '</div></div>';
                statsRow.parentNode.insertBefore(reportsDiv, statsRow.nextSibling);
            }
        }

        // 4. Add disciplinary deduction button to payroll section
        var payrollSection = document.getElementById('payroll');
        if (payrollSection && !payrollSection.querySelector('.v13-deduction-btn-area')) {
            var payrollHeader = payrollSection.querySelector('.section-title, h2');
            if (payrollHeader) {
                var deductBtnArea = document.createElement('div');
                deductBtnArea.className = 'v13-deduction-btn-area mb-3';
                deductBtnArea.innerHTML = '<button class="btn btn-outline-danger" onclick="showDisciplinaryDeductionModal()">' +
                    '<i class="fas fa-gavel me-1"></i>خصومات تأديبية</button>';
                payrollHeader.parentNode.insertBefore(deductBtnArea, payrollHeader.nextSibling);
            }
        }

        // 5. Add residency report to employee section
        if (employeesSection && !employeesSection.querySelector('.v13-emp-reports')) {
            var empStatsRow = employeesSection.querySelector('.row.g-3');
            if (empStatsRow) {
                var empReportsDiv = document.createElement('div');
                empReportsDiv.className = 'card mb-3 v13-emp-reports';
                empReportsDiv.innerHTML = '<div class="card-body">' +
                    '<h6><i class="fas fa-id-card me-2"></i>تقارير الإقامات</h6>' +
                    '<div class="v13-report-actions">' +
                    '<button class="btn btn-outline-danger btn-sm" onclick="printResidencyReport()"><i class="fas fa-print me-1"></i>طباعة تقرير الإقامات</button>' +
                    '<button class="btn btn-outline-danger btn-sm" onclick="downloadResidencyReport()"><i class="fas fa-download me-1"></i>تحميل تقرير الإقامات</button>' +
                    '</div></div>';
                
                var insertAfter = empStatsRow.nextElementSibling || empStatsRow;
                empStatsRow.parentNode.insertBefore(empReportsDiv, insertAfter.nextSibling);
            }
        }
    }


    // ==========================================================
    // INITIALIZATION
    // ==========================================================
    function initV13() {
        console.log('🚀 V13: بدء التهيئة...');

        // Fix 1: Contract filtering
        fixContractFiltering();

        // Fix 2: Cross-browser login
        fixCrossBrowserLogin();

        // Fix 6: Enhanced employee printing
        enhanceEmployeePrinting();

        // Fix 7: Disciplinary deductions
        loadDeductionsFromFirebase();
        patchPayrollCalculation();

        // Fix 8: Mobile optimizations
        setupMobileOptimizations();

        // Add report buttons (delayed to ensure DOM is ready)
        setTimeout(function() {
            addReportButtons();
            addDeductionButtonToEmployees();
        }, 2000);

        // Re-add buttons after data loads
        var dataWatcher = setInterval(function() {
            if (window.employees && window.employees.length > 0) {
                clearInterval(dataWatcher);
                setTimeout(function() {
                    addReportButtons();
                    addDeductionButtonToEmployees();
                }, 500);
            }
        }, 3000);
        setTimeout(function() { clearInterval(dataWatcher); }, 60000);

        // Watch for table re-renders to re-add buttons
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.target.id === 'employees-table-body') {
                    setTimeout(addDeductionButtonToEmployees, 100);
                }
            });
        });
        var empTbody = document.getElementById('employees-table-body');
        if (empTbody) {
            observer.observe(empTbody, { childList: true });
        }

        // Handle window resize for mobile toggle
        window.addEventListener('resize', function() {
            var toggle = document.querySelector('.v13-mobile-toggle');
            var overlay = document.querySelector('.v13-mobile-overlay');
            if (window.innerWidth > 768) {
                if (toggle) toggle.style.display = 'none';
                if (overlay) { overlay.classList.remove('show'); overlay.style.display = 'none'; }
                var sidebar = document.querySelector('.sidebar');
                if (sidebar) sidebar.classList.remove('show');
            } else {
                if (toggle) toggle.style.display = 'flex';
                if (!toggle) setupMobileOptimizations();
            }
        });

        console.log('✅ V13: جميع التحسينات مفعلة بنجاح!');
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initV13, 800);
        });
    } else {
        setTimeout(initV13, 800);
    }

})();
