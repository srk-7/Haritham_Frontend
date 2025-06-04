import React, { useEffect, useState } from "react";
import AddProduct from "../components/AddProduct";
import ViewOrders from "../components/ViewOrders";
import axios from "axios";

export default function SellPage() {
  const [products, setProducts] = useState([]);
  const [view, setView] = useState("products");
  const [userId, setUserId] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.id) {
      setUserId(user.id);
      fetchProducts(user.id);
    }
  }, []);

  const fetchProducts = (sellerId) => {
    axios
      .get(`http://localhost:8081/api/products/seller/${sellerId}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Fetch error:", err));
  };

  const handleDelete = () => {
    axios
      .delete(`http://localhost:8081/api/products/delete/${productToDelete}`)
      .then(() => {
        alert("Product deleted");
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">Seller Dashboard</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setView("products")}
          className={`px-4 py-2 rounded ${view === "products" ? "bg-green-700 text-white" : "bg-gray-200"}`}
        >
          My Products
        </button>
        <button
          onClick={() => setView("add")}
          className={`px-4 py-2 rounded ${view === "add" ? "bg-green-700 text-white" : "bg-gray-200"}`}
        >
          Add Product
        </button>
        <button
          onClick={() => setView("orders")}
          className={`px-4 py-2 rounded ${view === "orders" ? "bg-green-700 text-white" : "bg-gray-200"}`}
        >
          View Orders
        </button>
      </div>

      {view === "products" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.length === 0 ? (
            <p>No products added yet.</p>
          ) : (
            products.map((product) => (
              <div key={product.id} className="border p-4 rounded shadow bg-white">
                <img
                  src={product.imageUrl || "/default-product.png"}
                  alt={product.name}
                  className="h-40 w-full object-cover rounded mb-2"
                />
                <h2 className="font-semibold text-lg text-green-800">{product.name}</h2>
                <p className="text-sm text-gray-500">₹{product.pricePerUnit} / unit</p>
                <p className="text-sm text-gray-500">Qty: {product.quantityAvailable}</p>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => {
                      setEditProduct(product);
                      setShowEditModal(true);
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1 rounded"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => {
                      setProductToDelete(product.id);
                      setShowDeleteConfirm(true);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === "add" && <AddProduct onSuccess={() => fetchProducts(userId)} sellerId={userId} />}

      {view === "orders" && <ViewOrders sellerId={userId} />}

      {/* Edit Modal */}
      {showEditModal && editProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block font-medium mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={editProduct.name}
                  onChange={handleEditChange}
                  placeholder="Name"
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block font-medium mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editProduct.description}
                  onChange={handleEditChange}
                  placeholder="Description"
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block font-medium mb-1">
                  Category
                </label>
                <input
                  id="category"
                  type="text"
                  name="category"
                  value={editProduct.category}
                  onChange={handleEditChange}
                  placeholder="Category"
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>

              <div>
                <label htmlFor="pricePerUnit" className="block font-medium mb-1">
                  Price per Unit
                </label>
                <input
                  id="pricePerUnit"
                  type="number"
                  name="pricePerUnit"
                  value={editProduct.pricePerUnit}
                  onChange={handleEditChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label htmlFor="quantityAvailable" className="block font-medium mb-1">
                  Quantity Available
                </label>
                <input
                  id="quantityAvailable"
                  type="number"
                  name="quantityAvailable"
                  value={editProduct.quantityAvailable}
                  onChange={handleEditChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Current Image</label>
                <img
                  src={editProduct.imageUrl || "/default-product.png"}
                  alt="Current"
                  className="h-32 w-full object-contain rounded mb-2 border"
                />
              </div>

              <div>
                <label htmlFor="imageUpload" className="block font-medium mb-1">
                  Change Image
                </label>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploadingImage}
                  className="w-full"
                />
                {uploadingImage && <p className="text-sm text-gray-500 mt-1">Uploading image...</p>}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                  disabled={uploadingImage}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded"
                  disabled={uploadingImage}
                >
                  Done
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm text-center">
            <p className="text-lg font-medium mb-4">Are you sure you want to delete this product?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
