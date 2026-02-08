// التخزين السحابي الاختياري باستخدام Firebase
class CloudStorage {
    constructor() {
        this.isConfigured = false;
        this.db = null;
    }

    // تهيئة Firebase (اختياري)
    async initialize(config) {
        try {
            // Firebase مهيئ بالفعل في index.html، لا حاجة لإعادة تهيئته
            this.db = firebase.firestore();
            this.isConfigured = true;
            
            return true;
        } catch (error) {
            console.error('فشل تهيئة التخزين السحابي:', error);
            return false;
        }
    }

    // تحميل Firebase SDK
    loadFirebaseSDK() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js';
            script.onload = () => {
                const script2 = document.createElement('script');
                script2.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js';
                script2.onload = resolve;
                script2.onerror = reject;
                document.head.appendChild(script2);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // حفظ البيانات في السحابة
    async saveData(data) {
        if (!this.isConfigured) return false;
        
        try {
            await this.db.collection('superpro_data').doc('main').set({
                data: data,
                lastUpdated: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('فشل حفظ البيانات في السحابة:', error);
            return false;
        }
    }

    // تحميل البيانات من السحابة
    async loadData() {
        if (!this.isConfigured) return null;
        
        try {
            const doc = await this.db.collection('superpro_data').doc('main').get();
            if (doc.exists) {
                return doc.data().data;
            }
            return null;
        } catch (error) {
            console.error('فشل تحميل البيانات من السحابة:', error);
            return null;
        }
    }
}

// إنشاء نسخة عالمية
window.cloudStorage = new CloudStorage();
