import React, { useEffect, useState } from "react";
import AddProduct from "../components/AddProduct";
import ViewOrders from "../components/ViewOrders";
import axios from "axios";
import { Package, Plus, ShoppingBag, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";

export default function SellPage() {
  const [view, setView] = useState("products");
  const [products, setProducts] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const userId = Cookies.get("userId");

  useEffect(() => {
    if (userId) {
      fetchProducts(userId);
    }
  }, [userId]);

  // Handle navigation state
  useEffect(() => {
    if (location.state?.view) {
      setView(location.state.view);
    }
  }, [location]);

  const fetchProducts = (sellerId) => {
    setIsLoading(true);
    axios
      .get(`http://localhost:8081/api/products/seller/${sellerId}`)
      .then((res) => {
        setProducts(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setIsLoading(false);
      });
  };

  const handleDelete = () => {
    axios
      .delete(`http://localhost:8081/api/products/delete/${productToDelete}`)
      .then(() => {
        setShowDeleteConfirm(false);
        fetchProducts(userId);
      })
      .catch(() => alert("Failed to delete product"));
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`http://localhost:8081/api/products/update/${editProduct.id}`, editProduct)
      .then(() => {
        setShowEditModal(false);
        fetchProducts(userId);
      })
      .catch(() => alert("Failed to update product"));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (file) => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ymsskzwa"); // your preset here
    formData.append("cloud_name", "dzm3qqhtc"); // your cloud name here

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dzm3qqhtc/image/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Image upload failed");

      const data = await res.json();
      return data.secure_url;
    } catch (error) {
      alert("Image upload failed. Please try again.");
      console.error(error);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imageUrl = await uploadImageToCloudinary(file);
    if (imageUrl) {
      setEditProduct((prev) => ({ ...prev, imageUrl }));
    }
  };

  const NavButton = ({ icon: Icon, label, active, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 ${
        active
          ? "bg-green-600 text-white shadow-md"
          : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Icon size={20} />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Seller Dashboard</h1>

          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
            <NavButton
              icon={Package}
              label="My Products"
              active={view === "products"}
              onClick={() => setView("products")}
            />
            <NavButton
              icon={Plus}
              label="Add Product"
              active={view === "add"}
              onClick={() => setView("add")}
            />
            <NavButton
              icon={ShoppingBag}
              label="View Orders"
              active={view === "orders"}
              onClick={() => setView("orders")}
            />
          </div>
        </div>

        {view === "products" && (
          <div className="space-y-4 sm:space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-48 sm:h-64">
                <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 border-green-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center">
                <Package className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-gray-400" />
                <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">No products yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding your first product.</p>
                <button
                  onClick={() => setView("add")}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                  Add Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={product.imageUrl || "/default-product.png"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h2 className="font-semibold text-base sm:text-lg text-gray-800 mb-1 line-clamp-1">{product.name}</h2>
                      <p className="text-xs sm:text-sm text-gray-500 mb-2">{product.category}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-base sm:text-lg font-bold text-green-600">₹{product.pricePerUnit}</span>
                        <span className="text-xs sm:text-sm text-gray-500">Qty: {product.quantityAvailable}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditProduct(product);
                            setShowEditModal(true);
                          }}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg transition-colors"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(product.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === "add" && <AddProduct onSuccess={() => fetchProducts(userId)} sellerId={userId} />}

        {view === "orders" && <ViewOrders sellerId={userId} />}

        {/* Edit Modal */}
        {showEditModal && editProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto"
            >
              <div className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4">Edit Product</h2>
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={editProduct.name}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={editProduct.description}
                      onChange={handleEditChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      id="category"
                      type="text"
                      name="category"
                      value={editProduct.category}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="pricePerUnit" className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Unit
                    </label>
                    <input
                      id="pricePerUnit"
                      type="number"
                      name="pricePerUnit"
                      value={editProduct.pricePerUnit}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label htmlFor="quantityAvailable" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Available
                    </label>
                    <input
                      id="quantityAvailable"
                      type="number"
                      name="quantityAvailable"
                      value={editProduct.quantityAvailable}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {uploadingImage ? "Uploading..." : "Change Image"}
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-xl p-4 sm:p-6 max-w-sm w-full"
            >
              <div className="text-center">
                <AlertCircle className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-red-500" />
                <h3 className="mt-2 text-base sm:text-lg font-medium text-gray-900">Delete Product</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete this product? This action cannot be undone.
                </p>
              </div>
              <div className="mt-4 sm:mt-6 flex gap-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
