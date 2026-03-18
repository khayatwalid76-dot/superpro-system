/**
 * ==========================================================================
 * SUPER_PRO v4 — Master JavaScript Fixes & Improvements
 * Loaded LAST after all other scripts. Overrides broken functionality.
 * ==========================================================================
 */
(function() {
    'use strict';

    // =========================================================================
    // COMPREHENSIVE TRANSLATION DICTIONARIES
    // =========================================================================
    var TRANSLATIONS = {
        en: {
            // Sidebar
            'لوحة التحكم': 'Dashboard', 'شؤون الموظفين': 'Employees',
            'الحضور والانصراف': 'Attendance', 'إدارة العملاء': 'Clients',
            'إدارة العقود': 'Contracts', 'العمل اليومي': 'Daily Work',
            'المدخولات اليومية': 'Daily Income', 'المصروفات اليومية': 'Daily Expenses',
            'المصاريف الشهرية': 'Monthly Expenses', 'الخدمات': 'Services',
            'إدارة الفرق': 'Teams', 'المواقع والعملاء': 'Locations & Clients',
            'التقييمات والآراء': 'Ratings & Reviews', 'الحزم والباقات': 'Packages',
            'الحسابات المالية': 'Finance', 'الرواتب': 'Payroll',
            'التقويم': 'Calendar', 'لوحة المهام': 'Tasks',
            'التقارير': 'Reports', 'الإعدادات': 'Settings',
            'الإشعارات': 'Notifications', 'الإشعارات والتنبيهات': 'Notifications & Alerts',
            'سلة المحذوفات': 'Trash', 'استقبال الخدمات': 'Service Reception',
            'نظام التنظيف': 'Cleaning System', 'القائمات': 'Menus',
            'أنظمة متقدمة': 'Advanced Systems', 'التحليلات والتقارير': 'Analytics & Reports',
            'إدارة المستندات': 'Documents', 'بحث متقدم': 'Advanced Search',
            'الأمان والصلاحيات': 'Security', 'سجل النشاطات': 'Activity Log',
            'نظام الإجازات': 'Leaves', 'الميزانية الشهرية': 'Monthly Budget',
            // Buttons & Labels
            'إضافة': 'Add', 'إضافة جديد': 'Add New', 'حفظ': 'Save',
            'حفظ التعديلات': 'Save Changes', 'تعديل': 'Edit', 'حذف': 'Delete',
            'مسح': 'Delete', 'بحث': 'Search', 'بحث سريع...': 'Quick search...',
            'تصدير': 'Export', 'تصدير Excel': 'Export Excel', 'تصدير PDF': 'Export PDF',
            'استيراد': 'Import', 'إلغاء': 'Cancel', 'تحديث': 'Refresh',
            'إغلاق': 'Close', 'تأكيد': 'Confirm', 'موافق': 'OK',
            'رفض': 'Reject', 'نعم': 'Yes', 'لا': 'No',
            'طباعة': 'Print', 'تسجيل': 'Register', 'تطبيق': 'Apply',
            'إرسال': 'Send', 'تحميل': 'Download',
            'إضافة موظف': 'Add Employee', 'إضافة موظف جديد': 'Add New Employee',
            'إضافة عميل': 'Add Client', 'إضافة عميل جديد': 'Add New Client',
            'إضافة عقد': 'Add Contract', 'إضافة عقد جديد': 'Add New Contract',
            'إضافة مصروف': 'Add Expense', 'إضافة مدخول': 'Add Income',
            'تسجيل حضور': 'Record Attendance', 'حساب الرواتب': 'Calculate Payroll',
            'تصدير البيانات': 'Export Data', 'استيراد البيانات': 'Import Data',
            // Dashboard
            'إجمالي الموظفين': 'Total Employees', 'إجمالي العملاء': 'Total Clients',
            'عدد العقود': 'Total Contracts', 'الرصيد الصافي': 'Net Balance',
            'الأداء الشهري': 'Monthly Performance', 'المهام العاجلة': 'Urgent Tasks',
            'آخر العمليات': 'Recent Transactions', 'التنبيهات الحديثة': 'Recent Alerts',
            'ملخص يومي': 'Daily Summary', 'مرحباً بك في نظام سوبر برو': 'Welcome to SuperPro System',
            // Employees
            'قائمة الموظفين': 'Employee List', 'الاسم': 'Name',
            'الوظيفة': 'Job', 'الراتب': 'Salary', 'الحالة': 'Status',
            'الجنسية': 'Nationality', 'الهاتف': 'Phone', 'الإجراءات': 'Actions',
            'نشط': 'Active', 'غير نشط': 'Inactive', 'إجازة': 'On Leave',
            'موظفين نشطين': 'Active Employees', 'إقامات قاربت على الانتهاء': 'Expiring Residencies',
            'إجمالي الرواتب': 'Total Salaries', 'الرقم الشخصي / الهوية': 'ID Number',
            'تاريخ التوظيف': 'Hire Date', 'الراتب الأساسي (ر.ق)': 'Basic Salary (QAR)',
            'تاريخ انتهاء الإقامة': 'Residency Expiry', 'الجنس': 'Gender',
            'ذكر': 'Male', 'أنثى': 'Female', 'ملف العقد (اختياري)': 'Contract File (Optional)',
            // Clients
            'قائمة العملاء': 'Client List', 'اسم العميل': 'Client Name',
            'البريد الإلكتروني': 'Email', 'العنوان': 'Address',
            'نوع العميل': 'Client Type', 'شركة': 'Company', 'فرد': 'Individual',
            // Contracts
            'قائمة العقود': 'Contract List', 'رقم العقد': 'Contract Number',
            'تاريخ البداية': 'Start Date', 'تاريخ النهاية': 'End Date',
            'قيمة العقد': 'Contract Value',
            // Finance
            'المبلغ': 'Amount', 'التاريخ': 'Date', 'النوع': 'Type',
            'الوصف': 'Description', 'الفئة': 'Category',
            'إيرادات': 'Revenue', 'مصروفات': 'Expenses',
            // Settings
            'اسم الشركة': 'Company Name', 'الشعار': 'Logo',
            'اللغة': 'Language', 'العملة': 'Currency', 'ريال قطري': 'Qatari Riyal',
            // Common
            'الكل': 'All', 'مفعّل': 'Enabled', 'معطّل': 'Disabled',
            'تفاصيل': 'Details', 'المزيد': 'More', 'عرض': 'View',
            'ابحث عن موظف بالاسم، الوظيفة، الجنسية...': 'Search by name, job, nationality...',
            'تحديد الكل كمقروء': 'Mark all as read', 'مقروء': 'Read',
            'لا توجد إشعارات': 'No notifications', 'موظف': 'employee',
            'اختر الجنسية': 'Select Nationality',
            'سعودي': 'Saudi', 'مصري': 'Egyptian', 'سوري': 'Syrian', 'يمني': 'Yemeni',
            'سوداني': 'Sudanese', 'هندي': 'Indian', 'باكستاني': 'Pakistani',
            'فلبيني': 'Filipino', 'نيبالي': 'Nepalese', 'بنغلاديشي': 'Bangladeshi',
            'إثيوبي': 'Ethiopian', 'تونسي': 'Tunisian', 'كيني': 'Kenyan',
            // Notifications page
            'إشعارات جديدة': 'New Notifications', 'تنبيهات': 'Alerts',
            'إجمالي الأنشطة': 'Total Activities', 'الوقت الحالي': 'Current Time',
            'الإشعارات والأنشطة الحية': 'Live Notifications & Activities',
            'مسح الكل': 'Clear All',
            // Section titles
            'إدارة الموظفين': 'Employee Management',
            'إدارة الحضور': 'Attendance Management',
            // Auth
            'تسجيل الدخول': 'Login', 'تسجيل الخروج': 'Logout',
            'اسم المستخدم': 'Username', 'كلمة المرور': 'Password',
            'مستخدم': 'User', 'مدير': 'Admin', 'مشرف': 'Supervisor',
            // Tasks
            'جديد': 'New', 'قيد التنفيذ': 'In Progress', 'مكتمل': 'Completed',
            'عاجل': 'Urgent', 'عالي': 'High', 'متوسط': 'Medium', 'منخفض': 'Low',
            // Various
            'ر.ق': 'QAR', 'عدد': 'Count', 'نسبة': 'Percentage',
            'هل أنت متأكد؟': 'Are you sure?', 'تم الحفظ بنجاح': 'Saved successfully',
            'تم الحذف بنجاح': 'Deleted successfully', 'حدث خطأ': 'An error occurred',
            'نسخة احتياطية': 'Backup', 'استرجاع': 'Restore',
            'بيانات شخصية': 'Personal Data', 'بيانات وظيفية': 'Job Data',
            'بيانات مالية': 'Financial Data'
        },
        fr: {
            // Sidebar
            'لوحة التحكم': 'Tableau de bord', 'شؤون الموظفين': 'Employés',
            'الحضور والانصراف': 'Présence', 'إدارة العملاء': 'Clients',
            'إدارة العقود': 'Contrats', 'العمل اليومي': 'Travail quotidien',
            'المدخولات اليومية': 'Revenus quotidiens', 'المصروفات اليومية': 'Dépenses quotidiennes',
            'المصاريف الشهرية': 'Dépenses mensuelles', 'الخدمات': 'Services',
            'إدارة الفرق': 'Équipes', 'المواقع والعملاء': 'Sites & Clients',
            'التقييمات والآراء': 'Évaluations', 'الحزم والباقات': 'Forfaits',
            'الحسابات المالية': 'Finances', 'الرواتب': 'Salaires',
            'التقويم': 'Calendrier', 'لوحة المهام': 'Tâches',
            'التقارير': 'Rapports', 'الإعدادات': 'Paramètres',
            'الإشعارات': 'Notifications', 'الإشعارات والتنبيهات': 'Notifications & Alertes',
            'سلة المحذوفات': 'Corbeille', 'استقبال الخدمات': 'Réception des services',
            'نظام التنظيف': 'Système de nettoyage', 'القائمات': 'Menus',
            'أنظمة متقدمة': 'Systèmes avancés', 'التحليلات والتقارير': 'Analyses & Rapports',
            'إدارة المستندات': 'Documents', 'بحث متقدم': 'Recherche avancée',
            'الأمان والصلاحيات': 'Sécurité', 'سجل النشاطات': 'Journal d\'activité',
            'نظام الإجازات': 'Congés', 'الميزانية الشهرية': 'Budget mensuel',
            // Buttons
            'إضافة': 'Ajouter', 'إضافة جديد': 'Ajouter nouveau', 'حفظ': 'Enregistrer',
            'حفظ التعديلات': 'Enregistrer les modifications', 'تعديل': 'Modifier',
            'حذف': 'Supprimer', 'مسح': 'Supprimer', 'بحث': 'Rechercher',
            'بحث سريع...': 'Recherche rapide...', 'تصدير': 'Exporter',
            'تصدير Excel': 'Exporter Excel', 'تصدير PDF': 'Exporter PDF',
            'استيراد': 'Importer', 'إلغاء': 'Annuler', 'تحديث': 'Actualiser',
            'إغلاق': 'Fermer', 'تأكيد': 'Confirmer', 'موافق': 'OK',
            'رفض': 'Refuser', 'نعم': 'Oui', 'لا': 'Non',
            'طباعة': 'Imprimer', 'تسجيل': 'Enregistrement', 'تطبيق': 'Appliquer',
            'إرسال': 'Envoyer', 'تحميل': 'Télécharger',
            'إضافة موظف': 'Ajouter employé', 'إضافة موظف جديد': 'Ajouter un nouvel employé',
            'إضافة عميل': 'Ajouter client', 'إضافة عميل جديد': 'Ajouter un nouveau client',
            'إضافة عقد': 'Ajouter contrat', 'إضافة عقد جديد': 'Ajouter un nouveau contrat',
            'إضافة مصروف': 'Ajouter dépense', 'إضافة مدخول': 'Ajouter revenu',
            'تسجيل حضور': 'Enregistrer présence', 'حساب الرواتب': 'Calculer les salaires',
            'تصدير البيانات': 'Exporter les données', 'استيراد البيانات': 'Importer les données',
            // Dashboard
            'إجمالي الموظفين': 'Total employés', 'إجمالي العملاء': 'Total clients',
            'عدد العقود': 'Total contrats', 'الرصيد الصافي': 'Solde net',
            'الأداء الشهري': 'Performance mensuelle', 'المهام العاجلة': 'Tâches urgentes',
            'آخر العمليات': 'Opérations récentes', 'التنبيهات الحديثة': 'Alertes récentes',
            'ملخص يومي': 'Résumé quotidien', 'مرحباً بك في نظام سوبر برو': 'Bienvenue dans SuperPro',
            // Employees
            'قائمة الموظفين': 'Liste des employés', 'الاسم': 'Nom',
            'الوظيفة': 'Poste', 'الراتب': 'Salaire', 'الحالة': 'Statut',
            'الجنسية': 'Nationalité', 'الهاتف': 'Téléphone', 'الإجراءات': 'Actions',
            'نشط': 'Actif', 'غير نشط': 'Inactif', 'إجازة': 'En congé',
            'موظفين نشطين': 'Employés actifs', 'إقامات قاربت على الانتهاء': 'Résidences expirant',
            'إجمالي الرواتب': 'Total des salaires', 'الرقم الشخصي / الهوية': 'Numéro d\'identité',
            'تاريخ التوظيف': 'Date d\'embauche', 'الراتب الأساسي (ر.ق)': 'Salaire de base (QAR)',
            'تاريخ انتهاء الإقامة': 'Expiration du permis', 'الجنس': 'Genre',
            'ذكر': 'Masculin', 'أنثى': 'Féminin',
            'ملف العقد (اختياري)': 'Fichier de contrat (facultatif)',
            // Clients
            'قائمة العملاء': 'Liste des clients', 'اسم العميل': 'Nom du client',
            'البريد الإلكتروني': 'E-mail', 'العنوان': 'Adresse',
            'نوع العميل': 'Type de client', 'شركة': 'Entreprise', 'فرد': 'Individuel',
            // Contracts
            'قائمة العقود': 'Liste des contrats', 'رقم العقد': 'Numéro de contrat',
            'تاريخ البداية': 'Date de début', 'تاريخ النهاية': 'Date de fin',
            'قيمة العقد': 'Valeur du contrat',
            // Finance
            'المبلغ': 'Montant', 'التاريخ': 'Date', 'النوع': 'Type',
            'الوصف': 'Description', 'الفئة': 'Catégorie',
            'إيرادات': 'Revenus', 'مصروفات': 'Dépenses',
            // Settings
            'اسم الشركة': 'Nom de l\'entreprise', 'الشعار': 'Logo',
            'اللغة': 'Langue', 'العملة': 'Devise', 'ريال قطري': 'Riyal qatari',
            // Common
            'الكل': 'Tout', 'مفعّل': 'Activé', 'معطّل': 'Désactivé',
            'تفاصيل': 'Détails', 'المزيد': 'Plus', 'عرض': 'Afficher',
            'ابحث عن موظف بالاسم، الوظيفة، الجنسية...': 'Rechercher par nom, poste, nationalité...',
            'تحديد الكل كمقروء': 'Tout marquer comme lu', 'مقروء': 'Lu',
            'لا توجد إشعارات': 'Aucune notification', 'موظف': 'employé',
            'اختر الجنسية': 'Sélectionnez la nationalité',
            'سعودي': 'Saoudien', 'مصري': 'Égyptien', 'سوري': 'Syrien', 'يمني': 'Yéménite',
            'سوداني': 'Soudanais', 'هندي': 'Indien', 'باكستاني': 'Pakistanais',
            'فلبيني': 'Philippin', 'نيبالي': 'Népalais', 'بنغلاديشي': 'Bangladais',
            'إثيوبي': 'Éthiopien', 'تونسي': 'Tunisien', 'كيني': 'Kényan',
            // Notifications
            'إشعارات جديدة': 'Nouvelles notifications', 'تنبيهات': 'Alertes',
            'إجمالي الأنشطة': 'Total des activités', 'الوقت الحالي': 'Heure actuelle',
            'الإشعارات والأنشطة الحية': 'Notifications en direct',
            'مسح الكل': 'Tout effacer',
            // Section titles
            'إدارة الموظفين': 'Gestion des employés', 'إدارة الحضور': 'Gestion de la présence',
            // Auth
            'تسجيل الدخول': 'Connexion', 'تسجيل الخروج': 'Déconnexion',
            'اسم المستخدم': 'Nom d\'utilisateur', 'كلمة المرور': 'Mot de passe',
            'مستخدم': 'Utilisateur', 'مدير': 'Administrateur', 'مشرف': 'Superviseur',
            // Tasks
            'جديد': 'Nouveau', 'قيد التنفيذ': 'En cours', 'مكتمل': 'Terminé',
            'عاجل': 'Urgent', 'عالي': 'Élevé', 'متوسط': 'Moyen', 'منخفض': 'Faible',
            // Various
            'ر.ق': 'QAR', 'عدد': 'Nombre', 'نسبة': 'Pourcentage',
            'هل أنت متأكد؟': 'Êtes-vous sûr ?', 'تم الحفظ بنجاح': 'Enregistré avec succès',
            'تم الحذف بنجاح': 'Supprimé avec succès', 'حدث خطأ': 'Une erreur s\'est produite',
            'نسخة احتياطية': 'Sauvegarde', 'استرجاع': 'Restaurer',
            'بيانات شخصية': 'Données personnelles', 'بيانات وظيفية': 'Données professionnelles',
            'بيانات مالية': 'Données financières'
        }
    };

    // Store original Arabic text for each node
    var arabicCache = new WeakMap();

    // =========================================================================
    // DEEP TRANSLATE — Walk the DOM and translate all text
    // =========================================================================
    function deepTranslate(lang) {
        if (lang === 'ar') return;
        var dict = TRANSLATIONS[lang];
        if (!dict) return;

        // 1. Translate text nodes
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        var node;
        while (node = walker.nextNode()) {
            var parent = node.parentNode;
            if (!parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE' || parent.tagName === 'TEXTAREA') continue;
            var text = node.nodeValue.trim();
            if (!text) continue;

            // Save original
            if (!arabicCache.has(node)) {
                arabicCache.set(node, node.nodeValue);
            }

            var translated = node.nodeValue;
            // Sort keys by length (longest first) to avoid partial matches
            var keys = Object.keys(dict).sort(function(a, b) { return b.length - a.length; });
            for (var i = 0; i < keys.length; i++) {
                if (translated.indexOf(keys[i]) !== -1) {
                    translated = translated.split(keys[i]).join(dict[keys[i]]);
                }
            }
            node.nodeValue = translated;
        }

        // 2. Translate placeholders, titles, aria-labels
        document.querySelectorAll('[placeholder]').forEach(function(el) {
            var ph = el.getAttribute('placeholder');
            if (!arabicCache.has(el)) arabicCache.set(el, { placeholder: ph });
            if (dict[ph]) el.setAttribute('placeholder', dict[ph]);
        });
        document.querySelectorAll('[title]').forEach(function(el) {
            var t = el.getAttribute('title');
            if (dict[t]) el.setAttribute('title', dict[t]);
        });
        document.querySelectorAll('[data-tooltip]').forEach(function(el) {
            var t = el.getAttribute('data-tooltip');
            if (dict[t]) el.setAttribute('data-tooltip', dict[t]);
        });
    }

    function revertToArabic() {
        // Revert text nodes
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
        var node;
        while (node = walker.nextNode()) {
            var original = arabicCache.get(node);
            if (original) {
                node.nodeValue = original;
                arabicCache.delete(node);
            }
        }
        // Revert placeholders
        document.querySelectorAll('[placeholder]').forEach(function(el) {
            var cached = arabicCache.get(el);
            if (cached && cached.placeholder) {
                el.setAttribute('placeholder', cached.placeholder);
                arabicCache.delete(el);
            }
        });
    }

    // =========================================================================
    // FIX: CHANGE LANGUAGE — Full override, no page reload needed
    // =========================================================================
    window.changeLanguage = function(lang) {
        if (['ar', 'en', 'fr'].indexOf(lang) === -1) return false;

        localStorage.setItem('language', lang);
        localStorage.setItem('superpro_language', lang);

        // Set direction
        document.documentElement.lang = lang;
        document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';

        // Update body class
        document.body.classList.remove('lang-ar', 'lang-en', 'lang-fr');
        document.body.classList.add('lang-' + lang);

        // Font
        if (lang !== 'ar') {
            document.body.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        } else {
            document.body.style.fontFamily = "'Tajawal', sans-serif";
        }

        // Update active language button
        document.querySelectorAll('.language-btn').forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) btn.classList.add('active');
        });

        // Apply translations
        revertToArabic();
        if (lang !== 'ar') {
            setTimeout(function() { deepTranslate(lang); }, 50);
        }

        // Update date format
        try {
            var now = new Date();
            var locale = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
            var dateEl = document.getElementById('current-date');
            if (dateEl) {
                dateEl.textContent = now.toLocaleDateString(locale, {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                });
            }
        } catch(e) {}

        // Toast notification
        var langNames = { ar: '🇸🇦 العربية', en: '🇺🇸 English', fr: '🇫🇷 Français' };
        try {
            if (typeof showToast === 'function') {
                showToast('🌍 ' + langNames[lang]);
            }
        } catch(e) {}

        return true;
    };

    // =========================================================================
    // FIX: NOTIFICATION SYSTEM — Mark all / Mark individual as read
    // =========================================================================
    function getReadNotifications() {
        try {
            return JSON.parse(localStorage.getItem('superpro_read_notifications') || '[]');
        } catch(e) { return []; }
    }

    function saveReadNotifications(arr) {
        try { localStorage.setItem('superpro_read_notifications', JSON.stringify(arr)); } catch(e) {}
    }

    function isAllMarkedRead() {
        return localStorage.getItem('superpro_all_notifications_read') === 'true';
    }

    function fixNotificationBell() {
        var bell = document.getElementById('notificationBell');
        var panel = document.getElementById('notificationPanel');
        var badge = document.getElementById('notificationBadge');
        if (!bell || !panel) return;

        // If all marked read, hide badge
        if (isAllMarkedRead() && badge) {
            badge.style.display = 'none';
            badge.textContent = '0';
        }

        // Fix mark-all-read button
        var markBtn = document.getElementById('markAllReadBtn');
        if (markBtn) {
            var newBtn = markBtn.cloneNode(true);
            markBtn.parentNode.replaceChild(newBtn, markBtn);
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Mark badge
                if (badge) {
                    badge.style.display = 'none';
                    badge.textContent = '0';
                }

                // Visual: fade all notification items
                var items = panel.querySelectorAll('.d-flex, .notification-item, .list-group-item');
                items.forEach(function(item) {
                    item.style.opacity = '0.4';
                    item.style.textDecoration = 'line-through';
                    item.classList.add('notification-read');
                });

                // Persist
                localStorage.setItem('superpro_all_notifications_read', 'true');
                saveReadNotifications([]);

                // Visual feedback
                var lang = localStorage.getItem('language') || 'ar';
                var msgs = {
                    ar: '✅ تم تحديد جميع الإشعارات كمقروءة',
                    en: '✅ All notifications marked as read',
                    fr: '✅ Toutes les notifications marquées comme lues'
                };
                if (typeof showToast === 'function') showToast(msgs[lang] || msgs.ar);
            });
        }

        // Add click-to-mark-read on individual notifications
        panel.addEventListener('click', function(e) {
            var item = e.target.closest('.d-flex, .notification-item, .list-group-item');
            if (item && !item.classList.contains('notification-read') && !e.target.closest('button')) {
                item.style.opacity = '0.4';
                item.style.textDecoration = 'line-through';
                item.classList.add('notification-read');

                // Update badge count
                if (badge) {
                    var count = parseInt(badge.textContent || '0') - 1;
                    if (count <= 0) {
                        badge.style.display = 'none';
                        badge.textContent = '0';
                    } else {
                        badge.textContent = count;
                    }
                }
            }
        });

        // Restore read state on panel open
        bell.addEventListener('click', function() {
            if (isAllMarkedRead()) {
                setTimeout(function() {
                    var items = panel.querySelectorAll('.d-flex, .notification-item, .list-group-item');
                    items.forEach(function(item) {
                        item.style.opacity = '0.4';
                        item.style.textDecoration = 'line-through';
                        item.classList.add('notification-read');
                    });
                }, 200);
            }
        });
    }

    // =========================================================================
    // FIX: ENSURE NAVIGATION WORKS
    // =========================================================================
    function ensureNavigation() {
        // Backup: ensure clicking sidebar items activates modules
        document.querySelectorAll('.nav-link[data-module]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                var moduleName = this.getAttribute('data-module');
                if (!moduleName) return;

                // Hide all modules
                document.querySelectorAll('.module-container').forEach(function(m) {
                    m.classList.remove('active-module', 'active');
                    m.style.display = 'none';
                });

                // Show target module
                var target = document.getElementById(moduleName);
                if (target) {
                    target.classList.add('active-module', 'active');
                    target.style.display = 'block';
                }

                // Update sidebar active state
                document.querySelectorAll('.nav-link[data-module]').forEach(function(l) {
                    l.classList.remove('active');
                    var li = l.closest('.nav-item');
                    if (li) li.classList.remove('active');
                });
                this.classList.add('active');
                var li = this.closest('.nav-item');
                if (li) li.classList.add('active');

                // Close sidebar on mobile
                if (window.innerWidth <= 768) {
                    var sidebar = document.getElementById('sidebar');
                    if (sidebar) sidebar.classList.remove('show', 'mobile-open');
                }

                // Load section-specific content
                try {
                    if (moduleName === 'dashboard' && typeof loadDashboard === 'function') loadDashboard();
                    if (moduleName === 'notifications' && typeof loadNotifications === 'function') loadNotifications();
                    if (moduleName === 'documents' && typeof loadDocuments === 'function') loadDocuments();
                    if (moduleName === 'activityLog' && typeof loadActivityLog === 'function') loadActivityLog();
                } catch(err) {
                    console.warn('Module load error:', err);
                }
            });
        });
    }

    // =========================================================================
    // FIX: ENSURE MODAL ADD BUTTONS WORK
    // =========================================================================
    function ensureModals() {
        // Re-bind data-bs-toggle="modal" buttons that might be disabled
        var modalBtns = document.querySelectorAll('[data-bs-toggle="modal"]');
        modalBtns.forEach(function(btn) {
            btn.style.pointerEvents = 'auto';
            btn.removeAttribute('disabled');
            btn.classList.remove('disabled');
        });

        // Ensure common modals can be triggered
        var modalIds = ['employeeModal', 'clientModal', 'contractModal', 'dailyWorkModal',
                        'dailyIncomeModal', 'dailyExpenseModal', 'serviceModal', 'financeModal',
                        'monthlyExpenseModal'];
        modalIds.forEach(function(id) {
            var modal = document.getElementById(id);
            if (modal) {
                // Ensure modal is properly initialized
                try {
                    if (typeof bootstrap !== 'undefined') {
                        bootstrap.Modal.getOrCreateInstance(modal);
                    }
                } catch(e) {}
            }
        });
    }

    // =========================================================================
    // FIX: TOOLTIPS FOR ACTION BUTTONS
    // =========================================================================
    function addTooltips() {
        var lang = localStorage.getItem('language') || 'ar';
        var tooltipMap = {
            ar: { edit: 'تعديل', delete: 'حذف', save: 'حفظ', view: 'عرض', print: 'طباعة', add: 'إضافة', close: 'إغلاق', search: 'بحث', download: 'تحميل', copy: 'نسخ', refresh: 'تحديث' },
            en: { edit: 'Edit', delete: 'Delete', save: 'Save', view: 'View', print: 'Print', add: 'Add', close: 'Close', search: 'Search', download: 'Download', copy: 'Copy', refresh: 'Refresh' },
            fr: { edit: 'Modifier', delete: 'Supprimer', save: 'Enregistrer', view: 'Afficher', print: 'Imprimer', add: 'Ajouter', close: 'Fermer', search: 'Rechercher', download: 'Télécharger', copy: 'Copier', refresh: 'Actualiser' }
        };
        var tips = tooltipMap[lang] || tooltipMap.ar;

        var iconMap = {
            'fa-edit': tips.edit, 'fa-pen': tips.edit, 'fa-pencil': tips.edit, 'fa-pencil-alt': tips.edit,
            'fa-trash': tips.delete, 'fa-trash-alt': tips.delete, 'fa-times': tips.close,
            'fa-save': tips.save, 'fa-floppy-disk': tips.save,
            'fa-eye': tips.view, 'fa-print': tips.print,
            'fa-plus': tips.add, 'fa-plus-circle': tips.add,
            'fa-search': tips.search, 'fa-download': tips.download,
            'fa-copy': tips.copy, 'fa-sync': tips.refresh, 'fa-sync-alt': tips.refresh
        };

        document.querySelectorAll('.btn i.fas, .btn i.far, .btn i.fa, button i.fas, button i.far').forEach(function(icon) {
            var btn = icon.closest('button, .btn, a');
            if (!btn || btn.getAttribute('data-tooltip')) return;

            for (var cls in iconMap) {
                if (icon.classList.contains(cls)) {
                    btn.setAttribute('data-tooltip', iconMap[cls]);
                    btn.setAttribute('title', iconMap[cls]);
                    break;
                }
            }
        });
    }

    // =========================================================================
    // TOAST CONTAINER FIX — Ensure design-enhancements showToast works
    // =========================================================================
    function fixToastContainer() {
        // Remove the original liveToast if it has visible raw HTML
        var liveToast = document.getElementById('liveToast');
        if (liveToast) {
            liveToast.style.display = 'none';
            liveToast.style.visibility = 'hidden';
        }

        // Ensure toast container from design-enhancements exists and works
        var tc = document.querySelector('.toast-container');
        if (!tc) {
            tc = document.createElement('div');
            tc.className = 'toast-container';
            document.body.appendChild(tc);
        }
    }

    // =========================================================================
    // FAB (Floating Action Button)
    // =========================================================================
    function createFAB() {
        if (document.getElementById('fabContainer')) return;

        var lang = localStorage.getItem('language') || 'ar';
        var labels = {
            ar: { emp: 'إضافة موظف', client: 'إضافة عميل', expense: 'إضافة مصروف', income: 'إضافة مدخول', task: 'إضافة مهمة' },
            en: { emp: 'Add Employee', client: 'Add Client', expense: 'Add Expense', income: 'Add Income', task: 'Add Task' },
            fr: { emp: 'Ajouter employé', client: 'Ajouter client', expense: 'Ajouter dépense', income: 'Ajouter revenu', task: 'Ajouter tâche' }
        };
        var l = labels[lang] || labels.ar;

        var fab = document.createElement('div');
        fab.id = 'fabContainer';
        fab.className = 'fab-container';
        fab.innerHTML =
            '<div class="fab-menu" id="fabMenu">' +
                '<button class="fab-item" data-action="employee"><i class="fas fa-user-plus me-2"></i>' + l.emp + '</button>' +
                '<button class="fab-item" data-action="client"><i class="fas fa-handshake me-2"></i>' + l.client + '</button>' +
                '<button class="fab-item" data-action="expense"><i class="fas fa-money-bill me-2"></i>' + l.expense + '</button>' +
                '<button class="fab-item" data-action="income"><i class="fas fa-coins me-2"></i>' + l.income + '</button>' +
                '<button class="fab-item" data-action="task"><i class="fas fa-tasks me-2"></i>' + l.task + '</button>' +
            '</div>' +
            '<button class="fab-main" id="fabMain"><i class="fas fa-plus"></i></button>';
        document.body.appendChild(fab);

        var mainBtn = document.getElementById('fabMain');
        var menu = document.getElementById('fabMenu');
        mainBtn.addEventListener('click', function() {
            menu.classList.toggle('show');
            mainBtn.classList.toggle('active');
        });

        menu.addEventListener('click', function(e) {
            var item = e.target.closest('.fab-item');
            if (!item) return;
            var action = item.getAttribute('data-action');
            var modalMap = {
                employee: 'employeeModal',
                client: 'clientModal',
                expense: 'dailyExpenseModal',
                income: 'dailyIncomeModal',
                task: null
            };

            // Navigate to module first
            var moduleMap = {
                employee: 'employees',
                client: 'clients',
                expense: 'dailyExpenses',
                income: 'dailyIncome',
                task: 'tasks'
            };

            var mod = moduleMap[action];
            if (mod) {
                var navLink = document.querySelector('.nav-link[data-module="' + mod + '"]');
                if (navLink) navLink.click();
            }

            // Open modal after navigation
            var modalId = modalMap[action];
            if (modalId) {
                setTimeout(function() {
                    try {
                        var modal = document.getElementById(modalId);
                        if (modal && typeof bootstrap !== 'undefined') {
                            new bootstrap.Modal(modal).show();
                        }
                    } catch(err) { console.error(err); }
                }, 300);
            }

            // Close FAB
            menu.classList.remove('show');
            mainBtn.classList.remove('active');
        });

        // Close FAB when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.fab-container')) {
                menu.classList.remove('show');
                mainBtn.classList.remove('active');
            }
        });
    }

    // =========================================================================
    // THEME SELECTOR
    // =========================================================================
    function createThemeSelector() {
        if (document.getElementById('themeSelector')) return;

        var colors = ['blue', 'green', 'purple', 'orange'];
        var selector = document.createElement('div');
        selector.id = 'themeSelector';
        selector.className = 'theme-selector';

        var current = localStorage.getItem('superpro_theme') || 'blue';

        colors.forEach(function(color) {
            var dot = document.createElement('span');
            dot.className = 'theme-dot' + (color === current ? ' active' : '');
            dot.setAttribute('data-color', color);
            dot.setAttribute('title', color.charAt(0).toUpperCase() + color.slice(1));
            dot.addEventListener('click', function() {
                document.body.setAttribute('data-theme-color', color);
                localStorage.setItem('superpro_theme', color);
                selector.querySelectorAll('.theme-dot').forEach(function(d) { d.classList.remove('active'); });
                dot.classList.add('active');
            });
            selector.appendChild(dot);
        });
        document.body.appendChild(selector);

        // Apply saved theme
        if (current !== 'blue') {
            document.body.setAttribute('data-theme-color', current);
        }
    }

    // =========================================================================
    // RESTORE LANGUAGE ON LOAD
    // =========================================================================
    function restoreLanguage() {
        var lang = localStorage.getItem('language') || localStorage.getItem('superpro_language') || 'ar';
        if (lang !== 'ar') {
            document.documentElement.lang = lang;
            document.documentElement.dir = 'ltr';
            document.body.classList.add('lang-' + lang);
            document.body.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";

            // Update active button
            document.querySelectorAll('.language-btn').forEach(function(btn) {
                btn.classList.remove('active');
                if (btn.getAttribute('data-lang') === lang) btn.classList.add('active');
            });

            setTimeout(function() { deepTranslate(lang); }, 800);
        }
    }

    // =========================================================================
    // MASTER INITIALIZATION
    // =========================================================================
    function initV4() {
        console.log('🔧 SuperPro v4 Master — Initializing...');

        // 1. Fix toast container
        fixToastContainer();

        // 2. Ensure navigation works (backup handler)
        ensureNavigation();

        // 3. Ensure modal buttons work
        ensureModals();

        // 4. Fix notifications
        fixNotificationBell();

        // 5. Add tooltips
        addTooltips();

        // 6. Create FAB
        createFAB();

        // 7. Create theme selector
        createThemeSelector();

        // 8. Restore language
        restoreLanguage();

        // 9. Re-apply tooltips after any dynamic content loads
        var observer = new MutationObserver(function(mutations) {
            var hasNewNodes = false;
            mutations.forEach(function(m) {
                if (m.addedNodes.length > 0) hasNewNodes = true;
            });
            if (hasNewNodes) {
                clearTimeout(window._tooltipDebounce);
                window._tooltipDebounce = setTimeout(function() {
                    addTooltips();
                }, 500);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        console.log('✅ SuperPro v4 Master — All fixes applied!');
    }

    // Run after everything else is loaded
    if (document.readyState === 'complete') {
        setTimeout(initV4, 300);
    } else {
        window.addEventListener('load', function() {
            setTimeout(initV4, 300);
        });
    }

})();
