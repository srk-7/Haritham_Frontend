import { useEffect, useState } from "react";
import axios from "axios";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [ordersPlaced, setOrdersPlaced] = useState([]);
  const [sellingProducts, setSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ").filter(Boolean);
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const fetchProfileData = () => {
    const userId = getCookie("userId");
    if (!userId) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:8081/api/users/${userId}`)
      .then((res) => {
        setUser(res.data);
        return axios.get(`http://localhost:8081/api/users/${userId}/orders`);
      })
      .then((res) => {
        setOrdersPlaced(res.data);
        return axios.get(`http://localhost:8081/api/products/seller/${userId}`);
      })
      .then((res) => {
        setSellingProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to fetch data");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const markAsCollected = (orderId) => {
    const formData = new FormData();
    formData.append("status", "COLLECTED");

    axios
      .put(`http://localhost:8081/api/orders/${orderId}/status`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => fetchProfileData())
      .catch(() => alert("Failed to update order status."));
  };

  if (loading) return <p className="p-4 text-center">Loading profile...</p>;
  if (error) return <p className="p-4 text-red-600 text-center">Error: {error}</p>;
  if (!user) return <p className="p-4 text-center">No user data found.</p>;

  const userInitials = getInitials(user.name);
  const sortedOrders = [...ordersPlaced].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 mt-6">
      {/* Profile Summary */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-800 text-white flex items-center justify-center text-2xl font-bold mr-4">
          {userInitials}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-600">Employee ID: {user.empId}</p>
          <p className="text-gray-600">Mobile: {user.mobile}</p>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex space-x-4 mb-4 border-b border-gray-300 pb-2">
        <button
          className={`px-4 py-2 rounded-t-md font-semibold ${
            activeTab === "orders"
              ? "bg-white border border-b-0 border-gray-300 text-blue-700"
              : "text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Orders Placed ({sortedOrders.length})
        </button>
        <button
          className={`px-4 py-2 rounded-t-md font-semibold ${
            activeTab === "products"
              ? "bg-white border border-b-0 border-gray-300 text-blue-700"
              : "text-gray-500 hover:text-blue-600"
          }`}
          onClick={() => setActiveTab("products")}
        >
          My Selling Products ({sellingProducts.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-b-lg shadow-lg border border-gray-300 p-4 sm:p-6">
        {activeTab === "orders" ? (
          sortedOrders.length === 0 ? (
            <p className="text-gray-600">No orders placed yet.</p>
          ) : (
            <ul className="space-y-6">
              {sortedOrders.map((order) => (
                <li
                  key={order.id}
                  className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-all bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{order.productName}</h3>
                    <span className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Quantity</p>
                      <p className="text-gray-700">{order.quantityOrdered}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total</p>
                      <p className="text-gray-800 font-semibold">₹{order.totalPrice}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <p
                        className={`text-sm font-semibold ${
                          order.status === "PACKED"
                            ? "text-blue-600"
                            : order.status === "PLACED_ON_HARITHAM_TABLE"
                            ? "text-green-600"
                            : order.status === "COLLECTED"
                            ? "text-gray-500"
                            : "text-yellow-600"
                        }`}
                      >
                        {order.status}
                      </p>
                    </div>
                  </div>

                  {order.status === "PLACED_ON_HARITHAM_TABLE" && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => markAsCollected(order.id)}
                        className="mt-2 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-all"
                      >
                        Mark as Collected
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )
        ) : sellingProducts.length === 0 ? (
          <p className="text-gray-600">Not selling any products.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sellingProducts.map((product) => (
              <li key={product.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md bg-white">
                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                <p className="text-sm text-gray-600">Category: {product.category}</p>
                <p className="text-sm text-gray-600">Price: ₹{product.pricePerUnit}</p>
                <p className="text-sm text-gray-600">Available: {product.quantityAvailable}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
