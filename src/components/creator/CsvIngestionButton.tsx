import React, { useRef, useState } from 'react';
import { useSigilStore } from '../../state/sigilStore';
import { parseGuestCsv } from '../../utils/csvParser';

export function CsvIngestionButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ingestGuestsBatch = useSigilStore((s) => s.ingestGuestsBatch);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessCount(null);

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      setError('File is too large. Maximum size is 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseGuestCsv(text);

        if (parsed.length === 0) {
          setError('No valid guests found in the CSV.');
          return;
        }

        if (parsed.length > 500) {
          setError('CSV exceeds the limit of 500 records.');
          return;
        }

        ingestGuestsBatch(parsed);
        setSuccessCount(parsed.length);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err: any) {
        setError(err.message || 'Error parsing CSV file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="csv-file-upload"
      />
      <label
        htmlFor="csv-file-upload"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 12px',
          fontFamily: 'inherit',
          fontSize: '0.8rem',
          fontWeight: 500,
          color: '#ffffff',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px dashed rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          width: '100%',
          textAlign: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
      >
        📄 Upload Guest CSV
      </label>

      {error && (
        <p style={{ color: '#ea5455', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {error}
        </p>
      )}
      {successCount !== null && (
        <p style={{ color: '#28c76f', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          Successfully imported {successCount} guest(s)!
        </p>
      )}
    </div>
  );
}
