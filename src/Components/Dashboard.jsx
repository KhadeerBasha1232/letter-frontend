import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, logout } from "../Firebase/firebase";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [letters, setLetters] = useState([]);
  const [liveEditing, setLiveEditing] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [letterToDelete, setLetterToDelete] = useState(null);
  const [copyingToGDrive, setCopyingToGDrive] = useState({});

  useEffect(() => {
    // Start animation after component mounts
    setAnimateIn(true);
    
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      fetchLetters(currentUser.uid);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchLetters = (userId) => {
    fetch(`https://letter-backend-kb.onrender.com/api/letters/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch letters");
        return res.json();
      })
      .then((data) => {
        setLetters(Array.isArray(data.letters) ? data.letters : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching letters:", err);
        setError(err.message);
        setLoading(false);
      });
  };

  const handleDeleteClick = (letterId) => {
    setLetterToDelete(letterId);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!letterToDelete) return;
    
    try {
      const response = await fetch(`https://letter-backend-kb.onrender.com/api/letters/delete/${letterToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete letter");

      setLetters(letters.filter((letter) => letter._id !== letterToDelete));
      toast.success('Letter deleted successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error("Error deleting letter:", err);
      toast.error('Failed to delete letter. Try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setShowConfirmDialog(false);
      setLetterToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmDialog(false);
    setLetterToDelete(null);
  };

  const toggleLiveEdit = (letterId) => {
    if (liveEditing[letterId]) {
      setLiveEditing((prev) => ({ ...prev, [letterId]: false }));
    } else {
      setLiveEditing((prev) => ({ ...prev, [letterId]: true }));
      navigate(`/live/${letterId}`);
    }
  };

  const copyToGoogleDrive = async (letterId) => {
    setCopyingToGDrive((prev) => ({ ...prev, [letterId]: true }));
    
    try {
      const response = await fetch(`https://letter-backend-kb.onrender.com/api/letters/save-to-drive/${letterId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleId: user.uid }),
      });

      if (!response.ok) throw new Error("Failed to copy to Google Drive");
      
      const data = await response.json();
      
      // Update letter with Google Drive file ID and change status to "saved"
      // Use functional update to ensure we have the latest state
      setLetters(prevLetters => prevLetters.map(letter => 
        letter._id === letterId 
          ? { ...letter, googleDriveFileId: data.googleDriveFileId, status: "saved" } 
          : letter
      ));
      
      toast.success('Letter saved to Google Drive!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (err) {
      console.error("Error copying to Google Drive:", err);
      toast.error('Failed to copy to Google Drive. Try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setCopyingToGDrive((prev) => ({ ...prev, [letterId]: false }));
    }
  };
  
  const openGoogleDriveFile = (googleDriveFileId) => {
    if (googleDriveFileId && googleDriveFileId.startsWith('http')) {
      window.open(googleDriveFileId, '_blank');
    } else if (googleDriveFileId) {
      window.open(`https://drive.google.com/file/d/${googleDriveFileId}/view`, '_blank');
    }
  };

  const getButtonStyle = (type) => {
    let baseStyle = {...styles.button};
    
    switch(type) {
      case 'create':
        baseStyle = {...baseStyle, ...styles.createButton};
        break;
      case 'logout':
        baseStyle = {...baseStyle, ...styles.logoutButton};
        break;
      case 'edit':
        baseStyle = {...baseStyle, ...styles.editButton};
        break;
      case 'delete':
        baseStyle = {...baseStyle, ...styles.deleteButton};
        break;
      case 'live':
        baseStyle = {...baseStyle, ...styles.liveButton};
        break;
      default:
        break;
    }
    
    return baseStyle;
  };

  // Function to get a gradient background for letter items based on some criterion
  const getLetterItemStyle = (letter, index) => {
    // Color coding based on letter creation date (as an example)
    // We'll categorize letters as:
    // - Recent (< 7 days): blue gradients
    // - Medium (7-30 days): green gradients 
    // - Older (> 30 days): pink/red gradients
    
    const creationDate = new Date(letter.createdAt || Date.now());
    const daysSinceCreation = Math.floor((Date.now() - creationDate) / (1000 * 60 * 60 * 24));
    
    let gradientType;
    if (daysSinceCreation < 7) {
      gradientType = "recent"; // Blue gradients
    } else if (daysSinceCreation < 30) {
      gradientType = "medium"; // Green gradients
    } else {
      gradientType = "old"; // Pink/red gradients
    }
    
    const gradients = {
      recent: [
        "linear-gradient(135deg, #f6f9fe, #edf4ff)",
        "linear-gradient(135deg, #f0f8ff, #e1f1ff)"
      ],
      medium: [
        "linear-gradient(135deg, #f6fff0, #ebfadc)",
        "linear-gradient(135deg, #efffef, #d8f5d8)"
      ],
      old: [
        "linear-gradient(135deg, #fff5f5, #ffe3e3)",
        "linear-gradient(135deg, #fff0f7, #ffe6f3)"
      ]
    };
    
    return {
      ...styles.letterItem,
      background: gradients[gradientType][index % gradients[gradientType].length],
      animationDelay: `${index * 0.1}s`,
      borderLeft: gradientType === "recent" ? "4px solid #4285F4" : 
                  gradientType === "medium" ? "4px solid #34A853" :
                  "4px solid #EA4335"
    };
  };

  // Add global keyframes style for animations
  const keyframesStyle = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
  `;

  // Add keyframes to document head
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = keyframesStyle;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={styles.dashboardContainer}>
      <ToastContainer />
      
      {/* Custom Confirm Dialog */}
      {showConfirmDialog && (
        <div style={styles.modalOverlay}>
          <div style={styles.customConfirm}>
            <h3 style={styles.confirmTitle}>Confirm Deletion</h3>
            <p style={styles.confirmMessage}>Are you sure you want to delete this letter?</p>
            <div style={styles.confirmButtons}>
              <button 
                onClick={cancelDelete}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={styles.confirmDeleteButton}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {user && (
        <div 
          className={`dashboard-content ${animateIn ? 'animated' : ''}`} 
          style={{
            ...styles.dashboardContent,
            transform: animateIn ? 'translateY(0)' : 'translateY(20px)',
            opacity: animateIn ? 1 : 0,
            transition: 'all 0.8s ease-out'
          }}
        >
          <div style={styles.profileSection}>
            <div style={styles.profileImageContainer}>
              <img src={user.photoURL} alt="User Profile" style={styles.profileImage} />
            </div>
            <h2 style={styles.welcomeHeading}>Welcome, {user.displayName}</h2>
            <p style={styles.emailText}>{user.email}</p>
            
            <div style={styles.actionButtons}>
              <button 
                onClick={() => navigate("/new")}
                style={getButtonStyle('create')}
                className="create-btn"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(110, 142, 251, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.1)';
                }}
              >
                <span style={styles.buttonIcon}>+</span> Create New Letter
              </button>
              
              <button 
                onClick={() => { logout(); navigate("/"); }}
                style={getButtonStyle('logout')}
                className="logout-btn"
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(244, 67, 54, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.1)';
                }}
              >
                <span style={styles.buttonIcon}>↩</span> Logout
              </button>
            </div>
          </div>

          <div style={styles.lettersSection}>
            <h3 style={styles.lettersHeading}>Your Letters</h3>
            
            {/* Legend for color coding */}
            <div style={styles.legendContainer}>
              <div style={styles.legendTitle}>Letter Age:</div>
              <div style={styles.legendItems}>
                <div style={styles.legendItem}>
                  <div style={styles.legendColor}><div style={{...styles.legendColorBox, backgroundColor: '#4285F4'}}></div></div>
                  <div style={styles.legendText}>Recent (&lt; 7 days)</div>
                </div>
                <div style={styles.legendItem}>
                  <div style={styles.legendColor}><div style={{...styles.legendColorBox, backgroundColor: '#34A853'}}></div></div>
                  <div style={styles.legendText}>Medium (7-30 days)</div>
                </div>
                <div style={styles.legendItem}>
                  <div style={styles.legendColor}><div style={{...styles.legendColorBox, backgroundColor: '#EA4335'}}></div></div>
                  <div style={styles.legendText}>Older (&gt; 30 days)</div>
                </div>
              </div>
              <div style={{background: "skyblue", borderRadius: "10px", padding: "10px", marginTop: "10px"}}>
                <ul>
                  <li>Share <b>Live Edit links</b> to only who you trust to edit those.</li></ul>
              </div>
            </div>

            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.loadingSpinner}></div>
                <p style={styles.loadingText}>Loading your letters...</p>
              </div>
            ) : error ? (
              <div style={styles.errorContainer}>
                <p style={styles.errorText}>Error: {error}</p>
                <button 
                  onClick={() => fetchLetters(user.uid)}
                  style={styles.retryButton}
                >
                  Try Again
                </button>
              </div>
            ) : letters.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📝</div>
                <p style={styles.emptyText}>You haven't created any letters yet.</p>
                <button 
                  onClick={() => navigate("/new")}
                  style={{...getButtonStyle('create'), width: '200px'}}
                >
                  Create Your First Letter
                </button>
              </div>
            ) : (
              <ul style={styles.lettersList}>
                {letters.map((letter, index) => (
                  <li 
                    key={letter._id} 
                    style={getLetterItemStyle(letter, index)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
                    }}
                  >
                    <div style={styles.letterContent}>
                      <div style={styles.letterLabel}>
                        <div style={styles.letterIcon}>✉️</div>
                      </div>
                      <div style={styles.letterInfo}>
                        <div style={styles.letterTitle}>{letter.title}</div>
                        <div style={styles.letterMeta}>
                          <span style={styles.letterStatus}>
                            Status: <span style={{
                              ...styles.statusBadge,
                              backgroundColor: letter.status === 'saved' ? '#34A853' : '#FFC107'
                            }}>{letter.status}</span>
                          </span>
                          <span style={styles.letterDate}>
                            Created: {new Date(letter.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div style={styles.letterActions}>
                        <button 
                          onClick={() => navigate(`/edit/${letter._id}`)}
                          style={getButtonStyle('edit')}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          Edit
                        </button>
                        
                        <button 
                          onClick={() => toggleLiveEdit(letter._id)}
                          style={{
                            ...getButtonStyle('live'),
                            backgroundColor: liveEditing[letter._id] ? '#ff9800' : '#4caf50'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {liveEditing[letter._id] ? "Stop Live Edit" : "Live Edit"}
                        </button>
                        
                        {letter.googleDriveFileId ? (
                          <button 
                            onClick={() => openGoogleDriveFile(letter.googleDriveFileId)}
                            style={{
                              ...styles.button,
                              backgroundColor: '#4285F4',
                              color: 'white',
                              padding: '8px 16px',
                              fontSize: '14px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <img 
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Google_Drive_icon_%282020%29.svg/2295px-Google_Drive_icon_%282020%29.svg.png" 
                              alt="Google Drive" 
                              style={styles.driveIcon} 
                            />
                            View in Drive
                          </button>
                        ) : (
                          <button 
                            onClick={() => copyToGoogleDrive(letter._id)}
                            disabled={copyingToGDrive[letter._id]}
                            style={{
                              ...styles.button,
                              backgroundColor: '#4285F4',
                              color: 'white',
                              padding: '8px 16px',
                              fontSize: '14px',
                              opacity: copyingToGDrive[letter._id] ? 0.7 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (!copyingToGDrive[letter._id]) {
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            {copyingToGDrive[letter._id] ? (
                              <>
                                <div style={styles.smallSpinner}></div>
                                Copying...
                              </>
                            ) : (
                              <>
                                <img 
                                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Google_Drive_icon_%282020%29.svg/2295px-Google_Drive_icon_%282020%29.svg.png" 
                                  alt="Google Drive" 
                                  style={styles.driveIcon} 
                                />
                                Copy to Drive
                              </>
                            )}
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleDeleteClick(letter._id)}
                          style={getButtonStyle('delete')}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  dashboardContainer: {
    display: "flex",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #6e8efb, #a777e3)",
    fontFamily: "'Segoe UI', Roboto, Arial, sans-serif",
    padding: "40px 20px",
  },
  dashboardContent: {
    backgroundColor: "#fff",
    borderRadius: "20px",
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
    width: "100%",
    maxWidth: "900px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  profileSection: {
    padding: "40px 30px",
    textAlign: "center",
    borderBottom: "1px solid #eee",
    position: "relative",
  },
  profileImageContainer: {
    marginBottom: "20px",
  },
  profileImage: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #6e8efb",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  welcomeHeading: {
    margin: "0 0 5px 0",
    fontSize: "28px",
    color: "#333",
    fontWeight: "600",
  },
  emailText: {
    margin: "0 0 25px 0",
    color: "#666",
    fontSize: "16px",
  },
  actionButtons: {
    display: "flex",
    justifyContent: "center",
    gap: "15px",
    flexWrap: "wrap",
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
  createButton: {
    backgroundColor: "#6e8efb",
    color: "white",
  },
  logoutButton: {
    backgroundColor: "#f44336",
    color: "white",
  },
  editButton: {
    backgroundColor: "#2196f3",
    color: "white",
    padding: "8px 16px",
    fontSize: "14px",
  },
  deleteButton: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "8px 16px",
    fontSize: "14px",
  },
  liveButton: {
    backgroundColor: "#4caf50",
    color: "white",
    padding: "8px 16px",
    fontSize: "14px",
  },
  buttonIcon: {
    marginRight: "8px",
    fontSize: "16px",
    fontWeight: "bold",
  },
  lettersSection: {
    padding: "30px",
  },
  lettersHeading: {
    fontSize: "22px",
    color: "#333",
    marginBottom: "25px",
    textAlign: "center",
    fontWeight: "600",
    position: "relative",
    paddingBottom: "10px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 0",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(110, 142, 251, 0.2)",
    borderRadius: "50%",
    borderTop: "4px solid #6e8efb",
    animation: "spin 1s linear infinite",
    marginBottom: "15px",
  },
  loadingText: {
    color: "#666",
    fontSize: "16px",
  },
  errorContainer: {
    textAlign: "center",
    padding: "30px",
    backgroundColor: "#fff5f5",
    borderRadius: "10px",
    border: "1px solid #ffebee",
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: "15px",
    fontSize: "16px",
  },
  retryButton: {
    backgroundColor: "#f44336",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s ease",
  },
  emptyState: {
    textAlign: "center",
    padding: "50px 20px",
  },
  emptyIcon: {
    fontSize: "50px",
    marginBottom: "15px",
  },
  emptyText: {
    color: "#666",
    marginBottom: "25px",
    fontSize: "16px",
  },
  lettersList: {
    listStyle: "none",
    padding: "0",
    margin: "0",
  },
  letterItem: {
    marginBottom: "15px",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(0, 0, 0, 0.05)",
    opacity: 1, // Changed from 0 to 1 to make items visible
    transform: "translateY(0)", // Changed from translateY(10px) to ensure items are visible
    transition: "all 0.3s ease",
  },
  letterContent: {
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
  },
  letterLabel: {
    marginRight: "5px",
  },
  letterIcon: {
    fontSize: "24px",
  },
  letterTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#222222",
    flex: "1",
    textAlign: "left",
  },
  letterActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  "@keyframes spin": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" }
  },
  "@keyframes fadeIn": {
    "0%": { opacity: 0, transform: "translateY(10px)" },
    "100%": { opacity: 1, transform: "translateY(0)" }
  },
  // Modal overlay for custom confirm dialog
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  // Custom confirm dialog styles
  customConfirm: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.2)',
    padding: '30px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    animation: 'fadeIn 0.3s ease-out',
  },
  confirmTitle: {
    margin: '0 0 15px 0',
    color: '#333',
    fontSize: '24px',
    fontWeight: '600',
  },
  confirmMessage: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '25px',
  },
  confirmButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
  },
  cancelButton: {
    padding: '10px 20px',
    borderRadius: '50px',
    border: '1px solid #ddd',
    backgroundColor: '#f5f5f5',
    color: '#333',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  confirmDeleteButton: {
    padding: '10px 20px',
    borderRadius: '50px',
    border: 'none',
    backgroundColor: '#f44336',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  // Legend styles
  legendContainer: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '8px',
    padding: '10px 15px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  legendTitle: {
    fontWeight: '600',
    marginBottom: '8px',
    fontSize: '14px',
    color: '#333',
  },
  legendItems: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
  },
  legendColor: {
    marginRight: '5px',
  },
  legendColorBox: {
    width: '12px',
    height: '12px',
    borderRadius: '3px',
  },
  legendText: {
    fontSize: '13px',
    color: '#666',
  },
  letterInfo: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
  },
  letterMeta: {
    display: 'flex',
    gap: '15px',
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
  },
  letterDate: {
    display: 'flex',
    alignItems: 'center',
  },
  letterStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  statusBadge: {
    padding: '2px 6px',
    borderRadius: '12px',
    color: 'white',
    fontSize: '11px',
    fontWeight: '500',
  },
  driveIcon: {
    width: '16px',
    height: '16px',
    marginRight: '8px',
  },
  smallSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTop: '2px solid white',
    animation: 'spin 1s linear infinite',
    marginRight: '8px',
  },
};

export default Dashboard;