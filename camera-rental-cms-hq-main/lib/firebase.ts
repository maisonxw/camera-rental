import { initializeApp, getApps, getApp } from "firebase/app"
import { getDatabase, type Database } from "firebase/database"
import { getStorage, type FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyBXEHwJ2eEq_ZIwST4WUU6qe-7Q3b6Bl1Y",
  authDomain: "camera-rental-cms-hq-mai-d65a9.firebaseapp.com",
  projectId: "camera-rental-cms-hq-mai-d65a9",
  storageBucket: "camera-rental-cms-hq-mai-d65a9.firebasestorage.app",
  messagingSenderId: "623700544854",
  appId: "1:623700544854:web:b57d51730c2f4d5360daf7",
  measurementId: "G-JDB09HWSSN",
  databaseURL: "https://camera-rental-cms-hq-mai-d65a9-default-rtdb.asia-southeast1.firebasedatabase.app/",
}

// ✅ Kiểm tra nếu app đã được khởi tạo, dùng lại app cũ — tránh duplicate
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export const database: Database = getDatabase(app)
export const storage: FirebaseStorage = getStorage(app)

export { app }
