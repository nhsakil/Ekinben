// Newsletter page scaffold
import React from 'react';
import NewsletterForm from '../components/Newsletter/NewsletterForm';
import NewsletterAdminPanel from '../components/Newsletter/NewsletterAdminPanel';

const NewsletterPage = () => (
  <div className="container-layout py-8">
    <h1 className="text-3xl font-bold mb-8">Newsletter</h1>
    <div className="mb-8">
      <NewsletterForm />
    </div>
    <NewsletterAdminPanel />
  </div>
);

export default NewsletterPage;
