// src/app/page.js
'use client';
import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '/utils/firebase'; // Import from the new file

export default function Page() {
  const [userStatus, setUserStatus] = useState("Not signed in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserStatus(`Signed in as ${user.email}`);
      } else {
        setUserStatus("Not signed in");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (!user || !user.uid) {
        throw new Error("User info is missing after sign-in.");
      }
      console.log("HELLO");
      console.log(user.uid);
      const userRef = doc(db, 'users', user.uid);
      console.log("USER REF");
      console.log(userRef);
      const userDoc = await getDoc(userRef);
      console.log("USER DOC");
      console.log(userDoc);
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photos: [],
          joinedAt: serverTimestamp()
        });
        console.log('✅ New user document created in Firestore.');
      } else {
        console.log('👤 User already exists in Firestore.');
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      alert("Sign-in failed. Check the console for details.");
    }
  };

  const handleEmailSignIn = () => {
    // Non-functional placeholder - you can add Firebase email/password auth here later
    console.log("Email sign-in attempted with:", email, password);
    alert("Email sign-in functionality not implemented yet");
  };

  return (
    <div style={styles.body}>
      <div style={styles.loginBox}>
        <h2 style={styles.signin}>Sign In</h2>
        
        {/* Email and Password Form */}
        <div style={styles.formSection}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleEmailSignIn} style={styles.emailButton}>
            Sign In
          </button>
        </div>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>

        {/* Google Sign In */}
        <div style={styles.googleSection}>
          <button onClick={handleGoogleSignIn} style={styles.googleButton}>
            Continue with Google
          </button>
        </div>

        <p id="status" style={styles.status}>{userStatus}</p>
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
    backgroundImage: 'url(/loginBackgroundGr.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    color: '#000000',
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
    width: '400px'
  },
  formSection: {
    marginBottom: '20px'
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '8px 0',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  emailButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#333',
    color: 'white',
    cursor: 'pointer',
    marginTop: '10px'
  },
  divider: {
    margin: '20px 0',
    position: 'relative',
    textAlign: 'center'
  },
  dividerText: {
    background: 'white',
    padding: '0 10px',
    color: '#666',
    fontSize: '14px',
    position: 'relative',
    zIndex: 1
  },
  googleSection: {
    marginTop: '20px'
  },
  googleButton: {
    width: '100%',
    padding: '12px',
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
  },
  signin: {
    fontSize: '24px',
    marginBottom: '30px'
  }
};