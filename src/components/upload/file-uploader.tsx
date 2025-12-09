'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface FileUploaderProps {
  endpoint: 'avatar' | 'deliverable' | 'kyc' | 'course';
  onUpload: (result: { key: string; url: string }) => void;
  additionalData?: Record<string, string>;
  accept?: string;
}

export function FileUploader({ endpoint, onUpload, additionalData, accept }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    try {
      const response = await fetch(`/api/upload/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        onUpload(result);
        setFile(null);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept={accept}
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm"
      />
      {file && (
        <Button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      )}
    </div>
  );
}
