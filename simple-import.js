// استيراد بسيط ومباشر للبيانات
function simpleImportData() {
    console.log('=== بدء الاستيراد البسيط ===');
    
    try {
        // إنشاء البيانات
        const newEmployees = [
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
        ];
        
        const newClients = [
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
        ];
        
        // استيراد الموظفين
        let currentEmployees = [];
        try {
            const saved = sessionStorage.getItem('superpro_employees');
            if (saved) {
                currentEmployees = JSON.parse(saved);
            }
        } catch (e) {
            console.log('لا توجد بيانات موظفين سابقة');
        }
        
        const allEmployees = [...currentEmployees, ...newEmployees];
        sessionStorage.setItem('superpro_employees', JSON.stringify(allEmployees));
        console.log(`✅ تم إضافة ${newEmployees.length} موظف جديد`);
        console.log('إجمالي الموظفين:', allEmployees.length);
        
        // استيراد العملاء
        let currentClients = [];
        try {
            const saved = sessionStorage.getItem('superpro_clients');
            if (saved) {
                currentClients = JSON.parse(saved);
            }
        } catch (e) {
            console.log('لا توجد بيانات عملاء سابقة');
        }
        
        const allClients = [...currentClients, ...newClients];
        sessionStorage.setItem('superpro_clients', JSON.stringify(allClients));
        console.log(`✅ تم إضافة ${newClients.length} عميل جديد`);
        console.log('إجمالي العملاء:', allClients.length);
        
        // تحديث المتغيرات العالمية
        window.employees = allEmployees;
        window.clients = allClients;
        
        // تحديث الواجهة مباشرة
        if (typeof loadEmployees === 'function') {
            loadEmployees();
            console.log('✅ تم تحديث قائمة الموظفين');
        }
        
        if (typeof loadClients === 'function') {
            loadClients();
            console.log('✅ تم تحديث قائمة العملاء');
        }
        
        if (typeof loadDashboard === 'function') {
            loadDashboard();
            console.log('✅ تم تحديث لوحة التحكم');
        }
        
        // رسالة نجاح
        alert('✅ تم استيراد البيانات بنجاح!\n\nالموظفون: ' + allEmployees.length + '\nالعملاء: ' + allClients.length + '\n\nتم تحديث الواجهة بنجاح!');
        
        console.log('=== اكتمل الاستيراد بنجاح ===');
        
    } catch (error) {
        console.error('❌ خطأ في الاستيراد:', error);
        alert('❌ حدث خطأ: ' + error.message);
    }
}

// إضافة زر بديل
document.addEventListener('DOMContentLoaded', function() {
    console.log('تحميل simple-import.js...');
    
    setTimeout(() => {
        // البحث عن قسم الإعدادات بطرق مختلفة
        let settingsSection = document.querySelector('.settings-section');
        
        if (!settingsSection) {
            // البحث عن الـ ID
            settingsSection = document.getElementById('settings');
            console.log('البحث باستخدام ID:', settingsSection);
        }
        
        if (!settingsSection) {
            // البحث عن أي عنصر يحتوي على الإعدادات
            const allDivs = document.querySelectorAll('div');
            for (let div of allDivs) {
                if (div.textContent && div.textContent.includes('الإعدادات')) {
                    settingsSection = div;
                    console.log('البحث باستخدام النص:', settingsSection);
                    break;
                }
            }
        }
        
        if (settingsSection) {
            const simpleButton = `
                <div class="mb-3">
                    <h6>استيراد سريع</h6>
                    <button class="btn btn-success btn-sm" onclick="simpleImportData()">
                        <i class="fas fa-download"></i> استيراد البيانات (بسيط)
                    </button>
                </div>
            `;
            settingsSection.insertAdjacentHTML('afterbegin', simpleButton);
            console.log('✅ تم إضافة الزر الأخضر بنجاح');
        } else {
            console.error('❌ لم يتم العثور على قسم الإعدادات');
            // إضافة الزر في نهاية body كخيار أخير
            document.body.insertAdjacentHTML('beforeend', `
                <div style="position: fixed; top: 10px; right: 10px; z-index: 9999;">
                    <button class="btn btn-success btn-sm" onclick="simpleImportData()">
                        <i class="fas fa-download"></i> استيراد البيانات
                    </button>
                </div>
            `);
            console.log('✅ تم إضافة الزر في الزاوية العلوية');
        }
    }, 3000);
});
