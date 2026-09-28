import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { TeacherPortal } from './components/teacher/TeacherPortal';
import { ParentPortal } from './components/parent/ParentPortal';
import { StudentPortal } from './components/student/StudentPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { PushNotificationBanner } from './components/common/PushNotificationBanner';
import { PwaInstallBanner } from './components/common/PwaInstallBanner';
import { LoginModal } from './components/auth/LoginModal';

export const App: React.FC = () => {
  const {
    role,
    setRole,
    activePushBanner,
    dismissPushBanner,
    isLoginModalOpen,
    setIsLoginModalOpen,
    login,
  } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7] relative">
      {/* Real-time Slide-down Push Notification Banner */}
      <PushNotificationBanner
        event={activePushBanner}
        onDismiss={dismissPushBanner}
      />

      {/* PWA Mobile Installation Prompt */}
      <PwaInstallBanner />

      {/* Global Header */}
      <Header />

      {/* Portal Views */}
      <main className="flex-1 pb-12">
        {role === 'teacher' && <TeacherPortal />}
        {role === 'parent' && <ParentPortal />}
        {role === 'student' && <StudentPortal />}
        {role === 'admin' && <AdminPortal />}
      </main>

      {/* Login & Credential Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={login}
      />

      {/* Footer */}
      <footer className="border-t border-[#e5e5ea] bg-white py-6 text-xs text-[#6e6e73]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#1d1d1f] flex items-center justify-center text-white font-bold text-[10px]">
              D
            </div>
            <span className="font-semibold text-[#1d1d1f]">Divine School Platform</span>
            <span>·</span>
            <span>Digital Management &amp; Parent Communication System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setRole('teacher')}
              className={`hover:text-[#1d1d1f] ${role === 'teacher' ? 'font-bold text-[#0071e3]' : ''}`}
            >
              Teacher View
            </button>
            <span>·</span>
            <button
              onClick={() => setRole('parent')}
              className={`hover:text-[#1d1d1f] ${role === 'parent' ? 'font-bold text-[#0071e3]' : ''}`}
            >
              Parent Mobile App
            </button>
            <span>·</span>
            <button
              onClick={() => setRole('student')}
              className={`hover:text-[#1d1d1f] ${role === 'student' ? 'font-bold text-[#0071e3]' : ''}`}
            >
              Student Portal
            </button>
            <span>·</span>
            <button
              onClick={() => setRole('admin')}
              className={`hover:text-[#1d1d1f] ${role === 'admin' ? 'font-bold text-[#0071e3]' : ''}`}
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
