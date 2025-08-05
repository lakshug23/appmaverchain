import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

const QRScannerSimple = () => {
  const qrReaderRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState({ message: 'Loading scanner...', type: 'info' });
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [extractedCode, setExtractedCode] = useState('');
  const [countdown, setCountdown] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const returnUrl = location.state?.returnUrl || '/';

  // Smart code extraction function
  const extractCodeFromQR = (qrContent) => {
    console.log('Raw QR Content:', qrContent);
    
    // Pattern 1: Extract from qrbcl.com short links
    const qrbclMatch = qrContent.match(/qrbcl\.com\/\d+\/([A-Za-z0-9]+)/);
    if (qrbclMatch) {
      return qrbclMatch[1];
    }
    
    // Pattern 2: Extract from localhost verify links
    const localhostMatch = qrContent.match(/localhost:\d+\/verify\?code=([A-Za-z0-9]+)/);
    if (localhostMatch) {
      return localhostMatch[1];
    }
    
    // Pattern 3: Extract from any verify URL with code parameter
    const codeParamMatch = qrContent.match(/[?&]code=([A-Za-z0-9]+)/);
    if (codeParamMatch) {
      return codeParamMatch[1];
    }
    
    // Pattern 4: Check if it's already a plain code
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
    
    // Fallback: return original content
    return qrContent;
  };

  const showStatus = (message, type = 'info') => {
    setStatus({ message, type });
    console.log(`Status: ${message} (${type})`);
  };

  const showResultHandler = (resultText) => {
    const code = extractCodeFromQR(resultText);
    console.log(`Extracted code: ${code}`);
    
    setResult(resultText);
    setExtractedCode(code);
    setShowResult(true);
    showStatus('✅ QR Code scanned! Redirecting to verification...', 'success');
    
    // Start countdown and auto-redirect
    let timeLeft = 2;
    setCountdown(timeLeft);
    
    const timer = setInterval(() => {
      timeLeft--;
      setCountdown(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(timer);
        navigate(`/verify?code=${encodeURIComponent(code)}`);
      }
    }, 1000);
  };

  const onScanSuccess = (decodedText, decodedResult) => {
    console.log(`QR Code detected: ${decodedText}`);
    
    // Stop scanning
    if (html5QrCodeRef.current && isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        setIsScanning(false);
        showResultHandler(decodedText);
      }).catch((err) => {
        console.error('Error stopping scanner:', err);
      });
    }
  };

  const onScanFailure = (error) => {
    // Handle scan failure silently - this fires constantly while scanning
  };

  const startScanning = () => {
    if (isScanning || !html5QrCodeRef.current) {
      console.log('Scanner already running or not initialized');
      return;
    }

    console.log('Starting scanner...');
    showStatus('🔍 Scanning for QR codes...', 'info');

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
      defaultZoomValueIfSupported: 2
    };

    html5QrCodeRef.current.start(
      { facingMode: "environment" }, // Use back camera
      config,
      onScanSuccess,
      onScanFailure
    ).then(() => {
      setIsScanning(true);
      showStatus('🎯 Point camera at QR code', 'info');
      console.log('Scanner started successfully');
    }).catch((err) => {
      console.error('Error starting scanner:', err);
      showStatus(`❌ Could not start camera: ${err.message || err}`, 'error');
    });
  };

  const initializeScanner = () => {
    if (!Html5Qrcode) {
      console.error('Html5Qrcode not available');
      showStatus('❌ QR scanner library not loaded', 'error');
      return;
    }

    try {
      html5QrCodeRef.current = new Html5Qrcode("qr-reader");
      console.log('Scanner instance created');
      showStatus('📷 Checking for cameras...', 'info');

      // Request camera permissions and start scanning
      window.Html5Qrcode.getCameras().then(devices => {
        console.log(`Found ${devices.length} cameras:`, devices);
        if (devices && devices.length) {
          showStatus('📷 Camera found! Starting scanner...', 'success');
          setTimeout(startScanning, 1000);
        } else {
          showStatus('❌ No cameras found on this device', 'error');
        }
      }).catch(err => {
        console.error('Error getting cameras:', err);
        showStatus('❌ Could not access camera. Please check permissions.', 'error');
      });
    } catch (error) {
      console.error('Error initializing scanner:', error);
      showStatus('❌ Failed to initialize scanner', 'error');
    }
  };

  useEffect(() => {
    const loadScanner = () => {
      // Check if library is already loaded
      if (window.Html5Qrcode) {
        console.log('Library already loaded');
        setTimeout(initializeScanner, 100);
        return;
      }

      console.log('Loading QR scanner library...');
      showStatus('Loading scanner library...', 'info');

      // Load HTML5-QRCode library dynamically
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
      script.onload = () => {
        console.log('Library loaded successfully');
        setTimeout(initializeScanner, 100);
      };
      script.onerror = () => {
        console.error('Failed to load library');
        showStatus('❌ Failed to load QR scanner library', 'error');
      };
      document.head.appendChild(script);
    };

    loadScanner();

    // Cleanup function
    return () => {
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []); // Empty dependency array

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(extractedCode);
      showStatus('📋 Extracted code copied to clipboard!', 'success');
    } catch (err) {
      showStatus('❌ Could not copy to clipboard', 'error');
    }
  };

  const scanAgain = () => {
    setShowResult(false);
    setResult('');
    setExtractedCode('');
    setCountdown(null);
    setTimeout(startScanning, 500);
  };

  const goBack = () => {
    navigate(returnUrl);
  };

  const getStatusClasses = (type) => {
    const baseClasses = "mt-5 px-4 py-3 rounded-lg text-center font-medium";
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
      case 'error':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-100 text-blue-800 border border-blue-200`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col">
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
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 text-center relative">
            <button
              onClick={goBack}
              className="absolute left-4 top-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
              title="Go Back"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-4xl font-bold mb-2">📱 QR Code Scanner</h1>
            <p className="text-xl opacity-90">Simple & Reliable</p>
          </div>

          {/* Scanner Container */}
          <div className="p-8">
            <div id="qr-reader" className="w-full rounded-xl overflow-hidden shadow-lg bg-black/20 min-h-[300px]"></div>

            {/* Status */}
            <div className={getStatusClasses(status.type)}>
              {status.message}
            </div>

            {/* Result Container */}
            {showResult && (
              <div className="mt-6 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <h3 className="text-white text-xl font-bold mb-4 flex items-center">
                  ✅ QR Code Scanned Successfully!
                </h3>
                
                {/* Raw QR Content */}
                <div className="mb-4">
                  <h4 className="text-white/80 font-medium mb-2">📄 Raw QR Content:</h4>
                  <div className="bg-white/20 p-3 rounded-lg border border-white/30 text-white font-mono text-sm break-all">
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
                
                <div className="flex gap-3 mt-4 flex-wrap justify-center">
                  <button
                    onClick={() => navigate(`/verify?code=${encodeURIComponent(extractedCode)}`)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    🔍 Verify Now
                  </button>
                  <button 
                    onClick={copyResult}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    📋 Copy Code
                  </button>
                  <button 
                    onClick={scanAgain}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    🔄 Scan Again
                  </button>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <h3 className="text-white text-lg font-bold mb-3">📋 Instructions:</h3>
              <ul className="text-white/80 space-y-2">
                <li>• Allow camera access when prompted</li>
                <li>• Point your camera at the QR code</li>
                <li>• Hold steady until the code is detected</li>
                <li>• The result will appear below automatically</li>
              </ul>
            </div>

            {/* Debug Info */}
            <div className="mt-6 p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600/30">
              <h4 className="text-white text-sm font-bold mb-2">🔧 Debug Info:</h4>
              <div className="text-gray-300 text-xs space-y-1">
                <div>Library Loaded: {window.Html5Qrcode ? '✅ Yes' : '❌ No'}</div>
                <div>Scanner Initialized: {html5QrCodeRef.current ? '✅ Yes' : '❌ No'}</div>
                <div>Currently Scanning: {isScanning ? '✅ Yes' : '❌ No'}</div>
                <div>Result Found: {result ? '✅ Yes' : '❌ No'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScannerSimple;
