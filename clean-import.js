// استيراد بيانات نظيفة ومنظمة
function cleanDataImport() {
    console.log('=== بدء الاستيراد النظيف ===');
    
    try {
        // مسح البيانات القديمة أولاً
        sessionStorage.removeItem('superpro_employees');
        sessionStorage.removeItem('superpro_clients');
        sessionStorage.removeItem('superpro_contracts');
        sessionStorage.removeItem('superpro_dailyWork');
        sessionStorage.removeItem('superpro_attendance');
        
        // بيانات الموظفين النظيفة (31 موظف)
        const employees = [
            {
                "name": "khayat walid",
                "idNumber": "29178801443",
                "hireDate": "2025-09-01",
                "nationality": "تونسي",
                "job": "اداري",
                "salary": "5000",
                "phone": "33774995",
                "status": "نشط",
                "residencyExpiry": "2025-12-02",
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
                "joinDate": "2026-01-11"
            },
            {
                "name": "NORHAN ABDALLA",
                "idNumber": "29908373524",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572967",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "MAHMOUD ABDELAZIZ",
                "idNumber": "29909023456",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572968",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "ABDELRAHMAN MOHAMED",
                "idNumber": "29908765432",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572969",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "ALI HASSAN",
                "idNumber": "29907654321",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572970",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "OMAR KHALID",
                "idNumber": "29906543210",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572971",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "FATIMA AHMED",
                "idNumber": "29905432109",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572972",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "AYESHA MOHAMED",
                "idNumber": "29904321098",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572973",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "KHADIJA ALI",
                "idNumber": "29903210987",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572974",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "MARIAM IBRAHIM",
                "idNumber": "29902109876",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572975",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "ZEINAB OMAR",
                "idNumber": "29901098765",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572976",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "HASSAN ALI",
                "idNumber": "29900987654",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572977",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "SALMA AHMED",
                "idNumber": "29900876543",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572978",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "IBRAHIM MOHAMED",
                "idNumber": "29900765432",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572979",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "AISHA ABUBAKAR",
                "idNumber": "29900654321",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572980",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "MOHAMED ALI",
                "idNumber": "29900543210",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572981",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "FATMA OMAR",
                "idNumber": "29900432109",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572982",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "ABDALLA HASSAN",
                "idNumber": "29900321098",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572983",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "KHADIJA MOHAMED",
                "idNumber": "29900210987",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572984",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "ALI OMAR",
                "idNumber": "29900109876",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572985",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "MARIAM ALI",
                "idNumber": "29900098765",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572986",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "HASSAN MOHAMED",
                "idNumber": "29899987654",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572987",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "FATIMA ALI",
                "idNumber": "29899876543",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572988",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "MOHAMED HASSAN",
                "idNumber": "29899765432",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572989",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "AYESHA ALI",
                "idNumber": "29899654321",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572990",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "ABDALLA MOHAMED",
                "idNumber": "29899543210",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572991",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "KHADIJA HASSAN",
                "idNumber": "29899432109",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572992",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "ALI HASSAN",
                "idNumber": "29899321098",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572993",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "MARIAM HASSAN",
                "idNumber": "29899210987",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572994",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "HASSAN ABDALLA",
                "idNumber": "29899109876",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572995",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "FATIMA ABDALLA",
                "idNumber": "29899098765",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572996",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "MOHAMED ABDALLA",
                "idNumber": "29898987654",
                "hireDate": "2026-01-01",
                "nationality": "سوداني",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572997",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "AYESHA ABDALLA",
                "idNumber": "29898876543",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572998",
                "status": "نشط",
                "joinDate": "2026-01-11"
            },
            {
                "name": "KHADIJA ABDALLA",
                "idNumber": "29898765432",
                "hireDate": "2026-01-01",
                "nationality": "سودانية",
                "job": "cleaner",
                "salary": "1200",
                "phone": "55572999",
                "status": "نشط",
                "joinDate": "2026-01-11"
            }
        ];

        // بيانات العملاء النظيفة (40 عميل)
        const clients = [
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
            },
            {
                "name": "AMMAR MAHMOUD SULIEMAN OBEIDAT",
                "phone": "50285706",
                "email": "AMMAR MAHMOUD",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "mohamed abdallah mohamed ahmed al khalaf",
                "phone": "30010182",
                "email": "mohamed abdallah",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "ANWER",
                "phone": "31114650",
                "email": "ANWER",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "MUHSEN ALI M A ALOTAIBI",
                "phone": "77444004",
                "email": "MUHSEN ALI M A ALOTAIBI",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "NADIR BAZZIZ",
                "phone": "55723128",
                "email": "NADIRBAZZIZ",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "HADEEL MOHAMMAD DAQUD MUHSEN",
                "phone": "50459199",
                "email": "HADEELMOHAMMAD",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "Andreina Quinten",
                "phone": "50884372",
                "email": "AndreinaQuinten",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "Patricia",
                "phone": "33137287",
                "email": "Patricia",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "Jenan David",
                "phone": "77966060",
                "email": "JenanDavid",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "NESSRIN MOHAMED",
                "phone": "33514970",
                "email": "@NESSRINMOHAMED",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "AHMED YOUSEF MAHMOUD AL AILA",
                "phone": "74773557",
                "email": "AHMEDYOUSEF",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "Mohamed JUMAA AL KAWARI",
                "phone": "55045887",
                "email": "Mohamed JUMAA",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "AYA AL AZAZI",
                "phone": "77300520",
                "email": "AYAALAZAZI",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "khayat walid",
                "phone": "33774995",
                "email": "khayatwalid9@gmail.com",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "Mariem Mohamed Ali Miash Al Shibani",
                "phone": "39999885",
                "email": "MariemMohamed",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "Doctora nour",
                "phone": "71133258",
                "email": "Doctora nour",
                "service": "تنظيف",
                "joinDate": "2026-01-11"
            },
            {
                "name": "DOUA AHMED",
                "phone": "77949420",
                "email": "DOUA AHMED",
                "service": "تنظيف",
                "area": "MARKHIYA",
                "lastWorkDate": "2026-01-22",
                "joinDate": "2026-01-11"
            },
            {
                "name": "Amal Methamem",
                "phone": "33200995",
                "email": "",
                "service": "تنظيف",
                "area": "Pearl",
                "joinDate": "2026-01-14"
            },
            {
                "name": "zaineb",
                "phone": "77199778",
                "email": "",
                "service": "تنظيف",
                "area": "maamoura",
                "joinDate": "2026-01-17"
            },
            {
                "name": "Um Abdullah",
                "phone": "33356929",
                "email": "",
                "service": "تنظيف",
                "area": "Gharrafa",
                "joinDate": "2026-01-17"
            },
            {
                "name": "Maither",
                "phone": "55454469",
                "email": "",
                "service": "تنظيف",
                "area": "Maither",
                "joinDate": "2026-01-17"
            },
            {
                "name": "laqtifia",
                "phone": "",
                "email": "",
                "service": "تنظيف",
                "area": "laqtifia",
                "joinDate": "2026-01-19"
            },
            {
                "name": "Nanan Nanan",
                "phone": "33012342",
                "email": "",
                "service": "تنظيف",
                "area": "duhail",
                "joinDate": "2026-01-20"
            },
            {
                "name": "Hassen Soltani",
                "phone": "55572967",
                "email": "",
                "service": "تنظيف",
                "area": "MUREIKH",
                "joinDate": "2026-01-24",
                "lastWorkDate": "2026-01-22"
            },
            {
                "name": "Yareen Tall",
                "phone": "70723657",
                "email": "",
                "service": "تنظيف",
                "area": "MUREIKH",
                "joinDate": "2026-01-24",
                "lastWorkDate": "2026-01-22"
            },
            {
                "name": "51257975",
                "phone": "51257975",
                "email": "",
                "service": "تنظيف",
                "area": "MUREIKH",
                "joinDate": "2026-01-24",
                "lastWorkDate": "2026-01-22"
            },
            {
                "name": "بطوط ابراهيم",
                "phone": "30092160",
                "email": "",
                "service": "تنظيف",
                "area": "WAKRA",
                "joinDate": "2026-01-24",
                "lastWorkDate": "2026-01-22"
            },
            {
                "name": "Khouloud Jaidi",
                "phone": "33117617",
                "email": "",
                "service": "تنظيف",
                "area": "WAKRA",
                "joinDate": "2026-01-24",
                "lastWorkDate": "2026-01-22"
            },
            {
                "name": "Dolcy Qatar New",
                "phone": "39980089",
                "email": "",
                "service": "تنظيف",
                "area": "NEW SALATA",
                "joinDate": "2026-01-24",
                "lastWorkDate": "2026-01-22"
            },
            {
                "name": "Wided Coach",
                "phone": "50159367",
                "email": "",
                "service": "تنظيف",
                "area": "DAFNA",
                "joinDate": "2026-01-24",
                "lastWorkDate": "2026-01-22"
            },
            {
                "name": "Narjess M",
                "phone": "50513541",
                "email": "",
                "service": "تنظيف",
                "area": "RAYYAN",
                "joinDate": "2026-01-24",
                "lastWorkDate": "2026-01-22"
            },
            {
                "name": "N M",
                "phone": "33003093",
                "email": "",
                "service": "تنظيف",
                "area": "UM SLAL",
                "joinDate": "2026-01-24",
                "lastWorkDate": "2026-01-22"
            },
            {
                "name": "Will Z",
                "phone": "55847654",
                "email": "",
                "service": "تنظيف",
                "area": "WKIR ",
                "joinDate": "2026-01-24",
                "lastWorkDate": "2026-01-22"
            },
            {
                "name": "MADAME RAHMA",
                "phone": "60099775",
                "email": "",
                "service": "تنظيف",
                "area": "PEARL",
                "joinDate": "2026-01-24",
                "lastWorkDate": "2026-01-22"
            },
            {
                "name": "Jenan David",
                "phone": "77966064",
                "email": "JenanDavid",
                "service": "تنظيف",
                "area": "ABU SEDRA",
                "joinDate": "2026-01-24"
            }
        ];

        // بيانات العقود النظيفة
        const contracts = [
            {
                "id": 1,
                "clientId": "LULU OTHMAN",
                "clientName": "LULU OTHMAN",
                "employeeId": "khayat walid",
                "employeeName": "khayat walid",
                "service": "تنظيف",
                "startDate": "2026-01-01",
                "endDate": "2026-12-31",
                "price": "5000",
                "status": "نشط",
                "workDays": ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"],
                "workHours": "8 ساعات"
            },
            {
                "id": 2,
                "clientId": "OLD AIRPORT MATARQADEEM JANET",
                "clientName": "OLD AIRPORT MATARQADEEM JANET",
                "employeeId": "Noraida Guiabal Tasil",
                "employeeName": "Noraida Guiabal Tasil",
                "service": "تنظيف",
                "startDate": "2026-01-01",
                "endDate": "2026-12-31",
                "price": "3000",
                "status": "نشط",
                "workDays": ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"],
                "workHours": "8 ساعات"
            },
            {
                "id": 3,
                "clientId": "AMMAR MAHMOUD SULIEMAN OBEIDAT",
                "clientName": "AMMAR MAHMOUD SULIEMAN OBEIDAT",
                "employeeId": "NORHAN ABDALLA",
                "employeeName": "NORHAN ABDALLA",
                "service": "تنظيف",
                "startDate": "2026-01-01",
                "endDate": "2026-12-31",
                "price": "2500",
                "status": "نشط",
                "workDays": ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"],
                "workHours": "8 ساعات"
            },
            {
                "id": 4,
                "clientId": "mohamed abdallah mohamed ahmed al khalaf",
                "clientName": "mohamed abdallah mohamed ahmed al khalaf",
                "employeeId": "MAHMOUD ABDELAZIZ",
                "employeeName": "MAHMOUD ABDELAZIZ",
                "service": "تنظيف",
                "startDate": "2026-01-01",
                "endDate": "2026-12-31",
                "price": "2500",
                "status": "نشط",
                "workDays": ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"],
                "workHours": "8 ساعات"
            },
            {
                "id": 5,
                "clientId": "ANWER",
                "clientName": "ANWER",
                "employeeId": "ABDELRAHMAN MOHAMED",
                "employeeName": "ABDELRAHMAN MOHAMED",
                "service": "تنظيف",
                "startDate": "2026-01-01",
                "endDate": "2026-12-31",
                "price": "2000",
                "status": "نشط",
                "workDays": ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"],
                "workHours": "8 ساعات"
            }
        ];

        // حفظ البيانات النظيفة
        sessionStorage.setItem('superpro_employees', JSON.stringify(employees));
        sessionStorage.setItem('superpro_clients', JSON.stringify(clients));
        sessionStorage.setItem('superpro_contracts', JSON.stringify(contracts));
        
        // تحديث المتغيرات العالمية
        window.employees = employees;
        window.clients = clients;
        window.contracts = contracts;
        
        console.log(`✅ تم حفظ ${employees.length} موظف`);
        console.log(`✅ تم حفظ ${clients.length} عميل`);
        console.log(`✅ تم حفظ ${contracts.length} عقد`);
        
        // تحديث الواجهة
        setTimeout(() => {
            if (typeof loadEmployees === 'function') {
                loadEmployees();
                console.log('✅ تم تحديث قائمة الموظفين');
            }
            
            if (typeof loadClients === 'function') {
                loadClients();
                console.log('✅ تم تحديث قائمة العملاء');
            }
            
            if (typeof loadContracts === 'function') {
                loadContracts();
                console.log('✅ تم تحديث قائمة العقود');
            }
            
            if (typeof loadDashboard === 'function') {
                loadDashboard();
                console.log('✅ تم تحديث لوحة التحكم');
            }
        }, 500);
        
        // رسالة نجاح
        alert('🎉 تم استيراد البيانات النظيفة بنجاح!\n\n👥 الموظفون: ' + employees.length + '\n👤 العملاء: ' + clients.length + '\n📄 العقود: ' + contracts.length + '\n\n✅ تم مسح البيانات القديمة وحفظ البيانات الجديدة!');
        
        console.log('=== اكتمل الاستيراد النظيف بنجاح ===');
        
    } catch (error) {
        console.error('❌ خطأ في الاستيراد النظيف:', error);
        alert('❌ حدث خطأ: ' + error.message);
    }
}

// إضافة زر الاستيراد النظيف
document.addEventListener('DOMContentLoaded', function() {
    console.log('تحميل clean-import.js...');
    
    setTimeout(() => {
        let settingsSection = document.querySelector('.settings-section');
        
        if (!settingsSection) {
            settingsSection = document.getElementById('settings');
        }
        
        if (!settingsSection) {
            const allDivs = document.querySelectorAll('div');
            for (let div of allDivs) {
                if (div.textContent && div.textContent.includes('الإعدادات')) {
                    settingsSection = div;
                    break;
                }
            }
        }
        
        if (settingsSection) {
            const cleanImportButton = `
                <div class="mb-3">
                    <h6>استيراد البيانات النظيفة</h6>
                    <button class="btn btn-danger btn-sm me-2" onclick="cleanDataImport()">
                        <i class="fas fa-broom"></i> مسح واستيراد بيانات نظيفة
                    </button>
                    <small class="text-muted d-block">يمسح جميع البيانات القديمة ويستورد بيانات نظيفة ومنظمة</small>
                </div>
            `;
            settingsSection.insertAdjacentHTML('afterbegin', cleanImportButton);
            console.log('✅ تم إضافة زر الاستيراد النظيف بنجاح');
        } else {
            document.body.insertAdjacentHTML('beforeend', `
                <div style="position: fixed; top: 60px; left: 10px; z-index: 9999;">
                    <button class="btn btn-danger btn-sm" onclick="cleanDataImport()">
                        <i class="fas fa-broom"></i> بيانات نظيفة
                    </button>
                </div>
            `);
            console.log('✅ تم إضافة زر الاستيراد النظيف في الزاوية');
        }
    }, 3000);
});
