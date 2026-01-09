import React, { useState, ChangeEvent, DragEvent, useEffect } from 'react';
import { uploadResume } from "../api/interview.api";
import { useNavigate } from "react-router-dom";
import { useResume } from "../context/ResumeContext";
import { clearAuth, getAccessToken } from "../utils/api.utils";
import './Chat.css';
import './Upload.css';

interface Message {
    id: number;
    type: 'incoming' | 'outgoing';
    text: string;
    time: string;
    isFile?: boolean;
}

const UploadApp: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, type: 'incoming', text: 'Hello! Please upload your resume in PDF or DOCX format.', time: '10:00 AM | Today' },
    ]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { setResumeId } = useResume();
    const navigate = useNavigate();

    const getTime = () => `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Today`;

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUploadSubmit = async () => {
        if (selectedFile) {
            const newMessage: Message = {
                id: Date.now(),
                type: 'outgoing',
                text: `📄 Resume: ${selectedFile.name}`,
                time: getTime(),
                isFile: true
            };
            setMessages([...messages, newMessage]);
            const resumeId = await uploadResume(selectedFile);
            localStorage.setItem('resumeId', resumeId.lastResumeId);
            setResumeId(resumeId.lastResumeId);
            setSelectedFile(null);
            navigate("/chat");
        }
    };

    const onDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = () => setIsDragging(false);
    const onDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleLogout = () => {
        clearAuth();
        navigate("/");
    };

    const handleInterview = () => {
        navigate("/result");
    }

    useEffect(() => {
        const token = getAccessToken();
        document.title = "Upload | My App";
        if (!token) {
            navigate("/");
        }
    }, [navigate]);

    return (
        <div className="d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>

            {/* ===== HEADER ===== */}
            <header className="py-3 shadow-sm mb-4">
                <div className="container d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 d-flex align-items-center gap-2">
                        <i className="fa fa-cloud-upload text-primary"></i> Upload File
                    </h4>
                    <div>
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => navigate('/upload')}><i className="fa fa-cloud-upload"></i> Upload Resume</button>
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => navigate('/result')}><i className="fa fa-file"></i> Results</button>
                        <button className="btn btn-outline-primary btn-sm" onClick={handleLogout}><i className="fa fa-arrow-left"></i> Logout</button>
                    </div>
                </div>
            </header>

            {/* ===== CONTENT ===== */}
            <main className="flex-grow-1 d-flex justify-content-center align-items-start pt-3 pb-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-10 col-lg-6">
                            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">

                                {/* Chat / Message History */}
                                <div className="msg_history_resume p-3" style={{ maxHeight: '350px', overflowY: 'auto', background: '#f9f9f9' }}>
                                    {messages.map((msg) => (
                                        <div key={msg.id} className={`mb-3 d-flex ${msg.type === 'incoming' ? 'justify-content-start' : 'justify-content-end'}`}>
                                            {msg.type === 'incoming' && (
                                                <img src="https://ptetutorials.com/images/user-profile.png" alt="bot"
                                                    className="rounded-circle me-2" style={{ width: 35, height: 35 }} />
                                            )}
                                            <div className={`p-2 rounded ${msg.type === 'incoming' ? 'bg-light text-dark' : 'bg-primary text-white'}`} style={{ maxWidth: '75%' }}>
                                                <p className="mb-1">{msg.text}</p>
                                                <small className="text-muted d-block text-end">{msg.time}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Upload Section */}
                                <div className="border-top p-3 bg-white">
                                    {!selectedFile ? (
                                        <div
                                            className={`border border-dashed rounded text-center p-4 ${isDragging ? 'bg-light' : ''}`}
                                            onDragOver={onDragOver}
                                            onDragLeave={onDragLeave}
                                            onDrop={onDrop}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <input
                                                type="file"
                                                id="resume-upload"
                                                hidden
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                            />
                                            <label htmlFor="resume-upload" className="m-0 w-100">
                                                <i className="fa fa-cloud-upload fa-2x text-primary mb-2"></i>
                                                <p className="mb-1 fw-semibold">Drag & Drop Resume or <span className="text-primary">Browse</span></p>
                                                <small className="text-muted">Supports PDF, DOC, DOCX</small>
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded shadow-sm">
                                            <div className="d-flex align-items-center">
                                                <i className="fa fa-file-text-o fa-2x text-danger me-3"></i>
                                                <div>
                                                    <p className="mb-0 fw-semibold text-truncate" style={{ maxWidth: 200 }}>{selectedFile.name}</p>
                                                    <small className="text-muted">{(selectedFile.size / 1024).toFixed(1)} KB</small>
                                                </div>
                                            </div>
                                            <div>
                                                <button className="btn btn-sm btn-outline-danger me-2" onClick={() => setSelectedFile(null)}>Cancel</button>
                                                <button className="btn btn-sm btn-primary" onClick={handleUploadSubmit}>
                                                    Send <i className="fa fa-paper-plane ms-1"></i>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ===== FOOTER ===== */}
            <footer className="py-3 mt-auto bg-white shadow-sm text-center">
                <div className="container">
                    <small className="text-muted">© 2026 My App. All rights reserved.</small>
                </div>
            </footer>
        </div>
    );
};

export default UploadApp;
