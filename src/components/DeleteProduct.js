import React from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DeleteProduct = ({ productId, onDeleted }) => {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      axios
        .delete(`http://localhost:8081/api/products/${productId}`)
        .then(() => {
          toast.success("Product deleted successfully");
          onDeleted && onDeleted(); // Optionally trigger refresh
        })
        .catch((error) => {
          console.error("Delete error:", error);
          toast.error("Failed to delete product");
        });
    }
  };

  return (
    <>
      <button
        onClick={handleDelete}
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
      >
        Delete
      </button>
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
};

export default DeleteProduct;
