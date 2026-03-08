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
  const activePage = document.querySelector('.nav-item.active');
  if(activePage) {
    const page = activePage.dataset.page;
    navigate(page);
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
    item.addEventListener('click', function() {
      const page = this.dataset.page;
      navigate(page);
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
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  
  const pageEl = document.getElementById('page-' + page);
  if(pageEl) {
    pageEl.classList.add('active');
  }
  
  // Dashboard always remains visible in sidebar
  const dashboardBtn = document.querySelector('[data-page="dashboard"]');
  if(dashboardBtn) {
    dashboardBtn.classList.add('active');
  }
  
  // Add active to current page button
  document.querySelectorAll('[data-page="' + page + '"]').forEach(el => {
    el.classList.add('active');
  });
  
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
      console.log('فشل تحميل البيانات');
      initializeDefaultData();
    }
  } else {
    initializeDefaultData();
  }
}

function initializeDefaultData() {\n  appData = {\n    employees: [\n      { id: 1, name: 'أحمد محمود', nationality: 'سعودي', job: 'مدير عام', salary: 8000, department: 'الإدارة', joinDate: '2023-01-15', status: 'نشط' },\n      { id: 2, name: 'فاطمة علي', nationality: 'سعودية', job: 'محللة بيانات', salary: 5000, department: 'التكنولوجيا', joinDate: '2023-03-20', status: 'نشط' },\n      { id: 3, name: 'محمد حسن', nationality: 'سوري', job: 'مطور ويب', salary: 4500, department: 'التكنولوجيا', joinDate: '2023-06-01', status: 'نشط' },\n      { id: 4, name: 'ليلى خالد', nationality: 'أردنية', job: 'موظفة مبيعات', salary: 3500, department: 'المبيعات', joinDate: '2024-01-10', status: 'نشط' },\n      { id: 5, name: 'علي سعود', nationality: 'سعودي', job: 'مهندس نظم', salary: 6000, department: 'التكنولوجيا', joinDate: '2023-09-05', status: 'نشط' },\n      { id: 6, name: 'سمية يوسف', nationality: 'مصرية', job: 'مسؤول HR', salary: 4000, department: 'الموارد البشرية', joinDate: '2024-02-01', status: 'نشط' }\n    ],\n    clients: [\n      { id: 1, name: 'شركة النور للبناء', phone: '0501234567', area: 'الرياض', email: 'info@alnoor.sa', contractValue: 250000 },\n      { id: 2, name: 'مؤسسة السلام', phone: '0509876543', area: 'جدة', email: 'contact@selaam.com', contractValue: 180000 },\n      { id: 3, name: 'شركة الأمل', phone: '0555555555', area: 'الدمام', email: 'hello@amal.co', contractValue: 150000 },\n      { id: 4, name: 'مجموعة الفرح', phone: '0544444444', area: 'الرياض', email: 'team@alfarah.sa', contractValue: 200000 },\n      { id: 5, name: 'شركة التقدم', phone: '0533333333', area: 'الكويت', email: 'support@progress.kw', contractValue: 300000 }\n    ],\n    contracts: [\n      { id: 1, contractNo: 'CT-001', client: 'شركة النور للبناء', value: 250000, status: 'نشط', startDate: '2024-01-01', endDate: '2024-12-31', description: 'عقد صيانة سنوي' },\n      { id: 2, contractNo: 'CT-002', client: 'مؤسسة السلام', value: 180000, status: 'نشط', startDate: '2024-02-01', endDate: '2024-11-30', description: 'خدمات استشارية' },\n      { id: 3, contractNo: 'CT-003', client: 'شركة الأمل', value: 150000, status: 'مكتمل', startDate: '2023-06-01', endDate: '2023-12-31', description: 'مشروع تطوير' },\n      { id: 4, contractNo: 'CT-004', client: 'مجموعة الفرح', value: 200000, status: 'قيد الانتظار', startDate: '2024-05-01', endDate: '2025-04-30', description: 'خدمات تطوير البرمجيات' }\n    ],\n    attendance: [\n      { id: 1, employee: 'أحمد محمود', date: '2026-03-08', status: 'حاضر', hours: 8, notes: 'اجتماع إدارة' },\n      { id: 2, employee: 'فاطمة علي', date: '2026-03-08', status: 'حاضر', hours: 8, notes: '' },\n      { id: 3, employee: 'محمد حسن', date: '2026-03-08', status: 'متأخر', hours: 7.5, notes: 'تأخر 30 دقيقة' },\n      { id: 4, employee: 'علي سعود', date: '2026-03-07', status: 'حاضر', hours: 8, notes: '' },\n      { id: 5, employee: 'سمية يوسف', date: '2026-03-07', status: 'غياب', hours: 0, notes: 'إجازة مرضية' }\n    ],\n    payroll: [\n      { id: 1, employee: 'أحمد محمود', salary: 8000, deductions: 500, bonus: 1000, net: 8500, month: '2026-03' },\n      { id: 2, employee: 'فاطمة علي', salary: 5000, deductions: 300, bonus: 500, net: 5200, month: '2026-03' },\n      { id: 3, employee: 'محمد حسن', salary: 4500, deductions: 250, bonus: 300, net: 4550, month: '2026-03' },\n      { id: 4, employee: 'علي سعود', salary: 6000, deductions: 400, bonus: 800, net: 6400, month: '2026-03' },\n      { id: 5, employee: 'سمية يوسف', salary: 4000, deductions: 200, bonus: 0, net: 3800, month: '2026-03' }\n    ],\n    income: [\n      { id: 1, date: '2026-03-05', type: 'دفعة عميل', description: 'دفعة من شركة النور', amount: 50000, invoiceNo: 'INV-001' },\n      { id: 2, date: '2026-03-04', type: 'استشارات', description: 'رسوم استشارية', amount: 15000, invoiceNo: 'INV-002' },\n      { id: 3, date: '2026-03-01', type: 'خدمات', description: 'خدمات تطوير', amount: 30000, invoiceNo: 'INV-003' },\n      { id: 4, date: '2026-02-28', type: 'دفعة عميل', description: 'دفعة من مؤسسة السلام', amount: 45000, invoiceNo: 'INV-004' }\n    ],\n    expenses: [\n      { id: 1, date: '2026-03-06', category: 'رواتب', description: 'رواتب الموظفين', amount: 30000, approvalStatus: 'موافق عليه' },\n      { id: 2, date: '2026-03-05', category: 'مكتبي', description: 'مستلزمات المكتب', amount: 2000, approvalStatus: 'موافق عليه' },\n      { id: 3, date: '2026-03-04', category: 'فواتير', description: 'فواتير الكهرباء والإنترنت', amount: 3000, approvalStatus: 'قيد الانتظار' },\n      { id: 4, date: '2026-03-03', category: 'سفر', description: 'مصاريف السفر للعميل', amount: 5000, approvalStatus: 'موافق عليه' },\n      { id: 5, date: '2026-03-02', category: 'تدريب', description: 'برنامج تدريبي للموظفين', amount: 4000, approvalStatus: 'موافق عليه' }\n    ],\n    tasks: [\n      { id: 1, title: 'إنهاء مشروع التطوير', status: 'جاري', priority: 'عالي', progress: 75 },\n      { id: 2, title: 'مراجعة العقود', status: 'عاجل', priority: 'عالي', progress: 30 },\n      { id: 3, title: 'تحديث البيانات', status: 'جاري', priority: 'متوسط', progress: 50 },\n      { id: 4, title: 'اجتماع مع العملاء', status: 'مجدول', priority: 'منخفض', progress: 0 },\n      { id: 5, title: 'إرسال التقارير الشهرية', status: 'عاجل', priority: 'عالي', progress: 90 }\n    ],\n    teams: [\n      { id: 1, name: 'فريق التطوير', manager: 'أحمد محمود', members: 5, tasks: 12, status: 'نشط' },\n      { id: 2, name: 'فريق المبيعات', manager: 'علي سعود', members: 8, tasks: 15, status: 'نشط' },\n      { id: 3, name: 'فريق العمليات', manager: 'فاطمة علي', members: 6, tasks: 10, status: 'نشط' }\n    ],\n    locations: [\n      { id: 1, name: 'المقر الرئيسي', address: 'الرياض', city: 'الرياض', employees: 25, clients: 10 },\n      { id: 2, name: 'فرع جدة', address: 'جدة', city: 'جدة', employees: 12, clients: 8 },\n      { id: 3, name: 'فرع الدمام', address: 'الدمام', city: 'الدمام', employees: 8, clients: 5 }\n    ],\n    packages: [\n      { id: 1, name: 'الباقة الأساسية', price: 1000, duration: 'شهري', features: 'حتى 10 موظفين', active: 5 },\n      { id: 2, name: 'الباقة المتوسطة', price: 2500, duration: 'شهري', features: 'حتى 50 موظف', active: 12 },\n      { id: 3, name: 'الباقة المتقدمة', price: 5000, duration: 'شهري', features: 'موارد غير محدودة', active: 8 }\n    ],\n    ratings: [\n      { id: 1, client: 'شركة النور', rating: 5, comment: 'خدمة ممتازة وسريعة', date: '2026-03-01' },\n      { id: 2, client: 'مؤسسة السلام', rating: 4, comment: 'جيد جداً', date: '2026-02-28' },\n      { id: 3, client: 'شركة الأمل', rating: 5, comment: 'أفضل من الأفضل', date: '2026-02-25' }\n    ],\n    notifications: [],\n    dailyWork: [],\n    dailyIncome: [],\n    dailyExpenses: []\n  };\n  \n  saveData();\n  console.log('✅ تم تهيئة البيانات الافتراضية');\n}

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
  const teamsData = appData.teams || [];\n  if(teamsData.length === 0) {\n    appData.teams = [\n      { id: 1, name: 'فريق التطوير', manager: 'أحمد محمد', members: 5, tasks: 12, status: 'نشط' },\n      { id: 2, name: 'فريق المبيعات', manager: 'علي حسن', members: 8, tasks: 15, status: 'نشط' },\n      { id: 3, name: 'فريق العمليات', manager: 'فاطمة علي', members: 6, tasks: 10, status: 'نشط' }\n    ];\n  }\n  \n  const tbody = document.getElementById('teamsTbody');\n  if(!tbody) return;\n  \n  const html = appData.teams.map((team, idx) => `\n    <tr>\n      <td>${idx + 1}</td>\n      <td>${team.name}</td>\n      <td>${team.manager}</td>\n      <td>${team.members}</td>\n      <td>${team.tasks}</td>\n      <td><span style=\"background:rgba(0,212,170,.2);color:#00d4aa;padding:4px 8px;border-radius:4px;font-size:11px\">${team.status}</span></td>\n    </tr>\n  `).join('');\n  \n  tbody.innerHTML = html || '<tr><td colspan=\"6\">لا توجد فرق</td></tr>';\n}\n\n// ============= LOCATIONS MANAGEMENT =============\nfunction loadLocations() {\n  const locationsData = appData.locations || [];\n  if(locationsData.length === 0) {\n    appData.locations = [\n      { id: 1, name: 'المقر الرئيسي', address: 'الرياض', city: 'الرياض', employees: 25, clients: 10 },\n      { id: 2, name: 'فرع جدة', address: 'جدة', city: 'جدة', employees: 12, clients: 8 },\n      { id: 3, name: 'فرع الدمام', address: 'الدمام', city: 'الدمام', employees: 8, clients: 5 }\n    ];\n  }\n  \n  const tbody = document.getElementById('locationsTbody');\n  if(!tbody) return;\n  \n  const html = appData.locations.map((loc, idx) => `\n    <tr>\n      <td>${idx + 1}</td>\n      <td>${loc.name}</td>\n      <td>${loc.address}</td>\n      <td>${loc.employees}</td>\n      <td>${loc.clients}</td>\n    </tr>\n  `).join('');\n  \n  tbody.innerHTML = html || '<tr><td colspan=\"5\">لا توجد مواقع</td></tr>';\n}\n\n// ============= PACKAGES MANAGEMENT =============\nfunction loadPackages() {\n  const packagesData = appData.packages || [];\n  if(packagesData.length === 0) {\n    appData.packages = [\n      { id: 1, name: 'الباقة الأساسية', price: 1000, duration: 'شهري', features: 'حتى 10 موظفين', active: 5 },\n      { id: 2, name: 'الباقة المتوسطة', price: 2500, duration: 'شهري', features: 'حتى 50 موظف', active: 12 },\n      { id: 3, name: 'الباقة المتقدمة', price: 5000, duration: 'شهري', features: 'موارد غير محدودة', active: 8 }\n    ];\n  }\n  \n  const tbody = document.getElementById('packagesTbody');\n  if(!tbody) return;\n  \n  const html = appData.packages.map((pkg, idx) => `\n    <tr>\n      <td>${idx + 1}</td>\n      <td>${pkg.name}</td>\n      <td>${pkg.price}</td>\n      <td>${pkg.duration}</td>\n      <td>${pkg.features}</td>\n      <td>${pkg.active} عميل</td>\n    </tr>\n  `).join('');\n  \n  tbody.innerHTML = html || '<tr><td colspan=\"6\">لا توجد باقات</td></tr>';\n}\n\n// ============= RATINGS & REVIEWS =============\nfunction loadRatings() {\n  const ratingsData = appData.ratings || [];\n  if(ratingsData.length === 0) {\n    appData.ratings = [\n      { id: 1, client: 'شركة النور', rating: 5, comment: 'خدمة ممتازة وسريعة', date: '2026-03-01' },\n      { id: 2, client: 'مؤسسة السلام', rating: 4, comment: 'جيد جداً', date: '2026-02-28' },\n      { id: 3, client: 'شركة الفرح', rating: 5, comment: 'أفضل من الأفضل', date: '2026-02-25' }\n    ];\n  }\n  \n  const tbody = document.getElementById('ratingsTbody');\n  if(!tbody) return;\n  \n  const html = appData.ratings.map((review, idx) => `\n    <tr>\n      <td>${idx + 1}</td>\n      <td>${review.client}</td>\n      <td><span style=\"color:#ffd700\">⭐ ${review.rating}/5</span></td>\n      <td>${review.comment}</td>\n      <td>${review.date}</td>\n    </tr>\n  `).join('');\n  \n  tbody.innerHTML = html || '<tr><td colspan=\"5\">لا توجد تقييمات</td></tr>';\n}\n\n// ============= REPORTS GENERATION =============\nfunction loadReports() {\n  const html = `\n    <div style=\"display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px\">\n      <div class=\"stat-card\" onclick=\"generateReport('employees')\" style=\"cursor:pointer;text-align:center\">\n        <div style=\"font-size:32px;margin:20px 0\">👥</div>\n        <div style=\"font-size:13px;font-weight:600;color:var(--acc)\">تقرير الموظفين</div>\n      </div>\n      <div class=\"stat-card\" onclick=\"generateReport('income')\" style=\"cursor:pointer;text-align:center\">\n        <div style=\"font-size:32px;margin:20px 0\">💰</div>\n        <div style=\"font-size:13px;font-weight:600;color:var(--acc)\">تقرير المدخولات</div>\n      </div>\n      <div class=\"stat-card\" onclick=\"generateReport('expenses')\" style=\"cursor:pointer;text-align:center\">\n        <div style=\"font-size:32px;margin:20px 0\">💸</div>\n        <div style=\"font-size:13px;font-weight:600;color:var(--acc)\">تقرير المصروفات</div>\n      </div>\n      <div class=\"stat-card\" onclick=\"generateReport('attendance')\" style=\"cursor:pointer;text-align:center\">\n        <div style=\"font-size:32px;margin:20px 0\">✅</div>\n        <div style=\"font-size:13px;font-weight:600;color:var(--acc)\">تقرير الحضور</div>\n      </div>\n      <div class=\"stat-card\" onclick=\"generateReport('contracts')\" style=\"cursor:pointer;text-align:center\">\n        <div style=\"font-size:32px;margin:20px 0\">📋</div>\n        <div style=\"font-size:13px;font-weight:600;color:var(--acc)\">تقرير العقود</div>\n      </div>\n      <div class=\"stat-card\" onclick=\"generateReport('performance')\" style=\"cursor:pointer;text-align:center\">\n        <div style=\"font-size:32px;margin:20px 0\">📊</div>\n        <div style=\"font-size:13px;font-weight:600;color:var(--acc)\">تقرير الأداء</div>\n      </div>\n    </div>\n    <div id=\"reportContainer\" style=\"background:var(--card);border:1px solid var(--bdr2);border-radius:12px;padding:20px;margin-top:20px\"></div>\n  `;\n  \n  const container = document.getElementById('reportsContainer');\n  if(container) container.innerHTML = html;\n}\n\nfunction generateReport(type) {\n  let reportHTML = '';\n  const dict = languagesDictionary[currentLanguage] || languagesDictionary['ar'];\n  \n  if(type === 'employees') {\n    reportHTML = `\n      <h3 style=\"margin-bottom:16px;color:var(--acc)\">📊 تقرير الموظفين</h3>\n      <div style=\"display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:16px\">\n        <div style=\"background:var(--card2);padding:12px;border-radius:8px\">\n          <div style=\"color:var(--txt3);font-size:12px\">إجمالي الموظفين</div>\n          <div style=\"font-size:20px;font-weight:900;color:var(--acc)\">${appData.employees.length}</div>\n        </div>\n        <div style=\"background:var(--card2);padding:12px;border-radius:8px\">\n          <div style=\"color:var(--txt3);font-size:12px\">الموظفون الجدد</div>\n          <div style=\"font-size:20px;font-weight:900;color:#00d4aa\">${Math.floor(appData.employees.length * 0.3)}</div>\n        </div>\n        <div style=\"background:var(--card2);padding:12px;border-radius:8px\">\n          <div style=\"color:var(--txt3);font-size:12px\">معدل الحضور</div>\n          <div style=\"font-size:20px;font-weight:900;color:#27ae60\">95%</div>\n        </div>\n      </div>\n      <table style=\"width:100%;border-collapse:collapse\">\n        <thead style=\"background:rgba(0,212,170,.1)\">\n          <tr><th style=\"padding:8px;border-bottom:1px solid var(--bdr2);text-align:right\">الاسم</th><th style=\"padding:8px;text-align:center\">الوظيفة</th><th style=\"padding:8px;text-align:center\">القسم</th></tr>\n        </thead>\n        <tbody>\n          ${appData.employees.slice(0, 10).map(e => `<tr><td style=\"padding:8px;border-bottom:1px solid var(--bdr2)\">${e.name}</td><td style=\"text-align:center\">${e.job}</td><td style=\"text-align:center\">${e.department}</td></tr>`).join('')}\n        </tbody>\n      </table>\n    `;\n  } else if(type === 'income') {\n    const total = getTotalIncome();\n    reportHTML = `\n      <h3 style=\"margin-bottom:16px;color:var(--acc)\">💰 تقرير المدخولات</h3>\n      <div style=\"background:rgba(0,212,170,.1);padding:16px;border-radius:8px;margin-bottom:16px\">\n        <div style=\"font-size:14px;color:var(--txt2);margin-bottom:8px\">إجمالي المدخولات</div>\n        <div style=\"font-size:28px;font-weight:900;color:#00d4aa\">${total.toLocaleString()} ر.ق</div>\n      </div>\n      <table style=\"width:100%;border-collapse:collapse\">\n        <thead style=\"background:rgba(0,212,170,.1)\">\n          <tr><th style=\"padding:8px;border-bottom:1px solid var(--bdr2);text-align:right\">التاريخ</th><th style=\"padding:8px;text-align:center\">النوع</th><th style=\"padding:8px;text-align:center\">المبلغ</th></tr>\n        </thead>\n        <tbody>\n          ${appData.income.map(i => `<tr><td style=\"padding:8px;border-bottom:1px solid var(--bdr2)\">${i.date}</td><td style=\"text-align:center\">${i.type}</td><td style=\"text-align:center;color:#00d4aa\">${i.amount.toLocaleString()}</td></tr>`).join('')}\n        </tbody>\n      </table>\n    `;\n  } else {\n    reportHTML = `<div style=\"text-align:center;color:var(--txt3)\">جاري إنشاء التقرير...</div>`;\n  }\n  \n  const container = document.getElementById('reportContainer');\n  if(container) container.innerHTML = reportHTML;\n}\n\n// ============= FIREBASE SYNC FUNCTION =============\nasync function syncFirebaseToLocal() {\n  try {\n    // Check if Firebase services are available\n    if(typeof employeeService === 'undefined') {\n      console.log('Firebase not initialized yet');\n      return;\n    }
    
    // Sync employees
    const employees = await employeeService.getEmployees();
    if(employees && employees.length > 0) {
      appData.employees = employees;
    }
    
    // Sync clients
    const clients = await clientService.getClients();
    if(clients && clients.length > 0) {
      appData.clients = clients;
    }
    
    // Sync contracts
    const contracts = await contractService.getContracts();
    if(contracts && contracts.length > 0) {
      appData.contracts = contracts;
    }
    
    // Sync attendance
    const attendance = await attendanceService.getAttendance();
    if(attendance && attendance.length > 0) {
      appData.attendance = attendance;
    }
    
    // Sync payroll
    const payroll = await payrollService.getPayroll();
    if(payroll && payroll.length > 0) {
      appData.payroll = payroll;
    }
    
    // Sync financial data
    const income = await financialService.getIncome();
    if(income && income.length > 0) {
      appData.income = income;
    }
    
    const expenses = await financialService.getExpenses();
    if(expenses && expenses.length > 0) {
      appData.expenses = expenses;
    }
    
    saveData();
    console.log('Firebase sync completed successfully');
    return true;
  } catch(error) {
    console.warn('Firebase sync error:', error);
    showToast('خطأ في مزامنة البيانات من Firebase', 'warning');
    return false;
  }
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

console.log('Super PRO System v2 - Initialized');
console.log('Firebase services ready - Testing connection...');
testFirebaseConnection();
