/**
 * SUPER_PRO System — Bug Fixes & Enhancements
 * =============================================
 * This file patches known issues without modifying existing code.
 * Load AFTER all other scripts.
 *
 * Fixes:
 *  1. Buttons disabled after login (applyRolePermissions re-enable)
 *  2. Toast container class conflict with Bootstrap
 *  3. Notification bell click handler
 *  4. High contrast restoration on page load
 *  5. Language switching integration
 *  6. Floating elements cleanup
 */

(function () {
    'use strict';

    /* =========================================================================
       FIX 1: Re-enable buttons after login (role permissions fix)
       ========================================================================= */

    function reEnableButtons() {
        // Remove disabled state from all buttons that were disabled by applyRolePermissions
        document.querySelectorAll('button[disabled], a.btn.disabled').forEach(function (el) {
            // Skip auth overlay buttons
            if (el.closest('#authOverlay')) return;

            // Re-enable
            el.removeAttribute('disabled');
            el.classList.remove('disabled');
            el.style.pointerEvents = '';
            el.style.opacity = '';
        });
    }

    // Patch: Override applyRolePermissions to include re-enable logic
    var _origApplyRolePermissions = window.applyRolePermissions;

    function patchedApplyRolePermissions() {
        var u = null;
        try {
            var raw = sessionStorage.getItem('superpro_auth_user');
            u = raw ? JSON.parse(raw) : null;
        } catch (e) { u = null; }

        var role = (u && u.role) ? u.role : 'viewer';
        var readOnly = role === 'viewer';
        var canDelete = role === 'admin';

        // Handle auth overlay
        var overlay = document.getElementById('authOverlay');
        if (overlay) overlay.style.display = u ? 'none' : 'flex';

        if (!readOnly) {
            // User is admin or supervisor — RE-ENABLE all buttons
            reEnableButtons();
        }

        if (readOnly) {
            // Viewer: disable add/save/update/delete buttons
            document.querySelectorAll('button, a.btn').forEach(function (el) {
                if (el.closest('#authOverlay')) return;
                if (el.closest('.sidebar')) return;
                if (el.closest('#searchContainer')) return;
                var allowIds = ['darkModeToggle', 'sidebarToggle', 'notificationBell',
                    'closeNotificationPanel', 'markAllReadBtn', 'authUserBtn',
                    'authLogoutBtn', 'accessibilityDropdown'];
                if (el.id && allowIds.indexOf(el.id) !== -1) return;
                var txt = (el.textContent || '').trim();
                if (/إضافة|حفظ|تحديث|حذف|استيراد|استرجاع|حساب الرواتب|تسجيل حضور/i.test(txt)) {
                    el.setAttribute('disabled', 'disabled');
                    el.classList.add('disabled');
                    el.style.pointerEvents = 'none';
                    el.style.opacity = '0.65';
                }
            });
        }

        if (!canDelete) {
            document.querySelectorAll('button[onclick*="delete"], a[onclick*="delete"]').forEach(function (btn) {
                btn.setAttribute('disabled', 'disabled');
                btn.classList.add('disabled');
                btn.style.pointerEvents = 'none';
                btn.style.opacity = '0.6';
            });
        }

        // Admin-only elements
        ['importDataBtn', 'restoreOriginalDataBtn'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.style.display = canDelete ? '' : 'none';
        });
    }

    // Replace global function
    window.applyRolePermissions = patchedApplyRolePermissions;

    /* =========================================================================
       FIX 2: Toast container class conflict
       ========================================================================= */

    function fixToastContainer() {
        // The Bootstrap toast container has class "toast-container" which conflicts
        // with the enhanced toast container styled in design-enhancements.css
        var bootstrapToast = document.getElementById('liveToast');
        if (bootstrapToast) {
            var parent = bootstrapToast.parentElement;
            if (parent && parent.classList.contains('toast-container')) {
                // Rename to avoid CSS conflict
                parent.classList.remove('toast-container');
                parent.classList.add('bs-toast-container');
                // Hide it properly
                parent.style.position = 'fixed';
                parent.style.bottom = '1rem';
                parent.style.left = '1rem';
                parent.style.zIndex = '1080';
                parent.style.pointerEvents = 'none';
            }
            // Ensure the bootstrap toast is hidden
            bootstrapToast.classList.remove('show');
            bootstrapToast.style.display = 'none';
        }

        // Ensure enhanced toast container exists and is properly styled
        var enhancedContainer = document.querySelector('.toast-container:not(.bs-toast-container)');
        if (!enhancedContainer) {
            enhancedContainer = document.createElement('div');
            enhancedContainer.className = 'toast-container';
            document.body.appendChild(enhancedContainer);
        }
    }

    /* =========================================================================
       FIX 3: Notification bell click handler
       ========================================================================= */

    function setupNotificationBell() {
        var bell = document.getElementById('notificationBell');
        var panel = document.getElementById('notificationPanel');
        var closeBtn = document.getElementById('closeNotificationPanel');
        var markAllBtn = document.getElementById('markAllReadBtn');

        if (!bell || !panel) return;

        // Toggle notification panel on bell click
        bell.addEventListener('click', function (e) {
            e.stopPropagation();
            var isVisible = panel.style.display !== 'none';
            panel.style.display = isVisible ? 'none' : 'block';
            bell.setAttribute('aria-expanded', !isVisible);

            if (!isVisible) {
                // Load notifications
                loadNotifications();
            }
        });

        // Close panel
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                panel.style.display = 'none';
                bell.setAttribute('aria-expanded', 'false');
            });
        }

        // Mark all as read
        if (markAllBtn) {
            markAllBtn.addEventListener('click', function () {
                var badge = document.getElementById('notificationBadge');
                if (badge) {
                    badge.style.display = 'none';
                    badge.textContent = '0';
                }
                // Mark in storage
                try {
                    localStorage.setItem('superpro_notifications_read', Date.now().toString());
                } catch (e) { }
                if (typeof showToast === 'function') {
                    showToast('✅ تم تحديد جميع الإشعارات كمقروءة');
                }
            });
        }

        // Close when clicking outside
        document.addEventListener('click', function (e) {
            if (!panel.contains(e.target) && e.target !== bell && !bell.contains(e.target)) {
                panel.style.display = 'none';
                bell.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function loadNotifications() {
        var listEl = document.getElementById('notificationList');
        if (!listEl) return;

        var notifications = [];

        // Gather system notifications
        try {
            // Check expiring contracts
            if (window.contracts && Array.isArray(window.contracts)) {
                var today = new Date();
                window.contracts.forEach(function (c) {
                    if (c.endDate) {
                        var end = new Date(c.endDate);
                        var diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
                        if (diff <= 30 && diff > 0) {
                            notifications.push({
                                icon: 'fas fa-file-contract',
                                color: 'warning',
                                title: 'عقد يقترب من الانتهاء',
                                text: (c.clientName || c.client || 'عقد') + ' — ينتهي بعد ' + diff + ' يوم',
                                time: c.endDate
                            });
                        } else if (diff <= 0) {
                            notifications.push({
                                icon: 'fas fa-exclamation-triangle',
                                color: 'danger',
                                title: 'عقد منتهي',
                                text: (c.clientName || c.client || 'عقد') + ' — انتهى!',
                                time: c.endDate
                            });
                        }
                    }
                });
            }

            // Check monthly expenses due
            if (window.monthlyExpenses && Array.isArray(window.monthlyExpenses)) {
                var todayDate = new Date().getDate();
                window.monthlyExpenses.forEach(function (exp) {
                    if (exp.dueDay) {
                        var dueDay = parseInt(exp.dueDay);
                        var diff = dueDay - todayDate;
                        if (diff > 0 && diff <= 5) {
                            notifications.push({
                                icon: 'fas fa-money-bill-wave',
                                color: 'info',
                                title: 'مصروف شهري قريب',
                                text: (exp.name || exp.description || 'مصروف') + ' — مستحق بعد ' + diff + ' أيام',
                                time: 'يوم ' + dueDay
                            });
                        }
                    }
                });
            }

            // Check if no employees have attendance today
            if (window.attendance && Array.isArray(window.attendance)) {
                var todayStr = new Date().toISOString().split('T')[0];
                var todayAttendance = window.attendance.filter(function (a) {
                    return a.date === todayStr;
                });
                if (todayAttendance.length === 0 && window.employees && window.employees.length > 0) {
                    notifications.push({
                        icon: 'fas fa-user-clock',
                        color: 'warning',
                        title: 'لم يُسجّل حضور اليوم',
                        text: 'لا يوجد سجل حضور لليوم بعد',
                        time: 'اليوم'
                    });
                }
            }

        } catch (e) {
            console.warn('Error loading notifications:', e);
        }

        // Render notifications
        if (notifications.length === 0) {
            listEl.innerHTML = '<div class="p-3 text-center text-muted">' +
                '<i class="fas fa-bell-slash fa-2x mb-2 d-block"></i>' +
                'لا توجد إشعارات حالياً</div>';
        } else {
            var html = '';
            notifications.forEach(function (n) {
                html += '<div class="d-flex align-items-start gap-2 p-2 mb-1 rounded" ' +
                    'style="background:var(--sp-card-bg,#f8f9fa);border-right:3px solid var(--bs-' + n.color + ',#0d6efd);">' +
                    '<i class="' + n.icon + ' text-' + n.color + ' mt-1"></i>' +
                    '<div class="flex-grow-1">' +
                    '<div class="fw-bold small">' + n.title + '</div>' +
                    '<div class="text-muted small">' + n.text + '</div>' +
                    '</div>' +
                    '<small class="text-muted text-nowrap">' + (n.time || '') + '</small>' +
                    '</div>';
            });
            listEl.innerHTML = html;

            // Update badge
            var badge = document.getElementById('notificationBadge');
            if (badge) {
                badge.textContent = notifications.length;
                badge.style.display = notifications.length > 0 ? '' : 'none';
            }
        }
    }

    /* =========================================================================
       FIX 4: High contrast restoration on page load
       ========================================================================= */

    function restoreHighContrast() {
        try {
            var hc = localStorage.getItem('highContrast');
            if (hc === 'true') {
                document.body.classList.add('high-contrast');
                document.documentElement.classList.add('high-contrast');
            }
        } catch (e) { }
    }

    // Also enhance the high-contrast CSS (add dynamic styles)
    function enhanceHighContrastCSS() {
        var style = document.createElement('style');
        style.id = 'high-contrast-enhanced';
        style.textContent =
            '.high-contrast { --sp-bg: #000 !important; --sp-card-bg: #1a1a1a !important; --sp-text: #fff !important; }' +
            '.high-contrast body { background: #000 !important; color: #fff !important; }' +
            '.high-contrast .card, .high-contrast .modal-content { background: #1a1a1a !important; color: #fff !important; border: 2px solid #fff !important; }' +
            '.high-contrast .form-control, .high-contrast .form-select { background: #000 !important; color: #fff !important; border: 2px solid #fff !important; }' +
            '.high-contrast .table { color: #fff !important; }' +
            '.high-contrast .table th { background: #333 !important; color: #fff !important; border: 1px solid #fff !important; }' +
            '.high-contrast .table td { border: 1px solid #999 !important; }' +
            '.high-contrast .sidebar { background: #000 !important; border-color: #fff !important; }' +
            '.high-contrast .sidebar .nav-link { color: #fff !important; }' +
            '.high-contrast .sidebar .nav-link.active { background: #fff !important; color: #000 !important; }' +
            '.high-contrast .navbar { background: #000 !important; border-bottom: 2px solid #fff !important; }' +
            '.high-contrast .btn { border: 2px solid #fff !important; }' +
            '.high-contrast .btn-primary { background: #0056b3 !important; }' +
            '.high-contrast .btn-success { background: #155724 !important; }' +
            '.high-contrast .btn-danger { background: #721c24 !important; }' +
            '.high-contrast .btn-warning { background: #856404 !important; }' +
            '.high-contrast .stat-card-enhanced { border: 2px solid #fff !important; }' +
            '.high-contrast .dropdown-menu { background: #1a1a1a !important; border: 2px solid #fff !important; }' +
            '.high-contrast .dropdown-item { color: #fff !important; }' +
            '.high-contrast .dropdown-item:hover { background: #333 !important; }' +
            '.high-contrast .modal-backdrop { opacity: 0.9 !important; }' +
            '.high-contrast a { color: #6ea8fe !important; }' +
            '.high-contrast .text-muted { color: #ccc !important; }' +
            '.high-contrast .alert { border: 2px solid #fff !important; }';
        document.head.appendChild(style);
    }

    /* =========================================================================
       FIX 5: Language switching integration
       ========================================================================= */

    // Comprehensive translation dictionary
    var translations = {
        en: {
            // Sidebar
            'لوحة التحكم': 'Dashboard',
            'شؤون الموظفين': 'Employees',
            'الحضور والانصراف': 'Attendance',
            'إدارة العملاء': 'Clients',
            'إدارة العقود': 'Contracts',
            'العمل اليومي': 'Daily Work',
            'المدخولات اليومية': 'Daily Income',
            'المصروفات اليومية': 'Daily Expenses',
            'المصاريف الشهرية': 'Monthly Expenses',
            'الخدمات': 'Services',
            'إدارة الفرق': 'Teams',
            'المواقع والعملاء': 'Locations',
            'التقييمات والآراء': 'Ratings',
            'الحزم والباقات': 'Packages',
            'الحسابات المالية': 'Finance',
            'الرواتب': 'Payroll',
            'التقويم': 'Calendar',
            'لوحة المهام': 'Tasks',
            'التقارير': 'Reports',
            'الإعدادات': 'Settings',
            'الإشعارات': 'Notifications',
            'سلة المحذوفات': 'Trash',
            'استقبال الخدمات': 'Reception',
            'نظام التنظيف': 'Cleaning',
            // Buttons
            'إضافة': 'Add',
            'حفظ': 'Save',
            'تعديل': 'Edit',
            'حذف': 'Delete',
            'بحث': 'Search',
            'تصدير': 'Export',
            'استيراد': 'Import',
            'إلغاء': 'Cancel',
            'تحديث': 'Refresh',
            'إغلاق': 'Close',
            // Dashboard
            'إجمالي الموظفين': 'Total Employees',
            'إجمالي العملاء': 'Total Clients',
            'عدد العقود': 'Total Contracts',
            'الرصيد الصافي': 'Net Balance',
            'الأداء الشهري': 'Monthly Performance',
            'المهام العاجلة': 'Urgent Tasks',
            'آخر العمليات': 'Recent Transactions',
            'التنبيهات الحديثة': 'Recent Alerts',
            // Common
            'الاسم': 'Name',
            'التاريخ': 'Date',
            'المبلغ': 'Amount',
            'الحالة': 'Status',
            'الهاتف': 'Phone',
            'البريد الإلكتروني': 'Email',
            'العنوان': 'Address',
            'ملاحظات': 'Notes',
            'الإجراءات': 'Actions',
            'مدفوع': 'Paid',
            'غير مدفوع': 'Unpaid',
            'متأخر': 'Overdue',
            'نشط': 'Active',
            'منتهي': 'Expired',
            'الكل': 'All',
            'إضافة موظف جديد': 'Add New Employee',
            'إضافة عميل جديد': 'Add New Client',
            'إضافة عقد جديد': 'Add New Contract',
            'لا توجد بيانات': 'No data available',
            'تم بنجاح': 'Success',
            'خطأ': 'Error',
            'تحذير': 'Warning',
            // Auth
            'تسجيل الدخول': 'Login',
            'تسجيل خروج': 'Logout',
            'اسم المستخدم': 'Username',
            'كلمة المرور': 'Password',
            'الصلاحية': 'Role',
            'مدير': 'Admin',
            'مشرف': 'Supervisor',
            'مشاهد': 'Viewer',
            // Nav
            'تباين عالي': 'High Contrast',
            'الوضع الليلي': 'Dark Mode',
            'تغيير اللغة': 'Change Language',
            'نسخة احتياطية': 'Backup',
            'استرجاع نسخة': 'Restore',
            'خيارات الوصولية': 'Accessibility',
            'الآن': 'Now',
            'ر.س': 'SAR'
        },
        fr: {
            'لوحة التحكم': 'Tableau de Bord',
            'شؤون الموظفين': 'Employés',
            'الحضور والانصراف': 'Présence',
            'إدارة العملاء': 'Clients',
            'إدارة العقود': 'Contrats',
            'العمل اليومي': 'Travail Quotidien',
            'المدخولات اليومية': 'Revenus Quotidiens',
            'المصروفات اليومية': 'Dépenses Quotidiennes',
            'المصاريف الشهرية': 'Dépenses Mensuelles',
            'الخدمات': 'Services',
            'إدارة الفرق': 'Équipes',
            'المواقع والعملاء': 'Emplacements',
            'التقييمات والآراء': 'Évaluations',
            'الحزم والباقات': 'Forfaits',
            'الحسابات المالية': 'Finances',
            'الرواتب': 'Salaires',
            'التقويم': 'Calendrier',
            'لوحة المهام': 'Tâches',
            'التقارير': 'Rapports',
            'الإعدادات': 'Paramètres',
            'الإشعارات': 'Notifications',
            'سلة المحذوفات': 'Corbeille',
            'استقبال الخدمات': 'Réception',
            'نظام التنظيف': 'Nettoyage',
            'إضافة': 'Ajouter',
            'حفظ': 'Enregistrer',
            'تعديل': 'Modifier',
            'حذف': 'Supprimer',
            'بحث': 'Rechercher',
            'تصدير': 'Exporter',
            'استيراد': 'Importer',
            'إلغاء': 'Annuler',
            'تحديث': 'Actualiser',
            'إغلاق': 'Fermer',
            'إجمالي الموظفين': 'Total Employés',
            'إجمالي العملاء': 'Total Clients',
            'عدد العقود': 'Total Contrats',
            'الرصيد الصافي': 'Solde Net',
            'الاسم': 'Nom',
            'التاريخ': 'Date',
            'المبلغ': 'Montant',
            'الحالة': 'Statut',
            'الهاتف': 'Téléphone',
            'تسجيل الدخول': 'Connexion',
            'تسجيل خروج': 'Déconnexion',
            'اسم المستخدم': "Nom d'utilisateur",
            'كلمة المرور': 'Mot de passe',
            'تباين عالي': 'Contraste Élevé',
            'الوضع الليلي': 'Mode Sombre',
            'تغيير اللغة': 'Changer la Langue',
            'نسخة احتياطية': 'Sauvegarde',
            'استرجاع نسخة': 'Restaurer',
            'الآن': 'Maintenant',
            'ر.س': 'SAR'
        }
    };

    // Override changeLanguage to actually translate
    window.changeLanguage = function (lang) {
        if (['ar', 'en', 'fr'].indexOf(lang) === -1) return false;

        localStorage.setItem('language', lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        // Update active language button
        document.querySelectorAll('.language-btn').forEach(function (btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });

        // Apply translations
        applyTranslations(lang);

        var langNames = { 'ar': 'العربية 🇸🇦', 'en': 'English 🇺🇸', 'fr': 'Français 🇫🇷' };
        if (typeof showToast === 'function') {
            showToast('🌍 ' + langNames[lang]);
        }

        return true;
    };

    function applyTranslations(lang) {
        if (lang === 'ar') {
            // Restore Arabic - reload is simpler for full restore
            location.reload();
            return;
        }

        var dict = translations[lang];
        if (!dict) return;

        // Translate sidebar nav links
        document.querySelectorAll('.sidebar .nav-link').forEach(function (link) {
            var textNode = link.childNodes[link.childNodes.length - 1];
            if (textNode && textNode.nodeType === 3) {
                var original = textNode.textContent.trim();
                if (dict[original]) {
                    textNode.textContent = ' ' + dict[original];
                }
            }
            // Also check for span
            var span = link.querySelector('span');
            if (span) {
                var origSpan = span.textContent.trim();
                if (dict[origSpan]) span.textContent = dict[origSpan];
            }
        });

        // Translate buttons
        document.querySelectorAll('button, .btn, .modal-title, h5, h6, label, th, .form-label, .dropdown-item, .dropdown-header').forEach(function (el) {
            // Skip elements with only icon children
            if (el.children.length > 0 && el.textContent.trim() === '') return;

            el.childNodes.forEach(function (node) {
                if (node.nodeType === 3) { // text node
                    var text = node.textContent.trim();
                    if (dict[text]) {
                        node.textContent = node.textContent.replace(text, dict[text]);
                    }
                }
            });
        });

        // Translate placeholders
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function (el) {
            var ph = el.placeholder.trim();
            if (dict[ph]) el.placeholder = dict[ph];
        });

        // Update body direction classes
        document.body.classList.remove('lang-ar', 'lang-en', 'lang-fr');
        document.body.classList.add('lang-' + lang);

        // Add LTR-specific CSS adjustments
        if (lang !== 'ar') {
            document.body.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        } else {
            document.body.style.fontFamily = "'Tajawal', sans-serif";
        }
    }

    // Restore language on page load
    function restoreLanguage() {
        try {
            var lang = localStorage.getItem('language') || 'ar';
            if (lang !== 'ar') {
                document.documentElement.lang = lang;
                document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
                // Delay to let DOM render first
                setTimeout(function () { applyTranslations(lang); }, 1000);
            }
            // Update active button
            document.querySelectorAll('.language-btn').forEach(function (btn) {
                btn.classList.remove('active');
                if (btn.getAttribute('data-lang') === lang) {
                    btn.classList.add('active');
                }
            });
        } catch (e) { }
    }

    /* =========================================================================
       FIX 6: Clean up floating elements
       ========================================================================= */

    function cleanupFloatingElements() {
        // Hide any visible Bootstrap toasts
        var liveToast = document.getElementById('liveToast');
        if (liveToast) {
            liveToast.classList.remove('show');
            liveToast.style.display = 'none';
        }

        // Clean up any orphan toast elements that appeared as floating symbols
        document.querySelectorAll('.toast.show, .toast[style*="display: block"]').forEach(function (t) {
            if (t.id !== 'liveToast') return;
            t.classList.remove('show');
            t.style.display = 'none';
        });

        // Ensure notifications-toast-container is empty on load
        var ntc = document.querySelector('.notifications-toast-container');
        if (ntc) ntc.innerHTML = '';
    }

    /* =========================================================================
       FIX 7: Modal z-index fix — ensure modals are above everything
       ========================================================================= */

    function fixModalZIndex() {
        var style = document.createElement('style');
        style.id = 'modal-zindex-fix';
        style.textContent =
            '.modal { z-index: 12000 !important; }' +
            '.modal-backdrop { z-index: 11999 !important; }' +
            '.modal-dialog { pointer-events: auto !important; }' +
            '.modal-content { pointer-events: auto !important; }' +
            '.modal-content input, .modal-content select, .modal-content textarea, .modal-content button { pointer-events: auto !important; }' +
            '.modal.show .modal-dialog { pointer-events: auto !important; }';
        document.head.appendChild(style);
    }

    /* =========================================================================
       INITIALIZATION
       ========================================================================= */

    function initBugfixes() {
        try {
            fixToastContainer();
            cleanupFloatingElements();
            fixModalZIndex();
            enhanceHighContrastCSS();
            restoreHighContrast();
            setupNotificationBell();
            restoreLanguage();

            // Re-apply permissions after a delay to ensure auth is loaded
            setTimeout(function () {
                patchedApplyRolePermissions();
            }, 1000);

            // Also re-apply when any modal is shown (to prevent disabled inputs)
            document.addEventListener('shown.bs.modal', function () {
                var u = null;
                try {
                    var raw = sessionStorage.getItem('superpro_auth_user');
                    u = raw ? JSON.parse(raw) : null;
                } catch (e) { }
                if (u && u.role !== 'viewer') {
                    // Ensure modal buttons are enabled
                    document.querySelectorAll('.modal.show button, .modal.show input, .modal.show select, .modal.show textarea').forEach(function (el) {
                        el.removeAttribute('disabled');
                        el.classList.remove('disabled');
                        el.style.pointerEvents = '';
                        el.style.opacity = '';
                    });
                }
            });

            // Periodic check to re-enable buttons after login
            var checkInterval = setInterval(function () {
                var u = null;
                try {
                    var raw = sessionStorage.getItem('superpro_auth_user');
                    u = raw ? JSON.parse(raw) : null;
                } catch (e) { }
                if (u && u.role !== 'viewer') {
                    reEnableButtons();
                    clearInterval(checkInterval);
                }
            }, 500);

            // Auto-clear interval after 30 seconds
            setTimeout(function () { clearInterval(checkInterval); }, 30000);

            // Load notification count on init
            setTimeout(loadNotifications, 2000);

            console.log('✅ Bug fixes loaded successfully');
        } catch (err) {
            console.error('❌ Bug fixes initialization error:', err);
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(initBugfixes, 800);
        });
    } else {
        setTimeout(initBugfixes, 800);
    }

})();
