// ============= نظام الأدوار والصلاحيات =============

class AccessControlSystem {
  constructor() {
    this.roles = this.initializeRoles();
    this.userRoles = {};
    this.activityLog = [];
  }

  // تهيئة الأدوار الافتراضية
  initializeRoles() {
    return {
      admin: {
        name: 'مدير النظام',
        permissions: [
          'view_all', 'edit_all', 'delete_all',
          'manage_users', 'manage_roles', 'view_reports',
          'export_data', 'manage_backups', 'view_logs',
          'system_settings'
        ],
        level: 4
      },
      supervisor: {
        name: 'المشرف',
        permissions: [
          'view_all', 'edit_own', 'edit_team',
          'view_reports', 'export_data', 'manage_team',
          'approve_timesheets'
        ],
        level: 3
      },
      manager: {
        name: 'المدير',
        permissions: [
          'view_all', 'edit_own', 'create_new',
          'view_reports', 'export_own_data'
        ],
        level: 2
      },
      employee: {
        name: 'موظف',
        permissions: [
          'view_own', 'edit_own_profile', 'submit_timesheet',
          'view_own_payroll'
        ],
        level: 1
      },
      viewer: {
        name: 'عارض فقط',
        permissions: [
          'view_own', 'view_public_reports'
        ],
        level: 0
      }
    };
  }

  // تعيين دور للمستخدم
  assignRole(userId, roleKey) {
    if(!this.roles[roleKey]) {
      console.warn(`❌ دور غير موجود: ${roleKey}`);
      return false;
    }

    this.userRoles[userId] = roleKey;
    this.logActivity('assign_role', `تم تعيين الدور ${roleKey} للمستخدم ${userId}`);
    this.saveRoles();
    return true;
  }

  // التحقق من الصلاحية
  checkPermission(userId, permission) {
    const roleKey = this.userRoles[userId] || 'viewer';
    const role = this.roles[roleKey];
    
    if(!role) return false;
    
    const hasPermission = role.permissions.includes(permission);
    
    if(!hasPermission) {
      this.logActivity('permission_denied', `محاولة وصول مرفوضة: ${userId} -> ${permission}`);
    }
    
    return hasPermission;
  }

  // التحقق من عدة صلاحيات
  checkPermissions(userId, permissions) {
    return permissions.every(perm => this.checkPermission(userId, perm));
  }

  // الحصول على دور المستخدم
  getUserRole(userId) {
    return this.userRoles[userId] || 'viewer';
  }

  // الحصول على معلومات الدور
  getRoleInfo(roleKey) {
    return this.roles[roleKey] || null;
  }

  // إنشاء دور مخصص
  createCustomRole(roleName, permissions, level) {
    const roleKey = roleName.toLowerCase().replace(/\s+/g, '_');
    
    this.roles[roleKey] = {
      name: roleName,
      permissions: permissions,
      level: level,
      custom: true
    };

    this.logActivity('create_role', `تم إنشاء دور جديد: ${roleName}`);
    this.saveRoles();
    return roleKey;
  }

  // تحديث صلاحيات الدور
  updateRolePermissions(roleKey, permissions) {
    if(!this.roles[roleKey]) {
      console.warn(`❌ دور غير موجود: ${roleKey}`);
      return false;
    }

    this.roles[roleKey].permissions = permissions;
    this.logActivity('update_role', `تم تحديث صلاحيات الدور ${roleKey}`);
    this.saveRoles();
    return true;
  }

  // سجل الأنشطة
  logActivity(type, description, userId = 'system') {
    const activity = {
      id: Date.now(),
      type: type,
      description: description,
      userId: userId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ip: 'N/A' // في الإنتاج ستحصل من السيرفر
    };

    this.activityLog.unshift(activity);
    if(this.activityLog.length > 1000) {
      this.activityLog.pop();
    }

    this.saveActivityLog();
  }

  // الحصول على سجل الأنشطة
  getActivityLog(filters = {}) {
    let log = this.activityLog;

    if(filters.type) {
      log = log.filter(a => a.type === filters.type);
    }

    if(filters.userId) {
      log = log.filter(a => a.userId === filters.userId);
    }

    if(filters.startDate) {
      log = log.filter(a => new Date(a.timestamp) >= new Date(filters.startDate));
    }

    if(filters.endDate) {
      log = log.filter(a => new Date(a.timestamp) <= new Date(filters.endDate));
    }

    return log;
  }

  // حفظ واسترجاع
  saveRoles() {
    localStorage.setItem('superpro_roles', JSON.stringify(this.roles));
    localStorage.setItem('superpro_userRoles', JSON.stringify(this.userRoles));
  }

  saveActivityLog() {
    localStorage.setItem('superpro_activityLog', JSON.stringify(this.activityLog));
  }

  loadRoles() {
    const rolesData = localStorage.getItem('superpro_roles');
    const userRolesData = localStorage.getItem('superpro_userRoles');
    const logData = localStorage.getItem('superpro_activityLog');

    if(rolesData) this.roles = JSON.parse(rolesData);
    if(userRolesData) this.userRoles = JSON.parse(userRolesData);
    if(logData) this.activityLog = JSON.parse(logData);
  }

  // إنشاء decorator للتحقق من الصلاحية
  requirePermission(permission) {
    return function(target, propertyKey, descriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = function(...args) {
        const userId = currentUser?.id || 'anonymous';
        
        if(!accessControlSystem.checkPermission(userId, permission)) {
          console.error(`❌ صلاحية مرفوضة: ${permission}`);
          throw new Error(`ليس لديك صلاحية لتنفيذ هذه العملية: ${permission}`);
        }

        return originalMethod.apply(this, args);
      };

      return descriptor;
    };
  }
}

// إنشاء instance عام
const accessControlSystem = new AccessControlSystem();
accessControlSystem.loadRoles();
console.log('✅ تم تحميل نظام الأدوار والصلاحيات');
