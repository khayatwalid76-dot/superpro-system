// استيراد البيانات الجديدة إلى النظام
function importAllData() {
    console.log('بدء استيراد البيانات...');
    
    try {
        // التحقق من وجود المتغيرات الأساسية
        if (typeof window.employees === 'undefined') {
            console.log('إنشاء متغير employees...');
            window.employees = [];
        }
        if (typeof window.clients === 'undefined') {
            console.log('إنشاء متغير clients...');
            window.clients = [];
        }
        
        const data = {
            "الموظفون": [
                {
                    "name": "khayat walid",
                    "idNumber": "29178801443",
                    "hireDate": "2025-09-01",
                    "nationality": "تونسي",
                    "job": " اداري",
                    "salary": "5000",
                    "phone": "33774995",
                    "status": "نشط",
                    "residencyExpiry": "2025-12-02",
                    "contractFileKey": "",
                    "contractFileName": "",
                    "joinDate": "2025-10-04"
                },
                {
                    "name": "Noraida Guiabal Tasil",
                    "idNumber": "",
                    "hireDate": "",
                    "nationality": "فلبيني",
                    "job": "cleaner",
                    "salary": "1900",
                    "phone": "71268393",
                    "status": "نشط",
                    "residencyExpiry": "",
                    "contractFileKey": "",
                    "contractFileName": "",
                    "joinDate": "2026-01-11"
                }
            ],
            "العملاء": [
                {
                    "name": "LULU OTHMAN",
                    "phone": "50317241",
                    "email": "LULU OTHMAN",
                    "service": "تنظيف",
                    "joinDate": "2026-01-11"
                },
                {
                    "name": "OLD AIRPORT MATARQADEEM JANET",
                    "phone": "55423537",
                    "email": "OLD AIRPORT",
                    "service": "تنظيف",
                    "joinDate": "2026-01-11"
                }
            ]
        };

        console.log('البيانات جاهزة للاستيراد:', data);

        // استيراد الموظفين
        if (data.الموظفون && data.الموظفون.length > 0) {
            window.employees = [...window.employees, ...data.الموظفون];
            console.log(`تم إضافة ${data.الموظفون.length} موظف جديد`);
            console.log('إجمالي الموظفين:', window.employees.length);
        }

        // استيراد العملاء
        if (data.العملاء && data.العملاء.length > 0) {
            window.clients = [...window.clients, ...data.العملاء];
            console.log(`تم إضافة ${data.العملاء.length} عميل جديد`);
            console.log('إجمالي العملاء:', window.clients.length);
        }

        // حفظ البيانات باستخدام sessionStorage مباشرة
        try {
            sessionStorage.setItem('superpro_employees', JSON.stringify(window.employees));
            sessionStorage.setItem('superpro_clients', JSON.stringify(window.clients));
            console.log('تم حفظ البيانات في sessionStorage');
        } catch (saveError) {
            console.error('خطأ في حفظ البيانات:', saveError);
        }
        
        // إظهار رسالة نجاح
        if (typeof showToast === 'function') {
            showToast('تم استيراد البيانات بنجاح!', 'success');
        } else {
            alert('تم استيراد البيانات بنجاح!');
        }
        
        // تحديث الواجهة
        if (typeof loadEmployees === 'function') {
            loadEmployees();
        }
        if (typeof loadClients === 'function') {
            loadClients();
        }
        if (typeof loadDashboard === 'function') {
            loadDashboard();
        }
        
        console.log('اكتمل استيراد البيانات بنجاح');
        
    } catch (error) {
        console.error('خطأ في استيراد البيانات:', error);
        if (typeof showToast === 'function') {
            showToast('حدث خطأ أثناء استيراد البيانات: ' + error.message, 'error');
        } else {
            alert('حدث خطأ أثناء استيراد البيانات: ' + error.message);
        }
    }
}

// تشغيل الاستيراد تلقائياً عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // إضافة زر الاستيراد للواجهة
    setTimeout(() => {
        const settingsSection = document.querySelector('.settings-section');
        if (settingsSection) {
            const importButton = `
                <div class="mb-3">
                    <h6>استيراد البيانات</h6>
                    <button class="btn btn-warning btn-sm" onclick="importAllData()">
                        <i class="fas fa-file-import"></i> استيراد البيانات الجديدة
                    </button>
                </div>
            `;
            settingsSection.insertAdjacentHTML('afterbegin', importButton);
        }
    }, 2000);
});
