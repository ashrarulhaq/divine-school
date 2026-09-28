import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  Student,
  AttendanceStatus,
  HomeworkItem,
  BiometricSignature,
  SchoolNotification,
  RealtimeEvent,
} from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const DEFAULT_SCHOOL_ID = import.meta.env.VITE_SCHOOL_ID || 'sch-divine-01';

/**
 * Checks whether Supabase is properly configured via environment variables.
 */
export const isCloudConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      !supabaseUrl.includes('your-project-id') &&
      supabaseUrl.startsWith('https://')
  );
};

// Initialize Supabase client if credentials exist
export const supabase: SupabaseClient | null = isCloudConfigured()
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

// ==============================================================================
// CLOUD DATA SYNC FUNCTIONS (Graceful no-op when running locally)
// ==============================================================================

/**
 * Fetch students for a given school from Supabase
 */
export async function fetchCloudStudents(schoolId = DEFAULT_SCHOOL_ID): Promise<Student[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', schoolId)
      .order('roll_no', { ascending: true });

    if (error || !data) {
      console.warn('Supabase fetch students error:', error);
      return null;
    }

    return data.map((row: any) => ({
      id: row.id,
      rollNo: row.roll_no,
      name: row.name,
      gender: row.gender,
      grade: row.grade,
      parentName: row.parent_name,
      parentPhone: row.parent_phone || '',
      parentEmail: row.parent_email || '',
      avatarInitials: row.avatar_initials || row.name.slice(0, 2).toUpperCase(),
      avatarBg: row.avatar_bg || '#e8f1fc',
      attendanceRate: Number(row.attendance_rate) || 95.0,
      totalPresent: row.total_present || 0,
      totalDays: row.total_days || 0,
    }));
  } catch (err) {
    console.warn('Network error fetching cloud students:', err);
    return null;
  }
}

/**
 * Fetch daily attendance records for today from Supabase
 */
export async function fetchCloudAttendance(schoolId = DEFAULT_SCHOOL_ID): Promise<Record<string, AttendanceStatus> | null> {
  if (!supabase) return null;
  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance_records')
      .select('student_id, status')
      .eq('school_id', schoolId)
      .eq('date', today);

    if (error || !data) {
      console.warn('Supabase fetch attendance error:', error);
      return null;
    }

    const attendanceMap: Record<string, AttendanceStatus> = {};
    data.forEach((row: any) => {
      attendanceMap[row.student_id] = row.status as AttendanceStatus;
    });
    return attendanceMap;
  } catch (err) {
    console.warn('Network error fetching cloud attendance:', err);
    return null;
  }
}

/**
 * Save an individual attendance status to Supabase
 */
export async function saveCloudAttendance(
  studentId: string,
  status: AttendanceStatus,
  markedBy = 'Mrs. Sharma',
  schoolId = DEFAULT_SCHOOL_ID
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('attendance_records').upsert(
      {
        school_id: schoolId,
        student_id: studentId,
        date: today,
        status,
        marked_at: new Date().toISOString(),
        marked_by: markedBy,
      },
      { onConflict: 'school_id,student_id,date' }
    );
    if (error) {
      console.warn('Supabase save attendance error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Network error saving cloud attendance:', err);
    return false;
  }
}

/**
 * Save official classroom register submission to Supabase
 */
export async function saveCloudRegisterSubmission(
  grade: string,
  presentCount: number,
  totalCount: number,
  submittedBy = 'Mrs. Sharma',
  schoolId = DEFAULT_SCHOOL_ID
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await supabase.from('classroom_registers').upsert(
      {
        school_id: schoolId,
        grade,
        date: today,
        is_submitted: true,
        submitted_at: new Date().toISOString(),
        submitted_by: submittedBy,
        present_count: presentCount,
        total_count: totalCount,
      },
      { onConflict: 'school_id,grade,date' }
    );
    return !error;
  } catch (err) {
    console.warn('Network error saving register submission:', err);
    return false;
  }
}

/**
 * Fetch homework items from Supabase
 */
export async function fetchCloudHomework(schoolId = DEFAULT_SCHOOL_ID): Promise<HomeworkItem[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('homework_items')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      subject: row.subject,
      grade: row.grade,
      teacherName: row.teacher_name,
      assignedDate: row.assigned_date,
      dueDate: row.due_date,
      instructions: row.instructions || '',
      totalStudents: row.total_students || 32,
      submittedCount: row.submitted_count || 0,
      tags: Array.isArray(row.tags) ? row.tags : [],
      statusColor: row.status_color || '#0071e3',
    }));
  } catch (err) {
    console.warn('Network error fetching cloud homework:', err);
    return null;
  }
}

/**
 * Save new homework item to Supabase
 */
export async function saveCloudHomework(item: HomeworkItem, schoolId = DEFAULT_SCHOOL_ID): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('homework_items').upsert({
      id: item.id,
      school_id: schoolId,
      title: item.title,
      subject: item.subject,
      grade: item.grade,
      teacher_name: item.teacherName,
      assigned_date: item.assignedDate,
      due_date: item.dueDate,
      instructions: item.instructions,
      total_students: item.totalStudents,
      submitted_count: item.submittedCount,
      tags: item.tags || [],
      status_color: item.statusColor || '#0071e3',
    });
    return !error;
  } catch (err) {
    console.warn('Network error saving cloud homework:', err);
    return false;
  }
}

/**
 * Fetch homework submissions map from Supabase
 */
export async function fetchCloudSubmissions(schoolId = DEFAULT_SCHOOL_ID): Promise<Record<string, boolean> | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('homework_submissions')
      .select('homework_id, student_id, is_submitted')
      .eq('school_id', schoolId);

    if (error || !data) return null;

    const map: Record<string, boolean> = {};
    data.forEach((row: any) => {
      map[`${row.homework_id}_${row.student_id}`] = Boolean(row.is_submitted);
    });
    return map;
  } catch (err) {
    console.warn('Network error fetching cloud submissions:', err);
    return null;
  }
}

/**
 * Toggle or save homework submission state
 */
export async function saveCloudSubmission(
  homeworkId: string,
  studentId: string,
  isSubmitted: boolean,
  schoolId = DEFAULT_SCHOOL_ID
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('homework_submissions').upsert(
      {
        school_id: schoolId,
        homework_id: homeworkId,
        student_id: studentId,
        is_submitted: isSubmitted,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: 'homework_id,student_id' }
    );
    return !error;
  } catch (err) {
    console.warn('Network error saving cloud submission:', err);
    return false;
  }
}

/**
 * Fetch biometric signatures from Supabase
 */
export async function fetchCloudSignatures(
  schoolId = DEFAULT_SCHOOL_ID
): Promise<Record<string, BiometricSignature> | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('homework_signatures')
      .select('*')
      .eq('school_id', schoolId);

    if (error || !data) return null;

    const signatures: Record<string, BiometricSignature> = {};
    data.forEach((row: any) => {
      signatures[`${row.homework_id}_${row.student_id}`] = {
        verifiedBy: row.verified_by,
        studentId: row.student_id,
        studentName: row.student_name,
        timestamp: row.timestamp,
        displayTime: row.display_time || 'Earlier today',
        method: row.method || 'fingerprint',
        verificationHash: row.verification_hash,
      };
    });
    return signatures;
  } catch (err) {
    console.warn('Network error fetching signatures:', err);
    return null;
  }
}

/**
 * Save parent biometric signature to Supabase
 */
export async function saveCloudSignature(
  homeworkId: string,
  studentId: string,
  sig: BiometricSignature,
  schoolId = DEFAULT_SCHOOL_ID
): Promise<boolean> {
  if (!supabase) return false;
  try {
    // 1. Save signature record
    const { error: sigError } = await supabase.from('homework_signatures').upsert(
      {
        school_id: schoolId,
        homework_id: homeworkId,
        student_id: studentId,
        verified_by: sig.verifiedBy,
        student_name: sig.studentName,
        timestamp: sig.timestamp,
        display_time: sig.displayTime,
        method: sig.method,
        verification_hash: sig.verificationHash,
      },
      { onConflict: 'homework_id,student_id' }
    );

    // 2. Mark submission as complete
    await saveCloudSubmission(homeworkId, studentId, true, schoolId);

    // 3. Increment submission counter in homework_items
    const { data: currentHw } = await supabase
      .from('homework_items')
      .select('submitted_count, total_students')
      .eq('id', homeworkId)
      .single();

    if (currentHw) {
      const updatedCount = Math.min(currentHw.total_students, (currentHw.submitted_count || 0) + 1);
      await supabase.from('homework_items').update({ submitted_count: updatedCount }).eq('id', homeworkId);
    }

    return !sigError;
  } catch (err) {
    console.warn('Network error saving cloud signature:', err);
    return false;
  }
}

/**
 * Fetch school notifications from Supabase
 */
export async function fetchCloudNotifications(
  schoolId = DEFAULT_SCHOOL_ID
): Promise<SchoolNotification[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      message: row.message,
      timestamp: row.timestamp,
      targetGrades: Array.isArray(row.target_grades) ? row.target_grades : [],
      sender: row.sender,
      isRead: Boolean(row.is_read),
      priority: row.priority || 'normal',
      readPercentage: row.read_percentage || 90,
    }));
  } catch (err) {
    console.warn('Network error fetching notifications:', err);
    return null;
  }
}

/**
 * Save notification to Supabase
 */
export async function saveCloudNotification(
  notification: SchoolNotification,
  schoolId = DEFAULT_SCHOOL_ID
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('notifications').upsert({
      id: notification.id,
      school_id: schoolId,
      category: notification.category,
      title: notification.title,
      message: notification.message,
      timestamp: notification.timestamp,
      target_grades: notification.targetGrades,
      sender: notification.sender,
      is_read: notification.isRead,
      priority: notification.priority,
      read_percentage: notification.readPercentage || 90,
    });
    return !error;
  } catch (err) {
    console.warn('Network error saving notification:', err);
    return false;
  }
}

// ==============================================================================
// SUPABASE REALTIME WEBSOCKET BROADCAST CHANNEL
// Syncs events instantly across physical phones over 4G cellular data (<300ms)
// ==============================================================================

let realtimeChannel: RealtimeChannel | null = null;

/**
 * Broadcast an event across all connected smartphones and browser clients via Supabase Realtime
 */
export async function broadcastCloudEvent(event: RealtimeEvent, schoolId = DEFAULT_SCHOOL_ID): Promise<void> {
  if (!supabase) return;
  try {
    // 1. Audit to realtime_events table
    await supabase.from('realtime_events').insert({
      id: event.id,
      school_id: schoolId,
      type: event.type,
      timestamp: event.timestamp,
      sender_role: event.senderRole,
      sender_name: event.senderName,
      title: event.title,
      message: event.message,
      payload: event.payload || {},
    });

    // 2. Broadcast immediately over WebSocket channel
    if (realtimeChannel) {
      await realtimeChannel.send({
        type: 'broadcast',
        event: 'divine_event',
        payload: event,
      });
    }
  } catch (err) {
    console.warn('Failed to broadcast cloud event:', err);
  }
}

/**
 * Subscribe to Supabase Realtime events across physical phones & web clients
 */
export function subscribeToCloudRealtime(
  onEvent: (event: RealtimeEvent) => void,
  schoolId = DEFAULT_SCHOOL_ID
): (() => void) | null {
  if (!supabase) return null;

  try {
    const channelName = `school-room-${schoolId}`;
    realtimeChannel = supabase.channel(channelName, {
      config: {
        broadcast: { ack: true, self: false },
      },
    });

    // Listen to broadcast messages
    realtimeChannel.on('broadcast', { event: 'divine_event' }, (payload: any) => {
      if (payload && payload.payload) {
        onEvent(payload.payload as RealtimeEvent);
      }
    });

    // Also listen to direct database insert events on realtime_events
    realtimeChannel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'realtime_events',
        filter: `school_id=eq.${schoolId}`,
      },
      (payload: any) => {
        const row = payload.new;
        if (row) {
          const event: RealtimeEvent = {
            id: row.id,
            type: row.type,
            timestamp: row.timestamp,
            senderRole: row.sender_role,
            senderName: row.sender_name,
            title: row.title,
            message: row.message,
            payload: row.payload,
          };
          onEvent(event);
        }
      }
    );

    realtimeChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Supabase Realtime] Connected to room: ${channelName}`);
      }
    });

    return () => {
      if (realtimeChannel) {
        supabase?.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    };
  } catch (err) {
    console.warn('Failed to subscribe to cloud realtime:', err);
    return null;
  }
}
