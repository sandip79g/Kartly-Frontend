import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ReactMarkdown from "react-markdown";
import "./ChatBot.css";

const ChatBot = () => {
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    // Scroll to newest message whenever messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages, loading]);

    const handleSend = async () => {
        const trimmedMessage = input.trim();

        if (!trimmedMessage || loading) return;

        const userMessage = {
            role: "user",
            content: trimmedMessage
        };

        // Messages that will be sent to the backend
        const updatedMessages = [...messages, userMessage];

        // Immediately show the user's message
        setMessages(updatedMessages);

        // Clear input
        setInput("");

        setLoading(true);

        try {
            const response = await fetch("/api/bot/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: user?.id || null,
                    messages: updatedMessages
                })
            });

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            const data = await response.json();

            const assistantMessage = {
                role: "assistant",
                content: data.message
            };

            // Append bot message to existing messages
            setMessages((previousMessages) => [
                ...previousMessages,
                assistantMessage
            ]);
        } catch (error) {
            console.error("Error sending message:", error);

            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    role: "assistant",
                    content:
                        "Sorry, something went wrong. Please try again."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="chatbot">
            {/* Header */}
            <div className="chatbot-header">
                <div className="chatbot-avatar">
                    AI
                </div>

                <div className="chatbot-header-info">
                    <h2>Shopping Assistant</h2>

                    <div className="chatbot-status">
                        <span className="status-dot"></span>
                        Online
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="chat-welcome">
                        <div className="welcome-icon">
                            👋
                        </div>

                        <h3>Hi{user?.first_name ? ` ${user.first_name}` : ""}!</h3>

                        <p>
                            How can I help you today?
                        </p>

                        <span>
                            Ask me about products, recommendations,
                            orders or anything else.
                        </span>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message-row ${message.role}`}
                    >
                        {message.role === "assistant" && (
                            <div className="message-avatar">
                                AI
                            </div>
                        )}

                        <div
                            className={`message-bubble ${message.role}`}
                        >
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}

                {/* Typing animation */}
                {loading && (
                    <div className="message-row assistant">
                        <div className="message-avatar">
                            AI
                        </div>

                        <div className="message-bubble assistant typing">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}

                {/* Used for auto scrolling */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-container">
                <div className="chat-input">
                    <input
                        type="text"
                        value={input}
                        onChange={(event) =>
                            setInput(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me something..."
                        disabled={loading}
                    />

                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        aria-label="Send message"
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M22 2L11 13"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />

                            <path
                                d="M22 2L15 22L11 13L2 9L22 2Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>

                <div className="chatbot-footer">
                    AI can make mistakes. Check important information.
                </div>
            </div>
        </div>
    );
};

export default ChatBot;