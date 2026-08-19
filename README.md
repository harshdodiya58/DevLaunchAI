<div align="center">

# 🚀 DevLaunch AI

**The Ultimate AI-Powered Career Accelerator for Developers**

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
</p>

<h3>
  <a href="#-features">Features</a>
  <span> · </span>
  <a href="#-tech-stack">Tech Stack</a>
  <span> · </span>
  <a href="#-getting-started">Getting Started</a>
</h3>

</div>

---

## 🌟 About The Project

**DevLaunch AI** is a comprehensive, full-stack platform designed to help developers accelerate their careers. By combining modern web technologies with the power of **Google's Gemini AI**, DevLaunch acts as your personal technical recruiter, coding mentor, and career strategist—all in one beautiful interface.

Whether you are preparing for a system design interview, tracking job applications, or practicing algorithmic challenges in an integrated code editor, DevLaunch AI provides everything you need to land your dream job.

<br />

## ⚡ Features

### 🤖 AI-Powered Mock Interviews
Practice behavioral and technical questions dynamically generated based on your chosen domain (Frontend, Backend, Full Stack, DSA). Receive instant, detailed AI feedback on your answers.

### 💻 Live Coding Practice (Integrated Monaco Editor)
Solve real algorithmic challenges in a premium, VS Code-like environment powered by **Monaco Editor**. Submit your code and let the AI evaluation engine analyze your time/space complexity and correctness in real-time.

### 🛣️ Dynamic Learning Roadmaps
Follow structured, interactive learning paths tailored for specific roles. Track your progress dynamically with beautiful UI visualizations as you check off modules.

### 📊 Kanban Job Tracker
Manage your entire interview pipeline (Applied, Screening, Interview, Offer, Rejected) with a fully functional, real-time Kanban board.

### 📄 ATS Resume Checker
Upload your resume and a target job description. The AI will parse the content, score your match percentage, and give you actionable bullet points to improve your ATS ranking.

### 📈 GitHub Analytics
Connect your GitHub account to instantly visualize your commit history, most used languages, and repository stats in beautiful charts.

<br />

## 🛠 Tech Stack

This project is built using a modern, scalable monorepo architecture.

**Frontend:**
- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS** (for utility-first styling)
- **Framer Motion** (for premium, physics-based micro-animations)
- **Zustand** (for lightweight global state management)
- **React Query / Tanstack** (for data fetching and caching)
- **Monaco Editor** (for the integrated coding environment)
- **Radix UI & Lucide** (for accessible components and icons)

**Backend:**
- **Node.js & Express**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL** (Database)
- **Google Generative AI (Gemini)** (for all AI evaluations and natural language processing)
- **JWT & bcrypt** (for secure authentication)

<br />

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/harshdodiya58/DevLaunchAI.git
   cd DevLaunchAI
   ```

2. **Install dependencies**
   ```sh
   npm install
   # Install dependencies for both frontend and backend
   cd packages/frontend && npm install
   cd ../backend && npm install
   ```

3. **Set up Environment Variables**
   - Create a `.env` file in the `backend` directory and add your `DATABASE_URL`, `JWT_SECRET`, and `GEMINI_API_KEY`.
   - Create a `.env.local` file in the `frontend` directory with your API URL.

4. **Run Database Migrations**
   ```sh
   cd packages/backend
   npx prisma generate
   npx prisma db push
   ```

5. **Start the Development Servers**
   ```sh
   # Terminal 1 (Backend)
   cd packages/backend
   npm run dev

   # Terminal 2 (Frontend)
   cd packages/frontend
   npm run dev
   ```

<div align="center">
  <br />
  <p>Built with ❤️ for the developer community.</p>
</div>
