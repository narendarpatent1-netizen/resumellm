import React, { useState, ChangeEvent, DragEvent, useEffect } from 'react';
import { uploadResume } from "../api/interview.api";
import { useNavigate } from "react-router-dom";
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
    const [file, setFile] = useState<File | null>(null);
    const navigate = useNavigate();

    const getTime = () => `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Today`;

    // Handle File Selection via Input
    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // Handle "Sending" the file
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
            await uploadResume(selectedFile);
            setSelectedFile(null); // Clear preview after sending
            navigate("/chat")
        }
    };

    // Drag and Drop Handlers
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
        localStorage.removeItem("access_token");
        navigate("/");
    };

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            navigate("/");
        }
    }, [navigate]);

    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <div className="position-absolute top-0 end-0 m-3">
                <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
            <div className="container">
                <div className="row d-flex align-items-center justify-content-center">
                    <div className='col-md-8 col-lg-6'>
                        <div className="messaging">
                            <div className="inbox_msg shadow-sm bg-white rounded">

                                <div className="upload_mesgs">
                                    <div className="msg_history_resume p-3">
                                        {messages.map((msg) => (
                                            <div key={msg.id} className={msg.type === 'incoming' ? 'incoming_msg' : 'outgoing_msg'}>
                                                {msg.type === 'incoming' && (
                                                    <div className="incoming_msg_img">
                                                        <img src="https://ptetutorials.com/images/user-profile.png" alt="bot" />
                                                    </div>
                                                )}
                                                <div className={msg.type === 'incoming' ? 'received_msg' : 'sent_msg'}>
                                                    <div className={msg.type === 'incoming' ? 'received_withd_msg' : ''}>
                                                        <p className={msg.isFile ? 'file-msg' : ''}>{msg.text}</p>
                                                        <span className="time_date">{msg.time}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* --- RESUME UPLOAD SECTION --- */}
                                    <div className="upload-section p-3 border-top">
                                        {!selectedFile ? (
                                            <div
                                                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                                                onDragOver={onDragOver}
                                                onDragLeave={onDragLeave}
                                                onDrop={onDrop}
                                            >
                                                <input
                                                    type="file"
                                                    id="resume-upload"
                                                    hidden
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleFileChange}
                                                />
                                                <label htmlFor="resume-upload" className="drop-zone-label">
                                                    <i className="fa fa-cloud-upload fa-2x mb-2 text-primary"></i>
                                                    <p className="mb-0">Drag & Drop Resume or <strong>Browse</strong></p>
                                                    <small className="text-muted">Supports PDF, DOC, DOCX</small>
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="file-preview d-flex align-items-center justify-content-between p-2 rounded">
                                                <div className="d-flex align-items-center">
                                                    <i className="fa fa-file-text-o fa-2x text-danger mr-3"></i>
                                                    <div>
                                                        <p className="mb-0 font-weight-bold text-truncate" style={{ maxWidth: '200px' }}>
                                                            {selectedFile.name}
                                                        </p>
                                                        <small className="text-muted">{(selectedFile.size / 1024).toFixed(1)} KB</small>
                                                    </div>
                                                </div>
                                                <div>
                                                    <button className="btn btn-sm btn-outline-danger mr-2" onClick={() => setSelectedFile(null)}>Cancel</button>
                                                    <button className="btn btn-sm btn-primary" onClick={handleUploadSubmit}>
                                                        Send <i className="fa fa-paper-plane ml-1"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {/* --- END UPLOAD SECTION --- */}

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadApp;