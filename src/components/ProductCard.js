import React, { useState } from "react";
import { ShoppingCart, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import config from '../config';

export default function ProductCard({ product, sellerName, onBuy }) {
  const [showModal, setShowModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);

  const getCookieValue = (name) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  };

  const nameParts = product.name.trim().split(" ");
  const unit = nameParts.length > 1 ? nameParts.pop() : "";
  const displayName = nameParts.join(" ");

  const capitalize = (str) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const handlePlaceOrder = async () => {
    const buyerId = getCookieValue("userId");

    if (!buyerId) {
      toast.error("Please login to place an order.");
      return;
    }

    const payload = {
      productId: product.id,
      quantity: orderQuantity,
      buyerId,
    };

    try {
      const response = await fetch(`${config.API_URL}/api/orders/place`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Order failed");

      onBuy && onBuy(product, orderQuantity);
      setShowModal(false);
      setOrderQuantity(1);
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Order Error:", error);
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <img
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            src={product.imageUrl || "/default-product.png"}
            alt={product.name}
          />
          <div className="absolute top-3 right-3">
            <button 
              className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              onClick={() => {
                navigator.share({
                  title: product.name,
                  text: `Check out this ${product.name} on AgriMarket!`,
                  url: window.location.href
                }).catch(() => {
                  // Fallback for browsers that don't support Web Share API
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                });
              }}
            >
              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          {product.quantityAvailable === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h2 className="font-semibold text-gray-800 text-lg line-clamp-1">
              {capitalize(displayName)}
            </h2>
            <span className="text-sm text-gray-500">{capitalize(unit)}</span>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-green-700">
                ₹{product.pricePerUnit.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500">/unit</span>
            </div>
            <span className="text-sm text-gray-500">
              Stock: {product.quantityAvailable}
            </span>
          </div>

          {sellerName && (
            <p className="text-sm text-gray-600 mb-4">
              By <span className="font-medium">{sellerName}</span>
            </p>
          )}

          <button
            onClick={() => setShowModal(true)}
            disabled={product.quantityAvailable === 0}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-colors ${
              product.quantityAvailable === 0
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            {product.quantityAvailable === 0 ? "Out of Stock" : "Buy Now"}
          </button>
        </div>
      </motion.div>

      {/* Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <img
                  className="w-24 h-24 object-cover rounded-lg"
                  src={product.imageUrl || "/default-product.png"}
                  alt={product.name}
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-1">
                    {capitalize(displayName)}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Unit: {capitalize(unit)}
                  </p>
                  <p className="text-lg font-bold text-green-700">
                    ₹{product.pricePerUnit.toFixed(2)} / unit
                  </p>
                </div>
              </div>

              {/* Product Description */}
              {product.description && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        setOrderQuantity((prev) => (prev > 1 ? prev - 1 : 1))
                      }
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      -
                    </button>
                    <span className="text-lg font-semibold w-12 text-center">
                      {orderQuantity}
                    </span>
                    <button
                      onClick={() =>
                        setOrderQuantity((prev) =>
                          prev < product.quantityAvailable ? prev + 1 : prev
                        )
                      }
                      className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-lg font-semibold text-green-700">
                      ₹{(orderQuantity * product.pricePerUnit).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setOrderQuantity(1);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="flex-1 py-2.5 px-4 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}
