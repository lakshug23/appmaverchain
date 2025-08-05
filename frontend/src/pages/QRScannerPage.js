import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

const QRScannerPage = () => {
  const navigate = useNavigate();
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState({ message: 'Initializing camera...', type: 'info' });
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [extractedCode, setExtractedCode] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const qrReaderRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const showStatus = (message, type = 'info') => {
    setStatus({ message, type });
  };

  // Smart code extraction function
  const extractCodeFromQR = (qrContent) => {
    console.log('Raw QR Content:', qrContent);
    
    // Pattern 1: Extract from qrbcl.com short links (https://qrbcl.com/5/BVKB51BWRV)
    const qrbclMatch = qrContent.match(/qrbcl\.com\/\d+\/([A-Za-z0-9]+)/);
    if (qrbclMatch) {
      return qrbclMatch[1];
    }
    
    // Pattern 2: Extract from localhost verify links (http://localhost:3000/verify?code=ABC123)
    const localhostMatch = qrContent.match(/localhost:\d+\/verify\?code=([A-Za-z0-9]+)/);
    if (localhostMatch) {
      return localhostMatch[1];
    }
    
    // Pattern 3: Extract from any verify URL with code parameter
    const codeParamMatch = qrContent.match(/[?&]code=([A-Za-z0-9]+)/);
    if (codeParamMatch) {
      return codeParamMatch[1];
    }
    
    // Pattern 4: Check if it's already a plain code (alphanumeric, 4-20 characters)
    const plainCodeMatch = qrContent.match(/^[A-Za-z0-9]{4,20}$/);
    if (plainCodeMatch) {
      return qrContent;
    }
    
    // Pattern 5: Extract batch numbers (MST followed by numbers)
    const batchMatch = qrContent.match(/MST\d+/);
    if (batchMatch) {
      return batchMatch[0];
    }
    
    // Pattern 6: Extract any alphanumeric sequence from URLs
    const urlCodeMatch = qrContent.match(/\/([A-Za-z0-9]{6,})/);
    if (urlCodeMatch) {
      return urlCodeMatch[1];
    }
    
    // Fallback: return original content if no pattern matches
    return qrContent;
  };

  const handleScanSuccess = (decodedText, decodedResult) => {
    console.log(`QR Code detected: ${decodedText}`);
    
    // Extract the meaningful code
    const code = extractCodeFromQR(decodedText);
    console.log(`Extracted code: ${code}`);
    
    // Immediately set results and stop scanning
    setResult(decodedText);
    setExtractedCode(code);
    setShowResult(true);
    showStatus('✅ QR Code scanned successfully! Redirecting...', 'success');
    
    // Test if navigate function is available
    console.log('Navigate function available:', typeof navigate);
    console.log(`Would redirect to: /verify?code=${code}`);
    
    // IMMEDIATE redirect test
    console.log('Testing immediate redirect...');
    try {
      navigate(`/verify?code=${encodeURIComponent(code)}`);
      console.log('Immediate redirect executed successfully');
    } catch (error) {
      console.error('Immediate redirect failed:', error);
    }
    
    // Start countdown and auto-redirect (backup)
    let timeLeft = 3;
    setCountdown(timeLeft);
    
    const timer = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);
      console.log(`Countdown: ${timeLeft}`);
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        console.log('Timer redirect executing...');
        try {
          navigate(`/verify?code=${encodeURIComponent(code)}`);
          console.log('Timer redirect executed successfully');
        } catch (error) {
          console.error('Timer redirect failed:', error);
        }
      }
    }, 1000);
    
    // Stop scanning in background (don't wait for it)
    if (html5QrCode && isScanning) {
      html5QrCode.stop().then(() => {
        setIsScanning(false);
        console.log('Scanner stopped successfully');
      }).catch((err) => {
        console.error('Error stopping scanner:', err);
        setIsScanning(false);
      });
    }
    
    // Backup redirect in case timer fails
    setTimeout(() => {
      console.log('Backup redirect executing...');
      try {
        navigate(`/verify?code=${encodeURIComponent(code)}`);
        console.log('Backup redirect executed successfully');
      } catch (error) {
        console.error('Backup redirect failed:', error);
      }
    }, 4000);
  };

  const handleScanFailure = (error) => {
    // Handle scan failure silently - this fires constantly while scanning
    // Only log actual errors, not continuous scanning attempts
    if (error && !error.toString().includes('NotFoundException')) {
      // console.log(`QR Code scan error: ${error}`);
    }
  };

  const startScanning = async () => {
    if (isScanning || !html5QrCode) return;
    
    try {
      showStatus('🔍 Scanning for QR codes...', 'info');
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2
      };
      
      await html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        config,
        handleScanSuccess,
        handleScanFailure
      );
      
      setIsScanning(true);
      showStatus('🎯 Point camera at QR code', 'info');
    } catch (err) {
      console.error('Error starting scanner:', err);
      showStatus('❌ Could not access camera. Please check permissions.', 'error');
    }
  };

  const copyResult = () => {
    if (extractedCode) {
      navigator.clipboard.writeText(extractedCode).then(() => {
        showStatus('📋 Extracted code copied to clipboard!', 'success');
      }).catch(() => {
        showStatus('❌ Could not copy to clipboard', 'error');
      });
    }
  };

  const scanAgain = () => {
    setShowResult(false);
    setResult(null);
    setExtractedCode(null);
    setCountdown(null);
    
    if (html5QrCode && !isScanning) {
      setTimeout(() => startScanning(), 500);
    }
  };

  useEffect(() => {
    // Initialize scanner when component mounts
    const initScanner = async () => {
      if (isInitialized) return;
      
      try {
        const scanner = new Html5Qrcode("qr-reader");
        setHtml5QrCode(scanner);
        setIsInitialized(true);
        
        // Request camera permissions and start scanning
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          showStatus('📷 Camera found! Starting scanner...', 'success');
          setTimeout(async () => {
            try {
              await scanner.start(
                { facingMode: "environment" },
                {
                  fps: 10,
                  qrbox: { width: 250, height: 250 },
                  aspectRatio: 1.0,
                  showTorchButtonIfSupported: true,
                  showZoomSliderIfSupported: true,
                  defaultZoomValueIfSupported: 2
                },
                handleScanSuccess,
                handleScanFailure
              );
              setIsScanning(true);
              showStatus('🎯 Point camera at QR code', 'info');
            } catch (err) {
              console.error('Error starting scanner:', err);
              showStatus('❌ Could not access camera. Please check permissions.', 'error');
            }
          }, 1000);
        } else {
          showStatus('❌ No cameras found on this device', 'error');
        }
      } catch (err) {
        console.error('Error initializing scanner:', err);
        showStatus('❌ Could not initialize camera. Please check permissions.', 'error');
      }
    };

    initScanner();

    // Cleanup function
    return () => {
      if (html5QrCode && isScanning) {
        html5QrCode.stop().then(() => {
          setIsScanning(false);
        }).catch((err) => {
          console.error('Error stopping scanner:', err);
        });
      }
    };
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, stop scanning
        if (html5QrCode && isScanning) {
          html5QrCode.stop().then(() => {
            setIsScanning(false);
          }).catch((err) => {
            console.error('Error stopping scanner:', err);
          });
        }
      } else {
        // Page is visible again, restart scanning if not showing results
        if (!showResult && html5QrCode && !isScanning) {
          setTimeout(() => startScanning(), 1000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [html5QrCode, isScanning, showResult]);

  const getStatusClass = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.3)' }}
        >
          <source src="/assets/videos/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen py-8 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-4">
          <div className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden border border-white/20">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 text-center">
              <h1 className="text-4xl font-bold mb-2">📱 QR Code Scanner</h1>
              <p className="text-green-100 text-lg">Point your camera at a QR code to scan</p>
            </div>

            {/* Scanner Container */}
            <div className="p-8">
              {/* QR Reader */}
              <div className="mb-6">
                <div 
                  id="qr-reader" 
                  ref={qrReaderRef}
                  className="w-full rounded-lg overflow-hidden shadow-lg"
                  style={{ minHeight: '300px' }}
                ></div>
              </div>

              {/* Status */}
              <div className={`p-4 rounded-lg border text-center font-medium mb-6 ${getStatusClass(status.type)}`}>
                {status.message}
              </div>

              {/* Result Container */}
              {showResult && result && (
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 mb-6">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                    ✅ QR Code Scanned Successfully!
                  </h3>
                  
                  {/* Raw QR Content */}
                  <div className="mb-4">
                    <h4 className="text-white/80 font-medium mb-2">📄 Raw QR Content:</h4>
                    <div className="bg-white/20 p-3 rounded-lg border border-white/30 font-mono text-sm text-white break-all">
                      {result}
                    </div>
                  </div>

                  {/* Extracted Code */}
                  <div className="mb-4">
                    <h4 className="text-white/80 font-medium mb-2">🔍 Extracted Code:</h4>
                    <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 p-4 rounded-lg border border-green-400/30">
                      <div className="text-green-100 text-2xl font-bold text-center">
                        {extractedCode}
                      </div>
                    </div>
                  </div>

                  {/* Countdown */}
                  {countdown !== null && countdown > 0 && (
                    <div className="mb-4 text-center">
                      <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                        <p className="text-white/90 mb-2">🚀 Auto-redirecting to verification page in:</p>
                        <div className="text-4xl font-bold text-blue-200">
                          {countdown}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 flex-wrap justify-center">
                    <button
                      onClick={() => navigate(`/verify?code=${encodeURIComponent(extractedCode)}`)}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
                    >
                      🔍 Verify Now
                    </button>
                    <button
                      onClick={copyResult}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                    >
                      📋 Copy Code
                    </button>
                    <button
                      onClick={scanAgain}
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center"
                    >
                      🔄 Scan Again
                    </button>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-white/5 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="text-white font-bold mb-3">📋 Instructions:</h3>
                <ul className="text-white/80 space-y-2 pl-5">
                  <li className="list-disc">Allow camera access when prompted</li>
                  <li className="list-disc">Point your camera at the QR code</li>
                  <li className="list-disc">Hold steady until the code is detected</li>
                  <li className="list-disc">The result will appear below automatically</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles for QR Reader */}
      <style jsx>{`
        /* Hide QR Reader dashboard */
        :global(#qr-reader__dashboard_section) {
          display: none !important;
        }
        
        :global(#qr-reader__camera_selection) {
          margin-bottom: 10px;
        }
        
        :global(video) {
          border-radius: 10px !important;
        }
        
        :global(#qr-reader) {
          border: none !important;
        }
        
        :global(#qr-reader > div) {
          border: none !important;
        }
      `}</style>
    </div>
  );
};

export default QRScannerPage;
