import React from 'react';

const HomePage = () => {
  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary to-gray-800 text-white">
        <div className="container-layout py-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4">Premium Men's Fashion</h1>
            <p className="text-xl mb-6 text-gray-200">
              Elevate your style with KINBEN's exclusive collection of shirts, panjabis, and more.
            </p>
            <a href="/catalog" className="btn-primary bg-accent hover:bg-opacity-90">
              Shop Now →
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container-layout">
          <h2 className="text-3xl font-bold mb-12 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {['Shirts', 'Panjabis', 'Polos', 'Pants', 'Katua'].map((cat) => (
              <a
                key={cat}
                href={`/catalog?category=${cat.toLowerCase()}`}
                className="card text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-3">👕</div>
                <h3 className="font-semibold">{cat}</h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-100">
        <div className="container-layout">
          <h2 className="text-3xl font-bold mb-12 text-center">Featured Collection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card hover:shadow-lg transition-shadow">
                <div className="bg-gray-300 h-48 rounded mb-4"></div>
                <h3 className="font-semibold mb-2">Premium Product {i}</h3>
                <p className="text-gray-600 text-sm mb-4">৳1,690 - ৳2,490</p>
                <button className="btn-primary w-full">Add to Cart</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary text-white">
        <div className="container-layout text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="mb-6 text-gray-200">Get exclusive offers and new arrivals directly to your inbox</p>
          <div className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-3 rounded text-gray-900"
            />
            <button className="btn-accent px-6">Subscribe</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
