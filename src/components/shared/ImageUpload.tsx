'use client';

import { useCallback, useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, GripVertical, Trash2, Loader2 } from 'lucide-react';
import { uploadImages } from '@/actions/upload.actions';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxCount?: number;
}

export function ImageUpload({ value, onChange, maxCount = 10 }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith('image/'));
      if (imageFiles.length === 0) {
        setError('Please select image files (JPG, PNG, WebP, GIF).');
        return;
      }
      const remaining = maxCount - value.length;
      const toUpload = imageFiles.slice(0, remaining);
      if (toUpload.length === 0) {
        setError(`Maximum ${maxCount} images allowed.`);
        return;
      }
      setError('');
      setUploading(true);
      const formData = new FormData();
      toUpload.forEach((f) => formData.append('files', f));
      const result = await uploadImages(formData);
      setUploading(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.urls?.length) onChange([...value, ...result.urls]);
    },
    [maxCount, value, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length) doUpload(files);
    },
    [doUpload]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length) doUpload(files);
      e.target.value = '';
    },
    [doUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && value.length < maxCount && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className="border-2 border-dashed rounded-[14px] py-10 px-6 text-center cursor-pointer transition-all duration-200"
        style={{
          borderColor: dragging ? 'var(--line-gold)' : 'var(--line-md)',
          background: dragging ? 'var(--gold-bg)' : 'var(--surface2)',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" style={{ color: 'var(--gold)' }} />
        ) : (
          <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-4)' }} />
        )}
        <p className="font-sans text-[14px] font-medium" style={{ color: 'var(--text-2)' }}>
          {uploading ? 'Uploading…' : 'Drop images here or click to upload'}
        </p>
        <p className="font-sans text-[12px] mt-1" style={{ color: 'var(--text-4)' }}>
          PNG, JPG, WebP, GIF up to 10MB each (local storage for testing)
        </p>
      </div>
      {error && (
        <p className="font-sans text-[12px] mt-2" style={{ color: 'var(--red)' }}>
          {error}
        </p>
      )}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
          {value.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative rounded-[10px] overflow-hidden border group"
              style={{ aspectRatio: '3/4', borderColor: 'var(--line)', background: 'var(--surface3)' }}
            >
              <Image src={url} alt="" fill className="object-cover" sizes="120px" />
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 badge badge-gold font-sans text-[9px]">
                  Cover
                </span>
              )}
              <div
                className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  type="button"
                  className="p-2 rounded-lg cursor-grab hover:bg-white/10"
                  aria-label="Reorder"
                >
                  <GripVertical className="w-4 h-4 text-white" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="p-2 rounded-lg hover:bg-white/10"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" style={{ color: 'var(--red)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
