import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import { auth } from "../Firebase/firebase";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditLetter = () => {
  const navigate = useNavigate();
  const { letterId } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);
  const [googleDocUrl, setGoogleDocUrl] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Start animation after component mounts
    setAnimateIn(true);
    
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchLetter(letterId);
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate, letterId]);

  const fetchLetter = async (id) => {
    try {
      const response = await fetch(`https://letter-backend-kb.onrender.com/api/letters/letter/${id}`, {
        headers: {
          "Content-Type": "application/json",
          "google-id": auth.currentUser?.uid,
        },
      });
  
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to fetch letter", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate("/dashboard");
        return;
      }
  
      setTitle(data.letter.title);
      setContent(data.letter.content);
      if (data.letter.googleDriveFileId) {
        setGoogleDocUrl(`${data.letter.googleDriveFileId}`);
      }
    } catch (err) {
      console.error("Error fetching letter:", err);
      toast.error("Error fetching letter.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      navigate("/dashboard");
    } finally {
      setInitialLoading(false);
    }
  };
  
  const handleUpdate = async () => {
    if (!title || !content) {
      toast.error("Title and Content are required!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    if (!user) {
      toast.error("User not authenticated!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://letter-backend-kb.onrender.com/api/letters/edit/${letterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to update letter");
      toast.success("Letter updated successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error("Error updating letter:", err);
      toast.error("Failed to update letter. Try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDrive = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://letter-backend-kb.onrender.com/api/letters/save-to-drive/${letterId}`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to save to Google Drive");
      setGoogleDocUrl(`${data.letter.googleDriveFileId}`);
      toast.success("Letter saved to Google Drive!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error("Error saving to Google Drive:", err);
      toast.error("Failed to save to Google Drive. Try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFromDrive = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://letter-backend-kb.onrender.com/api/letters/delete-from-drive/${letterId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to delete from Google Drive");
      setGoogleDocUrl(null);
      toast.success("Letter deleted from Google Drive!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error("Error deleting from Google Drive:", err);
      toast.error("Failed to delete from Google Drive. Try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading your letter...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <ToastContainer />
      <div 
        className={`editor-container ${animateIn ? 'animated' : ''}`}
        style={{
          ...styles.editorContainer,
          transform: animateIn ? 'translateY(0)' : 'translateY(20px)',
          opacity: animateIn ? 1 : 0,
          transition: 'all 0.8s ease-out'
        }}
      >
        <div style={styles.headerSection}>
          <h2 style={styles.heading}>Edit Letter</h2>
          {googleDocUrl && (
            <div style={styles.googleDocLink}>
              <span style={styles.linkLabel}>Google Docs Link:</span>{" "}
              <a 
                href={googleDocUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={styles.link}
              >
                Open Document <span style={styles.linkIcon}>↗</span>
              </a>
            </div>
          )}
        </div>
        
        <div style={styles.formGroup}>
          <input
            type="text"
            placeholder="Enter Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.titleInput}
          />
        </div>
        
        <div style={styles.editorWrapper}>
          <SunEditor
            setContents={content}
            onChange={(content) => setContent(content)}
            placeholder="Write your letter here..."
            setOptions={{
              height: 400,
              buttonList: [
                ["undo", "redo"],
                ["font", "fontSize", "formatBlock"],
                ["bold", "italic", "underline", "strike", "subscript", "superscript"],
                ["fontColor", "hiliteColor"],
                ["align", "list", "lineHeight", "indent", "outdent"],
                ["paragraphStyle", "blockquote"],
                ["table", "horizontalRule"],
                ["link", "image", "video"],
                ["fullScreen", "showBlocks", "codeView"],
                ["removeFormat", "preview", "print"],
              ],
              defaultStyle: "text-align: left; font-family: Arial; font-size: 14px;",
              minHeight: "300px",
              maxHeight: "500px",
              showPathLabel: true,
            }}
          />
        </div>

        <div style={styles.actionButtons}>
          <button 
            onClick={handleUpdate}
            style={styles.updateButton}
            disabled={loading}
            className="action-btn"
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(33, 150, 243, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            {loading ? 'Updating...' : 'Update Letter'}
          </button>
          
          <button 
            onClick={handleSaveToDrive} 
            disabled={googleDocUrl !== null || loading}
            style={{
              ...styles.driveButton,
              opacity: googleDocUrl !== null ? 0.7 : 1,
              cursor: (googleDocUrl !== null || loading) ? 'not-allowed' : 'pointer'
            }}
            className="action-btn"
            onMouseEnter={(e) => {
              if (!googleDocUrl && !loading) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(52, 168, 83, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            {googleDocUrl ? "Saved to Drive" : loading ? "Saving..." : "Save to Google Drive"}
          </button>
          
          {googleDocUrl && (
            <button 
              onClick={handleDeleteFromDrive}
              style={styles.deleteButton}
              disabled={loading}
              className="action-btn"
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(244, 67, 54, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.1)';
              }}
            >
              {loading ? "Deleting..." : "Delete from Drive"}
            </button>
          )}
          
          <button 
            onClick={() => navigate("/dashboard")}
            style={styles.cancelButton}
            disabled={loading}
            className="action-btn"
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(97, 97, 97, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #6e8efb, #a777e3)",
    fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
    padding: "40px 20px",
  },
  editorContainer: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
    width: "100%",
    maxWidth: "900px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    padding: "30px",
  },
  headerSection: {
    marginBottom: "25px",
    textAlign: "center",
  },
  heading: {
    fontSize: "28px",
    color: "#333",
    fontWeight: "600",
    margin: "0 0 15px 0",
  },
  googleDocLink: {
    backgroundColor: "#edf7ed",
    padding: "12px 20px",
    borderRadius: "10px",
    display: "inline-block",
    marginTop: "10px",
  },
  linkLabel: {
    fontWeight: "600",
    color: "#4caf50",
  },
  link: {
    color: "#2196f3",
    textDecoration: "none",
    fontWeight: "500",
    transition: "color 0.3s ease",
  },
  linkIcon: {
    fontSize: "14px",
  },
  formGroup: {
    marginBottom: "20px",
  },
  titleInput: {
    padding: "15px",
    width: "100%",
    fontSize: "16px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    backgroundColor: "#f9f9fb",
    outline: "none",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
  },
  editorWrapper: {
    marginBottom: "25px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden",
  },
  actionButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginTop: "10px",
  },
  updateButton: {
    backgroundColor: "#2196f3",
    color: "white",
    padding: "12px 24px",
    fontSize: "15px",
    borderRadius: "50px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "500",
    transition: "all 0.3s ease",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
  },
  driveButton: {
    backgroundColor: "#34a853",
    color: "white",
    padding: "12px 24px",
    fontSize: "15px",
    borderRadius: "50px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "500",
    transition: "all 0.3s ease",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "12px 24px",
    fontSize: "15px",
    borderRadius: "50px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "500",
    transition: "all 0.3s ease",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
  },
  cancelButton: {
    backgroundColor: "#757575",
    color: "white",
    padding: "12px 24px",
    fontSize: "15px",
    borderRadius: "50px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "500",
    transition: "all 0.3s ease",
    boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: "20px",
    padding: "60px 40px",
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
    width: "300px",
  },
  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "5px solid rgba(110, 142, 251, 0.2)",
    borderRadius: "50%",
    borderTop: "5px solid #6e8efb",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  loadingText: {
    color: "#333",
    fontSize: "18px",
    fontWeight: "500",
  },
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" }
  },
};

export default EditLetter;