// backup-system-enhanced.js - نظام نسخ احتياطي متعدد الخيارات
// ================================================

class BackupSystem {
    constructor() {
        this.backupTypes = {
            local: 'localStorage',
            session: 'sessionStorage',
            cloud: 'Firebase',
            file: 'File Download',
            print: 'Print'
        };
        
        this.backupSchedule = {
            daily: 24 * 60 * 60 * 1000,    // 24 ساعة
            weekly: 7 * 24 * 60 * 60 * 1000, // 7 أيام
            monthly: 30 * 24 * 60 * 60 * 1000 // 30 يوم
        };
        
        this.maxBackups = 10;
        this.compressionEnabled = true;
    }

    // إنشاء نسخة احتياطية كاملة
    async createFullBackup(type = 'local', options = {}) {
        try {
            const data = this.collectAllData();
            const backup = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                version: '2.1.0',
                type: 'full',
                data: data,
                metadata: {
                    totalRecords: this.countRecords(data),
                    size: this.calculateSize(data),
                    checksum: this.generateChecksum(data)
                }
            };

            // ضغط البيانات إذا كان مفعلاً
            if (this.compressionEnabled) {
                backup.data = this.compressData(backup.data);
                backup.compressed = true;
            }

            // حفظ النسخة الاحتياطية
            await this.saveBackup(backup, type, options);
            
            // تسجيل النسخة الاحتياطية
            this.logBackup(backup, type);
            
            return backup;
        } catch (error) {
            errorHandler.log(error, 'إنشاء نسخة احتياطية', 'error');
            throw error;
        }
    }

    // جمع جميع بيانات النظام
    collectAllData() {
        return {
            employees: employees || [],
            clients: clients || [],
            contracts: contracts || [],
            attendance: attendance || [],
            services: services || [],
            settings: settings || {},
            tasks: tasks || [],
            events: events || [],
            dailyWork: dailyWork || [],
            dailyIncome: dailyIncome || [],
            dailyExpenses: dailyExpenses || [],
            financialTransactions: financialTransactions || [],
            salaryAdvances: salaryAdvances || [],
            systemState: {
                theme: systemState.theme,
                language: systemState.currentLanguage,
                lastSync: systemState.lastSync
            }
        };
    }

    // حفظ النسخة الاحتياطية
    async saveBackup(backup, type, options) {
        switch (type) {
            case 'local':
                return this.saveToLocalStorage(backup);
            case 'session':
                return this.saveToSessionStorage(backup);
            case 'cloud':
                return this.saveToCloud(backup);
            case 'file':
                return this.downloadAsFile(backup, options);
            case 'print':
                return this.printBackup(backup);
            default:
                throw new Error('نوع النسخ الاحتياطي غير مدعوم');
        }
    }

    // حفظ في localStorage
    saveToLocalStorage(backup) {
        const backups = JSON.parse(localStorage.getItem('superpro_backups') || '[]');
        backups.push(backup);
        
        // الحفاظ على الحد الأقصى للنسخ الاحتياطية
        if (backups.length > this.maxBackups) {
            backups.shift();
        }
        
        localStorage.setItem('superpro_backups', JSON.stringify(backups));
        return true;
    }

    // حفظ في sessionStorage
    saveToSessionStorage(backup) {
        const backups = JSON.parse(sessionStorage.getItem('superpro_backups') || '[]');
        backups.push(backup);
        
        if (backups.length > 5) { // حد أقل لـ sessionStorage
            backups.shift();
        }
        
        sessionStorage.setItem('superpro_backups', JSON.stringify(backups));
        return true;
    }

    // حفظ في السحابة
    async saveToCloud(backup) {
        if (!systemState.firebaseDB) {
            throw new Error('Firebase غير متاح');
        }
        
        await systemState.firebaseDB.ref('backups').child(backup.id).set(backup);
        return true;
    }

    // تحميل كملف
    downloadAsFile(backup, options = {}) {
        const filename = options.filename || `superpro-backup-${new Date().toISOString().split('T')[0]}.json`;
        const data = JSON.stringify(backup, null, 2);
        
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        return true;
    }

    // طباعة النسخة الاحتياطية
    printBackup(backup) {
        const printWindow = window.open('', '_blank');
        const data = JSON.stringify(backup, null, 2);
        
        printWindow.document.write(`
            <html dir="rtl">
            <head>
                <title>SUPER PRO SYSTEM - نسخة احتياطية</title>
                <style>
                    body { font-family: 'Tajawal', sans-serif; direction: rtl; }
                    pre { background: #f5f5f5; padding: 20px; }
                </style>
            </head>
            <body>
                <h1>نسخة احتياطية - SUPER PRO SYSTEM</h1>
                <p><strong>التاريخ:</strong> ${backup.timestamp}</p>
                <p><strong>الإصدار:</strong> ${backup.version}</p>
                <p><strong>السجل:</strong> ${backup.metadata.totalRecords}</p>
                <p><strong>الحجم:</strong> ${backup.metadata.size}</p>
                <hr>
                <pre>${data}</pre>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
        return true;
    }

    // استعادة النسخة الاحتياطية
    async restoreBackup(backupId, type = 'local') {
        try {
            const backup = await this.loadBackup(backupId, type);
            
            if (!backup) {
                throw new Error('النسخة الاحتياطية غير موجودة');
            }
            
            // التحقق من سلامة البيانات
            if (!this.validateBackup(backup)) {
                throw new Error('النسخة الاحتياطية تالغة');
            }
            
            // فك ضغط البيانات إذا كانت مضغوطة
            let data = backup.data;
            if (backup.compressed) {
                data = this.decompressData(data);
            }
            
            // استعادة البيانات
            this.restoreData(data);
            
            // حفظ البيانات المستعادة
            saveLocalData();
            
            // تحديث الواجهة
            updateDashboard();
            
            showNotification('تم استعادة النسخة الاحتياطية بنجاح', 'success');
            return true;
        } catch (error) {
            errorHandler.log(error, 'استعادة نسخة احتياطية', 'error');
            throw error;
        }
    }

    // تحميل النسخة الاحتياطية
    async loadBackup(backupId, type) {
        switch (type) {
            case 'local':
                const localBackups = JSON.parse(localStorage.getItem('superpro_backups') || '[]');
                return localBackups.find(b => b.id == backupId);
            case 'session':
                const sessionBackups = JSON.parse(sessionStorage.getItem('superpro_backups') || '[]');
                return sessionBackups.find(b => b.id == backupId);
            case 'cloud':
                if (!systemState.firebaseDB) return null;
                const snapshot = await systemState.firebaseDB.ref('backups').child(backupId).once('value');
                return snapshot.val();
            default:
                return null;
        }
    }

    // التحقق من صحة النسخة الاحتياطية
    validateBackup(backup) {
        if (!backup || !backup.data || !backup.timestamp) {
            return false;
        }
        
        // التحقق من الـ checksum
        if (backup.metadata && backup.metadata.checksum) {
            const currentChecksum = this.generateChecksum(backup.data);
            return currentChecksum === backup.metadata.checksum;
        }
        
        return true;
    }

    // استعادة البيانات
    restoreData(data) {
        if (data.employees) employees = data.employees;
        if (data.clients) clients = data.clients;
        if (data.contracts) contracts = data.contracts;
        if (data.attendance) attendance = data.attendance;
        if (data.services) services = data.services;
        if (data.settings) settings = data.settings;
        if (data.tasks) tasks = data.tasks;
        if (data.events) events = data.events;
        if (data.dailyWork) dailyWork = data.dailyWork;
        if (data.dailyIncome) dailyIncome = data.dailyIncome;
        if (data.dailyExpenses) dailyExpenses = data.dailyExpenses;
        if (data.financialTransactions) financialTransactions = data.financialTransactions;
        if (data.salaryAdvances) salaryAdvances = data.salaryAdvances;
        
        // استعادة إعدادات النظام
        if (data.systemState) {
            if (data.systemState.theme) setTheme(data.systemState.theme);
            if (data.systemState.language) setLanguage(data.systemState.language);
            if (data.systemState.lastSync) systemState.lastSync = data.systemState.lastSync;
        }
    }

    // الحصول على قائمة النسخ الاحتياطية
    async getBackupList(type = 'local') {
        try {
            switch (type) {
                case 'local':
                    return JSON.parse(localStorage.getItem('superpro_backups') || '[]');
                case 'session':
                    return JSON.parse(sessionStorage.getItem('superpro_backups') || '[]');
                case 'cloud':
                    if (!systemState.firebaseDB) return [];
                    const snapshot = await systemState.firebaseDB.ref('backups').once('value');
                    return snapshot.val() ? Object.values(snapshot.val()) : [];
                default:
                    return [];
            }
        } catch (error) {
            errorHandler.log(error, 'جلب قائمة النسخ الاحتياطية', 'error');
            return [];
        }
    }

    // حذف نسخة احتياطية
    async deleteBackup(backupId, type = 'local') {
        try {
            switch (type) {
                case 'local':
                    const localBackups = JSON.parse(localStorage.getItem('superpro_backups') || '[]');
                    const filteredLocal = localBackups.filter(b => b.id !== backupId);
                    localStorage.setItem('superpro_backups', JSON.stringify(filteredLocal));
                    break;
                case 'session':
                    const sessionBackups = JSON.parse(sessionStorage.getItem('superpro_backups') || '[]');
                    const filteredSession = sessionBackups.filter(b => b.id !== backupId);
                    sessionStorage.setItem('superpro_backups', JSON.stringify(filteredSession));
                    break;
                case 'cloud':
                    if (systemState.firebaseDB) {
                        await systemState.firebaseDB.ref('backups').child(backupId).remove();
                    }
                    break;
            }
            return true;
        } catch (error) {
            errorHandler.log(error, 'حذف نسخة احتياطية', 'error');
            throw error;
        }
    }

    // دوال مساعدة
    countRecords(data) {
        let count = 0;
        for (const key in data) {
            if (Array.isArray(data[key])) {
                count += data[key].length;
            } else if (typeof data[key] === 'object') {
                count += Object.keys(data[key]).length;
            }
        }
        return count;
    }

    calculateSize(data) {
        const bytes = new Blob([JSON.stringify(data)]).size;
        return this.formatBytes(bytes);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generateChecksum(data) {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    compressData(data) {
        // ضغط بسيط - يمكن تحسينه
        return JSON.stringify(data).replace(/"/g, '').replace(/:/g, '=').replace(/,/g, '&');
    }

    decompressData(compressed) {
        // فك ضغط بسيط
        return JSON.parse(compressed.replace(/=/g, ':').replace(/&/g, ','));
    }

    logBackup(backup, type) {
        console.log(`✅ تم إنشاء نسخة احتياطية (${type}):`, {
            id: backup.id,
            timestamp: backup.timestamp,
            size: backup.metadata.size,
            records: backup.metadata.totalRecords
        });
    }

    // النسخ الاحتياطي المجدول
    startScheduledBackup(interval = 'daily') {
        const ms = this.backupSchedule[interval];
        if (!ms) return;
        
        setInterval(async () => {
            try {
                await this.createFullBackup('local');
                showNotification('تم إنشاء نسخة احتياطية مجدولة', 'success');
            } catch (error) {
                errorHandler.log(error, 'نسخة احتياطية مجدولة', 'error');
            }
        }, ms);
    }
}

// إنشاء نسخة واحدة من نظام النسخ الاحتياطي
const backupSystem = new BackupSystem();

// تصدير للإستخدام العام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BackupSystem;
} else {
    window.BackupSystem = BackupSystem;
    window.backupSystem = backupSystem;
}
