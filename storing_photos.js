const firebaseConfig = {
    apiKey: "AIzaSyC8ejbYGF1vVC7ErSJ3G5YFGB0DmF1Mt3M",
    authDomain: "brh2025-4b271.firebaseapp.com",
    projectId: "brh2025-4b271",
    storageBucket: "brh2025-4b271.firebasestorage.app",
    messagingSenderId: "858895632224",
    appId: "1:858895632224:web:3c09a5d9b77c9da0438005"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const auth = firebase.auth();
const db = firebase.firestore();

// Function to convert data URL to File object
function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}

// Function to upload photo from camera
async function upload_photo_from_camera(dataUrl, caption = '', tags = []) {
    try {
        // Check authentication
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        // Convert data URL to File
        const file = dataURLtoFile(dataUrl, `photo_${Date.now()}.jpg`);
        
        // Upload to Firebase Storage
        const storageRef = storage.ref(`uploads/${file.name}`);
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        // Save metadata to Firestore
        await db.collection("users").doc(user.uid).update({
            photos: firebase.firestore.FieldValue.arrayUnion({
                url: downloadURL,
                caption: caption,
                tags: tags,
                timestamp: new Date().toISOString(),
                filename: file.name
            })
        });
        
        return downloadURL;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}

// Original upload function (for file uploads)
async function upload_photo(file) {
    try {
        // Check authentication
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        // Upload to Firebase Storage
        const storageRef = storage.ref(`uploads/${file.name}`);
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        // Save metadata to Firestore
        await db.collection("users").doc(user.uid).update({
            photos: firebase.firestore.FieldValue.arrayUnion({
                url: downloadURL,
                timestamp: new Date().toISOString(),
                filename: file.name
            })
        });
        
        return downloadURL;
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}