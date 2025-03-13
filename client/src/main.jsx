import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";

import Nav from "../components/Nav.jsx";
import IncomeList from "./pages/IncomeList.jsx";
import ExpenseList from "./pages/ExpenseList.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Nav />}>
          <Route index element={<App />} />
          <Route path="/income" element={<IncomeList />} />
          <Route path="/expense" element={<ExpenseList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
