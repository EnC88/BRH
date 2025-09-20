"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Post3DScene = ({ imageUrl, className = "" }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const planeRef = useRef(null);
  const rafRef = useRef(null);
  const eventHandlersRef = useRef({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !imageUrl) {
      console.log("Post3DScene: Missing container or imageUrl", { container: !!containerRef.current, imageUrl });
      return;
    }

    console.log("Post3DScene: Starting 3D scene with imageUrl:", imageUrl);
    const container = containerRef.current;
    let mouseX = 0;
    let mouseY = 0;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 50);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Check if imageUrl is valid
    if (!imageUrl || imageUrl === "/placeholder.svg" || imageUrl.trim() === "" || (!imageUrl.startsWith('http') && !imageUrl.startsWith('data:'))) {
      console.log("Post3DScene: Invalid imageUrl, creating fallback scene", imageUrl);
      createFallbackScene(scene);
      return;
    }

    // Load texture and create 3D plane function
    const loadTextureAs3D = (scene, url) => {
      const loader = new THREE.TextureLoader();
      
      // Only set crossOrigin for non-Firebase URLs
      if (!url.includes('firebasestorage.googleapis.com')) {
        loader.setCrossOrigin('anonymous');
      }
      
      console.log("Post3DScene: Loading texture from:", url);
      loader.load(
        url,
      (texture) => {
        try {
          setIsLoading(false);
          setHasError(false);
          
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.generateMipmaps = false;

          const aspect = texture.image.width / texture.image.height;
          const width = 200;
          const height = width / aspect;

          const widthSegments = 32;
          const heightSegments = 16;
          const curveIntensity = 0.7;

          const geometry = new THREE.PlaneGeometry(
            width,
            height,
            widthSegments,
            heightSegments
          );

          // Apply curve to geometry
          const positions = geometry.attributes.position;
          for (let i = 0; i < positions.count; i++) {
            const x = positions.getX(i);
            const y = positions.getY(i);
            const z = positions.getZ(i);
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
          planeRef.current = plane;

          scene.background = new THREE.Color(0x1a4d3a);
        } catch (error) {
          console.error("Error creating 3D scene:", error);
          setIsLoading(false);
          setHasError(true);
          // Fallback: create a simple colored plane
          createFallbackScene(scene);
        }
      },
      (progress) => {
        // Loading progress (optional)
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
        (error) => {
          console.error("Post3DScene: Error loading texture:", {
            error,
            imageUrl: url,
            errorType: typeof error,
            errorMessage: error?.message || 'Unknown error',
            errorStack: error?.stack
          });
          setIsLoading(false);
          setHasError(true);
          // Fallback: create a simple colored plane
          createFallbackScene(scene);
        }
      );
    };

    // For Firebase Storage URLs, we can now load them directly as textures (after CORS setup)
    const isFirebaseUrl = imageUrl.includes('firebasestorage.googleapis.com');
    
    if (isFirebaseUrl) {
      console.log("Post3DScene: Firebase URL detected, loading directly as texture");
      // For Firebase URLs, load directly as texture (CORS should be configured)
      loadTextureAs3D(scene, imageUrl);
    } else {
      // Test if image is accessible before loading as texture (for non-Firebase URLs)
      const testImage = new Image();
      testImage.crossOrigin = 'anonymous';
      
      testImage.onload = () => {
        console.log("Post3DScene: Image test successful, loading as texture");
        loadTextureAs3D(scene, imageUrl);
      };
      
      testImage.onerror = (error) => {
        console.error("Post3DScene: Image test failed:", error);
        setIsLoading(false);
        setHasError(true);
        createFallbackScene(scene);
      };
      
      testImage.src = imageUrl;
    }

    // Fallback function for when texture loading fails
    const createFallbackScene = (scene) => {
      try {
        setIsLoading(false);
        setHasError(false);
        
        const geometry = new THREE.PlaneGeometry(200, 200, 32, 16);
        
        // Apply curve to geometry
        const positions = geometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);
          const distanceFromCenter = Math.sqrt(x * x + y * y);
          const maxDistance = Math.sqrt(100 ** 2 + 100 ** 2);
          const normalizedDistance = distanceFromCenter / maxDistance;
          const newZ = z + normalizedDistance ** 2 * 0.7 * 20;
          positions.setZ(i, newZ);
        }
        positions.needsUpdate = true;

        const material = new THREE.MeshBasicMaterial({
          color: 0x4a7c59, // Dark green color as fallback
          side: THREE.DoubleSide,
        });

        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
        planeRef.current = plane;

        scene.background = new THREE.Color(0x1a4d3a);
      } catch (fallbackError) {
        console.error("Error creating fallback scene:", fallbackError);
        setIsLoading(false);
        setHasError(true);
      }
    };

    // Event handlers
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
      if (container.clientWidth && container.clientHeight) {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      }
    };

    // Store event handlers for cleanup
    eventHandlersRef.current = {
      handleMouseMove,
      handleTouchMove,
      handleResize,
    };

    // Add event listeners
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      
      if (scene && camera && renderer && planeRef.current) {
        const targetRotationY = mouseX * 0.25;
        const targetRotationX = mouseY * 0.2;
        camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.08;
        camera.rotation.x += (targetRotationX - camera.rotation.x) * 0.08;
        renderer.render(scene, camera);
      }
    };
    animate();

    // Cleanup function
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      const { handleMouseMove, handleTouchMove, handleResize } = eventHandlersRef.current;
      
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("touchmove", handleTouchMove);
      }
      window.removeEventListener("resize", handleResize);

      if (renderer) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }

      if (scene) {
        scene.clear();
      }

      eventHandlersRef.current = {};
    };
  }, [imageUrl]);

  return (
    <div
      ref={containerRef}
      className={`w-full aspect-square relative ${className}`}
      style={{ touchAction: "pan-y" }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a4d3a] rounded-lg">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a4d3a] rounded-lg">
          <div className="text-white/70 text-sm">Failed to load image</div>
        </div>
      )}
    </div>
  );
};

export default Post3DScene;
