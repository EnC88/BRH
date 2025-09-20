// src/app/page.js
'use client';

import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '/utils/firebase'; // Import from the new file

export default function Page() {
  const [userStatus, setUserStatus] = useState("Not signed in");

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

  return (
    <div style={styles.body}>
      <div style={styles.loginBox}>
        <h2 style={styles.signin}>Sign in with Google</h2>
        <button onClick={handleGoogleSignIn} style={styles.button}>
          Continue with Google
        </button>
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
  },
  signin: {
    fontSize: '24px',
    marginBottom: '30px'
  }
};