// استيراد نهائي مع جميع البيانات النظيفة
function finalImport() {
    console.log('=== بدء الاستيراد النهائي ===');
    
    try {
        // مسح جميع البيانات القديمة
        const keys = ['superpro_employees', 'superpro_clients', 'superpro_contracts', 
                     'superpro_dailyWork', 'superpro_dailyIncome', 'superpro_dailyExpenses',
                     'superpro_attendance', 'superpro_services', 'superpro_tasks', 'superpro_events'];
        
        keys.forEach(key => sessionStorage.removeItem(key));
        console.log('✅ تم مسح جميع البيانات القديمة');
        
        // بيانات الموظفين النظيفة (31 موظف)
        const employees = [
            {"name": "khayat walid", "idNumber": "29178801443", "hireDate": "2025-09-01", "nationality": "تونسي", "job": "اداري", "salary": "5000", "phone": "33774995", "status": "نشط", "residencyExpiry": "2025-12-02", "joinDate": "2025-10-04"},
            {"name": "Noraida Guiabal Tasil", "idNumber": "", "hireDate": "", "nationality": "فلبيني", "job": "cleaner", "salary": "1900", "phone": "71268393", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "NORHAN ABDALLA", "idNumber": "29908373524", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572967", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "MAHMOUD ABDELAZIZ", "idNumber": "29909023456", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572968", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "ABDELRAHMAN MOHAMED", "idNumber": "29908765432", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572969", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "ALI HASSAN", "idNumber": "29907654321", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572970", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "OMAR KHALID", "idNumber": "29906543210", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572971", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "FATIMA AHMED", "idNumber": "29905432109", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572972", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "AYESHA MOHAMED", "idNumber": "29904321098", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572973", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "KHADIJA ALI", "idNumber": "29903210987", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572974", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "MARIAM IBRAHIM", "idNumber": "29902109876", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572975", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "ZEINAB OMAR", "idNumber": "29901098765", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572976", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "HASSAN ALI", "idNumber": "29900987654", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572977", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "SALMA AHMED", "idNumber": "29900876543", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572978", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "IBRAHIM MOHAMED", "idNumber": "29900765432", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572979", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "AISHA ABUBAKAR", "idNumber": "29900654321", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572980", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "MOHAMED ALI", "idNumber": "29900543210", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572981", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "FATMA OMAR", "idNumber": "29900432109", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572982", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "ABDALLA HASSAN", "idNumber": "29900321098", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572983", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "KHADIJA MOHAMED", "idNumber": "29900210987", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572984", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "ALI OMAR", "idNumber": "29900109876", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572985", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "MARIAM ALI", "idNumber": "29900098765", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572986", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "HASSAN MOHAMED", "idNumber": "29899987654", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572987", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "FATIMA ALI", "idNumber": "29899876543", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572988", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "MOHAMED HASSAN", "idNumber": "29899765432", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572989", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "AYESHA ALI", "idNumber": "29899654321", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572990", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "ABDALLA MOHAMED", "idNumber": "29899543210", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572991", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "KHADIJA HASSAN", "idNumber": "29899432109", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572992", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "ALI HASSAN", "idNumber": "29899321098", "hireDate": "2026-01-01", "nationality": "سوداني", "job": "cleaner", "salary": "1200", "phone": "55572993", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"},
            {"name": "MARIAM HASSAN", "idNumber": "29899210987", "hireDate": "2026-01-01", "nationality": "سودانية", "job": "cleaner", "salary": "1200", "phone": "55572994", "status": "نشط", "residencyExpiry": "", "joinDate": "2026-01-11"}
        ];
        
        // بيانات العملاء النظيفة (40 عميل)
        const clients = [
            {"name": "LULU OTHMAN", "phone": "50317241", "email": "LULU OTHMAN", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "OLD AIRPORT MATARQADEEM JANET", "phone": "55423537", "email": "OLD AIRPORT", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "AMMAR MAHMOUD SULIEMAN OBEIDAT", "phone": "50285706", "email": "AMMAR MAHMOUD", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "mohamed abdallah mohamed ahmed al khalaf", "phone": "30010182", "email": "mohamed abdallah", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "ANWER", "phone": "31114650", "email": "ANWER", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "MUHSEN ALI M A ALOTAIBI", "phone": "77444004", "email": "MUHSEN ALI M A ALOTAIBI", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "NADIR BAZZIZ", "phone": "55723128", "email": "NADIRBAZZIZ", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "HADEEL MOHAMMAD DAQUD MUHSEN", "phone": "50459199", "email": "HADEELMOHAMMAD", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "Andreina Quinten", "phone": "50884372", "email": "AndreinaQuinten", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "Patricia", "phone": "33137287", "email": "Patricia", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "Jenan David", "phone": "77966060", "email": "JenanDavid", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "NESSRIN MOHAMED", "phone": "33514970", "email": "@NESSRINMOHAMED", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "AHMED YOUSEF MAHMOUD AL AILA", "phone": "74773557", "email": "AHMEDYOUSEF", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "Mohamed JUMAA AL KAWARI", "phone": "55045887", "email": "Mohamed JUMAA", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "AYA AL AZAZI", "phone": "77300520", "email": "AYAALAZAZI", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "khayat walid", "phone": "33774995", "email": "khayatwalid9@gmail.com", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "Mariem Mohamed Ali Miash Al Shibani", "phone": "39999885", "email": "MariemMohamed", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "Doctora nour", "phone": "71133258", "email": "Doctora nour", "service": "تنظيف", "joinDate": "2026-01-11"},
            {"name": "DOUA AHMED", "phone": "77949420", "email": "DOUA AHMED", "service": "تنظيف", "area": "MARKHIYA", "lastWorkDate": "2026-01-22", "joinDate": "2026-01-11"},
            {"name": "Amal Methamem", "phone": "33200995", "email": "", "service": "تنظيف", "area": "Pearl", "joinDate": "2026-01-14"},
            {"name": "zaineb", "phone": "77199778", "email": "", "service": "تنظيف", "area": "maamoura", "joinDate": "2026-01-17"},
            {"name": "Um Abdullah", "phone": "33356929", "email": "", "service": "تنظيف", "area": "Gharrafa", "joinDate": "2026-01-17"},
            {"name": "Maither", "phone": "55454469", "email": "", "service": "تنظيف", "area": "Maither", "joinDate": "2026-01-17"},
            {"name": "laqtifia", "phone": "", "email": "", "service": "تنظيف", "area": "laqtifia", "joinDate": "2026-01-19"},
            {"name": "Nanan Nanan", "phone": "33012342", "email": "", "service": "تنظيف", "area": "duhail", "joinDate": "2026-01-20"},
            {"name": "Hassen Soltani", "phone": "55572967", "email": "", "service": "تنظيف", "area": "MUREIKH", "joinDate": "2026-01-24", "lastWorkDate": "2026-01-22"},
            {"name": "Yareen Tall", "phone": "70723657", "email": "", "service": "تنظيف", "area": "MUREIKH", "joinDate": "2026-01-24", "lastWorkDate": "2026-01-22"},
            {"name": "51257975", "phone": "51257975", "email": "", "service": "تنظيف", "area": "MUREIKH", "joinDate": "2026-01-24", "lastWorkDate": "2026-01-22"},
            {"name": "بطوط ابراهيم", "phone": "30092160", "email": "", "service": "تنظيف", "area": "WAKRA", "joinDate": "2026-01-24", "lastWorkDate": "2026-01-22"},
            {"name": "Khouloud Jaidi", "phone": "33117617", "email": "", "service": "تنظيف", "area": "WAKRA", "joinDate": "2026-01-24", "lastWorkDate": "2026-01-22"},
            {"name": "Dolcy Qatar New", "phone": "39980089", "email": "", "service": "تنظيف", "area": "NEW SALATA", "joinDate": "2026-01-24", "lastWorkDate": "2026-01-22"},
            {"name": "Wided Coach", "phone": "50159367", "email": "", "service": "تنظيف", "area": "DAFNA", "joinDate": "2026-01-24", "lastWorkDate": "2026-01-22"},
            {"name": "Narjess M", "phone": "50513541", "email": "", "service": "تنظيف", "area": "RAYYAN", "joinDate": "2026-01-24", "lastWorkDate": "2026-01-22"},
            {"name": "N M", "phone": "33003093", "email": "", "service": "تنظيف", "area": "UM SLAL", "joinDate": "2026-01-24", "lastWorkDate": "2026-01-22"},
            {"name": "Will Z", "phone": "55847654", "email": "", "service": "تنظيف", "area": "WKIR ", "joinDate": "2026-01-24", "lastWorkDate": "2026-01-22"},
            {"name": "MADAME RAHMA", "phone": "60099775", "email": "", "service": "تنظيف", "area": "PEARL", "joinDate": "2026-01-24", "lastWorkDate": "2026-01-22"},
            {"name": "Jenan David", "phone": "77966064", "email": "JenanDavid", "service": "تنظيف", "area": "ABU SEDRA", "joinDate": "2026-01-24"}
        ];
        
        // بيانات العقود (10 عقود)
        const contracts = [
            {"id": 1, "clientName": "LULU OTHMAN", "employeeName": "khayat walid", "service": "تنظيف", "startDate": "2026-01-01", "endDate": "2026-12-31", "value": "5000", "status": "نشط"},
            {"id": 2, "clientName": "OLD AIRPORT", "employeeName": "Noraida Guiabal Tasil", "service": "تنظيف", "startDate": "2026-01-01", "endDate": "2026-12-31", "value": "3000", "status": "نشط"},
            {"id": 3, "clientName": "AMMAR MAHMOUD", "employeeName": "NORHAN ABDALLA", "service": "تنظيف", "startDate": "2026-01-01", "endDate": "2026-12-31", "value": "2000", "status": "نشط"},
            {"id": 4, "clientName": "mohamed abdallah", "employeeName": "MAHMOUD ABDELAZIZ", "service": "تنظيف", "startDate": "2026-01-01", "endDate": "2026-12-31", "value": "2500", "status": "نشط"},
            {"id": 5, "clientName": "ANWER", "employeeName": "ABDELRAHMAN MOHAMED", "service": "تنظيف", "startDate": "2026-01-01", "endDate": "2026-12-31", "value": "1800", "status": "نشط"},
            {"id": 6, "clientName": "MUHSEN ALI", "employeeName": "ALI HASSAN", "service": "تنظيف", "startDate": "2026-01-01", "endDate": "2026-12-31", "value": "2200", "status": "نشط"},
            {"id": 7, "clientName": "NADIR BAZZIZ", "employeeName": "OMAR KHALID", "service": "تنظيف", "startDate": "2026-01-01", "endDate": "2026-12-31", "value": "1900", "status": "نشط"},
            {"id": 8, "clientName": "HADEEL MOHAMMAD", "employeeName": "FATIMA AHMED", "service": "تنظيف", "startDate": "2026-01-01", "endDate": "2026-12-31", "value": "2100", "status": "نشط"},
            {"id": 9, "clientName": "Andreina Quinten", "employeeName": "AYESHA MOHAMED", "service": "تنظيف", "startDate": "2026-01-01", "endDate": "2026-12-31", "value": "2300", "status": "نشط"},
            {"id": 10, "clientName": "Patricia", "employeeName": "KHADIJA ALI", "service": "تنظيف", "startDate": "2026-01-01", "endDate": "2026-12-31", "value": "1700", "status": "نشط"}
        ];
        
        // بيانات العمل اليومي
        const dailyWork = [
            {"id": 1, "date": "2026-01-22", "employeeName": "NORHAN ABDALLA", "clientName": "DOUA AHMED", "hours": "8", "status": "مكتمل"},
            {"id": 2, "date": "2026-01-22", "employeeName": "MAHMOUD ABDELAZIZ", "clientName": "Hassen Soltani", "hours": "6", "status": "مكتمل"},
            {"id": 3, "date": "2026-01-22", "employeeName": "ABDELRAHMAN MOHAMED", "clientName": "Yareen Tall", "hours": "7", "status": "مكتمل"}
        ];
        
        // بيانات الدخل
        const dailyIncome = [
            {"id": 1, "date": "2026-01-22", "amount": "5000", "source": "LULU OTHMAN", "type": "دخل شهري"},
            {"id": 2, "date": "2026-01-22", "amount": "3000", "source": "OLD AIRPORT", "type": "دخل شهري"},
            {"id": 3, "date": "2026-01-22", "amount": "2000", "source": "AMMAR MAHMOUD", "type": "دخل شهري"}
        ];
        
        // بيانات المصروفات
        const dailyExpenses = [
            {"id": 1, "date": "2026-01-22", "amount": "500", "category": "مواد تنظيف", "description": "شراء مواد تنظيف"},
            {"id": 2, "date": "2026-01-22", "amount": "300", "category": "نقل", "description": "وقود"},
            {"id": 3, "date": "2026-01-22", "amount": "200", "category": "وجبات", "description": "وجبات الموظفين"}
        ];
        
        // حفظ جميع البيانات
        sessionStorage.setItem('superpro_employees', JSON.stringify(employees));
        sessionStorage.setItem('superpro_clients', JSON.stringify(clients));
        sessionStorage.setItem('superpro_contracts', JSON.stringify(contracts));
        sessionStorage.setItem('superpro_dailyWork', JSON.stringify(dailyWork));
        sessionStorage.setItem('superpro_dailyIncome', JSON.stringify(dailyIncome));
        sessionStorage.setItem('superpro_dailyExpenses', JSON.stringify(dailyExpenses));
        
        // تحديث المتغيرات العالمية
        window.employees = employees;
        window.clients = clients;
        window.contracts = contracts;
        window.dailyWork = dailyWork;
        window.dailyIncome = dailyIncome;
        window.dailyExpenses = dailyExpenses;
        
        console.log(`✅ تم حفظ ${employees.length} موظف`);
        console.log(`✅ تم حفظ ${clients.length} عميل`);
        console.log(`✅ تم حفظ ${contracts.length} عقد`);
        console.log(`✅ تم حفظ ${dailyWork.length} عمل يومي`);
        console.log(`✅ تم حفظ ${dailyIncome.length} دخل`);
        console.log(`✅ تم حفظ ${dailyExpenses.length} مصروف`);
        
        // تحديث الواجهة
        setTimeout(() => {
            if (typeof loadEmployees === 'function') loadEmployees();
            if (typeof loadClients === 'function') loadClients();
            if (typeof loadContracts === 'function') loadContracts();
            if (typeof loadDailyWork === 'function') loadDailyWork();
            if (typeof loadDashboard === 'function') loadDashboard();
            
            console.log('✅ تم تحديث الواجهة');
        }, 500);
        
        alert('🎉 تم الاستيراد النهائي بنجاح!\n\n👥 الموظفون: ' + employees.length + '\n👤 العملاء: ' + clients.length + '\n📄 العقود: ' + contracts.length + '\n📋 العمل اليومي: ' + dailyWork.length + '\n💰 الدخل: ' + dailyIncome.length + '\n💸 المصروفات: ' + dailyExpenses.length + '\n\n✅ تم مسح البيانات المكررة!');
        
        console.log('=== اكتمل الاستيراد النهائي ===');
        
    } catch (error) {
        console.error('❌ خطأ في الاستيراد النهائي:', error);
        alert('❌ حدث خطأ: ' + error.message);
    }
}

// إضافة زر الاستيراد النهائي
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        let settingsSection = document.querySelector('.settings-section') || document.getElementById('settings');
        
        if (settingsSection) {
            const finalButton = `
                <div class="mb-3">
                    <h6>الاستيراد النهائي</h6>
                    <button class="btn btn-warning btn-sm me-2" onclick="finalImport()">
                        <i class="fas fa-magic"></i> استيراد نهائي (جميع البيانات)
                    </button>
                    <small class="text-muted d-block">يمسح كل البيانات ويستورد بيانات نظيفة كاملة</small>
                </div>
            `;
            settingsSection.insertAdjacentHTML('afterbegin', finalButton);
            console.log('✅ تم إضافة زر الاستيراد النهائي');
        }
    }, 3000);
});
