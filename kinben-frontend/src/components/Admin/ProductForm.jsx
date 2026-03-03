const ProductForm = ({ product, onSave, onClose }) => (
  <form className="space-y-4" onSubmit={e => { e.preventDefault(); onSave(product); }}>
    <input className="border p-2 w-full" placeholder="Name" defaultValue={product?.name || ''} />
    <input className="border p-2 w-full" type="number" placeholder="Price" defaultValue={product?.price || ''} />
    <input className="border p-2 w-full" type="number" placeholder="Stock" defaultValue={product?.stock_quantity || ''} />
    <div className="flex space-x-2">
      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
      <button type="button" className="px-4 py-2 bg-gray-400 text-white rounded" onClick={onClose}>Cancel</button>
    </div>
  </form>
);

export default ProductForm;
