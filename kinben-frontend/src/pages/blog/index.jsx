import React from 'react';

const BlogPage = () => {
  return (
    <div className="container-layout py-8">
      <h1 className="text-3xl font-bold mb-8">KINBEN Blog</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card hover:shadow-lg transition-shadow">
            <div className="bg-gray-300 h-48 rounded mb-4"></div>
            <h3 className="font-semibold mb-2">Fashion Tip {i}</h3>
            <p className="text-gray-600 text-sm mb-4">Discover the latest fashion trends and styling tips for the modern man.</p>
            <p className="text-sm text-gray-500">March 2024</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
