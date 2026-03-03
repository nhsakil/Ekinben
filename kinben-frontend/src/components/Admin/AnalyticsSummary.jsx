const AnalyticsSummary = ({ summary }) => (
  <div className="grid grid-cols-4 gap-8 mb-8">
    <div className="bg-white rounded shadow p-6">Total Sales: {summary?.sales ?? '-'}</div>
    <div className="bg-white rounded shadow p-6">Total Users: {summary?.users ?? '-'}</div>
    <div className="bg-white rounded shadow p-6">Total Products: {summary?.products ?? '-'}</div>
    <div className="bg-white rounded shadow p-6">Total Orders: {summary?.orders ?? '-'}</div>
  </div>
);

export default AnalyticsSummary;
