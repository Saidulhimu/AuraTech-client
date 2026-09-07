import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../../hooks/useAuth'; 
import axios from 'axios';
import Swal from 'sweetalert2';

const AddProducts = () => {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset
  } = useForm();

  // Auth Context থেকে User Email আসার পর সেশনে Auto fill করবে
  useEffect(() => {
    if (user?.email) {
      setValue('sellerEmail', user.email);
    }
  }, [user, setValue]);

  const onSubmit = (data) => {
    const product = {
      title: data.title,
      brand: data.brand,
      price: parseFloat(data.price),
      stock: parseInt(data.stock),
      category: data.category,
      description: data.description,
      sellerEmail: user?.email || data.sellerEmail,
      imageUrl: data.imageUrl
    };

    const token = localStorage.getItem('access-token');

    axios.post('http://localhost:4000/add-products', product, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      if (res.data.insertedId) {
        Swal.fire({
          title: 'Success!',
          text: 'Product added successfully.',
          icon: 'success',
          confirmButtonColor: '#6366f1',
          background: '#131b2e',
          color: '#fff'
        });
        reset();
        if (user?.email) {
          setValue('sellerEmail', user.email);
        }
      }
    })
    .catch((error) => {
      console.error('Error adding product:', error);
      const errorMsg = error.response?.data?.message || 'Failed to add product. Please check backend server.';
      
      Swal.fire({
        title: 'Error!',
        text: errorMsg,
        icon: 'error',
        confirmButtonColor: '#ef4444',
        background: '#131b2e',
        color: '#fff'
      });
    });
  };

  return (
    <div className="w-full min-h-screen py-3 px-2 sm:px-6 sm:py-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#131b2e] border border-slate-800/80 rounded-xl sm:rounded-2xl p-4 sm:p-8 md:p-10 shadow-2xl backdrop-blur-md">
          
          {/* Header Section */}
          <div className="mb-6 sm:mb-8 border-b border-slate-800/80 pb-4 sm:pb-6">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] sm:text-xs font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-800/50 rounded-full mb-2.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              AuraTech Inventory Management
            </span>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Add New Product
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Enter details below to publish a new product item to the store catalog.
            </p>
          </div>

          {/* Product Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            
            {/* Title & Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                  Product Title <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Samsung Galaxy S24 Ultra"
                  {...register('title', { required: 'Product title is required' })}
                  className="w-full bg-[#1a233a] border border-slate-700/60 rounded-lg sm:rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                />
                {errors.title && (
                  <p className="text-rose-400 text-[11px] sm:text-xs mt-1 font-medium">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                  Brand <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Samsung"
                  {...register('brand', { required: 'Brand name is required' })}
                  className="w-full bg-[#1a233a] border border-slate-700/60 rounded-lg sm:rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                />
                {errors.brand && (
                  <p className="text-rose-400 text-[11px] sm:text-xs mt-1 font-medium">{errors.brand.message}</p>
                )}
              </div>
            </div>

            {/* Price & Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                  Price (BDT / Taka) <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0, message: 'Price cannot be negative' }
                  })}
                  className="w-full bg-[#1a233a] border border-slate-700/60 rounded-lg sm:rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                />
                {errors.price && (
                  <p className="text-rose-400 text-[11px] sm:text-xs mt-1 font-medium">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                  Stock Quantity <span className="text-indigo-400">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  {...register('stock', {
                    required: 'Stock quantity is required',
                    min: { value: 0, message: 'Stock quantity cannot be negative' }
                  })}
                  className="w-full bg-[#1a233a] border border-slate-700/60 rounded-lg sm:rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                />
                {errors.stock && (
                  <p className="text-rose-400 text-[11px] sm:text-xs mt-1 font-medium">{errors.stock.message}</p>
                )}
              </div>
            </div>

            {/* Category & Seller Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                  Category <span className="text-indigo-400">*</span>
                </label>
                <select
                  {...register('category', { required: 'Please select a category' })}
                  className="w-full bg-[#1a233a] border border-slate-700/60 rounded-lg sm:rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                >
                  <option value="" className="bg-[#131b2e] text-slate-400">Select Category</option>
                  <option value="Mobile" className="bg-[#131b2e] text-slate-100">Mobile</option>
                  <option value="Laptop" className="bg-[#131b2e] text-slate-100">Laptop</option>
                  <option value="Audio" className="bg-[#131b2e] text-slate-100">Audio</option>
                  <option value="Wearables" className="bg-[#131b2e] text-slate-100">Wearables</option>
                  <option value="Accessories" className="bg-[#131b2e] text-slate-100">Accessories</option>
                </select>
                {errors.category && (
                  <p className="text-rose-400 text-[11px] sm:text-xs mt-1 font-medium">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                  Seller Email
                </label>
                <input
                  type="email"
                  readOnly
                  {...register('sellerEmail')}
                  className="w-full bg-[#0e1424] border border-slate-800 text-slate-400 rounded-lg sm:rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm cursor-not-allowed outline-none select-none"
                />
                <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
                  Read-only field attached to active user session.
                </p>
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                Image URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                {...register('imageUrl')}
                className="w-full bg-[#1a233a] border border-slate-700/60 rounded-lg sm:rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-1.5 sm:mb-2">
                Product Description <span className="text-indigo-400">*</span>
              </label>
              <textarea
                rows="4"
                placeholder="Write comprehensive product details, key specifications, and features..."
                {...register('description', { required: 'Description is required' })}
                className="w-full bg-[#1a233a] border border-slate-700/60 rounded-lg sm:rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none"
              ></textarea>
              {errors.description && (
                <p className="text-rose-400 text-[11px] sm:text-xs mt-1 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 sm:py-3.5 text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;