import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, BookOpen, X } from 'lucide-react';
import { RealtimeEvent } from '../../types';

interface PushNotificationBannerProps {
  event: RealtimeEvent | null;
  onDismiss: () => void;
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({
  event,
  onDismiss,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [event, onDismiss]);

  if (!event || !visible) return null;

  const getIcon = () => {
    switch (event.type) {
      case 'ATTENDANCE_MARKED':
      case 'ATTENDANCE_REGISTER_SUBMITTED':
        return <CheckCircle2 className="w-4 h-4 text-[#34c759]" />;
      case 'HOMEWORK_PUBLISHED':
      case 'HOMEWORK_SIGNED':
        return <BookOpen className="w-4 h-4 text-[#0071e3]" />;
      default:
        return <Bell className="w-4 h-4 text-[#ff9500]" />;
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-bounce-subtle pointer-events-auto">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-[#e5e5ea] flex items-start gap-3 transition-all duration-300 ring-1 ring-black/5">
        {/* App Icon */}
        <div className="w-9 h-9 rounded-xl bg-[#1d1d1f] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
          D
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              {getIcon()}
              <span className="text-xs font-bold text-[#1d1d1f] truncate">
                {event.title}
              </span>
            </div>
            <span className="text-[10px] text-[#9a9aa0] shrink-0">Just now</span>
          </div>
          <p className="text-xs text-[#6e6e73] leading-snug line-clamp-2">
            {event.message}
          </p>
          <div className="mt-1 text-[10px] text-[#9a9aa0] flex items-center gap-1">
            <span>Divine School Notification Service</span>
            <span>·</span>
            <span className="capitalize">{event.senderRole}</span>
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onDismiss, 300);
          }}
          className="text-[#9a9aa0] hover:text-[#1d1d1f] p-1 rounded-full hover:bg-[#f5f5f7] shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
