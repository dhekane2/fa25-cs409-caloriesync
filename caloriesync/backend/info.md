# CalorieSync – Backend Architecture & API Design

## 1. Overview

**CalorieSync** is a calorie-tracking web application that enables users to:
- Register and manage personal health profiles
- Log meals and food items
- Track daily, weekly, and monthly calorie intake
- Visualize progress against expected calorie goals

This document outlines:
- UI screen responsibilities
- Data models
- API endpoints
- Authentication requirements

---

## 2. UI Screens & Responsibilities

### 2.1 Home Screen

**Purpose**
- Provide high-level information about the CalorieSync platform

**User Actions**
- Click **Login** → navigate to Login screen  
- Click **Register** → navigate to Register screen  

**Data**
- Read: None  
- Write: None  

---

### 2.2 Register Screen

**Purpose**
- Allow a new user to create a CalorieSync account

**User Actions**
- Fill in registration form  
- Click **Register**  
- Click **Login** link to navigate to Login screen  

**Data**
- Read: None  
- Write:
  - `first_name`
  - `last_name`
  - `email`
  - `password`
  - `phone_number`
  - `age`
  - `gender`
  - `weight`
  - `goal_weight`

---

### 2.3 Login Screen

**Purpose**
- Authenticate existing users

**User Actions**
- Enter credentials  
- Click **Login**  
- Click **Sign up** to navigate to Register screen  

**Data**
- Read: None  
- Write:
  - `email`
  - `password`

---

### 2.4 Dashboard Screen

**Purpose**
- Provide a summary of calorie intake and profile management

**User Actions**

**Read**
- View monthly calorie intake (calendar-style)
- View weekly calorie intake (chart-based)
- View user profile information

**Update**
- Edit profile fields
- Click **Update** to save changes

**Create**
- Click **Track Calories** → navigate to Track screen

**Session**
- Click **Logout** to end user session

**Data**
- Read:
  - User profile information
  - Monthly calorie statistics
  - Weekly calorie statistics
- Write:
  - Updated user profile data

---

### 2.5 Track Screen

**Purpose**
- Allow users to log meals and food items

**User Actions**
- Search food items via Nutrition API
- Increment/decrement item quantity
- Manually add custom food items
- View current meal/cart
- Remove items from meal/cart
- View total calories for current meal
- Submit meal → redirect to Dashboard

**Data**
- Read:
  - Nutrition API (food search & calorie lookup)
- Write:
  - Current meal item list
  - Persisted meal data for the user

---

## 3. Data Model

![ER diagrame](/doc/er-diagram.png)

### 3.1 User

| Field | Type |
|------|------|
| `id` | Primary Key |
| `first_name` | String |
| `last_name` | String |
| `email` | String (unique) |
| `password_hash` | String |
| `phone_number` | String (optional) |
| `age` | Integer |
| `gender` | String |
| `weight` | Float |
| `goal_weight` | Float |
| `updated_at` | Timestamp |

> Passwords are never stored in plain text. Only hashed values are persisted.

---

### 3.2 Meal

| Field | Type |
|------|------|
| `meal_id` | Primary Key |
| `user_id` | Foreign Key → User |
| `total_calorie_count` | Integer |
| `logged_at` | Date |
| `meal_items` | Array of MealItem |

---

### 3.3 MealItem

| Field | Type |
|------|------|
| `item_id` | Primary Key |
| `meal_id` | Foreign Key → Meal |
| `item_name` | String |
| `quantity` | Integer |
| `calorie_count` | Integer |
| `logged_at` | Timestamp |

---

## 4. API Endpoints

## 4.1 Authentication APIs

### Register User

**POST** `/auth/register`

**Request Body**
```json
{
  "first_name": "Omkar",
  "last_name": "Dhekane",
  "email": "omkar@example.com",
  "password": "PlaintextFromUserForm",
  "phone_number": "1234567890",
  "age": 24,
  "gender": "male",
  "weight": 72.5,
  "goal_weight": 68.0
}
```

**Response Body**

```json
{
  "id": 1,
  "first_name": "Omkar",
  "last_name": "Dhekane",
  "email": "omkar@example.com"
}
```

---

### Login User

**POST** `/auth/login`

**Request Body**

```json
{
  "email": "omkar@example.com",
  "password": "PlaintextFromUserForm"
}
```

**Response Body**

```json
{
  "access_token": "jwt-token-here",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "first_name": "Omkar",
    "last_name": "Dhekane",
    "email": "omkar@example.com"
  }
}
```

---

## 4.2 Dashboard & User APIs

**Authentication Required**

### Get User Profile

**GET** `/users/{id}`

**Response**

```json
{
  "id": 1,
  "first_name": "Omkar",
  "last_name": "Dhekane",
  "email": "omkar@example.com",
  "phone_number": "1234567890",
  "age": 24,
  "gender": "male",
  "weight": 72.5,
  "goal_weight": 68.0,
  "updated_at": "2025-11-25T10:30:00Z"
}
```

---

### Update User Profile

**PUT / PATCH** `/users/{id}`

**Request Body**

```json
{
  "first_name": "Omkar",
  "last_name": "Dhekane",
  "phone_number": "9999999999",
  "age": 25,
  "gender": "male",
  "weight": 71.0,
  "goal_weight": 67.0
}
```

---

## 4.3 Statistics APIs

**Authentication Required**

### Monthly Statistics

**GET** `/stats/monthly?year=2025&month=11`

```json
{
  "year": 2025,
  "month": 11,
  "days": [
    { "date": "2025-10-26", "in_current_month": false, "total_calories": 0 },
    { "date": "2025-10-27", "in_current_month": false, "total_calories": 1841 },
    { "date": "2025-10-28", "in_current_month": false, "total_calories": 2262 },
    { "date": "2025-10-29", "in_current_month": false, "total_calories": 2040 },
    { "date": "2025-10-30", "in_current_month": false, "total_calories": 2295 },
    { "date": "2025-10-31", "in_current_month": false, "total_calories": 2122 },
    { "date": "2025-11-01", "in_current_month": true, "total_calories": 1876 },
    { "date": "2025-11-02", "in_current_month": true, "total_calories": 2282 },
    { "date": "2025-11-03", "in_current_month": true, "total_calories": 2000 }
  ],
  "month_total": 51811
}
```

---

### Weekly Statistics

**GET** `/stats/weekly?start_date=2025-11-05`

```json
{
  "week_start": "2025-11-05",
  "week_end": "2025-11-11",
  "expected_daily_intake": 1800,
  "days": [
    { "date": "2025-11-05", "actual": 2400, "expected": 1800 },
    { "date": "2025-11-06", "actual": 1950, "expected": 1800 },
    { "date": "2025-11-07", "actual": 1900, "expected": 1800 },
    { "date": "2025-11-08", "actual": 2000, "expected": 1800 },
    { "date": "2025-11-09", "actual": 2100, "expected": 1800 },
    { "date": "2025-11-10", "actual": 1850, "expected": 1800 },
    { "date": "2025-11-11", "actual": 1900, "expected": 1800 }
  ],
  "accuracy_score": 0.83,
  "accuracy_percentage": 83,
  "feedback_message": "Good job! You're on the right track."
}
```

---

## 4.4 Meal Tracking APIs

**Authentication Required**

### Create Meal

**POST** `/meals`

* Creates a new meal and associated meal items when the user submits the log

---

### Food & Nutrition Search

**GET** `/api/foods/search?query=apple`

* Internally calls the USDA Food API to fetch calorie and nutrition information

---

## 5. Authentication & Security Notes

* JWT-based authentication
* All protected routes require `Authorization: Bearer <token>`
* Passwords are hashed before storage
* Users can only access their own data

