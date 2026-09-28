import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  RotateCcw, 
  Bell,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  LogIn,
  Cloud,
  Zap
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    currentUser,
    setIsLoginModalOpen,
    notifications,
    toast,
    resetDemoData,
    isStandalone,
    isCloudMode,
  } = useApp();

  const [tabDropdownOpen, setTabDropdownOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roles: { id: Role; label: string; icon: React.ReactNode; userBadge: string; description: string }[] = [
    {
      id: 'teacher',
      label: 'Teacher Portal',
      icon: <GraduationCap className="w-4 h-4" />,
      userBadge: 'Mrs. Sharma · Class 7B',
      description: 'Quick-tap classroom attendance & homework dispatch',
    },
    {
      id: 'parent',
      label: 'Parent App',
      icon: <Users className="w-4 h-4" />,
      userBadge: 'Khurshid Alam (Aryan\'s Father)',
      description: 'Morning attendance alert & biometric diary sign-off',
    },
    {
      id: 'student',
      label: 'Student Portal',
      icon: <BookOpen className="w-4 h-4" />,
      userBadge: 'Aryan Khurshid · Roll #01',
      description: 'Task countdowns, exam datesheet & personal records',
    },
    {
      id: 'admin',
      label: 'Admin Dashboard',
      icon: <ShieldCheck className="w-4 h-4" />,
      userBadge: 'Principal & Management',
      description: 'School KPIs, classroom registry audit & broadcasts',
    },
  ];

  const handleOpenStandaloneTab = (portalRole: Role) => {
    const url = `${window.location.origin}${window.location.pathname}?portal=${portalRole}`;
    window.open(url, '_blank');
    setTabDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e5e5ea] transition-all shadow-xs">
      {/* Toast Alert bar if active */}
      {toast && (
        <div className="bg-[#1d1d1f] text-white px-4 py-2 text-xs font-medium flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 text-[#34c759] shrink-0" />
            <span>{toast}</span>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-[10px] bg-[#1d1d1f] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base tracking-wider">D</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[15px] tracking-tight text-[#1d1d1f]">Divine School</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#e8f1fc] text-[#0071e3]">
                  {isStandalone ? `${role.toUpperCase()} MODE` : 'Live Product Prototype'}
                </span>
                {isCloudMode ? (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200"
                    title="Connected to Supabase PostgreSQL with 4G WebSockets real-time sync"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <Cloud className="w-3 h-3 text-emerald-600" />
                    <span className="hidden sm:inline">Cloud 4G Live</span>
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                    title="Running in Local Bus mode (BroadcastChannel). Add Supabase keys to .env to connect live cloud."
                  >
                    <Zap className="w-3 h-3 text-amber-600" />
                    <span className="hidden sm:inline">Local Bus</span>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#9a9aa0] hidden sm:block">
                Digital Management &amp; Parent Communication System
              </div>
            </div>
          </div>

          {/* Role Switcher Pills (Hidden or simplified in standalone, full in demo) */}
          <div className="flex items-center bg-[#f5f5f7] p-1 rounded-xl border border-[#e5e5ea] overflow-x-auto max-w-full">
            {roles.map((r) => {
              const isActive = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-[#1d1d1f] shadow-sm font-bold'
                      : 'text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-white/50'
                  }`}
                  title={r.description}
                >
                  <span className={isActive ? 'text-[#0071e3]' : 'text-[#9a9aa0]'}>
                    {r.icon}
                  </span>
                  <span className="hidden md:inline">{r.label}</span>
                  <span className="md:hidden capitalize">{r.id}</span>
                </button>
              );
            })}
          </div>

          {/* Right Tools: Multi-Tab Launcher & User Sign-in */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Multi-Tab Opener Dropdown */}
            <div className="relative">
              <button
                onClick={() => setTabDropdownOpen(!tabDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#e8f1fc] text-[#0071e3] hover:bg-[#d5e7fc] rounded-lg text-xs font-bold transition-all border border-[#0071e3]/20"
                title="Open separate portal windows to demo live real-time sync across devices/tabs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Launch Portals</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {tabDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e5e5ea] p-2 z-50 animate-fade-in text-xs">
                  <div className="px-3 py-1.5 font-bold text-[#1d1d1f] border-b border-[#e5e5ea] mb-1">
                    Open in Independent Tabs
                    <div className="text-[10px] text-[#9a9aa0] font-normal">
                      Demo real-time sync across screens
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenStandaloneTab('teacher')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f5f5f7] flex items-center justify-between text-[#1d1d1f]"
                  >
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#0071e3]" />
                      <span>Teacher Portal Tab</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-[#9a9aa0]" />
                  </button>
                  <button
                    onClick={() => handleOpenStandaloneTab('parent')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f5f5f7] flex items-center justify-between text-[#1d1d1f]"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#34c759]" />
                      <span>Parent App Tab</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-[#9a9aa0]" />
                  </button>
                  <button
                    onClick={() => handleOpenStandaloneTab('admin')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f5f5f7] flex items-center justify-between text-[#1d1d1f]"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#af52de]" />
                      <span>Admin Dashboard Tab</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-[#9a9aa0]" />
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <div 
              onClick={() => setRole('parent')}
              className="relative p-2 rounded-lg text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] cursor-pointer transition-colors"
              title={`${unreadCount} notifications`}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ff3b30]"></span>
              )}
            </div>

            {/* User Login Chip */}
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#e5e5ea] hover:bg-[#f5f5f7] text-xs transition-colors"
              title="Click to switch account or change password"
            >
              <div className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse"></div>
              <span className="font-semibold text-[#1d1d1f] max-w-[110px] truncate">
                {currentUser?.name || 'Sign In'}
              </span>
              <LogIn className="w-3 h-3 text-[#9a9aa0]" />
            </button>

            {/* Reset Demo Button */}
            <button
              onClick={resetDemoData}
              className="p-2 text-[#9a9aa0] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-lg transition-colors"
              title="Reset data to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Realtime Status Helper Strip */}
      <div className="bg-[#fafafa] border-t border-[#e5e5ea]/60 px-4 py-1.5 text-[11.5px] text-[#6e6e73]">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
            <span>
              Active Persona: <strong className="text-[#1d1d1f]">{roles.find((r) => r.id === role)?.userBadge}</strong>
            </span>
          </div>
          <div className="text-[11px] text-[#34c759] font-medium hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#34c759] animate-ping"></span>
            <span>Live Cross-Tab Sync Active (Open 2+ tabs to see instant push)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
