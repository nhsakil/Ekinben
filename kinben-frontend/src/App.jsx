import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/globals.css';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages - Home & Catalog
import HomePage from './pages/index';
import CatalogPage from './pages/catalog';

// Pages - Products
import ProductDetailPage from './pages/products/ProductDetail';

// Pages - Cart & Checkout
import CartPage from './pages/cart';
import CheckoutPage from './pages/checkout';
import CheckoutSuccessPage from './pages/checkout/success';

// Pages - Auth
import LoginPage from './pages/auth/login';
import SignupPage from './pages/auth/signup';

// Pages - Account
import ProfilePage from './pages/account/profile';
import AddressBookPage from './pages/account/addresses';
import OrdersPage from './pages/account/orders';
import SettingsPage from './pages/account/settings';
import WishlistPage from './pages/account/wishlist';

// Pages - Blog (placeholders)
import BlogPage from './pages/blog/index';

// Pages - Not Found
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              {/* Header */}
              <header className="bg-white shadow sticky top-0 z-50">
                <div className="container-layout py-4">
                  <div className="flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-primary">KINBEN</h1>
                      <p className="text-sm text-gray-600">Premium Fashion</p>
                    </a>
                    <nav className="flex gap-6 items-center">
                      <a href="/catalog" className="text-gray-700 hover:text-primary font-medium">Products</a>
                      <a href="/blog" className="text-gray-700 hover:text-primary font-medium">Blog</a>
                      <a href="/cart" className="relative text-gray-700 hover:text-primary font-medium">
                        🛒 Cart
                      </a>
                      <a href="/account/profile" className="text-gray-700 hover:text-primary font-medium">👤</a>
                    </nav>
                  </div>
                </div>
              </header>

              {/* Main Content */}
              <main className="flex-1">
                <Routes>
                  {/* Home */}
                  <Route path="/" element={<HomePage />} />

                  {/* Products */}
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />

                  {/* Cart & Checkout */}
                  <Route path="/cart" element={<CartPage />} />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/checkout/success" element={<CheckoutSuccessPage />} />

                  {/* Auth */}
                  <Route path="/auth/login" element={<LoginPage />} />
                  <Route path="/auth/signup" element={<SignupPage />} />

                  {/* Account */}
                  <Route
                    path="/account/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/addresses"
                    element={
                      <ProtectedRoute>
                        <AddressBookPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/orders"
                    element={
                      <ProtectedRoute>
                        <OrdersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account/wishlist"
                    element={
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Blog */}
                  <Route path="/blog" element={<BlogPage />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              {/* Footer */}
              <footer className="bg-gray-800 text-white py-12 mt-12">
                <div className="container-layout">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                      <h3 className="font-bold text-lg mb-4">KINBEN</h3>
                      <p className="text-gray-400 text-sm">Premium Bangladeshi fashion for the modern man.</p>
                    </div>

                    {/* Quick Links */}
                    <div>
                      <h4 className="font-semibold mb-4">Shop</h4>
                      <ul className="space-y-2 text-gray-400 text-sm">
                        <li><a href="/catalog?category=shirts" className="hover:text-white">Shirts</a></li>
                        <li><a href="/catalog?category=panjabis" className="hover:text-white">Panjabis</a></li>
                        <li><a href="/catalog?category=polos" className="hover:text-white">Polos</a></li>
                      </ul>
                    </div>

                    {/* Support */}
                    <div>
                      <h4 className="font-semibold mb-4">Support</h4>
                      <ul className="space-y-2 text-gray-400 text-sm">
                        <li>📧 kinbenclothing@gmail.com</li>
                        <li>📞 +8809611900372</li>
                        <li><a href="/about" className="hover:text-white">About Us</a></li>
                      </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                      <h4 className="font-semibold mb-4">Newsletter</h4>
                      <input
                        type="email"
                        placeholder="Your email"
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded text-sm mb-2"
                      />
                      <button className="w-full bg-primary text-white py-2 rounded text-sm hover:bg-opacity-90">
                        Subscribe
                      </button>
                    </div>
                  </div>

                  {/* Copyright */}
                  <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
                    <p>&copy; 2024 KINBEN. All rights reserved.</p>
                  </div>
                </div>
              </footer>

              {/* Toast Notifications */}
              <ToastContainer position="bottom-right" autoClose={3000} />
            </div>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
