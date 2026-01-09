import React, { useState, ChangeEvent, KeyboardEvent, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { getQuestion, getChatHistory, submitAnswer, fetchResult } from "../api/interview.api";
// import { useResume } from "../context/ResumeContext";
import { clearAuth, getAccessToken } from "../utils/api.utils";
import './Chat.css';

// Define the structure of a Message
interface Message {
    id: string;
    type: 'incoming' | 'outgoing';
    text: string;
    time: string;
}

interface Result {
    _id: string;
    fileName: string;
    resumeId: string;
    createdAt: string;
    updatedAt: string;
    totalScore: string;
    exitConfirmed: Boolean;
}

const ChatApp: React.FC = () => {
    // Initialize state with the Message interface
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMsg, setInputMsg] = useState<string>('');
    const [currentQuestionId, setCurrentQuestionId] = useState<string>('');
    const [currentQuestionText, setCurrentQuestionText] = useState<string>('');
    const [results, setResults] = useState<Result[]>([]);
    const fetchedRef = React.useRef(false);
    const navigate = useNavigate();
    // Handle Input Changes
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
        setInputMsg(e.target.value);
    };

    // Handle Send Logic
    const handleSendMessage = async (): Promise<void> => {
        if (inputMsg.trim() !== '') {
            const resumeId = localStorage.getItem('resumeId');
            const newMessage: Message = {
                id: String(Date.now()), // Unique ID using timestamp
                type: 'outgoing',
                text: inputMsg,
                time: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Today`
            };
            setMessages([...messages, newMessage]);
            setInputMsg('');
            await submitAnswer(currentQuestionText, inputMsg, currentQuestionId, resumeId);
            await fetchQuestions();
        }
    };

    // Handle Enter Key Press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const fetchQuestions = async () => {
        const resumeId = localStorage.getItem('resumeId');
        const response = await getChatHistory(resumeId);
        if (response && response.interviews.length > 0) {
            setMessages([]); // Clear existing messages
            response.interviews.forEach((interview: any) => {
                if (interview.question) {
                    const newMessage: Message = {
                        id: interview._id,
                        type: 'incoming',
                        text: interview.question,
                        time: interview.createdAt ? formatRelativeIST(new Date(interview.createdAt)) : `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Today`
                    };
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                    setCurrentQuestionId(newMessage.id);
                    setCurrentQuestionText(newMessage.text);
                }

                if (interview.answer) {
                    const replyMessage: Message = {
                        id: interview._id,
                        type: 'outgoing',
                        text: interview.answer,
                        time: interview.updatedAt ? formatRelativeIST(new Date(interview.updatedAt)) : `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Today`
                    };
                    setMessages((prevMessages) => [...prevMessages, replyMessage]);
                }

            });
        } else {
            const response = await getQuestion(resumeId);
            const newMessage: Message = {
                id: response.id,
                type: 'incoming',
                text: response.question,
                time: response.createdAt ? formatRelativeIST(new Date(response.createdAt)) : `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Today`
            };
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            setCurrentQuestionId(newMessage.id);
            setCurrentQuestionText(newMessage.text);
        }
    }

    const formatRelativeIST = (value: Date | string | number): string => {
        const input = new Date(value);
        if (isNaN(input.getTime())) {
            return "Invalid date";
        }
        // Convert UTC → IST (UTC+5:30)
        const toIST = (d: Date) => {
            const utc = d.getTime() + d.getTimezoneOffset() * 60000;
            return new Date(utc + 5.5 * 60 * 60 * 1000);
        };
        const istDate = toIST(input);
        const nowIST = toIST(new Date());
        const diffMs = nowIST.getTime() - istDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        // Today
        if (diffDays === 0) {
            const time = istDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit"
            });
            return `${time} | Today`;
        }
        // Yesterday
        if (diffDays === 1) {
            const time = istDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit"
            });
            return `${time} | Yesterday`;
        }
        // < 7 days
        if (diffDays < 7) return `${diffDays} days ago`;
        // Weeks
        const weeks = Math.floor(diffDays / 7);
        if (weeks < 4) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
        // Months
        const months = Math.floor(diffDays / 30);
        if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
        // Years
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? "s" : ""} ago`;
    };

    const handleLogout = () => {
        clearAuth();
        localStorage.removeItem("resumeId");
        navigate("/");
    };

    const fetchResults = async () => {
        const resumeId = localStorage.getItem("resumeId");
        const data = await fetchResult(resumeId);
        setResults(data.data || []);
    };

    const hasResume = results.some(
        item => item.resumeId === localStorage.getItem('resumeId') && item.exitConfirmed === true
    );

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchQuestions();
        fetchResults();
    }, []);

    useEffect(() => {
        document.title = "Chat | My App";
        const token = getAccessToken();
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
                        📄 Chat Processes
                    </h4>
                    <div>
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => navigate('/upload')}><i className="fa fa-cloud-upload"></i> Upload Resume</button>
                        <button className="btn btn-outline-primary btn-sm me-2" onClick={() => navigate('/result')}><i className="fa fa-file"></i> Results</button>
                        <button className="btn btn-outline-primary btn-sm" onClick={handleLogout}><i className="fa fa-arrow-left"></i> Logout</button>
                    </div>
                </div>
            </header>

            <main className="flex-grow-1 d-flex justify-content-center align-items-start pt-3 pb-5">
                <div className="container">
                    <div className="row mt-2 pt-4">
                        <div className='col-12'>
                            <div className="messaging">
                                <div className="inbox_msg">

                                    {/* Left Sidebar */}
                                    <div className="inbox_people">
                                        <div className="headind_srch">
                                            <div className="recent_heading">
                                                <h4>Instructions</h4>
                                            </div>
                                            <div className="srch_bar">
                                                {/* <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={handleLogout}
                                                >
                                                    Logout
                                                </button> */}
                                            </div>
                                        </div>
                                        <div className="inbox_chat">
                                            <div className="chat_list">
                                                <ul className="instructions">
                                                    <li>1. Please answer the questions to the best of your ability.</li>
                                                    <li>2. You can type your answers in the message box below.</li>
                                                    <li>3. After submitting an answer, a new question will be presented.</li>
                                                    <li>4. Take your time to think through your responses.</li>
                                                    <li>5. Good luck with your interview!</li>
                                                    <li>6. If you need to review previous questions and answers, scroll up in the chat window.</li>
                                                    <li>7. Ensure your answers are clear and concise.</li>
                                                    <li>8. Stay calm and focused throughout the interview process.</li>
                                                    <li>9. Remember to highlight your strengths and experiences.</li>
                                                    <li>10. We are here to assess your skills, so be honest and authentic.</li>
                                                    <li>11. If you encounter any technical issues, please reach out to support.</li>
                                                    <li>12. Thank you for participating in our interview process!</li>
                                                </ul>
                                                <div className="chat_people">

                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Message Window */}
                                    <div className="mesgs">
                                        <div className="msg_history">
                                            {messages.map((msg, index) => (
                                                <div key={index} id={`${msg?.id}`} className={msg.type === 'incoming' ? 'incoming_msg' : 'outgoing_msg'}>
                                                    {msg.type === 'incoming' && (
                                                        <div className="incoming_msg_img">
                                                            <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil" />
                                                        </div>
                                                    )}
                                                    <div className={msg.type === 'incoming' ? 'received_msg' : 'sent_msg'}>
                                                        <div className={msg.type === 'incoming' ? 'received_withd_msg' : ''}>
                                                            <p>{msg.text}</p>
                                                            <span className="time_date">{msg.time}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {!hasResume && (
                                            < div className="type_msg">
                                                <div className="input_msg_write">
                                                    <textarea
                                                        className="write_msg"
                                                        placeholder="Type a message"
                                                        value={inputMsg}
                                                        onChange={handleInputChange}
                                                        onKeyDown={handleKeyPress}
                                                    ></textarea>
                                                    <button className="msg_send_btn" type="button" onClick={handleSendMessage}>
                                                        <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        )}


                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main >

            {/* ===== FOOTER ===== */}
            < footer className="py-3 mt-auto bg-white shadow-sm text-center" >
                <div className="container">
                    <small className="text-muted">© 2026 My App. All rights reserved.</small>
                </div>
            </footer >

        </div >

    );
};

export default ChatApp;