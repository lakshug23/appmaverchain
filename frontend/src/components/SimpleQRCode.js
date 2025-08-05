import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

const SimpleQRCode = ({ value, size = 120, className = "" }) => {
  const [qrDataURL, setQrDataURL] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateQRCode();
  }, [value, size]);

  const generateQRCode = async () => {
    if (!value) {
      setError('No value provided for QR code');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Ensure value is a string
      const qrValue = typeof value === 'string' ? value : JSON.stringify(value);
      
      const qrCodeDataURL = await QRCode.toDataURL(qrValue, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrDataURL(qrCodeDataURL);
    } catch (err) {
      console.error('QR code generation error:', err);
      setError('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-100 rounded-lg ${className}`} style={{ width: size, height: size }}>
        <div className="text-center p-2">
          <div className="text-red-600 text-xs">❌</div>
          <div className="text-red-600 text-xs">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src={qrDataURL} 
        alt={`QR Code: ${value}`}
        style={{ width: size, height: size }}
        className="rounded-lg"
      />
    </div>
  );
};

export default SimpleQRCode;
