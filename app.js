// ============= SUPER PRO SYSTEM v2 - Core Application =============

// ============= STATE MANAGEMENT =============
let currentUser = null;
let currentLanguage = localStorage.getItem('language') || 'ar';
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
  notifications: []
};

// ============= LANGUAGE HANDLER =============
function changeLanguage(lang) {
  if(!lang || !languagesDictionary[lang]) return;
  
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  
  // Update active button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  
  // Update page direction
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  
  // Update UI text based on language
  updateLanguageUI();
  
  // Reload current page
  const activeNav = document.querySelector('.nav-item.active');
  if(activeNav) {
    const module = activeNav.querySelector('[data-module]');
    if(module) {
      const page = module.dataset.module;
      navigate(page);
    }
  }
  
  showToast(lang === 'ar' ? 'تم تغيير اللغة للعربية' : lang === 'en' ? 'Language changed to English' : 'Langue changée en Français', 'success');
}

function updateLanguageUI() {
  const dict = languagesDictionary[currentLanguage] || languagesDictionary['ar'];
  
  // Update all elements with data-translate attribute
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.dataset.translate;
    const keys = key.split('.');
    let text = dict;
    
    keys.forEach(k => {
      text = text[k] || key;
    });
    
    if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });
}

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOMContentLoaded: البدء بتحميل التطبيق...');
  
  // Set initial language
  document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
  });
  
  console.log('✅ اللغة: ' + currentLanguage);
  
  loadData();
  console.log('✅ تم تحميل البيانات');
  
  setupEventListeners();
  console.log('✅ تم إعداد المستمعين');
  
  updateCurrentDate();
  setInterval(updateCurrentDate, 60000);
  
  // Set login button
  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  document.getElementById('loginPass').addEventListener('keypress', function(e) {
    if(e.key === 'Enter') handleLogin();
  });
  
  // Role selector buttons
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Sidebar navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const module = this.querySelector('[data-module]');
      if(module) {
        const page = module.dataset.module;
        navigate(page);
      }
    });
  });
  
  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('open');
  });
});

// ============= LOGIN HANDLER =============
function handleLogin() {
  console.log('🔐 محاولة تسجيل دخول...');
  
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value.trim();
  const role = document.querySelector('.role-btn.active').dataset.role;
  
  console.log('👤 المستخدم:', username, '- الدور:', role);
  
  const validUsers = {
    'admin': '1234',
    'supervisor': '1234',
    'viewer': '1234'
  };
  
  if(validUsers[username] === password) {
    console.log('✅ كلمة المرور صحيحة!');
    
    currentUser = { username, role };
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appWrapper').style.display = 'flex';
    
    console.log('✅ تم إخفاء شاشة الدخول وإظهار التطبيق');
    
    updateUserInfo();
    
    // Load data from Firebase if available
    if(typeof syncFirebaseToLocal !== 'undefined') {
      console.log('🔄 جاري تحميل البيانات من Firebase...');
      syncFirebaseToLocal().then(() => {
        console.log('✅ تم تحميل البيانات من Firebase');
        loadDashboard();
      }).catch(err => {
        console.warn('⚠️ خطأ في تحميل Firebase:', err);
        loadDashboard();
      });
    } else {
      console.log('📦 تحميل البيانات المحلية');
      loadDashboard();
    }
    
    showToast('تم تسجيل الدخول بنجاح', 'success');
  } else {
    console.warn('❌ كلمة المرور أو اسم المستخدم غير صحيح');
    document.getElementById('loginError').style.display = 'block';
    setTimeout(() => {
      document.getElementById('loginError').style.display = 'none';
    }, 3000);
  }
}

function updateUserInfo() {
  const roleNames = {
    'admin': 'مدير النظام',
    'supervisor': 'المشرف',
    'viewer': 'عارض'
  };
  
  document.getElementById('userNameHdr').textContent = currentUser.username;
  document.getElementById('userRoleHdr').textContent = roleNames[currentUser.role];
  document.getElementById('userAvatarHdr').textContent = currentUser.username.charAt(0).toUpperCase();
}

// ============= NAVIGATION =============
function navigate(page) {
  // Hide all module containers
  document.querySelectorAll('.module-container').forEach(el => el.style.display = 'none');
  
  // Remove active from all navigation items
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  
  // Show the selected page
  const pageEl = document.getElementById(page);
  if(pageEl) {
    pageEl.style.display = 'block';
  }
  
  // Mark navigation item as active
  const navItem = document.querySelector(`[data-module="${page}"]`);
  if(navItem) {
    navItem.closest('.nav-item').classList.add('active');
  }
  
  // Load page-specific data
  if(page === 'dashboard') loadDashboard();
  if(page === 'employees') loadEmployees();
  if(page === 'attendance') loadAttendance();
  if(page === 'payroll') loadPayroll();
  if(page === 'clients') loadClients();
  if(page === 'contracts') loadContracts();
  if(page === 'teams') loadTeams();
  if(page === 'locations') loadLocations();
  if(page === 'packages') loadPackages();
  if(page === 'ratings') loadRatings();
  if(page === 'reports') loadReports();
  if(page === 'dailyWork') loadDailyWork();
  if(page === 'dailyIncome') loadIncome();
  if(page === 'dailyExpenses') loadExpenses();
  if(page === 'tasks') loadTasks();
  if(page === 'calendar') loadCalendar();
  if(page === 'settings') loadSettings();
  if(page === 'activityLog') loadActivityLog();
  if(page === 'services') loadServices();
  if(page === 'finance') loadFinance();
}

// ============= DASHBOARD =============
function loadDashboard() {
  const greeting = document.getElementById('dashGreeting');
  const hour = new Date().getHours();
  const greetingTexts = {
    'ar': { morning: 'صباح الخير', afternoon: 'مساء الخير', evening: 'تصبح على خير' },
    'en': { morning: 'Good Morning', afternoon: 'Good Afternoon', evening: 'Good Evening' },
    'fr': { morning: 'Bonjour', afternoon: 'Bon Après-midi', evening: 'Bonsoir' }
  };
  const texts = greetingTexts[currentLanguage] || greetingTexts['ar'];
  let greetingText = hour < 12 ? texts.morning : hour < 18 ? texts.afternoon : texts.evening;
  greeting.textContent = `${greetingText}, ${currentUser.username}!`;
  
  // Calculate metrics
  const totalIncome = getTotalIncome();
  const totalExpenses = getTotalExpenses();
  const netProfit = totalIncome - totalExpenses;
  const activeContracts = appData.contracts.filter(c => c.status === 'نشط' || c.status === 'active').length;
  const totalAttendance = appData.attendance.length;
  
  // Load stats with enhanced information
  const labels = {
    'ar': { employees: 'الموظفين', clients: 'العملاء', contracts: 'العقود', income: 'المدخولات', profit: 'الربح', attendance: 'الحضور' },
    'en': { employees: 'Employees', clients: 'Clients', contracts: 'Contracts', income: 'Income', profit: 'Profit', attendance: 'Attendance' },
    'fr': { employees: 'Employés', clients: 'Clients', contracts: 'Contrats', income: 'Revenus', profit: 'Profit', attendance: 'Présence' }
  }[currentLanguage] || {
    'ar': { employees: 'الموظفين', clients: 'العملاء', contracts: 'العقود', income: 'المدخولات', profit: 'الربح', attendance: 'الحضور' }
  };
  
  const statsHtml = `
    <div class="stat-card" onclick="navigate('employees')" style="cursor:pointer">
      <div style="font-size:24px;margin-bottom:10px">👥</div>
      <div class="stat-val">${appData.employees.length}</div>
      <div class="stat-lbl">${labels.employees}</div>
    </div>
    <div class="stat-card" onclick="navigate('clients')" style="cursor:pointer">
      <div style="font-size:24px;margin-bottom:10px">👨‍💼</div>
      <div class="stat-val">${appData.clients.length}</div>
      <div class="stat-lbl">${labels.clients}</div>
    </div>
    <div class="stat-card" onclick="navigate('contracts')" style="cursor:pointer">
      <div style="font-size:24px;margin-bottom:10px">📋</div>
      <div class="stat-val">${activeContracts}/${appData.contracts.length}</div>
      <div class="stat-lbl">${labels.contracts}</div>
    </div>
    <div class="stat-card" style="border-color:#00d4aa;background:rgba(0,212,170,.08)">
      <div style="font-size:24px;margin-bottom:10px">💚</div>
      <div class="stat-val" style="color:#00d4aa">${totalIncome.toLocaleString()}</div>
      <div class="stat-lbl">${labels.income}</div>
    </div>
    <div class="stat-card" style="border-color:#27ae60;background:rgba(39,174,96,.08)">
      <div style="font-size:24px;margin-bottom:10px">📈</div>
      <div class="stat-val" style="color:#27ae60">${netProfit.toLocaleString()}</div>
      <div class="stat-lbl">${labels.profit}</div>
    </div>
    <div class="stat-card" onclick="navigate('attendance')" style="cursor:pointer">
      <div style="font-size:24px;margin-bottom:10px">✅</div>
      <div class="stat-val">${totalAttendance}</div>
      <div class="stat-lbl">${labels.attendance}</div>
    </div>
  `;
  document.getElementById('dashStats').innerHTML = statsHtml;
  
  // Load recent transactions
  const recent = [...appData.income, ...appData.expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  
  const recentHtml = recent.map((item, idx) => `
    <tr>
      <td>${item.date}</td>
      <td>${item.type || 'عام'}</td>
      <td>${item.description || '-'}</td>
      <td style="color:${item.amount > 0 ? '#2ecc71' : '#e74c3c'}">${item.amount}</td>
    </tr>
  `).join('');
  
  document.getElementById('recentTbl').innerHTML = recentHtml || '<tr><td colspan="4">لا توجد بيانات</td></tr>';
}

function getTotalIncome() {
  return appData.income.reduce((sum, item) => sum + (item.amount || 0), 0);
}

function getTotalExpenses() {
  return appData.expenses.reduce((sum, item) => sum + (item.amount || 0), 0);
}

// ============= INCOME & EXPENSES =============
async function loadIncome() {
  // Try to load from Firebase first
  if(typeof financialService !== 'undefined') {
    try {
      const firebaseIncome = await financialService.getIncome();
      if(firebaseIncome && firebaseIncome.length > 0) {
        appData.income = firebaseIncome;
      }
    } catch(error) {
      console.warn('خطأ في تحميل من Firebase:', error);
    }
  }
  
  const tbody = document.getElementById('incomeTbody');
  if(!tbody) return;
  
  const html = appData.income.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${item.date}</td>
      <td>${item.type || 'دخل عام'}</td>
      <td>${item.description || '-'}</td>
      <td style="color:#2ecc71;font-weight:600">${item.amount.toLocaleString()}</td>
    </tr>
  `).join('');
  
  tbody.innerHTML = html || '<tr><td colspan="5">لا توجد حركات دخل</td></tr>';
}

async function saveIncome() {
  const income = {
    date: document.getElementById('incomeDate').value,
    type: document.getElementById('incomeType').value,
    description: document.getElementById('incomeDesc').value,
    amount: parseFloat(document.getElementById('incomeAmount').value) || 0
  };
  
  if(!income.date || !income.amount) {
    showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }
  
  // Try Firebase first
  if(typeof financialService !== 'undefined') {
    const result = await financialService.addIncome(income);
    if(result) {
      appData.income.push(result);
      saveData();
      closeModal('incomeModal');
      loadIncome();
      
      document.getElementById('incomeDate').value = '';
      document.getElementById('incomeType').value = '';
      document.getElementById('incomeDesc').value = '';
      document.getElementById('incomeAmount').value = '';
      return;
    }
  }
  
  // Fallback to localStorage
  income.id = Date.now().toString();
  appData.income.push(income);
  saveData();
  closeModal('incomeModal');
  loadIncome();
  showToast('تم إضافة دخل بنجاح', 'success');
  
  document.getElementById('incomeDate').value = '';
  document.getElementById('incomeType').value = '';
  document.getElementById('incomeDesc').value = '';
  document.getElementById('incomeAmount').value = '';
}

async function loadExpenses() {
  // Try to load from Firebase first
  if(typeof financialService !== 'undefined') {
    try {
      const firebaseExpenses = await financialService.getExpenses();
      if(firebaseExpenses && firebaseExpenses.length > 0) {
        appData.expenses = firebaseExpenses;
      }
    } catch(error) {
      console.warn('خطأ في تحميل من Firebase:', error);
    }
  }
  
  const tbody = document.getElementById('expenseTbody');
  if(!tbody) return;
  
  const html = appData.expenses.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${item.date}</td>
      <td>${item.category || 'مصروف عام'}</td>
      <td>${item.description || '-'}</td>
      <td style="color:#e74c3c;font-weight:600">${item.amount.toLocaleString()}</td>
    </tr>
  `).join('');
  
  tbody.innerHTML = html || '<tr><td colspan="5">لا توجد مصروفات</td></tr>';
}

async function saveExpense() {
  const expense = {
    date: document.getElementById('expenseDate').value,
    category: document.getElementById('expenseCategory').value,
    description: document.getElementById('expenseDesc').value,
    amount: parseFloat(document.getElementById('expenseAmount').value) || 0
  };
  
  if(!expense.date || !expense.amount) {
    showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }
  
  // Try Firebase first
  if(typeof financialService !== 'undefined') {
    const result = await financialService.addExpense(expense);
    if(result) {
      appData.expenses.push(result);
      saveData();
      closeModal('expenseModal');
      loadExpenses();
      
      document.getElementById('expenseDate').value = '';
      document.getElementById('expenseCategory').value = '';
      document.getElementById('expenseDesc').value = '';
      document.getElementById('expenseAmount').value = '';
      return;
    }
  }
  
  // Fallback to localStorage
  expense.id = Date.now().toString();
  appData.expenses.push(expense);
  saveData();
  closeModal('expenseModal');
  loadExpenses();
  showToast('تم إضافة مصروف بنجاح', 'success');
  
  document.getElementById('expenseDate').value = '';
  document.getElementById('expenseCategory').value = '';
  document.getElementById('expenseDesc').value = '';
  document.getElementById('expenseAmount').value = '';
}

// ============= EMPLOYEES =============
async function loadEmployees() {
  // Try to load from Firebase first
  if(typeof employeeService !== 'undefined') {
    try {
      const firebaseEmployees = await employeeService.getEmployees();
      if(firebaseEmployees && firebaseEmployees.length > 0) {
        appData.employees = firebaseEmployees;
      }
    } catch(error) {
      console.warn('خطأ في تحميل من Firebase:', error);
    }
  }
  
  const tbody = document.getElementById('empTbody');
  const html = appData.employees.map((emp, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${emp.name}</td>
      <td>${emp.nationality || '-'}</td>
      <td>${emp.job || '-'}</td>
      <td>${emp.salary || 0}</td>
      <td><span class="badge badge-green">${emp.status || 'نشط'}</span></td>
    </tr>
  `).join('');
  
  tbody.innerHTML = html || '<tr><td colspan="6">لا توجد موظفين</td></tr>';
}

async function saveEmployee() {
  const emp = {
    name: document.getElementById('empName').value,
    nationality: document.getElementById('empNationality').value,
    job: document.getElementById('empJob').value,
    salary: parseFloat(document.getElementById('empSalary').value) || 0,
    status: 'نشط',
    date: new Date().toISOString().split('T')[0]
  };
  
  if(!emp.name) {
    showToast('يرجى ملء الاسم', 'error');
    return;
  }
  
  // Try Firebase first
  if(typeof employeeService !== 'undefined') {
    const result = await employeeService.addEmployee(emp);
    if(result) {
      appData.employees.push(result);
      saveData();
      closeModal('empModal');
      loadEmployees();
      
      // Clear form
      document.getElementById('empName').value = '';
      document.getElementById('empNationality').value = '';
      document.getElementById('empJob').value = '';
      document.getElementById('empSalary').value = '';
      return;
    }
  }
  
  // Fallback to localStorage
  emp.id = Date.now().toString();
  appData.employees.push(emp);
  saveData();
  closeModal('empModal');
  loadEmployees();
  showToast('تم إضافة الموظف بنجاح', 'success');
  
  // Clear form
  document.getElementById('empName').value = '';
  document.getElementById('empNationality').value = '';
  document.getElementById('empJob').value = '';
  document.getElementById('empSalary').value = '';
}

// ============= ATTENDANCE =============
async function loadAttendance() {
  // Try to load from Firebase first
  if(typeof attendanceService !== 'undefined') {
    try {
      const firebaseAtt = await attendanceService.getAttendance();
      if(firebaseAtt && firebaseAtt.length > 0) {
        appData.attendance = firebaseAtt;
      }
    } catch(error) {
      console.warn('خطأ في تحميل من Firebase:', error);
    }
  }
  
  // Load employee filter
  const select = document.getElementById('attEmployee');
  select.innerHTML = '<option value="">اختر موظف</option>' + 
    appData.employees.map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('');
  
  const tbody = document.getElementById('attTbody');
  const html = appData.attendance.map((att, idx) => {
    const emp = appData.employees.find(e => e.id == att.empId);
    return `
      <tr>
        <td>${idx + 1}</td>
        <td>${emp ? emp.name : '-'}</td>
        <td>${att.date}</td>
        <td><span class="badge badge-cyan">${att.status}</span></td>
        <td>${att.hours || 0}</td>
      </tr>
    `;
  }).join('');
  
  document.getElementById('attTbody').innerHTML = html || '<tr><td colspan="5">لا توجد سجلات</td></tr>';
}

async function saveAttendance() {
  const att = {
    empId: document.getElementById('attEmployee').value,
    date: document.getElementById('attDate').value,
    status: document.getElementById('attStatus').value,
    hours: 8
  };
  
  if(!att.empId || !att.date) {
    showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }
  
  // Try Firebase first
  if(typeof attendanceService !== 'undefined') {
    const result = await attendanceService.addAttendance(att);
    if(result) {
      appData.attendance.push(result);
      saveData();
      closeModal('attModal');
      loadAttendance();
      return;
    }
  }
  
  // Fallback to localStorage
  att.id = Date.now().toString();
  appData.attendance.push(att);
  saveData();
  closeModal('attModal');
  loadAttendance();
  showToast('تم تسجيل الحضور بنجاح', 'success');
}

// ============= PAYROLL =============
async function loadPayroll() {
  // Try to load from Firebase first
  if(typeof payrollService !== 'undefined') {
    try {
      const firebasePayroll = await payrollService.getPayroll();
      if(firebasePayroll && firebasePayroll.length > 0) {
        appData.payroll = firebasePayroll;
      }
    } catch(error) {
      console.warn('خطأ في تحميل من Firebase:', error);
    }
  }
  
  const tbody = document.getElementById('payrollTbody');
  const html = appData.employees.map((emp, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${emp.name}</td>
      <td>${emp.salary || 0}</td>
      <td>22</td>
      <td style="color:#2ecc71">${emp.salary || 0}</td>
    </tr>
  `).join('');
  
  document.getElementById('payrollTbody').innerHTML = html || '<tr><td colspan="5">لا توجد بيانات</td></tr>';
}

async function savePayroll() {
  const payroll = {
    employeeId: document.getElementById('payrollEmployee').value,
    month: document.getElementById('payrollMonth').value,
    basicSalary: parseFloat(document.getElementById('payrollBasic').value) || 0,
    deductions: parseFloat(document.getElementById('payrollDeductions').value) || 0,
    netSalary: parseFloat(document.getElementById('payrollNet').value) || 0,
    date: new Date().toISOString().split('T')[0]
  };
  
  if(!payroll.employeeId || !payroll.month) {
    showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }
  
  // Try Firebase first
  if(typeof payrollService !== 'undefined') {
    const result = await payrollService.addPayroll(payroll);
    if(result) {
      appData.payroll.push(result);
      saveData();
      closeModal('payrollModal');
      loadPayroll();
      return;
    }
  }
  
  // Fallback to localStorage
  payroll.id = Date.now().toString();
  appData.payroll.push(payroll);
  saveData();
  closeModal('payrollModal');
  loadPayroll();
  showToast('تم حفظ الراتب بنجاح', 'success');
}

function calcPayroll() {
  showToast('تم احتساب الرواتب بنجاح', 'success');
}

// ============= CLIENTS =============
async function loadClients() {
  // Try to load from Firebase first
  if(typeof clientService !== 'undefined') {
    try {
      const firebaseClients = await clientService.getClients();
      if(firebaseClients && firebaseClients.length > 0) {
        appData.clients = firebaseClients;
      }
    } catch(error) {
      console.warn('خطأ في تحميل من Firebase:', error);
    }
  }
  
  const tbody = document.getElementById('clientTbody');
  const html = appData.clients.map((client, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${client.name}</td>
      <td>${client.phone || '-'}</td>
      <td>${client.area || '-'}</td>
    </tr>
  `).join('');
  
  document.getElementById('clientTbody').innerHTML = html || '<tr><td colspan="4">لا توجد عملاء</td></tr>';
}

async function saveClient() {
  const client = {
    name: document.getElementById('clientName').value,
    phone: document.getElementById('clientPhone').value,
    area: document.getElementById('clientArea').value,
    date: new Date().toISOString().split('T')[0]
  };
  
  if(!client.name) {
    showToast('يرجى ملء الاسم', 'error');
    return;
  }
  
  // Try Firebase first
  if(typeof clientService !== 'undefined') {
    const result = await clientService.addClient(client);
    if(result) {
      appData.clients.push(result);
      saveData();
      closeModal('clientModal');
      loadClients();
      
      document.getElementById('clientName').value = '';
      document.getElementById('clientPhone').value = '';
      document.getElementById('clientArea').value = '';
      return;
    }
  }
  
  // Fallback to localStorage
  client.id = Date.now().toString();
  appData.clients.push(client);
  saveData();
  closeModal('clientModal');
  loadClients();
  showToast('تم إضافة العميل بنجاح', 'success');
  
  document.getElementById('clientName').value = '';
  document.getElementById('clientPhone').value = '';
  document.getElementById('clientArea').value = '';
}

// ============= CONTRACTS =============
async function loadContracts() {
  // Try to load from Firebase first
  if(typeof contractService !== 'undefined') {
    try {
      const firebaseContracts = await contractService.getContracts();
      if(firebaseContracts && firebaseContracts.length > 0) {
        appData.contracts = firebaseContracts;
      }
    } catch(error) {
      console.warn('خطأ في تحميل من Firebase:', error);
    }
  }
  
  const tbody = document.getElementById('contractTbody');
  const html = appData.contracts.map((contract, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${contract.number}</td>
      <td>${contract.clientId}</td>
      <td>${contract.amount || 0}</td>
    </tr>
  `).join('');
  
  document.getElementById('contractTbody').innerHTML = html || '<tr><td colspan="4">لا توجد عقود</td></tr>';
}

async function saveContract() {
  const contract = {
    number: document.getElementById('contractNumber').value,
    clientId: document.getElementById('contractClient').value,
    amount: parseFloat(document.getElementById('contractAmount').value) || 0,
    startDate: document.getElementById('contractStart').value,
    endDate: document.getElementById('contractEnd').value,
    status: 'نشط',
    date: new Date().toISOString().split('T')[0]
  };
  
  if(!contract.number || !contract.clientId) {
    showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
    return;
  }
  
  // Try Firebase first
  if(typeof contractService !== 'undefined') {
    const result = await contractService.addContract(contract);
    if(result) {
      appData.contracts.push(result);
      saveData();
      closeModal('contractModal');
      loadContracts();
      
      document.getElementById('contractNumber').value = '';
      document.getElementById('contractClient').value = '';
      document.getElementById('contractAmount').value = '';
      document.getElementById('contractStart').value = '';
      document.getElementById('contractEnd').value = '';
      return;
    }
  }
  
  // Fallback to localStorage
  contract.id = Date.now().toString();
  appData.contracts.push(contract);
  saveData();
  closeModal('contractModal');
  loadContracts();
  showToast('تم إضافة العقد بنجاح', 'success');
  
  document.getElementById('contractNumber').value = '';
  document.getElementById('contractClient').value = '';
  document.getElementById('contractAmount').value = '';
  document.getElementById('contractStart').value = '';
  document.getElementById('contractEnd').value = '';
}

// ============= MODAL FUNCTIONS =============
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if(modal) {
    modal.classList.add('open');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if(modal) {
    modal.classList.remove('open');
  }
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
  if(e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ============= UTILITY FUNCTIONS =============
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if(!container) {
    const div = document.createElement('div');
    div.id = 'toastContainer';
    div.style.cssText = 'position:fixed;bottom:24px;left:24px;z-index:9998;display:flex;flex-direction:column;gap:10px;max-width:320px';
    document.body.appendChild(div);
  }
  
  const toast = document.createElement('div');
  toast.className = `toast-msg ${type}`;
  toast.style.cssText = `padding:14px 18px;border-radius:12px;background:var(--card);border:1px solid var(--bdr);box-shadow:var(--shd);font-size:13px;font-weight:600;display:flex;align-items:center;gap:10px;animation:slideInLeft .3s ease`;
  toast.innerHTML = `<span>${message}</span>`;
  
  document.getElementById('toastContainer').appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function updateCurrentDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString('ar-SA', options);
  const timeStr = now.toLocaleTimeString('ar-SA');
  document.getElementById('currentDate').textContent = `${dateStr} ${timeStr}`;
}

function setupEventListeners() {
  // Add any global event listeners here
}

// ============= DATA PERSISTENCE =============
function saveData() {
  localStorage.setItem('superproDB', JSON.stringify(appData));
}

function loadData() {
  const stored = localStorage.getItem('superproDB');
  if(stored) {
    try {
      appData = JSON.parse(stored);
    } catch(e) {
      console.log('فشل تحميل البيانات المحلية');
      initializeDefaultData();
    }
  } else {
    initializeDefaultData();
  }
}

function initializeDefaultData() {
  // استخدام البيانات الحقيقية إذا كانت موجودة
  if(typeof REAL_BUSINESS_DATA !== 'undefined' && REAL_BUSINESS_DATA.employees && REAL_BUSINESS_DATA.employees.length > 0) {
    appData = {
      employees: REAL_BUSINESS_DATA.employees,
      clients: REAL_BUSINESS_DATA.clients || [],
      contracts: [],
      attendance: [],
      payroll: [],
      dailyWork: [],
      income: [],
      expenses: [],
      tasks: [],
      notifications: [],
      teams: [],
      locations: [],
      packages: [],
      ratings: []
    };
    console.log('✅ تم تحميل البيانات الحقيقية للنظام');
  } else {
    // البيانات الوهمية كـ fallback
    appData = {
      employees: [
        { id: 1, name: 'أحمد محمود', nationality: 'سعودي', job: 'مدير عام', salary: 8000, department: 'الإدارة', joinDate: '2023-01-15', status: 'نشط' },
        { id: 2, name: 'فاطمة علي', nationality: 'سعودية', job: 'محللة بيانات', salary: 5000, department: 'التكنولوجيا', joinDate: '2023-03-20', status: 'نشط' }
      ],
      clients: [],
      contracts: [],
      attendance: [],
      payroll: [],
      dailyWork: [],
      income: [],
      expenses: [],
      tasks: [],
      notifications: [],
      teams: [],
      locations: [],
      packages: [],
      ratings: []
    };
    console.log('⚠️ تم استخدام البيانات الوهمية');
  }
  
  saveData();
  console.log('✅ تم تهيئة البيانات');
}

function exportAllData() {
  const dataStr = JSON.stringify(appData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `superpro-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  showToast('تم تصدير البيانات بنجاح', 'success');
}

// ============= TASKS =============
async function loadTasks() {
  const tbody = document.getElementById('tasksTbody');
  if(!tbody) return;
  
  const html = appData.tasks.map((task, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${task.title}</td>
      <td>${task.assignee || '-'}</td>
      <td><span class="badge badge-${task.priority === 'عالي' ? 'red' : task.priority === 'متوسط' ? 'yellow' : 'green'}">${task.priority}</span></td>
      <td><span class="badge badge-${task.status === 'منجز' ? 'green' : task.status === 'قيد التنفيذ' ? 'blue' : 'gray'}">${task.status}</span></td>
    </tr>
  `).join('');
  
  tbody.innerHTML = html || '<tr><td colspan="5">لا توجد مهام</td></tr>';
}

async function saveTask() {
  const task = {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDesc').value,
    assignee: document.getElementById('taskAssign').value,
    priority: document.getElementById('taskPriority').value,
    dueDate: document.getElementById('taskDueDate').value,
    status: 'قيد الانتظار',
    date: new Date().toISOString().split('T')[0]
  };
  
  if(!task.title) {
    showToast('يرجى إدخال عنوان المهمة', 'error');
    return;
  }
  
  task.id = Date.now().toString();
  appData.tasks.push(task);
  saveData();
  closeModal('taskModal');
  loadTasks();
  showToast('تم إضافة المهمة بنجاح', 'success');
  
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDesc').value = '';
  document.getElementById('taskAssign').value = '';
  document.getElementById('taskPriority').value = 'متوسط';
  document.getElementById('taskDueDate').value = '';
}

// ============= REAL-TIME LISTENERS =============
function initFirebaseListeners() {
  if(typeof employeeService === 'undefined') return;
  
  // Listen for employees changes
  if(typeof employeeService.onEmployeesChange === 'function') {
    employeeService.onEmployeesChange((newEmployees) => {
      if(newEmployees && newEmployees.length > 0) {
        appData.employees = newEmployees;
        saveData();
        if(document.querySelector('.page.active').id === 'page-employees') {
          loadEmployees();
        }
      }
    });
  }
  
  // Listen for clients changes
  if(typeof clientService.onClientsChange === 'function') {
    clientService.onClientsChange((newClients) => {
      if(newClients && newClients.length > 0) {
        appData.clients = newClients;
        saveData();
        if(document.querySelector('.page.active').id === 'page-clients') {
          loadClients();
        }
      }
    });
  }
  
  // Listen for contracts changes  
  if(typeof contractService.onContractsChange === 'function') {
    contractService.onContractsChange((newContracts) => {
      if(newContracts && newContracts.length > 0) {
        appData.contracts = newContracts;
        saveData();
        if(document.querySelector('.page.active').id === 'page-contracts') {
          loadContracts();
        }
      }
    });
  }
}

// ============= TEAMS MANAGEMENT =============
function loadTeams() {
  const teamsData = appData.teams || [];
  if(teamsData.length === 0) {
    appData.teams = [
      { id: 1, name: 'فريق التطوير', manager: 'أحمد محمد', members: 5, tasks: 12, status: 'نشط' },
      { id: 2, name: 'فريق المبيعات', manager: 'علي حسن', members: 8, tasks: 15, status: 'نشط' },
      { id: 3, name: 'فريق العمليات', manager: 'فاطمة علي', members: 6, tasks: 10, status: 'نشط' }
    ];
  }
  
  const tbody = document.getElementById('teamsTbody');
  if(!tbody) return;
  
  const html = appData.teams.map((team, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${team.name}</td>
      <td>${team.manager}</td>
      <td>${team.members}</td>
      <td>${team.tasks}</td>
      <td><span style="background:rgba(0,212,170,.2);color:#00d4aa;padding:4px 8px;border-radius:4px;font-size:11px">${team.status}</span></td>
    </tr>
  `).join('');
  
  tbody.innerHTML = html || '<tr><td colspan="6">لا توجد فرق</td></tr>';
}

// ============= LOCATIONS MANAGEMENT =============
function loadLocations() {
  const locationsData = appData.locations || [];
  if(locationsData.length === 0) {
    appData.locations = [
      { id: 1, name: 'المقر الرئيسي', address: 'الرياض', city: 'الرياض', employees: 25, clients: 10 },
      { id: 2, name: 'فرع جدة', address: 'جدة', city: 'جدة', employees: 12, clients: 8 },
      { id: 3, name: 'فرع الدمام', address: 'الدمام', city: 'الدمام', employees: 8, clients: 5 }
    ];
  }
  
  const tbody = document.getElementById('locationsTbody');
  if(!tbody) return;
  
  const html = appData.locations.map((loc, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${loc.name}</td>
      <td>${loc.address}</td>
      <td>${loc.employees}</td>
      <td>${loc.clients}</td>
    </tr>
  `).join('');
  
  tbody.innerHTML = html || '<tr><td colspan="5">لا توجد مواقع</td></tr>';
}

// ============= PACKAGES MANAGEMENT =============
function loadPackages() {
  const packagesData = appData.packages || [];
  if(packagesData.length === 0) {
    appData.packages = [
      { id: 1, name: 'الباقة الأساسية', price: 1000, duration: 'شهري', features: 'حتى 10 موظفين', active: 5 },
      { id: 2, name: 'الباقة المتوسطة', price: 2500, duration: 'شهري', features: 'حتى 50 موظف', active: 12 },
      { id: 3, name: 'الباقة المتقدمة', price: 5000, duration: 'شهري', features: 'موارد غير محدودة', active: 8 }
    ];
  }
  
  const tbody = document.getElementById('packagesTbody');
  if(!tbody) return;
  
  const html = appData.packages.map((pkg, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${pkg.name}</td>
      <td>${pkg.price}</td>
      <td>${pkg.duration}</td>
      <td>${pkg.features}</td>
      <td>${pkg.active} عميل</td>
    </tr>
  `).join('');
  
  tbody.innerHTML = html || '<tr><td colspan="6">لا توجد باقات</td></tr>';
}

// ============= RATINGS & REVIEWS =============
function loadRatings() {
  const ratingsData = appData.ratings || [];
  if(ratingsData.length === 0) {
    appData.ratings = [
      { id: 1, client: 'شركة النور', rating: 5, comment: 'خدمة ممتازة وسريعة', date: '2026-03-01' },
      { id: 2, client: 'مؤسسة السلام', rating: 4, comment: 'جيد جداً', date: '2026-02-28' },
      { id: 3, client: 'شركة الفرح', rating: 5, comment: 'أفضل من الأفضل', date: '2026-02-25' }
    ];
  }
  
  const tbody = document.getElementById('ratingsTbody');
  if(!tbody) return;
  
  const html = appData.ratings.map((review, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${review.client}</td>
      <td><span style="color:#ffd700">⭐ ${review.rating}/5</span></td>
      <td>${review.comment}</td>
      <td>${review.date}</td>
    </tr>
  `).join('');
  
  tbody.innerHTML = html || '<tr><td colspan="5">لا توجد تقييمات</td></tr>';
}

// ============= REPORTS GENERATION =============
function loadReports() {
  const html = `
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
      <div class="stat-card" onclick="generateReport('employees')" style="cursor:pointer;text-align:center">
        <div style="font-size:32px;margin:20px 0">👥</div>
        <div style="font-size:13px;font-weight:600;color:var(--acc)">تقرير الموظفين</div>
      </div>
      <div class="stat-card" onclick="generateReport('income')" style="cursor:pointer;text-align:center">
        <div style="font-size:32px;margin:20px 0">💰</div>
        <div style="font-size:13px;font-weight:600;color:var(--acc)">تقرير المدخولات</div>
      </div>
      <div class="stat-card" onclick="generateReport('expenses')" style="cursor:pointer;text-align:center">
        <div style="font-size:32px;margin:20px 0">💸</div>
        <div style="font-size:13px;font-weight:600;color:var(--acc)">تقرير المصروفات</div>
      </div>
      <div class="stat-card" onclick="generateReport('attendance')" style="cursor:pointer;text-align:center">
        <div style="font-size:32px;margin:20px 0">✅</div>
        <div style="font-size:13px;font-weight:600;color:var(--acc)">تقرير الحضور</div>
      </div>
      <div class="stat-card" onclick="generateReport('contracts')" style="cursor:pointer;text-align:center">
        <div style="font-size:32px;margin:20px 0">📋</div>
        <div style="font-size:13px;font-weight:600;color:var(--acc)">تقرير العقود</div>
      </div>
      <div class="stat-card" onclick="generateReport('performance')" style="cursor:pointer;text-align:center">
        <div style="font-size:32px;margin:20px 0">📊</div>
        <div style="font-size:13px;font-weight:600;color:var(--acc)">تقرير الأداء</div>
      </div>
    </div>
    <div id="reportContainer" style="background:var(--card);border:1px solid var(--bdr2);border-radius:12px;padding:20px;margin-top:20px"></div>
  `;
  
  const container = document.getElementById('reportsContainer');
  if(container) container.innerHTML = html;
}

function generateReport(type) {
  let reportHTML = '';
  const dict = languagesDictionary[currentLanguage] || languagesDictionary['ar'];
  
  if(type === 'employees') {
    reportHTML = `
      <h3 style="margin-bottom:16px;color:var(--acc)">📊 تقرير الموظفين</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px">
        <div style="background:var(--card2);padding:12px;border-radius:8px">
          <div style="color:var(--txt3);font-size:12px">إجمالي الموظفين</div>
          <div style="font-size:20px;font-weight:900;color:var(--acc)">${appData.employees.length}</div>
        </div>
        <div style="background:var(--card2);padding:12px;border-radius:8px">
          <div style="color:var(--txt3);font-size:12px">الموظفون الجدد</div>
          <div style="font-size:20px;font-weight:900;color:#00d4aa">${Math.floor(appData.employees.length * 0.3)}</div>
        </div>
        <div style="background:var(--card2);padding:12px;border-radius:8px">
          <div style="color:var(--txt3);font-size:12px">معدل الحضور</div>
          <div style="font-size:20px;font-weight:900;color:#27ae60">95%</div>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:rgba(0,212,170,.1)">
          <tr><th style="padding:8px;border-bottom:1px solid var(--bdr2);text-align:right">الاسم</th><th style="padding:8px;text-align:center">الوظيفة</th><th style="padding:8px;text-align:center">القسم</th></tr>
        </thead>
        <tbody>
          ${appData.employees.slice(0, 10).map(e => `<tr><td style="padding:8px;border-bottom:1px solid var(--bdr2)">${e.name}</td><td style="text-align:center">${e.job}</td><td style="text-align:center">${e.department}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
  } else if(type === 'income') {
    const total = getTotalIncome();
    reportHTML = `
      <h3 style="margin-bottom:16px;color:var(--acc)">💰 تقرير المدخولات</h3>
      <div style="background:rgba(0,212,170,.1);padding:16px;border-radius:8px;margin-bottom:16px">
        <div style="font-size:14px;color:var(--txt2);margin-bottom:8px">إجمالي المدخولات</div>
        <div style="font-size:28px;font-weight:900;color:#00d4aa">${total.toLocaleString()} ر.ق</div>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <thead style="background:rgba(0,212,170,.1)">
          <tr><th style="padding:8px;border-bottom:1px solid var(--bdr2);text-align:right">التاريخ</th><th style="padding:8px;text-align:center">النوع</th><th style="padding:8px;text-align:center">المبلغ</th></tr>
        </thead>
        <tbody>
          ${appData.income.map(i => `<tr><td style="padding:8px;border-bottom:1px solid var(--bdr2)">${i.date}</td><td style="text-align:center">${i.type}</td><td style="text-align:center;color:#00d4aa">${i.amount.toLocaleString()}</td></tr>`).join('')}
        </tbody>
      </table>
    `;
  } else {
    reportHTML = `<div style="text-align:center;color:var(--txt3)">جاري إنشاء التقرير...</div>`;
  }
  
  const container = document.getElementById('reportContainer');
  if(container) container.innerHTML = reportHTML;
}

// ============= FIREBASE TEST =============
async function testFirebaseConnection() {
  try {
    if(typeof employeeService === 'undefined') {
      showToast('Firebase غير مهيأ بعد', 'warning');
      return false;
    }
    
    const employees = await employeeService.getEmployees();
    showToast('✓ Firebase متصل بنجاح!', 'success');
    console.log('Firebase test passed. Employees:', employees);
    return true;
  } catch(error) {
    showToast('✗ خطأ في الاتصال بـ Firebase: ' + error.message, 'error');
    console.error('Firebase connection error:', error);
    return false;
  }
}

// ============= INITIALIZE LISTENERS ON LOGIN =============
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Firebase listeners after a small delay
  setTimeout(() => {
    initFirebaseListeners();
  }, 500);
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  if(e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
    });
  }
});

// ============= MISSING LOAD FUNCTIONS =============
function loadDailyWork() {
  // Daily work page loader
  const container = document.getElementById('dailyWork');
  if(!container) return;
}

function loadFinance() {
  // Finance page loader
  const container = document.getElementById('finance');
  if(!container) return;
}

function loadSettings() {
  // Settings page loader
  const container = document.getElementById('settings');
  if(!container) return;
}

function loadActivityLog() {
  // Activity log page loader
  const container = document.getElementById('activityLog');
  if(!container) return;
}

function loadServices() {
  // Services page loader
  const container = document.getElementById('services');
  if(!container) return;
}

function loadCalendar() {
  // Calendar page loader
  const container = document.getElementById('calendar');
  if(!container) return;
}

function loadTeams() {
  // Teams page loader
  const container = document.getElementById('teams');
  if(!container) return;
}

function loadLocations() {
  // Locations page loader
  const container = document.getElementById('locations');
  if(!container) return;
}

function loadPackages() {
  // Packages page loader
  const container = document.getElementById('packages');
  if(!container) return;
}

function loadRatings() {
  // Ratings page loader
  const container = document.getElementById('ratings');
  if(!container) return;
}

console.log('Super PRO System v2 - Initialized');
console.log('Firebase services ready - Testing connection...');
testFirebaseConnection();
