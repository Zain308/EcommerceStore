import { useState, useEffect } from 'react';
import axios from 'axios';
import { withSwal } from 'react-sweetalert2';
import Layout from '@/components/Layout';
import Spinner from '@/components/Spinner';

function Categories({ swal }) {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [parentCategory, setParentCategory] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (err) {
      setError('Failed to fetch categories');
    }
  }

  async function saveCategory(ev) {
    ev.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const data = {
        name,
        parentCategory: parentCategory || null,
        properties: properties.map(p => ({
          name: p.name,
          values: p.values.split(',')
        })),
      };
      if (editingCategory) {
        await axios.put('/api/categories', { ...data, _id: editingCategory._id });
      } else {
        await axios.post('/api/categories', data);
      }
      setName('');
      setParentCategory('');
      setEditingCategory(null);
      setProperties([]);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteCategory(categoryId) {
    const confirmResult = await swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await axios.delete(`/api/categories?_id=${categoryId}`);
      fetchCategories();
      await swal.fire('Deleted!', 'Your category has been deleted.', 'success');
    } catch (err) {
      if (err.response?.data?.error?.includes('subcategories')) {
        const forceResult = await swal.fire({
          title: 'Category has subcategories',
          text: err.response.data.error,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Delete all including subcategories',
          cancelButtonText: 'Cancel',
        });

        if (forceResult.isConfirmed) {
          try {
            await axios.delete(`/api/categories?_id=${categoryId}&force=true`);
            fetchCategories();
            await swal.fire('Deleted!', 'Category and all subcategories have been deleted.', 'success');
          } catch (forceErr) {
            await swal.fire('Error!', forceErr.response?.data?.error || 'Failed to force delete category', 'error');
          }
        }
      } else {
        await swal.fire('Error!', err.response?.data?.error || 'Failed to delete category', 'error');
      }
    }
  }

  function editCategory(category) {
    setEditingCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id || '');
    setProperties(
      category.properties?.map(p => ({
        name: p.name || '',
        values: Array.isArray(p.values) ? p.values.join(',') : p.values || '',
      })) || []
    );
  }

  function cancelEdit() {
    setEditingCategory(null);
    setName('');
    setParentCategory('');
    setProperties([]);
  }

  function addProperty() {
    setProperties(prev => [...prev, { name: '', values: '' }]);
  }

  function handlePropertyNameChange(index, newName) {
    setProperties(prev => {
      const newProps = [...prev];
      newProps[index].name = newName;
      return newProps;
    });
  }

  function handlePropertyValuesChange(index, newValues) {
    setProperties(prev => {
      const newProps = [...prev];
      newProps[index].values = newValues;
      return newProps;
    });
  }

  function removeProperty(index) {
    setProperties(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold text-blue-900 mb-6">Categories</h1>

      {/* Form Section */}
      <form onSubmit={saveCategory} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="text-red-200 bg-red-500/10 p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Category Name */}
        <div>
          <label className="block text-lg font-medium text-blue-900 mb-1">
            Category Name
          </label>
          <input
            type="text"
            placeholder="Enter category name"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-blue-900 placeholder-blue-900 placeholder-opacity-60"
            value={name}
            onChange={ev => setName(ev.target.value)}
            required
          />
        </div>

        {/* Parent Category */}
        <div>
          <label className="block text-lg font-medium text-blue-900 mb-1">
            Parent Category
          </label>
          <select
            value={parentCategory}
            onChange={ev => setParentCategory(ev.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-blue-900"
          >
            <option value="">No parent category</option>
            {categories
              .filter(c => !editingCategory || c._id !== editingCategory._id)
              .map(category => (
                <option key={category._id} value={category._id} className="text-blue-900">
                  {category.name}
                </option>
              ))}
          </select>
        </div>

        {/* Properties */}
        <div>
          <label className="block text-lg font-medium text-blue-900 mb-1">
            Properties
          </label>
          <button
            type="button"
            onClick={addProperty}
            className="mb-4 bg-gradient-to-r from-cyan-100 to-blue-100 text-blue-900 px-4 py-2 rounded-xl font-medium shadow-md hover:from-cyan-200 hover:to-blue-200 hover:shadow-lg transition-all duration-300"
          >
            + Add New Property
          </button>
          {properties.length > 0 && (
            <div className="space-y-4">
              {properties.map((property, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={property.name}
                    onChange={ev => handlePropertyNameChange(index, ev.target.value)}
                    placeholder="Property name (e.g., Color)"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-blue-900 placeholder-blue-900 placeholder-opacity-60"
                  />
                  <input
                    type="text"
                    value={property.values}
                    onChange={ev => handlePropertyValuesChange(index, ev.target.value)}
                    placeholder="Values, comma separated"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-blue-900 placeholder-blue-900 placeholder-opacity-60"
                  />
                  <button
                    type="button"
                    onClick={() => removeProperty(index)}
                    className="bg-red-500 text-white px-3 py-2 rounded-xl hover:bg-red-600 transition-all duration-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner />
                Saving...
              </span>
            ) : editingCategory ? (
              'Update Category'
            ) : (
              'Create Category'
            )}
          </button>
          {editingCategory && (
            <button
              type="button"
              onClick={cancelEdit}
              className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:from-gray-500 hover:to-gray-600 hover:shadow-xl transition-all duration-300"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Categories List */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">All Categories</h2>
        {categories.length > 0 ? (
          <div className="overflow-x-auto">
            {!editingCategory && (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="p-3 text-blue-900 font-bold uppercase text-left">Category Name</th>
                    <th className="p-3 text-blue-900 font-bold uppercase text-left">Parent Category</th>
                    <th className="p-3 text-blue-900 font-bold uppercase text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 font-medium text-blue-900">{category.name}</td>
                      <td className="p-3 text-gray-600">{category.parent ? category.parent.name : '-'}</td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => editCategory(category)}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-xl font-medium shadow-md hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCategory(category._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-xl font-medium shadow-md hover:bg-red-600 hover:shadow-lg transition-all duration-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">No categories created yet</p>
        )}
      </div>
    </Layout>
  );
}

const CategoriesWithSwal = withSwal(function CategoriesWrapper({ swal }) {
  return <Categories swal={swal} />;
});

export default CategoriesWithSwal;