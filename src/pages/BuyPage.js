import React, { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { CheckCircle } from "lucide-react"; // Tick icon (optional)
import { motion, AnimatePresence } from "framer-motion"; // For animation

export default function BuyPage() {
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchProductsAndSellers = async () => {
      try {
        const { data } = await axios.get("http://localhost:8081/api/products/all");
        const reversedProducts = Array.isArray(data) ? [...data].reverse() : [];
        setProducts(reversedProducts);

        const sellerIds = [...new Set(reversedProducts.map(p => p.sellerId))];
        const sellerRequests = sellerIds.map(id =>
          axios.get(`http://localhost:8081/api/users/${id}`).then(res => ({
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

  const handleBuy = () => {
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      window.location.reload();
    }, 2500);
  };

  if (loading) return <p className="text-center mt-8">Loading products...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Buy Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.length === 0 ? (
          <p>No products available right now.</p>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              sellerName={sellers[product.sellerId]}
              onBuy={handleBuy}
            />
          ))
        )}
      </div>

      {/* ✅ Centered Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-6 flex flex-col items-center shadow-xl"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <CheckCircle className="text-green-600 w-16 h-16 mb-4 animate-bounce" />
              <p className="text-xl font-semibold text-green-800">Order placed successfully!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
