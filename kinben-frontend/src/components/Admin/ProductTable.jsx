const ProductTable = ({ products, onEdit, onDelete }) => (
  <table className="w-full border">
    <thead>
      <tr className="bg-gray-100">
        <th className="p-2">Name</th>
        <th className="p-2">Price</th>
        <th className="p-2">Stock</th>
        <th className="p-2">Actions</th>
      </tr>
    </thead>
    <tbody>
      {products.map(product => (
        <tr key={product.id}>
          <td className="p-2">{product.name}</td>
          <td className="p-2">৳{product.price}</td>
          <td className="p-2">{product.stock_quantity}</td>
          <td className="p-2">
            <button className="mr-2 px-2 py-1 bg-blue-600 text-white rounded" onClick={() => onEdit(product)}>Edit</button>
            <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => onDelete(product.id)}>Delete</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default ProductTable;
