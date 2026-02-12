# Hostel Maintenance System - Backend API

A RESTful API built with **Node.js** and **Express 5** to streamline hostel facility management. The system automates the complaint lifecycle—from student reporting to caretaker resolution—featuring role-based access control, automated email notifications, and logic-driven status workflows.

## 🛠️ Tech Stack

* **Core:** Node.js, Express.js (v5.2.1)
* **Database:** MongoDB (via Mongoose v9.1.2)
* **Authentication:** JWT (JSON Web Tokens) & Bcrypt
* **File Handling:** Multer (Memory Storage for image uploads)
* **Notifications:** Nodemailer (Gmail SMTP)

## 🚀 Key Features

### 👨‍🎓 Student Module
* **Complaint Registration:** Students can file maintenance requests (Electrical, Plumbing, etc.) linked to their specific hostel/room.
* **Smart Re-opening:** Implemented a validation rule allowing students to reopen a resolved complaint **only within 10 days** of resolution.
* **Real-time Notices:** View digital notices uploaded by the caretaker.

### 👮‍♂️ Caretaker Module
* **Priority Dashboard:** Custom sorting algorithm displays "Pending" complaints at the top, ensuring urgent issues are addressed first.
* **Worker Assignment:** Maintain a database of workers and assign them to specific complaints, automatically triggering email updates to students.
* **Digital Notice Board:** Upload notices with image support (converted to Base64) for instant student visibility.

### 📧 Automated Email System
The system uses `nodemailer` to send transactional emails for:
* Account Signup
* Complaint Filed
* Worker Assigned
* Complaint Resolved
* Complaint Reopened

## 🔌 API Endpoints

### Authentication (`/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/signup` | Register new student with email notification |
| `POST` | `/login` | Authenticate and receive JWT |

### Student (`/student`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/file` | Raise a new maintenance complaint |
| `GET` | `/view` | View personal and common hostel complaints |
| `PATCH` | `/:compId/reopen` | Reopen resolved complaint (Time-restricted) |
| `PUT` | `/profile/update` | Update contact or room details |

### Caretaker (`/caretaker`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/view-all` | View all complaints (Sorted by Status) |
| `PATCH` | `/:compId/assign` | Assign worker to a complaint |
| `PATCH` | `/:compId/resolve` | Mark complaint as resolved |
| `POST` | `/add-worker` | Register a new worker |
| `POST` | `/notice/upload` | Post notice with image |

## ⚙️ Setup & Installation

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Environment**
    Create a `.env` file with the following keys:
    ```env
    PORT=3000
    JWT_SECRET=your_secret_key
    EMAIL_USER=your_gmail_address
    EMAIL_PASS=your_gmail_app_password
    ```

3.  **Run the Server**
    ```bash
    npm start
    # or for development
    npm run dev
    ```
