/**
 * ===============================================
 * نظام إدارة اللغات المتقدم - Multilingual System
 * Language Management System v1.0
 * ===============================================
 */

// قاموس اللغات الشامل
const languagesDictionary = {
    // العربية
    ar: {
        // قائمة التنقل الرئيسية
        nav: {
            dashboard: 'لوحة التحكم',
            employees: 'شؤون الموظفين',
            attendance: 'الحضور والانصراف',
            clients: 'إدارة العملاء',
            contracts: 'إدارة العقود',
            dailyWork: 'العمل اليومي',
            dailyIncome: 'المدخولات اليومية',
            dailyExpenses: 'المصروفات اليومية',
            services: 'الخدمات',
            teams: 'إدارة الفرق',
            locations: 'المواقع والعملاء',
            ratings: 'التقييمات والآراء',
            packages: 'الحزم والباقات',
            finance: 'الحسابات المالية',
            payroll: 'الرواتب',
            calendar: 'التقويم',
            tasks: 'لوحة المهام',
            reports: 'التقارير',
            settings: 'الإعدادات'
        },
        // لوحة التحكم
        dashboard: {
            title: 'لوحة التحكم',
            totalEmployees: 'إجمالي الموظفين',
            newEmployees: 'موظف جديد',
            totalClients: 'إجمالي العملاء',
            newClients: 'عميل جديد',
            totalContracts: 'عدد العقود',
            activeContracts: 'عقد نشط',
            netBalance: 'الرصيد الصافي',
            todayProfit: 'صافي ربح اليوم',
            monthlyProfit: 'صافي ربح هذا الشهر',
            monthlyPerformance: 'الأداء الشهري',
            taskDistribution: 'توزيع المهام',
            recentAlerts: 'التنبيهات الحديثة',
            urgentTasks: 'المهام العاجلة',
            recentTransactions: 'آخر العمليات',
            quickSummary: 'ملخص مالي سريع',
            totalIncome: 'إجمالي المداخيل',
            totalExpenses: 'إجمالي المصاريف',
            netProfit: 'صافي الربح',
            revenue: 'الإيرادات',
            expenses: 'المصاريف',
            refresh: 'تحديث',
            noAlerts: 'لا توجد تنبيهات حالياً',
            noTasks: 'لا توجد مهام عاجلة',
            noTransactions: 'لا توجد عمليات حديثة',
            date: 'التاريخ',
            type: 'النوع',
            description: 'الوصف',
            amount: 'المبلغ'
        },
        // الأداء والإحصائيات
        performance: {
            thisMonth: 'هذا الشهر',
            lastMonth: 'الشهر الماضي',
            thisQuarter: 'هذا الربع',
            thisYear: 'هذه السنة',
            revenue: 'الإيرادات',
            expenses: 'المصاريف',
            profit: 'الربح',
            growth: 'النمو',
            percentage: '%',
            increase: 'زيادة',
            decrease: 'انخفاض',
            stable: 'مستقر'
        },
        // رسائل عامة
        common: {
            save: 'حفظ',
            cancel: 'إلغاء',
            edit: 'تعديل',
            delete: 'حذف',
            add: 'إضافة',
            export: 'تصدير',
            import: 'استيراد',
            search: 'بحث',
            filter: 'فلترة',
            loading: 'جاري التحميل...',
            success: 'نجح',
            error: 'خطأ',
            warning: 'تحذير',
            info: 'معلومة',
            close: 'إغلاق',
            language: 'اللغة',
            darkMode: 'الوضع الليلي'
        }
    },

    // الإنجليزية
    en: {
        nav: {
            dashboard: 'Dashboard',
            employees: 'Employees',
            attendance: 'Attendance',
            clients: 'Clients',
            contracts: 'Contracts',
            dailyWork: 'Daily Work',
            dailyIncome: 'Daily Income',
            dailyExpenses: 'Daily Expenses',
            services: 'Services',
            teams: 'Teams',
            locations: 'Locations',
            ratings: 'Ratings',
            packages: 'Packages',
            finance: 'Finance',
            payroll: 'Payroll',
            calendar: 'Calendar',
            tasks: 'Tasks',
            reports: 'Reports',
            settings: 'Settings'
        },
        dashboard: {
            title: 'Dashboard',
            totalEmployees: 'Total Employees',
            newEmployees: 'New Employee',
            totalClients: 'Total Clients',
            newClients: 'New Client',
            totalContracts: 'Total Contracts',
            activeContracts: 'Active Contracts',
            netBalance: 'Net Balance',
            todayProfit: 'Today\'s Profit',
            monthlyProfit: 'Monthly Profit',
            monthlyPerformance: 'Monthly Performance',
            taskDistribution: 'Task Distribution',
            recentAlerts: 'Recent Alerts',
            urgentTasks: 'Urgent Tasks',
            recentTransactions: 'Recent Transactions',
            quickSummary: 'Quick Summary',
            totalIncome: 'Total Income',
            totalExpenses: 'Total Expenses',
            netProfit: 'Net Profit',
            revenue: 'Revenue',
            expenses: 'Expenses',
            refresh: 'Refresh',
            noAlerts: 'No alerts at the moment',
            noTasks: 'No urgent tasks',
            noTransactions: 'No recent transactions',
            date: 'Date',
            type: 'Type',
            description: 'Description',
            amount: 'Amount'
        },
        performance: {
            thisMonth: 'This Month',
            lastMonth: 'Last Month',
            thisQuarter: 'This Quarter',
            thisYear: 'This Year',
            revenue: 'Revenue',
            expenses: 'Expenses',
            profit: 'Profit',
            growth: 'Growth',
            percentage: '%',
            increase: 'Increase',
            decrease: 'Decrease',
            stable: 'Stable'
        },
        common: {
            save: 'Save',
            cancel: 'Cancel',
            edit: 'Edit',
            delete: 'Delete',
            add: 'Add',
            export: 'Export',
            import: 'Import',
            search: 'Search',
            filter: 'Filter',
            loading: 'Loading...',
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info',
            close: 'Close',
            language: 'Language',
            darkMode: 'Dark Mode'
        }
    },

    // الفرنسية
    fr: {
        nav: {
            dashboard: 'Tableau de Bord',
            employees: 'Employés',
            attendance: 'Assiduité',
            clients: 'Clients',
            contracts: 'Contrats',
            dailyWork: 'Travail Quotidien',
            dailyIncome: 'Revenus Quotidiens',
            dailyExpenses: 'Dépenses Quotidiennes',
            services: 'Services',
            teams: 'Équipes',
            locations: 'Emplacements',
            ratings: 'Évaluations',
            packages: 'Forfaits',
            finance: 'Finances',
            payroll: 'Paies',
            calendar: 'Calendrier',
            tasks: 'Tâches',
            reports: 'Rapports',
            settings: 'Paramètres'
        },
        dashboard: {
            title: 'Tableau de Bord',
            totalEmployees: 'Total Employés',
            newEmployees: 'Nouvel Employé',
            totalClients: 'Total Clients',
            newClients: 'Nouveau Client',
            totalContracts: 'Total Contrats',
            activeContracts: 'Contrats Actifs',
            netBalance: 'Solde Net',
            todayProfit: 'Profit Aujourd\'hui',
            monthlyProfit: 'Profit Mensuel',
            monthlyPerformance: 'Performance Mensuelle',
            taskDistribution: 'Distribution des Tâches',
            recentAlerts: 'Alertes Récentes',
            urgentTasks: 'Tâches Urgentes',
            recentTransactions: 'Transactions Récentes',
            quickSummary: 'Résumé Rapide',
            totalIncome: 'Revenu Total',
            totalExpenses: 'Dépenses Totales',
            netProfit: 'Bénéfice Net',
            revenue: 'Chiffre d\'Affaires',
            expenses: 'Dépenses',
            refresh: 'Actualiser',
            noAlerts: 'Aucune alerte pour le moment',
            noTasks: 'Aucune tâche urgente',
            noTransactions: 'Aucune transaction récente',
            date: 'Date',
            type: 'Type',
            description: 'Description',
            amount: 'Montant'
        },
        performance: {
            thisMonth: 'Ce Mois',
            lastMonth: 'Mois Dernier',
            thisQuarter: 'Ce Trimestre',
            thisYear: 'Cette Année',
            revenue: 'Chiffre d\'Affaires',
            expenses: 'Dépenses',
            profit: 'Bénéfice',
            growth: 'Croissance',
            percentage: '%',
            increase: 'Augmentation',
            decrease: 'Diminution',
            stable: 'Stable'
        },
        common: {
            save: 'Enregistrer',
            cancel: 'Annuler',
            edit: 'Modifier',
            delete: 'Supprimer',
            add: 'Ajouter',
            export: 'Exporter',
            import: 'Importer',
            search: 'Rechercher',
            filter: 'Filtrer',
            loading: 'Chargement...',
            success: 'Succès',
            error: 'Erreur',
            warning: 'Avertissement',
            info: 'Info',
            close: 'Fermer',
            language: 'Langue',
            darkMode: 'Mode Sombre'
        }
    }
};

// نظام إدارة اللغات
class LanguageManager {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || 'ar';
        this.supportedLanguages = ['ar', 'en', 'fr'];
        this.initializeLanguage();
    }

    // الحصول على اللغة المحفوظة
    getStoredLanguage() {
        return localStorage.getItem('superpro_language') || 'ar';
    }

    // حفظ اللغة
    storeLanguage(lang) {
        localStorage.setItem('superpro_language', lang);
    }

    // تهيئة اللغة
    initializeLanguage() {
        this.applyLanguage(this.currentLanguage);
        this.setupLanguageSelector();
    }

    // تطبيق اللغة على الصفحة
    applyLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            lang = 'ar';
        }

        this.currentLanguage = lang;
        this.storeLanguage(lang);

        // تحديث اتجاه الصفحة
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

        // تطبيق على الجسم
        document.body.className = document.body.className.replace(/lang-\w+/, '');
        document.body.classList.add(`lang-${lang}`);

        // تحديث النصوص
        this.updatePageText();

        // حفظ اللغة الحالية
        this.storeLanguage(lang);
    }

    // تحديث نصوص الصفحة
    updatePageText() {
        const dict = languagesDictionary[this.currentLanguage];

        // تحديث العناصر بـ data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const keys = key.split('.');
            let value = dict;

            for (const k of keys) {
                value = value[k];
                if (!value) break;
            }

            if (value) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = value;
                } else {
                    element.textContent = value;
                }
            }
        });

        // تحديث العناصر بـ data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const keys = key.split('.');
            let value = dict;

            for (const k of keys) {
                value = value[k];
                if (!value) break;
            }

            if (value) {
                element.title = value;
            }
        });

        // إرسال حدث تغيير اللغة
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: this.currentLanguage } }));
    }

    // إنشاء محدد اللغة
    setupLanguageSelector() {
        const languageDropdown = document.getElementById('languageDropdown');
        if (!languageDropdown) return;

        const currentLang = this.currentLanguage;

        // تنظيف
        languageDropdown.innerHTML = '';

        // إضافة الخيارات
        const languages = [
            { code: 'ar', name: '🇸🇦 العربية', nativeName: 'العربية' },
            { code: 'en', name: '🇺🇸 English', nativeName: 'English' },
            { code: 'fr', name: '🇫🇷 Français', nativeName: 'Français' }
        ];

        languages.forEach(lang => {
            const option = document.createElement('a');
            option.className = `dropdown-item ${lang.code === currentLang ? 'active' : ''}`;
            option.href = '#';
            option.textContent = lang.name;
            option.setAttribute('data-language', lang.code);

            option.addEventListener('click', (e) => {
                e.preventDefault();
                this.changeLanguage(lang.code);
            });

            languageDropdown.appendChild(option);
        });

        // تحديث الزر الرئيسي
        const langBtn = document.querySelector('[data-bs-toggle="dropdown"][aria-controller="languageDropdown"]');
        if (langBtn) {
            const selected = languages.find(l => l.code === currentLang);
            if (selected) {
                langBtn.innerHTML = `<i class="fas fa-globe me-2"></i>${selected.name.split(' ')[1]}`;
            }
        }
    }

    // تغيير اللغة
    changeLanguage(lang) {
        this.applyLanguage(lang);
        this.setupLanguageSelector();

        // إعادة تحميل البيانات إن لزم الأمر
        if (window.updatePageText) {
            window.updatePageText();
        }

        // إظهار إشعار
        showToast(this.t('common.success'), 'success');
    }

    // الحصول على ترجمة
    t(key) {
        const keys = key.split('.');
        let value = languagesDictionary[this.currentLanguage];

        for (const k of keys) {
            value = value[k];
            if (!value) return key;
        }

        return value || key;
    }

    // الحصول على قاموس اللغة الحالية
    getDictionary() {
        return languagesDictionary[this.currentLanguage];
    }

    // الحصول على اللغات المدعومة
    getSupportedLanguages() {
        return [
            { code: 'ar', name: 'العربية', nativeName: 'العربية', flag: '🇸🇦' },
            { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
            { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' }
        ];
    }
}

// إنشاء مثيل مدير اللغات
let languageManager = new LanguageManager();

// دالة مساعدة للترجمة السريعة
function t(key) {
    return languageManager.t(key);
}

// إضافة ميزات متقدمة للتنسيق والتواريخ
LanguageManager.prototype.formatNumber = function(number, decimals = 2) {
    const locales = {
        ar: 'ar-SA',
        en: 'en-US',
        fr: 'fr-FR'
    };

    return new Intl.NumberFormat(locales[this.currentLanguage], {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(number);
};

// تنسيق العملة
LanguageManager.prototype.formatCurrency = function(amount, currency = 'QAR') {
    const locales = {
        ar: 'ar-SA',
        en: 'en-US',
        fr: 'fr-FR'
    };

    return new Intl.NumberFormat(locales[this.currentLanguage], {
        style: 'currency',
        currency: currency
    }).format(amount);
};

// تنسيق التاريخ
LanguageManager.prototype.formatDate = function(date, format = 'long') {
    const options = {
        short: { year: 'numeric', month: '2-digit', day: '2-digit' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    };

    const locales = {
        ar: 'ar-SA',
        en: 'en-US',
        fr: 'fr-FR'
    };

    return new Date(date).toLocaleDateString(locales[this.currentLanguage], options[format] || options.long);
};

// تنسيق الساعة
LanguageManager.prototype.formatTime = function(date) {
    const locales = {
        ar: 'ar-SA',
        en: 'en-US',
        fr: 'fr-FR'
    };

    return new Date(date).toLocaleTimeString(locales[this.currentLanguage]);
};

// الحصول على اسم الشهر
LanguageManager.prototype.getMonthName = function(monthIndex) {
    const months = {
        ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
             'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        en: ['January', 'February', 'March', 'April', 'May', 'June',
             'July', 'August', 'September', 'October', 'November', 'December'],
        fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
             'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    };

    return months[this.currentLanguage][monthIndex] || '';
};

// الحصول على اسم يوم الأسبوع
LanguageManager.prototype.getDayName = function(dayIndex) {
    const days = {
        ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
        en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    };

    return days[this.currentLanguage][dayIndex] || '';
};

// التحقق من اللغة الحالية
LanguageManager.prototype.isArabic = function() {
    return this.currentLanguage === 'ar';
};

LanguageManager.prototype.isEnglish = function() {
    return this.currentLanguage === 'en';
};

LanguageManager.prototype.isFrench = function() {
    return this.currentLanguage === 'fr';
};

// الحصول على الاتجاه (RTL/LTR)
LanguageManager.prototype.getDirection = function() {
    return this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
};

// تهيئة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    languageManager.initializeLanguage();
    console.log('✅ تم تحميل نظام إدارة اللغات المتقدم v2.0');
});
