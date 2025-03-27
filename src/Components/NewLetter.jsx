import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import { auth } from "../Firebase/firebase";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NewLetter = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [user, setUser] = useState(null);
  const [letterId, setLetterId] = useState(null);
  const [googleDocUrl, setGoogleDocUrl] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Start animation after component mounts
    setAnimateIn(true);
    
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!title || !content) {
      toast.error('Title and Content are required!', {
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
      toast.error('User not authenticated!', {
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
      const response = await fetch("https://letter-backend-kb.onrender.com/api/letters/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleId: user.uid,
          title,
          content,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to create letter");
      setLetterId(data.letter._id);
      toast.success('Letter saved as draft!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error("Error creating letter:", err);
      toast.error('Failed to create letter. Try again.', {
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
    if (!letterId) {
      toast.warning('Save the letter as a draft first!', {
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
      const response = await fetch(`https://letter-backend-kb.onrender.com/api/letters/save-to-drive/${letterId}`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to save to Google Drive");
      setGoogleDocUrl(`${data.letter.googleDriveFileId}`);
      toast.success('Letter saved to Google Drive!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error("Error saving to Google Drive:", err);
      toast.error('Failed to save to Google Drive. Try again.', {
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
    if (!letterId || !googleDocUrl) {
      toast.warning('No document to delete!', {
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
      const response = await fetch(`https://letter-backend-kb.onrender.com/api/letters/delete-from-drive/${letterId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) throw new Error("Failed to delete from Google Drive");

      setGoogleDocUrl(null);
      toast.success('Letter deleted from Google Drive!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error("Error deleting from Google Drive:", err);
      toast.error('Failed to delete from Google Drive. Try again.', {
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

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setLetterId(null);
    setGoogleDocUrl(null);
    navigate("/dashboard");
  };

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
          <h2 style={styles.heading}>Create a New Letter</h2>
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
            onClick={handleSubmit}
            style={styles.saveButton}
            disabled={loading}
            className="action-btn"
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(110, 142, 251, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.1)';
            }}
          >
            {loading ? 'Saving...' : 'Save Draft'}
          </button>
          
          <button 
            onClick={handleSaveToDrive} 
            disabled={googleDocUrl !== null || loading || !letterId}
            style={{
              ...styles.driveButton,
              opacity: (googleDocUrl !== null || !letterId) ? 0.7 : 1,
              cursor: (googleDocUrl !== null || loading || !letterId) ? 'not-allowed' : 'pointer'
            }}
            className="action-btn"
            onMouseEnter={(e) => {
              if (!googleDocUrl && !loading && letterId) {
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
            onClick={handleCancel}
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
  button: {
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
  saveButton: {
    backgroundColor: "#6e8efb",
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
};

export default NewLetter;