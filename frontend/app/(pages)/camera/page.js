'use client';

import { useEffect, useRef, useState } from 'react';

export default function CameraPage() {
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const photoDataUrl = canvas.toDataURL('image/jpeg');
      setCapturedPhoto(photoDataUrl);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    window.location.href = '/';
  };

  const resetPhoto = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  if (capturedPhoto) {
    return (
      <main className="min-h-screen bg-[#2d4a2d] flex items-center justify-center px-8">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h2 className="font-space font-black text-4xl text-white mb-4">Photo Captured!</h2>
            <p className="font-space font-light text-lg text-white/80">Your moment has been saved</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
            <img 
              src={capturedPhoto} 
              alt="Captured moment" 
              className="w-full h-auto rounded-xl"
            />
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={resetPhoto}
              className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-space font-medium text-lg rounded-full border border-white/30 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
            >
              Take Another
            </button>
            <button
              onClick={startCamera}
              className="px-8 py-4 bg-white hover:bg-white/90 text-[#2d4a2d] font-space font-medium text-lg rounded-full transition-all duration-300"
            >
              Save & Share
            </button>
          </div>
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