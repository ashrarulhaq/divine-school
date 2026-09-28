import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BookOpen, 
  CheckCircle2, 
  Upload, 
  Award
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const {
    students,
    homework,
    isStudentSubmitted,
    toggleHomeworkSubmission,
    exams,
  } = useApp();

  const [filterSubject, setFilterSubject] = useState<string>('all');

  // Student is Aryan Khurshid
  const currentStudent = students.find((s) => s.id === 's-01') || students[0];

  const class7BHomework = homework.filter((h) => h.grade === 'Class 7B');
  const filteredHomework = class7BHomework.filter((h) => {
    if (filterSubject === 'all') return true;
    return h.subject.toLowerCase() === filterSubject.toLowerCase();
  });

  const completedCount = class7BHomework.filter((h) =>
    isStudentSubmitted(h.id, currentStudent.id)
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      
      {/* Sub-header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#e5e5ea]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-[#0071e3] uppercase">
              Student Application · Section 10
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
            A student's work, organised for them
          </h1>
          <p className="text-sm text-[#6e6e73]">
            Welcome back, {currentStudent.name}. Class 7B · Roll #{currentStudent.rollNo}.
          </p>
        </div>

        {/* Attendance Badge */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#e5e5ea] card-shadow">
          <div className="w-8 h-8 rounded-full bg-[#e8f9ed] text-[#1a7a34] flex items-center justify-center font-bold text-xs">
            {currentStudent.attendanceRate}%
          </div>
          <div>
            <div className="text-xs font-bold text-[#1d1d1f]">Term Attendance</div>
            <div className="text-[11px] text-[#6e6e73]">{currentStudent.totalPresent} of {currentStudent.totalDays} school days</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Tasks (7 cols), Right Info & Exams (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Homework & Tasks */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
            
            {/* Header & Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#e5e5ea]">
              <div>
                <h2 className="text-lg font-bold text-[#1d1d1f]">My Tasks &amp; Assignments</h2>
                <p className="text-xs text-[#9a9aa0]">
                  {completedCount} of {class7BHomework.length} tasks submitted
                </p>
              </div>

              {/* Subject pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                {['all', 'mathematics', 'science', 'english'].map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setFilterSubject(sub)}
                    className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                      filterSubject === sub
                        ? 'bg-[#1d1d1f] text-white'
                        : 'bg-[#f5f5f7] text-[#6e6e73] hover:text-[#1d1d1f]'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            {/* Task list */}
            <div className="space-y-3.5">
              {filteredHomework.map((item) => {
                const isSubmitted = isStudentSubmitted(item.id, currentStudent.id);

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSubmitted
                        ? 'bg-[#f5f5f7]/60 border-[#e5e5ea]'
                        : 'bg-white border-[#e5e5ea] hover:border-[#0071e3]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isSubmitted
                              ? 'bg-[#e5e5ea] text-[#9a9aa0]'
                              : 'bg-[#e8f1fc] text-[#0071e3]'
                          }`}
                        >
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h3
                            className={`text-sm font-bold ${
                              isSubmitted ? 'text-[#9a9aa0] line-through' : 'text-[#1d1d1f]'
                            }`}
                          >
                            {item.title}
                          </h3>
                          <div className="text-xs text-[#6e6e73] mt-0.5">
                            {item.subject} · {item.teacherName}
                          </div>
                        </div>
                      </div>

                      {/* Due badge */}
                      <span
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase shrink-0 ${
                          isSubmitted
                            ? 'bg-[#e8f9ed] text-[#1a7a34]'
                            : 'bg-[#fff5e6] text-[#b36b00]'
                        }`}
                      >
                        {isSubmitted ? 'SUBMITTED' : `DUE ${item.dueDate}`}
                      </span>
                    </div>

                    <p className="text-xs text-[#6e6e73] pl-11 mb-3 leading-relaxed">
                      {item.instructions}
                    </p>

                    {/* Actions Bar */}
                    <div className="pl-11 pt-3 border-t border-[#f0f0f2] flex items-center justify-between">
                      <span className="text-[11px] text-[#9a9aa0]">
                        Assigned on {item.assignedDate}
                      </span>

                      <button
                        onClick={() => toggleHomeworkSubmission(item.id, currentStudent.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSubmitted
                            ? 'bg-white border border-[#e5e5ea] text-[#6e6e73] hover:text-[#ff3b30]'
                            : 'bg-[#0071e3] hover:bg-[#004ea2] text-white shadow-xs'
                        }`}
                      >
                        {isSubmitted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#34c759]" />
                            <span>Mark Incomplete</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Submit Assignment</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right: Exams Calendar & Info */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Unit Test Datesheet */}
          <div className="bg-white rounded-2xl border border-[#e5e5ea] p-6 card-shadow">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#e5e5ea]">
              <div>
                <h2 className="text-base font-bold text-[#1d1d1f]">Upcoming Exams</h2>
                <p className="text-xs text-[#9a9aa0]">Unit Test II Datesheet · Class 7B</p>
              </div>
              <span className="text-xs font-bold text-[#ff3b30] bg-[#ffe8e7] px-2.5 py-1 rounded-full">
                Starts Aug 10
              </span>
            </div>

            <div className="space-y-3.5">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="p-3.5 rounded-xl border border-[#e5e5ea] bg-[#fafafa] hover:bg-white transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#ff3b30]">{exam.date}</span>
                    <span className="text-[11px] font-semibold text-[#6e6e73]">{exam.time}</span>
                  </div>
                  <div className="text-sm font-bold text-[#1d1d1f] mb-1">
                    {exam.subject} — {exam.examName}
                  </div>
                  <div className="text-xs text-[#6e6e73] mb-2 leading-relaxed">
                    Syllabus: {exam.syllabus}
                  </div>
                  <div className="text-[11px] text-[#9a9aa0] flex items-center justify-between">
                    <span>Venue: {exam.room}</span>
                    <span className="text-[#0071e3] font-semibold">Hall Ticket Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Responsibility Note */}
          <div className="bg-[#f5eafa] rounded-2xl border border-[#af52de]/30 p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#641b8a] mb-1.5">
              <Award className="w-4 h-4 text-[#af52de]" />
              <span>Student Ownership principle</span>
            </div>
            <p className="text-xs text-[#641b8a]/90 leading-relaxed">
              Students know exactly when work is due and when tests are scheduled. No guesswork or missed copies.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
