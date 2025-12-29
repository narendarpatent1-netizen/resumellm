import React, { useState, ChangeEvent, KeyboardEvent, useEffect, useRef } from 'react';
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
                        time: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Today`
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
                        time: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Today`
                    };
                    setMessages((prevMessages) => [...prevMessages, replyMessage]);
                }

            });
        } else {
            const response = await getQuestion();
            const newMessage: Message = {
                id: response._id,
                type: 'incoming',
                text: response.question,
                time: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Today`
            };
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            setCurrentQuestionId(newMessage.id);
            setCurrentQuestionText(newMessage.text);
        }
    }

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;
        fetchQuestions();
    }, []);
    console.log(messages);


    return (
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
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
                                            <div className="stylish-input-group">
                                                <input type="text" className="search-bar" placeholder="Search" />
                                                <span className="input-group-addon">
                                                    <button type="button">
                                                        <i className="fa fa-search" aria-hidden="true"></i>
                                                    </button>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="inbox_chat">
                                        {[1].map((user) => (
                                            <div key={user} className={`chat_list ${user === 1 ? 'active_chat' : ''}`}>
                                                <div className="chat_people">
                                                    <div className="chat_img">
                                                        <img src="https://ptetutorials.com/images/user-profile.png" alt="user" />
                                                    </div>
                                                    <div className="chat_ib">
                                                        <h5>Sunil Rajput <span className="chat_date">Dec 25</span></h5>
                                                        <p>Test, which is a new approach to have all solutions astrology under one roof.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Right Message Window */}
                                <div className="mesgs">
                                    <div className="msg_history">
                                        {messages.map((msg) => (
                                            <div key={msg.id} id={`${msg?.id}`} className={msg.type === 'incoming' ? 'incoming_msg' : 'outgoing_msg'}>
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
                                            <input
                                                type="text"
                                                className="write_msg"
                                                placeholder="Type a message"
                                                value={inputMsg}
                                                onChange={handleInputChange}
                                                onKeyPress={handleKeyPress}
                                            />
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
        </div>

    );
};

export default ChatApp;