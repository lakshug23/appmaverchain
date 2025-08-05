import React, { useState, useEffect } from 'react';
import { generatePrintableQR } from '../utils/qrcode';

const QRCodeGenerator = ({ data, size = 150, title = "QR Code" }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [qrCodeDataURL, setQrCodeDataURL] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateQRCode();
  }, [data]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      const qrDataString = typeof data === 'string' ? data : JSON.stringify(data);
      
      // Use the existing QR code generation function
      const qrInfo = await generatePrintableQR(
        data.batchNumber || 'BATCH001',
        data.drugName || 'Stock Arrival',
        data.distributor || 'Unknown',
        data.timestamp || Date.now()
      );
      
      setQrCodeDataURL(qrInfo.qrCodeDataURL);
    } catch (error) {
      console.error('QR Code generation failed:', error);
      // Fallback to simple pattern if the function fails
      setQrCodeDataURL(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const qrDataString = typeof data === 'string' ? data : JSON.stringify(data);
    navigator.clipboard.writeText(qrDataString);
    alert('QR Code data copied to clipboard!');
  };

  const downloadQR = () => {
    if (qrCodeDataURL) {
      const element = document.createElement('a');
      element.href = qrCodeDataURL;
      element.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      // Fallback download
      const qrDataString = typeof data === 'string' ? data : JSON.stringify(data);
      const element = document.createElement('a');
      const file = new Blob([qrDataString], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `qr-code-${Date.now()}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <div className="flex justify-center items-center" style={{ height: size + 32 }}>
          <div className="text-white/60">Generating QR...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-white font-semibold flex items-center">
          📱 {title}
        </h4>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-white/60 hover:text-white text-xs px-2 py-1 bg-white/10 rounded transition-colors"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {/* QR Code Display */}
        <div 
          className="bg-white p-4 rounded-lg shadow-lg flex items-center justify-center"
          style={{ width: size + 32, height: size + 32 }}
        >
          {qrCodeDataURL ? (
            <img 
              src={qrCodeDataURL} 
              alt="QR Code" 
              style={{ width: size, height: size }}
              className="block"
            />
          ) : (
            // Fallback simple pattern
            <div className="text-black text-center">
              <div className="text-xs mb-2">QR Code</div>
              <div className="text-2xl">⬛⬜⬛⬜⬛</div>
              <div className="text-2xl">⬜⬛⬜⬛⬜</div>
              <div className="text-2xl">⬛⬜⬛⬜⬛</div>
              <div className="text-2xl">⬜⬛⬜⬛⬜</div>
              <div className="text-2xl">⬛⬜⬛⬜⬛</div>
            </div>
          )}
        </div>

        {/* QR Code Actions */}
        <div className="flex space-x-2">
          <button
            onClick={copyToClipboard}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded transition-colors flex items-center"
          >
            📋 Copy Data
          </button>
          <button
            onClick={downloadQR}
            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded transition-colors flex items-center"
          >
            💾 Download
          </button>
        </div>

        {/* QR Code Details */}
        {showDetails && (
          <div className="w-full bg-black/30 rounded-lg p-3 border border-white/10">
            <h5 className="text-white font-medium mb-2">QR Code Data:</h5>
            <div className="bg-black/50 rounded p-2 text-white/80 text-xs font-mono break-all max-h-32 overflow-y-auto">
              {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
            </div>
            <div className="mt-2 text-white/60 text-xs">
              Data Length: {(typeof data === 'string' ? data : JSON.stringify(data)).length} characters
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-white/60 text-xs">
          <p>Scan this QR code with any QR scanner</p>
          <p>to verify stock arrival information</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
