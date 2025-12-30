import React, { useState, ChangeEvent, KeyboardEvent, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { getQuestion, getChatHistory, submitAnswer } from "../api/interview.api";
import './Chat.css';

// Define the structure of a Message
interface Message {
    id: string;
    type: 'incoming' | 'outgoing';
    text: string;
    time: string;
}

const ChatApp: React.FC = () => {
    // Initialize state with the Message interface
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMsg, setInputMsg] = useState<string>('');
    const [currentQuestionId, setCurrentQuestionId] = useState<string>('');
    const [currentQuestionText, setCurrentQuestionText] = useState<string>('');
    const fetchedRef = React.useRef(false);
    const navigate = useNavigate();
    // Handle Input Changes
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setInputMsg(e.target.value);
    };

    // Handle Send Logic
    const handleSendMessage = async (): Promise<void> => {
        if (inputMsg.trim() !== '') {
            const newMessage: Message = {
                id: String(Date.now()), // Unique ID using timestamp
                type: 'outgoing',
                text: inputMsg,
                time: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Today`
            };
            setMessages([...messages, newMessage]);
            setInputMsg('');
            await submitAnswer(currentQuestionText, inputMsg, currentQuestionId);
            await fetchQuestions();
        }
    };

    // Handle Enter Key Press
    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const fetchQuestions = async () => {
        const response = await getChatHistory();
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
            const response = await getQuestion();
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
        localStorage.removeItem("access_token");
        navigate("/");
    };

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchQuestions();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            navigate("/");
        }
    }, [navigate]);
    //console.log(messages);


    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
            <div className='position-absolute top-0 end-0 m-3'>
                <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
            <div className="container">
                <div className="row mt-4 pt-4">
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

                                    <div className="type_msg">
                                        <div className="input_msg_write">
                                            <textarea
                                                type="text"
                                                className="write_msg"
                                                placeholder="Type a message"
                                                value={inputMsg}
                                                onChange={handleInputChange}
                                                onKeyPress={handleKeyPress}
                                            ></textarea>
                                            <button className="msg_send_btn" type="button" onClick={handleSendMessage}>
                                                <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >

    );
};

export default ChatApp;