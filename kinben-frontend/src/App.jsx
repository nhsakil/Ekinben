import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/globals.css';

// Contexts (to be created)
// import { AuthProvider } from './context/AuthContext';
// import { CartProvider } from './context/CartContext';
// import { WishlistProvider } from './context/WishlistContext';
// import { NotificationProvider } from './context/NotificationContext';

// Components (to be created)
// import Layout from './components/Layout/Layout';

// Pages (to be created)
// import HomePage from './pages/index';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container-layout py-4">
          <h1 className="text-2xl font-bold text-primary">KINBEN</h1>
          <p className="text-gray-600">Premium Bangladeshi Men's Fashion</p>
        </div>
      </header>

      <main className="container-layout py-12">
        <Routes>
          <Route path="/" element={
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Welcome to KINBEN</h1>
              <p className="text-gray-600 mb-8">Building the e-commerce platform...</p>
              <div className="bg-blue-50 p-8 rounded-lg inline-block">
                <p className="text-sm font-mono text-left">
                  ✓ Frontend: React + Vite + TailwindCSS<br/>
                  ⏳ Backend: Node.js + Express (coming next)<br/>
                  ⏳ Database: Supabase PostgreSQL (coming next)<br/>
                  ⏳ Features: Auth, Products, Cart, Checkout, Admin, Blog
                </p>
              </div>
            </div>
          } />
        </Routes>
      </main>

      <footer className="bg-gray-800 text-white mt-12 py-8">
        <div className="container-layout text-center">
          <p>KINBEN - Premium Fashion | Building in Progress</p>
        </div>
      </footer>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default App;
