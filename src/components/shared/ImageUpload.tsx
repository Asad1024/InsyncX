'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { Upload, GripVertical, Trash2 } from 'lucide-react';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxCount?: number;
}

export function ImageUpload({ value, onChange, maxCount = 10 }: ImageUploadProps) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      // Actual upload would go to Cloudinary via server action; here we only handle URLs or files.
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length === 0) return;
      // If parent handles file upload, it would pass new URLs back via onChange.
      // For now we don't add files directly - parent typically uses a server action.
    },
    []
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
      <div
        className="border-2 border-dashed rounded-[14px] py-10 px-6 text-center cursor-pointer transition-all duration-200"
        style={{
          borderColor: dragging ? 'var(--line-gold)' : 'var(--line-md)',
          background: dragging ? 'var(--gold-bg)' : 'var(--surface2)',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-4)' }} />
        <p className="font-sans text-[14px] font-medium" style={{ color: 'var(--text-2)' }}>
          Drop images here or click to upload
        </p>
        <p className="font-sans text-[12px] mt-1" style={{ color: 'var(--text-4)' }}>
          PNG, JPG up to 10MB each
        </p>
      </div>
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
