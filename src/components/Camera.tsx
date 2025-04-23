import React, { useRef, useState, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface CameraProps {
  onCapture: (photo: string) => void;
  capturedImage: string | null;
  resetImage: () => void;
  label: string;
}

const CameraComponent: React.FC<CameraProps> = ({ 
  onCapture, 
  capturedImage, 
  resetImage,
  label
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const { showToast } = useToast();

  useEffect(() => {
    return () => {
      // Clean up stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setCameraActive(true);
    } catch (error) {
      showToast('Camera access denied or not available', 'error');
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraActive(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      onCapture(dataUrl);
      stopCamera();
      showToast('Photo captured successfully', 'success');
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="camera-container">
        {capturedImage ? (
          <div className="relative">
            <img src={capturedImage} alt="Captured" className="image-preview" />
            <button 
              onClick={resetImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : cameraActive ? (
          <div className="relative">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button 
                onClick={capturePhoto}
                className="bg-blue-900 text-white px-4 py-2 rounded-full flex items-center space-x-2"
              >
                <Camera className="w-5 h-5" />
                <span>Capture</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="camera-overlay">
            <button 
              onClick={startCamera}
              className="bg-blue-900 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-800 transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span>Start Camera</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraComponent;