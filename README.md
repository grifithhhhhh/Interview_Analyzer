# 🤖 Smart Interview Analyzer

A full-stack web application that analyzes interview performance using AI-driven insights. It helps users practice interviews, receive feedback, and improve their communication and technical skills.

---

## 🚀 Features

* 🎤 **Mock Interview System**

  * Simulated interview questions
  * Timed responses for realistic practice

* 🧠 **AI-Based Analysis**

  * Analyze responses for clarity, confidence, and relevance
  * Generate feedback and improvement suggestions

* 🗣️ **Speech/Text Processing**

  * Accepts user responses (text or voice)
  * Processes answers for evaluation

* 📊 **Performance Feedback**

  * Score-based evaluation
  * Highlight strengths and weaknesses

* 🔐 **Authentication**

  * Secure login/signup system
  * User session management

---

## 🛠️ Tech Stack

**Frontend:**

* React.js
* Tailwind CSS

**Backend:**

* Node.js
* Express.js

**Database:**

* MongoDB

**AI/Processing:**

* Python (for analysis module)

---

## 🧩 Architecture

Client (React) → API (Node/Express) → AI Module (Python) → Database (MongoDB)

* Frontend collects user responses
* Backend processes requests and communicates with AI module
* AI module analyzes responses and returns feedback
* MongoDB stores user data and results

---

## 📁 Folder Structure (Basic)

/client → React frontend
/server → Node.js backend
/ai-module → Python analysis scripts
/models → Database schemas
/routes → API routes
/controllers → Business logic

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash id="t3g8f1"
git clone https://github.com/your-username/interview-analyzer.git
cd interview-analyzer
```

### 2. Install dependencies

**Frontend:**

```bash id="n2f9a4"
cd client
npm install
```

**Backend:**

```bash id="w5x7k2"
cd server
npm install
```

**AI Module:**

```bash id="c9d4h6"
cd ai-module
pip install -r requirements.txt
```

---

### 3. Environment Variables

Create a `.env` file in `/server`:

```id="k8p2z1"
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
PORT=5000
```

---

### 4. Run the application

**Backend:**

```bash id="y6r3m8"
npm run dev
```

**Frontend:**

```bash id="v1b7n9"
npm start
```

**AI Module:**

```bash id="u4k2q5"
python app.py
```

---

## 🔑 Key Learnings

* Built a full-stack AI-integrated application
* Integrated Node.js backend with Python-based analysis
* Designed systems for processing and evaluating user input
* Implemented authentication and session handling
* Improved understanding of real-world AI applications

---

## 🚧 Future Improvements

* Real-time voice analysis
* Advanced NLP models for deeper insights
* Interview question personalization
* Performance tracking over time (analytics dashboard)
* Deployment with scalable architecture

---

## 📌 Author

Pushpak Bhagat
GitHub: https://github.com/griffithhhhhh
LinkedIn: https://linkedin.com/in/pushpak-bhagat

---

## 📜 License

This project is for educational purposes.
