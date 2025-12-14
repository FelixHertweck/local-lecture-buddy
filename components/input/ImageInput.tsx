"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Upload, Camera, X, Loader2 } from "lucide-react";
import { useWorkflow } from "@/lib/contexts/WorkflowContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ImagePopup } from "@/components/ui/ImagePopup";
import { validateImageFile } from "@/lib/validation";
import { toast } from "sonner";

export function ImageInput() {
  const [mode, setMode] = useState<"select" | "upload" | "camera">("select");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { actions, state } = useWorkflow();
  const inputSource = state.imageInputSource;

  useEffect(() => {
    return () => {
      // Cleanup: Stop camera stream on unmount
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Update video element when stream changes
  useEffect(() => {
    if (mode === "camera" && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [mode, stream]);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid image file");
      return;
    }

    // Stop camera if it was running
    if (stream) {
      stopCamera();
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      actions.setImageInputSource("upload");
      actions.setInput({
        type: "image",
        data: imageData,
        source: "upload",
        timestamp: new Date(),
      });
      toast.success("Image uploaded successfully");
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    // If upload is already active, don't allow camera
    if (inputSource === "upload") {
      toast.error("Please remove the uploaded image first");
      return;
    }

    try {
      setIsCapturing(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      setMode("camera");
      setIsCapturing(false);
    } catch (err) {
      setIsCapturing(false);
      toast.error("Camera access denied");
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setMode("select");
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL("image/png");
    canvas.remove();

    // Stop camera after capture to free resources and exit camera mode
    stopCamera();

    actions.setImageInputSource("camera");
    actions.setInput({
      type: "image",
      data: imageData,
      source: "camera",
      timestamp: new Date(),
    });

    toast.success("Photo captured successfully");
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Top: Upload & Take Photo Selection Buttons - Always visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={`p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-accent transition-colors ${
            inputSource === "upload" ? "border-white border-2" : ""
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 text-primary" />
          <div className="text-center">
            <h3 className="font-semibold">Upload Image</h3>
            <p className="text-sm text-muted-foreground">
              Choose a file from your device
            </p>
          </div>
        </Card>

        <Card
          className={`p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-accent transition-colors ${
            inputSource === "camera" || mode === "camera"
              ? "border-white border-2"
              : ""
          }`}
          onClick={startCamera}
        >
          <Camera className="w-12 h-12 text-primary" />
          <div className="text-center">
            <h3 className="font-semibold">Take Photo</h3>
            <p className="text-sm text-muted-foreground">
              Use your camera to capture
            </p>
          </div>
        </Card>
      </div>

      {/* Loading Animation - Shows while initializing camera */}
      {isCapturing && mode !== "camera" && (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Initializing camera...</p>
        </div>
      )}

      {/* Middle: Camera Live Stream - Shows when camera mode is active */}
      {mode === "camera" && !isCapturing && (
        <>
          <div className="relative rounded-lg overflow-hidden bg-black w-full max-w-md h-48 sm:h-64 lg:h-72 mx-auto">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          {/* Camera Controls */}
          <div className="flex justify-center gap-4">
            <Button onClick={capturePhoto} size="lg" className="gap-2">
              <Camera className="w-5 h-5" />
              Capture Photo
            </Button>
            <Button onClick={stopCamera} variant="outline" size="lg">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </>
      )}

      {/* Bottom: Image Preview - Shows when image is selected */}
      {state.inputData?.type === "image" && (
        <div className="flex-1 overflow-hidden mt-4">
          <div
            className="relative rounded-lg overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity h-full"
            onClick={() => setIsPopupOpen(true)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.inputData.data}
              alt="Uploaded preview"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 right-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.setImageInputSource(null);
                  actions.reset();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
          <ImagePopup
            src={state.inputData.data}
            alt="Uploaded preview"
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
          />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
