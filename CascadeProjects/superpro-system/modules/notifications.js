// ============= نظام الإشعارات والتنبيهات =============

class NotificationSystem {
  constructor() {
    this.notifications = [];
    this.alerts = [];
    this.maxNotifications = 50;
  }

  // إضافة إشعار
  addNotification(type, title, message, severity = 'info') {
    const notification = {
      id: Date.now(),
      type: type,
      title: title,
      message: message,
      severity: severity, // info, warning, error, success
      timestamp: new Date().toISOString(),
      read: false,
      action: null
    };

    this.notifications.unshift(notification);
    if(this.notifications.length > this.maxNotifications) {
      this.notifications.pop();
    }

    this.saveNotifications();
    this.showToast(message, severity);
    return notification;
  }

  // إضافة تنبيه تلقائي
  addAlert(category, title, message, dueDate = null) {
    const alert = {
      id: Date.now(),
      category: category, // contract, residency, salary, attendance
      title: title,
      message: message,
      dueDate: dueDate,
      severity: this.calculateSeverity(dueDate),
      dismissed: false,
      createdAt: new Date().toISOString()
    };

    this.alerts.unshift(alert);
    this.saveAlerts();
    return alert;
  }

  // تنبيهات العقود المنتهية
  checkExpiringContracts(contracts) {
    contracts.forEach(contract => {
      if(contract.endDate) {
        const daysUntilExpiry = this.daysUntil(contract.endDate);
        if(daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          this.addAlert(
            'contract',
            'عقد قارب على الانتهاء',
            `العقد رقم ${contract.number} ينتهي خلال ${daysUntilExpiry} أيام`,
            contract.endDate
          );
        }
      }
    });
  }

  // تنبيهات الإقامات المنتهية
  checkExpiringResidencies(employees) {
    employees.forEach(emp => {
      if(emp.residencyExpiry) {
        const daysUntilExpiry = this.daysUntil(emp.residencyExpiry);
        if(daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          this.addAlert(
            'residency',
            'إقامة قاربة على الانتهاء',
            `إقامة الموظف ${emp.name} تنتهي خلال ${daysUntilExpiry} يوم`,
            emp.residencyExpiry
          );
        }
      }
    });
  }

  // تنبيهات الرواتب المتأخرة
  checkLatePayroll(employees, payroll) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    employees.forEach(emp => {
      const monthlyPayroll = payroll.find(p => p.employeeId === emp.id && p.month === currentMonth);
      if(!monthlyPayroll) {
        this.addAlert(
          'salary',
          'راتب متأخر',
          `راتب الموظف ${emp.name} لم يتم دفعه بعد`,
          new Date().toISOString()
        );
      }
    });
  }

  // تنبيهات الحضور المنخفضة
  checkLowAttendance(employees, attendance) {
    const attendanceThreshold = 80; // نسبة الحضور الدنيا

    employees.forEach(emp => {
      const empAttendance = attendance.filter(a => a.empId === emp.id);
      if(empAttendance.length > 0) {
        const attendanceRate = (empAttendance.filter(a => a.status === 'حاضر').length / empAttendance.length) * 100;
        
        if(attendanceRate < attendanceThreshold) {
          this.addAlert(
            'attendance',
            'حضور منخفض',
            `معدل حضور الموظف ${emp.name} هو ${attendanceRate.toFixed(1)}%`,
            null
          );
        }
      }
    });
  }

  // حساب درجة الخطورة
  calculateSeverity(dueDate) {
    if(!dueDate) return 'info';
    
    const daysUntil = this.daysUntil(dueDate);
    if(daysUntil < 0) return 'error';
    if(daysUntil <= 3) return 'error';
    if(daysUntil <= 7) return 'warning';
    return 'info';
  }

  // حساب عدد الأيام
  daysUntil(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // عرض Toast notification
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer') || this.createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="toast-close">✕</button>
      </div>
    `;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
  }

  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
    return container;
  }

  // حفظ واسترجاع
  saveNotifications() {
    localStorage.setItem('superpro_notifications', JSON.stringify(this.notifications));
  }

  saveAlerts() {
    localStorage.setItem('superpro_alerts', JSON.stringify(this.alerts));
  }

  loadNotifications() {
    const stored = localStorage.getItem('superpro_notifications');
    if(stored) this.notifications = JSON.parse(stored);
  }

  loadAlerts() {
    const stored = localStorage.getItem('superpro_alerts');
    if(stored) this.alerts = JSON.parse(stored);
  }

  // الحصول على الإشعارات غير المقروءة
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  // الحصول على التنبيهات النشطة
  getActiveAlerts() {
    return this.alerts.filter(a => !a.dismissed);
  }
}

// إنشاء instance عام
const notificationSystem = new NotificationSystem();
notificationSystem.loadNotifications();
notificationSystem.loadAlerts();
console.log('✅ تم تحميل نظام الإشعارات');
