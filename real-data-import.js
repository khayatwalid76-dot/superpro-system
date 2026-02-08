// استيراد بياناتك الحقيقية والكاملة
function realDataImport() {
    console.log('=== بدء استيراد بياناتك الحقيقية والكاملة ===');
    
    try {
        // مسح كل شيء
        sessionStorage.clear();
        localStorage.clear();
        console.log('✅ تم مسح جميع التخزين');
        
        // بياناتك الحقيقية والكاملة
        const realEmployees = [
            {"name": "khayat walid", "idNumber": "29178801443", "hireDate": "2025-09-01", "nationality": "تونسي", "job": " اداري", "salary": "5000", "phone": "33774995", "status": "نشط", "residencyExpiry": "2025-12-02", "contractFileKey": "", "contractFileName": "", "joinDate": "2025-10-04"},
            {"name": "Noraida Guiabal Tasil", "idNumber": "", "hireDate": "", "nationality": "فلبيني", "job": "cleaner", "salary": "1900", "phone": "71268393", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "VERONICAH NJERI WAIRIMU", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1500", "phone": "50630148", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "JANET MORAA DENGE", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1300", "phone": "52008532", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Stella Kasendo waweru", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1300", "phone": "31178124", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Teresia Nduta Kiiru", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1200", "phone": "77508122", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "SALLY ROBINA KEPHA", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1200", "phone": "33100743", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Maureen Juma", "idNumber": "51392817", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1200", "phone": "", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Consolata Mumua Kyalo", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1200", "phone": "66870854", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "VANE NYABOKE OGEGA", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1200", "phone": "52045730", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "SHAMIMO MOHAMED MNYONJE", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1200", "phone": "72231316", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Sharon Wairimu", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1200", "phone": "52082770", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "LUCILLE LINGASA CALIZA", "idNumber": "", "hireDate": "", "nationality": "فلبيني", "job": "cleaner", "salary": "1800", "phone": "66539377", "status": "نشط", "residencyExpiry": "2026-01-26", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Jane Moraa", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1100", "phone": "", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Lenet Wanjiku", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1200", "phone": "30668422", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Sharon Chepchumba", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "+254720240082", "salary": "1200", "phone": "", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Felista njoki karanja", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1100", "phone": "+254797416968", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Emily  Atieno okumu", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1100", "phone": "+254768288804", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "HANNAH NGUGI", "idNumber": "", "hireDate": "", "nationality": "كيني", "job": "cleaner", "salary": "1100", "phone": "33603701", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Raquel Dumaguin Borado", "idNumber": "", "hireDate": "", "nationality": "فلبيني", "job": "cleaner", "salary": "1900", "phone": "51180973", "status": "نشط", "residencyExpiry": "2026-01-22", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "rim sekri", "idNumber": "27678800525", "hireDate": "", "nationality": "تونسي", "job": "supervisor", "salary": "3500", "phone": "50837215", "status": "نشط", "residencyExpiry": "2026-09-09", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Joan Habiling", "idNumber": "28260831891", "hireDate": "", "nationality": "فلبيني", "job": "supervisor", "salary": "2100", "phone": "77409524", "status": "نشط", "residencyExpiry": "2026-02-06", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "OUSSEMA BOUGRARA", "idNumber": "29378800856", "hireDate": "", "nationality": "تونسي", "job": "driver", "salary": "3500", "phone": "72030055", "status": "نشط", "residencyExpiry": "2026-05-26", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Ruby Emman Guquib", "idNumber": "", "hireDate": "", "nationality": "فلبيني", "job": "cleaner", "salary": "1800", "phone": "50052941", "status": "نشط", "residencyExpiry": "2026-06-15", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Amera Wagia Inso", "idNumber": "", "hireDate": "", "nationality": "فلبيني", "job": "cleaner", "salary": "1800", "phone": "33359360", "status": "نشط", "residencyExpiry": "2025-10-26", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "Carmen Cardinal Apuli", "idNumber": "", "hireDate": "", "nationality": "فلبيني", "job": "cleaner", "salary": "1800", "phone": "51096993", "status": "نشط", "residencyExpiry": "2025-10-27", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "AZER", "idNumber": "", "hireDate": "", "nationality": "تونسي", "job": "driver", "salary": "3000", "phone": "60071328", "status": "نشط", "residencyExpiry": "", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "LIEZL ANN PAET CASTILLANES", "idNumber": "", "hireDate": "", "nationality": "فلبيني", "job": "cleaner", "salary": "1800", "phone": "66822158", "status": "نشط", "residencyExpiry": "2026-08-04", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "FLORENCE STA MARIA LOPEZ", "idNumber": "", "hireDate": "", "nationality": "فلبيني", "job": "cleaner", "salary": "1800", "phone": "50631062", "status": "نشط", "residencyExpiry": "2026-05-03", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "DARLING QUINONES OMAPOSY", "idNumber": "", "hireDate": "", "nationality": "فلبيني", "job": "cleaner", "salary": "1800", "phone": "55893397", "status": "نشط", "residencyExpiry": "2025-12-06", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "ANALIZA PANCHO MERCADO", "idNumber": "28560832077", "hireDate": "", "nationality": "فلبيني", "job": "cleaner", "salary": "1900", "phone": "66171502", "status": "نشط", "residencyExpiry": "2025-10-31", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-11"},
            {"name": "DAYAN FIRME AMPARADO", "idNumber": "", "hireDate": "", "nationality": "فلبيني", "job": "cleaner", "salary": "1800", "phone": "77635403", "status": "نشط", "residencyExpiry": "2026-09-18", "gender": "أنثى", "contractFileKey": "", "contractFileName": "", "joinDate": "2026-01-13"},
            {"name": "Monicah Muthoni Waithera", "idNumber": "", "hireDate": "2026-01-13", "nationality": "كيني", "job": "CLEANER", "salary": "1100", "phone": "", "status": "نشط", "residencyExpiry": "", "gender": "أنثى", "joinDate": "2026-01-18"}
        ];
        
        const realClients = [
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
            {"name": "DOUA AHMED", "phone": "77949420", "email": "DOUA AHMED", "service": "تنظيف", "joinDate": "2026-01-11", "area": "MARKHIYA", "lastWorkDate": "2026-01-22"},
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
        
        // حفظ البيانات
        sessionStorage.setItem('superpro_employees', JSON.stringify(realEmployees));
        sessionStorage.setItem('superpro_clients', JSON.stringify(realClients));
        
        // فرض المتغيرات العالمية
        window.employees = realEmployees;
        window.clients = realClients;
        
        // فرض المتغيرات المحلية
        if (typeof employees !== 'undefined') {
            employees.length = 0;
            employees.push(...realEmployees);
        }
        if (typeof clients !== 'undefined') {
            clients.length = 0;
            clients.push(...realClients);
        }
        
        console.log('✅ تم حفظ بياناتك الحقيقية:');
        console.log('الموظفون:', realEmployees.length);
        console.log('العملاء:', realClients.length);
        
        // تحديث الواجهة فوراً
        setTimeout(() => {
            // الذهاب لصفحة الموظفين
            const employeesLink = document.querySelector('a[href="#employees"]');
            if (employeesLink) {
                employeesLink.click();
            }
            
            // تحديث جدول الموظفين مباشرة
            const tbody = document.getElementById('employees-table-body');
            if (tbody) {
                tbody.innerHTML = '';
                realEmployees.forEach((emp, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>
                            <div class="d-flex align-items-center">
                                <div class="employee-avatar me-3">${emp.name.charAt(0)}</div>
                                <div>
                                    <h6 class="mb-1">${emp.name}</h6>
                                    <small class="text-muted">${emp.job}</small>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="employee-info-item">
                                <i class="fas fa-flag"></i>
                                <span>${emp.nationality}</span>
                            </div>
                            <div class="employee-info-item">
                                <i class="fas fa-phone"></i>
                                <span>${emp.phone || 'لا يوجد'}</span>
                            </div>
                        </td>
                        <td>${emp.salary}</td>
                        <td><span class="badge bg-success">${emp.status}</span></td>
                        <td>
                            <button class="btn btn-sm btn-info" onclick="editEmployee(${index})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteEmployee(${index})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
                console.log('✅ تم تحديث جدول الموظفين مباشرة');
            }
            
            // تحديث الإحصائيات
            if (typeof updateEmployeeStats === 'function') {
                updateEmployeeStats();
            }
            
            // التحقق النهائي
            setTimeout(() => {
                const rows = document.querySelectorAll('#employees-table-body tr');
                console.log('🎯 النتيجة النهائية:');
                console.log('الموظفون في الجدول:', rows.length);
                console.log('الموظفون في المتغير:', window.employees.length);
                
                alert(`🎯 تم استيراد بياناتك الحقيقية بنجاح!\n\n👥 الموظفون: ${rows.length}\n👤 العملاء: ${realClients.length}\n\n✅ بياناتك الكاملة والصحيحة!`);
            }, 500);
        }, 500);
        
    } catch (error) {
        console.error('❌ خطأ في استيراد بياناتك الحقيقية:', error);
        alert('❌ حدث خطأ: ' + error.message);
    }
}

// إضافة زر استيراد بياناتك الحقيقية
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        let settingsSection = document.querySelector('.settings-section') || document.getElementById('settings');
        
        if (settingsSection) {
            const realButton = `
                <div class="mb-3">
                    <h6>بياناتي الحقيقية والكاملة</h6>
                    <button class="btn btn-success btn-sm me-2" onclick="realDataImport()">
                        <i class="fas fa-database"></i> استيراد بياناتي الحقيقية
                    </button>
                    <small class="text-muted">بياناتك الكاملة والصحيحة (33 موظف)</small>
                </div>
            `;
            settingsSection.insertAdjacentHTML('afterbegin', realButton);
            console.log('✅ تم إضافة زر بياناتك الحقيقية');
        }
    }, 3000);
});
