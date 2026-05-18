# ZCAS Student Electoral System

A comprehensive, real-time election management system built for the Zambia Centre for Accountancy Studies (ZCAS). This platform ensures secure, transparent, and efficient student elections through identity verification, real-time vote processing, and instant SMS notifications.

## 📋 Table of Contents
1. [How It Works](#how-it-works)
2. [System Impact](#system-impact)
3. [Architecture and Technologies](#architecture-and-technologies)
4. [Deployment Details](#deployment-details)

---

## ⚙️ How It Works (Step-by-Step)

The electoral system handles the entire lifecycle of a student election, from registration to final results.

### 1. Student Registration & Onboarding
- **Account Creation**: Students sign up using their official details, including their Student ID, ZCAS email, and phone number.
- **Identity Proofing**: During registration, students upload a scanned copy or photo of their Student ID. 
- **Account Status**: Newly created student accounts are placed in a 'Pending Verification' state and are not yet permitted to vote.

### 2. Admin Verification Process
- **Review Dashboard**: System administrators (electoral commission team) log into a secure dashboard to view pending student registrations.
- **Approval/Rejection**: Admins compare the uploaded Student ID with the registered details. They then approve or reject the student's eligibility to vote.
- **SMS Notifications**: Once a decision is made, an automated SMS is sent to the student.

### 3. Election Execution
- **Election Scheduling**: Admins can set the exact start and end times for the election.
- **Start Notifications**: Admins can blast notifications to all verified students announcing that the election is open.
- **Casting a Vote**: Once the election begins and a student is approved, they can log in, view candidates categorized by position, and cast their ballot.
- **Security Check**: Votes are cryptographically protected, and Firestore security rules ensure that a student can only vote once.

### 4. Real-time Monitoring & Analytics
- **Live Turnout**: Admins can view the live voter turnout percentage and totals across different faculties.
- **Hourly Trends**: The system charts voting activity over time to help track peak voting hours.
- **Real-Time Results**: The dashboard securely updates the candidate standings and vote counts as they come in.

### 5. Role Management
- The initialized Super Admin can manage administrative access, delegating partial permissions to other staff members to distribute the workload securely.

---

## 🌟 System Impact

This modern electoral platform is designed to revolutionize how student elections are conducted at ZCAS:

- **Enhanced Security & Integrity**: By digitally verifying identities and enforcing strict security rules that prohibit double-voting, the platform guarantees a fair election.
- **Increased Participation**: With an easy-to-use interface accessible from any mobile or desktop browser—coupled with proactive reminders—student turnout is expected to increase significantly.
- **Unprecedented Transparency**: Real-time analytics eliminate the "black-box" nature of ballot counting, ensuring the student body and administration trust the results.
- **Operational Efficiency**: The system replaces slow, manual paper-ballot verification, saving hours of administrative work and immediately delivering accurate outcomes the moment polls close.

---

## 🛠 Architecture and Technologies

- **Frontend**: React (18+), Vite, Tailwind CSS, TypeScript
- **Backend/API**: Node.js, Express
- **Database & Authentication**: Firebase Auth, Cloud Firestore (with comprehensive Zero-Trust Security Rules)
- **External Communications**: Secure internal APIS for transactional processing

---

## 🚀 Deployment Details

To deploy this system to a production environment (like Google Cloud Run, Heroku, or Render), follow these steps:

### Prerequisites
1. **Node.js** (v18 or higher) installed on the deployment server.
2. A **Firebase Project** set up with Authentication (Email/Password) and Firestore Database enabled.

### Step 1: Environment Variables
Create a `.env` file on your host server based on `.env.example`.

### Step 2: Install Dependencies
Run the following command to install all necessary packages:
```bash
npm install
```

### Step 3: Build for Production
Execute the build script. This will compile the React Single Page Application and bundle the Express backend into an optimized deployment artifact.
```bash
npm run build
```

### Step 4: Start the Server
Start the production server. This kicks off the backend which serves the built React frontend.
```bash
npm start
```
![image alt](https://github.com/deedeestephen/ZCAS-university-Online-Voting-system/blob/944f6d034db44a10462d756f480f83904ed2b061/Screenshot%202026-05-14%20230649.png)
