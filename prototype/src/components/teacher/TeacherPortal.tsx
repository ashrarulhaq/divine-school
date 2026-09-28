import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CheckCircle, 
  Plus, 
  Send, 
  Check, 
  BookOpen, 
  ChevronRight,
  Sparkles,
  Fingerprint
} from 'lucide-react';

type TeacherTab = 'dashboard' | 'attendance' | 'homework' | 'timetable';

export const TeacherPortal: React.FC = () => {
  const {
    students,
    attendance,
    setStudentAttendance,
    submitAttendanceRegister,
    notifyAbsentees,
    isRegisterSubmitted,
    homework,
    addHomework,
    timetable,
    getBiometricSignature,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TeacherTab>('dashboard');

  // New Homework Form State
  const [newHwClass, setNewHwClass] = useState('Class 7B · Mathematics');
  const [newHwTitle, setNewHwTitle] = useState('');
  const [newHwDue, setNewHwDue] = useState('Aug 12, 2026 (Wed)');
  const [newHwInstructions, setNewHwInstructions] = useState('');

  // Class 7B students
  const class7BStudents = students.filter((s) => s.grade === 'Class 7B');
  const presentCount = class7BStudents.filter(
    (s) => attendance[s.id] === 'present' || attendance[s.id] === 'late'
  ).length;
  const absentCount = class7BStudents.filter((s) => attendance[s.id] === 'absent').length;
  const lateCount = class7BStudents.filter((s) => attendance[s.id] === 'late').length;

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHwTitle.trim()) return;

    addHomework({
      title: newHwTitle,
      subject: 'Mathematics',
      grade: 'Class 7B',
      dueDate: newHwDue,
      instructions: newHwInstructions || 'Complete all exercises in notebook.',
      tags: ['Homework', 'Class 7B'],
    });

    setNewHwTitle('');
    setNewHwInstructions('');
    setActiveTab('homework');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Sub-navigation bar matching Divine design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#e5e5ea]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#0071e3] uppercase">
              Teacher Portal · Section 07
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
            A teacher's day, without the re-typing
          </h1>
          <p className="text-sm text-[#6e6e73]">
            Welcome back, Mrs. Sharma. Class 7B Form Teacher &amp; Mathematics Lead.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-[#e5e5ea] card-shadow">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#1d1d1f] text-white'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Day View
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'attendance'
                ? 'bg-[#1d1d1f] text-white'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            <span>Attendance</span>
            {absentCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#ff3b30] text-white text-[10px] flex items-center justify-center font-bold">
                {absentCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('homework')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'homework'
                ? 'bg-[#1d1d1f] text-white'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Homework
          </button>
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'timetable'
                ? 'bg-[#1d1d1f] text-white'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Timetable
          </button>
        </div>
      </div>

      {/* TAB 1: DAY VIEW / DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Left Column: Today's Timetable (7 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-[#1d1d1f]">Today's Timetable</h2>
                  <p className="text-xs text-[#9a9aa0]">Thursday, 6 August 2026 · Term II</p>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#e8f1fc] text-[#0071e3]">
                  4 Periods Today
                </span>
              </div>

              <div className="space-y-3">
                {timetable.map((period) => {
                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#f5f5f7] text-[#6e6e73]">
                      PENDING
                    </span>
                  );
                  if (period.status === 'COMPLETED') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#e8f9ed] text-[#1a7a34]">
                        PRESENT · DONE
                      </span>
                    );
                  } else if (period.status === 'ACTIVE') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#fff5e6] text-[#b36b00] animate-pulse">
                        IN PROGRESS
                      </span>
                    );
                  }

                  const isFirstPeriod = period.id === 'tp-01';

                  return (
                    <div
                      key={period.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isFirstPeriod
                          ? 'bg-[#e8f1fc]/40 border-[#0071e3]/30'
                          : 'bg-white border-[#e5e5ea] hover:border-[#9a9aa0]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0071e3]">
                              {period.timeSlot}
                            </span>
                            <span className="text-xs text-[#9a9aa0]">·</span>
                            <span className="text-sm font-semibold text-[#1d1d1f]">
                              {period.subject} ({period.grade})
                            </span>
                          </div>
                          <div className="text-xs text-[#6e6e73]">
                            Topic: {period.topic} · {period.studentCount} Students · {period.room}
                          </div>
                        </div>
                        <div className="shrink-0">{statusBadge}</div>
                      </div>

                      {isFirstPeriod && (
                        <div className="mt-3 pt-3 border-t border-[#0071e3]/20 flex items-center justify-between text-xs">
                          <span className="text-[#6e6e73]">
                            Morning register: <strong>{presentCount} of 32 present</strong>
                          </span>
                          <button
                            onClick={() => setActiveTab('attendance')}
                            className="text-[#0071e3] font-semibold hover:underline flex items-center gap-1"
                          >
                            Open Class 7B Register <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-[#fafafa] rounded-2xl border border-[#e5e5ea] p-5 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm font-semibold text-[#1d1d1f]">Quick Classroom Actions</div>
                <div className="text-xs text-[#6e6e73]">Common tasks repeated every morning</div>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="px-3 py-2 bg-white hover:bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5 transition-all card-shadow cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-[#34c759]" />
                  Mark Attendance
                </button>
                <button
                  onClick={() => setActiveTab('homework')}
                  className="px-3 py-2 bg-[#0071e3] hover:bg-[#004ea2] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Homework
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Fast Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Stat Box: Average Attendance */}
            <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
              <div className="text-[11px] font-bold text-[#9a9aa0] uppercase tracking-wider mb-2">
                Class 7B Attendance
              </div>
              <div className="flex items-baseline gap-3">
                <div className="text-3xl font-bold text-[#34c759]">
                  {Math.round((presentCount / 32) * 100 * 10) / 10}%
                </div>
                <span className="text-xs text-[#6e6e73]">
                  {presentCount} of 32 present
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-[#6e6e73]">
                <span className="text-[#34c759] font-semibold">↑ 1.2%</span>
                <span>higher than school-wide average</span>
              </div>

              <div className="mt-4 pt-4 border-t border-[#e5e5ea] flex items-center justify-between text-xs">
                <span className="text-[#9a9aa0]">Absentees today:</span>
                <span className={`font-semibold ${absentCount > 0 ? 'text-[#ff3b30]' : 'text-[#34c759]'}`}>
                  {absentCount === 0 ? 'None (Full class)' : `${absentCount} Absent`}
                </span>
              </div>
            </div>

            {/* Active Assignments List */}
            <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold text-[#1d1d1f]">Active Assignments</div>
                <button
                  onClick={() => setActiveTab('homework')}
                  className="text-xs text-[#0071e3] font-semibold hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="space-y-3.5">
                {homework.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#e8f1fc] text-[#0071e3] flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#1d1d1f] truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#6e6e73]">
                        {item.grade} · Due {item.dueDate}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-[#1d1d1f]">
                        {item.submittedCount}/{item.totalStudents}
                      </div>
                      <div className="text-[10px] text-[#9a9aa0]">turned in</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-[#e5e5ea]">
                <button
                  onClick={() => setActiveTab('homework')}
                  className="w-full py-2 bg-[#f5f5f7] hover:bg-[#e5e5ea] rounded-xl text-xs font-semibold text-[#1d1d1f] transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Open Homework Manager</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#6e6e73]" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: ATTENDANCE REGISTER */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Main Roster (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#e5e5ea]">
              <div>
                <h2 className="text-lg font-bold text-[#1d1d1f]">
                  Class 7B Attendance Register
                </h2>
                <p className="text-xs text-[#9a9aa0]">
                  Thursday, 6 August 2026 · Marked by Mrs. Sharma · Single tap toggles status
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6e6e73]">
                  Present: <strong className="text-[#1a7a34]">{presentCount}</strong> / 32
                </span>
                {absentCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#ffe8e7] text-[#ff3b30] font-semibold">
                    {absentCount} Absent
                  </span>
                )}
              </div>
            </div>

            {/* Student Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#e5e5ea] text-[11px] font-bold text-[#9a9aa0] uppercase tracking-wider">
                    <th className="pb-3 w-16">Roll</th>
                    <th className="pb-3">Student Name</th>
                    <th className="pb-3 w-36">Status</th>
                    <th className="pb-3 w-48 text-right">Quick Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f2] text-xs">
                  {class7BStudents.map((student) => {
                    const status = attendance[student.id] || 'present';

                    let pill = (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#e8f9ed] text-[#1a7a34]">
                        PRESENT
                      </span>
                    );
                    if (status === 'absent') {
                      pill = (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#ffe8e7] text-[#ff3b30]">
                          ABSENT
                        </span>
                      );
                    } else if (status === 'late') {
                      pill = (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase bg-[#fff5e6] text-[#ff9f0a]">
                          LATE
                        </span>
                      );
                    }

                    return (
                      <tr key={student.id} className="hover:bg-[#fafafa] transition-colors">
                        <td className="py-3.5 font-medium text-[#6e6e73]">
                          #{student.rollNo}
                        </td>
                        <td className="py-3.5">
                          <div className="font-semibold text-[#1d1d1f] text-sm">
                            {student.name}
                          </div>
                          <div className="text-[11px] text-[#9a9aa0]">
                            Parent: {student.parentName} ({student.parentPhone})
                          </div>
                        </td>
                        <td className="py-3.5">{pill}</td>
                        <td className="py-3.5 text-right">
                          <div className="inline-flex rounded-lg border border-[#e5e5ea] p-0.5 bg-[#f5f5f7]">
                            <button
                              onClick={() => setStudentAttendance(student.id, 'present')}
                              className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                                status === 'present'
                                  ? 'bg-white text-[#1a7a34] shadow-xs'
                                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                              }`}
                              title="Mark Present"
                            >
                              Present
                            </button>
                            <button
                              onClick={() => setStudentAttendance(student.id, 'late')}
                              className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                                status === 'late'
                                  ? 'bg-white text-[#b36b00] shadow-xs'
                                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                              }`}
                              title="Mark Late"
                            >
                              Late
                            </button>
                            <button
                              onClick={() => setStudentAttendance(student.id, 'absent')}
                              className={`px-2 py-1 text-[11px] font-semibold rounded cursor-pointer ${
                                status === 'absent'
                                  ? 'bg-white text-[#ff3b30] shadow-xs'
                                  : 'text-[#6e6e73] hover:text-[#1d1d1f]'
                              }`}
                              title="Mark Absent"
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Summary & Dispatch Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Roster Status Box */}
            <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
              <h3 className="text-base font-bold text-[#1d1d1f] mb-4">Roster Summary</h3>

              {/* Status Pill Card */}
              <div className="p-4 rounded-xl bg-[#e8f9ed] border border-[#c3ebcb] mb-4">
                <div className="text-2xl font-bold text-[#1a7a34]">
                  {presentCount} / {class7BStudents.length}
                </div>
                <div className="text-xs font-semibold text-[#4a7a58]">
                  Students Present in Classroom
                </div>
              </div>

              <div className="space-y-2.5 text-xs mb-6">
                <div className="flex justify-between py-1.5 border-b border-[#f0f0f2]">
                  <span className="text-[#6e6e73]">On-time Present:</span>
                  <span className="font-semibold text-[#1d1d1f]">{presentCount - lateCount}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#f0f0f2]">
                  <span className="text-[#6e6e73]">Late arrivals:</span>
                  <span className="font-semibold text-[#ff9f0a]">{lateCount}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#f0f0f2]">
                  <span className="text-[#6e6e73]">Absentees:</span>
                  <span className="font-semibold text-[#ff3b30]">{absentCount}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#6e6e73]">Register Status:</span>
                  <span className="font-bold text-[#0071e3]">
                    {isRegisterSubmitted ? 'Submitted (08:45 AM)' : 'Draft (Unsubmitted)'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={submitAttendanceRegister}
                  className="w-full py-2.5 bg-[#0071e3] hover:bg-[#004ea2] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Save &amp; Submit Register
                </button>

                <button
                  onClick={notifyAbsentees}
                  disabled={absentCount === 0}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                    absentCount > 0
                      ? 'bg-[#ffe8e7] hover:bg-[#ffdcd9] text-[#ff3b30] border-[#ff3b30]/30 cursor-pointer'
                      : 'bg-[#f5f5f7] text-[#9a9aa0] border-[#e5e5ea] cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>Notify Absent Parents ({absentCount})</span>
                </button>
              </div>

              <p className="text-[11px] text-[#9a9aa0] mt-4 leading-relaxed">
                Absentees receive an automated morning SMS &amp; app notification, saving phone calls and manual WhatsApp notices.
              </p>
            </div>

            {/* Design Principle note */}
            <div className="bg-[#f5f5f7] rounded-2xl border border-[#e5e5ea] p-5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1d1d1f] mb-2">
                <Sparkles className="w-4 h-4 text-[#0071e3]" />
                <span>Zero Duplicate Entry</span>
              </div>
              <p className="text-xs text-[#6e6e73] leading-relaxed">
                Once marked here, attendance arrives directly on the parent's phone and automatically updates the Principal's administration dashboard.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* TAB 3: HOMEWORK MANAGEMENT */}
      {activeTab === 'homework' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* Published Homework Table (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e5e5ea]">
              <div>
                <h2 className="text-lg font-bold text-[#1d1d1f]">Published Homework</h2>
                <p className="text-xs text-[#9a9aa0]">Class 7B · Mathematics</p>
              </div>
              <span className="text-xs text-[#0071e3] font-semibold bg-[#e8f1fc] px-2.5 py-1 rounded-full">
                {homework.length} Active Tasks
              </span>
            </div>

            <div className="space-y-4">
              {homework.map((item) => {
                const submissionRatio = item.totalStudents > 0 
                  ? Math.round((item.submittedCount / item.totalStudents) * 100) 
                  : 0;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-[#e5e5ea] hover:border-[#9a9aa0] transition-all bg-white"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="font-bold text-sm text-[#1d1d1f]">
                          {item.title}
                        </div>
                        <div className="text-xs text-[#6e6e73] mt-0.5">
                          {item.instructions}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#fff5e6] text-[#b36b00] shrink-0">
                        Due {item.dueDate}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 pt-3 border-t border-[#f0f0f2] flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-2 text-[#6e6e73]">
                        <span>Submissions:</span>
                        <strong className="text-[#1d1d1f]">
                          {item.submittedCount} / {item.totalStudents}
                        </strong>
                        <span className="text-[#9a9aa0]">({submissionRatio}%)</span>
                      </div>

                      {/* Bar indicator */}
                      <div className="w-32 bg-[#f5f5f7] h-2 rounded-full overflow-hidden shrink-0">
                        <div
                          className="bg-[#0071e3] h-full rounded-full transition-all duration-500"
                          style={{ width: `${submissionRatio}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Biometric Sign-off notification for teachers */}
                    {getBiometricSignature(item.id, 's-01') && (
                      <div className="mt-2.5 pt-2 border-t border-[#f0f0f2] flex items-center justify-between text-[11px] text-[#1a7a34] bg-[#e8f9ed]/50 px-2.5 py-1.5 rounded-lg">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Fingerprint className="w-3.5 h-3.5 text-[#1a7a34]" />
                          <span>Aryan Khurshid's Diary: Certified by Father</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#4a7a58]">
                          {getBiometricSignature(item.id, 's-01')?.verificationHash}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create Homework Form (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
            <div className="mb-6 pb-4 border-b border-[#e5e5ea]">
              <h2 className="text-lg font-bold text-[#1d1d1f]">Create New Homework</h2>
              <p className="text-xs text-[#9a9aa0]">
                Publishes simultaneously to parents and student task lists.
              </p>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-4 text-xs">
              
              {/* Target Class */}
              <div>
                <label className="block text-[10.5px] font-bold text-[#9a9aa0] uppercase tracking-wider mb-1.5">
                  Assign to Class
                </label>
                <select
                  value={newHwClass}
                  onChange={(e) => setNewHwClass(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl text-xs font-semibold text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                >
                  <option value="Class 7B · Mathematics">Class 7B · Mathematics (32 Students)</option>
                  <option value="Class 7A · Mathematics">Class 7A · Mathematics (30 Students)</option>
                  <option value="Class 8A · Algebra Fundamentals">Class 8A · Algebra Fundamentals (28 Students)</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-[10.5px] font-bold text-[#9a9aa0] uppercase tracking-wider mb-1.5">
                  Homework Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fractions & Decimals Word Problems"
                  value={newHwTitle}
                  onChange={(e) => setNewHwTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#e5e5ea] rounded-xl text-xs text-[#1d1d1f] placeholder-[#9a9aa0] focus:outline-none focus:border-[#0071e3] transition-all"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-[10.5px] font-bold text-[#9a9aa0] uppercase tracking-wider mb-1.5">
                  Due Date
                </label>
                <input
                  type="text"
                  value={newHwDue}
                  onChange={(e) => setNewHwDue(e.target.value)}
                  placeholder="e.g. Aug 12, 2026 (Wednesday)"
                  className="w-full px-3 py-2 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl text-xs text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-[10.5px] font-bold text-[#9a9aa0] uppercase tracking-wider mb-1.5">
                  Instructions / Notebook Tasks
                </label>
                <textarea
                  rows={3}
                  value={newHwInstructions}
                  onChange={(e) => setNewHwInstructions(e.target.value)}
                  placeholder="Solve problems 14 to 22 on notebook. Upload photo of steps or bring to next period."
                  className="w-full px-3 py-2 bg-white border border-[#e5e5ea] rounded-xl text-xs text-[#1d1d1f] placeholder-[#9a9aa0] focus:outline-none focus:border-[#0071e3] resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-[#0071e3] hover:bg-[#004ea2] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish to Parents &amp; Students</span>
              </button>

              <div className="p-3 bg-[#e8f1fc]/50 rounded-xl border border-[#c7ddf6] text-[11px] text-[#004ea2] leading-relaxed">
                💡 <strong>Instant Delivery:</strong> Homework published here immediately appears on parents' mobile app and Aryan's student task list.
              </div>
            </form>
          </div>

        </div>
      )}

      {/* TAB 4: TIMETABLE VIEW */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow animate-fade-in">
          <div className="mb-6 pb-4 border-b border-[#e5e5ea]">
            <h2 className="text-lg font-bold text-[#1d1d1f]">Weekly Schedule &amp; Allocation</h2>
            <p className="text-xs text-[#9a9aa0]">Mrs. Sharma · Mathematics Department</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timetable.map((t, idx) => (
              <div key={t.id} className="p-4 rounded-xl border border-[#e5e5ea] bg-[#fafafa]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0071e3]">Period 0{idx + 1}</span>
                  <span className="text-xs font-semibold text-[#6e6e73]">{t.timeSlot}</span>
                </div>
                <div className="font-bold text-sm text-[#1d1d1f] mb-1">
                  {t.subject} — {t.grade}
                </div>
                <div className="text-xs text-[#6e6e73] mb-2">{t.topic}</div>
                <div className="text-[11px] text-[#9a9aa0] flex items-center gap-1.5">
                  <span>Room:</span>
                  <strong className="text-[#1d1d1f]">{t.room}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
