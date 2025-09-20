"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, updateDoc, arrayUnion } from "firebase/firestore";

export default function CameraPage() {
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [show3DScene, setShow3DScene] = useState(false);
  const [isLoading3D, setIsLoading3D] = useState(false);
  const [showCamera, setShowCamera] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [permissionRequested, setPermissionRequested] = useState(false);

  const firebaseConfig = {
    apiKey: "AIzaSyC8ejbYGF1vVC7ErSJ3G5YFGB0DmF1Mt3M",
    authDomain: "brh2025-4b271.firebaseapp.com",
    projectId: "brh2025-4b271",
    storageBucket: "brh2025-4b271.firebasestorage.app",
    messagingSenderId: "858895632224",
    appId: "1:858895632224:web:3c09a5d9b77c9da0438005",
  };

  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);
  const auth = getAuth(app);
  const db = getFirestore(app);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const threeContainerRef = useRef(null);
  const rafRef = useRef(null);
  const eventHandlersRef = useRef({});

  const categories = [
    { value: "", label: "Select a category" },
    { value: "dining", label: "Dining Halls and Eateries" },
    { value: "study_spots", label: "Study Spots" },
    { value: "secret_study_spots", label: "Secret Study Spots" },
    { value: "best_matcha", label: "Best Matcha" },
    { value: "cool_places", label: "Cool Spots" },
    { value: "other", label: "Other" },
  ];

  const stopCamera = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        try {
          videoRef.current.pause();
        } catch {}
        videoRef.current.srcObject = null;
      }
    } catch (e) {
      console.warn("stopCamera error", e);
    }
  };

  const cleanupThree = () => {
    try {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      const { handleMouseMove, handleTouchMove, handleResize } =
        eventHandlersRef.current;
      const container = threeContainerRef.current;

      if (container) {
        if (handleMouseMove)
          container.removeEventListener("mousemove", handleMouseMove);
        if (handleTouchMove)
          container.removeEventListener("touchmove", handleTouchMove);
      }
      if (handleResize) window.removeEventListener("resize", handleResize);

      eventHandlersRef.current = {};
      if (container) container.innerHTML = "";
    } catch (e) {
      console.warn("cleanupThree error", e);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Use reverse geocoding to get a readable address
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );

          if (response.ok) {
            const data = await response.json();
            const locationString =
              data.city && data.principalSubdivision
                ? `${data.city}, ${data.principalSubdivision}`
                : data.locality ||
                  `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

            setLocation(locationString);
          } else {
            // Fallback to coordinates if geocoding fails
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (error) {
          console.error("Error getting location name:", error);
          // Fallback to coordinates
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsGettingLocation(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert(
              "Location access denied. Please enable location permissions."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            alert("Location request timed out.");
            break;
          default:
            alert("An unknown error occurred while getting location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  useEffect(() => {
    return () => {
      stopCamera();
      cleanupThree();
    };
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (show3DScene) {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [show3DScene]);

  useEffect(() => {
    let active = true;
    if (!showCamera) {
      stopCamera();
      return;
    }

    const initializeCamera = async () => {
      try {
        setCameraError(null);
        setPermissionRequested(true);
        stopCamera();

        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera not supported on this device");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current.play();
            } catch (err) {
              console.error("Video play error:", err);
            }
          };
        }
      } catch (err) {
        console.error("Camera error:", err);
        stopCamera();

        // Handle specific error types
        if (err.name === "NotAllowedError") {
          setCameraError(
            "Camera permission denied. Please allow camera access and refresh the page."
          );
        } else if (err.name === "NotFoundError") {
          setCameraError("No camera found on this device.");
        } else if (err.name === "NotReadableError") {
          setCameraError("Camera is already in use by another application.");
        } else {
          setCameraError(`Camera error: ${err.message}`);
        }
      }
    };

    initializeCamera();

    return () => {
      active = false;
    };
  }, [showCamera]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!video.videoWidth || !video.videoHeight) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setCapturedPhoto(dataUrl);
    setShowCamera(false);
    setShow3DScene(true);
    stopCamera();
  };

  const retakePhoto = () => {
    cleanupThree();
    setCapturedPhoto(null);
    setShow3DScene(false);
    setIsLoading3D(false);
    setShowCamera(true);
    setDescription("");
    setCategory("");
    setLocation("");
    setUploadSuccess(false);
    setCameraError(null);
    setIsGettingLocation(false);
  };

  const retryCamera = () => {
    setCameraError(null);
    setPermissionRequested(false);
    setShowCamera(false);
    setTimeout(() => setShowCamera(true), 100);
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const uploadPhotoToFirebase = async (
    dataUrl,
    description = "",
    category = "",
    location = "",
    tags = []
  ) => {
    setIsUploading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Please sign in to upload photos");
      }
      const file = dataURLtoFile(dataUrl, `photo_${Date.now()}.jpg`);
      const storageRef = ref(storage, `uploads/${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        posts: arrayUnion({
          url: downloadURL,
          description,
          category,
          location,
          tags,
          timestamp: new Date().toISOString(),
          filename: file.name,
          userId: user.uid,
        }),
      });
      return { success: true, downloadURL, filename: file.name };
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    if (uploadSuccess) return;
    try {
      await uploadPhotoToFirebase(
        capturedPhoto,
        description,
        category,
        location,
        ["#camera"]
      );
      setUploadSuccess(true);
      setTimeout(() => {
        window.location.href = "/home";
      }, 1500);
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    }
  };

  const closeCamera = () => {
    stopCamera();
    window.location.href = "/home";
  };

  const deletePhoto = () => {
    cleanupThree();
    setCapturedPhoto(null);
    setShow3DScene(false);
    setIsLoading3D(false);
    setDescription("");
    setCategory("");
    setLocation("");
    window.location.href = "/camera";
  };

  const createScene = async (container, photoDataUrl) => {
    container.innerHTML = "";
    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 50);
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      container.appendChild(renderer.domElement);
      const loader = new THREE.TextureLoader();
      const texture = await new Promise((resolve, reject) => {
        loader.load(photoDataUrl, resolve, undefined, reject);
      });
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      const aspect = texture.image.width / texture.image.height;
      const width = 200,
        height = width / aspect;
      const widthSegments = 32,
        heightSegments = 16,
        curveIntensity = 0.7;
      const geometry = new THREE.PlaneGeometry(
        width,
        height,
        widthSegments,
        heightSegments
      );
      const positions = geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i),
          y = positions.getY(i),
          z = positions.getZ(i);
        const distanceFromCenter = Math.sqrt(x * x + y * y);
        const maxDistance = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);
        const normalizedDistance = distanceFromCenter / maxDistance;
        const newZ = z + normalizedDistance ** 2 * curveIntensity * 20;
        positions.setZ(i, newZ);
      }
      positions.needsUpdate = true;
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      const plane = new THREE.Mesh(geometry, material);
      scene.add(plane);
      scene.background = new THREE.Color(0x1a4d3a);
      let mouseX = 0,
        mouseY = 0;

      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      };
      const handleTouchMove = (e) => {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        mouseX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      };
      const handleResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };

      eventHandlersRef.current = {
        handleMouseMove,
        handleTouchMove,
        handleResize,
      };
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("resize", handleResize);

      const animate = () => {
        rafRef.current = requestAnimationFrame(animate);
        if (!scene || !camera || !renderer || !plane) return;
        const targetRotationY = mouseX * 0.25;
        const targetRotationX = mouseY * 0.2;
        camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.08;
        camera.rotation.x += (targetRotationX - camera.rotation.x) * 0.08;
        renderer.render(scene, camera);
      };
      animate();
      setIsLoading3D(false);
    } catch (error) {
      console.error("Error creating 3D scene:", error);
      setIsLoading3D(false);
      setShow3DScene(false);
    }
  };

  useEffect(() => {
    if (show3DScene && capturedPhoto) {
      setTimeout(() => {
        const container = threeContainerRef.current;
        if (container) {
          createScene(container, capturedPhoto);
        }
      }, 100);
    }
  }, [show3DScene, capturedPhoto]);

  if (isLoading3D) {
    return (
      <main className="min-h-dvh bg-stone-100 flex justify-center p-6 items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-800/30 border-t-emerald-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-800 font-light text-lg">
            Creating your photo...
          </p>
        </div>
      </main>
    );
  }

  if (show3DScene) {
    const isButtonDisabled =
      isUploading || !description.trim() || uploadSuccess;
    let buttonClass =
      "px-12 py-6 rounded-2xl font-medium transition-colors duration-300 shadow-lg text-xl "; // Larger padding & text
    if (uploadSuccess) {
      buttonClass += "bg-[#617A64] text-white"; // Dark matcha for success
    } else if (isButtonDisabled) {
      buttonClass += "bg-gray-400 cursor-not-allowed text-white";
    } else {
      buttonClass +=
        "bg-[#88AB8E] hover:bg-[#617A64] text-white hover:shadow-xl"; // Matcha colors
    }

    return (
      <main className="bg-stone-100 p-6 flex justify-center">
        <div className="max-w-5xl w-full mx-auto flex flex-col items-center">
          <div className="flex justify-between items-center mb-8 w-full">
            <h1 className="text-3xl font-light text-emerald-800">Your Photo</h1>
            <button
              onClick={deletePhoto}
              className="w-12 h-12 bg-emerald-800 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center text-xl transition-all duration-300 shadow-lg hover:shadow-xl flex-shrink-0"
            >
              ×
            </button>
          </div>
          <div className="bg-emerald-800 p-6 rounded-3xl shadow-2xl mb-6 w-full">
            <div
              ref={threeContainerRef}
              className="w-full aspect-video rounded-2xl overflow-hidden bg-emerald-900 touch-pan-y"
            />
          </div>
          <p className="text-center text-emerald-700 mb-6 font-light">
            Move your mouse to explore your photo in 3D
          </p>
          <div className="flex justify-center mb-6">
            <button
              onClick={retakePhoto}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <div className="w-16 h-16 bg-emerald-800 rounded-full group-hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </button>
          </div>
          <div className="bg-white p-10 rounded-3xl shadow-lg mb-10 w-full">
            <label
              htmlFor="description"
              className="block text-lg font-light text-emerald-800 mb-3"
            >
              Add a description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's happening in this photo?"
              className="w-full p-6 border-2 border-stone-200 rounded-2xl resize-none focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-stone-700"
              rows={4}
              maxLength={500}
            />
            <div className="text-right mt-2 text-sm text-stone-500">
              {description.length}/500
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-lg font-light text-emerald-800 mb-3"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-6 border-2 border-stone-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-stone-700 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-lg font-light text-emerald-800 mb-3"
                >
                  Location
                </label>
                <div className="flex gap-3">
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Where was this taken?"
                    className="flex-1 p-6 border-2 border-stone-200 rounded-2xl focus:border-emerald-500 focus:outline-none transition-colors duration-300 text-stone-700"
                    maxLength={100}
                  />
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-2xl font-medium transition-colors duration-300 flex items-center gap-2 min-w-[120px] justify-center"
                  >
                    {isGettingLocation ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Getting...
                      </>
                    ) : (
                      <>📍 Get Location</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-center pb-4">
            <button
              onClick={handleUpload}
              disabled={isButtonDisabled}
              className={buttonClass}
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Posting...
                </div>
              ) : uploadSuccess ? (
                "✓ Posted!"
              ) : (
                "Share Post"
              )}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-stone-100 p-6 flex justify-center">
      <div className="max-w-5xl w-full mx-auto flex flex-col items-center">
        <div className="flex justify-between items-center mb-8 w-full">
          <h1 className="text-3xl font-light text-emerald-800">
            Capture Photo
          </h1>
          <button
            onClick={closeCamera}
            className="w-12 h-12 bg-emerald-800 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center text-xl transition-all duration-300 shadow-lg hover:shadow-xl flex-shrink-0"
          >
            ×
          </button>
        </div>

        {cameraError ? (
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full text-center">
            <div className="text-red-500 text-6xl mb-4">📷</div>
            <h2 className="text-2xl font-medium text-gray-800 mb-4">
              Camera Access Required
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{cameraError}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={retryCamera}
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors duration-300"
              >
                Try Again
              </button>
              <button
                onClick={closeCamera}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-medium transition-colors duration-300"
              >
                Go Back
              </button>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Make sure to allow camera permissions when
                prompted by your browser.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-emerald-800 p-6 rounded-3xl shadow-2xl w-full">
              <div className="relative rounded-2xl overflow-hidden bg-emerald-900 w-full max-h-[60vh]">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover aspect-video"
                />
                <div className="absolute inset-4 border-2 border-white/30 rounded-xl pointer-events-none">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white"></div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-8 pb-4">
              <button
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                <div className="w-16 h-16 bg-emerald-800 rounded-full group-hover:bg-emerald-700 transition-all duration-300 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </button>
            </div>
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </main>
  );
}
