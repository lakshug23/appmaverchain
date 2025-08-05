import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const QRScanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = location.state?.returnUrl || '/';

  const goBack = () => {
    navigate(returnUrl);
  };

  useEffect(() => {
    // Load the HTML5-QRCode library
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
    script.onload = initializeQRScanner;
    document.head.appendChild(script);

    return () => {
      // Cleanup when component unmounts
      if (window.html5QrCode && window.isScanning) {
        window.html5QrCode.stop().catch(console.error);
      }
    };
  }, []);

  const initializeQRScanner = () => {
    // Global variables for the scanner (same as standalone)
    window.html5QrCode = null;
    window.isScanning = false;

    function showStatus(message, type = 'info') {
      const status = document.getElementById('status');
      if (status) {
        status.textContent = message;
        status.className = `status ${type}`;
      }
      console.log(`Status: ${message} (${type})`);
    }

    function isURL(string) {
      try {
        new URL(string);
        return true;
      } catch {
        return false;
      }
    }

    function isEmail(string) {
      return string.toLowerCase().startsWith('mailto:') || 
             /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(string);
    }

    function isPhone(string) {
      return string.startsWith('tel:') || 
             /^[\+]?[1-9][\d]{3,14}$/.test(string.replace(/[\s\-\(\)]/g, ''));
    }

    function isWiFi(string) {
      return string.startsWith('WIFI:');
    }

    function getQRType(result) {
      if (isURL(result)) return 'url';
      if (isEmail(result)) return 'email';
      if (isPhone(result)) return 'phone';
      if (isWiFi(result)) return 'wifi';
      if (result.startsWith('BEGIN:VCARD')) return 'contact';
      if (result.includes('bitcoin:') || result.includes('ethereum:')) return 'crypto';
      return 'text';
    }

    function showResult(result) {
      const resultContainer = document.getElementById('result-container');
      const resultText = document.getElementById('result-text');
      const actionButtons = document.getElementById('action-buttons');
      const qrType = getQRType(result);
      
      if (resultText) {
        // If it's a URL, make it clickable
        if (qrType === 'url') {
          resultText.innerHTML = `<a href="${result}" target="_blank" rel="noopener noreferrer" style="color: #2196F3; text-decoration: underline; word-break: break-all;">${result}</a>`;
        } else if (qrType === 'email') {
          const emailLink = result.startsWith('mailto:') ? result : `mailto:${result}`;
          resultText.innerHTML = `<a href="${emailLink}" style="color: #2196F3; text-decoration: underline; word-break: break-all;">${result}</a>`;
        } else if (qrType === 'phone') {
          const phoneLink = result.startsWith('tel:') ? result : `tel:${result}`;
          resultText.innerHTML = `<a href="${phoneLink}" style="color: #2196F3; text-decoration: underline; word-break: break-all;">${result}</a>`;
        } else {
          resultText.textContent = result;
        }
      }
      
      // Add appropriate action button based on QR type
      if (actionButtons && actionButtons.firstChild) {
        let actionButton = null;
        
        switch (qrType) {
          case 'url':
            actionButton = document.createElement('button');
            actionButton.textContent = '🔗 Open Link';
            actionButton.style.background = '#2196F3';
            actionButton.onmouseover = () => actionButton.style.background = '#1976D2';
            actionButton.onmouseout = () => actionButton.style.background = '#2196F3';
            actionButton.onclick = () => {
              window.open(result, '_blank', 'noopener,noreferrer');
              showStatus('🔗 Link opened in new tab!', 'success');
            };
            break;
            
          case 'email':
            actionButton = document.createElement('button');
            actionButton.textContent = '📧 Send Email';
            actionButton.style.background = '#FF9800';
            actionButton.onmouseover = () => actionButton.style.background = '#F57C00';
            actionButton.onmouseout = () => actionButton.style.background = '#FF9800';
            actionButton.onclick = () => {
              const emailLink = result.startsWith('mailto:') ? result : `mailto:${result}`;
              window.location.href = emailLink;
              showStatus('📧 Email client opened!', 'success');
            };
            break;
            
          case 'phone':
            actionButton = document.createElement('button');
            actionButton.textContent = '📞 Call';
            actionButton.style.background = '#4CAF50';
            actionButton.onmouseover = () => actionButton.style.background = '#45a049';
            actionButton.onmouseout = () => actionButton.style.background = '#4CAF50';
            actionButton.onclick = () => {
              const phoneLink = result.startsWith('tel:') ? result : `tel:${result}`;
              window.location.href = phoneLink;
              showStatus('📞 Dialer opened!', 'success');
            };
            break;
            
          case 'contact':
            actionButton = document.createElement('button');
            actionButton.textContent = '👤 Save Contact';
            actionButton.style.background = '#9C27B0';
            actionButton.onmouseover = () => actionButton.style.background = '#7B1FA2';
            actionButton.onmouseout = () => actionButton.style.background = '#9C27B0';
            actionButton.onclick = () => {
              const blob = new Blob([result], { type: 'text/vcard' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'contact.vcf';
              a.click();
              URL.revokeObjectURL(url);
              showStatus('� Contact file downloaded!', 'success');
            };
            break;
        }
        
        if (actionButton) {
          actionButton.style.cssText += `
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            fontSize: 14px;
            font-weight: 500;
            color: white;
            transition: all 0.3s ease;
            margin-right: 10px;
          `;
          actionButtons.insertBefore(actionButton, actionButtons.firstChild);
        }
      }
      
      if (resultContainer) {
        resultContainer.classList.add('show');
      }
      
      // Show appropriate success message
      let successMessage = '✅ QR Code scanned successfully!';
      switch (qrType) {
        case 'url': successMessage = '🔗 Website link detected!'; break;
        case 'email': successMessage = '📧 Email address detected!'; break;
        case 'phone': successMessage = '📞 Phone number detected!'; break;
        case 'contact': successMessage = '👤 Contact card detected!'; break;
        case 'wifi': successMessage = '📶 WiFi credentials detected!'; break;
        case 'crypto': successMessage = '₿ Cryptocurrency address detected!'; break;
      }
      showStatus(successMessage, 'success');
    }

    function copyResult() {
      const resultText = document.getElementById('result-text');
      if (resultText) {
        navigator.clipboard.writeText(resultText.textContent).then(() => {
          showStatus('📋 Result copied to clipboard!', 'success');
        }).catch(() => {
          showStatus('❌ Could not copy to clipboard', 'error');
        });
      }
    }

    function scanAgain() {
      const resultContainer = document.getElementById('result-container');
      const actionButtons = document.getElementById('action-buttons');
      
      if (resultContainer) {
        resultContainer.classList.remove('show');
      }
      
      // Remove any dynamically added buttons (like "Open Link")
      if (actionButtons) {
        const dynamicButtons = actionButtons.querySelectorAll('button:not([data-original])');
        dynamicButtons.forEach(btn => btn.remove());
      }
      
      if (window.html5QrCode && !window.isScanning) {
        startScanning();
      }
    }

    function onScanSuccess(decodedText, decodedResult) {
      console.log(`QR Code detected: ${decodedText}`);
      
      // Stop scanning
      if (window.html5QrCode && window.isScanning) {
        window.html5QrCode.stop().then(() => {
          window.isScanning = false;
          showResult(decodedText);
        }).catch((err) => {
          console.error('Error stopping scanner:', err);
        });
      }
    }

    function onScanFailure(error) {
      // Handle scan failure silently - this fires constantly while scanning
    }

    function startScanning() {
      if (window.isScanning) return;
      
      showStatus('🔍 Scanning for QR codes...', 'info');
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2
      };
      
      window.html5QrCode.start(
        { facingMode: "environment" }, // Use back camera
        config,
        onScanSuccess,
        onScanFailure
      ).then(() => {
        window.isScanning = true;
        showStatus('🎯 Point camera at QR code', 'info');
      }).catch((err) => {
        console.error('Error starting scanner:', err);
        showStatus(`❌ Could not start camera: ${err.message || err}`, 'error');
      });
    }

    // Initialize scanner when library is loaded
    if (window.Html5Qrcode) {
      window.html5QrCode = new window.Html5Qrcode("qr-reader");
      
      // Request camera permissions and start scanning
      window.Html5Qrcode.getCameras().then(devices => {
        console.log('Available cameras:', devices);
        if (devices && devices.length) {
          showStatus('📷 Camera found! Starting scanner...', 'success');
          setTimeout(startScanning, 500);
        } else {
          showStatus('❌ No cameras found on this device', 'error');
        }
      }).catch(err => {
        console.error('Error getting cameras:', err);
        showStatus('❌ Could not access camera. Please check permissions.', 'error');
      });
    }

    // Handle page visibility changes (same as standalone)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, stop scanning
        if (window.html5QrCode && window.isScanning) {
          window.html5QrCode.stop().then(() => {
            window.isScanning = false;
          }).catch((err) => {
            console.error('Error stopping scanner:', err);
          });
        }
      } else {
        // Page is visible again, restart scanning if not showing results
        const resultContainer = document.getElementById('result-container');
        if (!resultContainer || !resultContainer.classList.contains('show')) {
          setTimeout(startScanning, 500);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Make functions globally available for button clicks
    window.copyResult = copyResult;
    window.scanAgain = scanAgain;
  };

  return (
    <div className="min-h-screen" style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #4CAF50, #45a049)',
          color: 'white',
          padding: '30px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <button
            onClick={goBack}
            style={{
              position: 'absolute',
              left: '15px',
              top: '15px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Go Back"
          >
            ←
          </button>
          <h1 style={{ fontSize: '2rem', margin: '0 0 10px 0' }}>📱 QR Code Scanner</h1>
          <p style={{ opacity: 0.9, fontSize: '1.1rem', margin: 0 }}>Point your camera at a QR code to scan</p>
        </div>

        {/* Scanner Container */}
        <div style={{ padding: '30px' }}>
          <div 
            id="qr-reader" 
            style={{
              width: '100%',
              borderRadius: '10px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              minHeight: '300px',
              background: '#f0f0f0'
            }}
          ></div>
          
          <div 
            id="status" 
            className="status info"
            style={{
              marginTop: '20px',
              padding: '15px',
              borderRadius: '10px',
              textAlign: 'center',
              fontWeight: '500',
              background: '#d1ecf1',
              color: '#0c5460',
              border: '1px solid #bee5eb'
            }}
          >
            Initializing camera...
          </div>
          
          <div 
            id="result-container" 
            style={{
              marginTop: '20px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '10px',
              display: 'none'
            }}
          >
            <h3 style={{ color: '#333', marginBottom: '10px' }}>📄 Scanned Result:</h3>
            <div 
              id="result-text" 
              style={{
                background: 'white',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                fontSize: '14px',
                marginBottom: '15px'
              }}
            ></div>
            <div id="action-buttons" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                data-original="true"
                onClick={() => window.copyResult && window.copyResult()}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: '#4CAF50',
                  color: 'white',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#45a049'}
                onMouseOut={(e) => e.target.style.background = '#4CAF50'}
              >
                📋 Copy
              </button>
              <button 
                data-original="true"
                onClick={() => window.scanAgain && window.scanAgain()}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  background: '#6c757d',
                  color: 'white',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#5a6268'}
                onMouseOut={(e) => e.target.style.background = '#6c757d'}
              >
                🔄 Scan Again
              </button>
            </div>
          </div>
          
          <div style={{
            marginTop: '20px',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '10px',
            borderLeft: '4px solid #4CAF50'
          }}>
            <h3 style={{ color: '#333', marginBottom: '10px' }}>📋 Instructions:</h3>
            <ul style={{ color: '#666', paddingLeft: '20px' }}>
              <li style={{ marginBottom: '5px' }}>Allow camera access when prompted</li>
              <li style={{ marginBottom: '5px' }}>Point your camera at the QR code</li>
              <li style={{ marginBottom: '5px' }}>Hold steady until the code is detected</li>
              <li style={{ marginBottom: '5px' }}>The result will appear below automatically</li>
            </ul>
          </div>

          {/* Public Access Notice */}
          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'rgba(76, 175, 80, 0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            display: 'flex',
            alignItems: 'center',
            color: '#2e7d32'
          }}>
            <span style={{ marginRight: '8px' }}>ℹ️</span>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              This QR scanner is publicly accessible - no login required
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .status.success {
          background: #d4edda !important;
          color: #155724 !important;
          border: 1px solid #c3e6cb !important;
        }
        
        .status.error {
          background: #f8d7da !important;
          color: #721c24 !important;
          border: 1px solid #f5c6cb !important;
        }
        
        .status.info {
          background: #d1ecf1 !important;
          color: #0c5460 !important;
          border: 1px solid #bee5eb !important;
        }

        #result-container.show {
          display: block !important;
        }

        #qr-reader__dashboard_section {
          display: none !important;
        }
        
        #qr-reader video {
          border-radius: 10px !important;
        }

        @media (max-width: 768px) {
          .container {
            margin: 0;
            border-radius: 0;
            min-height: 100vh;
          }
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
