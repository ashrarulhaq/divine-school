import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Role,
  Student,
  AttendanceStatus,
  HomeworkItem,
  TimetablePeriod,
  SchoolNotification,
  ExamItem,
  SchoolKPI,
  ClassroomSummary,
  UserAccount,
  BiometricSignature,
  RealtimeEvent,
} from '../types';
import {
  initialStudents,
  initialHomework,
  initialTimetable,
  initialExams,
  initialNotifications,
  initialSchoolKPI,
  initialClassroomSummaries,
} from '../data/mockData';
import { realtimeBus } from '../utils/realtimeBus';
import { playNotificationChime } from '../utils/sound';
import { PRESET_ACCOUNTS } from '../components/auth/LoginModal';
import {
  isCloudConfigured,
  fetchCloudStudents,
  fetchCloudAttendance,
  saveCloudAttendance,
  saveCloudRegisterSubmission,
  fetchCloudHomework,
  saveCloudHomework,
  fetchCloudSubmissions,
  saveCloudSubmission,
  fetchCloudSignatures,
  saveCloudSignature,
  fetchCloudNotifications,
  saveCloudNotification,
  broadcastCloudEvent,
  subscribeToCloudRealtime,
} from '../lib/supabase';

export type PortalView = Role | 'all';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;

  // Cloud & Sync Status
  isCloudMode: boolean;
  isCloudLoading: boolean;

  // Authentication
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  login: (user: UserAccount) => void;
  logout: () => void;

  // Portal standalone mode & URL routing
  portalView: PortalView;
  setPortalView: (view: PortalView) => void;
  isStandalone: boolean;

  // Real-time Push Notification Banner
  activePushBanner: RealtimeEvent | null;
  dismissPushBanner: () => void;
  
  // Students & Attendance
  students: Student[];
  attendance: Record<string, AttendanceStatus>;
  setStudentAttendance: (studentId: string, status: AttendanceStatus) => void;
  submitAttendanceRegister: () => void;
  notifyAbsentees: () => void;
  isRegisterSubmitted: boolean;

  // Homework & Biometrics
  homework: HomeworkItem[];
  addHomework: (item: {
    title: string;
    subject: string;
    grade: string;
    dueDate: string;
    instructions: string;
    tags?: string[];
  }) => void;
  toggleHomeworkSubmission: (homeworkId: string, studentId: string) => void;
  signHomeworkWithBiometrics: (homeworkId: string, studentId: string, signature: BiometricSignature) => void;
  isStudentSubmitted: (homeworkId: string, studentId: string) => boolean;
  getBiometricSignature: (homeworkId: string, studentId: string) => BiometricSignature | undefined;

  // Timetable & Exams
  timetable: TimetablePeriod[];
  exams: ExamItem[];

  // Notifications & Announcements
  notifications: SchoolNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  sendBroadcastAnnouncement: (title: string, message: string, targetGrades: string[]) => void;

  // Parent View State
  activeChildId: string;
  setActiveChildId: (id: string) => void;
  activeChild: Student;
  phoneFrameEnabled: boolean;
  setPhoneFrameEnabled: (enabled: boolean) => void;

  // Admin state
  kpi: SchoolKPI;
  classroomSummaries: ClassroomSummary[];

  // Toast feedback
  toast: string | null;
  showToast: (msg: string) => void;

  // Reset demo
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'divine_school_prototype_state_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isCloudMode = isCloudConfigured();
  const [isCloudLoading, setIsCloudLoading] = useState<boolean>(false);

  // Detect portal query param (?portal=teacher, ?portal=parent, ?portal=admin, ?portal=student)
  const getInitialPortalView = (): { view: PortalView; standalone: boolean } => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const portalParam = params.get('portal');
      if (portalParam && ['teacher', 'parent', 'student', 'admin'].includes(portalParam)) {
        return { view: portalParam as Role, standalone: true };
      }
    }
    return { view: 'teacher', standalone: false };
  };

  const initialRoute = getInitialPortalView();
  const [role, setRoleState] = useState<Role>(
    initialRoute.view === 'all' ? 'teacher' : (initialRoute.view as Role)
  );
  const [portalView, setPortalViewState] = useState<PortalView>(initialRoute.view);
  const [isStandalone] = useState<boolean>(initialRoute.standalone);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    // Default demo user depending on role
    return PRESET_ACCOUNTS.find((a) => a.role === role) || PRESET_ACCOUNTS[1]; // Default to parent
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [activePushBanner, setActivePushBanner] = useState<RealtimeEvent | null>(null);

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : initialStudents;
  });

  // Attendance map
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
    if (saved) return JSON.parse(saved);
    const initial: Record<string, AttendanceStatus> = {};
    initialStudents.forEach((s) => {
      if (s.id === 's-02') initial[s.id] = 'absent';
      else if (s.id === 's-04') initial[s.id] = 'late';
      else initial[s.id] = 'present';
    });
    return initial;
  });

  const [isRegisterSubmitted, setIsRegisterSubmitted] = useState<boolean>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_reg_submitted`);
    return saved ? JSON.parse(saved) : true;
  });

  const [homework, setHomework] = useState<HomeworkItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_homework`);
    return saved ? JSON.parse(saved) : initialHomework;
  });

  // Student submissions: "hwId_studentId" -> boolean
  const [submissions, setSubmissions] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_submissions`);
    if (saved) return JSON.parse(saved);
    return {
      'hw-01_s-01': true,
      'hw-02_s-01': false,
      'hw-03_s-01': true,
      'hw-05_s-01': true,
    };
  });

  // Biometric Signatures: "hwId_studentId" -> BiometricSignature
  const [biometricSignatures, setBiometricSignatures] = useState<Record<string, BiometricSignature>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_biometrics`);
    if (saved) return JSON.parse(saved);
    return {
      'hw-01_s-01': {
        verifiedBy: "Khurshid Alam (Aryan's Father)",
        studentId: 's-01',
        studentName: 'Aryan Khurshid',
        timestamp: '2026-08-06T18:45:00Z',
        displayTime: 'Yesterday at 06:45 PM',
        method: 'fingerprint',
        verificationHash: 'BIO-SHA256-8A3F19',
      },
      'hw-03_s-01': {
        verifiedBy: "Khurshid Alam (Aryan's Father)",
        studentId: 's-01',
        studentName: 'Aryan Khurshid',
        timestamp: '2026-08-05T20:10:00Z',
        displayTime: 'Aug 05 at 08:10 PM',
        method: 'fingerprint',
        verificationHash: 'BIO-SHA256-B1C47E',
      },
    };
  });

  const [timetable] = useState<TimetablePeriod[]>(initialTimetable);
  const [exams] = useState<ExamItem[]>(initialExams);

  const [notifications, setNotifications] = useState<SchoolNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [activeChildId, setActiveChildId] = useState<string>('s-01');
  const [phoneFrameEnabled, setPhoneFrameEnabled] = useState<boolean>(true);
  const [classroomSummaries, setClassroomSummaries] = useState<ClassroomSummary[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_classrooms`);
    return saved ? JSON.parse(saved) : initialClassroomSummaries;
  });

  const [toast, setToast] = useState<string | null>(null);

  // Synchronize role and portal view
  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    setPortalViewState(newRole);
    // Switch currentUser if convenient
    const matchingAcc = PRESET_ACCOUNTS.find((a) => a.role === newRole);
    if (matchingAcc) {
      setCurrentUser(matchingAcc);
    }
  };

  const setPortalView = (view: PortalView) => {
    setPortalViewState(view);
    if (view !== 'all') {
      setRoleState(view);
    }
  };

  // LocalStorage Persistence
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
    localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendance));
    localStorage.setItem(`${STORAGE_KEY}_reg_submitted`, JSON.stringify(isRegisterSubmitted));
    localStorage.setItem(`${STORAGE_KEY}_homework`, JSON.stringify(homework));
    localStorage.setItem(`${STORAGE_KEY}_submissions`, JSON.stringify(submissions));
    localStorage.setItem(`${STORAGE_KEY}_biometrics`, JSON.stringify(biometricSignatures));
    localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    localStorage.setItem(`${STORAGE_KEY}_classrooms`, JSON.stringify(classroomSummaries));
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
    }
  }, [students, attendance, isRegisterSubmitted, homework, submissions, biometricSignatures, notifications, classroomSummaries, currentUser]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const dismissPushBanner = () => {
    setActivePushBanner(null);
  };

  // Keep track of recently processed events to avoid duplicate chime/banner
  const processedEventsRef = useRef<Set<string>>(new Set());

  // Unified Event Processing for both Local BroadcastChannel and Supabase Realtime
  const handleIncomingRealtimeEvent = useCallback((event: RealtimeEvent) => {
    if (!event || !event.id) return;

    if (processedEventsRef.current.has(event.id)) {
      return;
    }
    processedEventsRef.current.add(event.id);
    if (processedEventsRef.current.size > 200) {
      const [first] = processedEventsRef.current;
      processedEventsRef.current.delete(first);
    }

    // Play chime and show in-app banner
    playNotificationChime();
    setActivePushBanner(event);

    // Reactive state updates
    switch (event.type) {
      case 'ATTENDANCE_MARKED': {
        if (event.payload?.studentId && event.payload?.status) {
          setAttendance((prev) => ({
            ...prev,
            [event.payload.studentId]: event.payload.status,
          }));
        }
        break;
      }
      case 'ATTENDANCE_REGISTER_SUBMITTED': {
        setIsRegisterSubmitted(true);
        if (event.payload?.classroomSummaries) {
          setClassroomSummaries(event.payload.classroomSummaries);
        }
        break;
      }
      case 'HOMEWORK_PUBLISHED': {
        if (event.payload?.homeworkItem) {
          setHomework((prev) => {
            if (prev.some((h) => h.id === event.payload.homeworkItem.id)) return prev;
            return [event.payload.homeworkItem, ...prev];
          });
        }
        if (event.payload?.notification) {
          setNotifications((prev) => {
            if (prev.some((n) => n.id === event.payload.notification.id)) return prev;
            return [event.payload.notification, ...prev];
          });
        }
        break;
      }
      case 'HOMEWORK_SIGNED': {
        const { homeworkId, studentId, signature } = event.payload || {};
        if (homeworkId && studentId) {
          const key = `${homeworkId}_${studentId}`;
          setSubmissions((prev) => ({ ...prev, [key]: true }));
          if (signature) {
            setBiometricSignatures((prev) => ({ ...prev, [key]: signature }));
          }
          setHomework((prev) =>
            prev.map((h) =>
              h.id === homeworkId
                ? { ...h, submittedCount: Math.min(h.totalStudents, h.submittedCount + 1) }
                : h
            )
          );
        }
        break;
      }
      case 'ANNOUNCEMENT_BROADCAST': {
        if (event.payload?.notification) {
          setNotifications((prev) => {
            if (prev.some((n) => n.id === event.payload.notification.id)) return prev;
            return [event.payload.notification, ...prev];
          });
        }
        break;
      }
    }
  }, []);

  // 1. Subscribe to local BroadcastChannel bus (cross-tab sync)
  useEffect(() => {
    const unsubscribeBus = realtimeBus.subscribe(handleIncomingRealtimeEvent);
    return () => {
      unsubscribeBus();
    };
  }, [handleIncomingRealtimeEvent]);

  // 2. Initial Cloud Hydration & Supabase Realtime Subscription (when configured)
  useEffect(() => {
    if (!isCloudMode) return;

    let isMounted = true;
    setIsCloudLoading(true);

    async function hydrateFromCloud() {
      try {
        const [cloudStudents, cloudAttendance, cloudHomework, cloudSubs, cloudSigs, cloudNotifs] =
          await Promise.all([
            fetchCloudStudents(),
            fetchCloudAttendance(),
            fetchCloudHomework(),
            fetchCloudSubmissions(),
            fetchCloudSignatures(),
            fetchCloudNotifications(),
          ]);

        if (!isMounted) return;

        if (cloudStudents && cloudStudents.length > 0) {
          setStudents(cloudStudents);
        }
        if (cloudAttendance && Object.keys(cloudAttendance).length > 0) {
          setAttendance(cloudAttendance);
        }
        if (cloudHomework && cloudHomework.length > 0) {
          setHomework(cloudHomework);
        }
        if (cloudSubs && Object.keys(cloudSubs).length > 0) {
          setSubmissions(cloudSubs);
        }
        if (cloudSigs && Object.keys(cloudSigs).length > 0) {
          setBiometricSignatures(cloudSigs);
        }
        if (cloudNotifs && cloudNotifs.length > 0) {
          setNotifications(cloudNotifs);
        }
      } catch (err) {
        console.warn('Could not hydrate from Supabase, using local state:', err);
      } finally {
        if (isMounted) setIsCloudLoading(false);
      }
    }

    hydrateFromCloud();

    // Subscribe to live cloud WebSocket updates (cross-phone 4G cellular sync)
    const unsubscribeCloud = subscribeToCloudRealtime(handleIncomingRealtimeEvent);

    return () => {
      isMounted = false;
      if (unsubscribeCloud) unsubscribeCloud();
    };
  }, [isCloudMode, handleIncomingRealtimeEvent]);

  // Login handler
  const login = (user: UserAccount) => {
    setCurrentUser(user);
    setRole(user.role);
    setIsLoginModalOpen(false);
    showToast(`Welcome back, ${user.name} (${user.role.toUpperCase()})`);
  };

  const logout = () => {
    setIsLoginModalOpen(true);
  };

  // Mark student attendance and broadcast
  const setStudentAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendance((prev) => {
      const next = { ...prev, [studentId]: status };
      return next;
    });

    const targetStudent = students.find((s) => s.id === studentId);
    const studentName = targetStudent?.name || 'Student';

    const event: RealtimeEvent = {
      id: `ev-${Date.now()}`,
      type: 'ATTENDANCE_MARKED',
      timestamp: new Date().toISOString(),
      senderRole: 'teacher',
      senderName: 'Mrs. Sharma',
      title: `Attendance Updated: ${studentName}`,
      message: `${studentName} was marked ${status.toUpperCase()} in Class 7B morning entry.`,
      payload: { studentId, status, studentName },
    };

    processedEventsRef.current.add(event.id);
    realtimeBus.broadcast(event);

    if (isCloudMode) {
      saveCloudAttendance(studentId, status, 'Mrs. Sharma');
      broadcastCloudEvent(event);
    }
  };

  // Submit attendance register and broadcast
  const submitAttendanceRegister = () => {
    setIsRegisterSubmitted(true);
    
    const class7BStudents = students.filter((s) => s.grade === 'Class 7B');
    const presentCount = class7BStudents.filter(
      (s) => attendance[s.id] === 'present' || attendance[s.id] === 'late'
    ).length;

    const timeMarked = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedSummaries: ClassroomSummary[] = classroomSummaries.map((c) =>
      c.grade === 'Class 7B'
        ? { ...c, status: 'SUBMITTED', presentCount, timeMarked }
        : c
    );

    setClassroomSummaries(updatedSummaries);

    const event: RealtimeEvent = {
      id: `ev-reg-${Date.now()}`,
      type: 'ATTENDANCE_REGISTER_SUBMITTED',
      timestamp: new Date().toISOString(),
      senderRole: 'teacher',
      senderName: 'Mrs. Sharma',
      title: 'Class 7B Register Submitted',
      message: `Mrs. Sharma officially certified and submitted Class 7B register (${presentCount}/${class7BStudents.length} present). Absentees dispatched.`,
      payload: { classroomSummaries: updatedSummaries, presentCount },
    };

    processedEventsRef.current.add(event.id);
    realtimeBus.broadcast(event);

    if (isCloudMode) {
      saveCloudRegisterSubmission('Class 7B', presentCount, class7BStudents.length, 'Mrs. Sharma');
      broadcastCloudEvent(event);
    }

    showToast(`✓ Class 7B register submitted (${presentCount}/${class7BStudents.length} present). Absentees notified.`);
  };

  const notifyAbsentees = () => {
    const class7BStudents = students.filter((s) => s.grade === 'Class 7B');
    const absentees = class7BStudents.filter((s) => attendance[s.id] === 'absent');

    if (absentees.length === 0) {
      showToast('All students are marked present or late. No absentee notices needed.');
      return;
    }

    const absenteeNames = absentees.map((s) => s.name).join(', ');
    const newNotification: SchoolNotification = {
      id: `n-${Date.now()}`,
      category: 'attendance',
      title: `Absent Notification: ${absentees.length} Student${absentees.length > 1 ? 's' : ''}`,
      message: `Direct app push alert dispatched to parents of: ${absenteeNames}. Certified by Mrs. Sharma.`,
      timestamp: 'Just now',
      targetGrades: ['Class 7B'],
      sender: 'Mrs. Sharma · Class 7B',
      isRead: false,
      priority: 'high',
      readPercentage: 100,
    };

    setNotifications((prev) => [newNotification, ...prev]);

    const event: RealtimeEvent = {
      id: `ev-absent-${Date.now()}`,
      type: 'ANNOUNCEMENT_BROADCAST',
      timestamp: new Date().toISOString(),
      senderRole: 'teacher',
      senderName: 'Mrs. Sharma',
      title: 'Absentee Notice Dispatched',
      message: `Morning absent notification sent to parents of: ${absenteeNames}`,
      payload: { notification: newNotification },
    };

    processedEventsRef.current.add(event.id);
    realtimeBus.broadcast(event);

    if (isCloudMode) {
      saveCloudNotification(newNotification);
      broadcastCloudEvent(event);
    }

    showToast(`Dispatched push alerts to parents of: ${absenteeNames}`);
  };

  const addHomework = (item: {
    title: string;
    subject: string;
    grade: string;
    dueDate: string;
    instructions: string;
    tags?: string[];
  }) => {
    const newHw: HomeworkItem = {
      id: `hw-${Date.now()}`,
      title: item.title,
      subject: item.subject,
      grade: item.grade,
      teacherName: 'Mrs. Sharma',
      assignedDate: 'Today',
      dueDate: item.dueDate,
      instructions: item.instructions,
      totalStudents: 32,
      submittedCount: 0,
      tags: item.tags || ['New Assignment'],
      statusColor: '#0071e3',
    };

    setHomework((prev) => [newHw, ...prev]);

    const newNotif: SchoolNotification = {
      id: `n-${Date.now()}`,
      category: 'homework',
      title: `New ${item.subject} Homework Assigned`,
      message: `Mrs. Sharma assigned "${item.title}" for ${item.grade}. Due: ${item.dueDate}. Requires parent biometric review.`,
      timestamp: 'Just now',
      targetGrades: [item.grade],
      sender: 'Mrs. Sharma',
      isRead: false,
      priority: 'normal',
      readPercentage: 94,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    const event: RealtimeEvent = {
      id: `ev-hw-${Date.now()}`,
      type: 'HOMEWORK_PUBLISHED',
      timestamp: new Date().toISOString(),
      senderRole: 'teacher',
      senderName: 'Mrs. Sharma',
      title: `New ${item.subject} Homework`,
      message: `Mrs. Sharma assigned "${item.title}" for ${item.grade}. Due: ${item.dueDate}.`,
      payload: { homeworkItem: newHw, notification: newNotif },
    };

    processedEventsRef.current.add(event.id);
    realtimeBus.broadcast(event);

    if (isCloudMode) {
      saveCloudHomework(newHw);
      saveCloudNotification(newNotif);
      broadcastCloudEvent(event);
    }

    showToast(`✓ Published "${item.title}" to Parents & Students of ${item.grade}`);
  };

  const isStudentSubmitted = (homeworkId: string, studentId: string) => {
    return !!submissions[`${homeworkId}_${studentId}`];
  };

  const getBiometricSignature = (homeworkId: string, studentId: string) => {
    return biometricSignatures[`${homeworkId}_${studentId}`];
  };

  // Sign homework with parent fingerprint / biometric proof
  const signHomeworkWithBiometrics = (
    homeworkId: string,
    studentId: string,
    signature: BiometricSignature
  ) => {
    const key = `${homeworkId}_${studentId}`;
    setSubmissions((prev) => ({ ...prev, [key]: true }));
    setBiometricSignatures((prev) => ({ ...prev, [key]: signature }));

    setHomework((prev) =>
      prev.map((h) => {
        if (h.id === homeworkId) {
          const newCount = Math.min(h.totalStudents, h.submittedCount + 1);
          return { ...h, submittedCount: newCount };
        }
        return h;
      })
    );

    const event: RealtimeEvent = {
      id: `ev-sign-${Date.now()}`,
      type: 'HOMEWORK_SIGNED',
      timestamp: new Date().toISOString(),
      senderRole: 'parent',
      senderName: signature.verifiedBy,
      title: 'Homework Verified via Biometric Signature',
      message: `${signature.verifiedBy} completed biometric verification for ${signature.studentName}. Certified in diary.`,
      payload: { homeworkId, studentId, signature },
    };

    processedEventsRef.current.add(event.id);
    realtimeBus.broadcast(event);

    if (isCloudMode) {
      saveCloudSignature(homeworkId, studentId, signature);
      broadcastCloudEvent(event);
    }

    showToast(`✓ Certified with Biometric Fingerprint Seal (${signature.verificationHash})`);
  };

  const toggleHomeworkSubmission = (homeworkId: string, studentId: string) => {
    const key = `${homeworkId}_${studentId}`;
    const currentlySubmitted = !!submissions[key];
    const nextState = !currentlySubmitted;

    setSubmissions((prev) => ({ ...prev, [key]: nextState }));

    setHomework((prev) =>
      prev.map((h) => {
        if (h.id === homeworkId) {
          const delta = nextState ? 1 : -1;
          const newCount = Math.max(0, Math.min(h.totalStudents, h.submittedCount + delta));
          return { ...h, submittedCount: newCount };
        }
        return h;
      })
    );

    if (isCloudMode) {
      saveCloudSubmission(homeworkId, studentId, nextState);
    }

    if (nextState) {
      showToast('✓ Task marked as complete.');
    } else {
      showToast('Task marked as pending.');
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read.');
  };

  const sendBroadcastAnnouncement = (title: string, message: string, targetGrades: string[]) => {
    const newNotif: SchoolNotification = {
      id: `n-${Date.now()}`,
      category: 'announcement',
      title,
      message,
      timestamp: 'Just now',
      targetGrades,
      sender: 'Divine School Administration',
      isRead: false,
      priority: 'high',
      readPercentage: 98,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    const event: RealtimeEvent = {
      id: `ev-ann-${Date.now()}`,
      type: 'ANNOUNCEMENT_BROADCAST',
      timestamp: new Date().toISOString(),
      senderRole: 'admin',
      senderName: 'Principal & Management',
      title,
      message,
      payload: { notification: newNotif },
    };

    processedEventsRef.current.add(event.id);
    realtimeBus.broadcast(event);

    if (isCloudMode) {
      saveCloudNotification(newNotif);
      broadcastCloudEvent(event);
    }

    showToast(`✓ Broadcast announcement sent to ${targetGrades.join(', ')}`);
  };

  const resetDemoData = () => {
    localStorage.clear();
    setStudents(initialStudents);
    const initial: Record<string, AttendanceStatus> = {};
    initialStudents.forEach((s) => {
      if (s.id === 's-02') initial[s.id] = 'absent';
      else if (s.id === 's-04') initial[s.id] = 'late';
      else initial[s.id] = 'present';
    });
    setAttendance(initial);
    setIsRegisterSubmitted(true);
    setHomework(initialHomework);
    setSubmissions({
      'hw-01_s-01': true,
      'hw-02_s-01': false,
      'hw-03_s-01': true,
      'hw-05_s-01': true,
    });
    setNotifications(initialNotifications);
    setClassroomSummaries(initialClassroomSummaries);
    setActiveChildId('s-01');
    showToast('Reset to canonical demo data successfully.');
  };

  const activeChild = students.find((s) => s.id === activeChildId) || students[0];

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        isCloudMode,
        isCloudLoading,
        currentUser,
        setCurrentUser,
        isLoginModalOpen,
        setIsLoginModalOpen,
        login,
        logout,
        portalView,
        setPortalView,
        isStandalone,
        activePushBanner,
        dismissPushBanner,
        students,
        attendance,
        setStudentAttendance,
        submitAttendanceRegister,
        notifyAbsentees,
        isRegisterSubmitted,
        homework,
        addHomework,
        toggleHomeworkSubmission,
        signHomeworkWithBiometrics,
        isStudentSubmitted,
        getBiometricSignature,
        timetable,
        exams,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        sendBroadcastAnnouncement,
        activeChildId,
        setActiveChildId,
        activeChild,
        phoneFrameEnabled,
        setPhoneFrameEnabled,
        kpi: initialSchoolKPI,
        classroomSummaries,
        toast,
        showToast,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
