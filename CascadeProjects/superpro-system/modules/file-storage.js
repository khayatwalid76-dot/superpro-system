// ============= نظام إدارة الملفات والتخزين =============

class FileStorageManager {
  constructor() {
    this.files = [];
    this.folders = [
      {
        id: 'documents',
        name: 'المستندات',
        type: 'folder',
        parent: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'invoices',
        name: 'الفواتير',
        type: 'folder',
        parent: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'reports',
        name: 'التقارير',
        type: 'folder',
        parent: null,
        createdAt: new Date().toISOString()
      },
      {
        id: 'backups',
        name: 'النسخ الاحتياطية',
        type: 'folder',
        parent: null,
        createdAt: new Date().toISOString()
      }
    ];
    this.maxStorageSize = 100 * 1024 * 1024; // 100MB
    this.currentUsage = 0;
  }

  // ===== رفع الملفات =====
  uploadFile(file, destination = 'documents') {
    if(!file) return { error: 'لا يوجد ملف' };

    // فحص الحجم
    if(this.currentUsage + file.size > this.maxStorageSize) {
      return { 
        error: 'المساحة التخزينية ممتلئة',
        currentUsage: this.currentUsage,
        availableSpace: this.maxStorageSize - this.currentUsage
      };
    }

    const uploadedFile = {
      id: Date.now(),
      name: file.name,
      type: file.type,
      size: file.size,
      destination: destination,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'currentUser', // يتم استبداله بمعرف المستخدم الفعلي
      checksum: this.calculateChecksum(file.name + file.size),
      tags: [],
      shared: false,
      sharedWith: []
    };

    this.files.push(uploadedFile);
    this.currentUsage += file.size;

    console.log(`📁 تم رفع الملف: ${file.name} (${this.formatFileSize(file.size)})`);

    return { status: 'success', file: uploadedFile };
  }

  calculateChecksum(data) {
    // حساب بسيط للـ checksum
    // في الإنتاج: استخدم SHA-256
    let hash = 0;
    for(let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  // ===== تحميل الملفات =====
  downloadFile(fileId) {
    const file = this.files.find(f => f.id === fileId);
    if(!file) return { error: 'الملف غير موجود' };

    console.log(`📥 تحميل الملف: ${file.name}`);

    // في الإنتاج: استخدم blob API
    return {
      status: 'success',
      file: file,
      downloadUrl: `data:${file.type};base64,encoded_data`
    };
  }

  // ===== حذف الملفات =====
  deleteFile(fileId) {
    const fileIndex = this.files.findIndex(f => f.id === fileId);
    if(fileIndex === -1) return { error: 'الملف غير موجود' };

    const file = this.files[fileIndex];
    this.files.splice(fileIndex, 1);
    this.currentUsage -= file.size;

    console.log(`🗑️ تم حذف الملف: ${file.name}`);

    return { status: 'success', message: 'تم حذف الملف' };
  }

  // ===== البحث عن الملفات =====
  searchFiles(query) {
    return this.files.filter(file =>
      file.name.toLowerCase().includes(query.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // ===== تنظيم الملفات =====
  addTag(fileId, tag) {
    const file = this.files.find(f => f.id === fileId);
    if(!file) return { error: 'الملف غير موجود' };

    if(!file.tags.includes(tag)) {
      file.tags.push(tag);
    }

    return { status: 'success', tags: file.tags };
  }

  removeTag(fileId, tag) {
    const file = this.files.find(f => f.id === fileId);
    if(!file) return { error: 'الملف غير موجود' };

    file.tags = file.tags.filter(t => t !== tag);
    return { status: 'success', tags: file.tags };
  }

  // ===== مشاركة الملفات =====
  shareFile(fileId, shareWith) {
    const file = this.files.find(f => f.id === fileId);
    if(!file) return { error: 'الملف غير موجود' };

    file.shared = true;
    if(!file.sharedWith.includes(shareWith)) {
      file.sharedWith.push(shareWith);
    }

    const shareLink = `${window.location.origin}?file=${fileId}&token=${this.generateShareToken()}`;

    console.log(`🔗 تم مشاركة الملف: ${file.name} مع ${shareWith}`);

    return {
      status: 'success',
      shareLink: shareLink,
      sharedWith: file.sharedWith
    };
  }

  generateShareToken() {
    return 'token_' + Math.random().toString(36).substr(2, 9);
  }

  revokeShare(fileId, revokeFrom) {
    const file = this.files.find(f => f.id === fileId);
    if(!file) return { error: 'الملف غير موجود' };

    file.sharedWith = file.sharedWith.filter(user => user !== revokeFrom);
    if(file.sharedWith.length === 0) {
      file.shared = false;
    }

    console.log(`🔒 تم إلغاء مشاركة الملف: ${file.name}`);

    return { status: 'success', sharedWith: file.sharedWith };
  }

  // ===== إدارة المجلدات =====
  createFolder(folderName, parent = null) {
    const folder = {
      id: Date.now(),
      name: folderName,
      type: 'folder',
      parent: parent,
      createdAt: new Date().toISOString(),
      files: []
    };

    this.folders.push(folder);
    return folder;
  }

  deleteFolder(folderId) {
    const folderIndex = this.folders.findIndex(f => f.id === folderId);
    if(folderIndex === -1) return { error: 'المجلد غير موجود' };

    // حذف الملفات بداخله أولاً
    const filesInFolder = this.files.filter(f => f.destination === folderId);
    filesInFolder.forEach(file => this.deleteFile(file.id));

    this.folders.splice(folderIndex, 1);
    return { status: 'success', message: 'تم حذف المجلد' };
  }

  // ===== الإحصائيات =====
  getStorageStats() {
    const stats = {
      totalFiles: this.files.length,
      totalFolders: this.folders.length,
      totalSize: this.currentUsage,
      totalSizeFormatted: this.formatFileSize(this.currentUsage),
      maxSize: this.maxStorageSize,
      maxSizeFormatted: this.formatFileSize(this.maxStorageSize),
      usagePercentage: (this.currentUsage / this.maxStorageSize) * 100,
      availableSpace: this.maxStorageSize - this.currentUsage,
      availableSpaceFormatted: this.formatFileSize(this.maxStorageSize - this.currentUsage),
      filesByType: this.getFilesByType(),
      recentFiles: this.getRecentFiles(5)
    };

    return stats;
  }

  getFilesByType() {
    const types = {};
    this.files.forEach(file => {
      const ext = file.name.split('.').pop();
      if(!types[ext]) types[ext] = 0;
      types[ext]++;
    });
    return types;
  }

  getRecentFiles(limit = 5) {
    return this.files
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, limit);
  }

  formatFileSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if(bytes === 0) return '0 B';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  // ===== النسخ الاحتياطية =====
  createBackup() {
    const backup = {
      id: Date.now(),
      name: `Backup_${new Date().toLocaleString('ar-SA')}`,
      size: this.currentUsage,
      timestamp: new Date().toISOString(),
      dataCount: {
        files: this.files.length,
        folders: this.folders.length
      },
      status: 'completed'
    };

    console.log(`💾 تم إنشاء نسخة احتياطية: ${backup.name}`);

    return backup;
  }

  restoreBackup(backupId) {
    console.log(`🔄 استعادة النسخة الاحتياطية: ${backupId}`);

    // في الإنتاج: استعيد البيانات من الخادم
    return { status: 'success', message: 'تم استعادة النسخة الاحتياطية' };
  }

  // ===== التنظيف والصيانة =====
  cleanupOldFiles(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldFiles = this.files.filter(file => 
      new Date(file.uploadedAt) < cutoffDate
    );

    oldFiles.forEach(file => this.deleteFile(file.id));

    console.log(`🧹 تم حذف ${oldFiles.length} ملفات قديمة`);

    return { deletedCount: oldFiles.length, freedSpace: oldFiles.reduce((sum, f) => sum + f.size, 0) };
  }

  // ===== الحفظ والتحميل =====
  saveStorage() {
    localStorage.setItem('superpro_files', JSON.stringify(this.files));
    localStorage.setItem('superpro_folders', JSON.stringify(this.folders));
    localStorage.setItem('superpro_storage_usage', JSON.stringify(this.currentUsage));
  }

  loadStorage() {
    const files = localStorage.getItem('superpro_files');
    const folders = localStorage.getItem('superpro_folders');
    const usage = localStorage.getItem('superpro_storage_usage');

    if(files) this.files = JSON.parse(files);
    if(folders) {
      const parsedFolders = JSON.parse(folders);
      this.folders = [...this.folders, ...parsedFolders.filter(f => f.parent)];
    }
    if(usage) this.currentUsage = JSON.parse(usage);
  }
}

// إنشاء instance عام
const fileStorageManager = new FileStorageManager();
fileStorageManager.loadStorage();
console.log('✅ تم تحميل نظام إدارة الملفات والتخزين');
