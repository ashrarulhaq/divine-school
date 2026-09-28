export type Role = 'teacher' | 'parent' | 'student' | 'admin';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'unmarked';

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  gender: 'M' | 'F';
  grade: string; // e.g. "Class 7B"
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  avatarInitials: string;
  avatarBg: string;
  attendanceRate: number; // e.g. 98.2
  totalPresent: number;
  totalDays: number;
}

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  markedAt?: string;
  markedBy?: string;
  notes?: string;
}

export interface AttendanceRegister {
  id: string;
  grade: string;
  teacherId: string;
  teacherName: string;
  date: string; // e.g. "2026-08-06"
  isSubmitted: boolean;
  submittedAt?: string;
  records: Record<string, AttendanceRecord>; // studentId -> record
}

export type HomeworkStatus = 'pending' | 'due_soon' | 'submitted' | 'completed';

export interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  grade: string;
  teacherName: string;
  assignedDate: string; // e.g. "Aug 06, 2026"
  dueDate: string;      // e.g. "Aug 08 (Fri)"
  instructions: string;
  totalStudents: number;
  submittedCount: number;
  tags?: string[];
  statusColor?: string;
}

export interface BiometricSignature {
  verifiedBy: string; // e.g. "Khurshid Alam (Aryan's Father)"
  studentId: string;
  studentName: string;
  timestamp: string; // e.g. "2026-08-06T19:30:00Z"
  displayTime: string; // e.g. "Today at 07:30 PM"
  method: 'fingerprint' | 'biometric_device';
  verificationHash: string; // e.g. "BIO-SHA256-47F8B2"
}

export interface StudentSubmission {
  homeworkId: string;
  studentId: string;
  submittedAt: string;
  contentNotes?: string;
  status: 'submitted' | 'reviewed';
  signature?: BiometricSignature;
}

export interface TimetablePeriod {
  id: string;
  periodNumber: number;
  timeSlot: string; // e.g. "08:30 – 09:15"
  subject: string;
  grade: string;
  topic: string;
  studentCount: number;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
  room: string;
}

export type NotificationCategory = 'attendance' | 'homework' | 'announcement' | 'event' | 'fees';

export interface SchoolNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  targetGrades: string[];
  sender: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high';
  readPercentage?: number;
}

export interface ExamItem {
  id: string;
  subject: string;
  examName: string; // e.g. "Unit Test II"
  date: string;     // e.g. "Aug 10, 2026"
  time: string;     // e.g. "09:00 AM – 10:30 AM"
  room: string;
  syllabus: string;
  statusColor: string;
}

export interface SchoolKPI {
  totalEnrolment: number;
  avgDailyAttendance: number;
  homeworkCompletionRate: number;
  activeTeachers: number;
  classesCount: number;
}

export interface ClassroomSummary {
  grade: string;
  teacher: string;
  status: 'SUBMITTED' | 'DRAFT' | 'PENDING';
  presentCount: number;
  totalStudents: number;
  timeMarked?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: Role;
  grade?: string; // e.g. "Class 7B"
  linkedStudentIds?: string[];
  mustChangePassword?: boolean;
  avatarBg?: string;
}

export type RealtimeEventType = 
  | 'ATTENDANCE_MARKED'
  | 'ATTENDANCE_REGISTER_SUBMITTED'
  | 'HOMEWORK_PUBLISHED'
  | 'HOMEWORK_SIGNED'
  | 'ANNOUNCEMENT_BROADCAST';

export interface RealtimeEvent {
  id: string;
  type: RealtimeEventType;
  timestamp: string;
  senderRole: Role;
  senderName: string;
  title: string;
  message: string;
  payload?: any;
}

