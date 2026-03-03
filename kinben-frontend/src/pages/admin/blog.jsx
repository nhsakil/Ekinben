// Admin blog editor page scaffold
import React from 'react';
import BlogEditor from '../../components/Blog/BlogEditor';

const AdminBlogEditorPage = () => (
  <div className="container-layout py-8">
    <h1 className="text-3xl font-bold mb-8">Blog Editor (Admin)</h1>
    <BlogEditor />
  </div>
);

export default AdminBlogEditorPage;
