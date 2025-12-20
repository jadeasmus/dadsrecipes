"use client";

import { useState } from "react";

interface VoiceInputProps {
  onTranscriptionComplete: (recipeData: any) => void;
}

export function VoiceInput({ onTranscriptionComplete }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );

  const startRecording = async () => {
    // Check if we're on mobile iOS (declare at function level)
    const isIOS = /iPhone|iPad|iPod/i.test(
      typeof navigator !== "undefined" ? navigator.userAgent : ""
    );

    try {
      // Check permission state first (if available)
      let permissionState: PermissionState | null = null;
      try {
        if (
          typeof navigator !== "undefined" &&
          navigator.permissions &&
          navigator.permissions.query
        ) {
          const result = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          permissionState = result.state;
        }
      } catch (permErr) {
        // Permission API might not be available, continue anyway
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Select appropriate mimeType based on browser support
      // iOS Safari doesn't support webm/opus, so we need a fallback
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Try other formats in order of preference
        if (MediaRecorder.isTypeSupported("audio/webm")) {
          mimeType = "audio/webm";
        } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/aac")) {
          mimeType = "audio/aac";
        } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
          mimeType = "audio/ogg;codecs=opus";
        } else {
          // Use default (browser will choose)
          mimeType = "";
        }
      }

      const recorderOptions: MediaRecorderOptions = mimeType
        ? { mimeType }
        : {};
      const recorder = new MediaRecorder(stream, recorderOptions);

      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Use the actual mimeType from the recorder, or fallback
        const blobType = recorder.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(chunks, { type: blobType });
        await processRecording(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error("Error starting recording:", err);

      const isIOS = /iPhone|iPad|iPod/i.test(
        typeof navigator !== "undefined" ? navigator.userAgent : ""
      );
      const isAndroid = /Android/i.test(
        typeof navigator !== "undefined" ? navigator.userAgent : ""
      );

      let errorMessage =
        "Failed to access microphone. Please check permissions.";

      if (err instanceof DOMException) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          if (isIOS) {
            errorMessage =
              "Microphone permission denied. To enable:\n1. Open iPhone Settings\n2. Go to Safari\n3. Tap Website Settings\n4. Find this site and enable Microphone";
          } else if (isAndroid) {
            errorMessage =
              "Microphone permission denied. Please allow microphone access in your browser settings, then refresh the page.";
          } else {
            errorMessage =
              "Microphone permission denied. Please allow microphone access in your browser settings and try again.";
          }
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          errorMessage =
            "No microphone found. Please connect a microphone and try again.";
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          errorMessage = "Microphone is already in use by another application.";
        } else if (
          err.name === "TypeError" &&
          err.message.includes("undefined")
        ) {
          // Handle the "undefined is not an object" error
          if (isIOS) {
            errorMessage =
              "Microphone access not available. Please ensure you're using Safari and have granted microphone permissions in Settings > Safari > Website Settings.";
          } else {
            errorMessage =
              "Microphone access not available. Please check your browser permissions and try again.";
          }
        } else {
          errorMessage = `Microphone error: ${err.message}`;
        }
      } else if (err instanceof Error && err.message.includes("undefined")) {
        // Handle generic undefined errors
        if (isIOS) {
          errorMessage =
            "Microphone access not available. Please ensure you're using Safari and have granted microphone permissions in Settings > Safari > Website Settings.";
        } else {
          errorMessage =
            "Microphone access not available. Please check your browser permissions and try again.";
        }
      }

      setError(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Transcribe audio
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const transcribeResponse = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const { text } = await transcribeResponse.json();

      if (!text) {
        throw new Error("No transcription received");
      }

      // Step 2: Parse recipe from transcription
      const parseResponse = await fetch("/api/parse-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!parseResponse.ok) {
        throw new Error("Failed to parse recipe");
      }

      const recipeData = await parseResponse.json();
      onTranscriptionComplete(recipeData);
    } catch (err) {
      console.error("Error processing recording:", err);
      setError(
        err instanceof Error ? err.message : "Failed to process recording"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        {!isRecording && !isProcessing && (
          <button
            type="button"
            onClick={startRecording}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
            Start Voice Input
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={stopRecording}
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-destructive px-6 text-sm font-medium text-background transition-colors hover:bg-destructive/80"
          >
            <div className="h-3 w-3 rounded-full bg-background animate-pulse" />
            Stop Recording
          </button>
        )}

        {isProcessing && (
          <div className="flex h-11 items-center justify-center gap-2 text-sm text-muted-foreground">
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Click to record your recipe. Speak clearly and include ingredients and
        instructions.
      </p>
    </div>
  );
}
