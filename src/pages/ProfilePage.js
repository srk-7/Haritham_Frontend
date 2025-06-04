import { useEffect, useState } from "react";
import axios from "axios";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'products'
  const [sellingProducts, setSellingProducts] = useState([]);


  // Utility function to parse cookies
  const getCookie = (name) => {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : null;
  };

  // Utility function to get user initials
  const getInitials = (name) => {
    if (!name) return '';
    const nameParts = name.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return '';
    if (nameParts.length === 1) {
      return nameParts[0][0].toUpperCase();
    }
    // For more than one name part, take first initial of first part and first initial of last part
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  };

  useEffect(() => {
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
        // Fetch seller's product details
        return axios.get(`http://localhost:8081/api/products/seller/${userId}`);
      })
      .then((res) => {
        setSellingProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to fetch user or product data");
        setLoading(false);
      });

  }, []);

  if (loading) return <p className="p-4 text-center">Loading profile...</p>;
  if (error) return <p className="p-4 text-red-600 text-center">Error: {error}</p>;
  if (!user) return <p className="p-4 text-center">No user data found.</p>;

  const userInitials = getInitials(user.name);

  // Sort orders: latest first
  const sortedOrders = user.ordersPlaced && user.ordersPlaced.length > 0
    ? [...user.ordersPlaced].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
    : [];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-xl mt-6">
      {/* Profile Header with Initials */}
      <div className="flex items-center mb-6 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-700 flex items-center justify-center text-white text-xl sm:text-2xl font-bold mr-3 sm:mr-4 select-none flex-shrink-0">
          {userInitials}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{user.name}</h1>
          <p className="text-sm text-gray-600">Employee ID: {user.empId}</p>
          <p className="text-sm text-gray-600">Mobile: {user.mobile}</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('orders')}
              className={`whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-colors duration-150
                ${activeTab === 'orders'
                  ? 'border-gray-800 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Orders Placed ({sortedOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`whitespace-nowrap py-3 px-2 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-colors duration-150
                ${activeTab === 'products'
                  ? 'border-gray-800 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              My Selling Products ({sellingProducts.length})

            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'orders' && (
          <section aria-labelledby="orders-tab">
            {/* The h2 is implicitly handled by the tab name for visual users */}
            <h2 id="orders-tab" className="sr-only">Orders Placed</h2>
            {sortedOrders.length === 0 ? (
              <p className="text-gray-600 py-4">No orders placed yet.</p>
            ) : (
              <ul className="space-y-6">
                {sortedOrders.map(order => (
                  <li key={order.id} className="bg-gray-50 border border-gray-200 p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 mb-3 border-b border-gray-300">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1 sm:mb-0">{order.productName}</h3>
                      <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">{new Date(order.orderDate).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Quantity</p>
                        <p className="text-sm sm:text-md text-gray-700">{order.quantityOrdered}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Price</p>
                        <p className="text-sm sm:text-md font-semibold text-gray-800">₹{order.totalPrice}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {activeTab === 'products' && (
        <section aria-labelledby="products-tab">
          <h2 id="products-tab" className="sr-only">My Selling Products</h2>
          {sellingProducts.length === 0 ? (
            <p className="text-gray-600 py-4">Not selling any products.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {sellingProducts.map(product => (
                <li key={product.id} className="bg-white p-4 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">Category: {product.category}</p>
                  <p className="text-sm text-gray-600 mb-1">Price: ₹{product.pricePerUnit}</p>
                  <p className="text-sm text-gray-600">Available: {product.quantityAvailable}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      
      </div>
    </div>
  );
}