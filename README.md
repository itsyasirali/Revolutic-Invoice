# Revolutic Invoice System

A comprehensive, full-stack web application designed for generating, managing, and sending professional invoices. Built with a modern React frontend and a powerful NestJS backend, this system streamlines the entire invoicing workflow including customer management, item tracking, payment recording, and template customization.

## Key Features

- **Authentication & Security:** Secure user sessions using express-session and connect-pg-simple.
- **Dashboard:** Interactive dashboard with data visualization using Recharts.
- **Customer & Item Management:** Easily maintain records of customers and products/services.
- **Invoicing System:** Create, edit, preview, and manage professional invoices.
- **PDF Generation:** Generate PDF invoices directly on both the frontend (`html2pdf.js`) and backend (`PDFKit`).
- **Email Integration:** Compose and send invoices and payment receipts via email using Nodemailer.
- **Payments:** Record and track payments against generated invoices.
- **Customizable Templates:** Create and manage distinct templates for customized invoice generation.

## Technology Stack

### Frontend

| Concern | Technology |
| :--- | :--- |
| Framework | React (Vite) |
| Language | TypeScript |
| Routing | React Router DOM |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| HTTP Client | Axios |
| PDF Generation | html2pdf.js |
| Data Visualization| Recharts |
| Rich Text Editor | React Quill |

### Backend

| Concern | Technology |
| :--- | :--- |
| Runtime | Node.js |
| Framework | NestJS |
| Language | TypeScript |
| Database | PostgreSQL (TypeORM) |
| Authentication | Express Session + connect-pg-simple |
| Security | bcrypt |
| File Uploads | Multer |
| Email System | Nodemailer |
| PDF Generation | PDFKit |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or newer)
- [PostgreSQL](https://www.postgresql.org/) database server running
- npm or yarn

### Installation & Setup

1. **Clone the repository** (or download the source):
   ```bash
   git clone <repository-url>
   cd Revolutic-Invoice
   ```

2. **Frontend Setup**:
   ```bash
   # Install dependencies
   npm install
   
   # Start the development server
   npm run dev
   ```

3. **Backend Setup**:
   Open a new terminal window:
   ```bash
   cd api
   
   # Install dependencies
   npm install
   ```

4. **Environment Variables**:
   Create a `.env` file in the `api` root directory. Provide the necessary credentials for PostgreSQL, Session secret, and SMTP configuration for Nodemailer.
   ```env
   # Example .env format for the Backend
   PORT=3000
   DATABASE_URL=postgres://username:password@localhost:5432/revolutic_db
   SESSION_SECRET=your_super_secret_session_key
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your_email@example.com
   SMTP_PASS=your_email_password
   ```

5. **Start the Backend Development Server**:
   ```bash
   npm run start:dev
   ```

## License

This project is licensed under the UNLICENSED model and is proprietary to the author.
