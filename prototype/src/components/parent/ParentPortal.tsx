import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  Calendar, 
  Bell, 
  Users, 
  Check, 
  CheckCheck,
  Fingerprint,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { NotificationCategory, HomeworkItem } from '../../types';
import { BiometricScannerModal } from '../common/BiometricScannerModal';

export const ParentPortal: React.FC = () => {
  const {
    students,
    attendance,
    homework,
    isStudentSubmitted,
    getBiometricSignature,
    signHomeworkWithBiometrics,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    activeChildId,
    setActiveChildId,
    activeChild,
    phoneFrameEnabled,
    setPhoneFrameEnabled,
  } = useApp();

  const [notifFilter, setNotifFilter] = useState<NotificationCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'notifications' | 'events'>('home');
  const [selectedHwForScan, setSelectedHwForScan] = useState<HomeworkItem | null>(null);

  // Filtered notifications
  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'all') return true;
    return n.category === notifFilter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Active child's attendance status
  const currentAttendance = attendance[activeChild.id] || 'present';

  // Active child's homework
  const childHomework = homework.filter((h) => h.grade === activeChild.grade);

  // Render Inner Mobile / Content Screen
  const renderScreenContent = () => (
    <div className="flex flex-col h-full bg-[#f5f5f7] overflow-y-auto">
      
      {/* Mobile Top Bar / Child Switcher */}
      <div className="bg-white border-b border-[#e5e5ea] px-4 py-3 sticky top-0 z-20 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
              style={{ backgroundColor: activeChild.avatarBg, color: '#1d1d1f' }}
            >
              {activeChild.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-[#1d1d1f]">{activeChild.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f5f5f7] text-[#6e6e73] font-semibold">
                  {activeChild.grade}
                </span>
              </div>
              <div className="text-[11px] text-[#6e6e73]">
                Divine School · Roll #{activeChild.rollNo}
              </div>
            </div>
          </div>

          {/* Child Switcher Dropdown */}
          <div className="relative">
            <select
              value={activeChildId}
              onChange={(e) => setActiveChildId(e.target.value)}
              className="text-xs bg-[#f5f5f7] text-[#1d1d1f] font-semibold py-1.5 px-2.5 rounded-lg border border-[#e5e5ea] focus:outline-none focus:ring-1 focus:ring-[#0071e3] cursor-pointer"
            >
              {students.filter(s => s.parentName === 'Khurshid Alam').map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.grade})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Screen Body depending on sub tab */}
      <div className="p-4 space-y-4 flex-1">

        {activeTab === 'home' && (
          <>
            {/* Section 1: Morning Attendance Status Pill */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#9a9aa0] uppercase tracking-wider">
                  Morning Attendance · Today
                </span>
                <span className="text-[10px] text-[#34c759] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34c759] animate-pulse"></span>
                  Live Sync
                </span>
              </div>

              {currentAttendance === 'present' && (
                <div className="p-3.5 rounded-2xl bg-[#e8f9ed] border border-[#34c759]/40 flex items-center gap-3 card-shadow animate-fade-in">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#1a7a34] shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1a7a34]">
                      Present Today
                    </div>
                    <div className="text-xs text-[#4a7a58]">
                      Certified in classroom entry by Mrs. Sharma
                    </div>
                  </div>
                </div>
              )}

              {currentAttendance === 'absent' && (
                <div className="p-3.5 rounded-2xl bg-[#ffe8e7] border border-[#ff3b30]/40 flex items-center gap-3 card-shadow animate-fade-in">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#ff3b30] shrink-0 shadow-xs">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#ff3b30]">
                      Absent Today
                    </div>
                    <div className="text-xs text-[#9c2b23]">
                      Marked absent at roll call. Official school office alerted.
                    </div>
                  </div>
                </div>
              )}

              {currentAttendance === 'late' && (
                <div className="p-3.5 rounded-2xl bg-[#fff5e6] border border-[#ff9f0a]/40 flex items-center gap-3 card-shadow animate-fade-in">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#b36b00] shrink-0 shadow-xs">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#b36b00]">
                      Late Arrival
                    </div>
                    <div className="text-xs text-[#8a5300]">
                      Arrived late at 09:05 AM · Class 7B
                    </div>
                  </div>
                </div>
              )}

              {currentAttendance === 'unmarked' && (
                <div className="p-3.5 rounded-2xl bg-[#f5f5f7] border border-[#e5e5ea] flex items-center gap-3 card-shadow animate-fade-in">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#6e6e73] shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1d1d1f]">
                      Waiting for Morning Roll Call
                    </div>
                    <div className="text-xs text-[#6e6e73]">
                      Class register will be updated as soon as teacher submits
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Active Tasks / Homework with Biometric Diary Sign-Off */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#9a9aa0] uppercase tracking-wider">
                  Active Tasks &amp; Diary Sign-Off
                </span>
                <span className="text-[10px] text-[#0071e3] font-semibold">
                  {childHomework.length} assigned
                </span>
              </div>

              <div className="space-y-2.5">
                {childHomework.map((item) => {
                  const isSubmitted = isStudentSubmitted(item.id, activeChild.id);
                  const sig = getBiometricSignature(item.id, activeChild.id);

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white border border-[#e5e5ea] card-shadow transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                            {item.subject.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-[#1d1d1f] leading-tight">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-[#6e6e73] mt-0.5">
                              {item.subject} · Due {item.dueDate}
                            </div>
                            <div className="text-[11px] text-[#9a9aa0] mt-1 line-clamp-1">
                              {item.instructions}
                            </div>
                          </div>
                        </div>

                        {/* Submission / Biometric Sign Pill */}
                        <div className="shrink-0 text-right">
                          {isSubmitted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#e8f9ed] text-[#1a7a34]">
                              <ShieldCheck className="w-3 h-3 text-[#1a7a34]" />
                              <span>CERTIFIED ✓</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelectedHwForScan(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0071e3] text-white hover:bg-[#0077ed] transition-all shadow-xs active:scale-95"
                              title="Sign off completed homework with your fingerprint"
                            >
                              <Fingerprint className="w-3 h-3" />
                              <span>Sign Diary</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Biometric Proof Stamp if verified */}
                      {isSubmitted && sig && (
                        <div className="mt-2.5 pt-2 border-t border-[#f0f0f2] flex items-center justify-between text-[10px] text-[#6e6e73]">
                          <div className="flex items-center gap-1 text-[#1a7a34] font-medium truncate">
                            <Fingerprint className="w-3 h-3 shrink-0" />
                            <span>Verified by {sig.verifiedBy}</span>
                          </div>
                          <span className="text-[#9a9aa0] shrink-0 font-mono text-[9px] bg-[#f5f5f7] px-1.5 py-0.5 rounded">
                            {sig.verificationHash}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Upcoming Event Card */}
            <div>
              <div className="text-[11px] font-bold text-[#9a9aa0] uppercase tracking-wider mb-2">
                Upcoming School Event
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-[#e5e5ea] card-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#e8f1fc] text-[#0071e3] flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1d1d1f]">
                      Parent-Teacher Meeting (PTM)
                    </div>
                    <div className="text-[11px] text-[#6e6e73] mt-0.5">
                      Saturday, Aug 8 · 09:00 AM · Hall B
                    </div>
                    <div className="text-[10px] text-[#0071e3] font-semibold mt-1">
                      Time Slot: 10:30 AM (Mrs. Sharma)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SUB TAB: TASKS / HOMEWORK DETAIL */}
        {activeTab === 'tasks' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-[#1d1d1f]">
                Tasks for {activeChild.name} ({childHomework.length})
              </span>
              <span className="text-[11px] text-[#6e6e73]">Class {activeChild.grade}</span>
            </div>

            {childHomework.map((item) => {
              const isSubmitted = isStudentSubmitted(item.id, activeChild.id);
              const sig = getBiometricSignature(item.id, activeChild.id);

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#e5e5ea] card-shadow"
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="text-xs font-bold text-[#1d1d1f]">{item.title}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fff5e6] text-[#b36b00]">
                      Due {item.dueDate}
                    </span>
                  </div>
                  <div className="text-xs text-[#6e6e73] mb-2">{item.instructions}</div>
                  
                  {isSubmitted && sig && (
                    <div className="my-2 p-2 bg-[#e8f9ed] rounded-xl text-[10.5px] text-[#1a7a34] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Biometric Diary Proof: Certified by Parent</span>
                      </div>
                      <span className="font-mono text-[9px] bg-white px-1.5 py-0.5 rounded shadow-xs">
                        {sig.verificationHash}
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#f0f0f2] flex items-center justify-between text-xs">
                    <span className="text-[#9a9aa0]">Teacher: {item.teacherName}</span>
                    {isSubmitted ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#e8f9ed] text-[#1a7a34] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Certified Done</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => setSelectedHwForScan(item)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0071e3] text-white hover:bg-[#0077ed] flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <Fingerprint className="w-3.5 h-3.5" />
                        <span>Sign Diary (Fingerprint)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* SUB TAB: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-[#1d1d1f]">
                Notification Feed ({filteredNotifications.length})
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-[11px] text-[#0071e3] font-semibold hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10.5px]">
              {(['all', 'attendance', 'homework', 'announcement', 'event'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setNotifFilter(cat)}
                  className={`px-2.5 py-1 rounded-full font-semibold transition-all uppercase whitespace-nowrap ${
                    notifFilter === cat
                      ? 'bg-[#1d1d1f] text-white'
                      : 'bg-white border border-[#e5e5ea] text-[#6e6e73] hover:text-[#1d1d1f]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Notification items */}
            <div className="space-y-2.5">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationAsRead(n.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    n.isRead
                      ? 'bg-white border-[#e5e5ea]'
                      : 'bg-[#e8f1fc]/30 border-[#0071e3]/40 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#0071e3] shrink-0"></span>
                      )}
                      <span className="text-xs font-bold text-[#1d1d1f]">{n.title}</span>
                    </div>
                    <span className="text-[10px] text-[#9a9aa0] shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-[11.5px] text-[#6e6e73] leading-relaxed pl-3.5">
                    {n.message}
                  </p>
                  <div className="mt-2 pl-3.5 flex items-center justify-between text-[10.5px] text-[#9a9aa0]">
                    <span>From: {n.sender}</span>
                    <span className="capitalize">{n.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="bg-white border-t border-[#e5e5ea] px-6 py-2 sticky bottom-0 z-20 flex items-center justify-between shadow-xs">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all ${
            activeTab === 'home' ? 'text-[#0071e3]' : 'text-[#9a9aa0] hover:text-[#1d1d1f]'
          }`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${activeTab === 'home' ? 'bg-[#0071e3]' : 'bg-transparent'}`} />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all ${
            activeTab === 'tasks' ? 'text-[#0071e3]' : 'text-[#9a9aa0] hover:text-[#1d1d1f]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Tasks</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-all relative ${
            activeTab === 'notifications' ? 'text-[#0071e3]' : 'text-[#9a9aa0] hover:text-[#1d1d1f]'
          }`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-[#ff3b30]"></span>
          )}
          <span>Inbox</span>
        </button>

        <button
          onClick={() => setActiveTab('home')}
          className="flex flex-col items-center gap-1 text-[10px] font-semibold text-[#9a9aa0] hover:text-[#1d1d1f]"
        >
          <Users className="w-4 h-4" />
          <span>Family</span>
        </button>
      </div>

    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#e5e5ea]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#0071e3] uppercase">
              Parent Application · Section 09
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
            A parent's view of their child's day
          </h1>
          <p className="text-sm text-[#6e6e73]">
            Instant morning attendance confirmation and digital fingerprint diary verification.
          </p>
        </div>

        {/* View Mode Toggle (Phone Mockup vs Expanded Desktop Card) */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#e5e5ea] card-shadow">
          <button
            onClick={() => setPhoneFrameEnabled(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              phoneFrameEnabled
                ? 'bg-[#1d1d1f] text-white'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone Frame</span>
          </button>
          <button
            onClick={() => setPhoneFrameEnabled(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !phoneFrameEnabled
                ? 'bg-[#1d1d1f] text-white'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Expanded Cards</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      {phoneFrameEnabled ? (
        /* Realistic Phone Frame View (Centered with sidebar explanation) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Phone Shell (6 cols) */}
          <div className="lg:col-span-6 flex justify-center py-2">
            <div className="iphone-frame relative">
              <div className="iphone-notch"></div>
              {renderScreenContent()}
            </div>
          </div>

          {/* Explanation & Feature Breakdown (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
              <h3 className="text-base font-bold text-[#1d1d1f] mb-3">
                Key Design Promises for Divine School
              </h3>
              <ul className="space-y-3.5 text-xs text-[#6e6e73]">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#e8f9ed] text-[#1a7a34] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-[#1d1d1f]">Instant Attendance Confirmation:</strong> As soon as Mrs. Sharma taps submit on her smartphone in the classroom, the status turns green here immediately.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#e8f1fc] text-[#0071e3] flex items-center justify-center shrink-0 mt-0.5">
                    <Fingerprint className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <strong className="text-[#1d1d1f]">Biometric Diary Sign-Off:</strong> Replaces physical diary signatures with a parent fingerprint press. Authenticates and time-stamps homework review without paper slips.
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#fef3c7] text-[#b45309] flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-[#1d1d1f]">Multi-child Switching:</strong> Switch between <em>Aryan Khurshid (Class 7B)</em> and <em>Aisha Khurshid (Class 4A)</em> seamlessly.
                  </div>
                </li>
              </ul>
            </div>

            {/* Test Interactive Scenario Callout */}
            <div className="bg-[#e8f1fc]/40 rounded-2xl border border-[#0071e3]/30 p-5">
              <div className="text-xs font-bold text-[#004ea2] mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0071e3]" />
                <span>Multi-Tab Real-Time Demo Instructions:</span>
              </div>
              <p className="text-xs text-[#004ea2]/90 leading-relaxed mb-3">
                Click <strong>"Launch Portals"</strong> in the top header to open the <strong>Teacher Portal</strong> in another tab. Toggle Aryan's attendance or publish homework — this mobile screen reacts instantly without page refresh!
              </p>
            </div>

          </div>

        </div>
      ) : (
        /* Expanded Desktop Cards View */
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-[#e5e5ea] overflow-hidden card-shadow">
          {renderScreenContent()}
        </div>
      )}

      {/* Biometric Scanner Modal */}
      {selectedHwForScan && (
        <BiometricScannerModal
          isOpen={!!selectedHwForScan}
          onClose={() => setSelectedHwForScan(null)}
          homeworkTitle={selectedHwForScan.title}
          homeworkSubject={selectedHwForScan.subject}
          studentName={activeChild.name}
          studentId={activeChild.id}
          parentName="Khurshid Alam (Father)"
          onConfirm={(sig) => {
            signHomeworkWithBiometrics(selectedHwForScan.id, activeChild.id, sig);
            setSelectedHwForScan(null);
          }}
        />
      )}

    </div>
  );
};
