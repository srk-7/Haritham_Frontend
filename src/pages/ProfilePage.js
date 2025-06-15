import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { X, Users, Calendar, TrendingUp, DollarSign, Package, BarChart2, Store } from "lucide-react";
import config from '../config';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [ordersPlaced, setOrdersPlaced] = useState([]);
  const [sellingProducts, setSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");
  const [sellerDetails, setSellerDetails] = useState({});
  const [productBuyers, setProductBuyers] = useState({});
  const [showBuyersModal, setShowBuyersModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [analyticsView, setAnalyticsView] = useState("list");

  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ").filter(Boolean);
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const fetchSellerDetails = async (sellerId) => {
    try {
      const response = await axios.get(`${config.API_URL}/api/users/${sellerId}`);
      setSellerDetails(prev => ({
        ...prev,
        [sellerId]: response.data
      }));
    } catch (error) {
      console.error("Failed to fetch seller details:", error);
    }
  };

  const fetchProductBuyers = async (productId) => {
    try {
      const response = await axios.get(`${config.API_URL}/api/orders/product/${productId}`);
      const buyers = response.data.map(order => ({
        ...order,
        buyerName: order.buyerName || "Unknown Buyer",
        orderDate: new Date(order.orderDate).toLocaleDateString(),
        quantity: order.quantityOrdered,
        totalPrice: order.totalPrice
      }));
      setProductBuyers(prev => ({
        ...prev,
        [productId]: buyers
      }));
    } catch (error) {
      console.error("Failed to fetch product buyers:", error);
    }
  };

  const handleViewBuyers = (product) => {
    setSelectedProduct(product);
    if (!productBuyers[product.id]) {
      fetchProductBuyers(product.id);
    }
    setShowBuyersModal(true);
  };

  const fetchProfileData = useCallback(() => {
    const userId = getCookie("userId");
    if (!userId) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }

    axios
      .get(`${config.API_URL}/api/users/${userId}`)
      .then((res) => {
        setUser(res.data);
        return axios.get(`${config.API_URL}/api/users/${userId}/orders`);
      })
      .then((res) => {
        setOrdersPlaced(res.data);
        // Fetch seller details for each order
        res.data.forEach(order => {
          if (!sellerDetails[order.sellerId]) {
            fetchSellerDetails(order.sellerId);
          }
        });
        return axios.get(`${config.API_URL}/api/products/seller/${userId}`);
      })
      .then((res) => {
        setSellingProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to fetch data");
        setLoading(false);
      });
  }, [sellerDetails]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const markAsCollected = (orderId) => {
    const formData = new FormData();
    formData.append("status", "COLLECTED");

    axios
      .put(`${config.API_URL}/api/orders/${orderId}/status`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => fetchProfileData())
      .catch(() => alert("Failed to update order status."));
  };

  const calculateAnalytics = (buyers) => {
    if (!buyers) return null;
    
    const totalRevenue = buyers.reduce((sum, buyer) => sum + buyer.totalPrice, 0);
    const totalOrders = buyers.length;
    const totalQuantity = buyers.reduce((sum, buyer) => sum + buyer.quantity, 0);
    
    // Group by date
    const ordersByDate = buyers.reduce((acc, buyer) => {
      const date = buyer.orderDate;
      if (!acc[date]) {
        acc[date] = {
          count: 0,
          revenue: 0,
          quantity: 0
        };
      }
      acc[date].count++;
      acc[date].revenue += buyer.totalPrice;
      acc[date].quantity += buyer.quantity;
      return acc;
    }, {});

    return {
      totalRevenue,
      totalOrders,
      totalQuantity,
      ordersByDate
    };
  };

  if (loading) return <p className="p-4 text-center">Loading profile...</p>;
  if (error) return <p className="p-4 text-red-600 text-center">Error: {error}</p>;
  if (!user) return <p className="p-4 text-center">No user data found.</p>;

  const userInitials = getInitials(user.name);
  const sortedOrders = [...ordersPlaced].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* User Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-green-100 text-green-800 flex items-center justify-center rounded-full text-2xl font-bold">
              {userInitials}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.name}</h1>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <span className="font-medium w-24">UID:</span>
                  <span>{user.empId}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <span className="font-medium w-24">Mobile:</span>
                  <span>{user.mobile}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("orders")}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "orders"
                    ? "border-b-2 border-green-500 text-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Package className="w-5 h-5 inline-block mr-2" />
                Orders
              </button>
              <button
                onClick={() => setActiveTab("selling")}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === "selling"
                    ? "border-b-2 border-green-500 text-green-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Store className="w-5 h-5 inline-block mr-2" />
                Selling
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === "orders" && (
            sortedOrders.length === 0 ? (
              <p className="text-gray-600 p-6">No orders placed yet.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {sortedOrders.map((order) => (
                  <li
                    key={order.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800">{order.productName}</h3>
                      <span className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Order Details</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Quantity</span>
                            <span className="text-sm font-medium text-gray-700">{order.quantityOrdered}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Total</span>
                            <span className="text-sm font-medium text-green-600">₹{order.totalPrice}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Status</span>
                            <span
                              className={`text-sm font-medium ${
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
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Seller Details</h4>
                        {sellerDetails[order.sellerId] ? (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Name</span>
                              <span className="text-sm font-medium text-gray-700">{sellerDetails[order.sellerId].name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Employee ID</span>
                              <span className="text-sm font-medium text-gray-700">{sellerDetails[order.sellerId].empId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Mobile</span>
                              <span className="text-sm font-medium text-gray-700">{sellerDetails[order.sellerId].mobile}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 text-sm">Loading seller details...</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {order.status === "PLACED_ON_HARITHAM_TABLE" && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => markAsCollected(order.id)}
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-all"
                        >
                          Mark as Collected
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )
          )}

          {activeTab === "selling" && (
            sellingProducts.length === 0 ? (
              <p className="text-gray-600 p-6">Not selling any products.</p>
            ) : (
              <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
                {sellingProducts.map((product) => (
                  <div key={product.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Category:</span> {product.category}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Price:</span> ₹{product.pricePerUnit}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Available:</span> {product.quantityAvailable}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleViewBuyers(product)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-primary-100 text-primary-600 hover:bg-primary-200 rounded-lg transition-colors"
                        title="View Buyers"
                      >
                        <Users className="h-4 w-4" />
                        <span className="text-sm font-medium">Buyers</span>
                      </button>
                      <button
                        onClick={() => {
                          handleViewBuyers(product);
                          setAnalyticsView("analytics");
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-secondary-100 text-secondary-600 hover:bg-secondary-200 rounded-lg transition-colors"
                        title="View Analytics"
                      >
                        <BarChart2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Analytics</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Buyers Modal */}
        {showBuyersModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-800">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Buyer Analytics & Details</p>
                  </div>
                  <button
                    onClick={() => setShowBuyersModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* View Toggle */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setAnalyticsView("list")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      analyticsView === "list"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    <span>Buyers List</span>
                  </button>
                  <button
                    onClick={() => setAnalyticsView("analytics")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      analyticsView === "analytics"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <BarChart2 className="h-5 w-5" />
                    <span>Analytics</span>
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[60vh]">
                  {productBuyers[selectedProduct.id] ? (
                    productBuyers[selectedProduct.id].length > 0 ? (
                      analyticsView === "list" ? (
                        <div className="space-y-4">
                          {productBuyers[selectedProduct.id].map((buyer, index) => (
                            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="bg-indigo-100 p-2 rounded-full">
                                    <Users className="h-5 w-5 text-indigo-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-800">{buyer.buyerName}</h4>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                      <Calendar className="h-4 w-4" />
                                      <span>Ordered on: {buyer.orderDate}</span>
                                    </div>
                                  </div>
                                </div>
                                <span className="text-green-600 font-semibold flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {buyer.totalPrice}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-gray-600 mt-3">
                                <span className="flex items-center gap-1">
                                  <Package className="h-4 w-4" />
                                  Quantity: {buyer.quantity}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  buyer.status === "COLLECTED" 
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}>
                                  {buyer.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {/* Summary Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-indigo-50 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <DollarSign className="h-6 w-6 text-indigo-600" />
                                <h4 className="font-medium text-gray-800">Total Revenue</h4>
                              </div>
                              <p className="text-2xl font-bold text-indigo-600">
                                ₹{calculateAnalytics(productBuyers[selectedProduct.id]).totalRevenue}
                              </p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <Package className="h-6 w-6 text-green-600" />
                                <h4 className="font-medium text-gray-800">Total Orders</h4>
                              </div>
                              <p className="text-2xl font-bold text-green-600">
                                {calculateAnalytics(productBuyers[selectedProduct.id]).totalOrders}
                              </p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                                <h4 className="font-medium text-gray-800">Total Quantity Sold</h4>
                              </div>
                              <p className="text-2xl font-bold text-blue-600">
                                {calculateAnalytics(productBuyers[selectedProduct.id]).totalQuantity}
                              </p>
                            </div>
                          </div>

                          {/* Daily Breakdown */}
                          <div className="bg-white rounded-lg border p-4">
                            <h4 className="font-medium text-gray-800 mb-4">Daily Breakdown</h4>
                            <div className="space-y-3">
                              {Object.entries(calculateAnalytics(productBuyers[selectedProduct.id]).ordersByDate)
                                .sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))
                                .map(([date, data]) => (
                                  <div key={date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <Calendar className="h-5 w-5 text-gray-500" />
                                      <span className="font-medium text-gray-700">{date}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="text-sm text-gray-600">
                                        Orders: {data.count}
                                      </span>
                                      <span className="text-sm text-gray-600">
                                        Quantity: {data.quantity}
                                      </span>
                                      <span className="text-sm font-medium text-green-600">
                                        ₹{data.revenue}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No buyers yet</p>
                      </div>
                    )
                  ) : (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
