import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { ReactSortable } from 'react-sortablejs';

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages = [],
  category: assignedCategory,
  properties: existingProperties = {}
}) {
  const [title, setTitle] = useState(existingTitle || '');
  const [description, setDescription] = useState(existingDescription || '');
  const [category, setCategory] = useState(
    assignedCategory?._id || assignedCategory || ''
  );
  const [productProperties, setProductProperties] = useState(existingProperties);
  const [price, setPrice] = useState(existingPrice || '');
  const [images, setImages] = useState(existingImages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await axios.get('/api/categories');
        setCategories(result.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setError('Failed to load categories. Please try again later.');
      }
    };
    fetchCategories();
  }, []);

  async function saveProduct(ev) {
    ev.preventDefault();
    setIsSubmitting(true);
    setError('');
  
    try {
      const data = {
        title,
        description,
        price: Number(price),
        images,
        _id,
        category,
        properties: productProperties
      };
  
      console.log('Submitting data:', data); // Debug log
  
      const response = _id 
        ? await axios.put('/api/products', data)
        : await axios.post('/api/products', data);
      
      console.log('Response:', response.data); // Debug log
      router.push('/products');
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error response:', error.response?.data);
      
      setError(
        error.response?.data?.message || 
        error.message || 
        'An error occurred while saving the product'
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  
  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (!files?.length) return;

    setUploading(true);
    setUploadError('');

    try {
      const data = new FormData();
      for (const file of files) {
        data.append('file', file);
      }
      
      const res = await axios.post('/api/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setImages(prev => [...prev, ...res.data.links]);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      ev.target.value = '';
    }
  }

  function updateImagesOrder(newImages) {
    setImages(newImages);
  }

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({_id}) => _id === category);
    if (catInfo?.properties) {
      propertiesToFill.push(...catInfo.properties);
    }
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(({_id}) => _id === catInfo.parent._id);
      if (parentCat?.properties) {
        propertiesToFill.push(...parentCat.properties);
      }
      catInfo = parentCat;
    }
  }

  function setProductProp(propName, value) {
    setProductProperties(prev => ({
      ...prev,
      [propName]: value
    }));
  }

  return (
    <form onSubmit={saveProduct} className="space-y-6">
      {/* Error Messages */}
      {error && (
        <div className="text-red-200 bg-red-500/10 p-3 rounded-xl text-center">
          {error}
        </div>
      )}
      {uploadError && (
        <div className="text-red-200 bg-red-500/10 p-3 rounded-xl text-center">
          {uploadError}
        </div>
      )}

      {/* Product Name */}
      <div>
  <label className="block text-lg font-medium text-blue-900 mb-1">
    Product Name
  </label>
  <input
    type="text"
    placeholder="Enter product name"
    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-blue-900 placeholder-blue-900 placeholder-opacity-60"
    value={title}
    onChange={ev => setTitle(ev.target.value)}
    required
  />
</div>

      {/* Category */}
      <div>
  <label className="block text-lg font-medium text-blue-900 mb-1">
    Category
  </label>
  <select 
    value={category} 
    onChange={ev => setCategory(ev.target.value)}
    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-blue-900"
  >
    <option value="" className="text-blue-900">
      Uncategorized
    </option>
    {categories.length > 0 && categories.map(c => (
      <option key={c._id} value={c._id} className="text-blue-900">
        {c.name}
      </option>
    ))}
  </select>
</div>
      {/* Product Properties */}
      {propertiesToFill.length > 0 && (
  <div className="space-y-4">
    {propertiesToFill.map((p, i) => (
      <div key={i} className="flex items-center gap-3">
        <span className="text-lg font-medium text-gray-700 w-32">
          {p.name}
        </span>
        {p.values ? (
          <select
            value={productProperties[p.name] || ''}
            onChange={ev => setProductProp(p.name, ev.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-blue-900"
          >
            <option value="" className="text-blue-900">
              Select {p.name}
            </option>
            {p.values.map((v, idx) => (
              <option key={idx} value={v} className="text-blue-900">
                {v}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={p.type === 'number' ? 'number' : 'text'}
            placeholder={`Enter ${p.name}`}
            value={productProperties[p.name] || ''}
            onChange={ev => setProductProp(p.name, ev.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-blue-900 placeholder-blue-900 placeholder-opacity-60"
          />
        )}
      </div>
    ))}
  </div>
)}
      {/* Photos */}
      <div>
        <label className="block text-lg font-medium text-blue-900 mb-1">
          Photos
        </label>
        <div className="flex flex-wrap gap-2">
          <ReactSortable
            className="flex flex-wrap gap-2"
            list={images}
            setList={updateImagesOrder}
            disabled={uploading}
          >
            {images.map((link, index) => (
              <div key={index} className="h-24 w-24 relative group">
                <img
                  src={link}
                  alt={`Product image ${index + 1}`}
                  className="h-full w-full rounded-xl object-cover shadow-md"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-sm">Drag to reorder</span>
                </div>
              </div>
            ))}
          </ReactSortable>
          <label
            className={`w-24 h-24 text-center flex flex-col items-center justify-center text-sm font-medium rounded-xl cursor-pointer transition-all duration-300 shadow-md ${
              uploading
                ? 'bg-gray-100'
                : 'bg-gradient-to-r from-cyan-100 to-blue-100 text-blue-900 hover:from-cyan-200 hover:to-blue-200 hover:shadow-lg'
            }`}
          >
            {uploading ? (
              <span><Spinner /></span>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <span>Upload</span>
                <input
                  type="file"
                  onChange={uploadImages}
                  className="hidden"
                  multiple
                  accept="image/*"
                />
              </>
            )}
          </label>
        </div>
      </div>

     {/* Product Description */}
<div>
  <label className="block text-lg font-medium text-blue-900 mb-1">
    Product Description
  </label>
  <textarea
    placeholder="Enter product description"
    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-y text-blue-900 placeholder-blue-900 placeholder-opacity-60"
    value={description}
    onChange={ev => setDescription(ev.target.value)}
    rows="4"
  />
</div>

{/* Product Price */}
<div>
  <label className="block text-lg font-medium text-blue-900 mb-1">
    Product Price (In USD$)
  </label>
  <input
    type="number"
    placeholder="Enter price"
    className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-blue-900 placeholder-blue-900 placeholder-opacity-60"
    value={price}
    onChange={ev => setPrice(ev.target.value)}
    min="0"
    step="0.01"
    required
  />
</div>
      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSubmitting || uploading}
      >
        {isSubmitting ? 'Saving...' : 'Save Product'}
      </button>
    </form>
  );
}