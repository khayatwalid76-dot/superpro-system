# تفعيل التخزين السحابي Firebase

## الخطوات:

### 1. إنشاء مشروع Firebase
1. اذهب إلى [https://console.firebase.google.com](https://console.firebase.google.com)
2. سجل دخول بحساب Google
3. اضغط على "إضافة مشروع"
4. أدخل اسم المشروع (مثال: superpro-system)
5. تابع الخطوات وقم بتفعيل Google Analytics (اختياري)

### 2. الحصول على إعدادات المشروع
1. من لوحة التحكم، اضغط على أيقونة الويب (</>)
2. سمِّ تطبيقك (مثال: superpro-web)
3. سجل التطبيق
4. انسخ كود إعدادات Firebase

### 3. تفعيل Firestore Database
1. من القائمة الجانبية، اذهب إلى "Firestore Database"
2. اضغط على "إنشاء قاعدة بيانات"
3. اختر "ابدأ في وضع الاختبار"
4. اختر موقع قاعدة البيانات
5. اضغط "تفعيل"

### 4. إضافة الإعدادات للنظام
أضف الكود التالي في ملف index.html قبل وسم </head>:

```html
<script src="cloud-storage.js"></script>
<script>
// إعدادات Firebase (استبدلها بإعدادات مشروعك)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// تهيئة التخزين السحابي
cloudStorage.initialize(firebaseConfig).then(success => {
    if (success) {
        console.log('تم تفعيل التخزين السحابي');
    }
});
</script>
```

### 5. إضافة أزرار التخزين السحابي
يمكنك إضافة أزرار لحفظ/تحميل البيانات من السحابة في واجهة الإعدادات.

## المميزات بعد التفعيل:
- حفظ البيانات بشكل دائم في السحابة
- مزامنة البيانات بين الأجهزة
- استعادة البيانات عند فقدانها
- نسخ احتياطي تلقائي
