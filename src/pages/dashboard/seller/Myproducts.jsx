import { useEffect, useState, useMemo } from 'react';
import useAuth from '../../../hooks/useAuth';
import axios from 'axios';
import Swal from 'sweetalert2';

const Myproducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  // Fetch Seller Products
  useEffect(() => {
    const token = localStorage.getItem('access-token');

    if (user?.email && token) {
      axios
        .get('http://localhost:4000/my-products', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setProducts(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching products:', err);
          setLoading(false);
        });
    }
  }, [user]);

  // Extract unique categories dynamically
  const categories = useMemo(() => {
    const unique = ['All', ...new Set(products.map((p) => p.category).filter(Boolean))];
    return unique;
  }, [products]);

  // Calculated Stats
  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.stock || 1)), 0);
  }, [products]);

  const totalStockItems = useMemo(() => {
    return products.reduce((sum, p) => sum + Number(p.stock || 0), 0);
  }, [products]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return Number(a.price) - Number(b.price);
        if (sortBy === 'price-high') return Number(b.price) - Number(a.price);
        if (sortBy === 'stock') return Number(b.stock) - Number(a.stock);
        return 0;
      });
  }, [products, searchTerm, selectedCategory, sortBy]);

  // Handle Product Delete
  const handleDelete = (id, title) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, Delete',
      background: '#0f172a',
      color: '#f8fafc',
    }).then((result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('access-token');

        axios
          .delete(`http://localhost:4000/products/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            if (res.data.deletedCount > 0) {
              Swal.fire({
                title: 'Deleted!',
                text: 'Product has been removed.',
                icon: 'success',
                background: '#0f172a',
                color: '#f8fafc',
                confirmButtonColor: '#6366f1',
              });

              setProducts((prev) => prev.filter((item) => item._id !== id));
            }
          })
          .catch((err) => {
            console.error('Delete error:', err);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to delete product.',
              icon: 'error',
              background: '#0f172a',
              color: '#f8fafc',
            });
          });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen py-6 px-3 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header & Overview Stats */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                Seller Inventory Hub
              </div>
              <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
                My Products Catalog
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">
                Manage listings published under seller account <span className="text-indigo-400 font-medium">{user?.email}</span>
              </p>
            </div>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-md">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Total Items</span>
                <span className="text-xl font-extrabold text-indigo-400">{products.length}</span>
              </div>
              <div className="bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-md">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Total Stock</span>
                <span className="text-xl font-extrabold text-emerald-400">{totalStockItems} pcs</span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-slate-900/80 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-md">
                <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">Est. Value</span>
                <span className="text-xl font-extrabold text-amber-400">৳{totalInventoryValue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Search, Category Filters & Sort Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-xl">
            
            {/* Live Search Input */}
            <div className="relative flex-1 max-w-md">
              <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search product title or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Filter Tabs & Sorting */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950/60 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="default">Sort by Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="stock">Stock: High to Low</option>
              </select>
            </div>

          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-200">No products match your criteria</h3>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Try adjusting your search query or selecting a different category tab.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-slate-900/70 border border-slate-800/90 hover:border-indigo-500/50 rounded-3xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 backdrop-blur-xl group"
              >
                <div>
                  {/* Image Frame */}
                  <div className="relative w-full h-52 bg-slate-950 rounded-2xl overflow-hidden mb-4 border border-slate-800/60">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 text-xs">
                        <svg className="w-8 h-8 mb-1 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        No image available
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-slate-950/80 border border-indigo-500/30 backdrop-blur-md rounded-lg">
                        {product.category || 'General'}
                      </span>
                    </div>

                    {/* Dynamic Stock Indicator */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border backdrop-blur-md ${
                          Number(product.stock) > 5
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-950/80 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        Stock: {product.stock} pcs
                      </span>
                    </div>
                  </div>

                  {/* Brand & Meta Info */}
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400 font-medium">
                      Brand: <strong className="text-slate-200">{product.brand || 'N/A'}</strong>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                    {product.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-400 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {product.description || 'No description provided for this product.'}
                  </p>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Price</span>
                    <span className="text-indigo-400 font-black text-lg">
                      ৳{Number(product.price || 0).toLocaleString()}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(product._id, product.title)}
                      className="p-2.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded-xl transition-all duration-200 active:scale-95"
                      title="Delete Product"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Myproducts;