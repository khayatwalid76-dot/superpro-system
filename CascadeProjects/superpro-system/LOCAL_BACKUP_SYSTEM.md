# نظام النسخة الاحتياطية المحلية
## LOCAL BACKUP SYSTEM

### 📋 نظرة عامة
نظام متقدم لحفظ البيانات بشكل ثنائي:
- **الأساسي**: Firebase Realtime Database
- **الاحتياطي**: localStorage (النسخة المحلية)

---

## 🔄 آلية العمل

### 1️⃣ الحفظ (Save)
عند إضافة أو تعديل بيانات:
```javascript
// يتم الحفظ على Firebase أولاً
await employeeService.addEmployee(employee);

// إذا نجح: يتم حفظ النسخة الاحتياطية تلقائياً في localStorage
localBackup.save('employees', allEmployees);

// إذا فشل Firebase: يتم الحفظ محلياً فقط مع رسالة "محفوظ محلياً"
```

### 2️⃣ التحميل (Load)
عند فتح الصفحة أو تحديث البيانات:
```javascript
// يحاول التحميل من Firebase أولاً
const employees = await employeeService.getEmployees();

// إذا فشل: يستخدم النسخة المحلية من localStorage
// الرسالة: "تم تحميل من النسخة الاحتياطية"
```

### 3️⃣ المزامنة (Sync)
عند عودة الاتصال بـ Firebase:
```javascript
// يتم مزامنة البيانات تلقائياً
await localBackup.syncAll();
// يتم رفع البيانات المحلية إذا كانت أحدث
```

---

## 📦 الخدمات المطبقة

### ✅ مطبقة بنسخة احتياطية محلية:
- `employeeService` - الموظفين
- `clientService` - العملاء

### 📌 جاهزة للتطبيق (نفس النمط):
- `attendanceService` - الحضور
- `payrollService` - الرواتب
- `contractService` - العقود
- جميع الخدمات الأخرى

---

## 🛠️ كيفية التطبيق على خدمة جديدة

انسخ النمط التالي في أي خدمة:

```javascript
const newService = {
  // ❌ قديم
  // addItem: async (item) => {
  //   const db = getDatabase();
  //   await set(ref(db, `path/id`), data);
  // }

  // ✅ جديد
  addItem: async (item) => {
    try {
      const id = Date.now().toString();
      const data = { ...item, id, createdAt: new Date().toISOString() };
      
      try {
        const db = getDatabase();
        await set(ref(db, `items/${id}`), data);
        
        // حفظ النسخة الاحتياطية
        const allItems = await newService.getItems();
        allItems.push(data);
        localBackup.save('items', allItems);
        
        showToast('✅ تم الحفظ بنجاح', 'success');
      } catch(firebaseError) {
        console.warn('⚠️ خطأ Firebase، حفظ محلي:', firebaseError);
        const allItems = localBackup.load('items') || [];
        allItems.push(data);
        localBackup.save('items', allItems);
        showToast('✅ تم الحفظ (محلياً)', 'success');
      }
      
      return data;
    } catch (error) {
      showToast('❌ خطأ: ' + error.message, 'error');
      return null;
    }
  },

  getItems: async () => {
    try {
      try {
        const db = getDatabase();
        const snapshot = await get(ref(db, 'items'));
        let data = snapshot.exists() ? Object.values(snapshot.val()) : [];
        
        if(data.length > 0) {
          localBackup.save('items', data);
        }
        return data;
      } catch(firebaseError) {
        console.warn('⚠️ خطأ Firebase، استخدام backup:', firebaseError);
        const backupData = localBackup.load('items');
        return backupData || [];
      }
    } catch (error) {
      showToast('❌ خطأ في التحميل', 'error');
      return localBackup.load('items') || [];
    }
  }
};
```

---

## 🎛️ دوال النسخة الاحتياطية

### `localBackup.save(key, data)`
```javascript
// حفظ البيانات محلياً
localBackup.save('employees', employeeArray);
// يحفظ في: localStorage.backup_employees
```

### `localBackup.load(key)`
```javascript
// تحميل البيانات من النسخة المحلية
const employees = localBackup.load('employees');
// يُرجع: Array أو null
```

### `localBackup.syncAll()`
```javascript
// مزامنة جميع البيانات
await localBackup.syncAll();
// تحقق من Console للتفاصيل
```

### `localBackup.clear(key)`
```javascript
// حذف نسخة احتياطية محددة
localBackup.clear('employees');
```

### `localBackup.clearAll()`
```javascript
// حذف جميع النسخ الاحتياطية
localBackup.clearAll();
```

---

## 🔍 المفاتيح المدعومة

البيانات التالية لها نظام backup محلي:
```javascript
'employees', 'clients', 'contractors', 'partners', 'contracts',
'attendance', 'payroll', 'dailyWork', 'income', 'expenses',
'invoicing', 'inventory', 'teams', 'locations', 'packages',
'ratings', 'reports', 'tasks', 'notifications'
```

---

## 📊 حالات الاستخدام

### 📶 مع اتصال إنترنت ✅
```
عملية → Firebase ✅ → localStorage ✅ → رسالة نجاح
```

### 📵 بدون اتصال إنترنت
```
عملية → Firebase ❌ → localStorage ✅ → رسالة "محفوظ محلياً"
```

### 🔌 عند عودة الاتصال
```
تطبيق يقدم: "جاري المزامنة..." → مزامنة تلقائية → "تمت المزامنة ✅"
```

---

## 🐛 تصحيح الأخطاء

### فتح Console للتحقق من الملفات
```javascript
F12 → Application → Local Storage → ابحث عن "backup_"
```

### عرض النسخة الاحتياطية
```javascript
// في Console
localStorage.getItem('backup_employees')
```

### حذف النسخة الاحتياطية
```javascript
// في Console
localBackup.clear('employees');
// أو
localBackup.clearAll();
```

---

## 📝 ملاحظات مهمة

✅ **المميزات:**
- عمل تطبيق حتى بدون إنترنت
- عدم فقدان البيانات
- مزامنة تلقائية
- بيانات احتياطية دائمة

⚠️ **الحدود:**
- localStorage له حد أقصى (~5-10MB حسب المتصفح)
- البيانات محلية فقط (لا تنتقل بين الأجهزة تلقائياً)
- يجب أن يكون لديك Firebase كمصدر الحقيقة

---

## 🚀 التحديثات المستقبلية

- [ ] مزامنة ذكية (sync فقط البيانات المعدلة)
- [ ] ضغط البيانات (compression) لتقليل الحجم
- [ ] Export/Import من النسخ الاحتياطية
- [ ] Multi-device sync

---

**آخر تحديث**: 8 مارس 2026
**الإصدار**: 2.0 (مرحلة اختبار)
