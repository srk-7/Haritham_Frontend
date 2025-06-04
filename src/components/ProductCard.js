import React, { useState } from "react";

export default function ProductCard({ product, sellerName, onBuy }) {
  const [showModal, setShowModal] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);

  const getCookieValue = (name) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? decodeURIComponent(match[2]) : null;
  };

  const nameParts = product.name.trim().split(" ");
  const unit = nameParts.length > 1 ? nameParts.pop() : "";
  const displayName = nameParts.join(" ");

  const capitalize = (str) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const handlePlaceOrder = async () => {
    const buyerId = getCookieValue("userId");

    if (!buyerId) {
      alert("User not logged in.");
      return;
    }

    const payload = {
      productId: product.id,
      quantity: orderQuantity,
      buyerId,
    };

    try {
      const response = await fetch("http://localhost:8081/api/orders/place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Order failed");

      onBuy && onBuy(product, orderQuantity);
      setShowModal(false);
      setOrderQuantity(1);
    } catch (error) {
      console.error("Order Error:", error);
      alert("Failed to place order.");
    }
  };

  return (
    <>
      <div className="bg-white rounded shadow-md overflow-hidden w-full h-[370px] flex flex-col">
        <img
          className="w-full h-40 object-cover"
          src={product.imageUrl || "/default-product.png"}
          alt={product.name}
        />
        <div className="flex-1 px-4 py-3 flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-lg text-green-800 mb-1">
              {capitalize(displayName)}
            </h2>
            {unit && (
              <p className="text-sm text-gray-500 mb-1">
                Unit: {capitalize(unit)}
              </p>
            )}
            <p className="text-green-700 font-semibold text-md mb-1">
              ₹{product.pricePerUnit.toFixed(2)} / unit
            </p>
            <p className="text-gray-500 text-sm mb-2">
              Available: {product.quantityAvailable}
            </p>
            {sellerName && (
              <p className="text-gray-600 text-sm italic">
                Seller: {sellerName}
              </p>
            )}
          </div>

          {/* Buy / Out of Stock Button */}
          {product.quantityAvailable === 0 ? (
            <button
              disabled
              className="mt-4 w-full bg-red-600 text-white font-bold py-2 px-4 rounded opacity-70 cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-4 rounded transition"
            >
              Buy
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-green-800">
              Confirm Purchase
            </h3>

            <img
              className="w-full h-40 object-cover rounded"
              src={product.imageUrl || "/default-product.png"}
              alt={product.name}
            />

            <div className="space-y-1">
              <p className="text-lg font-bold text-green-800">
                {capitalize(displayName)}
              </p>
              {unit && (
                <p className="text-sm text-gray-500">Unit: {capitalize(unit)}</p>
              )}
              <p className="text-green-700 font-semibold text-md">
                ₹{product.pricePerUnit.toFixed(2)} / unit
              </p>
              <p className="text-gray-500 text-sm">
                Available: {product.quantityAvailable}
              </p>
              {sellerName && (
                <p className="text-gray-600 text-sm italic">Seller: {sellerName}</p>
              )}
              {product.description && (
                <p className="text-sm text-gray-700 mt-2">
                  <span className="font-semibold">Description:</span>{" "}
                  {product.description}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-sm text-gray-700">
                Select Quantity:
              </p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    setOrderQuantity((prev) => (prev > 1 ? prev - 1 : 1))
                  }
                  className="px-3 py-1 bg-gray-200 rounded text-xl"
                >
                  –
                </button>
                <span className="text-xl font-bold">{orderQuantity}</span>
                <button
                  onClick={() =>
                    setOrderQuantity((prev) =>
                      prev < product.quantityAvailable ? prev + 1 : prev
                    )
                  }
                  className="px-3 py-1 bg-gray-200 rounded text-xl"
                >
                  +
                </button>
              </div>
            </div>

            <p className="text-green-700 font-semibold text-lg">
              Total: ₹{(orderQuantity * product.pricePerUnit).toFixed(2)}
            </p>

            <div className="flex justify-between">
              <button
                onClick={() => {
                  setShowModal(false);
                  setOrderQuantity(1);
                }}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder}
                className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
