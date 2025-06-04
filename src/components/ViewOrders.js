import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewOrders = ({ sellerId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:8081/api/orders/seller/${sellerId}`)
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load orders");
        setLoading(false);
      });
  }, [sellerId]);

  if (loading) return <p className="text-center">Loading orders...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (orders.length === 0) return <p>No orders found.</p>;

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
      <table className="min-w-full border border-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Order ID</th>
            <th className="border px-3 py-2 text-left">Product</th>
            <th className="border px-3 py-2 text-left">Quantity</th>
            <th className="border px-3 py-2 text-left">Total Price</th>
            <th className="border px-3 py-2 text-left">Date</th>
            <th className="border px-3 py-2 text-left">Buyer</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="border px-3 py-2">{order.id}</td>
              <td className="border px-3 py-2">{order.productName}</td>
              <td className="border px-3 py-2">{order.quantityOrdered}</td>
              <td className="border px-3 py-2">₹{order.totalPrice}</td>
              <td className="border px-3 py-2">
                {new Date(order.orderDate).toLocaleString()}
              </td>
              <td className="border px-3 py-2">{order.buyerName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewOrders;
