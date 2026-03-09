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
  
  // Initialize all modules
  initializeAllModules();
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

// ============= ANALYTICS & REPORTS =============
const analyticsModule = {
  generateReport(type) {
    console.log(`📊 توليد تقرير: ${type}`);
    const reports = {
      'income': { title: 'تقرير المدخولات', total: 42300, growth: '+12%' },
      'expenses': { title: 'تقرير المصروفات', total: 24200, growth: '+8%' },
      'employees': { title: 'تقرير الموظفين', total: 25, attendance: '92%' },
      'clients': { title: 'تقرير العملاء', total: 45, active: 35 },
      'contracts': { title: 'تقرير العقود', total: 30, value: 250000 }
    };
    return reports[type] || reports['income'];
  },
  
  exportReport(type, format) {
    console.log(`📤 تصدير: ${type}.${format}`);
    alert(`سيتم تصدير التقرير: ${type} بصيغة ${format}`);
  }
};

// ============= NOTIFICATIONS SYSTEM =============
const notificationsModule = {
  notifications: [],
  
  add(type, message, duration = 5000) {
    const notification = {
      id: Date.now(),
      type, message,
      timestamp: new Date()
    };
    this.notifications.push(notification);
    console.log(`🔔 إشعار: ${message}`);
    
    // Remove after duration
    if(duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
    
    return notification.id;
  },
  
  remove(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  },
  
  getAll() {
    return this.notifications;
  },
  
  alertExpiredContracts() {
    notificationsModule.add('warning', '⚠️ هناك عقود منتهية تنتظر التجديد', 10000);
  },
  
  alertExpiringResidencies() {
    notificationsModule.add('warning', '⚠️ هناك إقامات ستنتهي خلال 30 يوم', 10000);
  },
  
  alertLowAttendance() {
    notificationsModule.add('warning', '⚠️ معدل حضور منخفض لموظفين معينين', 10000);
  }
};

// ============= KANBAN BOARD SYSTEM =============
const kanbanModule = {
  tasks: [
    { id: 1, title: 'مهمة 1', status: 'todo', priority: 'high' },
    { id: 2, title: 'مهمة 2', status: 'inProgress', priority: 'medium' },
    { id: 3, title: 'مهمة 3', status: 'done', priority: 'low' }
  ],
  
  addTask(title, priority = 'medium') {
    const task = {
      id: Date.now(),
      title,
      status: 'todo',
      priority,
      createdAt: new Date()
    };
    this.tasks.push(task);
    console.log(`📝 تم إضافة مهمة: ${title}`);
    return task;
  },
  
  updateTaskStatus(taskId, newStatus) {
    const task = this.tasks.find(t => t.id === taskId);
    if(task) {
      task.status = newStatus;
      console.log(`✅ تم تحديث حالة المهمة: ${task.title}`);
    }
  },
  
  getTasksByStatus(status) {
    return this.tasks.filter(t => t.status === status);
  },
  
  deleteTask(taskId) {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    console.log(`🗑️ تم حذف المهمة`);
  }
};

// ============= DOCUMENT MANAGEMENT SYSTEM =============
const documentModule = {
  documents: [],
  
  upload(filename, category, content) {
    const doc = {
      id: Date.now(),
      filename,
      category,
      content,
      uploadedAt: new Date(),
      size: content.length
    };
    this.documents.push(doc);
    console.log(`📄 تم رفع المستند: ${filename}`);
    return doc;
  },
  
  search(query) {
    return this.documents.filter(doc => 
      doc.filename.includes(query) || 
      doc.category.includes(query)
    );
  },
  
  getByCategory(category) {
    return this.documents.filter(doc => doc.category === category);
  },
  
  delete(docId) {
    this.documents = this.documents.filter(d => d.id !== docId);
    console.log(`🗑️ تم حذف المستند`);
  }
};

// ============= ADVANCED SEARCH SYSTEM =============
const searchModule = {
  search(query, filters = {}) {
    console.log(`🔍 البحث عن: ${query}`);
    
    let results = {
      employees: appData.employees.filter(e => 
        e.name?.includes(query) || e.job?.includes(query)
      ),
      clients: appData.clients.filter(c => 
        c.name?.includes(query) || c.phone?.includes(query)
      ),
      contracts: appData.contracts.filter(c => 
        c.number?.includes(query)
      )
    };
    
    // Apply filters
    if(filters.type) {
      const type = filters.type;
      results = { [type]: results[type] || [] };
    }
    
    return results;
  },
  
  saveSearch(name, query, filters) {
    console.log(`💾 حفظ البحث: ${name}`);
    localStorage.setItem(`search_${name}`, JSON.stringify({ query, filters }));
  },
  
  getRecentSearches() {
    const searches = [];
    for(let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if(key.startsWith('search_')) {
        searches.push(JSON.parse(localStorage.getItem(key)));
      }
    }
    return searches;
  }
};

// ============= SECURITY & ACCESS CONTROL =============
const securityModule = {
  roles: {
    admin: ['view_all', 'edit_all', 'delete_all', 'manage_users'],
    supervisor: ['view_all', 'edit_own', 'export_reports'],
    viewer: ['view_all'],
    employee: ['view_own_data']
  },
  
  activityLog: [],
  
  checkPermission(userId, permission) {
    const userRole = currentUser?.role || 'viewer';
    const permissions = this.roles[userRole] || [];
    return permissions.includes(permission);
  },
  
  logActivity(action, details) {
    const log = {
      timestamp: new Date(),
      user: currentUser?.username || 'unknown',
      action,
      details,
      ipAddress: 'local'
    };
    this.activityLog.push(log);
    console.log(`📋 نشاط: ${action}`);
  },
  
  getActivityLog() {
    return this.activityLog;
  },
  
  enableTwoFA(userId) {
    console.log(`🔐 تفعيل المصادقة الثنائية للمستخدم: ${userId}`);
  }
};

// ============= INVOICING SYSTEM =============
const invoiceModule = {
  invoices: [],
  
  createInvoice(clientName, items, totalAmount) {
    const invoice = {
      id: `INV-${Date.now()}`,
      clientName,
      items,
      totalAmount,
      date: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'pending',
      paymentDetails: {}
    };
    this.invoices.push(invoice);
    console.log(`📧 تم إنشاء الفاتورة: ${invoice.id}`);
    return invoice;
  },
  
  sendInvoice(invoiceId, email) {
    console.log(`📧 إرسال الفاتورة ${invoiceId} إلى ${email}`);
    alert(`سيتم إرسال الفاتورة إلى ${email}`);
  },
  
  markAsPaid(invoiceId) {
    const invoice = this.invoices.find(i => i.id === invoiceId);
    if(invoice) {
      invoice.status = 'paid';
      invoice.paymentDate = new Date();
      console.log(`✅ تم تحديد الفاتورة كمدفوعة`);
    }
  },
  
  getOverdueInvoices() {
    return this.invoices.filter(i => 
      i.status === 'pending' && new Date() > i.dueDate
    );
  }
};

// ============= HR MANAGEMENT SYSTEM =============
const hrModule = {
  employees: [],
  
  addEmployee(empData) {
    const emp = {
      id: Date.now(),
      ...empData,
      hireDate: new Date(),
      performance: 'good',
      trainings: []
    };
    this.employees.push(emp);
    console.log(`👤 تم إضافة موظف: ${emp.name}`);
    return emp;
  },
  
  evaluatePerformance(empId, score, comments) {
    console.log(`📊 تقييم أداء الموظف: ${score}/10`);
    alert(`تم حفظ التقييم: ${score}/10\nالتعليقات: ${comments}`);
  },
  
  scheduleTraining(empId, trainingName, date) {
    console.log(`📚 جدولة تدريب: ${trainingName}`);
  },
  
  getEmployeeMetrics(empId) {
    return {
      performance: 'good',
      attendance: '92%',
      trainingCompleted: 3,
      lastReview: new Date()
    };
  }
};

// ============= INITIALIZE ALL MODULES =============
function initializeAllModules() {
  console.log('🚀 تهيئة جميع الوحدات المتقدمة...');
  
  // Alert user about available modules
  const modules = [
    '📊 التحليلات والتقارير',
    '🔔 نظام الإشعارات',
    '📋 لوحة المهام',
    '📄 إدارة المستندات',
    '🔍 البحث المتقدم',
    '🔐 الأمان والصلاحيات',
    '💰 نظام الفواتير',
    '👥 إدارة الموارد البشرية'
  ];
  
  console.log('✅ الوحدات المتاحة:');
  modules.forEach(m => console.log('  ' + m));
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
