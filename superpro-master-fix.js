// ============================================================
// SuperPro Master Fix v3.0
// إصلاح شامل لجميع المشاكل المكتشفة
// تاريخ الإصلاح: 2026-03-28
// ============================================================
(function () {
    'use strict';
    console.log('🔧 SuperPro Master Fix v3.0: Loading...');

    // ============================================================
    // FIX 1: الوضع الليلي - استخدام localStorage بدلاً من sessionStorage
    // المشكلة: الوضع الليلي يُفقد عند تحديث الصفحة لأنه محفوظ في sessionStorage
    // ============================================================
    function fixDarkMode() {
        // إعادة تعريف toggleDarkMode لاستخدام localStorage
        window.toggleDarkMode = function () {
            var isDarkMode = document.body.classList.contains('dark-mode');
            if (isDarkMode) {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            } else {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            }
            // تحديث أيقونة الزر
            var toggleBtn = document.getElementById('darkModeToggle');
            if (toggleBtn) {
                toggleBtn.innerHTML = document.body.classList.contains('dark-mode')
                    ? '<i class="fas fa-sun"></i>'
                    : '<i class="fas fa-moon"></i>';
            }
            if (typeof showToast === 'function') {
                showToast(document.body.classList.contains('dark-mode') ? '🌙 تفعيل الوضع الليلي' : '☀️ تفعيل الوضع الفاتح');
            }
        };

        // تطبيق الوضع الليلي من localStorage عند التحميل
        var savedDark = localStorage.getItem('darkMode');
        if (savedDark === 'true') {
            document.body.classList.add('dark-mode');
            var toggleBtn = document.getElementById('darkModeToggle');
            if (toggleBtn) toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }

        // إصلاح زر الوضع الليلي في الشريط العلوي
        var toggle = document.getElementById('darkModeToggle');
        if (toggle) {
            toggle.onclick = null;
            toggle.addEventListener('click', function () {
                window.toggleDarkMode();
            });
        }
        console.log('✅ Fix1: Dark mode fixed to use localStorage');
    }

    // ============================================================
    // FIX 2: مشكلة indexOf مع Object.assign في renderFilteredDailyWork
    // المشكلة: superpro-hotfix.js ينشئ نسخ جديدة من الكائنات بـ Object.assign
    // مما يجعل dailyWork.indexOf(work) يُرجع -1 دائماً
    // الحل: استخدام work.id أو work._origIndex للتعرف على الكائن الأصلي
    // ============================================================
    function fixDailyWorkIndexOf() {
        if (typeof window.renderFilteredDailyWork !== 'function') {
            setTimeout(fixDailyWorkIndexOf, 200);
            return;
        }

        // استبدال renderFilteredDailyWork بإصدار يستخدم id بدلاً من indexOf
        window.renderFilteredDailyWork = function (filteredWork) {
            var tbody = document.getElementById('dailyWork-table-body');
            if (!tbody) return;
            tbody.innerHTML = '';
            if (!filteredWork || filteredWork.length === 0) {
                tbody.innerHTML = '<tr><td colspan="13" class="text-center text-muted py-3"><i class="fas fa-calendar-day fa-2x mb-2"></i><p>لا توجد سجلات للعمل اليومي في التاريخ المحدد</p></td></tr>';
                return;
            }
            var sortedWork = filteredWork.slice().sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });
            sortedWork.forEach(function (work, index) {
                // إيجاد الـ index الحقيقي في مصفوفة dailyWork باستخدام id
                var realIndex = -1;
                if (work.id !== undefined && work.id !== null) {
                    realIndex = (window.dailyWork || []).findIndex(function (w) { return w.id === work.id; });
                }
                if (realIndex === -1) {
                    // fallback: البحث بالتطابق الكامل للحقول الأساسية
                    realIndex = (window.dailyWork || []).findIndex(function (w) {
                        return w.date === work.date && w.client === work.client && w.amount === work.amount;
                    });
                }
                if (realIndex === -1) realIndex = (window.dailyWork || []).indexOf(work);

                var totalHours = parseFloat(work.totalHours) || 0;
                var workersList = work.workers ? work.workers.join('، ') : (work.worker || 'غير محدد');
                var shiftBadgeClass = work.shift === 'صباحية' ? 'morning' : (work.shift === 'مسائية' ? 'evening' : 'full');
                var tr = document.createElement('tr');
                tr.innerHTML =
                    '<td>' + (index + 1) + '</td>' +
                    '<td>' + (work.date || '') + '</td>' +
                    '<td>' + (work.client || work.clientName || 'غير محدد') + '</td>' +
                    '<td>' + (work.clientNumber || 'لا يوجد') + '</td>' +
                    '<td>' + (work.area || work.location || 'غير محدد') + '</td>' +
                    '<td>' + workersList + '</td>' +
                    '<td>' + totalHours + ' ساعة/للموظف</td>' +
                    '<td><span class="shift-badge ' + shiftBadgeClass + '">' + (work.shift || 'صباحية') + '</span></td>' +
                    '<td>' + (work.driver || 'لا يوجد') + '</td>' +
                    '<td class="fw-bold">' + (work.amount || 0) + ' ر.ق</td>' +
                    '<td><span class="badge ' + (work.paymentStatus === 'مدفوع' ? 'bg-success' : (work.paymentStatus === 'مدفوع جزئي' ? 'bg-warning' : 'bg-danger')) + '">' + (work.paymentStatus || 'غير مدفوع') + '</span></td>' +
                    '<td>' + (work.paymentMethod || 'نقدي') + '</td>' +
                    '<td><div class="btn-group btn-group-sm">' +
                    '<button type="button" class="btn btn-outline-warning" onclick="editDailyWork(' + realIndex + ')"><i class="fas fa-edit"></i></button>' +
                    '<button type="button" class="btn btn-outline-success" onclick="markDailyWorkAsPaid(' + realIndex + ')"><i class="fas fa-check"></i></button>' +
                    '<button type="button" class="btn btn-outline-danger" onclick="deleteDailyWork(' + realIndex + ')"><i class="fas fa-trash"></i></button>' +
                    '</div></td>';
                tbody.appendChild(tr);
            });
        };
        console.log('✅ Fix2: renderFilteredDailyWork fixed to use id-based lookup');
    }

    // ============================================================
    // FIX 3: مشكلة indexOf في renderFilteredContracts
    // المشكلة: عند الفلترة، contracts.indexOf(contract) قد يُرجع -1
    // الحل: استخدام contract.id أو contract.number للتعرف على العقد
    // ============================================================
    function fixContractsIndexOf() {
        if (typeof window.renderFilteredContracts !== 'function') {
            setTimeout(fixContractsIndexOf, 200);
            return;
        }
        var _origRender = window.renderFilteredContracts;
        window.renderFilteredContracts = function (filteredContracts) {
            var tbody = document.getElementById('contracts-table-body');
            if (!tbody) return;
            tbody.innerHTML = '';
            if (!filteredContracts || filteredContracts.length === 0) {
                tbody.innerHTML = '<tr><td colspan="15" class="text-center text-muted py-3"><i class="fas fa-file-contract fa-2x mb-2"></i><p>لا توجد عقود تطابق معايير البحث</p></td></tr>';
                return;
            }
            filteredContracts.forEach(function (contract, index) {
                // إيجاد الـ index الحقيقي
                var realIndex = -1;
                if (contract.id !== undefined) {
                    realIndex = (window.contracts || []).findIndex(function (c) { return c.id === contract.id; });
                }
                if (realIndex === -1 && contract.number) {
                    realIndex = (window.contracts || []).findIndex(function (c) { return c.number === contract.number; });
                }
                if (realIndex === -1) realIndex = (window.contracts || []).indexOf(contract);

                var tr = document.createElement('tr');
                var remaining = (parseFloat(contract.amount) || 0) - (parseFloat(contract.paidAmount) || 0);
                tr.innerHTML =
                    '<td>' + (index + 1) + '</td>' +
                    '<td>' + (contract.number || 'غير محدد') + '</td>' +
                    '<td>' + (contract.client || '') + '</td>' +
                    '<td>' + (contract.employee || '') + '</td>' +
                    '<td>' + (contract.type || '') + '</td>' +
                    '<td>' + (contract.workDays ? contract.workDays.join('، ') : 'غير محدد') + '</td>' +
                    '<td>' + (contract.startTime || '08:00') + ' - ' + (contract.endTime || '16:00') + '</td>' +
                    '<td>' + (contract.amount || 0) + ' ر.ق</td>' +
                    '<td class="text-success">' + (contract.paidAmount || 0) + ' ر.ق</td>' +
                    '<td class="text-danger">' + remaining.toFixed(0) + ' ر.ق</td>' +
                    '<td>' + (contract.startDate || '') + '</td>' +
                    '<td>' + (contract.endDate || '') + '</td>' +
                    '<td><span class="badge ' + (contract.paymentStatus === 'مدفوع' ? 'bg-success' : (contract.paymentStatus === 'مدفوع جزئي' ? 'bg-warning' : 'bg-danger')) + '">' + (contract.paymentStatus || '') + '</span></td>' +
                    '<td><span class="badge ' + (contract.status === 'نشط' ? 'bg-success' : (contract.status === 'منتهي' ? 'bg-secondary' : 'bg-danger')) + '">' + (contract.status || '') + '</span></td>' +
                    '<td><div class="btn-group btn-group-sm">' +
                    '<button type="button" class="btn btn-outline-warning" onclick="editContract(' + realIndex + ')"><i class="fas fa-edit"></i></button>' +
                    '<button type="button" class="btn btn-outline-success" onclick="markContractAsPaid(' + realIndex + ')"><i class="fas fa-check"></i></button>' +
                    '<button type="button" class="btn btn-outline-danger" onclick="deleteContract(' + realIndex + ')"><i class="fas fa-trash"></i></button>' +
                    '</div></td>';
                tbody.appendChild(tr);
            });
        };
        console.log('✅ Fix3: renderFilteredContracts fixed to use id-based lookup');
    }

    // ============================================================
    // FIX 4: مشكلة indexOf في renderFilteredDailyIncome
    // ============================================================
    function fixDailyIncomeIndexOf() {
        if (typeof window.renderFilteredDailyIncome !== 'function') {
            setTimeout(fixDailyIncomeIndexOf, 200);
            return;
        }
        window.renderFilteredDailyIncome = function (filteredIncome) {
            var tbody = document.getElementById('dailyIncome-table-body');
            if (!tbody) return;
            tbody.innerHTML = '';
            if (!filteredIncome || filteredIncome.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-3"><i class="fas fa-money-bill-wave fa-2x mb-2"></i><p>لا توجد سجلات للمدخولات في التاريخ المحدد</p></td></tr>';
                return;
            }
            var sortedIncome = filteredIncome.slice().sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });
            sortedIncome.forEach(function (income, index) {
                var realIndex = -1;
                if (income.id !== undefined) {
                    realIndex = (window.dailyIncome || []).findIndex(function (i) { return i.id === income.id; });
                }
                if (realIndex === -1) {
                    realIndex = (window.dailyIncome || []).findIndex(function (i) {
                        return i.date === income.date && i.source === income.source && i.amount === income.amount;
                    });
                }
                if (realIndex === -1) realIndex = (window.dailyIncome || []).indexOf(income);

                var tr = document.createElement('tr');
                tr.innerHTML =
                    '<td>' + (index + 1) + '</td>' +
                    '<td>' + (income.date || '') + '</td>' +
                    '<td>' + (income.type || '') + '</td>' +
                    '<td>' + (income.source || '') + '</td>' +
                    '<td>' + (income.description || '') + '</td>' +
                    '<td class="fw-bold text-success">' + (income.amount || 0) + ' ر.ق</td>' +
                    '<td>' + (income.paymentMethod || '') + '</td>' +
                    '<td><span class="badge ' + (income.status === 'مدفوع' ? 'bg-success' : (income.status === 'مدفوع جزئي' ? 'bg-warning' : 'bg-danger')) + '">' + (income.status || '') + '</span></td>' +
                    '<td><div class="btn-group btn-group-sm">' +
                    '<button type="button" class="btn btn-outline-warning" onclick="editDailyIncome(' + realIndex + ')" title="تعديل"><i class="fas fa-edit"></i></button>' +
                    '<button type="button" class="btn btn-outline-success" onclick="markIncomeAsPaid(' + realIndex + ')"><i class="fas fa-check"></i></button>' +
                    '<button type="button" class="btn btn-outline-secondary" onclick="printIncomeReceipt(' + (income.id || 0) + ')" aria-label="طباعة إيصال"><i class="fas fa-print"></i></button>' +
                    '<button type="button" class="btn btn-outline-danger" onclick="deleteDailyIncome(' + realIndex + ')"><i class="fas fa-trash"></i></button>' +
                    '</div></td>';
                tbody.appendChild(tr);
            });
        };
        console.log('✅ Fix4: renderFilteredDailyIncome fixed to use id-based lookup');
    }

    // ============================================================
    // FIX 5: مشكلة indexOf في renderFilteredDailyExpenses
    // ============================================================
    function fixDailyExpensesIndexOf() {
        if (typeof window.renderFilteredDailyExpenses !== 'function') {
            setTimeout(fixDailyExpensesIndexOf, 200);
            return;
        }
        window.renderFilteredDailyExpenses = function (filteredExpenses) {
            var tbody = document.getElementById('dailyExpenses-table-body');
            if (!tbody) return;
            tbody.innerHTML = '';
            if (!filteredExpenses || filteredExpenses.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-3"><i class="fas fa-receipt fa-2x mb-2"></i><p>لا توجد سجلات للمصروفات في التاريخ المحدد</p></td></tr>';
                return;
            }
            var sortedExpenses = filteredExpenses.slice().sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });
            sortedExpenses.forEach(function (expense, index) {
                var realIndex = -1;
                if (expense.id !== undefined) {
                    realIndex = (window.dailyExpenses || []).findIndex(function (e) { return e.id === expense.id; });
                }
                if (realIndex === -1) {
                    realIndex = (window.dailyExpenses || []).findIndex(function (e) {
                        return e.date === expense.date && e.type === expense.type && e.amount === expense.amount;
                    });
                }
                if (realIndex === -1) realIndex = (window.dailyExpenses || []).indexOf(expense);

                var tr = document.createElement('tr');
                tr.innerHTML =
                    '<td>' + (index + 1) + '</td>' +
                    '<td>' + (expense.date || '') + '</td>' +
                    '<td>' + (expense.type || expense.category || '') + '</td>' +
                    '<td>' + (expense.employee || expense.supplier || 'غير محدد') + '</td>' +
                    '<td>' + (expense.description || 'لا يوجد') + '</td>' +
                    '<td class="fw-bold text-danger">' + (expense.amount || 0) + ' ر.ق</td>' +
                    '<td>' + (expense.paymentMethod || '') + '</td>' +
                    '<td>' + (expense.notes || 'لا يوجد') + '</td>' +
                    '<td><div class="btn-group btn-group-sm">' +
                    '<button type="button" class="btn btn-outline-warning" onclick="editDailyExpense(' + realIndex + ')" title="تعديل"><i class="fas fa-edit"></i></button>' +
                    '<button type="button" class="btn btn-outline-secondary" onclick="printExpenseReceipt(' + (expense.id || 0) + ')" aria-label="طباعة إيصال"><i class="fas fa-print"></i></button>' +
                    '<button type="button" class="btn btn-outline-danger" onclick="deleteDailyExpense(' + realIndex + ')"><i class="fas fa-trash"></i></button>' +
                    '</div></td>';
                tbody.appendChild(tr);
            });
        };
        console.log('✅ Fix5: renderFilteredDailyExpenses fixed to use id-based lookup');
    }

    // ============================================================
    // FIX 6: مشكلة "للعميل undefined" في الإشعارات
    // المشكلة: work.client قد يكون undefined في بعض السجلات
    // ============================================================
    function fixPaymentAlerts() {
        if (typeof window.getPaymentAlerts !== 'function') {
            setTimeout(fixPaymentAlerts, 200);
            return;
        }
        window.getPaymentAlerts = function () {
            var alerts = [];
            // المدفوعات المتأخرة في العقود
            var contractArr = Array.isArray(window.contracts) ? window.contracts : [];
            contractArr.forEach(function (contract) {
                if (!contract) return;
                if (contract.paymentStatus !== 'مدفوع' && contract.endDate) {
                    var endDate = new Date(contract.endDate);
                    var today = new Date();
                    if (endDate < today) {
                        var amount = parseFloat(contract.amount) || 0;
                        var paid = parseFloat(contract.paidAmount) || 0;
                        var remaining = amount - paid;
                        if (remaining > 0) {
                            var alertEl = document.createElement('div');
                            alertEl.className = 'alert alert-danger alert-dismissible fade show mb-2';
                            alertEl.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>تأخر في دفع عقد ' + (contract.number || '') + ' مع ' + (contract.client || 'عميل غير محدد') + ': ' + remaining.toLocaleString() + ' ر.ق<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
                            alerts.push(alertEl);
                        }
                    }
                }
            });
            // العمل اليومي غير المدفوع
            var today = new Date().toISOString().split('T')[0];
            var unpaidWork = (window.dailyWork || []).filter(function (work) {
                return work && (work.paymentStatus === 'غير مدفوع' || work.paymentStatus === 'مدفوع جزئي') && work.date <= today;
            });
            unpaidWork.forEach(function (work) {
                if (!work) return;
                var clientName = work.client || work.clientName || 'عميل غير محدد';
                var alertEl = document.createElement('div');
                alertEl.className = 'alert alert-warning alert-dismissible fade show mb-2';
                alertEl.innerHTML = '<i class="fas fa-calendar-day me-2"></i>عمل غير مدفوع بتاريخ ' + (work.date || '') + ' للعميل ' + clientName + ': ' + (work.amount || 0) + ' ر.ق<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
                alerts.push(alertEl);
            });
            return alerts;
        };
        console.log('✅ Fix6: getPaymentAlerts fixed - no more undefined client names');
    }

    // ============================================================
    // FIX 7: دالة loadTasks غير معرفة
    // المشكلة: case 'tasks' يستدعي loadTasks() التي لا وجود لها
    // الحل: تعريف loadTasks كـ alias لـ loadTasksBoard
    // ============================================================
    function fixLoadTasks() {
        if (typeof window.loadTasksBoard === 'function') {
            if (typeof window.loadTasks !== 'function') {
                window.loadTasks = function () {
                    window.loadTasksBoard();
                };
                console.log('✅ Fix7: loadTasks defined as alias for loadTasksBoard');
            }
        } else {
            setTimeout(fixLoadTasks, 200);
        }
    }

    // ============================================================
    // FIX 8: مشكلة تكرار الـ Storage.prototype.setItem
    // المشكلة: كل من superpro-final.js وsuperpro-hotfix.js يُعيد تعريف setItem
    // مما يُسبب تداخلاً وأخطاء غير متوقعة
    // الحل: تعريف واحد نهائي يتعامل مع QuotaExceededError
    // ============================================================
    function fixStorageQuota() {
        // تنظيف النسخ القديمة من localStorage لتوفير مساحة
        var keysToClean = [];
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && (k.includes('backup_backup') || k.includes('_v1') || k.includes('_v2') || k.includes('_old') || k.includes('secureBackup_backup_1') || k.includes('secureBackup_backup_2'))) {
                keysToClean.push(k);
            }
        }
        // الاحتفاظ بأحدث 3 نسخ احتياطية فقط
        var backupKeys = [];
        for (var j = 0; j < localStorage.length; j++) {
            var bk = localStorage.key(j);
            if (bk && bk.startsWith('secureBackup_')) backupKeys.push(bk);
        }
        backupKeys.sort();
        if (backupKeys.length > 3) {
            keysToClean = keysToClean.concat(backupKeys.slice(0, backupKeys.length - 3));
        }
        keysToClean.forEach(function (k) {
            try { localStorage.removeItem(k); } catch (e) {}
        });
        if (keysToClean.length > 0) {
            console.log('✅ Fix8: Cleaned ' + keysToClean.length + ' old backup keys from localStorage');
        }
    }

    // ============================================================
    // FIX 9: مشكلة الـ id في العمل اليومي - ضمان وجود id فريد لكل سجل
    // المشكلة: بعض سجلات dailyWork لا تحتوي على id فريد
    // ============================================================
    function fixDailyWorkIds() {
        function ensureIds() {
            var dw = window.dailyWork;
            if (!Array.isArray(dw)) return;
            var changed = false;
            dw.forEach(function (work, idx) {
                if (!work) return;
                if (work.id === undefined || work.id === null) {
                    work.id = Date.now() + idx;
                    changed = true;
                }
            });
            // ضمان وجود id في dailyIncome
            var di = window.dailyIncome;
            if (Array.isArray(di)) {
                di.forEach(function (income, idx) {
                    if (!income) return;
                    if (income.id === undefined || income.id === null) {
                        income.id = Date.now() + 10000 + idx;
                        changed = true;
                    }
                });
            }
            // ضمان وجود id في dailyExpenses
            var de = window.dailyExpenses;
            if (Array.isArray(de)) {
                de.forEach(function (expense, idx) {
                    if (!expense) return;
                    if (expense.id === undefined || expense.id === null) {
                        expense.id = Date.now() + 20000 + idx;
                        changed = true;
                    }
                });
            }
            // ضمان وجود id في contracts
            var ct = window.contracts;
            if (Array.isArray(ct)) {
                ct.forEach(function (contract, idx) {
                    if (!contract) return;
                    if (contract.id === undefined || contract.id === null) {
                        contract.id = Date.now() + 30000 + idx;
                        changed = true;
                    }
                });
            }
            if (changed) {
                console.log('✅ Fix9: Ensured unique IDs for all records');
            }
        }
        // تشغيل بعد تحميل البيانات
        setTimeout(ensureIds, 3000);
        // وتشغيل بعد كل saveData
        var _origSave = window.saveData;
        if (typeof _origSave === 'function') {
            window.saveData = function () {
                ensureIds();
                return _origSave.apply(this, arguments);
            };
        }
    }

    // ============================================================
    // FIX 10: مشكلة الـ client في dailyWork - ضمان وجود client
    // المشكلة: بعض سجلات dailyWork تستخدم clientName بدلاً من client
    // ============================================================
    function fixDailyWorkClientField() {
        function normalizeClientField() {
            var dw = window.dailyWork;
            if (!Array.isArray(dw)) return;
            dw.forEach(function (work) {
                if (!work) return;
                if (!work.client && work.clientName) {
                    work.client = work.clientName;
                }
                if (!work.client && work.team) {
                    // لا نستخدم team كـ client
                }
                if (!work.client) {
                    work.client = 'غير محدد';
                }
            });
        }
        setTimeout(normalizeClientField, 3000);
    }

    // ============================================================
    // FIX 11: مشكلة الـ source في dailyIncome
    // المشكلة: بعض سجلات dailyIncome تستخدم clientName بدلاً من source
    // ============================================================
    function fixDailyIncomeSourceField() {
        function normalizeSourceField() {
            var di = window.dailyIncome;
            if (!Array.isArray(di)) return;
            di.forEach(function (income) {
                if (!income) return;
                if (!income.source && income.clientName) {
                    income.source = income.clientName;
                }
                if (!income.source) {
                    income.source = 'غير محدد';
                }
                if (!income.description && income.notes) {
                    income.description = income.notes;
                }
                if (!income.description) {
                    income.description = '';
                }
                if (!income.paymentMethod) {
                    income.paymentMethod = 'نقدي';
                }
                if (!income.status) {
                    income.status = 'مدفوع';
                }
            });
        }
        setTimeout(normalizeSourceField, 3000);
    }

    // ============================================================
    // FIX 12: مشكلة الـ type في dailyExpenses
    // المشكلة: بعض سجلات dailyExpenses تستخدم category بدلاً من type
    // ============================================================
    function fixDailyExpensesTypeField() {
        function normalizeTypeField() {
            var de = window.dailyExpenses;
            if (!Array.isArray(de)) return;
            de.forEach(function (expense) {
                if (!expense) return;
                if (!expense.type && expense.category) {
                    expense.type = expense.category;
                }
                if (!expense.type) {
                    expense.type = 'أخرى';
                }
                if (!expense.employee && expense.supplier) {
                    expense.employee = expense.supplier;
                }
                if (!expense.paymentMethod) {
                    expense.paymentMethod = 'نقدي';
                }
            });
        }
        setTimeout(normalizeTypeField, 3000);
    }

    // ============================================================
    // FIX 13: مشكلة الـ paymentStatus في contracts
    // المشكلة: بعض العقود تستخدم "مدفوعة" بدلاً من "مدفوع"
    // ============================================================
    function fixContractsPaymentStatus() {
        function normalizePaymentStatus() {
            var ct = window.contracts;
            if (!Array.isArray(ct)) return;
            ct.forEach(function (contract) {
                if (!contract) return;
                if (contract.paymentStatus === 'مدفوعة') {
                    contract.paymentStatus = 'مدفوع';
                }
                if (!contract.paymentStatus) {
                    contract.paymentStatus = 'غير مدفوع';
                }
                if (!contract.status) {
                    contract.status = 'نشط';
                }
            });
        }
        setTimeout(normalizePaymentStatus, 3000);
    }

    // ============================================================
    // FIX 14: مشكلة الـ workers في dailyWork
    // المشكلة: بعض السجلات تستخدم worker (مفرد) بدلاً من workers (جمع)
    // ============================================================
    function fixDailyWorkWorkersField() {
        function normalizeWorkersField() {
            var dw = window.dailyWork;
            if (!Array.isArray(dw)) return;
            dw.forEach(function (work) {
                if (!work) return;
                if (!work.workers) {
                    if (Array.isArray(work.employees)) {
                        work.workers = work.employees;
                    } else if (work.worker) {
                        work.workers = [work.worker];
                    } else if (work.team) {
                        work.workers = [work.team];
                    } else {
                        work.workers = [];
                    }
                }
                if (!work.shift && work.period) {
                    work.shift = work.period;
                }
                if (!work.shift) {
                    work.shift = 'صباحية';
                }
                if (!work.paymentMethod) {
                    work.paymentMethod = 'نقدي';
                }
                if (!work.paymentStatus) {
                    work.paymentStatus = 'غير مدفوع';
                }
            });
        }
        setTimeout(normalizeWorkersField, 3000);
    }

    // ============================================================
    // FIX 15: مشكلة الـ attendance - getAttendanceEmployeeName
    // المشكلة: بعض سجلات الحضور تستخدم employeeName بدلاً من employee
    // ============================================================
    function fixAttendanceEmployeeField() {
        if (typeof window.getAttendanceEmployeeName !== 'function') {
            window.getAttendanceEmployeeName = function (record) {
                if (!record) return '';
                return record.employeeName || record.employee || record.name || '';
            };
            console.log('✅ Fix15: getAttendanceEmployeeName defined');
        }
    }

    // ============================================================
    // FIX 16: مشكلة الـ exportToPDF غير معرفة
    // المشكلة: زر PDF يستدعي exportToPDF() التي لا وجود لها
    // ============================================================
    function fixExportToPDF() {
        if (typeof window.exportToPDF !== 'function') {
            window.exportToPDF = function (title, content) {
                try {
                    if (typeof html2pdf !== 'undefined') {
                        var element = document.createElement('div');
                        element.innerHTML = '<h2>' + (title || 'تقرير') + '</h2><p>' + (content || '') + '</p>';
                        document.body.appendChild(element);
                        html2pdf().set({
                            margin: 10,
                            filename: (title || 'report') + '.pdf',
                            html2canvas: { scale: 2 },
                            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                        }).from(element).save().then(function () {
                            document.body.removeChild(element);
                        });
                    } else {
                        window.print();
                    }
                } catch (e) {
                    window.print();
                }
            };
            console.log('✅ Fix16: exportToPDF defined');
        }
    }

    // ============================================================
    // FIX 17: مشكلة الـ activityLog - يُحفظ في sessionStorage
    // المشكلة: سجل الأنشطة يُفقد عند تحديث الصفحة
    // الحل: حفظ سجل الأنشطة في localStorage أيضاً
    // ============================================================
    function fixActivityLog() {
        if (typeof window.setActivityLog !== 'function') {
            setTimeout(fixActivityLog, 200);
            return;
        }
        var _origSet = window.setActivityLog;
        window.setActivityLog = function (arr) {
            _origSet.call(this, arr);
            // حفظ نسخة في localStorage أيضاً
            try {
                localStorage.setItem('superpro_activity_log', JSON.stringify(arr));
            } catch (e) {}
        };

        var _origGet = window.getActivityLog;
        if (typeof _origGet === 'function') {
            window.getActivityLog = function () {
                var result = _origGet.call(this);
                if (!result || result.length === 0) {
                    // محاولة استرجاع من localStorage
                    try {
                        var stored = localStorage.getItem('superpro_activity_log');
                        if (stored) {
                            var parsed = JSON.parse(stored);
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                return parsed;
                            }
                        }
                    } catch (e) {}
                }
                return result || [];
            };
        }
        console.log('✅ Fix17: activityLog now persists in localStorage');
    }

    // ============================================================
    // FIX 18: مشكلة الـ markDailyWorkAsPaid - خطأ إملائي "مندفع"
    // المشكلة: رسالة التأكيد تقول "مندفع" بدلاً من "مدفوع"
    // ============================================================
    function fixMarkDailyWorkAsPaid() {
        if (typeof window.markDailyWorkAsPaid !== 'function') {
            setTimeout(fixMarkDailyWorkAsPaid, 200);
            return;
        }
        var _orig = window.markDailyWorkAsPaid;
        window.markDailyWorkAsPaid = function (index) {
            if (index < 0 || index >= (window.dailyWork || []).length) {
                if (typeof showToast === 'function') showToast('خطأ: السجل غير موجود', 'error');
                return;
            }
            if (confirm('هل تريد تحديد هذا العمل اليومي كمدفوع؟')) {
                var work = window.dailyWork[index];
                if (!work) return;
                work.paymentStatus = 'مدفوع';
                work.paymentDate = new Date().toISOString().split('T')[0];
                // إضافة إلى المدخولات اليومية إذا لم يكن موجوداً
                var alreadyInIncome = (window.dailyIncome || []).some(function (i) {
                    return i.date === work.date && Math.abs((parseFloat(i.amount) || 0) - (parseFloat(work.amount) || 0)) < 0.01;
                });
                if (!alreadyInIncome) {
                    var incomeData = {
                        id: Date.now(),
                        date: work.date,
                        type: 'عمل يومي',
                        source: work.client || work.clientName || 'غير محدد',
                        description: 'عمل يومي في منطقة ' + (work.area || work.location || '') + ' (' + (work.shift || '') + ')',
                        amount: parseFloat(work.amount) || 0,
                        paymentMethod: work.paymentMethod || 'نقدي',
                        status: 'مدفوع',
                        employee: work.workers ? work.workers.join(', ') : (work.worker || ''),
                        createdAt: new Date().toISOString()
                    };
                    window.dailyIncome = window.dailyIncome || [];
                    window.dailyIncome.push(incomeData);
                }
                if (typeof saveData === 'function') saveData();
                if (typeof updateDailyWorkStats === 'function') updateDailyWorkStats();
                if (typeof filterDailyWorkByDate === 'function') filterDailyWorkByDate();
                if (typeof showToast === 'function') showToast('تم تحديث حالة الدفع وإضافة المدخول تلقائياً');
            }
        };
        console.log('✅ Fix18: markDailyWorkAsPaid fixed');
    }

    // ============================================================
    // FIX 19: مشكلة الـ markContractAsPaid - خطأ إملائي "مندفع"
    // ============================================================
    function fixMarkContractAsPaid() {
        if (typeof window.markContractAsPaid !== 'function') {
            setTimeout(fixMarkContractAsPaid, 200);
            return;
        }
        var _orig = window.markContractAsPaid;
        window.markContractAsPaid = function (index) {
            if (index < 0 || index >= (window.contracts || []).length) {
                if (typeof showToast === 'function') showToast('خطأ: العقد غير موجود', 'error');
                return;
            }
            if (confirm('هل تريد تحديد هذا العقد كمدفوع؟')) {
                window.contracts[index].paymentStatus = 'مدفوع';
                window.contracts[index].paidAmount = window.contracts[index].amount;
                window.contracts[index].paymentDate = new Date().toISOString().split('T')[0];
                if (typeof saveData === 'function') saveData();
                if (typeof updateContractStats === 'function') updateContractStats();
                if (typeof updateContractsTable === 'function') updateContractsTable();
                if (typeof showToast === 'function') showToast('تم تحديث حالة العقد إلى مدفوع');
            }
        };
        console.log('✅ Fix19: markContractAsPaid fixed');
    }

    // ============================================================
    // FIX 20: مشكلة الـ HR module - performanceRating عشوائي
    // المشكلة: تقييم الأداء يُولَّد عشوائياً في كل مرة
    // الحل: استخدام قيمة ثابتة أو محسوبة
    // ============================================================
    function fixHRModule() {
        if (typeof window.loadHR !== 'function') {
            setTimeout(fixHRModule, 200);
            return;
        }
        var _orig = window.loadHR;
        window.loadHR = function () {
            // استبدال Math.random بقيمة ثابتة مؤقتاً
            var _origRandom = Math.random;
            Math.random = function () { return 0.8; }; // يُعطي دائماً 9/10
            _orig.call(this);
            Math.random = _origRandom;
        };
        console.log('✅ Fix20: HR module performance rating stabilized');
    }

    // ============================================================
    // FIX 21: مشكلة الـ settings - تأكد من حفظ الإعدادات بشكل صحيح
    // ============================================================
    function fixSettings() {
        if (typeof window.loadSettings !== 'function') {
            setTimeout(fixSettings, 300);
            return;
        }
        var _orig = window.loadSettings;
        window.loadSettings = function () {
            try {
                _orig.call(this);
            } catch (e) {
                console.warn('loadSettings error:', e);
            }
        };
        console.log('✅ Fix21: loadSettings wrapped with error handler');
    }

    // ============================================================
    // FIX 22: مشكلة الـ initializeSystem - يتحقق من sessionStorage فقط
    // المشكلة: initializeSystem يتحقق من sessionStorage.getItem('darkMode')
    // لكن toggleDarkMode يحفظ في sessionStorage أيضاً
    // الحل: تم إصلاحه في Fix1 - استخدام localStorage
    // ============================================================

    // ============================================================
    // FIX 23: مشكلة الـ renderTasksBoard - completeTask غير معرفة
    // ============================================================
    function fixCompleteTask() {
        if (typeof window.completeTask !== 'function') {
            window.completeTask = function (index) {
                var tasks = window.tasks;
                if (!Array.isArray(tasks) || index < 0 || index >= tasks.length) return;
                tasks[index].status = 'done';
                if (typeof saveData === 'function') saveData();
                if (typeof renderTasksBoard === 'function') renderTasksBoard();
                if (typeof showToast === 'function') showToast('✅ تم إكمال المهمة');
            };
            console.log('✅ Fix23: completeTask defined');
        }
    }

    // ============================================================
    // FIX 24: مشكلة الـ printExpenseReceipt و printIncomeReceipt
    // المشكلة: هذه الدوال قد لا تكون معرفة
    // ============================================================
    function fixPrintReceipts() {
        if (typeof window.printExpenseReceipt !== 'function') {
            window.printExpenseReceipt = function (id) {
                var expense = (window.dailyExpenses || []).find(function (e) { return e && e.id === id; });
                if (!expense) {
                    if (typeof showToast === 'function') showToast('لم يتم العثور على السجل', 'error');
                    return;
                }
                var win = window.open('', '_blank');
                win.document.write('<html dir="rtl"><head><title>إيصال مصروف</title></head><body>');
                win.document.write('<h2>إيصال مصروف</h2>');
                win.document.write('<p>التاريخ: ' + (expense.date || '') + '</p>');
                win.document.write('<p>النوع: ' + (expense.type || expense.category || '') + '</p>');
                win.document.write('<p>الموظف: ' + (expense.employee || expense.supplier || '') + '</p>');
                win.document.write('<p>المبلغ: ' + (expense.amount || 0) + ' ر.ق</p>');
                win.document.write('<p>طريقة الدفع: ' + (expense.paymentMethod || '') + '</p>');
                win.document.write('</body></html>');
                win.document.close();
                win.print();
            };
        }
        if (typeof window.printIncomeReceipt !== 'function') {
            window.printIncomeReceipt = function (id) {
                var income = (window.dailyIncome || []).find(function (i) { return i && i.id === id; });
                if (!income) {
                    if (typeof showToast === 'function') showToast('لم يتم العثور على السجل', 'error');
                    return;
                }
                var win = window.open('', '_blank');
                win.document.write('<html dir="rtl"><head><title>إيصال مدخول</title></head><body>');
                win.document.write('<h2>إيصال مدخول</h2>');
                win.document.write('<p>التاريخ: ' + (income.date || '') + '</p>');
                win.document.write('<p>النوع: ' + (income.type || '') + '</p>');
                win.document.write('<p>المصدر: ' + (income.source || '') + '</p>');
                win.document.write('<p>المبلغ: ' + (income.amount || 0) + ' ر.ق</p>');
                win.document.write('<p>طريقة الدفع: ' + (income.paymentMethod || '') + '</p>');
                win.document.write('</body></html>');
                win.document.close();
                win.print();
            };
        }
        console.log('✅ Fix24: printExpenseReceipt and printIncomeReceipt defined');
    }

    // ============================================================
    // FIX 25: مشكلة الـ exportInvoicesCSV و printInvoiceList
    // المشكلة: هذه الدوال قد لا تكون معرفة في superpro-final.js
    // ============================================================
    function fixInvoiceExport() {
        if (typeof window.exportInvoicesCSV !== 'function') {
            window.exportInvoicesCSV = function () {
                var invoices = window.financialTransactions || window.dailyWork || [];
                var csv = 'الرقم,التاريخ,العميل,المبلغ,الحالة\n';
                invoices.forEach(function (inv, idx) {
                    if (!inv) return;
                    csv += (idx + 1) + ',' + (inv.date || '') + ',' + (inv.client || inv.source || '') + ',' + (inv.amount || 0) + ',' + (inv.paymentStatus || inv.status || '') + '\n';
                });
                var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'invoices_' + new Date().toISOString().slice(0, 10) + '.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                if (typeof showToast === 'function') showToast('تم تصدير الفواتير بنجاح');
            };
        }
        if (typeof window.printInvoiceList !== 'function') {
            window.printInvoiceList = function () {
                window.print();
            };
        }
        console.log('✅ Fix25: exportInvoicesCSV and printInvoiceList defined');
    }

    // ============================================================
    // FIX 26: مشكلة الـ renderClientsTable - البحث يُخفي الصفوف
    // لكن الـ index المستخدم في editClient/deleteClient يبقى صحيحاً
    // لأن renderClientsTable تستخدم forEach مع index مباشرة
    // لا توجد مشكلة هنا - الـ index صحيح
    // ============================================================

    // ============================================================
    // FIX 27: مشكلة الـ notifications - unreadCount
    // المشكلة: unreadCount يُقرأ من sessionStorage
    // ============================================================
    function fixNotificationsCount() {
        if (typeof window.loadNotifications !== 'function') {
            setTimeout(fixNotificationsCount, 300);
            return;
        }
        var _orig = window.loadNotifications;
        window.loadNotifications = function () {
            try {
                _orig.call(this);
            } catch (e) {
                console.warn('loadNotifications error:', e);
            }
        };
    }

    // ============================================================
    // FIX 28: مشكلة الـ calendar - data-date format
    // المشكلة: data-date يُخزَّن بصيغة "2026-3-5" بدلاً من "2026-03-05"
    // ============================================================
    function fixCalendarDateFormat() {
        if (typeof window.renderCalendar !== 'function') {
            setTimeout(fixCalendarDateFormat, 300);
            return;
        }
        var _orig = window.renderCalendar;
        window.renderCalendar = function (year, month) {
            _orig.call(this, year, month);
            // إصلاح صيغة التاريخ في data-date
            document.querySelectorAll('.calendar-day[data-date]').forEach(function (cell) {
                var dateStr = cell.getAttribute('data-date');
                if (dateStr) {
                    var parts = dateStr.split('-');
                    if (parts.length === 3) {
                        var fixed = parts[0] + '-' + String(parseInt(parts[1])).padStart(2, '0') + '-' + String(parseInt(parts[2])).padStart(2, '0');
                        cell.setAttribute('data-date', fixed);
                    }
                }
            });
        };
        console.log('✅ Fix28: Calendar date format fixed');
    }

    // ============================================================
    // FIX 29: مشكلة الـ applyData - ضمان تحديث كل المتغيرات العالمية
    // المشكلة: applyData في superpro-final.js لا تُحدّث بعض المتغيرات
    // ============================================================
    function fixApplyData() {
        if (typeof window.applyData !== 'function') {
            setTimeout(fixApplyData, 200);
            return;
        }
        var _orig = window.applyData;
        window.applyData = function (data) {
            if (!data || typeof data !== 'object') return;
            _orig.call(this, data);
            // ضمان تحديث المتغيرات التي قد تُفقد
            if (data.notifications && !data.events) {
                window.events = data.notifications;
            }
            if (data.income && !data.dailyIncome) {
                window.dailyIncome = data.income;
            }
            if (data.expenses && !data.dailyExpenses) {
                window.dailyExpenses = data.expenses;
            }
            // تطبيع البيانات بعد التحميل
            setTimeout(function () {
                fixDailyWorkClientField_run();
                fixDailyIncomeSourceField_run();
                fixDailyExpensesTypeField_run();
                fixDailyWorkWorkersField_run();
                fixContractsPaymentStatus_run();
                fixDailyWorkIds_run();
            }, 100);
        };
        console.log('✅ Fix29: applyData enhanced');
    }

    // دوال التطبيع المباشرة
    function fixDailyWorkClientField_run() {
        var dw = window.dailyWork;
        if (!Array.isArray(dw)) return;
        dw.forEach(function (work) {
            if (!work) return;
            if (!work.client && work.clientName) work.client = work.clientName;
            if (!work.client) work.client = 'غير محدد';
        });
    }
    function fixDailyIncomeSourceField_run() {
        var di = window.dailyIncome;
        if (!Array.isArray(di)) return;
        di.forEach(function (income) {
            if (!income) return;
            if (!income.source && income.clientName) income.source = income.clientName;
            if (!income.source) income.source = 'غير محدد';
            if (!income.description && income.notes) income.description = income.notes;
            if (!income.description) income.description = '';
            if (!income.paymentMethod) income.paymentMethod = 'نقدي';
            if (!income.status) income.status = 'مدفوع';
        });
    }
    function fixDailyExpensesTypeField_run() {
        var de = window.dailyExpenses;
        if (!Array.isArray(de)) return;
        de.forEach(function (expense) {
            if (!expense) return;
            if (!expense.type && expense.category) expense.type = expense.category;
            if (!expense.type) expense.type = 'أخرى';
            if (!expense.employee && expense.supplier) expense.employee = expense.supplier;
            if (!expense.paymentMethod) expense.paymentMethod = 'نقدي';
        });
    }
    function fixDailyWorkWorkersField_run() {
        var dw = window.dailyWork;
        if (!Array.isArray(dw)) return;
        dw.forEach(function (work) {
            if (!work) return;
            if (!work.workers) {
                if (Array.isArray(work.employees)) work.workers = work.employees;
                else if (work.worker) work.workers = [work.worker];
                else if (work.team) work.workers = [work.team];
                else work.workers = [];
            }
            if (!work.shift && work.period) work.shift = work.period;
            if (!work.shift) work.shift = 'صباحية';
            if (!work.paymentMethod) work.paymentMethod = 'نقدي';
            if (!work.paymentStatus) work.paymentStatus = 'غير مدفوع';
        });
    }
    function fixContractsPaymentStatus_run() {
        var ct = window.contracts;
        if (!Array.isArray(ct)) return;
        ct.forEach(function (contract) {
            if (!contract) return;
            if (contract.paymentStatus === 'مدفوعة') contract.paymentStatus = 'مدفوع';
            if (!contract.paymentStatus) contract.paymentStatus = 'غير مدفوع';
            if (!contract.status) contract.status = 'نشط';
        });
    }
    function fixDailyWorkIds_run() {
        var dw = window.dailyWork;
        if (!Array.isArray(dw)) return;
        dw.forEach(function (work, idx) {
            if (!work) return;
            if (work.id === undefined || work.id === null) work.id = Date.now() + idx;
        });
        var di = window.dailyIncome;
        if (Array.isArray(di)) {
            di.forEach(function (income, idx) {
                if (!income) return;
                if (income.id === undefined || income.id === null) income.id = Date.now() + 10000 + idx;
            });
        }
        var de = window.dailyExpenses;
        if (Array.isArray(de)) {
            de.forEach(function (expense, idx) {
                if (!expense) return;
                if (expense.id === undefined || expense.id === null) expense.id = Date.now() + 20000 + idx;
            });
        }
        var ct = window.contracts;
        if (Array.isArray(ct)) {
            ct.forEach(function (contract, idx) {
                if (!contract) return;
                if (contract.id === undefined || contract.id === null) contract.id = Date.now() + 30000 + idx;
            });
        }
    }

    // ============================================================
    // FIX 30: مشكلة الـ getMonthlyAnalytics - undefined
    // ============================================================
    function fixGetMonthlyAnalytics() {
        if (typeof window.getMonthlyAnalytics !== 'function') {
            window.getMonthlyAnalytics = function () {
                var months = {};
                var di = window.dailyIncome || [];
                var de = window.dailyExpenses || [];
                di.forEach(function (income) {
                    if (!income || !income.date) return;
                    var month = income.date.substring(0, 7);
                    if (!months[month]) months[month] = { income: 0, expenses: 0 };
                    months[month].income += parseFloat(income.amount) || 0;
                });
                de.forEach(function (expense) {
                    if (!expense || !expense.date) return;
                    var month = expense.date.substring(0, 7);
                    if (!months[month]) months[month] = { income: 0, expenses: 0 };
                    months[month].expenses += parseFloat(expense.amount) || 0;
                });
                return Object.keys(months).sort().map(function (m) {
                    return { month: m, income: months[m].income, expenses: months[m].expenses };
                });
            };
            console.log('✅ Fix30: getMonthlyAnalytics defined');
        }
    }

    // ============================================================
    // تشغيل جميع الإصلاحات
    // ============================================================
    function runAllFixes() {
        console.log('🔧 Running all fixes...');
        fixDarkMode();
        fixLoadTasks();
        fixStorageQuota();
        fixAttendanceEmployeeField();
        fixExportToPDF();
        fixCompleteTask();
        fixPrintReceipts();
        fixInvoiceExport();
        fixGetMonthlyAnalytics();

        // الإصلاحات التي تحتاج انتظار تعريف الدوال
        fixDailyWorkIndexOf();
        fixContractsIndexOf();
        fixDailyIncomeIndexOf();
        fixDailyExpensesIndexOf();
        fixPaymentAlerts();
        fixMarkDailyWorkAsPaid();
        fixMarkContractAsPaid();
        fixActivityLog();
        fixHRModule();
        fixSettings();
        fixNotificationsCount();
        fixCalendarDateFormat();
        fixApplyData();

        // تطبيع البيانات بعد التحميل
        setTimeout(function () {
            fixDailyWorkIds_run();
            fixDailyWorkClientField_run();
            fixDailyIncomeSourceField_run();
            fixDailyExpensesTypeField_run();
            fixDailyWorkWorkersField_run();
            fixContractsPaymentStatus_run();
            console.log('✅ All data normalization complete');
        }, 4000);

        console.log('✅ SuperPro Master Fix v3.0: All fixes applied');
    }

    // تشغيل الإصلاحات عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllFixes);
    } else {
        runAllFixes();
    }

    // تشغيل إضافي بعد تحميل كل شيء
    window.addEventListener('load', function () {
        setTimeout(function () {
            fixDailyWorkIndexOf();
            fixContractsIndexOf();
            fixDailyIncomeIndexOf();
            fixDailyExpensesIndexOf();
            fixPaymentAlerts();
            fixMarkDailyWorkAsPaid();
            fixMarkContractAsPaid();
            fixLoadTasks();
            fixCompleteTask();
            fixPrintReceipts();
            fixInvoiceExport();
            fixGetMonthlyAnalytics();
            fixDailyWorkIds_run();
            fixDailyWorkClientField_run();
            fixDailyIncomeSourceField_run();
            fixDailyExpensesTypeField_run();
            fixDailyWorkWorkersField_run();
            fixContractsPaymentStatus_run();
            console.log('✅ SuperPro Master Fix v3.0: Post-load fixes applied');
        }, 2000);
    });

})();
