import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import { auth } from "../Firebase/firebase";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io("https://letter-backend-kb.onrender.com");

const LiveEditor = () => {
    const { letterId } = useParams();
    const navigate = useNavigate();
    const editorRef = useRef(null);

    const [letter, setLetter] = useState(null);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [googleDocUrl, setGoogleDocUrl] = useState(null);
    const [user, setUser] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);

    const autoSaveTimer = useRef(null);

    useEffect(() => {
        // Start animation after component mounts
        setAnimateIn(true);
        
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (!currentUser) {
                navigate("/");
            } else {
                setUser(currentUser);
                fetchLetter(letterId, currentUser);
                socket.emit("joinLetter", letterId);
                socket.emit("requestLatestContent", letterId);
            }
        });

        return () => unsubscribe();
    }, [navigate, letterId]);

    const fetchLetter = async (id, currentUser) => {
        try {
            const response = await fetch(`https://letter-backend-kb.onrender.com/api/letters/live/${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    "google-id": currentUser?.uid,
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

            setLetter(data.letter);
            setContent(data.letter.content);
            if (data.letter.googleDriveFileId) {
                setGoogleDocUrl(`${data.letter.googleDriveFileId}`);
            }
            setLoading(false);
        } catch (err) {
            console.error("Error fetching letter:", err);
            toast.error("Failed to fetch letter.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            navigate("/dashboard");
        }
    };

    useEffect(() => {
        socket.on("receiveUpdate", (updatedContent) => {
            setContent(updatedContent);
            if (editorRef.current) {
                const currentContent = editorRef.current.getContents();
                if (currentContent !== updatedContent) {
                    editorRef.current.setContents(updatedContent);
                }
            }
        });

        socket.on("latestContent", (latestContent) => {
            setContent(latestContent);
            if (editorRef.current) {
                editorRef.current.setContents(latestContent);
            }
        });

        return () => {
            socket.off("receiveUpdate");
            socket.off("latestContent");
            socket.emit("leaveLetter", letterId);
        };
    }, [letterId]);

    const handleChange = (value) => {
        setContent(value);
        setIsDirty(true);
        socket.emit("updateLetter", { letterId, content: value });
    
        if (autoSaveTimer.current) {
            clearTimeout(autoSaveTimer.current);
        }
    
        autoSaveTimer.current = setTimeout(() => {
            autoSave();
        }, 2000);
    };
    
    const autoSave = async () => {
        try {
            if (!editorRef.current) return;
    
            const latestContent = editorRef.current.getContents();
            if (!latestContent) return;
    
            if (googleDocUrl) {
                const deleteResponse = await fetch(`https://letter-backend-kb.onrender.com/api/letters/delete-from-drive/${letterId}`, {
                    method: "DELETE",
                });
                if (!deleteResponse.ok) throw new Error("Failed to delete old draft from Google Drive");
                setGoogleDocUrl(null);
                console.log("Old draft deleted");
            }
    
            const saveResponse = await fetch(`https://letter-backend-kb.onrender.com/api/letters/save-to-drive/${letterId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: latestContent })
            });
    
            const saveData = await saveResponse.json();
            if (!saveResponse.ok) throw new Error("Failed to save new draft to Google Drive");
    
            setGoogleDocUrl(`${saveData.letter.googleDriveFileId}`);
            setIsDirty(false);
            console.log("New draft auto-saved to Google Drive!");
    
        } catch (err) {
            console.error("Auto-Save Error:", err);
            toast.error("Auto-save failed. Please try again later.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingContainer}>
                    <div style={styles.loadingSpinner}></div>
                    <p style={styles.loadingText}>Loading your letter...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.errorContainer}>
                    <p style={styles.errorText}>{error}</p>
                    <button 
                        onClick={() => navigate("/dashboard")}
                        style={styles.cancelButton}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <ToastContainer />
            {letter && (
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
                        <h2 style={styles.heading}>
                            {letter.title} {isDirty && <span style={{ color: '#ff9800' }}>(Unsaved Changes)</span>}
                        </h2>
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
                    
                    <div style={styles.editorWrapper}>
                        <SunEditor
                            getSunEditorInstance={(sunEditor) => { editorRef.current = sunEditor; }}
                            defaultValue={content}
                            onChange={handleChange}
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
                            disabled
                            style={styles.autoSaveButton}
                            className="action-btn"
                        >
                            Auto-Saving...
                        </button>
                        
                        <button 
                            onClick={() => navigate("/dashboard")}
                            style={styles.cancelButton}
                            className="action-btn"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.boxShadow = '0 6px 12px rgba(97, 97, 97, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.1)';
                            }}
                        >
                            Exit Live Editing
                        </button>
                    </div>
                </div>
            )}
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
    autoSaveButton: {
        backgroundColor: "#9e9e9e",
        color: "white",
        padding: "12px 24px",
        fontSize: "15px",
        borderRadius: "50px",
        border: "none",
        cursor: "not-allowed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "500",
        opacity: 0.8,
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
    errorContainer: {
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
    errorText: {
        color: "#f44336",
        fontSize: "18px",
        fontWeight: "500",
        marginBottom: "20px",
    },
    "@keyframes spin": {
        "0%": { transform: "rotate(0deg)" },
        "100%": { transform: "rotate(360deg)" }
    },
};

export default LiveEditor;