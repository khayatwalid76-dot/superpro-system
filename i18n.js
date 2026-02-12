// نظام التدويل الدولي (i18n)
// Internationalization System

class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'ar';
        this.translations = {};
        this.fallbackLang = 'ar';
        this.init();
    }

    init() {
        this.loadTranslations();
        this.setLanguage(this.currentLang);
        this.addLanguageSelector();
    }

    // تحميل الترجمات
    loadTranslations() {
        this.translations = {
            ar: {
                // القائمة الرئيسية
                dashboard: 'لوحة التحكم',
                employees: 'شؤون الموظفين',
                clients: 'إدارة العملاء',
                contracts: 'إدارة العقود',
                attendance: 'الحضور والانصراف',
                services: 'الخدمات',
                finance: 'الحسابات المالية',
                payroll: 'الرواتب',
                calendar: 'التقويم',
                tasks: 'لوحة المهام',
                reports: 'التقارير',
                settings: 'الإعدادات',
                
                // الأزرار
                save: 'حفظ',
                cancel: 'إلغاء',
                delete: 'حذف',
                edit: 'تعديل',
                add: 'إضافة',
                search: 'بحث',
                export: 'تصدير',
                import: 'استيراد',
                refresh: 'تحديث',
                
                // الرسائل
                success: 'تمت العملية بنجاح',
                error: 'حدث خطأ',
                warning: 'تنبيه',
                info: 'معلومات',
                confirm_delete: 'هل أنت متأكد من الحذف؟',
                data_saved: 'تم حفظ البيانات',
                data_loaded: 'تم تحميل البيانات',
                
                // الموظفين
                employee_name: 'اسم الموظف',
                employee_job: 'الوظيفة',
                employee_salary: 'الراتب',
                employee_nationality: 'الجنسية',
                employee_status: 'الحالة',
                employee_phone: 'رقم الهاتف',
                employee_hire_date: 'تاريخ التوظيف',
                employee_residency_expiry: 'انتهاء الإقامة',
                
                // العملاء
                client_name: 'اسم العميل',
                client_phone: 'رقم الهاتف',
                client_email: 'البريد الإلكتروني',
                client_address: 'العنوان',
                client_area: 'المنطقة',
                
                // العقود
                contract_number: 'رقم العقد',
                contract_client: 'العميل',
                contract_employee: 'الموظف',
                contract_start_date: 'تاريخ البدء',
                contract_end_date: 'تاريخ الانتهاء',
                contract_amount: 'المبلغ',
                
                // المالية
                income: 'إيرادات',
                expenses: 'مصروفات',
                amount: 'المبلغ',
                description: 'الوصف',
                date: 'التاريخ',
                
                // التقارير
                total_employees: 'إجمالي الموظفين',
                total_clients: 'إجمالي العملاء',
                total_contracts: 'إجمالي العقود',
                net_profit: 'صافي الربح',
                
                // الوصولية
                high_contrast: 'تباين عالي',
                large_text: 'نص كبير',
                dark_mode: 'الوضع الليلي',
                accessibility: 'الوصولية'
            },
            
            en: {
                // Main Menu
                dashboard: 'Dashboard',
                employees: 'Employees',
                clients: 'Clients',
                contracts: 'Contracts',
                attendance: 'Attendance',
                services: 'Services',
                finance: 'Finance',
                payroll: 'Payroll',
                calendar: 'Calendar',
                tasks: 'Tasks',
                reports: 'Reports',
                settings: 'Settings',
                
                // Buttons
                save: 'Save',
                cancel: 'Cancel',
                delete: 'Delete',
                edit: 'Edit',
                add: 'Add',
                search: 'Search',
                export: 'Export',
                import: 'Import',
                refresh: 'Refresh',
                
                // Messages
                success: 'Operation completed successfully',
                error: 'An error occurred',
                warning: 'Warning',
                info: 'Information',
                confirm_delete: 'Are you sure you want to delete?',
                data_saved: 'Data saved successfully',
                data_loaded: 'Data loaded successfully',
                
                // Employees
                employee_name: 'Employee Name',
                employee_job: 'Job',
                employee_salary: 'Salary',
                employee_nationality: 'Nationality',
                employee_status: 'Status',
                employee_phone: 'Phone',
                employee_hire_date: 'Hire Date',
                employee_residency_expiry: 'Residency Expiry',
                
                // Clients
                client_name: 'Client Name',
                client_phone: 'Phone',
                client_email: 'Email',
                client_address: 'Address',
                client_area: 'Area',
                
                // Contracts
                contract_number: 'Contract Number',
                contract_client: 'Client',
                contract_employee: 'Employee',
                contract_start_date: 'Start Date',
                contract_end_date: 'End Date',
                contract_amount: 'Amount',
                
                // Finance
                income: 'Income',
                expenses: 'Expenses',
                amount: 'Amount',
                description: 'Description',
                date: 'Date',
                
                // Reports
                total_employees: 'Total Employees',
                total_clients: 'Total Clients',
                total_contracts: 'Total Contracts',
                net_profit: 'Net Profit',
                
                // Accessibility
                high_contrast: 'High Contrast',
                large_text: 'Large Text',
                dark_mode: 'Dark Mode',
                accessibility: 'Accessibility'
            },
            
            fr: {
                // Menu Principal
                dashboard: 'Tableau de bord',
                employees: 'Employés',
                clients: 'Clients',
                contracts: 'Contrats',
                attendance: 'Présence',
                services: 'Services',
                finance: 'Finance',
                payroll: 'Paie',
                calendar: 'Calendrier',
                tasks: 'Tâches',
                reports: 'Rapports',
                settings: 'Paramètres',
                
                // Boutons
                save: 'Enregistrer',
                cancel: 'Annuler',
                delete: 'Supprimer',
                edit: 'Modifier',
                add: 'Ajouter',
                search: 'Rechercher',
                export: 'Exporter',
                import: 'Importer',
                refresh: 'Actualiser',
                
                // Messages
                success: 'Opération réussie',
                error: 'Une erreur est survenue',
                warning: 'Avertissement',
                info: 'Information',
                confirm_delete: 'Êtes-vous sûr de vouloir supprimer?',
                data_saved: 'Données enregistrées',
                data_loaded: 'Données chargées',
                
                // Employés
                employee_name: 'Nom de l\'employé',
                employee_job: 'Poste',
                employee_salary: 'Salaire',
                employee_nationality: 'Nationalité',
                employee_status: 'Statut',
                employee_phone: 'Téléphone',
                employee_hire_date: 'Date d\'embauche',
                employee_residency_expiry: 'Expiration de résidence',
                
                // Clients
                client_name: 'Nom du client',
                client_phone: 'Téléphone',
                client_email: 'Email',
                client_address: 'Adresse',
                client_area: 'Région',
                
                // Contrats
                contract_number: 'Numéro de contrat',
                contract_client: 'Client',
                contract_employee: 'Employé',
                contract_start_date: 'Date de début',
                contract_end_date: 'Date de fin',
                contract_amount: 'Montant',
                
                // Finance
                income: 'Revenus',
                expenses: 'Dépenses',
                amount: 'Montant',
                description: 'Description',
                date: 'Date',
                
                // Rapports
                total_employees: 'Total des employés',
                total_clients: 'Total des clients',
                total_contracts: 'Total des contrats',
                net_profit: 'Bénéfice net',
                
                // Accessibilité
                high_contrast: 'Contraste élevé',
                large_text: 'Grand texte',
                dark_mode: 'Mode sombre',
                accessibility: 'Accessibilité'
            }
        };
    }

    // تعيين اللغة
    setLanguage(lang) {
        if (!this.translations[lang]) {
            console.warn(`Language '${lang}' not found, using fallback '${this.fallbackLang}'`);
            lang = this.fallbackLang;
        }
        
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        
        // تحديث اتجاه الصفحة
        document.documentElement.lang = lang;
        document.documentElement.dir = this.getDirection(lang);
        
        // تحديث جميع العناصر
        this.updateAllElements();
        
        // تحديث عنوان الصفحة
        this.updatePageTitle();
        
        console.log(`🌐 Language changed to: ${lang}`);
    }

    // الحصول على اتجاه اللغة
    getDirection(lang) {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(lang) ? 'rtl' : 'ltr';
    }

    // ترجمة النص
    t(key, params = {}) {
        const translation = this.translations[this.currentLang]?.[key] || 
                          this.translations[this.fallbackLang]?.[key] || 
                          key;
        
        // استبدال المتغيرات
        return this.interpolate(translation, params);
    }

    // استبدال المتغيرات في النص
    interpolate(text, params) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    // تحديث جميع العناصر
    updateAllElements() {
        // تحديث العناصر مع data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.dataset.i18n;
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                element.placeholder = translation;
            } else {
                element.textContent = translation;
            }
        });
        
        // تحديث العناصر مع data-i18n-html
        document.querySelectorAll('[data-i18n-html]').forEach(element => {
            const key = element.dataset.i18nHtml;
            element.innerHTML = this.t(key);
        });
        
        // تحديث العناصر مع data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.dataset.i18nTitle;
            element.title = this.t(key);
        });
    }

    // تحديث عنوان الصفحة
    updatePageTitle() {
        const title = document.querySelector('title');
        if (title) {
            title.textContent = this.t('app_title');
        }
    }

    // إضافة منتقي اللغة
    addLanguageSelector() {
        const selector = document.createElement('div');
        selector.className = 'dropdown me-2';
        selector.innerHTML = `
            <button class="btn btn-outline-light btn-sm dropdown-toggle" type="button" id="languageSelector" data-bs-toggle="dropdown">
                <i class="fas fa-globe me-2"></i>
                <span id="currentLangName">${this.getLanguageName(this.currentLang)}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="languageSelector">
                <li><button class="dropdown-item" onclick="i18n.setLanguage('ar')" type="button">
                    🇸🇦 العربية
                </button></li>
                <li><button class="dropdown-item" onclick="i18n.setLanguage('en')" type="button">
                    🇺🇸 English
                </button></li>
                <li><button class="dropdown-item" onclick="i18n.setLanguage('fr')" type="button">
                    🇫🇷 Français
                </button></li>
            </ul>
        `;
        
        // إضافة إلى الشريط العلوي
        const navbar = document.querySelector('.navbar .d-flex.align-items-center');
        if (navbar) {
            navbar.insertBefore(selector, navbar.firstChild);
        }
    }

    // الحصول على اسم اللغة
    getLanguageName(lang) {
        const names = {
            ar: 'العربية',
            en: 'English',
            fr: 'Français'
        };
        return names[lang] || lang;
    }

    // الحصول على اللغات المتاحة
    getAvailableLanguages() {
        return Object.keys(this.translations).map(lang => ({
            code: lang,
            name: this.getLanguageName(lang),
            direction: this.getDirection(lang)
        }));
    }

    // إضافة لغة جديدة
    addLanguage(lang, translations) {
        this.translations[lang] = translations;
        console.log(`🌐 Added language: ${lang}`);
    }

    // تصدير الترجمات
    exportTranslations() {
        const data = JSON.stringify(this.translations, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `translations_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // استيراد الترجمات
    importTranslations(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                Object.assign(this.translations, data);
                this.updateAllElements();
                console.log('🌐 Translations imported successfully');
            } catch (error) {
                console.error('❌ Error importing translations:', error);
            }
        };
        reader.readAsText(file);
    }
}

// تهيئة نظام التدويل
let i18n;

window.addEventListener('DOMContentLoaded', () => {
    i18n = new I18nManager();
    
    // إضافة دالة عالمية للترجمة
    window.t = (key, params) => i18n.t(key, params);
    
    console.log('🌐 I18n System initialized');
});

console.log('🌐 I18n System loaded');
