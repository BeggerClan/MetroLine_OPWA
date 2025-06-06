import React, { useState } from "react";
import { loginApi } from "../scenes/login/loginapi";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginApi(email, password);
      if (data.token) {
        localStorage.setItem("token", "Bearer " + data.token);
        navigate("/dashboard");
      } else {
        setError("Login failed: No token received.");
      }
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  return (
    <AuthLayout
      rightImage="https://apicms.thestar.com.my/uploads/images/2023/07/12/2173520.jpg"
      rightAlt="Metroline"
    >
      <div className="text-center mb-4">
        <h2 className="fw-bold">Welcome To OPWA</h2>
        <p className="text-muted">Please login to your account</p>
      </div>
      {error && (
        <div className="alert alert-danger text-center">{error}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label fw-semibold">
            Email address
          </label>
          <input
            type="email"
            className="form-control form-control-lg"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            style={{ borderRadius: "5px", border: "1px solid #ced4da" }}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="form-label fw-semibold">
            Password
          </label>
          <input
            type="password"
            className="form-control form-control-lg"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            style={{ borderRadius: "5px", border: "1px solid #ced4da" }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-lg w-100"
          style={{
            borderRadius: "5px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            fontSize: "1.2rem",
          }}
        >
          Login
        </button>
      </form>
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <Link to="/signup">Don't have an account? Sign Up</Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
