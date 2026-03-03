import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import ProductTable from '../../components/Admin/ProductTable';
import ProductForm from '../../components/Admin/ProductForm';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get('/api/admin/products');
        setProducts(res.data.data);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setEditProduct(null);
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/products/${id}`);
    setProducts(products.filter(p => p.id !== id));
  };

  const handleSave = async (product) => {
    let res;
    if (product.id) {
      res = await axios.patch(`/api/products/${product.id}`, product);
      setProducts(products.map(p => p.id === product.id ? res.data.data : p));
    } else {
      res = await axios.post('/api/products', product);
      setProducts([...products, res.data.data]);
    }
    setShowForm(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Product Management</h1>
        <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAdd}>Add Product</button>
        <ProductTable products={products} onEdit={handleEdit} onDelete={handleDelete} />
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full relative">
              <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowForm(false)}>×</button>
              <ProductForm product={editProduct} onSave={handleSave} onClose={() => setShowForm(false)} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProducts;
