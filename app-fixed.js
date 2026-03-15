// ============= SUPER PRO SYSTEM - Fixed Version =============
// Version 2.5.1 - All bugs fixed

// ============= GLOBAL VARIABLES =============
let currentUser = null;
let currentLanguage = localStorage.getItem('language') || 'ar';
let currentTheme = localStorage.getItem('theme') || 'light';
let highContrastEnabled = localStorage.getItem('highContrast') === 'true';
let isNotificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
let appNotifications = [];
let firebaseInitialized = false;

let appData = {
  employees: [],
  clients: [],
  contracts: [],
  attendance: [],
  payroll: [],
  dailyWork: [],
  income: [],
  expenses: [],
  tasks: [],
  notifications: [],
  firebaseSync: true,
  lastSync: new Date()
};

// ============= UTILITY FUNCTIONS =============
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-family: 'Tajawal', sans-serif;
    z-index: 10001;
    animation: slideIn 0.3s ease;
    max-width: 350px;
  `;
  toast.textContent = message;
  
  if(!document.querySelector('style[data-toast-animations]')) {
    const style = document.createElement('style');
    style.setAttribute('data-toast-animations', 'true');
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
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Safe element getter
function getElement(id, logWarning = true) {
  const element = document.getElementById(id);
  if (!element && logWarning) {
    console.warn(`Element with id "${id}" not found`);
  }
  return element;
}

// Safe element value getter
function getElementValue(id, defaultValue = '') {
  const element = getElement(id, false);
  return element ? element.value : defaultValue;
}

// Safe element value setter
function setElementValue(id, value) {
  const element = getElement(id, false);
  if (element) {
    element.value = value;
    return true;
  }
  return false;
}

// ============= FIREBASE INITIALIZATION =============
function initializeFirebase() {
  try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
      const firebaseConfig = {
        apiKey: "AIzaSyClOXATkxQ8XLrorz80JhkUdxXjbcySr2E",
        authDomain: "superpro-system-8871f.firebaseapp.com",
        projectId: "superpro-system-8871f",
        storageBucket: "superpro-system-8871f.firebasestorage.app",
        messagingSenderId: "318335312258",
        appId: "1:318335312258:web:42879aaee5fc8b9a126f9b",
        databaseURL: "https://superpro-system-8871f-default-rtdb.asia-southeast1.firebasedatabase.app/"
      };
      
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      
      window.firebaseDb = firebase.database();
      firebaseInitialized = true;
      console.log('✅ Firebase initialized successfully');
      return true;
    }
  } catch (e) {
    console.warn('⚠️ Firebase initialization skipped:', e.message);
    firebaseInitialized = false;
  }
  return false;
}

// ============= DATA PERSISTENCE =============
function saveData() {
  try {
    const dataToSave = JSON.stringify(appData);
    localStorage.setItem('superpro_data', dataToSave);
    
    // Also try to save to Firebase if available
    if (firebaseInitialized && window.firebaseDb) {
      try {
        const ref = window.firebaseDb.ref('superpro_data');
        ref.set(appData).catch(err => {
          console.warn('⚠️ Firebase save failed, using local only:', err.message);
        });
      } catch (e) {
        console.warn('⚠️ Firebase save error:', e.message);
      }
    }
    
    console.log('✅ Data saved successfully');
    return true;
  } catch (error) {
    console.error('❌ Error saving data:', error);
    showToast('خطأ في حفظ البيانات', 'error');
    return false;
  }
}

function loadData() {
  try {
    // Load from localStorage first
    const savedData = localStorage.getItem('superpro_data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      appData = { ...appData, ...parsed };
      console.log('✅ Data loaded from localStorage');
    }
    
    // Then try Firebase if available
    if (firebaseInitialized && window.firebaseDb) {
      try {
        const ref = window.firebaseDb.ref('superpro_data');
        ref.once('value', (snapshot) => {
          if (snapshot.exists()) {
            const firebaseData = snapshot.val();
            // Merge Firebase data with local data
            Object.keys(firebaseData).forEach(key => {
              if (Array.isArray(firebaseData[key]) && firebaseData[key].length > 0) {
                appData[key] = firebaseData[key];
              }
            });
            console.log('✅ Data synced from Firebase');
          }
        }).catch(err => {
          console.warn('⚠️ Firebase load failed:', err.message);
        });
      } catch (e) {
        console.warn('⚠️ Firebase load error:', e.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error loading data:', error);
    return false;
  }
}

// ============= AUTHENTICATION =============
const authUsers = {
  admin: { password: '1234', role: 'admin', name: 'المدير' },
  supervisor: { password: '1234', role: 'supervisor', name: 'المشرف' },
  viewer: { password: '1234', role: 'viewer', name: 'مشاهد' }
};

function handleAuthLogin() {
  console.log('🔐 محاولة تسجيل الدخول');
  
  const role = getElementValue('authRole', 'admin');
  const username = getElementValue('authUsername', '').trim();
  const password = getElementValue('authPassword', '');
  
  const authError = getElement('authError');
  
  // Check credentials
  const user = authUsers[username];
  if (user && user.password === password) {
    currentUser = {
      username: username,
      role: role,
      name: user.name,
      loginTime: new Date().toISOString()
    };
    
    // Store session
    sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Hide login, show app
    const authOverlay = getElement('authOverlay');
    const appWrapper = getElement('appWrapper');
    
    if (authOverlay) authOverlay.style.display = 'none';
    if (appWrapper) appWrapper.style.display = 'flex';
    
    // Update UI
    updateUserInfo();
    
    // Setup navigation
    setupNavigation();
    
    // Initialize UI
    initializeUIComponents();
    
    showToast(`مرحباً ${user.name}! تم تسجيل الدخول بنجاح`, 'success');
    console.log('✅ تسجيل دخول ناجح:', currentUser);
    
    if (authError) authError.style.display = 'none';
  } else {
    if (authError) {
      authError.textContent = '❌ اسم المستخدم أو كلمة المرور غير صحيحة';
      authError.style.display = 'block';
    }
    showToast('خطأ في تسجيل الدخول', 'error');
  }
}

function handleLogout() {
  currentUser = null;
  sessionStorage.removeItem('currentUser');
  
  const authOverlay = getElement('authOverlay');
  const appWrapper = getElement('appWrapper');
  
  if (authOverlay) authOverlay.style.display = 'flex';
  if (appWrapper) appWrapper.style.display = 'none';
  
  showToast('تم تسجيل الخروج', 'info');
}

function updateUserInfo() {
  if (!currentUser) return;
  
  const authUserLabel = getElement('authUserLabel');
  const authUserMeta = getElement('authUserMeta');
  
  if (authUserLabel) {
    authUserLabel.textContent = currentUser.name || currentUser.username;
  }
  
  if (authUserMeta) {
    const roleNames = { admin: 'مدير النظام', supervisor: 'مشرف', viewer: 'مشاهد' };
    authUserMeta.textContent = `${currentUser.username} - ${roleNames[currentUser.role] || currentUser.role}`;
  }
}

// ============= NAVIGATION =============
function setupNavigation() {
  console.log('🔗 إعداد التنقل...');
  
  const navLinks = document.querySelectorAll('[data-module], [data-page]');
  console.log(`وجدت ${navLinks.length} رابط تنقل`);
  
  navLinks.forEach((link) => {
    const module = link.dataset.module || link.dataset.page;
    
    link.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      navigate(module);
    });
  });
  
  // Navigate to dashboard
  setTimeout(() => navigate('dashboard'), 200);
}

function navigate(page) {
  if (!page) {
    console.warn('⚠️ لم يتم تحديد صفحة');
    return;
  }
  
  console.log(`🔄 تنقل إلى: ${page}`);
  
  try {
    // Hide all pages/modules
    const containers = document.querySelectorAll('.module-container, .page');
    containers.forEach(el => {
      el.style.display = 'none';
      el.classList.remove('active');
    });
    
    // Remove active from all nav items
    document.querySelectorAll('.nav-link, .nav-item').forEach(el => {
      el.classList.remove('active');
    });
    
    // Show selected module
    const module = document.getElementById(page) || document.getElementById(`page-${page}`);
    if (module) {
      module.style.display = 'block';
      module.classList.add('active');
      console.log(`✅ تم عرض: ${page}`);
    } else {
      console.warn(`⚠️ لم يتم العثور على وحدة: ${page}`);
      return;
    }
    
    // Mark nav as active
    const navLink = document.querySelector(`[data-module="${page}"], [data-page="${page}"]`);
    if (navLink) {
      navLink.classList.add('active');
      const navItem = navLink.closest('.nav-item');
      if (navItem) navItem.classList.add('active');
    }
    
    // Load page data
    loadPageData(page);
    
  } catch (err) {
    console.error(`❌ خطأ في التنقل:`, err);
  }
}

function loadPageData(page) {
  console.log(`📋 loadPageData: ${page}`);
  
  const loaders = {
    dashboard: loadDashboard,
    employees: loadEmployees,
    attendance: loadAttendance,
    payroll: loadPayroll,
    clients: loadClients,
    contracts: loadContracts,
    dailyWork: loadDailyWork,
    dailyIncome: loadIncome,
    dailyExpenses: loadExpenses,
    tasks: loadTasks,
    reports: loadReports,
    analytics: loadAnalytics,
    services: loadServices,
    finance: loadFinance,
    calendar: loadCalendar,
    settings: loadSettings,
    teams: loadTeams,
    locations: loadLocations
  };
  
  if (loaders[page]) {
    loaders[page]();
  }
}

// ============= PAGE LOADERS =============
function loadDashboard() {
  console.log('📊 تحميل لوحة التحكم');
  
  // Update stats
  const statEmployees = getElement('statEmployees');
  const statClients = getElement('statClients');
  const statContracts = getElement('statContracts');
  const statBalance = getElement('statBalance');
  
  if (statEmployees) statEmployees.textContent = (appData.employees?.length || 0).toLocaleString();
  if (statClients) statClients.textContent = (appData.clients?.length || 0).toLocaleString();
  if (statContracts) statContracts.textContent = (appData.contracts?.length || 0).toLocaleString();
  if (statBalance) {
    const totalIncome = (appData.income || []).reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const totalExpenses = (appData.expenses || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    statBalance.textContent = `${(totalIncome - totalExpenses).toLocaleString()} ر.ق`;
  }
  
  // Update date
  const currentDate = getElement('current-date');
  if (currentDate) {
    currentDate.textContent = new Date().toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

function loadEmployees() {
  console.log('👥 تحميل الموظفين');
  const tbody = document.querySelector('#employeesTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  (appData.employees || []).forEach((emp, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${emp.id || index + 1}</td>
      <td>${emp.name || '-'}</td>
      <td>${emp.position || emp.job || '-'}</td>
      <td>${emp.department || emp.nationality || '-'}</td>
      <td>${emp.salary || '-'}</td>
      <td>${emp.phone || '-'}</td>
      <td><span class="badge bg-${emp.status === 'نشط' ? 'success' : 'secondary'}">${emp.status || 'نشط'}</span></td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-warning" onclick="editEmployee(${index})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-outline-danger" onclick="deleteEmployee(${index})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function loadAttendance() {
  console.log('⏰ تحميل الحضور');
  const tbody = document.querySelector('#attendanceTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  (appData.attendance || []).forEach((record, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.employeeName || '-'}</td>
      <td>${record.date || '-'}</td>
      <td>${record.checkIn || '-'}</td>
      <td>${record.checkOut || '-'}</td>
      <td>${record.hours || '0'} ساعة</td>
      <td>${record.source || 'يدوي'}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteAttendance(${index})"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function loadPayroll() {
  console.log('💰 تحميل الرواتب');
  const tbody = document.querySelector('#payrollTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  (appData.payroll || []).forEach((record) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${record.employeeName || '-'}</td>
      <td>${record.month || '-'}</td>
      <td>${record.salary || '-'}</td>
      <td>${record.deductions || '0'}</td>
      <td>${record.netSalary || record.salary}</td>
      <td><span class="badge bg-${record.status === 'مدفوع' ? 'success' : 'warning'}">${record.status || 'غير مدفوع'}</span></td>
    `;
    tbody.appendChild(row);
  });
}

function loadClients() {
  console.log('👨‍💼 تحميل العملاء');
  const tbody = document.querySelector('#clientsTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  (appData.clients || []).forEach((client, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${client.name || '-'}</td>
      <td>${client.phone || '-'}</td>
      <td>${client.email || 'لا يوجد'}</td>
      <td>${client.company || client.area || 'لا يوجد'}</td>
      <td><span class="badge bg-success">نشط</span></td>
      <td>
        <button class="btn btn-sm btn-outline-warning" onclick="editClient(${index})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteClient(${index})"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function loadContracts() {
  console.log('📋 تحميل العقود');
  const tbody = document.querySelector('#contractsTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  (appData.contracts || []).forEach((contract, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${contract.contractNumber || contract.id || '-'}</td>
      <td>${contract.clientName || '-'}</td>
      <td>${contract.type || '-'}</td>
      <td>${contract.amount || '-'}</td>
      <td>${contract.startDate || '-'}</td>
      <td>${contract.endDate || '-'}</td>
      <td><span class="badge bg-${contract.status === 'نشط' ? 'success' : 'secondary'}">${contract.status || 'نشط'}</span></td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-warning" onclick="editContract(${index})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-outline-success" onclick="markContractAsPaid(${index})"><i class="fas fa-check"></i></button>
          <button class="btn btn-outline-danger" onclick="deleteContract(${index})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function loadDailyWork() {
  console.log('📅 تحميل العمل اليومي');
  const tbody = document.querySelector('#dailyWorkTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  (appData.dailyWork || []).forEach((work, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${work.date || '-'}</td>
      <td>${work.description || '-'}</td>
      <td>${work.clientName || '-'}</td>
      <td>${work.amount || '-'}</td>
      <td>${work.paymentMethod || 'نقدي'}</td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-warning" onclick="editDailyWork(${index})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-outline-danger" onclick="deleteDailyWork(${index})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function loadIncome() {
  console.log('💵 تحميل المدخولات');
  const tbody = document.querySelector('#incomeTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  (appData.income || []).forEach((inc, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${inc.date || '-'}</td>
      <td>${inc.description || '-'}</td>
      <td>${inc.amount || '-'}</td>
      <td>${inc.source || 'غير محدد'}</td>
      <td><span class="badge bg-success">${inc.status || 'مثبت'}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteDailyIncome(${index})"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function loadExpenses() {
  console.log('💸 تحميل المصروفات');
  const tbody = document.querySelector('#expensesTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  (appData.expenses || []).forEach((exp, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${exp.date || '-'}</td>
      <td>${exp.description || '-'}</td>
      <td>${exp.amount || '-'}</td>
      <td>${exp.category || 'غير محدد'}</td>
      <td><span class="badge bg-warning">${exp.status || 'مدفوع'}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-danger" onclick="deleteDailyExpense(${index})"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function loadTasks() {
  console.log('📝 تحميل المهام');
  const tbody = document.querySelector('#tasksTable tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  (appData.tasks || []).forEach((task, index) => {
    const priorityColors = { 'عالي': 'danger', 'متوسط': 'warning', 'منخفض': 'info' };
    const statusColors = { 'مكتمل': 'success', 'قيد التنفيذ': 'primary', 'قيد الانتظار': 'warning', 'ملغي': 'danger' };
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${task.title || '-'}</td>
      <td>${task.description || 'لا يوجد'}</td>
      <td><span class="badge bg-${priorityColors[task.priority] || 'secondary'}">${task.priority || 'متوسط'}</span></td>
      <td><span class="badge bg-${statusColors[task.status] || 'secondary'}">${task.status || 'قيد الانتظار'}</span></td>
      <td>${task.dueDate || 'غير محدد'}</td>
      <td>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-warning" onclick="editTask(${index})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-outline-danger" onclick="deleteTask(${index})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function loadReports() { console.log('📈 تحميل التقارير'); }
function loadAnalytics() { console.log('📊 تحميل التحليلات'); }
function loadServices() { console.log('🛎️ تحميل الخدمات'); }
function loadFinance() { console.log('💳 تحميل الحسابات المالية'); }
function loadCalendar() { console.log('📅 تحميل التقويم'); }
function loadSettings() { console.log('⚙️ تحميل الإعدادات'); }
function loadTeams() { console.log('👥 تحميل الفرق'); }
function loadLocations() { console.log('📍 تحميل المواقع'); }

// ============= CRUD OPERATIONS =============

// Employee Operations
function addEmployee() {
  const name = getElementValue('employeeName');
  const position = getElementValue('employeePosition');
  const department = getElementValue('employeeDepartment');
  const salary = getElementValue('employeeSalary');
  const phone = getElementValue('employeePhone');
  
  if (!name || !position || !salary) {
    showToast('يرجى ملء الحقول المطلوبة', 'warning');
    return;
  }
  
  const newEmployee = {
    id: Date.now(),
    name, position, department, salary, phone,
    status: 'نشط',
    hireDate: new Date().toISOString().split('T')[0]
  };
  
  appData.employees.push(newEmployee);
  saveData();
  loadEmployees();
  
  // Reset form and close modal
  const form = getElement('addEmployeeForm');
  if (form) form.reset();
  
  closeModal('addEmployeeModal');
  showToast('تم إضافة الموظف بنجاح', 'success');
}

function editEmployee(index) {
  const employee = appData.employees[index];
  if (!employee) return;
  
  setElementValue('editEmployeeName', employee.name);
  setElementValue('editEmployeePosition', employee.position);
  setElementValue('editEmployeeDepartment', employee.department || '');
  setElementValue('editEmployeeSalary', employee.salary);
  setElementValue('editEmployeePhone', employee.phone || '');
  setElementValue('editEmployeeIndex', index);
  
  openModal('editEmployeeModal');
}

function updateEmployee() {
  const index = getElementValue('editEmployeeIndex');
  const employee = appData.employees[index];
  if (!employee) return;
  
  employee.name = getElementValue('editEmployeeName');
  employee.position = getElementValue('editEmployeePosition');
  employee.department = getElementValue('editEmployeeDepartment');
  employee.salary = getElementValue('editEmployeeSalary');
  employee.phone = getElementValue('editEmployeePhone');
  
  saveData();
  loadEmployees();
  closeModal('editEmployeeModal');
  showToast('تم تحديث بيانات الموظف', 'success');
}

function deleteEmployee(index) {
  if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
  
  appData.employees.splice(index, 1);
  saveData();
  loadEmployees();
  showToast('تم حذف الموظف', 'success');
}

// Client Operations
function addClient() {
  const name = getElementValue('clientName');
  const phone = getElementValue('clientPhone');
  const email = getElementValue('clientEmail');
  const company = getElementValue('clientCompany');
  
  if (!name || !phone) {
    showToast('يرجى ملء الحقول المطلوبة', 'warning');
    return;
  }
  
  const newClient = {
    id: Date.now(),
    name, phone, email, company,
    status: 'نشط',
    createdAt: new Date().toISOString()
  };
  
  appData.clients.push(newClient);
  saveData();
  loadClients();
  
  const form = getElement('addClientForm');
  if (form) form.reset();
  
  closeModal('addClientModal');
  showToast('تم إضافة العميل بنجاح', 'success');
}

function editClient(index) {
  const client = appData.clients[index];
  if (!client) return;
  
  setElementValue('editClientName', client.name);
  setElementValue('editClientPhone', client.phone);
  setElementValue('editClientEmail', client.email || '');
  setElementValue('editClientCompany', client.company || '');
  setElementValue('editClientIndex', index);
  
  openModal('editClientModal');
}

function updateClient() {
  const index = getElementValue('editClientIndex');
  const client = appData.clients[index];
  if (!client) return;
  
  client.name = getElementValue('editClientName');
  client.phone = getElementValue('editClientPhone');
  client.email = getElementValue('editClientEmail');
  client.company = getElementValue('editClientCompany');
  
  saveData();
  loadClients();
  closeModal('editClientModal');
  showToast('تم تحديث بيانات العميل', 'success');
}

function deleteClient(index) {
  if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
  
  appData.clients.splice(index, 1);
  saveData();
  loadClients();
  showToast('تم حذف العميل', 'success');
}

// Contract Operations
function addContract() {
  const contractNumber = getElementValue('contractNumber');
  const clientName = getElementValue('contractClientName');
  const type = getElementValue('contractType');
  const amount = getElementValue('contractAmount');
  const startDate = getElementValue('contractStartDate');
  const endDate = getElementValue('contractEndDate');
  
  if (!contractNumber || !clientName || !amount) {
    showToast('يرجى ملء الحقول المطلوبة', 'warning');
    return;
  }
  
  const newContract = {
    id: Date.now(),
    contractNumber, clientName, type, amount, startDate, endDate,
    status: 'نشط',
    createdAt: new Date().toISOString()
  };
  
  appData.contracts.push(newContract);
  saveData();
  loadContracts();
  
  const form = getElement('addContractForm');
  if (form) form.reset();
  
  closeModal('addContractModal');
  showToast('تم إضافة العقد بنجاح', 'success');
}

function editContract(index) {
  const contract = appData.contracts[index];
  if (!contract) return;
  
  setElementValue('editContractNumber', contract.contractNumber);
  setElementValue('editContractClientName', contract.clientName);
  setElementValue('editContractType', contract.type || '');
  setElementValue('editContractAmount', contract.amount);
  setElementValue('editContractStartDate', contract.startDate || '');
  setElementValue('editContractEndDate', contract.endDate || '');
  setElementValue('editContractIndex', index);
  
  openModal('editContractModal');
}

function updateContract() {
  const index = getElementValue('editContractIndex');
  const contract = appData.contracts[index];
  if (!contract) return;
  
  contract.contractNumber = getElementValue('editContractNumber');
  contract.clientName = getElementValue('editContractClientName');
  contract.type = getElementValue('editContractType');
  contract.amount = getElementValue('editContractAmount');
  contract.startDate = getElementValue('editContractStartDate');
  contract.endDate = getElementValue('editContractEndDate');
  
  saveData();
  loadContracts();
  closeModal('editContractModal');
  showToast('تم تحديث بيانات العقد', 'success');
}

function deleteContract(index) {
  if (!confirm('هل أنت متأكد من حذف هذا العقد؟')) return;
  
  appData.contracts.splice(index, 1);
  saveData();
  loadContracts();
  showToast('تم حذف العقد', 'success');
}

function markContractAsPaid(index) {
  const contract = appData.contracts[index];
  if (contract) {
    contract.status = 'مدفوع';
    contract.paidDate = new Date().toISOString().split('T')[0];
    saveData();
    loadContracts();
    showToast('تم تحديث حالة العقد إلى مدفوع', 'success');
  }
}

// Delete functions for other entities
function deleteAttendance(index) {
  if (!confirm('هل أنت متأكد من حذف سجل الحضور؟')) return;
  appData.attendance.splice(index, 1);
  saveData();
  loadAttendance();
  showToast('تم حذف سجل الحضور', 'success');
}

function deleteDailyWork(index) {
  if (!confirm('هل أنت متأكد من حذف هذا العمل؟')) return;
  appData.dailyWork.splice(index, 1);
  saveData();
  loadDailyWork();
  showToast('تم حذف العمل اليومي', 'success');
}

function deleteDailyIncome(index) {
  if (!confirm('هل أنت متأكد من حذف هذا المدخل؟')) return;
  appData.income.splice(index, 1);
  saveData();
  loadIncome();
  showToast('تم حذف المدخل', 'success');
}

function deleteDailyExpense(index) {
  if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) return;
  appData.expenses.splice(index, 1);
  saveData();
  loadExpenses();
  showToast('تم حذف المصروف', 'success');
}

function deleteTask(index) {
  if (!confirm('هل أنت متأكد من حذف هذه المهمة؟')) return;
  appData.tasks.splice(index, 1);
  saveData();
  loadTasks();
  showToast('تم حذف المهمة', 'success');
}

// ============= MODAL HELPERS =============
function openModal(modalId) {
  const modal = getElement(modalId);
  if (!modal) return;
  
  // Try Bootstrap modal first
  if (typeof bootstrap !== 'undefined') {
    try {
      const bsModal = new bootstrap.Modal(modal);
      bsModal.show();
      return;
    } catch (e) {}
  }
  
  // Fallback to custom modal
  modal.classList.add('open');
  modal.style.display = 'flex';
}

function closeModal(modalId) {
  const modal = getElement(modalId);
  if (!modal) return;
  
  // Try Bootstrap modal first
  if (typeof bootstrap !== 'undefined') {
    try {
      const bsModal = bootstrap.Modal.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
        return;
      }
    } catch (e) {}
  }
  
  // Fallback
  modal.classList.remove('open');
  modal.style.display = 'none';
}

// ============= THEME FUNCTIONS =============
function initDarkMode() {
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
}

function toggleDarkMode() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  localStorage.setItem('theme', currentTheme);
  document.body.classList.toggle('dark-mode');
  showToast(currentTheme === 'dark' ? 'تم تفعيل الوضع الليلي' : 'تم تفعيل الوضع النهاري', 'info');
}

function initHighContrast() {
  if (highContrastEnabled) {
    document.body.classList.add('high-contrast');
  }
}

function toggleHighContrast() {
  highContrastEnabled = !highContrastEnabled;
  localStorage.setItem('highContrast', highContrastEnabled);
  document.body.classList.toggle('high-contrast');
  showToast(highContrastEnabled ? 'تم تفعيل التباين العالي' : 'تم إلغاء التباين العالي', 'info');
}

// ============= LANGUAGE FUNCTIONS =============
function changeLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  showToast(lang === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed', 'info');
  
  // Update active button
  document.querySelectorAll('.language-btn, .lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// ============= BACKUP FUNCTIONS =============
function backupData() {
  const dataStr = JSON.stringify(appData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `superpro_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('تم تحميل النسخة الاحتياطية', 'success');
}

function restoreData(file) {
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      appData = { ...appData, ...data };
      saveData();
      showToast('تم استرجاع البيانات بنجاح', 'success');
      
      // Reload current page
      const activeModule = document.querySelector('.nav-link.active, .nav-item.active');
      if (activeModule) {
        const module = activeModule.dataset.module || activeModule.dataset.page;
        if (module) loadPageData(module);
      }
    } catch (err) {
      showToast('خطأ في قراءة الملف', 'error');
    }
  };
  reader.readAsText(file);
}

// ============= SIDEBAR TOGGLE =============
function initializeUIComponents() {
  console.log('🎨 تهيئة عناصر الواجهة');
  
  // Sidebar toggle
  const sidebarToggle = getElement('sidebarToggle');
  const sidebar = getElement('sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }
  
  // Dark mode toggle
  const darkModeToggle = getElement('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }
  
  // Logout button
  const authLogoutBtn = getElement('authLogoutBtn');
  if (authLogoutBtn) {
    authLogoutBtn.addEventListener('click', handleLogout);
  }
  
  // Update date
  const currentDate = getElement('current-date');
  if (currentDate) {
    currentDate.textContent = new Date().toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

// ============= INITIALIZE ALL MODULES =============
function initializeAllModules() {
  console.log('📦 تهيئة جميع الوحدات');
  
  // Initialize notification system if available
  if (typeof advancedNotificationsModule !== 'undefined') {
    console.log('✅ Notification system available');
  }
  
  // Initialize monthly performance if available
  if (typeof monthlyPerformanceModule !== 'undefined') {
    console.log('✅ Monthly performance module available');
  }
}

// ============= MAIN INITIALIZATION =============
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 بدء تحميل التطبيق...');
  
  try {
    // Set initial language direction
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    
    // Initialize themes
    initDarkMode();
    initHighContrast();
    
    // Initialize Firebase
    initializeFirebase();
    
    // Load data
    loadData();
    console.log('✅ تم تحميل البيانات');
    
    // Check for existing session
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      
      const authOverlay = getElement('authOverlay');
      const appWrapper = getElement('appWrapper');
      
      if (authOverlay) authOverlay.style.display = 'none';
      if (appWrapper) appWrapper.style.display = 'flex';
      
      updateUserInfo();
      setupNavigation();
      initializeUIComponents();
    } else {
      // Show login screen
      const authOverlay = getElement('authOverlay');
      if (authOverlay) {
        authOverlay.style.display = 'flex';
      }
      
      // Setup login handlers
      const authLoginBtn = getElement('authLoginBtn');
      if (authLoginBtn) {
        authLoginBtn.addEventListener('click', handleAuthLogin);
      }
      
      const authPassword = getElement('authPassword');
      if (authPassword) {
        authPassword.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') handleAuthLogin();
        });
      }
    }
    
    // Initialize modules
    initializeAllModules();
    
    console.log('🎉 تم تهيئة التطبيق بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في تهيئة التطبيق:', error);
    
    document.body.innerHTML = `
      <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif; direction: rtl;">
        <h2 style="color: #dc3545;">❌ حدث خطأ في تحميل النظام</h2>
        <p>يرجى تحديث الصفحة والمحاولة مرة أخرى</p>
        <button onclick="location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
          تحديث الصفحة
        </button>
        <details style="text-align: right; margin-top: 20px;">
          <summary>تفاصيل الخطأ (للمطورين)</summary>
          <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; text-align: left; direction: ltr;">${error.stack || error.message}</pre>
        </details>
      </div>
    `;
  }
});

// ============= EXPORT GLOBAL FUNCTIONS =============
window.addEmployee = addEmployee;
window.editEmployee = editEmployee;
window.updateEmployee = updateEmployee;
window.deleteEmployee = deleteEmployee;
window.addClient = addClient;
window.editClient = editClient;
window.updateClient = updateClient;
window.deleteClient = deleteClient;
window.addContract = addContract;
window.editContract = editContract;
window.updateContract = updateContract;
window.deleteContract = deleteContract;
window.markContractAsPaid = markContractAsPaid;
window.deleteAttendance = deleteAttendance;
window.deleteDailyWork = deleteDailyWork;
window.deleteDailyIncome = deleteDailyIncome;
window.deleteDailyExpense = deleteDailyExpense;
window.deleteTask = deleteTask;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleDarkMode = toggleDarkMode;
window.toggleHighContrast = toggleHighContrast;
window.changeLanguage = changeLanguage;
window.backupData = backupData;
window.restoreData = restoreData;
window.navigate = navigate;

console.log('✅ SuperPro System v2.5.1 - Fixed Version Loaded');
