// التخزين السحابي مع Firebase لـ Vercel
class VercelFirebaseStorage {
    constructor() {
        this.firebaseConfig = {
            projectId: process.env.FIREBASE_PROJECT_ID || 'ecfg_9fmxofwyv4fbtyfvxcdxh8qkch6n',
            databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://ecfg_9fmxofwyv4fbtyfvxcdxh8qkch6n-default-rtdb.firebaseio.com/'
        };
    }

    async initialize() {
        try {
            // تهيئة Firebase للعميل
            if (typeof firebase !== 'undefined') {
                firebase.initializeApp(this.firebaseConfig);
                this.database = firebase.database();
                console.log('تم تهيئة Firebase بنجاح');
                return true;
            }
            return false;
        } catch (error) {
            console.error('خطأ في تهيئة Firebase:', error);
            return false;
        }
    }

    async saveData(data) {
        try {
            if (!this.database) {
                await this.initialize();
            }

            // حفظ جميع البيانات
            const updates = {};
            
            // حفظ الموظفين
            if (data.employees) {
                updates['employees'] = data.employees;
            }
            
            // حفظ العملاء
            if (data.clients) {
                updates['clients'] = data.clients;
            }
            
            // حفظ العقود
            if (data.contracts) {
                updates['contracts'] = data.contracts;
            }
            
            // حفظ العمل اليومي
            if (data.dailyWork) {
                updates['dailyWork'] = data.dailyWork;
            }
            
            // حفظ المدخولات
            if (data.income) {
                updates['income'] = data.income;
            }
            
            // حفظ المصروفات
            if (data.expenses) {
                updates['expenses'] = data.expenses;
            }
            
            // حفظ الحضور
            if (data.attendance) {
                updates['attendance'] = data.attendance;
            }
            
            // حفظ الخدمات
            if (data.services) {
                updates['services'] = data.services;
            }
            
            // حفظ المهام
            if (data.tasks) {
                updates['tasks'] = data.tasks;
            }
            
            // حفظ المواعيد
            if (data.events) {
                updates['events'] = data.events;
            }

            // تنفيذ الحفظ
            await this.database.ref().update(updates);
            
            console.log('تم حفظ جميع البيانات في Firebase بنجاح');
            return true;
        } catch (error) {
            console.error('خطأ في حفظ البيانات:', error);
            return false;
        }
    }

    async loadData() {
        try {
            if (!this.database) {
                await this.initialize();
            }

            const snapshot = await this.database.ref().once('value');
            const data = snapshot.val() || {};

            console.log('تم استرجاع البيانات من Firebase بنجاح');
            return data;
        } catch (error) {
            console.error('خطأ في استرجاع البيانات:', error);
            return null;
        }
    }

    // دالة للحفظ من الواجهة الأمامية
    async saveToCloud() {
        try {
            const data = {
                employees: window.employees || [],
                clients: window.clients || [],
                contracts: window.contracts || [],
                dailyWork: window.dailyWork || [],
                income: window.income || [],
                expenses: window.expenses || [],
                attendance: window.attendance || [],
                services: window.services || [],
                tasks: window.tasks || [],
                events: window.events || []
            };

            const success = await this.saveData(data);
            
            if (success) {
                alert('✅ تم حفظ البيانات في التخزين السحابي بنجاح!');
            } else {
                alert('❌ فشل حفظ البيانات في التخزين السحابي');
            }
        } catch (error) {
            console.error('خطأ في الحفظ السحابي:', error);
            alert('❌ حدث خطأ أثناء الحفظ في التخزين السحابي');
        }
    }

    // دالة للاسترجاع من الواجهة الأمامية
    async loadFromCloud() {
        try {
            const data = await this.loadData();
            
            if (data) {
                // تحديث البيانات في النافذة
                if (data.employees) {
                    window.employees = data.employees;
                    sessionStorage.setItem('superpro_employees', JSON.stringify(data.employees));
                }
                
                if (data.clients) {
                    window.clients = data.clients;
                    sessionStorage.setItem('superpro_clients', JSON.stringify(data.clients));
                }

                // تحديث بقية البيانات
                Object.keys(data).forEach(key => {
                    if (data[key]) {
                        window[key] = data[key];
                        sessionStorage.setItem(`superpro_${key}`, JSON.stringify(data[key]));
                    }
                });

                // تحديث الواجهة
                if (typeof loadEmployees === 'function') loadEmployees();
                if (typeof loadClients === 'function') loadClients();
                if (typeof loadDashboard === 'function') loadDashboard();

                alert('✅ تم استرجاع البيانات من التخزين السحابي بنجاح!');
            } else {
                alert('❌ لا توجد بيانات محفوظة في التخزين السحابي');
            }
        } catch (error) {
            console.error('خطأ في الاسترجاع السحابي:', error);
            alert('❌ حدث خطأ أثناء استرجاع البيانات من التخزين السحابي');
        }
    }
}

// إنشاء نسخة عالمية
window.vercelFirebaseStorage = new VercelFirebaseStorage();

// دوال عالمية للاستخدام في HTML
window.saveToCloud = () => window.vercelFirebaseStorage.saveToCloud();
window.loadFromCloud = () => window.vercelFirebaseStorage.loadFromCloud();

console.log('تم تحميل نظام التخزين السحابي لـ Vercel');
