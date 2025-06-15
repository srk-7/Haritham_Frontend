import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { RefreshCw, CheckCircle, BarChart2, Users } from 'lucide-react';
import config from '../config';

// Modal Component for Status Update
const StatusUpdateModal = ({ isOpen, onClose, currentStatus, onUpdateStatus, loading }) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const statusOptions = [
    { value: "ORDERED", label: "Ordered", description: "Order has been placed" },
    { value: "PACKED", label: "Packed", description: "Order is packed and ready" },
    { value: "PLACED_ON_HARITHAM_TABLE", label: "Placed on Haritham Table", description: "Order is available for pickup" }
  ];

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleUpdate = () => {
    if (selectedStatus !== currentStatus) {
      onUpdateStatus(selectedStatus);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
        
        <div className="space-y-3 mb-6">
          {statusOptions.map((option) => (
            <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={option.value}
                checked={selectedStatus === option.value}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading || selectedStatus === currentStatus}
            className={`px-4 py-2 text-white rounded ${
              loading || selectedStatus === currentStatus
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Seller Order Card Component
const SellerOrderCard = ({ order, onUpdateStatus, isUpdating }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "ORDERED": return "bg-yellow-100 text-yellow-800";
      case "PACKED": return "bg-blue-100 text-blue-800";
      case "PLACED_ON_HARITHAM_TABLE": return "bg-green-100 text-green-800";
      case "COLLECTED": return "bg-green-200 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ORDERED": return "Ordered";
      case "PACKED": return "Packed";
      case "PLACED_ON_HARITHAM_TABLE": return "On Haritham Table";
      case "COLLECTED": return "Collected";
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
          <p className="text-sm text-gray-500">
            {new Date(order.orderDate).toLocaleDateString()} at{' '}
            {new Date(order.orderDate).toLocaleTimeString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Product:</span>
          <span className="font-medium">{order.productName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Quantity:</span>
          <span className="font-medium">{order.quantityOrdered}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Price:</span>
          <span className="font-medium text-green-600">₹{order.totalPrice}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Buyer:</span>
          <span className="font-medium">{order.buyerName}</span>
        </div>
      </div>

      {order.status === "COLLECTED" ? (
        <button
          disabled
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium bg-green-100 text-green-600 cursor-not-allowed"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Order Fulfilled</span>
        </button>
      ) : (
        <button
          onClick={() => onUpdateStatus(order)}
          disabled={isUpdating}
          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
            isUpdating
              ? "bg-secondary-100 text-secondary-400 cursor-not-allowed"
              : "bg-primary-100 text-primary-600 hover:bg-primary-200"
          }`}
          title="Update Order Status"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Update Status</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

// Main ViewOrders Component
const ViewOrders = ({ sellerId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    axios
      .get(`${config.API_URL}/api/orders/seller/${sellerId}`)
      .then((res) => {
        const sortedOrders = res.data.sort((a, b) => 
          new Date(b.orderDate) - new Date(a.orderDate)
        );
        setOrders(sortedOrders);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load orders");
        setLoading(false);
        toast.error("Failed to load orders");
      });
  }, [sellerId]);

  const handleUpdateStatusClick = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const updateStatus = async (newStatus) => {
    if (!selectedOrder) return;

    const formData = new FormData();
    formData.append("status", newStatus);

    setUpdatingOrderId(selectedOrder.id);

    try {
      await axios.put(
        `${config.API_URL}/api/orders/${selectedOrder.id}/status`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id ? { ...order, status: newStatus } : order
        )
      );

      toast.success("Order status updated successfully!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      toast.error(`Failed to update status: ${errorMessage}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-6xl mb-4">📦</div>
        <p className="text-gray-600 text-lg">No orders found</p>
        <p className="text-gray-500">Orders will appear here once customers place them.</p>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-secondary-900 mb-2">Your Orders</h2>
          <p className="text-secondary-600">Manage and track your customer orders</p>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {/* Add analytics handler */}}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors"
              title="View Analytics"
            >
              <BarChart2 className="h-4 w-4" />
              <span>Analytics</span>
            </button>
            
            <button
              onClick={() => {/* Add view buyers handler */}}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-secondary-100 text-secondary-600 hover:bg-secondary-200 transition-colors"
              title="View Buyers"
            >
              <Users className="h-4 w-4" />
              <span>View Buyers</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <SellerOrderCard
              key={order.id}
              order={order}
              onUpdateStatus={handleUpdateStatusClick}
              isUpdating={updatingOrderId === order.id}
            />
          ))}
        </div>
      </div>

      <StatusUpdateModal
        isOpen={modalOpen}
        onClose={closeModal}
        currentStatus={selectedOrder?.status}
        onUpdateStatus={updateStatus}
        loading={updatingOrderId !== null}
      />

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

export default ViewOrders;
