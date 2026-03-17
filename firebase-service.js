// Firebase Service Layer - Centralized Database Operations
// Supports dual persistence: Firebase + localStorage fallback

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-family: 'Tajawal', sans-serif;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
  `;
  
  if(!document.querySelector('style[data-toast]')) {
    style.setAttribute('data-toast', 'true');
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// LOCAL BACKUP SYSTEM
// ============================================
const localBackup = {
  // البيانات المدعومة
  supportedKeys: [
    'employees', 'clients', 'contractors', 'partners', 'contracts',
    'attendance', 'payroll', 'dailyWork', 'income', 'expenses',
    'invoicing', 'inventory', 'teams', 'locations', 'packages',
    'ratings', 'reports', 'tasks', 'notifications'
  ],

  // حفظ البيانات محلياً
  save: (key, data) => {
    try {
      if(localBackup.supportedKeys.includes(key)) {
        localStorage.setItem(`backup_${key}`, JSON.stringify({
          data: data,
          timestamp: new Date().toISOString(),
          synchronized: true
        }));
        console.log(`✅ تم حفظ ${key} محلياً`);
      }
    } catch(error) {
      console.warn('⚠️ مشكلة في الحفظ المحلي:', error);
    }
  },

  // تحميل البيانات من النسخة الاحتياطية
  load: (key) => {
    try {
      const backup = localStorage.getItem(`backup_${key}`);
      if(backup) {
        const parsed = JSON.parse(backup);
        console.log(`📦 تم تحميل ${key} من النسخة الاحتياطية`);
        return parsed.data;
      }
    } catch(error) {
      console.warn(`⚠️ خطأ في تحميل النسخة الاحتياطية للـ ${key}:`, error);
    }
    return null;
  },

  // مزامنة جميع البيانات
  syncAll: async () => {
    try {
      const db = getDatabase();
      for(const key of localBackup.supportedKeys) {
        const backup = localBackup.load(key);
        if(backup && Array.isArray(backup) && backup.length > 0) {
          console.log(`🔄 جاري مزامنة ${key}...`);
          // سيتم التحديث بشكل تلقائي عند جلب البيانات من Firebase
        }
      }
      console.log('✅ تمت المزامنة بنجاح');
    } catch(error) {
      console.error('❌ خطأ في المزامنة:', error);
    }
  },

  // حذف الـ backup
  clear: (key) => {
    try {
      localStorage.removeItem(`backup_${key}`);
      console.log(`🗑️ تم حذف النسخة الاحتياطية للـ ${key}`);
    } catch(error) {
      console.warn('⚠️ خطأ في حذف الـ backup:', error);
    }
  },

  // حذف جميع الـ backups
  clearAll: () => {
    try {
      localBackup.supportedKeys.forEach(key => {
        localStorage.removeItem(`backup_${key}`);
      });
      console.log('🗑️ تم حذف جميع النسخ الاحتياطية');
    } catch(error) {
      console.warn('⚠️ خطأ في حذف جميع الـ backups:', error);
    }
  }
};

// ============================================
// FIREBASE HELPER FUNCTIONS
// ============================================
const firebaseHelpers = {
  // دالة عامة لـ SET/ADD مع backup
  setWithBackup: async (path, data, backupKey) => {
    try {
      const db = getDatabase();
      const dbRef = ref(db, path);
      await set(dbRef, data);
      
      if(backupKey) {
        localBackup.save(backupKey, Array.isArray(data) ? data : [data]);
      }
      return data;
    } catch(firebaseError) {
      console.warn('⚠️ خطأ في Firebase، استخدام backup محلي:', firebaseError);
      if(backupKey) {
        const backup = localBackup.load(backupKey) || [];
        if(!Array.isArray(backup)) return null;
        backup.push(data);
        localBackup.save(backupKey, backup);
      }
      throw firebaseError;
    }
  },

  // دالة عامة للـ GET مع backup fallback
  getWithBackup: async (path, backupKey) => {
    try {
      try {
        const db = getDatabase();
        const dbRef = ref(db, path);
        const snapshot = await get(dbRef);
        
        let data = snapshot.exists() ? snapshot.val() : null;
        if(data && backupKey) {
          localBackup.save(backupKey, Array.isArray(data) ? data : Object.values(data));
        }
        return data;
      } catch(firebaseError) {
        console.warn(`⚠️ خطأ في تحميل ${path}، استخدام backup:`, firebaseError);
        if(backupKey) {
          return localBackup.load(backupKey);
        }
        throw firebaseError;
      }
    } catch(error) {
      console.error(`❌ خطأ نهائي عند ${path}:`, error);
      return null;
    }
  },

  // دالة عامة للـ UPDATE مع backup
  updateWithBackup: async (path, updates, backupKey, allDataGetter) => {
    try {
      const db = getDatabase();
      const dbRef = ref(db, path);
      await update(dbRef, updates);
      
      if(backupKey && allDataGetter) {
        const allData = await allDataGetter();
        localBackup.save(backupKey, allData);
      }
      return true;
    } catch(firebaseError) {
      console.warn('⚠️ خطأ في UPDATE Firebase:', firebaseError);
      if(backupKey) {
        const id = path.split('/').pop();
        const backup = localBackup.load(backupKey) || [];
        const index = backup.findIndex(item => item.id === id);
        if(index >= 0) {
          backup[index] = { ...backup[index], ...updates };
          localBackup.save(backupKey, backup);
        }
      }
      throw firebaseError;
    }
  },

  // دالة عامة للـ DELETE مع backup
  deleteWithBackup: async (path, backupKey, id) => {
    try {
      const db = getDatabase();
      const dbRef = ref(db, path);
      await remove(dbRef);
      
      if(backupKey && id) {
        let backup = localBackup.load(backupKey) || [];
        backup = backup.filter(item => item.id !== id);
        localBackup.save(backupKey, backup);
      }
      return true;
    } catch(firebaseError) {
      console.warn('⚠️ خطأ في DELETE Firebase:', firebaseError);
      if(backupKey && id) {
        let backup = localBackup.load(backupKey) || [];
        backup = backup.filter(item => item.id !== id);
        localBackup.save(backupKey, backup);
      }
      throw firebaseError;
    }
  }
};

// ============================================
// EMPLOYEE SERVICE
// ============================================
const employeeService = {
  addEmployee: async (employee) => {
    try {
      const id = Date.now().toString();
      const empData = {
        ...employee,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      try {
        const db = getDatabase();
        const empRef = ref(db, `employees/${id}`);
        await set(empRef, empData);
        
        // حفظ النسخة الاحتياطية
        const allEmployees = await employeeService.getEmployees();
        allEmployees.push(empData);
        localBackup.save('employees', allEmployees);
        
        showToast(`✅ تم إضافة الموظف بنجاح`, 'success');
      } catch(firebaseError) {
        console.warn('⚠️ خطأ Firebase، حفظ محلي:', firebaseError);
        const allEmployees = localBackup.load('employees') || [];
        allEmployees.push(empData);
        localBackup.save('employees', allEmployees);
        showToast(`✅ تم إضافة الموظف (محفوظ محلياً)`, 'success');
      }
      
      return empData;
    } catch (error) {
      showToast(`❌ خطأ: ${error.message}`, 'error');
      return null;
    }
  },

  getEmployees: async () => {
    try {
      try {
        const db = getDatabase();
        const empRef = ref(db, 'employees');
        const snapshot = await get(empRef);
        
        let data = [];
        if (snapshot.exists()) {
          data = Object.values(snapshot.val());
        }
        
        // حفظ النسخة الاحتياطية
        if(data.length > 0) {
          localBackup.save('employees', data);
        }
        
        return data;
      } catch(firebaseError) {
        console.warn('⚠️ خطأ في تحميل من Firebase، استخدام النسخة المحلية:', firebaseError);
        const backupData = localBackup.load('employees');
        if(backupData) {
          return backupData;
        }
        return [];
      }
    } catch (error) {
      showToast(`❌ خطأ في تحميل الموظفين`, 'error');
      return localBackup.load('employees') || [];
    }
  },

  updateEmployee: async (id, updates) => {
    try {
      const updated = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      try {
        const db = getDatabase();
        const empRef = ref(db, `employees/${id}`);
        await update(empRef, updated);
        
        // تحديث النسخة الاحتياطية
        const allEmployees = await employeeService.getEmployees();
        const index = allEmployees.findIndex(e => e.id === id);
        if(index >= 0) {
          allEmployees[index] = { ...allEmployees[index], ...updated };
          localBackup.save('employees', allEmployees);
        }
        
        showToast(`✅ تم تحديث البيانات`, 'success');
      } catch(firebaseError) {
        console.warn('⚠️ خطأ Firebase، تحديث محلي:', firebaseError);
        const allEmployees = localBackup.load('employees') || [];
        const index = allEmployees.findIndex(e => e.id === id);
        if(index >= 0) {
          allEmployees[index] = { ...allEmployees[index], ...updated };
          localBackup.save('employees', allEmployees);
        }
        showToast(`✅ تم التحديث (محفوظ محلياً)`, 'success');
      }
      
      return true;
    } catch (error) {
      showToast(`❌ خطأ: ${error.message}`, 'error');
      return false;
    }
  },

  deleteEmployee: async (id) => {
    try {
      try {
        const db = getDatabase();
        const empRef = ref(db, `employees/${id}`);
        await remove(empRef);
        
        // تحديث النسخة الاحتياطية
        let allEmployees = await employeeService.getEmployees();
        allEmployees = allEmployees.filter(e => e.id !== id);
        localBackup.save('employees', allEmployees);
        
        showToast(`✅ تم حذف الموظف`, 'success');
      } catch(firebaseError) {
        console.warn('⚠️ خطأ Firebase، حذف محلي:', firebaseError);
        let allEmployees = localBackup.load('employees') || [];
        allEmployees = allEmployees.filter(e => e.id !== id);
        localBackup.save('employees', allEmployees);
        showToast(`✅ تم الحذف (محفوظ محلياً)`, 'success');
      }
      
      return true;
    } catch (error) {
      showToast(`❌ خطأ في الحذف`, 'error');
      return false;
    }
  },

  onEmployeesChange: (callback) => {
    try {
      const db = getDatabase();
      const empRef = ref(db, 'employees');
      return onValue(empRef, (snapshot) => {
        const data = snapshot.exists() ? Object.values(snapshot.val()) : [];
        callback(data);
      });
    } catch (error) {
      console.error('خطأ في المستقبل:', error);
    }
  }
};

// ============================================
// CLIENT SERVICE
// ============================================
const clientService = {
  addClient: async (client) => {
    try {
      const id = Date.now().toString();
      const clientData = {
        ...client,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      try {
        const db = getDatabase();
        const clientRef = ref(db, `clients/${id}`);
        await set(clientRef, clientData);
        
        // حفظ النسخة الاحتياطية
        const allClients = await clientService.getClients();
        allClients.push(clientData);
        localBackup.save('clients', allClients);
        
        showToast(`✅ تم إضافة العميل بنجاح`, 'success');
      } catch(firebaseError) {
        console.warn('⚠️ خطأ Firebase، حفظ محلي:', firebaseError);
        const allClients = localBackup.load('clients') || [];
        allClients.push(clientData);
        localBackup.save('clients', allClients);
        showToast(`✅ تم إضافة العميل (محفوظ محلياً)`, 'success');
      }
      
      return clientData;
    } catch (error) {
      showToast(`❌ خطأ: ${error.message}`, 'error');
      return null;
    }
  },

  getClients: async () => {
    try {
      try {
        const db = getDatabase();
        const clientRef = ref(db, 'clients');
        const snapshot = await get(clientRef);
        
        let data = [];
        if (snapshot.exists()) {
          data = Object.values(snapshot.val());
        }
        
        // حفظ النسخة الاحتياطية
        if(data.length > 0) {
          localBackup.save('clients', data);
        }
        
        return data;
      } catch(firebaseError) {
        console.warn('⚠️ خطأ في تحميل من Firebase، استخدام النسخة المحلية:', firebaseError);
        const backupData = localBackup.load('clients');
        if(backupData) {
          return backupData;
        }
        return [];
      }
    } catch (error) {
      showToast(`❌ خطأ في تحميل العملاء`, 'error');
      return localBackup.load('clients') || [];
    }
  },

  updateClient: async (id, updates) => {
    try {
      const updated = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      try {
        const db = getDatabase();
        const clientRef = ref(db, `clients/${id}`);
        await update(clientRef, updated);
        
        // تحديث النسخة الاحتياطية
        const allClients = await clientService.getClients();
        const index = allClients.findIndex(c => c.id === id);
        if(index >= 0) {
          allClients[index] = { ...allClients[index], ...updated };
          localBackup.save('clients', allClients);
        }
        
        showToast(`✅ تم تحديث بيانات العميل`, 'success');
      } catch(firebaseError) {
        console.warn('⚠️ خطأ Firebase، تحديث محلي:', firebaseError);
        const allClients = localBackup.load('clients') || [];
        const index = allClients.findIndex(c => c.id === id);
        if(index >= 0) {
          allClients[index] = { ...allClients[index], ...updated };
          localBackup.save('clients', allClients);
        }
        showToast(`✅ تم التحديث (محفوظ محلياً)`, 'success');
      }
      
      return true;
    } catch (error) {
      showToast(`❌ خطأ: ${error.message}`, 'error');
      return false;
    }
  },

  deleteClient: async (id) => {
    try {
      try {
        const db = getDatabase();
        const clientRef = ref(db, `clients/${id}`);
        await remove(clientRef);
        
        // تحديث النسخة الاحتياطية
        let allClients = await clientService.getClients();
        allClients = allClients.filter(c => c.id !== id);
        localBackup.save('clients', allClients);
        
        showToast(`✅ تم حذف العميل`, 'success');
      } catch(firebaseError) {
        console.warn('⚠️ خطأ Firebase، حذف محلي:', firebaseError);
        let allClients = localBackup.load('clients') || [];
        allClients = allClients.filter(c => c.id !== id);
        localBackup.save('clients', allClients);
        showToast(`✅ تم الحذف (محفوظ محلياً)`, 'success');
      }
      
      return true;
    } catch (error) {
      showToast(`❌ خطأ في الحذف`, 'error');
      return false;
    }
  },

  onClientsChange: (callback) => {
    try {
      const db = getDatabase();
      const clientRef = ref(db, 'clients');
      return onValue(clientRef, (snapshot) => {
        const data = snapshot.exists() ? Object.values(snapshot.val()) : [];
        // حفظ النسخة الاحتياطية
        if(data.length > 0) {
          localBackup.save('clients', data);
        }
        callback(data);
      });
    } catch (error) {
      console.error('خطأ في المستقبل:', error);
      // استخدام الـ backup كـ fallback
      const backupData = localBackup.load('clients') || [];
      callback(backupData);
    }
  }
};

// ============================================
// CONTRACT SERVICE
// ============================================
const contractService = {
  addContract: async (contract) => {
    try {
      const id = Date.now().toString();
      const contractData = {
        ...contract,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const db = getDatabase();
      const contractRef = ref(db, `contracts/${id}`);
      await set(contractRef, contractData);
      
      showToast(`✅ تم إضافة العقد بنجاح`, 'success');
      return contractData;
    } catch (error) {
      showToast(`❌ خطأ: ${error.message}`, 'error');
      return null;
    }
  },

  getContracts: async () => {
    try {
      const db = getDatabase();
      const contractRef = ref(db, 'contracts');
      const snapshot = await get(contractRef);
      
      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      }
      return [];
    } catch (error) {
      showToast(`❌ خطأ في تحميل العقود`, 'error');
      return [];
    }
  },

  updateContract: async (id, updates) => {
    try {
      const db = getDatabase();
      const contractRef = ref(db, `contracts/${id}`);
      const updated = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await update(contractRef, updated);
      showToast(`✅ تم تحديث العقد`, 'success');
      return true;
    } catch (error) {
      showToast(`❌ خطأ: ${error.message}`, 'error');
      return false;
    }
  },

  deleteContract: async (id) => {
    try {
      const db = getDatabase();
      const contractRef = ref(db, `contracts/${id}`);
      await remove(contractRef);
      showToast(`✅ تم حذف العقد`, 'success');
      return true;
    } catch (error) {
      showToast(`❌ خطأ في الحذف`, 'error');
      return false;
    }
  },

  onContractsChange: (callback) => {
    try {
      const db = getDatabase();
      const contractRef = ref(db, 'contracts');
      onValue(contractRef, (snapshot) => {
        const data = snapshot.exists() ? Object.values(snapshot.val()) : [];
        callback(data);
      });
    } catch (error) {
      console.error('خطأ في المستقبل:', error);
    }
  }
};

// ============================================
// ATTENDANCE SERVICE
// ============================================
const attendanceService = {
  addAttendance: async (attendance) => {
    try {
      const id = Date.now().toString();
      const attData = {
        ...attendance,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const db = getDatabase();
      const attRef = ref(db, `attendance/${id}`);
      await set(attRef, attData);
      
      showToast(`✅ تم تسجيل الحضور`, 'success');
      return attData;
    } catch (error) {
      showToast(`❌ خطأ: ${error.message}`, 'error');
      return null;
    }
  },

  getAttendance: async () => {
    try {
      const db = getDatabase();
      const attRef = ref(db, 'attendance');
      const snapshot = await get(attRef);
      
      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      }
      return [];
    } catch (error) {
      showToast(`❌ خطأ في تحميل السجلات`, 'error');
      return [];
    }
  },

  updateAttendance: async (id, updates) => {
    try {
      const db = getDatabase();
      const attRef = ref(db, `attendance/${id}`);
      const updated = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await update(attRef, updated);
      showToast(`✅ تم تحديث السجل`, 'success');
      return true;
    } catch (error) {
      showToast(`❌ خطأ: ${error.message}`, 'error');
      return false;
    }
  },

  deleteAttendance: async (id) => {
    try {
      const db = getDatabase();
      const attRef = ref(db, `attendance/${id}`);
      await remove(attRef);
      showToast(`✅ تم حذف السجل`, 'success');
      return true;
    } catch (error) {
      showToast(`❌ خطأ في الحذف`, 'error');
      return false;
    }
  }
};

// ============================================
// DAILY WORK SERVICE
// ============================================
const dailyWorkService = {
  addDailyWork: async (work) => {
    try {
      const id = Date.now().toString();
      const workData = {
        ...work,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const db = getDatabase();
      const workRef = ref(db, `dailyWork/${id}`);
      await set(workRef, workData);
      
      showToast(`✅ تم إضافة عمل اليوم`, 'success');
      return workData;
    } catch (error) {
      showToast(`❌ خطأ: ${error.message}`, 'error');
      return null;
    }
  },

  getDailyWork: async () => {
    try {
      const db = getDatabase();
      const workRef = ref(db, 'dailyWork');
      const snapshot = await get(workRef);
      
      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      }
      return [];
    } catch (error) {
      console.error('خطأ:', error);
      return [];
    }
  },

  updateDailyWork: async (id, updates) => {
    try {
      const db = getDatabase();
      const workRef = ref(db, `dailyWork/${id}`);
      const updated = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await update(workRef, updated);
      return true;
    } catch (error) {
      console.error('خطأ:', error);
      return false;
    }
  }
};

// ============================================
// FINANCIAL SERVICE
// ============================================
const financialService = {
  addIncome: async (income) => {
    try {
      const id = Date.now().toString();
      const incomeData = {
        ...income,
        id,
        type: 'income',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const db = getDatabase();
      const incomeRef = ref(db, `financial/income/${id}`);
      await set(incomeRef, incomeData);
      
      showToast(`✅ تم إضافة مدخول`, 'success');
      return incomeData;
    } catch (error) {
      showToast(`❌ خطأ: ${error.message}`, 'error');
      return null;
    }
  },

  addExpense: async (expense) => {
    try {
      const id = Date.now().toString();
      const expenseData = {
        ...expense,
        id,
        type: 'expense',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const db = getDatabase();
      const expenseRef = ref(db, `financial/expenses/${id}`);
      await set(expenseRef, expenseData);
      
      showToast(`✅ تم إضافة مصروف`, 'success');
      return expenseData;
    } catch (error) {
      showToast(`❌ خطأ: ${error.message}`, 'error');
      return null;
    }
  },

  getIncome: async () => {
    try {
      const db = getDatabase();
      const incomeRef = ref(db, 'financial/income');
      const snapshot = await get(incomeRef);
      
      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      }
      return [];
    } catch (error) {
      console.error('خطأ:', error);
      return [];
    }
  },

  getExpenses: async () => {
    try {
      const db = getDatabase();
      const expenseRef = ref(db, 'financial/expenses');
      const snapshot = await get(expenseRef);
      
      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      }
      return [];
    } catch (error) {
      console.error('خطأ:', error);
      return [];
    }
  }
};

// ============================================
// PAYROLL SERVICE
// ============================================
const payrollService = {
  addPayroll: async (payroll) => {
    try {
      const id = Date.now().toString();
      const payrollData = {
        ...payroll,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const db = getDatabase();
      const payrollRef = ref(db, `payroll/${id}`);
      await set(payrollRef, payrollData);
      
      showToast(`✅ تم إضافة بيان راتب`, 'success');
      return payrollData;
    } catch (error) {
      showToast(`❌ خطأ: ${error.message}`, 'error');
      return null;
    }
  },

  getPayroll: async () => {
    try {
      const db = getDatabase();
      const payrollRef = ref(db, 'payroll');
      const snapshot = await get(payrollRef);
      
      if (snapshot.exists()) {
        return Object.values(snapshot.val());
      }
      return [];
    } catch (error) {
      console.error('خطأ:', error);
      return [];
    }
  },

  updatePayroll: async (id, updates) => {
    try {
      const db = getDatabase();
      const payrollRef = ref(db, `payroll/${id}`);
      const updated = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      await update(payrollRef, updated);
      return true;
    } catch (error) {
      console.error('خطأ:', error);
      return false;
    }
  }
};

// ============================================
// SYNC FUNCTION: Sync Firebase data to localStorage
// ============================================
const syncFirebaseToLocal = async () => {
  try {
    // Load all data from Firebase
    const employees = await employeeService.getEmployees();
    const clients = await clientService.getClients();
    const contracts = await contractService.getContracts();
    const attendance = await attendanceService.getAttendance();
    const payroll = await payrollService.getPayroll();
    const income = await financialService.getIncome();
    const expenses = await financialService.getExpenses();
    const dailyWork = await dailyWorkService.getDailyWork();
    
    // Update appData with Firebase data
    const mergedData = {
      ...appData,
      employees: employees.length > 0 ? employees : appData.employees,
      clients: clients.length > 0 ? clients : appData.clients,
      contracts: contracts.length > 0 ? contracts : appData.contracts,
      attendance: attendance.length > 0 ? attendance : appData.attendance,
      payroll: payroll.length > 0 ? payroll : appData.payroll,
      income: income.length > 0 ? income : appData.income,
      expenses: expenses.length > 0 ? expenses : appData.expenses,
      dailyWork: dailyWork.length > 0 ? dailyWork : appData.dailyWork
    };
    
    Object.assign(appData, mergedData);
    saveData(); // Backup to localStorage
    
    showToast('✅ تم تحديث البيانات من قاعدة البيانات', 'success');
  } catch (error) {
    console.error('خطأ في المزامنة:', error);
    showToast('⚠️ فشل التحديث من قاعدة البيانات', 'warn');
  }
};

// Export for use in app.js
window.employeeService = employeeService;
window.clientService = clientService;
window.contractService = contractService;
window.attendanceService = attendanceService;
window.dailyWorkService = dailyWorkService;
window.financialService = financialService;
window.payrollService = payrollService;
window.syncFirebaseToLocal = syncFirebaseToLocal;
