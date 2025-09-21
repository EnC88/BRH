// src/app/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/utils/firebase";

export default function Page() {
  const [userStatus, setUserStatus] = useState("Not signed in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

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
      const userRef = doc(db, "users", user.uid);
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
          joinedAt: serverTimestamp(),
          photoUrl: user.photoURL,
        });
        console.log("✅ New user document created in Firestore.");
      } else {
        console.log("👤 User already exists in Firestore.");
      }

      // Redirect to /home after successful login
      router.push("/home");
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
    <main className="min-h-screen bg-[#2d4a2d]">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 hero-video"
        >
          <source src="/touchdown_wave.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="absolute inset-0 bg-gradient-to-br from-[#2d4a2d]/20 via-[#4a7c59]/15 to-[#6b9b7a]/25"></div>

        <div className="relative z-10 bg-white/95 p-10 rounded-xl shadow-2xl w-full max-w-md mx-4">
          <h2 className="text-2xl font-semibold mb-8 text-center text-gray-800">
            Sign In
          </h2>

          <div className="space-y-4 mb-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
            />
            <button
              onClick={handleEmailSignIn}
              className="w-full p-3 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Sign In
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full p-3 bg-[#4285F4] hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
          >
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">{userStatus}</p>
        </div>
      </section>
    </main>
  );
}
const styles = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily: "Arial, sans-serif",
    color: "#000000",
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  backgroundVideo: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: -2,
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Dark overlay for better readability
    zIndex: -1,
  },
  loginBox: {
    background: "rgba(255, 255, 255, 0.95)", // Slightly transparent for video visibility
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
    textAlign: "center",
    width: "400px",
    position: "relative",
    zIndex: 1,
  },
  // ... rest of your existing styles remain the same
  formSection: {
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "8px 0",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  emailButton: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#333",
    color: "white",
    cursor: "pointer",
    marginTop: "10px",
  },
  divider: {
    margin: "20px 0",
    position: "relative",
    textAlign: "center",
  },
  dividerText: {
    background: "rgba(255, 255, 255, 0.9)",
    padding: "0 10px",
    color: "#666",
    fontSize: "14px",
    position: "relative",
    zIndex: 1,
  },
  googleSection: {
    marginTop: "20px",
  },
  googleButton: {
    width: "100%",
    padding: "12px",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    backgroundColor: "#4285F4",
    color: "white",
    cursor: "pointer",
  },
  status: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#555",
  },
  signin: {
    fontSize: "24px",
    marginBottom: "30px",
  },
};
