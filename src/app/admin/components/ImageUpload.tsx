import { useState, useRef } from "react";
import {
  Button,
  Text,
  Group,
  FileInput,
  Paper,
  LoadingOverlay,
} from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { createTourServices } from "@/services/createTourServices";

interface ImageUploadProps {
  value?: string | File;
  onChange: (url: string | File) => void;
  error?: string;
  label?: string;
  placeholder?: string;
}

export interface ImageUploadRef {
  getSelectedFile: () => File | null;
  uploadFile: () => Promise<string | null>;
}

export default function ImageUpload({
  value,
  onChange,
  error,
  label = "Hình Ảnh Tour",
  placeholder = "Chọn ảnh hoặc kéo thả file vào đây",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    typeof value === 'string' ? value : null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(
    value instanceof File ? value : null
  );

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File ảnh không được lớn hơn 5MB");
      return;
    }

    // Only create preview, don't upload yet
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Store the selected file for later upload
    setSelectedFile(file);
    
    // Pass the file object to parent for later processing
    onChange(file);
  };

  // Method to upload the selected file (to be called by parent component)
  const uploadSelectedFile = async (): Promise<string | null> => {
    if (!selectedFile) return null;

    setUploading(true);
    try {
      const uploadResult = await createTourServices.uploadImage(selectedFile);
      if (uploadResult.success) {
        console.log("✅ Upload thành công:", uploadResult.url);
        return uploadResult.url;
      } else {
        throw new Error(uploadResult.error);
      }
    } catch (error: any) {
      console.error("❌ Upload failed:", error);
      alert("Upload ảnh thất bại: " + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Expose methods to parent
  (ImageUpload as any).getSelectedFile = () => selectedFile;
  (ImageUpload as any).uploadFile = uploadSelectedFile;

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    setSelectedFile(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div>
      <Text size="sm" fw={500} mb="xs">
        {label}
      </Text>

      <Paper
        withBorder
        p="md"
        className="relative"
        style={{ borderColor: error ? "#fa5252" : undefined }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <LoadingOverlay
          visible={uploading}
          overlayProps={{ radius: "sm", blur: 2 }}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-md"
            />
            <Button
              variant="filled"
              color="red"
              size="xs"
              className="absolute top-2 right-2"
              onClick={handleRemove}
              disabled={uploading}
            >
              <IconX size={14} />
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <IconPhoto size={48} className="mx-auto mb-4 text-gray-400" />
            <Text size="sm" c="dimmed" mb="md">
              {placeholder}
            </Text>

            <Group justify="center" gap="md">
              <FileInput
                accept="image/*"
                onChange={handleFileSelect}
                value={selectedFile}
                placeholder="Chọn file ảnh"
                leftSection={<IconUpload size={16} />}
                disabled={uploading}
              />
            </Group>

            <Text size="xs" c="dimmed" mt="md">
              Hỗ trợ: JPG, PNG, GIF, WebP (tối đa 5MB)
            </Text>
          </div>
        )}
      </Paper>

      {error && (
        <Text size="sm" c="red" mt="xs">
          {error}
        </Text>
      )}

      {value && !preview && typeof value === 'string' && (
        <Text size="xs" c="dimmed" mt="xs">
          URL hiện tại: {value}
        </Text>
      )}
    </div>
  );
}
