# 🔐 CipherSafe  

A secure credential manager built with Node.js, featuring JWT authentication, 2FA, AES encryption, and breach detection.  

---

## ✨ Features  

- ✅ User Authentication (Register/Login)  
- ✅ JWT-based session security  
- ✅ CRUD operations for credentials  
- ✅ AES encryption for sensitive data  
- ✅ Breach detection using [HIBP API](https://haveibeenpwned.com/)  
- ✅ Password strength meter  
- ✅ Two-Factor Authentication (2FA) for extra security  

---

## 🛠 Tech Stack  

- **Backend**: Node.js, Express  
- **Database**: MongoDB (or compatible)  
- **Auth & Security**: JSON Web Tokens (JWT), AES Encryption, 2FA  
- **API Integration**: HIBP (Have I Been Pwned) API  

---

## ⚡ Getting Started  

### Prerequisites  
- Node.js installed  
- MongoDB running (local or cloud)  
- [Postman](https://www.postman.com/) (optional, for testing APIs)  

### Installation  

```bash
# Clone repository
git clone https://github.com/YourUsername/ciphersafe.git
cd ciphersafe

# Install dependencies
npm install

# Create .env file and add your environment variables
# Example:
# MONGO_URI=mongodb://localhost:27017/ciphersafe
# JWT_SECRET=yourSecretKey
# HIBP_API_KEY=yourApiKey

# Start the server
npm start

🗄 Database Schema (Example)

User Schema

{
  username: String,
  email: String,
  password: String,   // hashed
  twoFactorEnabled: Boolean,
  twoFactorSecret: String
}


Credential Schema

{
  userId: ObjectId,
  service: String,
  username: String,
  password: String,   // AES encrypted
  createdAt: Date
}
## 📌 API Endpoints  

### 🔑 Auth  

| Method | Endpoint             | Description          | Body Example |
|--------|----------------------|----------------------|--------------|
| POST   | `/api/auth/register` | Register new user    | ```json { "username": "testuser", "email": "test@example.com", "password": "StrongPass123!" } ``` |
| POST   | `/api/auth/login`    | Login user & get JWT | ```json { "username": "testuser", "password": "StrongPass123!" } ``` |

---

### 🗄 Credentials  

| Method | Endpoint                  | Description                   | Body Example |
|--------|----------------------------|-------------------------------|--------------|
| GET    | `/api/credentials`         | Get all saved credentials (JWT required) | – |
| POST   | `/api/credentials`         | Add new credential            | ```json { "service": "gmail", "username": "myemail@gmail.com", "password": "EncryptedPass123!" } ``` |
| DELETE | `/api/credentials/:id`     | Delete credential by ID       | – |


🔒 Extra Features

AES Encryption → All stored credentials are encrypted before saving in DB.

2FA → Optional two-factor authentication with TOTP (Google Authenticator, Authy, etc.).

HIBP Integration → Checks if a password has appeared in known data breaches.

Password Strength Meter → Ensures users set strong, secure passwords.
