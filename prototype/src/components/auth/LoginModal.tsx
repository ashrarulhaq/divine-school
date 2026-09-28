import React, { useState } from 'react';
import { Lock, User, KeyRound, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { UserAccount } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const PRESET_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-teacher-01',
    username: 'teacher.sharma',
    name: 'Mrs. Sharma',
    role: 'teacher',
    grade: 'Class 7B',
    avatarBg: '#dbeafe',
  },
  {
    id: 'user-parent-01',
    username: 'parent.khurshid',
    name: 'Khurshid Alam',
    role: 'parent',
    linkedStudentIds: ['s-01', 's-05'],
    mustChangePassword: true,
    avatarBg: '#fef3c7',
  },
  {
    id: 'user-student-01',
    username: 'student.aryan',
    name: 'Aryan Khurshid',
    role: 'student',
    grade: 'Class 7B',
    avatarBg: '#e0e7ff',
  },
  {
    id: 'user-admin-01',
    username: 'admin.divine',
    name: 'Principal & Management',
    role: 'admin',
    avatarBg: '#f3e8ff',
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('parent.khurshid');
  const [password, setPassword] = useState('Divine@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);

  if (!isOpen) return null;

  const handleQuickSelect = (account: UserAccount) => {
    setUsername(account.username);
    setPassword('Divine@2026');
    setError(null);
  };

  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const found = PRESET_ACCOUNTS.find(
      (a) => a.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!found) {
      setError('Invalid username. Please check your credentials from the school register.');
      return;
    }

    if (password.length < 4) {
      setError('Please enter a valid password.');
      return;
    }

    // If first-time login for parents
    if (found.mustChangePassword && found.role === 'parent') {
      setPendingUser(found);
      setIsChangingPassword(true);
      return;
    }

    onLoginSuccess(found);
    if (onClose) onClose();
  };

  const handlePasswordChangeComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (pendingUser) {
      const updatedUser = { ...pendingUser, mustChangePassword: false };
      onLoginSuccess(updatedUser);
      setIsChangingPassword(false);
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#e5e5ea] relative">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center font-bold text-xl shadow-md mb-3">
            D
          </div>
          <h2 className="text-xl font-bold text-[#1d1d1f]">Divine School Portal</h2>
          <p className="text-xs text-[#6e6e73] mt-1">
            Official Parent, Teacher & Management Sign-In
          </p>
        </div>

        {/* Change Password View */}
        {isChangingPassword ? (
          <form onSubmit={handlePasswordChangeComplete} className="space-y-4">
            <div className="p-3 bg-[#e8f1fc] rounded-xl border border-[#0071e3]/30 text-xs text-[#0071e3]">
              <div className="font-bold flex items-center gap-1.5 mb-1">
                <KeyRound className="w-4 h-4" />
                First Time Login Required
              </div>
              Please set your private password before accessing your child's records.
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new private password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5ea] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5ea] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                required
              />
            </div>

            {error && (
              <div className="text-xs text-[#ff3b30] bg-[#fff2f2] p-2.5 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#0071e3] text-white font-semibold text-sm hover:bg-[#0077ed] transition-colors flex items-center justify-center gap-2"
            >
              <span>Save Password & Enter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Standard Login View */
          <form onSubmit={handleSubmitLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                School Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9a9aa0]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. parent.khurshid or teacher.sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#e5e5ea] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9a9aa0]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#e5e5ea] text-sm focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#9a9aa0] hover:text-[#1d1d1f]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-xs text-[#ff3b30] bg-[#fff2f2] p-2.5 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#0071e3] text-white font-semibold text-sm hover:bg-[#0077ed] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Sign In to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Selector */}
            <div className="pt-4 border-t border-[#e5e5ea]">
              <div className="text-[11px] font-bold text-[#9a9aa0] uppercase tracking-wider text-center mb-2.5">
                Quick Presentation Logins
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {PRESET_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleQuickSelect(acc)}
                    className={`p-2 rounded-xl text-left border transition-all ${
                      username === acc.username
                        ? 'border-[#0071e3] bg-[#e8f1fc]/40 font-semibold text-[#0071e3]'
                        : 'border-[#e5e5ea] hover:bg-[#f5f5f7] text-[#1d1d1f]'
                    }`}
                  >
                    <div className="capitalize text-[10px] text-[#9a9aa0]">{acc.role}</div>
                    <div className="truncate text-xs">{acc.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
