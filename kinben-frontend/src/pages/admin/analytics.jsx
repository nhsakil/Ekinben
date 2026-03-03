import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import AnalyticsSummary from '../../components/Admin/AnalyticsSummary';
import AnalyticsCharts from '../../components/Admin/AnalyticsCharts';

const AdminAnalytics = () => {
  const [summary, setSummary] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/admin/analytics');
        setSummary(res.data.data?.summary || {});
        setChartsData(res.data.data?.charts || {});
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Analytics & Reports</h1>
        <AnalyticsSummary summary={summary} />
        <AnalyticsCharts data={chartsData} />
      </main>
    </div>
  );
};

export default AdminAnalytics;
