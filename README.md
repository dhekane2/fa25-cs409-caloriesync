# 🍎 CaloriSync

> **Adaptive Nutrition Tracker with Predictive Insights**

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)](https://www.mongodb.com/)

CaloriSync bridges the gap between nutrition planning and actual eating behavior by predicting expected calorie consumption and comparing it with actual intake, providing personalized insights for healthier and more consistent habits.

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [System Architecture](#-system-diagram)
- [Key Features](#-key-features)
- [What Makes Us Different](#-what-makes-us-different)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Contributing](#-contributing)

---

## 🎯 Problem Statement

Most nutrition tracking apps focus solely on recording what users eat, but they rarely help users understand how their actual eating behavior deviates from their planned goals. People often set calorie or macronutrient targets but fail to achieve them consistently, leading to frustration and disengagement.

### User Problems We Solve

1. **Lack of Visibility** - Users need clear insights into how closely they adhere to their nutrition goals
2. **Missing Behavioral Patterns** - Existing trackers display only daily totals without revealing trends over time
3. **Difficulty Adjusting** - Users struggle to modify their diets based on discrepancies between planned and actual consumption

---

## 🏛️ Architecture Diagram
![System Architecture](doc\system-arch.png)


---
## ✨ Key Features

### 🔐 User Authentication
- Secure sign-up and login system
- Personal data protection with JWT authentication
- Cookie-based session management

### 📊 Predicted Intake
- Estimates calorie requirements based on user profile (age, gender, height, weight)
- Allows users to input planned meals
- Personalized daily calorie targets

### 🍽️ Actual Intake Tracking
- Log meals using the **USDA FoodData Central API**
- Detailed nutritional information for thousands of foods
- Easy meal entry and management

### 📈 Comparison & Analysis
- **Interactive Visualizations** - Bar and line charts comparing predicted vs. actual consumption
- **Calorie Accuracy Score** - Indicates how closely you meet dietary goals
- **Personalized Suggestions** - Actionable feedback to improve consistency

### 📅 Progress Visualization
- Weekly and monthly dashboards
- Adherence trend analysis
- Long-term progress tracking
- Behavioral pattern identification

---

## 🚀 What Makes Us Different

| Feature | CaloriSync | MyFitnessPal | Cronometer | Yazio |
|---------|-----------|--------------|------------|-------|
| **Behavioral Awareness** | ✅ | ❌ | ❌ | ❌ |
| **Predictive Insights** | ✅ | ❌ | ❌ | ❌ |
| **Visual Deviation Feedback** | ✅ | Limited | Limited | Limited |
| **Long-term Trend Analysis** | ✅ | Limited | Limited | ❌ |
| **Goal Adherence Tracking** | ✅ | Basic | Basic | Basic |

### Our Approach
- **Behavioral Focus** - Understanding eating patterns, not just recording data
- **Predictive Insights** - Visual feedback on calorie deviations
- **Data-Driven Loop** - Predict → Record → Compare → Adjust
- **User-Centric Design** - Heuristic evaluation for optimal UX

---

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern UI library
- **React Router DOM 7.9.6** - Client-side routing
- **Recharts 3.4.1** - Data visualization
- **Vite 7.1.7** - Fast build tool
- **Axios** - HTTP client

### Backend
- **Node.js & Express 5.1.0** - Server framework
- **MongoDB & Mongoose 8.19.2** - Database
- **JWT (jsonwebtoken 9.0.0)** - Authentication
- **bcrypt 5.1.0** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Day.js 1.11.19** - Date manipulation

### External APIs
- **USDA FoodData Central API** - Nutritional data

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- USDA API Key ([Get it here](https://fdc.nal.usda.gov/api-key-signup.html))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/caloriesync.git
cd caloriesync
```

2. **Install root dependencies**
```bash
npm install
```

3. **Setup Backend**
```bash
cd caloriesync/backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
USDA_API_KEY=your_usda_api_key
NODE_ENV=development
```

4. **Setup Frontend**
```bash
cd ../frontend
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000
```

### Running the Application

**Backend** (from `caloriesync/backend`):
```bash
npm run dev    # Development with nodemon
# or
npm start      # Production
```

**Frontend** (from `caloriesync/frontend`):
```bash
npm run dev    # Development server
# or
npm run build  # Production build
npm run preview # Preview production build
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

---

## 📁 Project Structure

```
caloriesync/
├── backend/
│   ├── config/              # Configuration files
│   │   ├── allowedOrigins.js
│   │   └── corsOption.js
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── mealController.js
│   │   └── nutritionController.js
│   ├── middlewares/         # Custom middleware
│   │   └── authMiddleware.js
│   ├── models/             # Database schemas
│   │   ├── User.js
│   │   ├── Meal.js
│   │   └── MealItem.js
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── meal.js
│   │   └── index.js
│   └── server.js           # Entry point
│
└── frontend/
    ├── src/
    │   ├── pages/          # Page components
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   └── TrackCaloriesPage.jsx
    │   ├── services/       # API service layer
    │   │   ├── api.js
    │   │   ├── apiClient.js
    │   │   ├── authApi.js
    │   │   └── dashboardApi.js
    │   ├── utils/          # Helper functions
    │   │   └── calorieUtils.js
    │   ├── assets/         # Static assets
    │   ├── App.jsx         # Main app component
    │   └── main.jsx        # Entry point
    └── public/             # Public assets
```

---

## 🔌 API Integration

### USDA FoodData Central API

CaloriSync integrates with the USDA FoodData Central API to provide comprehensive nutritional information.

**Key Endpoints Used:**
- Food search and lookup
- Nutrient data retrieval
- Detailed food composition

[Learn more about the API](https://fdc.nal.usda.gov/api-guide.html)

**Data Licensing:**
USDA FoodData Central data is in the public domain and is available for use without restriction. The data is provided by the U.S. Department of Agriculture, Agricultural Research Service.

**Attribution:**
```
U.S. Department of Agriculture, Agricultural Research Service. 
FoodData Central, 2019. fdc.nal.usda.gov.
```

**Terms of Use:**
- Data is provided "as is" without warranty
- No registration required for non-commercial use
- API key required for access (free registration)
- Rate limits apply based on API key tier

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

### Application License
This project is licensed under the **ISC License**.

### Third-Party Data License

**USDA FoodData Central:**
Nutritional data provided by USDA FoodData Central is in the **public domain** and is not subject to domestic copyright protection under 17 U.S.C. § 105. The data is provided by the U.S. Department of Agriculture, Agricultural Research Service.

**Citation:**
```
U.S. Department of Agriculture, Agricultural Research Service. FoodData Central, 2019. 
fdc.nal.usda.gov.
```

While the USDA data is free to use, we acknowledge the USDA as the source of nutritional information used in this application.

---

## 👤 Author

**Omkar Dhekane** and Team

---

## 🙏 Acknowledgments

- USDA FoodData Central for providing nutritional data
- All contributors and testers
- The open-source community

---

<p align="center">Made with ❤️ for healthier eating habits</p>

