import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Send, 
  Megaphone
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const {
    kpi,
    classroomSummaries,
    notifications,
    sendBroadcastAnnouncement,
    showToast,
  } = useApp();

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('All Grades');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  const submittedRegisters = classroomSummaries.filter((c) => c.status === 'SUBMITTED').length;
  const totalClasses = classroomSummaries.length;

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    sendBroadcastAnnouncement(broadcastTitle, broadcastMessage, [broadcastTarget]);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const handleRemindPendingTeachers = () => {
    const pendingClasses = classroomSummaries
      .filter((c) => c.status !== 'SUBMITTED')
      .map((c) => c.teacher)
      .join(', ');
    showToast(`Reminders sent to form teachers: ${pendingClasses}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      
      {/* Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#e5e5ea]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#af52de] uppercase">
              Administration Dashboard · Section 11 &amp; 12
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
            The whole school, visible at a glance
          </h1>
          <p className="text-sm text-[#6e6e73]">
            Surfaces what needs attention — repeated absences, active registers, broadcast logs.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-[#e5e5ea] card-shadow">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#1d1d1f] text-white'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Live Registry &amp; Feeds
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-[#1d1d1f] text-white'
                : 'text-[#6e6e73] hover:text-[#1d1d1f]'
            }`}
          >
            Reports &amp; Analytics
          </button>
        </div>
      </div>

      {/* Top 3 KPI Cards (Matching admin-dashboard.svg) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e5ea] card-shadow">
          <div className="text-[10.5px] font-bold text-[#9a9aa0] uppercase tracking-wider mb-1">
            TOTAL ENROLMENT
          </div>
          <div className="text-3xl font-bold text-[#1d1d1f] mt-1">
            {kpi.totalEnrolment} Students
          </div>
          <div className="text-xs text-[#6e6e73] mt-2 flex items-center gap-1.5">
            <span className="text-[#0071e3] font-semibold">16 Sections</span>
            <span>· 28 Teaching Staff</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e5ea] card-shadow">
          <div className="text-[10.5px] font-bold text-[#9a9aa0] uppercase tracking-wider mb-1">
            AVG DAILY ATTENDANCE
          </div>
          <div className="text-3xl font-bold text-[#34c759] mt-1">
            {kpi.avgDailyAttendance}%
          </div>
          <div className="text-xs text-[#6e6e73] mt-2 flex items-center gap-1.5">
            <span className="text-[#34c759] font-semibold">↑ 0.8%</span>
            <span>from last month's average</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border border-[#e5e5ea] card-shadow">
          <div className="text-[10.5px] font-bold text-[#9a9aa0] uppercase tracking-wider mb-1">
            HOMEWORK COMPLETION
          </div>
          <div className="text-3xl font-bold text-[#0071e3] mt-1">
            {kpi.homeworkCompletionRate}%
          </div>
          <div className="text-xs text-[#6e6e73] mt-2 flex items-center gap-1.5">
            <span className="text-[#0071e3] font-semibold">92%</span>
            <span>parent acknowledgement rate</span>
          </div>
        </div>

      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Side: Classroom Registry Summary (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e5e5ea]">
              <div>
                <h2 className="text-base font-bold text-[#1d1d1f]">Classroom Registry Summary</h2>
                <p className="text-xs text-[#9a9aa0]">
                  {submittedRegisters} of {totalClasses} classes submitted registers today
                </p>
              </div>

              <button
                onClick={handleRemindPendingTeachers}
                className="text-xs font-semibold px-2.5 py-1.5 bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1d1d1f] rounded-lg transition-all border border-[#e5e5ea]"
              >
                Remind Pending
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10.5px] font-bold text-[#9a9aa0] uppercase tracking-wider border-b border-[#e5e5ea]">
                    <th className="pb-2.5">Class</th>
                    <th className="pb-2.5">Teacher</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Presence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f2] text-xs">
                  {classroomSummaries.map((c) => {
                    const isDone = c.status === 'SUBMITTED';
                    return (
                      <tr key={c.grade} className="hover:bg-[#fafafa] transition-colors">
                        <td className="py-3 font-bold text-[#1d1d1f]">{c.grade}</td>
                        <td className="py-3 text-[#6e6e73]">{c.teacher}</td>
                        <td className="py-3">
                          {isDone ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#e8f9ed] text-[#1a7a34]">
                              SUBMITTED ({c.timeMarked})
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#fff5e6] text-[#b36b00]">
                              DRAFT / PENDING
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right font-semibold text-[#1d1d1f]">
                          {isDone ? `${c.presentCount} / ${c.totalStudents}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f0f0f2] text-[11px] text-[#9a9aa0] flex items-center justify-between">
              <span>Automatic attendance archival at 10:00 AM</span>
              <span className="text-[#34c759] font-semibold">Zero paper registers</span>
            </div>
          </div>

          {/* Right Side: Dispatches & Broadcast Composer (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Live Dispatches Log */}
            <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e5e5ea]">
                <div>
                  <h2 className="text-base font-bold text-[#1d1d1f]">Realtime Feeds</h2>
                  <p className="text-xs text-[#9a9aa0]">Notification Delivery &amp; Read Receipts</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#34c759] animate-ping"></div>
              </div>

              <div className="space-y-3.5">
                {notifications.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#0071e3] shrink-0 mt-1.5"></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[#1d1d1f] truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#6e6e73] line-clamp-1">
                        {item.message}
                      </div>
                      <div className="text-[10px] text-[#9a9aa0] mt-0.5 flex items-center gap-2">
                        <span>{item.timestamp}</span>
                        <span>·</span>
                        <span className="text-[#34c759] font-medium">
                          {item.readPercentage || 95}% read rate
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Broadcast Composer */}
            <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
              <div className="flex items-center gap-2 mb-3">
                <Megaphone className="w-4 h-4 text-[#af52de]" />
                <h3 className="text-sm font-bold text-[#1d1d1f]">
                  Broadcast School Announcement
                </h3>
              </div>
              <p className="text-xs text-[#6e6e73] mb-4">
                Delivers urgent notices directly to parents' phones with read verification.
              </p>

              <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10.5px] font-bold text-[#9a9aa0] uppercase mb-1">
                    Audience
                  </label>
                  <select
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl text-xs font-medium"
                  >
                    <option value="All Grades">All Grades (School-wide)</option>
                    <option value="Class 7B">Class 7B Only</option>
                    <option value="Senior Wing">Senior Wing (Classes 8-10)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-[#9a9aa0] uppercase mb-1">
                    Notice Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Weather Advisory: Early Dismissal"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#e5e5ea] rounded-xl text-xs focus:outline-none focus:border-[#0071e3]"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-[#9a9aa0] uppercase mb-1">
                    Message Content
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide details for parents and staff..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#e5e5ea] rounded-xl text-xs focus:outline-none focus:border-[#0071e3] resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#af52de] hover:bg-[#8b3fba] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast Alert</span>
                </button>
              </form>
            </div>

          </div>

        </div>
      ) : (
        /* ANALYTICS & REPORTS TAB */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          
          {/* Attendance Trends */}
          <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
            <h3 className="text-base font-bold text-[#1d1d1f] mb-2">
              Weekly Attendance by Grade
            </h3>
            <p className="text-xs text-[#6e6e73] mb-6">
              Generated automatically from classroom teacher entries — no collation required.
            </p>

            <div className="space-y-4">
              {[
                { grade: 'Class 7B', rate: 95.4, count: '31/32' },
                { grade: 'Class 7A', rate: 93.3, count: '28/30' },
                { grade: 'Class 8A', rate: 96.4, count: '27/28' },
                { grade: 'Class 6A', rate: 100.0, count: '31/31' },
                { grade: 'Class 10A', rate: 96.6, count: '29/30' },
              ].map((row) => (
                <div key={row.grade}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-[#1d1d1f]">{row.grade}</span>
                    <span className="text-[#34c759]">{row.rate}% ({row.count})</span>
                  </div>
                  <div className="w-full bg-[#f5f5f7] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#34c759] h-full rounded-full"
                      style={{ width: `${row.rate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Homework Compliance Trends */}
          <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
            <h3 className="text-base font-bold text-[#1d1d1f] mb-2">
              Homework &amp; Parent Engagement
            </h3>
            <p className="text-xs text-[#6e6e73] mb-6">
              Read receipt latency and turn-in rates across subjects.
            </p>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e5e5ea] flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#1d1d1f]">Average Notice Read Time</div>
                  <div className="text-[11px] text-[#6e6e73]">82% of parents read notices within 45 mins</div>
                </div>
                <div className="text-lg font-bold text-[#0071e3]">38 min</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e5e5ea] flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#1d1d1f]">Absence Alert Acknowledgement</div>
                  <div className="text-[11px] text-[#6e6e73]">Parents confirming absence within morning hour</div>
                </div>
                <div className="text-lg font-bold text-[#34c759]">96.8%</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fafafa] border border-[#e5e5ea] flex justify-between items-center">
                <div>
                  <div className="font-bold text-[#1d1d1f]">Homework On-Time Submissions</div>
                  <div className="text-[11px] text-[#6e6e73]">Turned in prior to cut-off deadline</div>
                </div>
                <div className="text-lg font-bold text-[#ff9f0a]">88.2%</div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
