# 🧠 TechWear Hub

**TechWear Hub** is a beginner-friendly, front-end e-commerce website for wearable tech products — built with **HTML**, **CSS (PicoCSS)**, and **JavaScript**.  
It demonstrates how to create a **multi-page, connected shopping site** using only static front-end files (perfect for GitHub Pages hosting).

---

## 🌟 Features

### 🛍️ User-Facing Pages
- **Home Page** – Welcoming introduction with navigation  
- **Shop Page** – Displays products (smartwatch, earphones, fitness tracker) with real Unsplash images  
- **Cart Page** – Shows items added by the user and allows item removal or checkout  
- **Login Page** – Simulates user login and stores username using `localStorage`  
- **Admin Dashboard** – Restricted page simulating a SQL injection detection tool (mock machine-learning logs)

### 🧩 Connected Functionality
- Items added to cart in **Shop** appear in **Cart** instantly  
- User stays logged in across all pages  
- Data persists between reloads using `localStorage`  
- All pages share the same clean layout and responsive navigation  

---

## 📁 Project Structure

echwear-hub/
│
├── index.html # Home page
├── shop.html # Product listings
├── login.html # Login simulation
├── cart.html # Cart page
├── admin.html # Admin dashboard (mock ML detection)
│
├── css/
│ └── style.css # Custom styling
│
└── js/
├── main.js # Shared logic for login/cart/navigation
└── admin.js # Admin dashboard functionality


---

## 🧱 Tech Stack

- **HTML5** – Structure  
- **CSS3 + [PicoCSS](https://picocss.com)** – Modern responsive styling  
- **Vanilla JavaScript** – Cart, login, and localStorage logic  
- **Unsplash** – Real product images  
- **GitHub Pages** – Free static hosting

---

## 🖼️ Product Images (Unsplash)

| Product | Image |
|----------|--------|
| 🕒 Smartwatch | [Smartwatch](https://images.unsplash.com/photo-1585386959984-a41552231693?auto=format&fit=crop&w=900&q=80) |
| 🎧 Earphones | [Earphones](https://images.unsplash.com/photo-1580894894513-f96cde168351?auto=format&fit=crop&w=900&q=80) |
| 💪 Fitness Tracker | [Fitness Tracker](https://images.unsplash.com/photo-1618498082410-b3f8b6f1b91e?auto=format&fit=crop&w=900&q=80) |

---

## 🚀 Deployment (GitHub Pages)

1. Go to your repository **Settings → Pages**
2. Under **Source**, choose:


Deploy from branch
Branch: main | / (root)

3. Click **Save**
4. Wait 1–2 minutes, then visit:


https://yourusername.github.io/techwear-hub/


---

## 💡 How It Works

### 🛒 Cart System
- Items are saved to `localStorage` under the key `cartItems`
- They persist between page loads and appear on the cart page

### 🔐 Login System
- Username is stored in `localStorage` (`loggedUser`)
- Navbar updates to display “Welcome, username”

### ⚙️ Admin Simulation
- Admin login credentials:


Username: admin
Password: admin123

- Shows dynamically generated attack logs using JavaScript (simulating a trained ML detector)

---

## 🧠 Example Simulation Output (Admin)

| Time | IP Address | Request | Prediction |
|------|-------------|----------|-------------|
| 10:45:23 | 192.168.0.22 | `' OR 1=1 --` | SQLi detected |
| 10:46:05 | 192.168.0.88 | `SELECT * FROM users` | Normal request |

---

## 🎨 Design Goals

- Clean and minimal layout  
- Responsive across desktop, tablet, and mobile  
- Easy-to-read, well-commented code for learning  
- Beginner-friendly modular structure  

---

## 🧑‍💻 Author

**Aravind**  
Built as a learning project on web development and basic front-end simulation of e-commerce and cybersecurity concepts.

---

## 📜 License

This project is open-source under the MIT License.  
Feel free to use, learn from, and modify it!

---

> 🔗 Live Demo: [https://yourusername.github.io/techwear-hub/](https://yourusername.github.io/techwear-hub/)
