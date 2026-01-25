# Full Stack E-commerce Website

A complete e-commerce solution built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **User Authentication** - Register, login, JWT-based auth
- **Product Management** - Browse, search, filter products
- **Shopping Cart** - Add/remove items, quantity management
- **Checkout** - Stripe payment integration
- **Order Management** - Track orders, order history
- **Admin Dashboard** - Product CRUD, order management

## Tech Stack

**Frontend:** React 18, React Router, Context API, Axios, Stripe.js
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT
**Payment:** Stripe

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Stripe Account

### Installation

1. **Clone and install dependencies:**
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Frontend
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your credentials
```

2. **Configure environment variables:**

Backend `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=sk_test_...
CLIENT_URL=http://localhost:3000
```

Frontend `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
```

3. **Run the application:**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

4. **Access the app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
├── backend/
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── middleware/     # Auth middleware
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── context/    # React Context
│   │   ├── styles/     # CSS files
│   │   └── utils/      # API utilities
│   └── public/
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/products | Get all products |
| GET | /api/products/:id | Get single product |
| POST | /api/cart/add | Add to cart |
| POST | /api/orders | Create order |
| POST | /api/payment/create-payment-intent | Create payment |

## License

MIT License
