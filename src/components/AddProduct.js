import React, { useState, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const sellerId = Cookies.get("userId");
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: "",
    unitValue: "",
    units: "grms",
    description: "",
    category: "",
    pricePerUnit: "",
    quantityAvailable: "",
    imageUrl: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Ref for file input so we can clear it
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
    setError("");
    setSuccess("");
  };

  const uploadImageToCloudinary = async (file) => {
    const formDataForImage = new FormData();
    formDataForImage.append("file", file);
    formDataForImage.append("upload_preset", "ymsskzwa");
    formDataForImage.append("cloud_name", "dzm3qqhtc");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dzm3qqhtc/image/upload",
      {
        method: "POST",
        body: formDataForImage
      }
    );

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!imageFile) {
      setError("Please upload an image.");
      return;
    }

    setUploading(true);

    try {
      // Upload image first
      const uploadedUrl = await uploadImageToCloudinary(imageFile);

      // Combine name + unit value + units
      const combinedName = `${product.name} ${product.unitValue}${product.units}`;

      const payload = {
        name: combinedName,
        description: product.description,
        category: product.category,
        pricePerUnit: parseFloat(product.pricePerUnit),
        quantityAvailable: parseInt(product.quantityAvailable, 10),
        imageUrl: uploadedUrl,
        sellerId
      };

      await axios.post("http://localhost:8081/api/products/add", payload);

      setSuccess("Product added successfully!");

      // Reset form
      setProduct({
        name: "",
        unitValue: "",
        units: "grms",
        description: "",
        category: "",
        pricePerUnit: "",
        quantityAvailable: "",
        imageUrl: ""
      });

      setImageFile(null);

      // Clear file input value
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Redirect to /sell and refresh
      navigate("/sell");
      // To force page reload (refresh), you can do:
      window.location.reload();

    } catch (err) {
      console.error(err);
      setError("Failed to add product. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-semibold mb-6 text-center">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* Unit Value + Units */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Unit Value</label>
            <input
              type="number"
              name="unitValue"
              value={product.unitValue}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              required
              min="1"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Units</label>
            <select
              name="units"
              value={product.units}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              required
            >
              <option value="grms">grms</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
              <option value="piece">piece</option>
              <option value="dozen">dozen</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            rows={3}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <input
            type="text"
            name="category"
            value={product.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            required
          />
        </div>

        {/* Price per Unit */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Price per Unit</label>
          <input
            type="number"
            name="pricePerUnit"
            step="0.01"
            value={product.pricePerUnit}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            required
            min="0"
          />
        </div>

        {/* Quantity Available */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity Available</label>
          <input
            type="number"
            name="quantityAvailable"
            value={product.quantityAvailable}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            required
            min="0"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-gray-700"
            required
            ref={fileInputRef}
          />
        </div>

        {/* Error & Success Messages */}
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {uploading ? "Uploading..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
