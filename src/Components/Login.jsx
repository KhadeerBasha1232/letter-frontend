import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, signInWithGoogle } from "../Firebase/firebase";

const Login = () => {
  const navigate = useNavigate();
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    // Start animation after component mounts
    setAnimateIn(true);

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userData = {
          googleId: user.uid,
          name: user.displayName,
          email: user.email,
          profilePic: user.photoURL,
        };

        // Send user data to backend
        await fetch("https://letter-backend-kb.onrender.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        });

        navigate("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="login-container" style={styles.loginContainer}>
      <div 
        className={`login-card ${animateIn ? 'animated' : ''}`} 
        style={{
          ...styles.loginCard,
          transform: animateIn ? 'translateY(0)' : 'translateY(20px)',
          opacity: animateIn ? 1 : 0,
          transition: 'all 0.8s ease-out'
        }}
      >
        <div className="logo-container" style={styles.logoContainer}>
          <div className="logo" style={styles.logo}>W</div>
        </div>
        
        <h1 style={styles.heading}>Welcome to Letter App</h1>
        <p style={styles.subheading}>Made By Khadeer Basha </p>
        
        <button 
          onClick={signInWithGoogle} 
          className="google-btn"
          style={styles.googleButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(66, 133, 244, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.2)';
          }}
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/800px-Google_%22G%22_logo.svg.png" 
            alt="Google logo" 
            style={styles.googleLogo} 
          />
          <span style={styles.buttonText}>Sign in with Google</span>
        </button>
        
        <div className="login-footer" style={styles.loginFooter}>
          <p style={styles.footerText}>By signing in, you agree to our Terms and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  loginContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #6e8efb, #a777e3)",
    fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
  },
  loginCard: {
    textAlign: "center",
    padding: "40px",
    borderRadius: "20px",
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
    backgroundColor: "#fff",
    maxWidth: "450px",
    width: "90%",
    position: "relative",
    overflow: "hidden",
  },
  logoContainer: {
    marginBottom: "30px",
    display: "flex",
    justifyContent: "center",
  },
  logo: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    backgroundColor: "#6e8efb",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    fontWeight: "bold",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  },
  heading: {
    marginBottom: "10px",
    color: "#333",
    fontSize: "30px",
    fontWeight: "600",
  },
  subheading: {
    color: "#666",
    marginBottom: "30px",
    fontSize: "16px",
  },
  googleButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "14px 24px",
    fontSize: "16px",
    color: "#fff",
    backgroundColor: "#4285F4",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
    fontWeight: "500",
    width: "100%",
    maxWidth: "300px",
    margin: "0 auto",
  },
  googleLogo: {
    width: "20px",
    height: "20px",
    marginRight: "12px",
    backgroundColor: "#fff",
    padding: "4px",
    borderRadius: "50%",
  },
  buttonText: {
    letterSpacing: "0.5px",
  },
  loginFooter: {
    marginTop: "30px",
    borderTop: "1px solid #eee",
    paddingTop: "20px",
  },
  footerText: {
    color: "#999",
    fontSize: "13px",
  }
};

export default Login;