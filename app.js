// ============= SUPER PRO SYSTEM - Navigation Module =============

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

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ بدء تحميل التطبيق...');
  
  // Set initial language
  document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLanguage;
  
  loadData();
  console.log('✅ تم تحميل البيانات');
  
  // Setup login handlers
  const authLoginBtn = document.getElementById('authLoginBtn');
  if(authLoginBtn) {
    authLoginBtn.addEventListener('click', handleAuthLogin);
    console.log('✅ تم إعداد زر الدخول');
  }
  
  const authPassword = document.getElementById('authPassword');
  if(authPassword) {
    authPassword.addEventListener('keypress', function(e) {
      if(e.key === 'Enter') handleAuthLogin();
    });
  }
  
  // Show login overlay
  const authOverlay = document.getElementById('authOverlay');
  if(authOverlay) {
    authOverlay.style.display = 'flex';
    console.log('✅ تم عرض شاشة الدخول');
  } else {
    console.warn('⚠️ لم يتم العثور على شاشة الدخول');
  }
});

// ============= NAVIGATION SETUP =============
function setupNavigation() {
  console.log('🔗 إعداد التنقل...');
  
  const navLinks = document.querySelectorAll('.nav-link[data-module]');
  console.log(`وجدت ${navLinks.length} رابط تنقل`);
  
  if(navLinks.length === 0) {
    console.warn('⚠️ لم يتم العثور على روابط تنقل!');
    return;
  }
  
  navLinks.forEach((link, index) => {
    const module = link.dataset.module;
    console.log(`  ${index + 1}. ${module}`);
    
    link.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log(`👆 نقر على: ${module}`);
      navigate(module);
    });
  });
  
  // Auto-navigate to dashboard
  setTimeout(() => {
    navigate('dashboard');
  }, 200);
}

// ============= NAVIGATE FUNCTION =============
function navigate(page) {
  if(!page) {
    console.warn('⚠️ لم يتم تحديد صفحة');
    return;
  }
  
  console.log(`🔄 تنقل إلى: ${page}`);
  
  try {
    // Hide all modules
    document.querySelectorAll('.module-container').forEach(el => {
      el.style.display = 'none';
    });
    
    // Remove active from all nav items
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.remove('active');
    });
    
    // Show selected module
    const module = document.getElementById(page);
    if(module) {
      module.style.display = 'block';
      console.log(`✅ تم عرض: ${page}`);
    } else {
      console.warn(`⚠️ لم يتم العثور على وحدة: ${page}`);
      return;
    }
    
    // Mark as active
    const navLink = document.querySelector(`[data-module="${page}"]`);
    if(navLink) {
      navLink.classList.add('active');
      const navItem = navLink.closest('.nav-item');
      if(navItem) {
        navItem.classList.add('active');
      }
    }
    
    // Load page data
    loadPageData(page);
    
  } catch(err) {
    console.error(`❌ خطأ في التنقل: ${err.message}`, err);
  }
}

// ============= PAGE DATA LOADERS =============
function loadPageData(page) {
  switch(page) {
    case 'dashboard':
      console.log('📊 تحميل البداشبورد');
      loadDashboard();
      break;
    case 'employees':
      console.log('👥 تحميل الموظفين');
      loadEmployees();
      break;
    case 'attendance':
      console.log('✅ تحميل الحضور');
      loadAttendance();
      break;
    case 'payroll':
      console.log('💰 تحميل الرواتب');
      loadPayroll();
      break;
    case 'clients':
      console.log('👨‍💼 تحميل العملاء');
      loadClients();
      break;
    case 'contracts':
      console.log('📋 تحميل العقود');
      loadContracts();
      break;
    case 'dailyWork':
      console.log('📅 تحميل العمل اليومي');
      loadDailyWork();
      break;
    case 'dailyIncome':
      console.log('💵 تحميل المدخولات');
      loadIncome();
      break;
    case 'dailyExpenses':
      console.log('💸 تحميل المصروفات');
      loadExpenses();
      break;
    case 'tasks':
      console.log('📝 تحميل المهام');
      loadTasks();
      break;
    case 'reports':
      console.log('📈 تحميل التقارير');
      loadReports();
      break;
    default:
      console.log(`⏭️  لا يوجد محمل للصفحة: ${page}`);
  }
}

// ============= DASHBOARD LOADER =============
function loadDashboard() {
  try {
    const statEmployees = document.getElementById('statEmployees');
    const statClients = document.getElementById('statClients');
    const statContracts = document.getElementById('statContracts');
    const statBalance = document.getElementById('statBalance');
    
    if(statEmployees) statEmployees.textContent = (appData.employees.length || 0).toLocaleString();
    if(statClients) statClients.textContent = (appData.clients.length || 0).toLocaleString();
    if(statContracts) statContracts.textContent = (appData.contracts.length || 0).toLocaleString();
    if(statBalance) statBalance.textContent = '0 ر.ق';
    
    console.log('✅ تم تحديث إحصائيات البداشبورد');
  } catch(err) {
    console.error('❌ خطأ في تحميل البداشبورد:', err);
  }
}

// ============= STUB LOADERS =============
function loadEmployees() { console.log('📋 تحميل قائمة الموظفين'); }
function loadAttendance() { console.log('📋 تحميل قائمة الحضور'); }
function loadPayroll() { console.log('📋 تحميل قائمة الرواتب'); }
function loadClients() { console.log('📋 تحميل قائمة العملاء'); }
function loadContracts() { console.log('📋 تحميل قائمة العقود'); }
function loadDailyWork() { console.log('📋 تحميل العمل اليومي'); }
function loadIncome() { console.log('📋 تحميل المدخولات'); }
function loadExpenses() { console.log('📋 تحميل المصروفات'); }
function loadTasks() { console.log('📋 تحميل المهام'); }
function loadReports() { console.log('📋 تحميل التقارير'); }

// ============= PAYROLL HELPERS =============
function showPayrollDetails(presentDays, absentDays) {
  alert(`أيام الحضور: ${presentDays}\nأيام الغياب: ${absentDays}`);
}

function printPayslip(index) {
  console.log('طباعة كشف الراتب رقم:', index);
  alert('سيتم تنفيذ طباعة كشف الراتب');
}

// ============= LOGIN =============
function handleLogin() {
  console.log('🔐 محاولة تسجيل دخول...');
  
  const username = document.getElementById('loginUser') ? document.getElementById('loginUser').value.trim() : '';
  const password = document.getElementById('loginPass') ? document.getElementById('loginPass').value.trim() : '';
  
  if(username && password) {
    currentUser = { username, role: 'user' };
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appWrapper').style.display = 'flex';
    
    console.log('✅ تم تسجيل الدخول:', username);
    
    setupNavigation();
  } else {
    alert('يرجى إدخال اسم المستخدم وكلمة المرور');
  }
}

// ============= AUTH LOGIN (NEW) =============
function handleAuthLogin() {
  console.log('🔐 محاولة تسجيل دخول عبر Auth...');
  
  const username = document.getElementById('authUsername') ? document.getElementById('authUsername').value.trim() : '';
  const password = document.getElementById('authPassword') ? document.getElementById('authPassword').value.trim() : '';
  const role = document.getElementById('authRole') ? document.getElementById('authRole').value : 'viewer';
  
  // Simple auth - في الإنتاج استخدم Firebase
  const validLogins = {
    'admin': '1234',
    'supervisor': '1234',
    'viewer': '1234'
  };
  
  if(validLogins[username] === password) {
    currentUser = { username, role };
    
    // Hide login overlay
    const authOverlay = document.getElementById('authOverlay');
    if(authOverlay) {
      authOverlay.style.display = 'none';
      console.log('✅ تم إخفاء شاشة الدخول');
    }
    
    console.log('✅ تم تسجيل الدخول:', username, 'الدور:', role);
    
    // Setup navigation after successful login
    setTimeout(() => {
      setupNavigation();
    }, 100);
  } else {
    const errorDiv = document.getElementById('authError');
    if(errorDiv) {
      errorDiv.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
      errorDiv.style.display = 'block';
      console.warn('❌ بيانات دخول غير صحيحة');
      
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 3000);
    }
  }
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
      console.log('✅ تم تحميل البيانات من التخزين المحلي');
    } catch(e) {
      console.log('⚠️ فشل تحميل البيانات المحلية');
    }
  }
}

console.log('✅ تم تحميل ملف الأساسي');
