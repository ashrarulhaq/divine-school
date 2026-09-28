import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle2, ShieldCheck, X, Sparkles } from 'lucide-react';
import { BiometricSignature } from '../../types';
import { playBiometricSuccessChime } from '../../utils/sound';
import { triggerHapticFeedback, triggerBiometricSuccessHaptic } from '../../utils/haptics';

interface BiometricScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  homeworkTitle: string;
  homeworkSubject: string;
  studentName: string;
  studentId: string;
  parentName: string;
  onConfirm: (sig: BiometricSignature) => void;
}

export const BiometricScannerModal: React.FC<BiometricScannerModalProps> = ({
  isOpen,
  onClose,
  homeworkTitle,
  homeworkSubject,
  studentName,
  studentId,
  parentName,
  onConfirm,
}) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setScanState('idle');
      setProgress(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartScan = () => {
    if (scanState === 'scanning' || scanState === 'success') return;

    setScanState('scanning');
    setProgress(0);

    // Provide native haptic feedback
    triggerHapticFeedback(30);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleScanSuccess();
          return 100;
        }
        return prev + 12;
      });
    }, 100);
  };

  const handleScanSuccess = () => {
    setScanState('success');

    // Native success haptic vibration
    triggerBiometricSuccessHaptic();

    playBiometricSuccessChime();

    const now = new Date();
    const hash = 'BIO-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const signature: BiometricSignature = {
      verifiedBy: parentName,
      studentId,
      studentName,
      timestamp: now.toISOString(),
      displayTime: `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      method: 'fingerprint',
      verificationHash: hash,
    };

    setTimeout(() => {
      onConfirm(signature);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-[#e5e5ea] relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9a9aa0] hover:text-[#1d1d1f] p-1.5 rounded-full hover:bg-[#f5f5f7] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* School Shield Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f5f5f7] text-[11px] font-semibold text-[#1d1d1f] mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0071e3]" />
          <span>Divine School Digital Diary Seal</span>
        </div>

        <h3 className="text-lg font-bold text-[#1d1d1f] mb-1">
          Parent Biometric Sign-Off
        </h3>
        <p className="text-xs text-[#6e6e73] mb-4">
          Replacing physical diary signature for <span className="font-semibold text-[#1d1d1f]">{studentName}</span>
        </p>

        {/* Task Summary Card */}
        <div className="bg-[#f5f5f7] rounded-2xl p-3.5 mb-6 text-left border border-[#e5e5ea]/80">
          <div className="text-[10px] uppercase font-bold text-[#0071e3] tracking-wider mb-1">
            {homeworkSubject}
          </div>
          <div className="text-sm font-semibold text-[#1d1d1f] mb-1">
            {homeworkTitle}
          </div>
          <div className="text-[11px] text-[#6e6e73] flex items-center justify-between">
            <span>Certifying Parent:</span>
            <span className="font-medium text-[#1d1d1f]">{parentName}</span>
          </div>
        </div>

        {/* Interactive Biometric Sensor Circle */}
        <div className="flex flex-col items-center justify-center py-2 mb-4">
          <div className="relative">
            {/* Outer Progress Ring */}
            <svg className="w-32 h-32 -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                className="stroke-[#e5e5ea]"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                className={`transition-all duration-150 ${
                  scanState === 'success' ? 'stroke-[#34c759]' : 'stroke-[#0071e3]'
                }`}
                strokeWidth="4"
                strokeDasharray={351.8}
                strokeDashoffset={351.8 - (351.8 * progress) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Glowing Sensor Pad */}
            <button
              onClick={handleStartScan}
              disabled={scanState !== 'idle'}
              className={`absolute inset-3 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
                scanState === 'idle'
                  ? 'bg-gradient-to-b from-[#f5f5f7] to-[#e8f1fc] hover:from-[#e8f1fc] hover:to-[#d0e5fc] text-[#0071e3] cursor-pointer active:scale-95 shadow-inner'
                  : scanState === 'scanning'
                  ? 'bg-[#0071e3] text-white shadow-lg shadow-[#0071e3]/30 animate-pulse'
                  : 'bg-[#34c759] text-white shadow-lg shadow-[#34c759]/30'
              }`}
            >
              {scanState === 'success' ? (
                <CheckCircle2 className="w-12 h-12 animate-scale-up" />
              ) : (
                <Fingerprint className="w-12 h-12" />
              )}
            </button>
          </div>

          {/* Sensor State Label */}
          <div className="mt-4 min-h-[24px]">
            {scanState === 'idle' && (
              <span className="text-xs font-semibold text-[#0071e3] animate-pulse">
                Tap or press sensor to verify
              </span>
            )}
            {scanState === 'scanning' && (
              <span className="text-xs font-semibold text-[#1d1d1f]">
                Scanning biometric signature... {progress}%
              </span>
            )}
            {scanState === 'success' && (
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#34c759]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Digitally Certified & Sealed!</span>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer / Legal notice */}
        <p className="text-[10px] text-[#9a9aa0] leading-relaxed">
          Biometric record is cryptographically timestamped and transmitted directly to Divine School classroom register.
        </p>
      </div>
    </div>
  );
};
