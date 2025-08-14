import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Image, Video, FileImage, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaUploadProps {
  onMediaUpload: (mediaData: { type: string; url: string; thumbnail?: string }) => void;
  disabled?: boolean;
}

export function MediaUpload({ onMediaUpload, disabled }: MediaUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image (JPG, PNG, GIF, WebP) or video (MP4, WebM, OGG) file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('media', selectedFile);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Generate thumbnail for videos
      let thumbnail = null;
      if (selectedFile.type.startsWith('video/')) {
        thumbnail = await generateVideoThumbnail(selectedFile);
      }

      onMediaUpload({
        type: selectedFile.type.startsWith('image/') ? 'image' : 'video',
        url: result.url,
        thumbnail: thumbnail ?? undefined
      });

      // Clean up
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast({
        title: "Upload successful",
        description: "Your media has been uploaded successfully.",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload media. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        video.currentTime = 1; // Seek to 1 second
      };

      video.onseeked = () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
          resolve(thumbnail);
        }
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!selectedFile ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="p-2 text-neutral hover:text-primary transition-colors"
          title="Upload image or video"
        >
          <FileImage className="h-4 w-4" />
        </Button>
      ) : (
        <div className="flex items-center space-x-2">
          {/* Preview */}
          <Card className="p-2">
            <div className="flex items-center space-x-2">
              {selectedFile.type.startsWith('image/') ? (
                <img
                  src={previewUrl!}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                  <Video className="h-6 w-6 text-gray-500" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            </div>
          </Card>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            size="sm"
            className="bg-primary hover:bg-blue-600 text-white"
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>

          {/* Clear Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            disabled={isUploading}
            className="p-1 text-gray-500 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}