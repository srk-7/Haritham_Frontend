import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { CheckCircle, Search, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import config from '../config';

export default function BuyPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sellers, setSellers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [outOfStockItems, setOutOfStockItems] = useState({});

  // Function to handle product purchase
  const handleBuy = () => {
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      window.location.reload();
    }, 2500);
  };

  // Function to check and remove out-of-stock items
  const checkOutOfStockItems = useCallback(() => {
    const now = Date.now();
    const newOutOfStockItems = { ...outOfStockItems };
    let hasChanges = false;

    // Remove items that have been out of stock for more than 2 minutes
    Object.entries(newOutOfStockItems).forEach(([productId, timestamp]) => {
      if (now - timestamp > 2 * 60 * 1000) { // 2 minutes in milliseconds
        delete newOutOfStockItems[productId];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setOutOfStockItems(newOutOfStockItems);
    }
  }, [outOfStockItems]);

  // Set up interval to check out-of-stock items
  useEffect(() => {
    const interval = setInterval(checkOutOfStockItems, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [checkOutOfStockItems]);

  // Filter products based on search, price range, and category
  useEffect(() => {
    let filtered = [...products];

    // Filter out invisible products
    filtered = filtered.filter(product => product.visible !== false);

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply price range filter
    filtered = filtered.filter(
      product =>
        (!priceRange.min || product.pricePerUnit >= priceRange.min) &&
        (!priceRange.max || product.pricePerUnit <= priceRange.max)
    );

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, priceRange, selectedCategory, products]);

  useEffect(() => {
    const fetchProductsAndSellers = async () => {
      try {
        const { data } = await axios.get(`${config.API_URL}/api/products/all`);
        const reversedProducts = Array.isArray(data) ? [...data].reverse() : [];
        
        setProducts(reversedProducts);
        setFilteredProducts(reversedProducts);

        const sellerIds = [...new Set(reversedProducts.map(p => p.sellerId))];
        const sellerRequests = sellerIds.map(id =>
          axios.get(`${config.API_URL}/api/users/${id}`).then(res => ({
            id,
            name: res.data.name || res.data.username || "Unknown Seller",
          }))
        );

        const sellersData = await Promise.all(sellerRequests);
        const sellersMap = {};
        sellersData.forEach(seller => {
          sellersMap[seller.id] = seller.name;
        });

        setSellers(sellersMap);
        setLoading(false);
      } catch (err) {
        const errMsg =
          (typeof err.response?.data === "string"
            ? err.response.data
            : err.response?.data?.error) || err.message || "Failed to fetch products";
        setError(errMsg);
        setLoading(false);
      }
    };

    fetchProductsAndSellers();
  }, []);

  const categories = ["all", "vegetables", "fruits", "dairy", "grains"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-800 mb-2">Fresh Market</h1>
        <p className="text-secondary-600">Discover the finest local produce and organic products</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-secondary-400" />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50"
        >
          <Filter className="h-5 w-5" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-8 bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-secondary-800">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-secondary-500 hover:text-secondary-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-secondary-700 mb-3">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedCategory === category
                          ? "bg-primary-600 text-white"
                          : "bg-secondary-100 text-secondary-700 hover:bg-secondary-200"
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h4 className="text-sm font-medium text-secondary-700 mb-3">Price Range</h4>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value ? Number(e.target.value) : "" })
                    }
                    className="w-24 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Min"
                  />
                  <span className="text-secondary-500">to</span>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value ? Number(e.target.value) : "" })
                    }
                    className="w-24 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-secondary-500 text-lg">No products found matching your criteria.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              sellerName={sellers[product.sellerId]}
              onBuy={handleBuy}
              isOutOfStock={outOfStockItems[product.id]}
            />
          ))
        )}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
            >
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-lg font-medium text-center text-secondary-900 mb-2">
                Purchase Successful!
              </h3>
              <p className="text-center text-secondary-600">
                Your order has been placed successfully. The seller will contact you shortly.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

