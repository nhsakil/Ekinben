import React from 'react';

const NotFoundPage = () => {
  return (
    <div className="container-layout py-12">
      <div className="text-center">
        <div className="text-6xl font-bold text-gray-900 mb-4">404</div>
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-4 justify-center">
          <a href="/" className="btn-primary">Go Home</a>
          <a href="/catalog" className="btn-outline">Shop Now</a>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
