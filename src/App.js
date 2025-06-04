import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./common/Layout";
import BuyPage from "./pages/BuyPage";
import SellPage from "./pages/SellPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Layout />}>
          {/* Public Routes */}
          <Route index element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
            <BuyPage/>
            </PrivateRoute>
          }
        >
          
            {/* <Route path="dashboard" element={<Dashboard />} /> */}
            <Route path="buy" element={<BuyPage />} />
            {/* <Route path="sell" element={<SellPage/>}/> */}
          {/* Add more protected routes here */}
          </Route>
          
          <Route
          path="/"
          element={
            <PrivateRoute><SellPage/></PrivateRoute>
          }
        >
            <Route path="sell" element={<SellPage/>}/>
          </Route>
          
          <Route
          path="/"
          element={
            <PrivateRoute><ProfilePage/></PrivateRoute>
          }
        >
            <Route path="profile" element={<ProfilePage/>}/>
        </Route>

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
