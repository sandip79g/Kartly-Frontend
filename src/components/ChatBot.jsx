import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ReactMarkdown from "react-markdown";
import "./ChatBot.css";

const ChatBot = () => {
    const { user } = useAuth();

    const modelNames = [
        "qwen3.5:0.8b",
        "llama3.2:1b"
    ];

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [modelName, setModelName] = useState(modelNames[0]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const messagesEndRef = useRef(null);
    // Tracks whether the next messages update is the initial history load,
    // so we can scroll instantly instead of "smooth" (which can get cut
    // short when a large batch of messages is inserted all at once).
    const isInitialLoadRef = useRef(true);

    const loadChatHistory = async () => {
        if (!user?.id) return;

        isInitialLoadRef.current = true;

        const messages = await fetch("/api/bot/history/" + user?.id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (messages.ok) {
            const data = await messages.json();
            console.log("Loaded chat history:", data);

            const formattedMessages = (data.history || []).map(msg => ({
                role: msg.role,
                content: msg.message
            }));
            setMessages(formattedMessages);
        }
    };

    useEffect(() => {
        loadChatHistory();
    }, [user?.id]);

    // Scroll to newest message whenever messages change (including the
    // initial history load).
    useEffect(() => {
        if (messages.length === 0) return;

        if (isInitialLoadRef.current) {
            // Wait for the browser to actually paint the newly-rendered
            // messages before scrolling, and jump instantly (no animation)
            // so it lands reliably at the bottom even for long histories.
            requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
            });
            isInitialLoadRef.current = false;
        } else {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, loading]);

    // The chat window starts closed, so `.chat-messages` (and
    // messagesEndRef) doesn't exist in the DOM yet when history loads in
    // the background. When the user opens the chat, jump to the bottom
    // once the container has actually mounted and painted.
    useEffect(() => {
        if (!isOpen || messages.length === 0) return;

        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
        });
    }, [isOpen]);

    const handleModelChange = () => {
        const currentIndex = modelNames.indexOf(modelName);
        const nextIndex = (currentIndex + 1) % modelNames.length;

        setModelName(modelNames[nextIndex]);
    };

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
                    messages: updatedMessages,
                    model_name: modelName
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

    if (!isOpen) {
        return (
            <button
                type="button"
                className="chatbot-launcher"
                onClick={() => setIsOpen(true)}
                aria-label="Open shopping assistant"
            >
                <span className="chatbot-launcher-icon" aria-hidden="true">
                    AI
                </span>
                <span>ASK ME</span>
            </button>
        );
    }

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

                    <div className="chatbot-model-switcher" aria-live="polite">
                        <span className="chatbot-model-label">Model</span>

                        <button
                            type="button"
                            className="chatbot-model-button"
                            onClick={handleModelChange}
                            aria-label={`Switch AI model. Current model: ${modelName}`}
                            title="Switch model"
                        >
                            {modelName}
                        </button>
                    </div>
                </div>

                <button
                    type="button"
                    className="chatbot-minimize"
                    onClick={() => setIsOpen(false)}
                    aria-label="Minimize shopping assistant"
                    title="Minimize chat"
                >
                    <span aria-hidden="true">−</span>
                </button>
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