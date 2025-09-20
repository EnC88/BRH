const firebaseConfig = {

    apiKey: "AIzaSyC8ejbYGF1vVC7ErSJ3G5YFGB0DmF1Mt3M",

    authDomain: "brh2025-4b271.firebaseapp.com",

    projectId: "brh2025-4b271",

    storageBucket: "brh2025-4b271.firebasestorage.app",

    messagingSenderId: "858895632224",

    appId: "1:858895632224:web:3c09a5d9b77c9da0438005"


};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const auth = firebase.auth();

async function upload_photo(file) {
    
    const storageRef = storage.ref(`uploads/${file.name}`);
    storageRef.put(file);
    const user = auth.currentUser;
    await db.collection("users").doc(user.uid).update({
        photos: photos.push(snapshot.ref.getDownloadURL()) // or "moderator", etc.
    });
    return snapshot.ref.getDownloadURL();
        
}