// نظام النسخ الاحتياطي المتقدم
// Advanced Backup System

class AdvancedBackupSystem {
    constructor() {
        this.backupSchedule = localStorage.getItem('backupSchedule') || 'daily';
        this.maxBackups = parseInt(localStorage.getItem('maxBackups')) || 30;
        this.backupLocations = JSON.parse(localStorage.getItem('backupLocations')) || ['local', 'cloud'];
        this.encryptionEnabled = localStorage.getItem('encryptionEnabled') === 'true';
        this.init();
    }

    init() {
        this.setupAutoBackup();
        this.addBackupControls();
        this.loadBackupHistory();
        this.cleanupOldBackups();
    }

    // إعداد النسخ الاحتياطي التلقائي
    setupAutoBackup() {
        const intervals = {
            hourly: 3600000,      // ساعة
            daily: 86400000,       // يوم
            weekly: 604800000,     // أسبوع
            monthly: 2592000000    // شهر
        };

        const interval = intervals[this.backupSchedule] || intervals.daily;
        
        setInterval(() => {
            this.performAutoBackup();
        }, interval);

        console.log(`🔄 Auto backup scheduled: ${this.backupSchedule} (${interval}ms)`);
    }

    // تنفيذ النسخ الاحتياطي التلقائي
    async performAutoBackup() {
        try {
            const backupData = await this.createBackup();
            await this.saveBackup(backupData, 'auto');
            
            console.log('✅ Auto backup completed');
            
            // إشعار للمستخدم
            if (typeof trackEvent === 'function') {
                trackEvent('Backup', 'Auto Backup', this.backupSchedule);
            }
        } catch (error) {
            console.error('❌ Auto backup failed:', error);
        }
    }

    // إنشاء نسخة احتياطية
    async createBackup() {
        const allData = {
            employees: window.employees || [],
            clients: window.clients || [],
            contracts: window.contracts || [],
            attendance: window.attendance || [],
            services: window.services || [],
            settings: window.settings || {},
            tasks: window.tasks || [],
            events: window.events || [],
            dailyWork: window.dailyWork || [],
            dailyIncome: window.dailyIncome || [],
            dailyExpenses: window.dailyExpenses || [],
            financialTransactions: window.financialTransactions || [],
            salaryAdvances: window.salaryAdvances || [],
            
            // معلومات النسخة
            backupInfo: {
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                schedule: this.backupSchedule,
                locations: this.backupLocations,
                encrypted: this.encryptionEnabled,
                dataSize: this.calculateDataSize()
            }
        };

        // تشفير البيانات إذا مفعّل
        if (this.encryptionEnabled) {
            allData.data = await this.encryptData(JSON.stringify(allData));
            allData.encrypted = true;
        }

        return allData;
    }

    // حساب حجم البيانات
    calculateDataSize() {
        const data = {
            employees: window.employees || [],
            clients: window.clients || [],
            contracts: window.contracts || []
        };
        
        const sizeInBytes = new Blob([JSON.stringify(data)]).size;
        return this.formatBytes(sizeInBytes);
    }

    // تنسيق البايتات
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // حفظ النسخة الاحتياطية
    async saveBackup(backupData, type = 'manual') {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupId = `${type}_${timestamp}`;

        // حفظ محلياً
        if (this.backupLocations.includes('local')) {
            await this.saveLocalBackup(backupData, backupId);
        }

        // حفظ في السحابة
        if (this.backupLocations.includes('cloud') && window.cloudStorage) {
            await this.saveCloudBackup(backupData, backupId);
        }

        // حفظ في التاريخ
        this.addToBackupHistory(backupData, backupId, type);
    }

    // حفظ النسخة المحلية
    async saveLocalBackup(backupData, backupId) {
        try {
            // حفظ في IndexedDB
            await this.saveToIndexedDB(backupData, backupId);
            
            // حفظ في localStorage كنسخة احتياطية
            const compressedData = this.compressData(JSON.stringify(backupData));
            localStorage.setItem(`backup_${backupId}`, compressedData);
            
            console.log('💾 Local backup saved');
        } catch (error) {
            console.error('❌ Local backup failed:', error);
        }
    }

    // حفظ في IndexedDB
    async saveToIndexedDB(data, backupId) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('SuperProBackups', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['backups'], 'readwrite');
                const store = transaction.objectStore('backups');
                
                const backupRecord = {
                    id: backupId,
                    data: data,
                    timestamp: new Date().toISOString(),
                    size: this.formatBytes(new Blob([JSON.stringify(data)]).size)
                };
                
                const addRequest = store.put(backupRecord);
                addRequest.onsuccess = () => resolve();
                addRequest.onerror = () => reject(addRequest.error);
            };
            
            request.onupgradeneeded = () => {
                const db = request.result;
                if (!db.objectStoreNames.contains('backups')) {
                    db.createObjectStore('backups', { keyPath: 'id' });
                }
            };
        });
    }

    // حفظ النسخة السحابية
    async saveCloudBackup(backupData, backupId) {
        try {
            await window.cloudStorage.saveData({
                [`backup_${backupId}`]: backupData
            });
            console.log('☁️ Cloud backup saved');
        } catch (error) {
            console.error('❌ Cloud backup failed:', error);
        }
    }

    // إضافة إلى سجل النسخ الاحتياطي
    addToBackupHistory(backupData, backupId, type) {
        const history = JSON.parse(localStorage.getItem('backupHistory') || '[]');
        
        const historyEntry = {
            id: backupId,
            timestamp: backupData.backupInfo.timestamp,
            type: type,
            size: backupData.backupInfo.dataSize,
            version: backupData.backupInfo.version,
            encrypted: backupData.backupInfo.encrypted,
            locations: this.backupLocations
        };

        history.unshift(historyEntry);
        
        // الاحتفاظ بآخر 100 نسخة فقط
        if (history.length > 100) {
            history.splice(100);
        }

        localStorage.setItem('backupHistory', JSON.stringify(history));
        this.updateBackupHistoryUI();
    }

    // تحميل سجل النسخ الاحتياطي
    loadBackupHistory() {
        const history = JSON.parse(localStorage.getItem('backupHistory') || '[]');
        this.updateBackupHistoryUI(history);
    }

    // تحديث واجهة سجل النسخ الاحتياطي
    updateBackupHistoryUI(history = null) {
        const historyContainer = document.getElementById('backupHistoryList');
        if (!historyContainer) return;

        if (!history) {
            history = JSON.parse(localStorage.getItem('backupHistory') || '[]');
        }

        if (history.length === 0) {
            historyContainer.innerHTML = '<p class="text-muted">لا توجد نسخ احتياطية</p>';
            return;
        }

        let html = '';
        history.slice(0, 20).forEach(backup => {
            const date = new Date(backup.timestamp).toLocaleString('ar-SA');
            const typeIcon = backup.type === 'auto' ? '🤖' : '👤';
            const encryptedIcon = backup.encrypted ? '🔒' : '🔓';
            
            html += `
                <div class="backup-item">
                    <div class="backup-info">
                        <strong>${typeIcon} ${backup.id}</strong><br>
                        <small>${date} - ${backup.size}</small><br>
                        <small>${encryptedIcon} ${backup.version}</small>
                    </div>
                    <div class="backup-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="backupSystem.restoreBackup('${backup.id}')">
                            <i class="fas fa-undo"></i> استعادة
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="backupSystem.downloadBackup('${backup.id}')">
                            <i class="fas fa-download"></i> تحميل
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="backupSystem.deleteBackup('${backup.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        historyContainer.innerHTML = html;
    }

    // استعادة النسخة الاحتياطية
    async restoreBackup(backupId) {
        if (!confirm('هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟ سيتم استبدال جميع البيانات الحالية.')) {
            return;
        }

        try {
            const backupData = await this.loadBackup(backupId);
            
            if (backupData.encrypted) {
                backupData.data = JSON.parse(await this.decryptData(backupData.data));
            }

            // استعادة البيانات
            Object.assign(window, backupData);
            
            // حفظ في sessionStorage
            if (typeof saveData === 'function') {
                saveData();
            }

            // إعادة تحميل الصفحة
            setTimeout(() => {
                location.reload();
            }, 1000);

            console.log('✅ Backup restored successfully');
        } catch (error) {
            console.error('❌ Backup restore failed:', error);
            alert('فشل استعادة النسخة الاحتياطية: ' + error.message);
        }
    }

    // تحميل النسخة الاحتياطية
    async loadBackup(backupId) {
        // محاولة التحميل من IndexedDB أولاً
        try {
            return await this.loadFromIndexedDB(backupId);
        } catch (error) {
            // التحميل من localStorage
            const compressedData = localStorage.getItem(`backup_${backupId}`);
            if (compressedData) {
                return JSON.parse(this.decompressData(compressedData));
            }
        }
        
        throw new Error('Backup not found');
    }

    // التحميل من IndexedDB
    async loadFromIndexedDB(backupId) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('SuperProBackups', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['backups'], 'readonly');
                const store = transaction.objectStore('backups');
                
                const getRequest = store.get(backupId);
                getRequest.onsuccess = () => {
                    if (getRequest.result) {
                        resolve(getRequest.result.data);
                    } else {
                        reject(new Error('Backup not found'));
                    }
                };
                getRequest.onerror = () => reject(getRequest.error);
            };
        });
    }

    // تحميل النسخة الاحتياطية
    async downloadBackup(backupId) {
        try {
            const backupData = await this.loadBackup(backupId);
            
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `superpro_backup_${backupId}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('📥 Backup downloaded');
        } catch (error) {
            console.error('❌ Download failed:', error);
        }
    }

    // حذف النسخة الاحتياطية
    async deleteBackup(backupId) {
        if (!confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) {
            return;
        }

        try {
            // الحذف من localStorage
            localStorage.removeItem(`backup_${backupId}`);
            
            // الحذف من IndexedDB
            await this.deleteFromIndexedDB(backupId);
            
            // الحذف من السجل
            const history = JSON.parse(localStorage.getItem('backupHistory') || '[]');
            const updatedHistory = history.filter(backup => backup.id !== backupId);
            localStorage.setItem('backupHistory', JSON.stringify(updatedHistory));
            
            this.updateBackupHistoryUI(updatedHistory);
            console.log('🗑️ Backup deleted');
        } catch (error) {
            console.error('❌ Delete failed:', error);
        }
    }

    // الحذف من IndexedDB
    async deleteFromIndexedDB(backupId) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('SuperProBackups', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                const db = request.result;
                const transaction = db.transaction(['backups'], 'readwrite');
                const store = transaction.objectStore('backups');
                
                const deleteRequest = store.delete(backupId);
                deleteRequest.onsuccess = () => resolve();
                deleteRequest.onerror = () => reject(deleteRequest.error);
            };
        });
    }

    // تنظيف النسخ القديمة
    cleanupOldBackups() {
        const history = JSON.parse(localStorage.getItem('backupHistory') || '[]');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.maxBackups);

        const oldBackups = history.filter(backup => 
            new Date(backup.timestamp) < cutoffDate
        );

        oldBackups.forEach(backup => {
            this.deleteBackup(backup.id);
        });

        console.log(`🧹 Cleaned up ${oldBackups.length} old backups`);
    }

    // ضغط البيانات
    compressData(data) {
        // بسيط - في التطبيق الحقيقي استخدم مكتبة ضغط
        return btoa(unescape(encodeURIComponent(data)));
    }

    // فك ضغط البيانات
    decompressData(compressedData) {
        return decodeURIComponent(escape(atob(compressedData)));
    }

    // تشفير البيانات (بسيط - استخدم مكتبة حقيقية في الإنتاج)
    async encryptData(data) {
        // في التطبيق الحقيقي استخدم CryptoJS أو مكتبة مشابهة
        return btoa(data); // placeholder
    }

    // فك تشفير البيانات
    async decryptData(encryptedData) {
        // في التطبيق الحقيقي استخدم CryptoJS أو مكتبة مشابهة
        return atob(encryptedData); // placeholder
    }

    // إضافة عناصر التحكم
    addBackupControls() {
        const settingsSection = document.querySelector('.settings-section');
        if (!settingsSection) return;

        const backupControls = `
            <div class="mb-4">
                <h5><i class="fas fa-database me-2"></i>النسخ الاحتياطي المتقدم</h5>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">جدولة النسخ الاحتياطي</label>
                        <select class="form-select" id="backupSchedule">
                            <option value="hourly">كل ساعة</option>
                            <option value="daily" selected>يومياً</option>
                            <option value="weekly">أسبوعياً</option>
                            <option value="monthly">شهرياً</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">الحد الأقصى للنسخ</label>
                        <input type="number" class="form-control" id="maxBackups" value="${this.maxBackups}" min="1" max="365">
                    </div>
                </div>

                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">مواقع الحفظ</label>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="backupLocal" checked>
                            <label class="form-check-label" for="backupLocal">
                                <i class="fas fa-hdd me-1"></i>محلي
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="backupCloud" checked>
                            <label class="form-check-label" for="backupCloud">
                                <i class="fas fa-cloud me-1"></i>سحابي
                            </label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">خيارات إضافية</label>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="encryptionEnabled">
                            <label class="form-check-label" for="encryptionEnabled">
                                <i class="fas fa-lock me-1"></i>تشفير البيانات
                            </label>
                        </div>
                    </div>
                </div>

                <div class="d-flex gap-2 mb-3">
                    <button class="btn btn-primary" onclick="backupSystem.performManualBackup()">
                        <i class="fas fa-save me-2"></i>نسخ احتياطي الآن
                    </button>
                    <button class="btn btn-success" onclick="backupSystem.importBackup()">
                        <i class="fas fa-upload me-2"></i>استيراد نسخة
                    </button>
                    <button class="btn btn-info" onclick="backupSystem.exportAllBackups()">
                        <i class="fas fa-download me-2"></i>تصدير الكل
                    </button>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="fas fa-history me-2"></i>سجل النسخ الاحتياطي</h6>
                    </div>
                    <div class="card-body">
                        <div id="backupHistoryList">
                            <div class="text-center text-muted">
                                <i class="fas fa-spinner fa-spin fa-2x mb-2"></i>
                                <p>جاري التحميل...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        settingsSection.insertAdjacentHTML('afterbegin', backupControls);
        this.setupBackupEventListeners();
    }

    // إعداد مستمعي الأحداث
    setupBackupEventListeners() {
        // حفظ الإعدادات
        document.getElementById('backupSchedule')?.addEventListener('change', (e) => {
            this.backupSchedule = e.target.value;
            localStorage.setItem('backupSchedule', this.backupSchedule);
            this.setupAutoBackup(); // إعادة الجدولة
        });

        document.getElementById('maxBackups')?.addEventListener('change', (e) => {
            this.maxBackups = parseInt(e.target.value);
            localStorage.setItem('maxBackups', this.maxBackups);
        });

        document.getElementById('backupLocal')?.addEventListener('change', (e) => {
            this.updateBackupLocations();
        });

        document.getElementById('backupCloud')?.addEventListener('change', (e) => {
            this.updateBackupLocations();
        });

        document.getElementById('encryptionEnabled')?.addEventListener('change', (e) => {
            this.encryptionEnabled = e.target.checked;
            localStorage.setItem('encryptionEnabled', this.encryptionEnabled);
        });
    }

    // تحديث مواقع الحفظ
    updateBackupLocations() {
        const local = document.getElementById('backupLocal')?.checked;
        const cloud = document.getElementById('backupCloud')?.checked;
        
        this.backupLocations = [];
        if (local) this.backupLocations.push('local');
        if (cloud) this.backupLocations.push('cloud');
        
        localStorage.setItem('backupLocations', JSON.stringify(this.backupLocations));
    }

    // نسخ احتياطي يدوي
    async performManualBackup() {
        try {
            const backupData = await this.createBackup();
            await this.saveBackup(backupData, 'manual');
            
            alert('✅ تم إنشاء نسخة احتياطية بنجاح');
        } catch (error) {
            console.error('❌ Manual backup failed:', error);
            alert('❌ فشل إنشاء النسخة الاحتياطية: ' + error.message);
        }
    }

    // استيراد نسخة احتياطية
    importBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const backupData = JSON.parse(event.target.result);
                    
                    if (confirm('هل تريد استعادة هذه النسخة الاحتياطية؟ سيتم استبدال جميع البيانات الحالية.')) {
                        // استعادة البيانات
                        Object.assign(window, backupData);
                        
                        if (typeof saveData === 'function') {
                            saveData();
                        }

                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    }
                } catch (error) {
                    alert('❌ ملف النسخة الاحتياطية غير صالح');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    // تصدير جميع النسخ الاحتياطية
    async exportAllBackups() {
        try {
            const history = JSON.parse(localStorage.getItem('backupHistory') || '[]');
            const allBackups = {};

            for (const backup of history) {
                try {
                    const backupData = await this.loadBackup(backup.id);
                    allBackups[backup.id] = backupData;
                } catch (error) {
                    console.warn(`Could not load backup ${backup.id}:`, error);
                }
            }

            const blob = new Blob([JSON.stringify(allBackups, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `superpro_all_backups_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('📥 All backups exported');
        } catch (error) {
            console.error('❌ Export failed:', error);
            alert('❌ فشل تصدير النسخ الاحتياطية');
        }
    }
}

// تهيئة نظام النسخ الاحتياطي
let backupSystem;

window.addEventListener('DOMContentLoaded', () => {
    backupSystem = new AdvancedBackupSystem();
    console.log('💾 Advanced Backup System initialized');
});

console.log('💾 Advanced Backup System loaded');
