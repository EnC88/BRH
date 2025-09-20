'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function CameraPage() {
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [show3DScene, setShow3DScene] = useState(false);
  const [isLoading3D, setIsLoading3D] = useState(false);
  const [showCamera, setShowCamera] = useState(true);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const threeContainerRef = useRef(null);
  const rafRef = useRef(null);
  const stopCamera = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        try { videoRef.current.pause(); } catch {}
        videoRef.current.srcObject = null;
      }
    } catch (e) {
      console.warn('stopCamera error', e);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      cleanupThree();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;
    if (!showCamera) {
      stopCamera();
      return;
    }

    (async () => {
      try {
        stopCamera();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
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
              console.error('Video play error:', err);
            }
          };
        }
      } catch (err) {
        console.error('Camera error:', err);
        stopCamera();
      }
    })();

    return () => { active = false; };
  }, [showCamera]);


  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!video.videoWidth || !video.videoHeight) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    setCapturedPhoto(dataUrl);
    setShowCamera(false);
    setShow3DScene(true);
    stopCamera();
  };

  const closeCamera = () => {
    stopCamera();
    window.location.href = '/';
  };

  const cleanupThree = () => {
    try {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      document.removeEventListener('mousemove', () => {});
      document.removeEventListener('touchmove', () => {});
      window.removeEventListener('resize', () => {});
      const container = threeContainerRef.current;
      if (container) container.innerHTML = '';
    } catch (e) {
      console.warn('cleanupThree error', e);
    }
  };

  const resetPhoto = () => {
    cleanupThree();
    setCapturedPhoto(null);
    setShow3DScene(false);
    setIsLoading3D(false);
    setShowCamera(true);
  };

  const create3DScene = async (photoDataUrl, container) => {
    if (!container) {
      setIsLoading3D(false);
      setShow3DScene(false);
      return;
    }
    await createScene(container, photoDataUrl);
  };

  const createScene = async (container, photoDataUrl) => {
    container.innerHTML = '';

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 50);

      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
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
      const width = 200;
      const height = width / aspect;
      const widthSegments = 32;
      const heightSegments = 16;
      const curveIntensity = 0.7;

      const geometry = new THREE.PlaneGeometry(width, height, widthSegments, heightSegments);
      const positions = geometry.attributes.position;

      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);

        const distanceFromCenter = Math.sqrt(x * x + y * y);
        const maxDistance = Math.sqrt((width / 2) * (width / 2) + (height / 2) * (height / 2));
        const normalizedDistance = distanceFromCenter / maxDistance;

        const newZ = z + (normalizedDistance * normalizedDistance * curveIntensity * 20);
        positions.setZ(i, newZ);
      }
      positions.needsUpdate = true;

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      });

      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(0, 0, 0);
      scene.add(plane);

      scene.background = new THREE.Color(0x000000);

      let mouseX = 0, mouseY = 0;
      
      const handleMouseMove = (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      };

      const handleTouchMove = (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        mouseX = (touch.clientX / window.innerWidth) * 2 - 1;
        mouseY = (touch.clientY / window.innerHeight) * 2 - 1;
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);
      const animate = () => {
        rafRef.current = requestAnimationFrame(animate);
        if (!scene || !camera || !renderer || !plane) return;

        const horizontalRange = 0.25;
        const verticalRange = 0.20;

        const targetRotationY = mouseX * horizontalRange;
        const targetRotationX = mouseY * verticalRange;

        camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.08;
        camera.rotation.x += (targetRotationX - camera.rotation.x) * 0.08;

        renderer.render(scene, camera);
      };

      animate();
      setIsLoading3D(false);

    } catch (error) {
      console.error('Error creating 3D scene:', error);
      setIsLoading3D(false);
      setShow3DScene(false);
    }
  };

  useEffect(() => {
    if (show3DScene && capturedPhoto) {
      setTimeout(() => {
        const container = threeContainerRef.current;
        if (container) {
          create3DScene(capturedPhoto, container);
        }
      }, 100);
    }
  }, [show3DScene, capturedPhoto]);

  if (isLoading3D) {
    return (
      <main className="h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-space font-light">Creating 3D scene...</p>
        </div>
      </main>
    );
  }

  if (show3DScene) {
    return (
      <main className="h-screen bg-black relative overflow-hidden">
        <div 
          ref={(el) => {
            threeContainerRef.current = el;
            if (el && capturedPhoto && !isLoading3D) {
              setTimeout(() => create3DScene(capturedPhoto, el), 50);
            }
          }} 
          className="w-full h-full"
        ></div>

        <button
          onClick={resetPhoto}
          className="absolute top-6 right-6 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-2xl transition-all duration-300 backdrop-blur-sm z-10"
        >
          ×
        </button>

        <div className="absolute bottom-6 left-6 bg-black/50 backdrop-blur-sm rounded-lg p-4 text-white z-10">
          <p className="font-space font-light text-sm">Move your mouse to look around</p>
        </div>
      </main>
    );
  }



  return (
    <main className="h-screen bg-black relative overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />

      <button
        onClick={closeCamera}
        className="absolute top-6 right-6 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center text-2xl transition-all duration-300 backdrop-blur-sm z-10"
      >
        ×
      </button>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10">
        <button
          onClick={capturePhoto}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-lg"
        >
          <div className="w-16 h-16 bg-[#2d4a2d] rounded-full hover:bg-[#4a7c59] transition-all duration-300"></div>
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
