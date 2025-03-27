import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Components/Login";
import Dashboard from "./Components/Dashboard";
import NewLetter from "./Components/NewLetter";
import EditLetter from "./Components/EditLetter"; // Import EditLetter Component
import LiveEditor from "./Components/LiveEditor";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<NewLetter />} />
        <Route path="/edit/:letterId" element={<EditLetter />} /> 
        <Route path="/live/:letterId" element={<LiveEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
