# 🏢 Samadhan Setu - Full Stack MERN Application

Samadhan Setu is a comprehensive MERN stack Hostel Maintenance and Complaint Management System. It bridges the gap between students and hostel caretakers, streamlining the process of reporting, assigning, and resolving maintenance issues efficiently.

## 🛠️ Tech Stack

* **Frontend:** React.js, Tailwind CSS, Vite (Deployed on Vercel)
* **Backend:** Node.js, Express.js (Deployed on Render)
* **Database:** MongoDB Atlas (Mongoose)
* **Authentication:** JWT & Bcrypt (with Advanced OTP Flows)
* **Cloud Storage:** Cloudinary (Automated Asset Lifecycle)

---

## 🚀 Key Features & Engineering Highlights

### 👨‍🎓 Student Module
* **Secure Authentication:** OTP-based signup, password resets, and 10-minute token expiration with request cooldowns.
* **Complaint Lifecycle:** File maintenance requests with high-res image proofs, track real-time status, or withdraw pending complaints.
* **Smart Re-opening:** Validation logic allows students to reopen a resolved complaint **within 10 days** of resolution.

### 👮‍♂️ Caretaker Module
* **Atomic Concurrency Locks:** Utilizes MongoDB `findOneAndUpdate` to prevent Time-of-Check to Time-of-Use (TOCTOU) race conditions when multiple caretakers assign workers simultaneously.
* **Worker & Resource Management:** Add, edit, delete, and toggle "On/Off Duty" status for maintenance workers.
* **Smart Dashboard & Filters:** Real-time client-side filtering by specific date ranges, worker assignments, and student details.

### ☁️ Automated Asset Lifecycle
* **Cloudinary Integration:** Images for complaints, notices, and worker profiles are securely uploaded to Cloudinary.
* **Zero Storage Leaks:** The backend automatically triggers Cloudinary deletion APIs whenever a document (complaint, notice, or worker) is deleted or updated from MongoDB.

### 📧 Automated Email System
Transactional emails are powered by `nodemailer` for:
* OTP Verifications & Password Resets
* Complaint Filed / Worker Assigned / Complaint Resolved

---

## 🔌 API Endpoints Reference

### Authentication (`/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/send-signup-otp` | Sends OTP for new account verification |
| `POST` | `/signup` | Register new student or caretaker |
| `POST` | `/login` | Authenticate and receive JWT |
| `POST` | `/forgot-password` | Initiates password reset OTP flow |
| `POST` | `/reset-password` | Verifies OTP and resets password |

### Student (`/student`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/file` | Raise a new maintenance complaint |
| `GET` | `/view` | View personal and common hostel complaints |
| `PATCH` | `/:compId/reopen` | Reopen resolved complaint (Time-restricted) |
| `DELETE` | `/:compId/withdraw` | Withdraw a pending complaint (deletes image) |
| `PUT` | `/profile/update` | Update contact or room details |

### Caretaker (`/caretaker`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/view-all` | View all complaints (Sorted by Status) |
| `PATCH` | `/:compId/assign` | Assign worker to a complaint (Atomic Lock) |
| `PATCH` | `/:compId/resolve` | Mark complaint as resolved |
| `PATCH` | `/:compId/reject` | Reject an invalid complaint with reasoning |
| `POST` | `/add-worker` | Register a new worker with a profile photo |
| `PUT` | `/worker/:id` | Update worker details or toggle availability |
| `POST` | `/notice/upload` | Post digital notice with image |

---

## ⚙️ Environment Variables

To run this project locally or in production, create a `.env` file in your backend root directory:

```env
# Server
PORT=3000
FRONTEND_URL=http://localhost:5173  # Change to Vercel URL in production

# Database
MONGO_URI=your_mongodb_atlas_connection_string

# Security
JWT_SECRET=your_super_secret_jwt_key
CARETAKER_SECRET_KEY=secret_code_for_caretaker_registration

# Email Service (Nodemailer)
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_16_digit_gmail_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
