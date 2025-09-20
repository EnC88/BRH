'use client';
import { useEffect } from 'react';

export default function Page() {
  useEffect(() => {
    // Load Firebase scripts from CDN
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

    async function initFirebase() {
      await loadScript('https://www.gstatic.com/firebasejs/10.5.2/firebase-app-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/10.5.2/firebase-auth-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore-compat.js');

      const firebaseConfig = {
        apiKey: "AIzaSyC8ejbYGF1vVC7ErSJ3G5YFGB0DmF1Mt3M",
        authDomain: "brh2025-4b271.firebaseapp.com",
        projectId: "brh2025-4b271",
        storageBucket: "brh2025-4b271.firebasestorage.app",
        messagingSenderId: "858895632224",
        appId: "1:858895632224:web:3c09a5d9b77c9da0438005"
      };

      firebase.initializeApp(firebaseConfig);
      const auth = firebase.auth();
      const db = firebase.firestore();

      const googleBtn = document.getElementById('googleSignInBtn');
      const statusText = document.getElementById('status');

      googleBtn.onclick = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
          .then(async result => {
            const user = result.user;
            statusText.textContent = `Signed in as ${user.email}`;

            const userRef = db.collection('users').doc(user.uid);
            const doc = await userRef.get();

            if (!doc.exists) {
              await userRef.set({
                email: user.email,
                displayName: user.displayName,
                photos: [],
                joinedAt: firebase.firestore.FieldValue.serverTimestamp()
              });
              console.log('✅ New user document created in Firestore.');
            } else {
              console.log('👤 User already exists in Firestore.');
            }

          })
          .catch(error => {
            console.error("Sign-in error:", error);
            alert("Sign-in failed.");
          });
      };
    }

    initFirebase();
  }, []);

  return (
    <div style={styles.body}>
      <div style={styles.loginBox}>
        <h2>Sign in with Google</h2>
        <button id="googleSignInBtn" style={styles.button}>
          Continue with Google
        </button>
        <p id="status" style={styles.status}>Not signed in</p>
      </div>
    </div>
  );
}

const styles = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily: 'Arial, sans-serif',
    background: '#f7f7f7',
    display: 'flex',
    height: '100vh',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loginBox: {
    background: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '300px'
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#4285F4',
    color: 'white',
    cursor: 'pointer'
  },
  status: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#555'
  }
};
