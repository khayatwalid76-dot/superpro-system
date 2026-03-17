// ============================================================================
// UNIFIED DATA MANAGER - نظام إدارة البيانات الموحد
// ============================================================================
// هذا الملف يوحد جميع عمليات إدارة البيانات عبر التطبيق
// يدعم بيانات محلية (localStorage) و مزامنة سحابية (Firebase)

// ============================================================================
// آلية التخزين المركزي
// ============================================================================
const DataManager = {
  // البيانات الأساسية
  data: {
    employees: [],
    clients: [],
    contractors: [],
    contracts: [],
    attendance: [],
    payroll: [],
    dailyWork: [],
    income: [],
    expenses: [],
    tasks: [],
    notifications: [],
    invoices: [],
    lastSync: null,
    language: 'ar',
    theme: 'light'
  },

  // نسخ احتياطية
  backups: [],

  // حالة التزامن
  syncState: {
    isSyncing: false,
    lastSyncTime: null,
    syncError: null
  },

  // ============================================================================
  // تهيئة نظام البيانات
  // ============================================================================
  init() {
    console.log('🔧 تهيئة نظام إدارة البيانات...');
    
    // تحميل البيانات المحفوظة
    this.loadFromStorage();
    
    // تحميل البيانات من Firebase
    if (typeof firebaseDb !== 'undefined' && firebaseDb) {
      this.syncWithFirebase();
    }
    
    // إعداد مراقب التغييرات
    this.setupChangeWatcher();
    
    console.log('✅ تم تهيئة نظام إدارة البيانات');
    return this.data;
  },

  // ============================================================================
  // تحميل والحفظ
  // ============================================================================
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('superproDB');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.data = { ...this.data, ...parsed };
        console.log('✅ تم تحميل البيانات من التخزين المحلي');
      } else {
        console.log('📝 لا توجد بيانات محفوظة سابقاً');
        this.initializeDefaultData();
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل البيانات:', error);
      this.initializeDefaultData();
    }
  },

  save() {
    try {
      this.data.lastSync = new Date().toISOString();
      localStorage.setItem('superproDB', JSON.stringify(this.data));
      console.log('✅ تم حفظ البيانات محلياً');
      
      // محاولة المزامنة مع Firebase
      if (typeof firebaseDb !== 'undefined' && firebaseDb) {
        this.syncWithFirebase();
      }
      
      return true;
    } catch (error) {
      console.error('❌ خطأ في حفظ البيانات:', error);
      return false;
    }
  },

  // ============================================================================
  // عمليات CRUD للموظفين
  // ============================================================================
  addEmployee(employee) {
    try {
      const newEmployee = {
        id: Date.now(),
        ...employee,
        createdAt: new Date().toISOString()
      };
      
      this.data.employees.push(newEmployee);
      this.save();
      
      console.log('✅ تم إضافة موظف:', newEmployee);
      this.notifyChange('employees', 'add', newEmployee);
      return newEmployee;
    } catch (error) {
      console.error('❌ خطأ في إضافة موظف:', error);
      return null;
    }
  },

  updateEmployee(id, updates) {
    try {
      const index = this.data.employees.findIndex(e => e.id === id);
      if (index === -1) {
        console.warn('⚠️ لم يتم العثور على الموظف');
        return null;
      }
      
      this.data.employees[index] = {
        ...this.data.employees[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      this.save();
      console.log('✅ تم تحديث موظف:', this.data.employees[index]);
      this.notifyChange('employees', 'update', this.data.employees[index]);
      return this.data.employees[index];
    } catch (error) {
      console.error('❌ خطأ في تحديث موظف:', error);
      return null;
    }
  },

  deleteEmployee(id) {
    try {
      const index = this.data.employees.findIndex(e => e.id === id);
      if (index === -1) {
        console.warn('⚠️ لم يتم العثور على الموظف');
        return false;
      }
      
      const deleted = this.data.employees.splice(index, 1)[0];
      this.save();
      console.log('✅ تم حذف موظف:', deleted);
      this.notifyChange('employees', 'delete', deleted);
      return true;
    } catch (error) {
      console.error('❌ خطأ في حذف موظف:', error);
      return false;
    }
  },

  getEmployees() {
    return this.data.employees || [];
  },

  getEmployee(id) {
    return this.data.employees.find(e => e.id === id);
  },

  // ============================================================================
  // عمليات CRUD للعملاء
  // ============================================================================
  addClient(client) {
    try {
      const newClient = {
        id: Date.now(),
        ...client,
        createdAt: new Date().toISOString()
      };
      
      this.data.clients.push(newClient);
      this.save();
      
      console.log('✅ تم إضافة عميل:', newClient);
      this.notifyChange('clients', 'add', newClient);
      return newClient;
    } catch (error) {
      console.error('❌ خطأ في إضافة عميل:', error);
      return null;
    }
  },

  updateClient(id, updates) {
    try {
      const index = this.data.clients.findIndex(c => c.id === id);
      if (index === -1) {
        console.warn('⚠️ لم يتم العثور على العميل');
        return null;
      }
      
      this.data.clients[index] = {
        ...this.data.clients[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      this.save();
      console.log('✅ تم تحديث عميل:', this.data.clients[index]);
      this.notifyChange('clients', 'update', this.data.clients[index]);
      return this.data.clients[index];
    } catch (error) {
      console.error('❌ خطأ في تحديث عميل:', error);
      return null;
    }
  },

  deleteClient(id) {
    try {
      const index = this.data.clients.findIndex(c => c.id === id);
      if (index === -1) {
        console.warn('⚠️ لم يتم العثور على العميل');
        return false;
      }
      
      const deleted = this.data.clients.splice(index, 1)[0];
      this.save();
      console.log('✅ تم حذف عميل:', deleted);
      this.notifyChange('clients', 'delete', deleted);
      return true;
    } catch (error) {
      console.error('❌ خطأ في حذف عميل:', error);
      return false;
    }
  },

  getClients() {
    return this.data.clients || [];
  },

  getClient(id) {
    return this.data.clients.find(c => c.id === id);
  },

  // ============================================================================
  // عمليات CRUD للعقود
  // ============================================================================
  addContract(contract) {
    try {
      const newContract = {
        id: Date.now(),
        ...contract,
        createdAt: new Date().toISOString()
      };
      
      this.data.contracts.push(newContract);
      this.save();
      
      console.log('✅ تم إضافة عقد:', newContract);
      this.notifyChange('contracts', 'add', newContract);
      return newContract;
    } catch (error) {
      console.error('❌ خطأ في إضافة عقد:', error);
      return null;
    }
  },

  updateContract(id, updates) {
    try {
      const index = this.data.contracts.findIndex(c => c.id === id);
      if (index === -1) {
        console.warn('⚠️ لم يتم العثور على العقد');
        return null;
      }
      
      this.data.contracts[index] = {
        ...this.data.contracts[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      this.save();
      console.log('✅ تم تحديث عقد:', this.data.contracts[index]);
      this.notifyChange('contracts', 'update', this.data.contracts[index]);
      return this.data.contracts[index];
    } catch (error) {
      console.error('❌ خطأ في تحديث عقد:', error);
      return null;
    }
  },

  deleteContract(id) {
    try {
      const index = this.data.contracts.findIndex(c => c.id === id);
      if (index === -1) {
        console.warn('⚠️ لم يتم العثور على العقد');
        return false;
      }
      
      const deleted = this.data.contracts.splice(index, 1)[0];
      this.save();
      console.log('✅ تم حذف عقد:', deleted);
      this.notifyChange('contracts', 'delete', deleted);
      return true;
    } catch (error) {
      console.error('❌ خطأ في حذف عقد:', error);
      return false;
    }
  },

  getContracts() {
    return this.data.contracts || [];
  },

  getContract(id) {
    return this.data.contracts.find(c => c.id === id);
  },

  // ============================================================================
  // البيانات الافتراضية
  // ============================================================================
  initializeDefaultData() {
    console.log('📝 تهيئة البيانات الافتراضية...');
    
    this.data = {
      employees: [
        { id: 1, name: 'أحمد محمد', position: 'مدير مشروع', department: 'الإدارة', salary: 15000, phone: '0501234567', status: 'نشط', job: 'مدير', nationality: 'سعودي', idNumber: '1234567890', hireDate: '2024-01-15', createdAt: new Date().toISOString() },
        { id: 2, name: 'فاطمة علي', position: 'مصممة', department: 'التصميم', salary: 8000, phone: '0507654321', status: 'نشط', job: 'مصممة', nationality: 'إماراتية', idNumber: '0987654321', hireDate: '2024-02-20', createdAt: new Date().toISOString() },
        { id: 3, name: 'محمد سعيد', position: 'مطور', department: 'التقنية', salary: 12000, phone: '0509876543', status: 'نشط', job: 'مطور', nationality: 'قطري', idNumber: '5555555555', hireDate: '2024-03-10', createdAt: new Date().toISOString() }
      ],
      clients: [
        { id: 1, name: 'شركة النور للتقنية', phone: '0123456789', email: 'info@alnoor.com', area: 'الدوحة', service: 'تطوير برمجيات', status: 'نشط', createdAt: new Date().toISOString() },
        { id: 2, name: 'مؤسسة الأمل', phone: '0129876543', email: 'contact@amal.org', area: 'الريان', service: 'تصميم موقع', status: 'نشط', createdAt: new Date().toISOString() }
      ],
      contracts: [
        { id: 1, number: 'CTR-2024-001', clientId: 1, client: 'شركة النور للتقنية', type: 'تطوير برمجيات', amount: 50000, startDate: '2024-01-01', endDate: '2024-06-30', status: 'نشط', createdAt: new Date().toISOString() },
        { id: 2, number: 'CTR-2024-002', clientId: 2, client: 'مؤسسة الأمل', type: 'تصميم موقع', amount: 25000, startDate: '2024-02-01', endDate: '2024-04-30', status: 'نشط', createdAt: new Date().toISOString() }
      ],
      attendance: [],
      payroll: [],
      dailyWork: [],
      income: [],
      expenses: [],
      tasks: [],
      notifications: [],
      invoices: [],
      lastSync: new Date().toISOString(),
      language: 'ar',
      theme: 'light'
    };
    
    this.save();
    console.log('✅ تم تهيئة البيانات الافتراضية');
  },

  // ============================================================================
  // المزامنة مع Firebase
  // ============================================================================
  syncWithFirebase() {
    if (this.syncState.isSyncing) {
      console.log('⏳ جاري المزامنة بالفعل...');
      return Promise.resolve();
    }
    
    this.syncState.isSyncing = true;
    console.log('🔄 بدء مزامنة البيانات مع Firebase...');
    
    return new Promise((resolve) => {
      try {
        if (typeof firebaseDb === 'undefined' || !firebaseDb) {
          console.warn('⚠️ Firebase غير متاح');
          this.syncState.isSyncing = false;
          resolve(false);
          return;
        }

        // محاولة تحميل البيانات من Firebase
        firebaseDb.ref('appData').once('value').then((snapshot) => {
          if (snapshot.exists()) {
            const firebaseData = snapshot.val();
            console.log('📥 تم تحميل البيانات من Firebase');
            
            // دمج البيانات
            this.mergeData(firebaseData);
          }
          
          // رفع البيانات المحلية إلى Firebase
          firebaseDb.ref('appData').set(this.data).then(() => {
            console.log('📤 تم حفظ البيانات في Firebase');
            this.syncState.lastSyncTime = new Date().toISOString();
            this.syncState.isSyncing = false;
            this.notifySync(true);
            resolve(true);
          }).catch((error) => {
            console.error('❌ خطأ في من رفع البيانات إلى Firebase:', error);
            this.syncState.syncError = error.message;
            this.syncState.isSyncing = false;
            this.notifySync(false);
            resolve(false);
          });
        }).catch((error) => {
          console.error('❌ خطأ في تحميل البيانات من Firebase:', error);
          this.syncState.syncError = error.message;
          this.syncState.isSyncing = false;
          this.notifySync(false);
          resolve(false);
        });
      } catch (error) {
        console.error('❌ خطأ في المزامنة:', error);
        this.syncState.syncError = error.message;
        this.syncState.isSyncing = false;
        this.notifySync(false);
        resolve(false);
      }
    });
  },

  mergeData(firebaseData) {
    console.log('🔀 دمج بيانات Firebase مع البيانات المحلية...');
    
    // دمج الموظفين
    if (firebaseData.employees && Array.isArray(firebaseData.employees)) {
      const localIds = this.data.employees.map(e => e.id);
      firebaseData.employees.forEach(emp => {
        if (!localIds.includes(emp.id)) {
          this.data.employees.push(emp);
        }
      });
    }
    
    // دمج العملاء
    if (firebaseData.clients && Array.isArray(firebaseData.clients)) {
      const localIds = this.data.clients.map(c => c.id);
      firebaseData.clients.forEach(client => {
        if (!localIds.includes(client.id)) {
          this.data.clients.push(client);
        }
      });
    }
    
    // دمج العقود
    if (firebaseData.contracts && Array.isArray(firebaseData.contracts)) {
      const localIds = this.data.contracts.map(c => c.id);
      firebaseData.contracts.forEach(contract => {
        if (!localIds.includes(contract.id)) {
          this.data.contracts.push(contract);
        }
      });
    }
    
    console.log('✅ تم دمج البيانات بنجاح');
  },

  // ============================================================================
  // نظام المراقبين (Watchers)
  // ============================================================================
  watchers: [],

  setupChangeWatcher() {
    console.log('👁️ إعداد مراقب التغييرات...');
  },

  watch(callback) {
    this.watchers.push(callback);
  },

  notifyChange(module, action, data) {
    this.watchers.forEach(callback => {
      try {
        callback({ module, action, data, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error('❌ خطأ في استدعاء المراقب:', error);
      }
    });
  },

  notifySync(success) {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const event = new CustomEvent('dataSynced', {
        detail: { success, timestamp: new Date().toISOString() }
      });
      window.dispatchEvent(event);
    }
  },

  // ============================================================================
  // نسخ احتياطية واستعادة
  // ============================================================================
  createBackup() {
    const backup = {
      timestamp: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(this.data))
    };
    
    this.backups.push(backup);
    console.log('💾 تم إنشاء نسخة احتياطية');
    return backup;
  },

  getBackups() {
    return this.backups;
  },

  restoreBackup(timestamp) {
    const backup = this.backups.find(b => b.timestamp === timestamp);
    if (!backup) {
      console.warn('⚠️ لم يتم العثور على النسخة الاحتياطية');
      return false;
    }
    
    this.data = JSON.parse(JSON.stringify(backup.data));
    this.save();
    console.log('✅ تم استعادة النسخة الاحتياطية');
    return true;
  },

  // ============================================================================
  // إحصائيات والتقارير
  // ============================================================================
  getStats() {
    return {
      totalEmployees: this.data.employees.length,
      activeEmployees: this.data.employees.filter(e => e.status === 'نشط').length,
      totalClients: this.data.clients.length,
      totalContracts: this.data.contracts.length,
      totalSalaries: this.data.employees.reduce((sum, e) => sum + (e.salary || 0), 0),
      lastSync: this.syncState.lastSyncTime
    };
  },

  // ============================================================================
  // تصدير واستيراد البيانات
  // ============================================================================
  exportData() {
    const json = JSON.stringify(this.data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('✅ تم تصدير البيانات');
  },

  importData(jsonString) {
    try {
      const imported = JSON.parse(jsonString);
      
      // دمج البيانات المستوردة
      this.data = { ...this.data, ...imported };
      this.save();
      
      console.log('✅ تم استيراد البيانات بنجاح');
      return true;
    } catch (error) {
      console.error('❌ خطأ في استيراد البيانات:', error);
      return false;
    }
  }
};

// تصدير DataManager
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataManager;
}
