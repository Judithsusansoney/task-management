# 🌊 TaskFlow - Team Task Manager

Welcome to **TaskFlow**! This is a fast, lightweight, and visually stunning Single Page Application (SPA) built to help teams organize projects and track task progress seamlessly.

I built this project to combine a robust backend API with a beautiful, dynamic frontend interface without relying on heavy frontend frameworks.

---

## ✨ Features

- **Role-Based Access Control**:
  - 👑 **Admins**: Can create projects, assign tasks to members, and oversee everyone's progress across the entire system.
  - 👤 **Members**: Get a focused dashboard showing *only* the tasks assigned to them, allowing them to easily update their status and progress.
- **Dynamic Dashboard**: See real-time metrics for Total Tasks, In Progress, Completed, and Overdue tasks.
- **Visual Progress Tracking**: Beautiful slider inputs and progress bars that update instantly.
- **Single Page Application (SPA)**: The frontend uses vanilla JavaScript to fetch data from the REST API, meaning zero page reloads while navigating!
- **Dark Mode UI**: A premium, modern dark theme utilizing sleek glassmorphism and satisfying color accents.

---

## 🛠️ Tech Stack

- **Backend**: Python, Django, Django REST Framework (DRF)
- **Database**: SQLite (Perfect for quick deployment and testing!)
- **Frontend**: HTML5, Vanilla CSS3 (Custom Design System), Vanilla JavaScript
- **Authentication**: Token-based Auth via DRF

---

## 🚀 How to Run Locally

If you want to spin this up on your own machine, follow these steps:

**1. Clone the repository**
```bash
git clone <your-repo-link-here>
cd TeamTaskManager/teamtaskmanager_proj
```

**2. Set up a virtual environment (Optional but recommended)**
```bash
python -m venv env1
env1\Scripts\activate  # On Windows
# source env1/bin/activate  # On Mac/Linux
```

**3. Install dependencies**
```bash
pip install django djangorestframework
```

**4. Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

**5. Start the server!**
```bash
python manage.py runserver
```

**6. Check it out**
Open your browser and navigate to `http://127.0.0.1:8000/`.

---

## 🧪 Testing it out

To get a feel for the app, you can create a superuser from your terminal:
```bash
python manage.py createsuperuser
```
*(Give them a username, password, and make sure their role is set to `ADMIN` in the database).*

Then log in, create a project, and start assigning tasks!

---
*Built with ❤️ using Django and Vanilla JS.*
