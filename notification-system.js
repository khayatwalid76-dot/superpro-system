// ============================================
// NOTIFICATION & ALERT SYSTEM
// Real-Time Notifications for SuperPro System
// ============================================

const notificationManager = {
  notifications: [],
  unreadCount: 0,
  
  async send(userId, title, message, type = 'info', data = {}) {
    try {
      const db = getDatabase();
      const notifRef = ref(db, `notifications/${userId}/${Date.now()}`);
      
      const notification = {
        title: title,
        message: message,
        type: type,
        timestamp: new Date().toISOString(),
        read: false,
        data: data,
        id: Date.now().toString()
      };
      
      await set(notifRef, notification);
      return true;
    } catch(error) {
      console.error('Send notification error:', error);
      return false;
    }
  },
  
  async getUnread(userId) {
    try {
      const db = getDatabase();
      const query = (snapshot) => {
        if(snapshot.exists()) {
          const data = snapshot.val();
          return Object.values(data).filter(n => !n.read);
        }
        return [];
      };
      
      const notifRef = ref(db, `notifications/${userId}`);
      const snapshot = await get(notifRef);
      return query(snapshot);
    } catch(error) {
      console.error('Get unread error:', error);
      return [];
    }
  },
  
  async markAsRead(userId, notificationId) {
    try {
      const db = getDatabase();
      const notifRef = ref(db, `notifications/${userId}/${notificationId}`);
      await update(notifRef, {
        read: true,
        readTime: new Date().toISOString()
      });
    } catch(error) {
      console.error('Mark read error:', error);
    }
  },
  
  async setupListener(userId) {
    try {
      const db = getDatabase();
      const notifRef = ref(db, `notifications/${userId}`);
      
      onValue(notifRef, (snapshot) => {
        if(snapshot.exists()) {
          const data = snapshot.val();
          const notifArray = Object.values(data)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          
          this.notifications = notifArray;
          this.unreadCount = notifArray.filter(n => !n.read).length;
          
          // Update badge
          updateNotificationBadge();
          
          // Show recent notification toast
          const latest = notifArray[0];
          if(latest && !latest.read) {
            this.showNotificationToast(latest);
          }
        }
      });
    } catch(error) {
      console.error('Setup listener error:', error);
    }
  },
  
  showNotificationToast(notification) {
    const icon = {
      'success': 'ظ£à',
      'error': 'ظإî',
      'warning': 'ظأبي╕',
      'info': 'ظ╣ي╕',
      'achievement': '≡ا'
    }[notification.type] || 'ظ╣ي╕';
    
    showToast(`${icon} ${notification.title}: ${notification.message}`, notification.type);
  }
};

// ============= NOTIFICATION TYPES =============

// Employee Notifications
async function notifyEmployeeAdded(employeeName) {
  if(!currentUser) return;
  
  // Notify supervisors
  await notificationManager.send(
    currentUser.uid,
    '┘à┘ê╪╕┘ ╪ش╪»┘è╪»',
    `╪ز┘à ╪ح╪╢╪د┘╪ر ┘à┘ê╪╕┘ ╪ش╪»┘è╪»: ${employeeName}`,
    'success',
    { type: 'employee_added', employeeName }
  );
  
  // Log activity
  await logActivity('employee_added', `╪ح╪╢╪د┘╪ر ┘à┘ê╪╕┘: ${employeeName}`);
}

async function notifyAttendanceAlert(employeeName, status) {
  // Notify when employee is absent
  if(status === '╪║┘è╪د╪ذ') {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if(snapshot.exists()) {
      const users = snapshot.val();
      Object.keys(users).forEach(uid => {
        const user = users[uid];
        if(user.role === 'admin' || user.role === 'supervisor') {
          notificationManager.send(
            uid,
            '╪║┘è╪د╪ذ ┘à┘ê╪╕┘',
            `${employeeName} ┘┘à ┘è╪ص╪╢╪▒ ╪د┘┘è┘ê┘à`,
            'warning',
            { type: 'absence_alert', employeeName }
          );
        }
      });
    }
  }
}

async function notifyPayrollProcessed(monthName, employeeCount) {
  if(!currentUser) return;
  
  await notificationManager.send(
    currentUser.uid,
    '╪د┘╪▒┘ê╪د╪ز╪ذ ┘à╪╣╪د┘╪ش╪ر',
    `╪ز┘à ┘à╪╣╪د┘╪ش╪ر ╪▒┘ê╪د╪ز╪ذ ${employeeCount} ┘à┘ê╪╕┘ ┘╪┤┘ç╪▒ ${monthName}`,
    'success',
    { type: 'payroll_processed', monthName, employeeCount }
  );
  
  await logActivity('payroll_processed', `┘à╪╣╪د┘╪ش╪ر ╪د┘╪▒┘ê╪د╪ز╪ذ ┘┘ ${employeeCount} ┘à┘ê╪╕┘`);
}

async function notifyContractExpiring(contractNumber, daysLeft) {
  if(!currentUser) return;
  
  const db = getDatabase();
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  
  if(snapshot.exists()) {
    const users = snapshot.val();
    Object.keys(users).forEach(uid => {
      const user = users[uid];
      if(user.role === 'admin' || user.role === 'supervisor') {
        notificationManager.send(
          uid,
          '╪د┘╪ز┘ç╪د╪ة ╪╣┘é╪» ┘é╪▒┘è╪ذ',
          `╪د┘╪╣┘é╪» ╪▒┘é┘à ${contractNumber} ┘è┘╪ز┘ç┘è ╪«┘╪د┘ ${daysLeft} ╪ث┘è╪د┘à`,
          'warning',
          { type: 'contract_expiring', contractNumber, daysLeft }
        );
      }
    });
  }
}

async function notifyBudgetExceeded(category, limit, current) {
  if(!currentUser) return;
  
  const db = getDatabase();
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  
  if(snapshot.exists()) {
    const users = snapshot.val();
    Object.keys(users).forEach(uid => {
      const user = users[uid];
      if(user.role === 'admin') {
        notificationManager.send(
          uid,
          '╪ز╪ش╪د┘ê╪▓ ╪د┘┘à┘è╪▓╪د┘┘è╪ر',
          `┘à╪╡╪▒┘ê┘╪د╪ز ${category} ╪ز╪ش╪د┘ê╪▓╪ز ╪د┘╪ص╪» ╪د┘┘à╪│┘à┘ê╪ص: ${current} ┘à┘ ${limit}`,
          'error',
          { type: 'budget_exceeded', category, limit, current }
        );
      }
    });
  }
}

async function notifyTaskAssigned(taskTitle, assigneeName) {
  if(!currentUser) return;
  
  await notificationManager.send(
    currentUser.uid,
    '┘à┘ç┘à╪ر ╪ش╪»┘è╪»╪ر',
    `╪ز┘à ╪ز╪╣┘è┘è┘ ┘à┘ç┘à╪ر ╪ش╪»┘è╪»╪ر ┘┘â: ${taskTitle}`,
    'info',
    { type: 'task_assigned', taskTitle }
  );
}

async function notifyApprovalNeeded(documentType, documentId) {
  if(!currentUser) return;
  
  await notificationManager.send(
    currentUser.uid,
    '┘à┘ê╪د┘┘é╪ر ┘à╪╖┘┘ê╪ذ╪ر',
    `┘è╪ز╪╖┘╪ذ ╪╣┘┘ë ${documentType} ┘à┘ê╪د┘┘é╪ز┘â`,
    'warning',
    { type: 'approval_needed', documentType, documentId }
  );
}

async function notifySystemAlert(message, severity = 'warning') {
  if(!currentUser) return;
  
  const db = getDatabase();
  const usersRef = ref(db, 'users');
  const snapshot = await get(usersRef);
  
  if(snapshot.exists()) {
    const users = snapshot.val();
    Object.keys(users).forEach(uid => {
      const user = users[uid];
      if(user.role === 'admin') {
        notificationManager.send(
          uid,
          '╪ز┘╪ذ┘è┘ç ╪د┘┘╪╕╪د┘à',
          message,
          severity,
          { type: 'system_alert' }
        );
      }
    });
  }
}

// ============= UI UPDATES =============
function updateNotificationBadge() {
  const badge = document.getElementById('notificationBadge');
  if(badge) {
    if(notificationManager.unreadCount > 0) {
      badge.textContent = notificationManager.unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
}

function displayNotifications() {
  const container = document.getElementById('notificationList');
  if(!container) return;
  
  const html = notificationManager.notifications.map(notif => `
    <div class="notification-item ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}">
      <div class="notif-header">
        <strong>${notif.title}</strong>
        <small>${new Date(notif.timestamp).toLocaleString('ar-SA')}</small>
      </div>
      <div class="notif-body">${notif.message}</div>
      <div class="notif-actions">
        ${!notif.read ? `<button onclick="markNotificationRead('${notif.id}')">╪د┘é╪▒╪ث</button>` : ''}
        <button onclick="deleteNotification('${notif.id}')">╪ص╪░┘</button>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = html || '<p>┘╪د ╪ز┘ê╪ش╪» ╪ح╪┤╪╣╪د╪▒╪د╪ز</p>';
}

function markNotificationRead(notificationId) {
  if(currentUser) {
    notificationManager.markAsRead(currentUser.uid, notificationId);
    displayNotifications();
  }
}

async function deleteNotification(notificationId) {
  try {
    const db = getDatabase();
    const notifRef = ref(db, `notifications/${currentUser.uid}/${notificationId}`);
    await remove(notifRef);
    displayNotifications();
    showToast('╪ز┘à ╪ص╪░┘ ╪د┘╪ح╪┤╪╣╪د╪▒', 'success');
  } catch(error) {
    console.error('Delete notification error:', error);
  }
}

// ============= EMAIL NOTIFICATIONS (Future) =============
async function sendEmailNotification(email, subject, message) {
  // This would typically call a backend service
  console.log('Email notification:', { email, subject, message });
}

// ============= SMS NOTIFICATIONS (Future) =============
async function sendSMSNotification(phone, message) {
  // This would typically call a backend service
  console.log('SMS notification:', { phone, message });
}

// ============= NOTIFICATION PREFERENCES =============
async function updateNotificationPreferences(userId, preferences) {
  try {
    const db = getDatabase();
    const prefRef = ref(db, `users/${userId}/notificationPreferences`);
    await set(prefRef, {
      emailNotifications: preferences.emailNotifications !== false,
      smsNotifications: preferences.smsNotifications !== false,
      pushNotifications: preferences.pushNotifications !== false,
      inAppNotifications: preferences.inAppNotifications !== false,
      attendanceAlerts: preferences.attendanceAlerts !== false,
      payrollAlerts: preferences.payrollAlerts !== false,
      contractAlerts: preferences.contractAlerts !== false,
      budgetAlerts: preferences.budgetAlerts !== false,
      updatedAt: new Date().toISOString()
    });
    
    showToast('ظ£à ╪ز┘à ╪ز╪ص╪»┘è╪س ╪ز┘╪╢┘è┘╪د╪ز ╪د┘╪ح╪┤╪╣╪د╪▒╪د╪ز', 'success');
    return true;
  } catch(error) {
    console.error('Update preferences error:', error);
    showToast('╪«╪╖╪ث ┘┘è ╪ز╪ص╪»┘è╪س ╪د┘╪ز┘╪╢┘è┘╪د╪ز', 'error');
    return false;
  }
}

// ============= INITIALIZE NOTIFICATIONS =============
window.notificationManager = notificationManager;
window.notifyEmployeeAdded = notifyEmployeeAdded;
window.notifyAttendanceAlert = notifyAttendanceAlert;
window.notifyPayrollProcessed = notifyPayrollProcessed;
window.notifyContractExpiring = notifyContractExpiring;
window.notifyBudgetExceeded = notifyBudgetExceeded;
window.notifyTaskAssigned = notifyTaskAssigned;
window.notifyApprovalNeeded = notifyApprovalNeeded;
window.notifySystemAlert = notifySystemAlert;
window.updateNotificationPreferences = updateNotificationPreferences;

console.log('ظ£à Notification System Loaded');
