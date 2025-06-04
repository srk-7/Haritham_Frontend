import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const cookies = document.cookie
      .split(";")
      .map((c) => c.trim())
      .reduce((acc, cookie) => {
        const [key, value] = cookie.split("=");
        acc[key] = value;
        return acc;
      }, {});
    setIsLoggedIn(!!cookies.userId);
  }, []);

  // Animation variants for framer-motion
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 font-sans text-gray-900 px-6 py-20"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="mb-20 text-center max-w-4xl mx-auto"
      >
        <h1 className="text-5xl font-extrabold text-green-700 mb-6 leading-tight tracking-wide drop-shadow-sm">
          Welcome to AgriMarket Community
        </h1>
        <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
          AgriMarket is a community platform where people buy and sell homegrown or farm fresh fruits and vegetables. We aim to build sustainable farming and eco-friendly packaging habits.
        </p>
      </motion.section>

      {/* Guidelines Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="mb-20 bg-white rounded-xl shadow-xl border border-green-100 p-12 max-w-3xl mx-auto"
      >
        <h2 className="text-3xl font-semibold text-green-700 mb-10 text-center tracking-wide">
          Sustainability Guidelines
        </h2>
        <ul className="list-disc list-inside space-y-6 text-gray-700 text-lg leading-relaxed max-w-xl mx-auto">
          <li>Use paper covers instead of plastic for packaging.</li>
          <li>Avoid single-use plastics to reduce waste.</li>
          <li>Support local farms and seasonal produce.</li>
          <li>Minimize food waste by buying only what you need.</li>
        </ul>
      </motion.section>

      {/* Actions Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        className="text-center"
      >
        {!isLoggedIn ? (
          <>
            <p className="text-xl text-gray-800 mb-10 max-w-md mx-auto tracking-wide">
              Please register or login to buy or sell products.
            </p>
            <div className="inline-flex gap-10">
              <Link
                to="/register"
                className="px-10 py-4 bg-green-700 text-white font-semibold rounded-lg shadow-lg hover:bg-green-800 transform hover:scale-105 transition-all duration-300"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="px-10 py-4 bg-gray-900 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-800 transform hover:scale-105 transition-all duration-300"
              >
                Login
              </Link>
            </div>
          </>
        ) : (
          <div className="inline-flex gap-12 justify-center">
            <Link
              to="/buy"
              className="px-14 py-5 bg-green-700 text-white font-semibold rounded-lg shadow-2xl hover:bg-green-800 transform hover:scale-105 transition-all duration-300"
            >
              Buy Products
            </Link>
            <Link
              to="/sell"
              className="px-14 py-5 bg-green-700 text-white font-semibold rounded-lg shadow-2xl hover:bg-green-800 transform hover:scale-105 transition-all duration-300"
            >
              Sell Products
            </Link>
          </div>
        )}
      </motion.section>
    </main>
  );
}
