import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Cấu hình Firebase mới của bạn từ ảnh màn hình
const firebaseConfig = {
  apiKey: "AIzaSyBXEHwJ2eEq_ZIwST4WUU6qe-7Q3b6Bl1Y",
  authDomain: "camera-rental-cms-hq-mai-d65a9.firebaseapp.com",
  projectId: "camera-rental-cms-hq-mai-d65a9",
  storageBucket: "camera-rental-cms-hq-mai-d65a9.firebasestorage.app",
  messagingSenderId: "623700544854",
  appId: "1:623700544854:web:b57d51730c2f4d5360daf7",
  measurementId: "G-JDB09HWSSN",
  // Đường dẫn Realtime Database của bạn (từ ảnh màn hình)
  databaseURL: "https://camera-rental-cms-hq-mai-d65a9-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo và Export các dịch vụ để sử dụng trong toàn bộ project
export const db = getDatabase(app);
export const fs = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export { app };
