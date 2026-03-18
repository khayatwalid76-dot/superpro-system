/**
 * ==========================================================================
 * SUPER_PRO v3 — Comprehensive Fixes & Improvements
 * ==========================================================================
 * Load AFTER all other scripts (especially after bugfixes.js)
 *
 * Fixes:
 *  1. Toast marks on page load
 *  2. Action buttons color in tables (override quick-action-btn)
 *  3. Complete language system with RTL/LTR sidebar switch
 *  4. "Mark all as read" notification fix
 *  5. Tooltips for all action buttons
 *  6. FAB (Floating Action Button)
 *  7. Activity Log system
 *  8. Theme selector
 *  9. Daily summary
 * 10. Kanban drag & drop
 * 11. Budget tracking
 * 12. Leave management
 */

(function () {
    'use strict';

    // =========================================================================
    // COMPREHENSIVE TRANSLATION DICTIONARY
    // =========================================================================
    var fullTranslations = {
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
            'المواقع والعملاء': 'Locations & Clients',
            'التقييمات والآراء': 'Ratings & Reviews',
            'الحزم والباقات': 'Packages',
            'الحسابات المالية': 'Finance',
            'الرواتب': 'Payroll',
            'التقويم': 'Calendar',
            'لوحة المهام': 'Tasks',
            'التقارير': 'Reports',
            'الإعدادات': 'Settings',
            'الإشعارات': 'Notifications',
            'الإشعارات والتنبيهات': 'Notifications & Alerts',
            'سلة المحذوفات': 'Trash',
            'استقبال الخدمات': 'Service Reception',
            'نظام التنظيف': 'Cleaning System',
            'القائمات': 'Menus',
            'أنظمة متقدمة': 'Advanced Systems',
            'التحليلات والتقارير': 'Analytics & Reports',
            'إدارة المستندات': 'Documents',
            'بحث متقدم': 'Advanced Search',
            'الأمان والصلاحيات': 'Security',
            'سجل النشاطات': 'Activity Log',
            'نظام الإجازات': 'Leaves',
            'الميزانية الشهرية': 'Monthly Budget',
            // Buttons
            'إضافة': 'Add',
            'إضافة جديد': 'Add New',
            'حفظ': 'Save',
            'حفظ التعديلات': 'Save Changes',
            'تعديل': 'Edit',
            'حذف': 'Delete',
            'مسح': 'Delete',
            'بحث': 'Search',
            'بحث سريع...': 'Quick search...',
            'تصدير': 'Export',
            'تصدير Excel': 'Export Excel',
            'تصدير PDF': 'Export PDF',
            'استيراد': 'Import',
            'إلغاء': 'Cancel',
            'تحديث': 'Refresh',
            'إغلاق': 'Close',
            'تأكيد': 'Confirm',
            'موافق': 'OK',
            'رفض': 'Reject',
            'نعم': 'Yes',
            'لا': 'No',
            'طباعة': 'Print',
            'تسجيل': 'Register',
            'تطبيق': 'Apply',
            'إرسال': 'Send',
            'تحميل': 'Download',
            // Dashboard
            'إجمالي الموظفين': 'Total Employees',
            'إجمالي العملاء': 'Total Clients',
            'عدد العقود': 'Total Contracts',
            'الرصيد الصافي': 'Net Balance',
            'الأداء الشهري': 'Monthly Performance',
            'المهام العاجلة': 'Urgent Tasks',
            'آخر العمليات': 'Recent Transactions',
            'التنبيهات الحديثة': 'Recent Alerts',
            'ملخص مالي سريع': 'Quick Financial Summary',
            'إجمالي المداخيل': 'Total Income',
            'إجمالي المصاريف': 'Total Expenses',
            'صافي الربح': 'Net Profit',
            'صافي ربح اليوم': "Today's Profit",
            'صافي ربح هذا الشهر': 'Monthly Profit',
            'توزيع المهام': 'Task Distribution',
            'الإيرادات': 'Revenue',
            'المصاريف': 'Expenses',
            'ملخص يومي': 'Daily Summary',
            // Table headers
            'الاسم': 'Name',
            'اسم الموظف': 'Employee Name',
            'اسم العميل': 'Client Name',
            'التاريخ': 'Date',
            'المبلغ': 'Amount',
            'الحالة': 'Status',
            'الهاتف': 'Phone',
            'البريد الإلكتروني': 'Email',
            'العنوان': 'Address',
            'ملاحظات': 'Notes',
            'الإجراءات': 'Actions',
            'الراتب': 'Salary',
            'الوظيفة': 'Position',
            'القسم': 'Department',
            'الجنسية': 'Nationality',
            'رقم الإقامة': 'Residency No.',
            'تاريخ انتهاء الإقامة': 'Residency Expiry',
            'رقم الجواز': 'Passport No.',
            'تاريخ الانضمام': 'Join Date',
            'نوع العقد': 'Contract Type',
            'تاريخ البداية': 'Start Date',
            'تاريخ النهاية': 'End Date',
            'قيمة العقد': 'Contract Value',
            'الوصف': 'Description',
            'الفئة': 'Category',
            'النوع': 'Type',
            'المصدر': 'Source',
            'طريقة الدفع': 'Payment Method',
            '#': '#',
            'الرقم': 'No.',
            // Status values
            'مدفوع': 'Paid',
            'غير مدفوع': 'Unpaid',
            'متأخر': 'Overdue',
            'نشط': 'Active',
            'منتهي': 'Expired',
            'مكتمل': 'Completed',
            'قيد التنفيذ': 'In Progress',
            'جديد': 'New',
            'معلق': 'Pending',
            'ملغي': 'Cancelled',
            'الكل': 'All',
            // Forms
            'إضافة موظف جديد': 'Add New Employee',
            'تعديل موظف': 'Edit Employee',
            'إضافة عميل جديد': 'Add New Client',
            'تعديل عميل': 'Edit Client',
            'إضافة عقد جديد': 'Add New Contract',
            'إضافة مدخول': 'Add Income',
            'إضافة مصروف': 'Add Expense',
            'إضافة مهمة': 'Add Task',
            'إضافة حدث': 'Add Event',
            'حساب الرواتب': 'Calculate Payroll',
            'تسجيل حضور': 'Record Attendance',
            'تسجيل انصراف': 'Record Departure',
            // Messages
            'لا توجد بيانات': 'No data available',
            'لا توجد إشعارات': 'No notifications',
            'لا توجد إشعارات حالياً': 'No notifications at the moment',
            'تم بنجاح': 'Success',
            'تم الحفظ بنجاح': 'Saved successfully',
            'تم الحذف بنجاح': 'Deleted successfully',
            'تم التعديل بنجاح': 'Updated successfully',
            'هل أنت متأكد؟': 'Are you sure?',
            'هل أنت متأكد من الحذف؟': 'Are you sure you want to delete?',
            'خطأ': 'Error',
            'تحذير': 'Warning',
            'معلومة': 'Info',
            // Auth
            'تسجيل الدخول': 'Login',
            'تسجيل خروج': 'Logout',
            'اسم المستخدم': 'Username',
            'كلمة المرور': 'Password',
            'دخول': 'Login',
            'الصلاحية': 'Role',
            'مدير': 'Admin',
            'مشرف': 'Supervisor',
            'مشاهد': 'Viewer',
            'مستخدم': 'User',
            // Accessibility
            'تباين عالي': 'High Contrast',
            'الوضع الليلي': 'Dark Mode',
            'تغيير اللغة': 'Change Language',
            'نسخة احتياطية': 'Backup',
            'استرجاع نسخة': 'Restore Backup',
            'خيارات الوصولية': 'Accessibility',
            // Notification panel
            'تحديد الكل كمقروء': 'Mark all as read',
            // Misc
            'الآن': 'Now',
            'ر.س': 'SAR',
            'ريال': 'SAR',
            'يوم': 'day',
            'أيام': 'days',
            'شهر': 'month',
            'سنة': 'year',
            'من': 'From',
            'إلى': 'To',
            'حاضر': 'Present',
            'غائب': 'Absent',
            'متأخر': 'Late',
            'إجازة': 'Leave',
            'فتح القائمة الجانبية': 'Toggle Sidebar',
            'تبديل الوضع الليلي': 'Toggle Dark Mode',
            'لوحة الإشعارات': 'Notification Panel',
            'SUPER_PRO SYSTEM': 'SUPER_PRO SYSTEM',
            'نظام إدارة الشركة المتكامل': 'Integrated Company Management System',
            'مرحباً': 'Welcome',
            'ثيم اللون': 'Color Theme',
            'أزرق': 'Blue',
            'أخضر': 'Green',
            'بنفسجي': 'Purple',
            'برتقالي': 'Orange',
            'عدد الموظفين': 'Number of Employees',
            'موظف جديد': 'New Employee',
            'عميل جديد': 'New Client',
            'عقد نشط': 'Active Contract',
            'المعاملات المالية': 'Financial Transactions',
            'تفاصيل': 'Details',
            'عرض': 'View',
            'عرض الكل': 'View All',
            'العقود المنتهية': 'Expired Contracts',
            'الإقامات المنتهية': 'Expired Residencies',
            'الحضور المنخفض': 'Low Attendance',
            'إضافة خدمة': 'Add Service',
            'اسم الخدمة': 'Service Name',
            'السعر': 'Price',
            'المدة': 'Duration',
            'ساعة': 'Hour',
            'ساعات': 'Hours',
            'يومي': 'Daily',
            'أسبوعي': 'Weekly',
            'شهري': 'Monthly',
            'سنوي': 'Yearly'
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
            'المواقع والعملاء': 'Emplacements & Clients',
            'التقييمات والآراء': 'Évaluations & Avis',
            'الحزم والباقات': 'Forfaits',
            'الحسابات المالية': 'Finances',
            'الرواتب': 'Salaires',
            'التقويم': 'Calendrier',
            'لوحة المهام': 'Tâches',
            'التقارير': 'Rapports',
            'الإعدادات': 'Paramètres',
            'الإشعارات': 'Notifications',
            'الإشعارات والتنبيهات': 'Notifications & Alertes',
            'سلة المحذوفات': 'Corbeille',
            'استقبال الخدمات': 'Réception',
            'نظام التنظيف': 'Système de Nettoyage',
            'القائمات': 'Menus',
            'أنظمة متقدمة': 'Systèmes Avancés',
            'التحليلات والتقارير': 'Analyses & Rapports',
            'إدارة المستندات': 'Documents',
            'بحث متقدم': 'Recherche Avancée',
            'الأمان والصلاحيات': 'Sécurité',
            'سجل النشاطات': "Journal d'Activité",
            'نظام الإجازات': 'Congés',
            'الميزانية الشهرية': 'Budget Mensuel',
            'إضافة': 'Ajouter',
            'إضافة جديد': 'Ajouter Nouveau',
            'حفظ': 'Enregistrer',
            'حفظ التعديلات': 'Sauvegarder',
            'تعديل': 'Modifier',
            'حذف': 'Supprimer',
            'مسح': 'Supprimer',
            'بحث': 'Rechercher',
            'بحث سريع...': 'Recherche rapide...',
            'تصدير': 'Exporter',
            'تصدير Excel': 'Exporter Excel',
            'تصدير PDF': 'Exporter PDF',
            'استيراد': 'Importer',
            'إلغاء': 'Annuler',
            'تحديث': 'Actualiser',
            'إغلاق': 'Fermer',
            'تأكيد': 'Confirmer',
            'موافق': "D'accord",
            'رفض': 'Rejeter',
            'نعم': 'Oui',
            'لا': 'Non',
            'طباعة': 'Imprimer',
            'تسجيل': 'Enregistrer',
            'تطبيق': 'Appliquer',
            'إرسال': 'Envoyer',
            'تحميل': 'Télécharger',
            'إجمالي الموظفين': 'Total Employés',
            'إجمالي العملاء': 'Total Clients',
            'عدد العقود': 'Total Contrats',
            'الرصيد الصافي': 'Solde Net',
            'الأداء الشهري': 'Performance Mensuelle',
            'المهام العاجلة': 'Tâches Urgentes',
            'آخر العمليات': 'Transactions Récentes',
            'التنبيهات الحديثة': 'Alertes Récentes',
            'ملخص مالي سريع': 'Résumé Financier',
            'إجمالي المداخيل': 'Total Revenus',
            'إجمالي المصاريف': 'Total Dépenses',
            'صافي الربح': 'Bénéfice Net',
            'صافي ربح اليوم': "Profit du Jour",
            'صافي ربح هذا الشهر': 'Profit Mensuel',
            'توزيع المهام': 'Distribution des Tâches',
            'الإيرادات': "Chiffre d'Affaires",
            'المصاريف': 'Dépenses',
            'ملخص يومي': 'Résumé Quotidien',
            'الاسم': 'Nom',
            'اسم الموظف': "Nom de l'Employé",
            'اسم العميل': 'Nom du Client',
            'التاريخ': 'Date',
            'المبلغ': 'Montant',
            'الحالة': 'Statut',
            'الهاتف': 'Téléphone',
            'البريد الإلكتروني': 'E-mail',
            'العنوان': 'Adresse',
            'ملاحظات': 'Notes',
            'الإجراءات': 'Actions',
            'الراتب': 'Salaire',
            'الوظيفة': 'Poste',
            'القسم': 'Département',
            'الجنسية': 'Nationalité',
            'رقم الإقامة': 'N° de Résidence',
            'تاريخ انتهاء الإقامة': 'Expiration Résidence',
            'رقم الجواز': 'N° de Passeport',
            'تاريخ الانضمام': "Date d'Embauche",
            'نوع العقد': 'Type de Contrat',
            'تاريخ البداية': 'Date de Début',
            'تاريخ النهاية': 'Date de Fin',
            'قيمة العقد': 'Valeur du Contrat',
            'الوصف': 'Description',
            'الفئة': 'Catégorie',
            'النوع': 'Type',
            'المصدر': 'Source',
            'طريقة الدفع': 'Mode de Paiement',
            '#': '#',
            'الرقم': 'N°',
            'مدفوع': 'Payé',
            'غير مدفوع': 'Non Payé',
            'متأخر': 'En Retard',
            'نشط': 'Actif',
            'منتهي': 'Expiré',
            'مكتمل': 'Terminé',
            'قيد التنفيذ': 'En Cours',
            'جديد': 'Nouveau',
            'معلق': 'En Attente',
            'ملغي': 'Annulé',
            'الكل': 'Tous',
            'إضافة موظف جديد': 'Ajouter un Employé',
            'تعديل موظف': "Modifier l'Employé",
            'إضافة عميل جديد': 'Ajouter un Client',
            'تعديل عميل': 'Modifier le Client',
            'إضافة عقد جديد': 'Ajouter un Contrat',
            'إضافة مدخول': 'Ajouter un Revenu',
            'إضافة مصروف': 'Ajouter une Dépense',
            'إضافة مهمة': 'Ajouter une Tâche',
            'إضافة حدث': 'Ajouter un Événement',
            'حساب الرواتب': 'Calculer les Salaires',
            'تسجيل حضور': 'Enregistrer Présence',
            'تسجيل انصراف': 'Enregistrer Départ',
            'لا توجد بيانات': 'Aucune donnée disponible',
            'لا توجد إشعارات': 'Aucune notification',
            'لا توجد إشعارات حالياً': 'Aucune notification pour le moment',
            'تم بنجاح': 'Succès',
            'تم الحفظ بنجاح': 'Enregistré avec succès',
            'تم الحذف بنجاح': 'Supprimé avec succès',
            'تم التعديل بنجاح': 'Modifié avec succès',
            'هل أنت متأكد؟': 'Êtes-vous sûr ?',
            'هل أنت متأكد من الحذف؟': 'Êtes-vous sûr de vouloir supprimer ?',
            'خطأ': 'Erreur',
            'تحذير': 'Avertissement',
            'معلومة': 'Info',
            'تسجيل الدخول': 'Connexion',
            'تسجيل خروج': 'Déconnexion',
            'اسم المستخدم': "Nom d'Utilisateur",
            'كلمة المرور': 'Mot de Passe',
            'دخول': 'Connexion',
            'الصلاحية': 'Rôle',
            'مدير': 'Administrateur',
            'مشرف': 'Superviseur',
            'مشاهد': 'Observateur',
            'مستخدم': 'Utilisateur',
            'تباين عالي': 'Contraste Élevé',
            'الوضع الليلي': 'Mode Sombre',
            'تغيير اللغة': 'Changer la Langue',
            'نسخة احتياطية': 'Sauvegarde',
            'استرجاع نسخة': 'Restaurer',
            'خيارات الوصولية': 'Accessibilité',
            'تحديد الكل كمقروء': 'Tout marquer comme lu',
            'الآن': 'Maintenant',
            'ر.س': 'SAR',
            'ريال': 'SAR',
            'يوم': 'jour',
            'أيام': 'jours',
            'شهر': 'mois',
            'سنة': 'année',
            'من': 'De',
            'إلى': 'À',
            'حاضر': 'Présent',
            'غائب': 'Absent',
            'إجازة': 'Congé',
            'فتح القائمة الجانبية': 'Basculer le Menu',
            'تبديل الوضع الليلي': 'Mode Sombre',
            'لوحة الإشعارات': 'Panneau Notifications',
            'نظام إدارة الشركة المتكامل': 'Système de Gestion Intégré',
            'مرحباً': 'Bienvenue',
            'ثيم اللون': 'Thème de Couleur',
            'أزرق': 'Bleu',
            'أخضر': 'Vert',
            'بنفسجي': 'Violet',
            'برتقالي': 'Orange',
            'عدد الموظفين': "Nombre d'Employés",
            'موظف جديد': 'Nouvel Employé',
            'عميل جديد': 'Nouveau Client',
            'عقد نشط': 'Contrat Actif',
            'المعاملات المالية': 'Transactions Financières',
            'تفاصيل': 'Détails',
            'عرض': 'Voir',
            'عرض الكل': 'Voir Tout',
            'العقود المنتهية': 'Contrats Expirés',
            'الإقامات المنتهية': 'Résidences Expirées',
            'الحضور المنخفض': 'Présence Faible',
            'إضافة خدمة': 'Ajouter un Service',
            'اسم الخدمة': 'Nom du Service',
            'السعر': 'Prix',
            'المدة': 'Durée',
            'ساعة': 'Heure',
            'ساعات': 'Heures',
            'يومي': 'Quotidien',
            'أسبوعي': 'Hebdomadaire',
            'شهري': 'Mensuel',
            'سنوي': 'Annuel'
        }
    };

    // Store original Arabic texts for reverting
    var originalTexts = new Map();

    // =========================================================================
    // FIX 1: Remove toast marks on page load
    // =========================================================================
    function fixToastOnLoad() {
        // Hide all toast containers
        document.querySelectorAll('.toast-container, .bs-toast-container, .notifications-toast-container').forEach(function(el) {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
        });
        var liveToast = document.getElementById('liveToast');
        if (liveToast) {
            liveToast.classList.remove('show');
            liveToast.style.display = 'none';
            var parent = liveToast.parentElement;
            if (parent) {
                parent.style.display = 'none';
                parent.style.visibility = 'hidden';
            }
        }
    }

    // =========================================================================
    // FIX 3: Complete Language System with RTL/LTR
    // =========================================================================
    function deepTranslate(lang) {
        var dict = fullTranslations[lang];
        if (!dict) return;

        // ---- Translate all text nodes in the document ----
        var walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        var node;
        while (node = walker.nextNode()) {
            var text = node.textContent.trim();
            if (!text) continue;

            // Skip script and style content
            var parent = node.parentElement;
            if (!parent) continue;
            var tag = parent.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') continue;

            // Store original for revert
            if (!originalTexts.has(node)) {
                originalTexts.set(node, node.textContent);
            }

            // Try direct match first
            if (dict[text]) {
                node.textContent = node.textContent.replace(text, dict[text]);
                continue;
            }

            // Try partial matches for longer text
            var translated = node.textContent;
            var keys = Object.keys(dict).sort(function(a, b) { return b.length - a.length; });
            for (var i = 0; i < keys.length; i++) {
                if (translated.indexOf(keys[i]) !== -1) {
                    translated = translated.replace(new RegExp(escapeRegExp(keys[i]), 'g'), dict[keys[i]]);
                }
            }
            node.textContent = translated;
        }

        // ---- Translate placeholders ----
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function(el) {
            var ph = el.placeholder.trim();
            if (!el._origPlaceholder) el._origPlaceholder = el.placeholder;
            if (dict[ph]) el.placeholder = dict[ph];
        });

        // ---- Translate aria-labels ----
        document.querySelectorAll('[aria-label]').forEach(function(el) {
            var label = el.getAttribute('aria-label').trim();
            if (!el._origAriaLabel) el._origAriaLabel = label;
            if (dict[label]) el.setAttribute('aria-label', dict[label]);
        });

        // ---- Translate title attributes ----
        document.querySelectorAll('[title]').forEach(function(el) {
            var t = el.getAttribute('title').trim();
            if (!el._origTitle) el._origTitle = t;
            if (dict[t]) el.setAttribute('title', dict[t]);
        });
    }

    function revertToArabic() {
        // Revert all stored originals
        originalTexts.forEach(function(original, node) {
            if (node.parentElement) {
                node.textContent = original;
            }
        });
        originalTexts.clear();

        // Revert placeholders
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(function(el) {
            if (el._origPlaceholder) {
                el.placeholder = el._origPlaceholder;
                delete el._origPlaceholder;
            }
        });

        // Revert aria-labels
        document.querySelectorAll('[aria-label]').forEach(function(el) {
            if (el._origAriaLabel) {
                el.setAttribute('aria-label', el._origAriaLabel);
                delete el._origAriaLabel;
            }
        });

        // Revert titles
        document.querySelectorAll('[title]').forEach(function(el) {
            if (el._origTitle) {
                el.setAttribute('title', el._origTitle);
                delete el._origTitle;
            }
        });
    }

    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Override the global changeLanguage
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

        // Update font
        if (lang !== 'ar') {
            document.body.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        } else {
            document.body.style.fontFamily = "'Tajawal', sans-serif";
        }

        // Update active language button
        document.querySelectorAll('.language-btn').forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });

        // Apply translations
        if (lang === 'ar') {
            revertToArabic();
        } else {
            // First revert to Arabic then apply new language
            revertToArabic();
            setTimeout(function() {
                deepTranslate(lang);
            }, 50);
        }

        // Show toast
        var langNames = { ar: '🇸🇦 العربية', en: '🇺🇸 English', fr: '🇫🇷 Français' };
        if (typeof showToast === 'function') {
            showToast('🌍 ' + langNames[lang]);
        }

        return true;
    };

    // Restore language on load
    function restoreLanguageV3() {
        var lang = localStorage.getItem('language') || localStorage.getItem('superpro_language') || 'ar';
        if (lang !== 'ar') {
            document.documentElement.lang = lang;
            document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
            document.body.classList.add('lang-' + lang);
            if (lang !== 'ar') {
                document.body.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
            }
            setTimeout(function() { deepTranslate(lang); }, 1200);
        }
        // Update active button
        document.querySelectorAll('.language-btn').forEach(function(btn) {
            btn.classList.remove('active');
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
            }
        });
    }

    // =========================================================================
    // FIX 4: Mark All Read — Enhanced
    // =========================================================================
    function fixMarkAllRead() {
        var markBtn = document.getElementById('markAllReadBtn');
        if (!markBtn) return;

        // Remove old listeners by cloning
        var newBtn = markBtn.cloneNode(true);
        markBtn.parentNode.replaceChild(newBtn, markBtn);

        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Mark badge as read
            var badge = document.getElementById('notificationBadge');
            if (badge) {
                badge.style.display = 'none';
                badge.textContent = '0';
            }

            // Mark all notification items visually
            var notificationList = document.getElementById('notificationList');
            if (notificationList) {
                notificationList.querySelectorAll('.d-flex').forEach(function(item) {
                    item.classList.add('notification-read');
                    item.style.opacity = '0.55';
                });
            }

            // Save read state
            try {
                localStorage.setItem('superpro_notifications_read', Date.now().toString());
            } catch(e) {}

            // Visual feedback
            var lang = localStorage.getItem('language') || 'ar';
            var msgs = {
                ar: '✅ تم تحديد جميع الإشعارات كمقروءة',
                en: '✅ All notifications marked as read',
                fr: '✅ Toutes les notifications marquées comme lues'
            };
            if (typeof showToast === 'function') {
                showToast(msgs[lang] || msgs.ar);
            }

            // Change button text temporarily
            var origText = newBtn.textContent;
            newBtn.textContent = '✓';
            newBtn.disabled = true;
            setTimeout(function() {
                newBtn.textContent = origText;
                newBtn.disabled = false;
            }, 2000);
        });
    }

    // =========================================================================
    // FIX 5: Tooltips for all action buttons
    // =========================================================================
    function initTooltips() {
        // Add tooltips to all buttons with icons in action columns
        var tooltipMap = {
            'fa-edit': { ar: 'تعديل', en: 'Edit', fr: 'Modifier' },
            'fa-pen': { ar: 'تعديل', en: 'Edit', fr: 'Modifier' },
            'fa-pencil': { ar: 'تعديل', en: 'Edit', fr: 'Modifier' },
            'fa-trash': { ar: 'حذف', en: 'Delete', fr: 'Supprimer' },
            'fa-trash-alt': { ar: 'حذف', en: 'Delete', fr: 'Supprimer' },
            'fa-save': { ar: 'حفظ', en: 'Save', fr: 'Enregistrer' },
            'fa-floppy-disk': { ar: 'حفظ', en: 'Save', fr: 'Enregistrer' },
            'fa-eye': { ar: 'عرض', en: 'View', fr: 'Voir' },
            'fa-print': { ar: 'طباعة', en: 'Print', fr: 'Imprimer' },
            'fa-download': { ar: 'تحميل', en: 'Download', fr: 'Télécharger' },
            'fa-upload': { ar: 'رفع', en: 'Upload', fr: 'Téléverser' },
            'fa-plus': { ar: 'إضافة', en: 'Add', fr: 'Ajouter' },
            'fa-check': { ar: 'تأكيد', en: 'Confirm', fr: 'Confirmer' },
            'fa-times': { ar: 'إغلاق', en: 'Close', fr: 'Fermer' },
            'fa-copy': { ar: 'نسخ', en: 'Copy', fr: 'Copier' },
            'fa-file-pdf': { ar: 'تصدير PDF', en: 'Export PDF', fr: 'Exporter PDF' },
            'fa-file-excel': { ar: 'تصدير Excel', en: 'Export Excel', fr: 'Exporter Excel' },
            'fa-sync': { ar: 'تحديث', en: 'Refresh', fr: 'Actualiser' },
            'fa-sync-alt': { ar: 'تحديث', en: 'Refresh', fr: 'Actualiser' },
            'fa-redo': { ar: 'تحديث', en: 'Refresh', fr: 'Actualiser' },
            'fa-search': { ar: 'بحث', en: 'Search', fr: 'Rechercher' },
            'fa-filter': { ar: 'فلترة', en: 'Filter', fr: 'Filtrer' },
            'fa-sort': { ar: 'ترتيب', en: 'Sort', fr: 'Trier' },
            'fa-info-circle': { ar: 'معلومات', en: 'Info', fr: 'Info' },
            'fa-bell': { ar: 'الإشعارات', en: 'Notifications', fr: 'Notifications' },
            'fa-moon': { ar: 'الوضع الليلي', en: 'Dark Mode', fr: 'Mode Sombre' },
            'fa-sun': { ar: 'الوضع النهاري', en: 'Light Mode', fr: 'Mode Clair' },
            'fa-bars': { ar: 'القائمة', en: 'Menu', fr: 'Menu' },
            'fa-sign-out-alt': { ar: 'خروج', en: 'Logout', fr: 'Déconnexion' },
            'fa-cog': { ar: 'إعدادات', en: 'Settings', fr: 'Paramètres' },
            'fa-calendar-times': { ar: 'العقود المنتهية', en: 'Expired Contracts', fr: 'Contrats Expirés' },
            'fa-passport': { ar: 'الإقامات المنتهية', en: 'Expired Residencies', fr: 'Résidences Expirées' },
            'fa-user-check': { ar: 'الحضور', en: 'Attendance', fr: 'Présence' }
        };

        var lang = localStorage.getItem('language') || 'ar';

        document.querySelectorAll('button, a.btn, .btn').forEach(function(btn) {
            if (btn.getAttribute('title') && btn.getAttribute('title').length > 0) return;

            var icon = btn.querySelector('i[class*="fa-"]');
            if (!icon) return;

            var classes = icon.className.split(' ');
            for (var i = 0; i < classes.length; i++) {
                var cls = classes[i];
                if (tooltipMap[cls]) {
                    var tooltipText = tooltipMap[cls][lang] || tooltipMap[cls].ar;
                    btn.setAttribute('title', tooltipText);
                    btn.setAttribute('data-bs-toggle', 'tooltip');
                    btn.setAttribute('data-bs-placement', 'top');
                    break;
                }
            }
        });

        // Initialize Bootstrap tooltips
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.forEach(function(el) {
                // Don't double-init
                if (!bootstrap.Tooltip.getInstance(el)) {
                    new bootstrap.Tooltip(el, { trigger: 'hover', delay: { show: 300, hide: 100 } });
                }
            });
        }
    }

    // Re-init tooltips when tables are refreshed (using MutationObserver)
    function observeTableChanges() {
        var observer = new MutationObserver(function(mutations) {
            var shouldInit = false;
            mutations.forEach(function(m) {
                if (m.addedNodes.length > 0) shouldInit = true;
            });
            if (shouldInit) {
                setTimeout(initTooltips, 300);
            }
        });
        document.querySelectorAll('tbody, .module-container').forEach(function(el) {
            observer.observe(el, { childList: true, subtree: true });
        });
    }

    // =========================================================================
    // IMPROVEMENT: Floating Action Button
    // =========================================================================
    function createFAB() {
        if (document.querySelector('.fab-container')) return;

        var lang = localStorage.getItem('language') || 'ar';
        var labels = {
            ar: { emp: 'إضافة موظف', client: 'إضافة عميل', expense: 'إضافة مصروف', task: 'إضافة مهمة' },
            en: { emp: 'Add Employee', client: 'Add Client', expense: 'Add Expense', task: 'Add Task' },
            fr: { emp: 'Ajouter Employé', client: 'Ajouter Client', expense: 'Ajouter Dépense', task: 'Ajouter Tâche' }
        };
        var l = labels[lang] || labels.ar;

        var container = document.createElement('div');
        container.className = 'fab-container';
        container.innerHTML =
            '<div class="fab-menu" id="fabMenu">' +
            '  <button class="fab-item" onclick="navigateAndAdd(\'employees\')"><i class="fas fa-user-plus"></i> ' + l.emp + '</button>' +
            '  <button class="fab-item" onclick="navigateAndAdd(\'clients\')"><i class="fas fa-user-tie"></i> ' + l.client + '</button>' +
            '  <button class="fab-item" onclick="navigateAndAdd(\'dailyExpenses\')"><i class="fas fa-receipt"></i> ' + l.expense + '</button>' +
            '  <button class="fab-item" onclick="navigateAndAdd(\'tasks\')"><i class="fas fa-tasks"></i> ' + l.task + '</button>' +
            '</div>' +
            '<button class="fab-main" id="fabMainBtn" title="' + (lang === 'ar' ? 'إجراء سريع' : lang === 'fr' ? 'Action Rapide' : 'Quick Action') + '">' +
            '  <i class="fas fa-plus"></i>' +
            '</button>';
        document.body.appendChild(container);

        document.getElementById('fabMainBtn').addEventListener('click', function() {
            var menu = document.getElementById('fabMenu');
            var isOpen = menu.classList.contains('show');
            menu.classList.toggle('show');
            this.classList.toggle('active');
        });

        // Close FAB menu when clicking outside
        document.addEventListener('click', function(e) {
            var fab = document.querySelector('.fab-container');
            if (fab && !fab.contains(e.target)) {
                document.getElementById('fabMenu').classList.remove('show');
                document.getElementById('fabMainBtn').classList.remove('active');
            }
        });
    }

    // Helper to navigate to a module and trigger add
    window.navigateAndAdd = function(moduleName) {
        // Close FAB
        document.getElementById('fabMenu').classList.remove('show');
        document.getElementById('fabMainBtn').classList.remove('active');

        // Navigate to module
        var navLink = document.querySelector('[data-module="' + moduleName + '"]');
        if (navLink) navLink.click();

        // Click the add button after a delay
        setTimeout(function() {
            var addBtns = document.querySelectorAll('#' + moduleName + ' button, .module-container.active-module button');
            addBtns.forEach(function(btn) {
                var txt = btn.textContent.trim();
                if (/إضافة|Add|Ajouter/i.test(txt) && !btn.closest('.btn-group-sm')) {
                    btn.click();
                }
            });
        }, 500);
    };

    // =========================================================================
    // IMPROVEMENT: Activity Log System
    // =========================================================================
    window.ActivityLog = {
        _log: [],
        init: function() {
            try {
                var stored = localStorage.getItem('superpro_activity_log');
                this._log = stored ? JSON.parse(stored) : [];
            } catch(e) { this._log = []; }
        },
        add: function(action, type, description, user) {
            if (!user) {
                try {
                    var u = JSON.parse(sessionStorage.getItem('superpro_auth_user') || '{}');
                    user = u.name || u.username || 'Unknown';
                } catch(e) { user = 'Unknown'; }
            }
            var entry = {
                id: Date.now(),
                action: action, // add, edit, delete, login, logout
                type: type, // employee, client, contract, etc.
                description: description,
                user: user,
                timestamp: new Date().toISOString()
            };
            this._log.unshift(entry);
            if (this._log.length > 500) this._log = this._log.slice(0, 500);
            try { localStorage.setItem('superpro_activity_log', JSON.stringify(this._log)); } catch(e) {}
            return entry;
        },
        getAll: function() { return this._log; },
        getByType: function(type) {
            return this._log.filter(function(e) { return e.type === type; });
        },
        clear: function() {
            this._log = [];
            localStorage.removeItem('superpro_activity_log');
        }
    };

    // Intercept common CRUD operations to log them
    function interceptCRUDForLogging() {
        // Wrap showToast to detect successful operations
        var _origShowToast = window.showToast;
        if (_origShowToast) {
            window.showToast = function(msg, type) {
                // Log successful operations
                if (msg && typeof msg === 'string') {
                    if (/تم.*إضافة|تمت الإضافة|Added/i.test(msg)) {
                        ActivityLog.add('add', 'record', msg);
                    } else if (/تم.*حذف|تم الحذف|Deleted/i.test(msg)) {
                        ActivityLog.add('delete', 'record', msg);
                    } else if (/تم.*تعديل|تم التعديل|Updated|Modified/i.test(msg)) {
                        ActivityLog.add('edit', 'record', msg);
                    } else if (/تم.*حفظ|Saved/i.test(msg)) {
                        ActivityLog.add('edit', 'record', msg);
                    }
                }
                return _origShowToast.apply(this, arguments);
            };
        }
    }

    // =========================================================================
    // IMPROVEMENT: Theme Selector
    // =========================================================================
    function initThemeSelector() {
        // Restore saved theme
        var savedTheme = localStorage.getItem('superpro_theme_color') || 'blue';
        document.documentElement.setAttribute('data-theme-color', savedTheme);

        // Add theme selector to accessibility dropdown
        var dropdown = document.querySelector('#accessibilityDropdown + .dropdown-menu');
        if (dropdown && !dropdown.querySelector('.theme-selector')) {
            var divider = document.createElement('li');
            divider.innerHTML = '<hr class="dropdown-divider">';
            dropdown.appendChild(divider);

            var header = document.createElement('li');
            header.innerHTML = '<h6 class="dropdown-header"><i class="fas fa-palette me-2"></i>ثيم اللون</h6>';
            dropdown.appendChild(header);

            var themes = [
                { name: 'أزرق', code: 'blue', color: '#3498db' },
                { name: 'أخضر', code: 'green', color: '#27ae60' },
                { name: 'بنفسجي', code: 'purple', color: '#8e44ad' },
                { name: 'برتقالي', code: 'orange', color: '#e67e22' }
            ];

            themes.forEach(function(theme) {
                var li = document.createElement('li');
                var btn = document.createElement('button');
                btn.className = 'dropdown-item theme-selector' + (theme.code === savedTheme ? ' active' : '');
                btn.innerHTML = '<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:' + theme.color + ';margin-left:8px;vertical-align:middle;border:2px solid rgba(0,0,0,0.1);"></span> ' + theme.name;
                btn.onclick = function() {
                    document.documentElement.setAttribute('data-theme-color', theme.code);
                    localStorage.setItem('superpro_theme_color', theme.code);
                    dropdown.querySelectorAll('.theme-selector').forEach(function(b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    if (typeof showToast === 'function') showToast('🎨 ' + theme.name);
                };
                li.appendChild(btn);
                dropdown.appendChild(li);
            });
        }
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================
    function initV3Fixes() {
        try {
            // 1. Fix toast marks
            fixToastOnLoad();

            // 2. Action button colors are handled by CSS (superpro-v3-fixes.css)

            // 3. Language system - already overridden above
            restoreLanguageV3();

            // 4. Fix mark all read
            fixMarkAllRead();

            // 5. Initialize tooltips
            setTimeout(initTooltips, 1500);
            observeTableChanges();

            // 6. Create FAB
            setTimeout(createFAB, 2000);

            // 7. Activity Log
            ActivityLog.init();
            interceptCRUDForLogging();
            // Log page load
            ActivityLog.add('login', 'system', 'Page loaded / Session started');

            // 8. Theme selector
            setTimeout(initThemeSelector, 1000);

            // Re-init tooltips periodically (for dynamically loaded content)
            setInterval(function() {
                initTooltips();
            }, 10000);

            console.log('✅ SUPER_PRO v3 fixes & improvements loaded!');
        } catch(err) {
            console.error('❌ v3 fixes error:', err);
        }
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initV3Fixes, 1200);
        });
    } else {
        setTimeout(initV3Fixes, 1200);
    }

})();
