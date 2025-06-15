import React, { useEffect, useState } from "react";
import AddProduct from "../components/AddProduct";
import ViewOrders from "../components/ViewOrders";
import axios from "axios";
import { Package, Plus, ShoppingBag, AlertCircle, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import config from '../config';

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
      .get(`${config.API_URL}/api/products/seller/${sellerId}`)
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
      .delete(`${config.API_URL}/api/products/delete/${productToDelete}`)
      .then(() => {
        setShowDeleteConfirm(false);
        fetchProducts(userId);
      })
      .catch(() => alert("Failed to delete product"));
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`${config.API_URL}/api/products/update/${editProduct.id}`, editProduct)
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
          ? "bg-primary-600 text-white shadow-md"
          : "bg-white text-secondary-700 hover:bg-secondary-50"
      }`}
    >
      <Icon size={20} />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-secondary-800 mb-4 sm:mb-6">Seller Dashboard</h1>

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
                <div className="animate-spin rounded-full h-10 sm:h-12 w-10 sm:w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl p-6 sm:p-8 text-center">
                <Package className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-secondary-400" />
                <h3 className="mt-2 text-base sm:text-lg font-medium text-secondary-900">No products yet</h3>
                <p className="mt-1 text-sm text-secondary-500">Get started by adding your first product.</p>
                <button
                  onClick={() => setView("add")}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                  Add Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative aspect-[4/3]">
                      <img
                        src={product.imageUrl || "/default-product.png"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h2 className="font-semibold text-base sm:text-lg text-secondary-800 mb-1 line-clamp-1">{product.name}</h2>
                      <p className="text-xs sm:text-sm text-secondary-500 mb-2">{product.category}</p>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-base sm:text-lg font-bold text-primary-600">₹{product.pricePerUnit}</span>
                        <span className="text-xs sm:text-sm text-secondary-500">Qty: {product.quantityAvailable}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs sm:text-sm text-secondary-500">Show in Buy Page:</span>
                        <button
                          onClick={() => {
                            axios
                              .put(`${config.API_URL}/api/products/${product.id}/visibility?visible=${!product.visible}`)
                              .then(() => {
                                fetchProducts(userId);
                              })
                              .catch(() => alert("Failed to update product visibility"));
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            product.visible 
                              ? "bg-primary-100 text-primary-600 hover:bg-primary-200" 
                              : "bg-secondary-100 text-secondary-600 hover:bg-secondary-200"
                          }`}
                          title={product.visible ? "Hide from Buy Page" : "Show in Buy Page"}
                        >
                          {product.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditProduct(product);
                            setShowEditModal(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 p-2 bg-primary-100 text-primary-600 hover:bg-primary-200 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="text-xs font-medium">Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(product.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="text-xs font-medium">Delete</span>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Edit Product</h2>
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editProduct.name}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={editProduct.category}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Price per Unit</label>
                  <input
                    type="number"
                    name="pricePerUnit"
                    value={editProduct.pricePerUnit}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Quantity Available</label>
                  <input
                    type="number"
                    name="quantityAvailable"
                    value={editProduct.quantityAvailable}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Image</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                      className={`w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    {uploadingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      </div>
                    )}
                  </div>
                  {uploadingImage && (
                    <p className="mt-1 text-sm text-secondary-500">Uploading image...</p>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm font-medium text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-center text-secondary-900 mb-2">
                Delete Product
              </h3>
              <p className="text-center text-secondary-600 mb-4">
                Are you sure you want to delete this product? This action cannot be undone.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}