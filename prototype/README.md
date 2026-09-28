# Divine School — Digital Management & Parent Communication Platform
## Interactive High-Fidelity Prototype

This repository contains the interactive, multi-role web prototype for **Divine School**, built strictly in accordance with the proposal and design system prepared for the Principal, Management Committee, and Staff.

---

## 🌟 Key Capabilities & Live Architecture

### 1. Multi-Role Switcher (Top Header)
Effortlessly toggle between all 4 key stakeholder experiences:
- 👩‍🏫 **Teacher Portal (`Mrs. Sharma`)**:
  - **Day View**: Today's 4-period timetable, real-time class attendance rate, active homework tracker.
  - **Class 7B Attendance Register**: Single-tap toggle for **Present**, **Late**, and **Absent** with automatic parent notification dispatch and live roster counters.
  - **Homework Management**: Published homework status (with submission progress bars) and 1-click **"Publish to Parents & Students"** composer.
- 👨‍👩‍👧 **Parent Application (`Khurshid Alam - Aryan's Father`)**:
  - **Device Frame Toggle**: Switch between a realistic **Mobile iPhone frame** and expanded desktop cards.
  - **Multi-Child Switcher**: Cleanly toggle between *Aryan Khurshid (Class 7B)* and *Aisha Khurshid (Class 4A)*.
  - **Morning Attendance Status Pill**: Live status updated from classroom entry (Present / Absent / Late).
  - **Active Homework Feed**: Homework with due dates, instructions, and parent sign-off simulation.
  - **Notification Inbox**: Filter tabs (All, Attendance, Homework, Announcements, Events) with read-receipt confirmations.
- 🎒 **Student Portal (`Aryan Khurshid - Roll #01`)**:
  - **My Tasks**: Due date countdowns, subject tags, instructions, and interactive **"Submit Assignment"** workflow.
  - **Unit Test II Datesheet**: Examination schedule (Algebra, Chemistry, English Grammar) with rooms and syllabus details.
  - **Attendance Record**: Personal attendance tracking (98.2% term record).
- 🏫 **Admin / Management Dashboard (`Principal & Management`)**:
  - **School-Wide KPIs**: Total Enrolment (412 Students), Avg Daily Attendance (94.8%), Homework Completion (88.2%).
  - **Classroom Registry Summary**: Real-time status across classes with a 1-tap **"Remind Pending"** action.
  - **Realtime Feeds & Dispatch Monitor**: Live broadcast stream with read-rate percentages.
  - **Broadcast Announcement Composer**: Push urgent circulars across the entire school or specific grades.

### 2. Live Reactive Shared State
Every change made in one portal automatically and reactively updates all other portals:
- Marking a student absent in Teacher Portal updates the Parent App's morning status pill and Admin's registry stats instantly.
- Publishing a new homework assignment in Teacher Portal immediately pushes it to Aryan's student task list and parent active tasks feed.
- Submitting an assignment in Student Portal updates the Teacher's submission count and Admin metrics in real time.

---

## 🚀 Running the Prototype Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Quick Start
```bash
# 1. Install dependencies (already installed in workspace)
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

By default, Vite runs at `http://localhost:3000` or `http://localhost:5173`.
