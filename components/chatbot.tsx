"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, Send, Bot, Loader2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export function Chatbot() {
  const pathname = usePathname();
  const isEn = pathname?.startsWith("/en");
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const requestTimestamps = useRef<number[]>([]);

  // Initialize with greeting message on mount or locale change
  useEffect(() => {
    setMessages([
      {
        id: "greet",
        text: isEn
          ? "Welcome to VetDz! 👋 I'm your fashion assistant. How can I help you today?"
          : "مرحباً بك في VetDz! 👋 أنا مساعدك الذكي لمتجر أزيائنا. كيف يمكنني مساعدتك اليوم؟",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, [isEn]);

  // Scroll to bottom on new messages, typing state, or chat toggle
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  // Hide chatbot on admin pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Rate Limiting Check: Max 5 requests per 60 seconds
    const now = Date.now();
    requestTimestamps.current = requestTimestamps.current.filter(t => now - t < 60000);
    if (requestTimestamps.current.length >= 5) {
      const userMessage: Message = {
        id: now.toString(),
        text: input.trim(),
        sender: "user",
        timestamp: new Date(),
      };
      setMessages((prev) => [
        ...prev, 
        userMessage,
        {
          id: (now + 1).toString(),
          text: isEn
            ? "You have exceeded the message limit (max 5 per minute). Please wait a moment."
            : "لقد تجاوزت حد إرسال الرسائل (الحد الأقصى هو 5 رسائل في الدقيقة). يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.",
          sender: "bot",
          timestamp: new Date(),
        }
      ]);
      return;
    }

    requestTimestamps.current.push(now);

    const userMessage: Message = {
      id: now.toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text }),
      });

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.ok 
          ? (data.reply   ?? (isEn ? "No response received." : "لم يتم استلام رد."))
          : (data.error   ?? (isEn ? "Server error occurred. Please try again." : "عذراً، حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.")),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: isEn
          ? "Failed to connect to the server. Please ensure backend is running."
          : "عذراً، تعذّر الاتصال بالخادم. تأكد من تشغيل backend ثم أعد المحاولة.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Bot Icon Trigger Button (Fixed Bottom-Right) */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`vetdz-chatbot-trigger ${isOpen ? "active" : ""}`}
        aria-label={isEn ? "VetDz Assistant" : "مساعد VetDz"}
        type="button"
      >
        {isOpen ? <X size={26} /> : <Bot size={26} />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="vetdz-chatbot-window" dir={isEn ? "ltr" : "rtl"}>
          {/* Header */}
          <div className="vetdz-chatbot-header">
            <div className="vetdz-chatbot-header-info">
              <div className="vetdz-chatbot-avatar">
                <Bot size={20} />
              </div>
              <div className="vetdz-chatbot-title-container">
                <h4 className="vetdz-chatbot-title">{isEn ? "VetDz Smart Assistant" : "مساعد VetDz الذكي"}</h4>
                <div className="vetdz-chatbot-status">
                  <span className="vetdz-chatbot-status-dot"></span>
                  <span>{isEn ? "Online" : "متصل حالياً"}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="vetdz-chatbot-close-btn"
              aria-label={isEn ? "Close chat" : "إغلاق المحادثة"}
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="vetdz-chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`vetdz-chatbot-msg-row ${
                  msg.sender === "user" ? "user-row" : "bot-row"
                }`}
              >
                <div
                  className={`vetdz-chatbot-bubble ${
                    msg.sender === "user" ? "user-bubble" : "bot-bubble"
                  }`}
                >
                  <p className="vetdz-chatbot-bubble-text">{msg.text}</p>
                  <span className="vetdz-chatbot-bubble-time">
                    {msg.timestamp.toLocaleTimeString(isEn ? "en-US" : "ar-DZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="vetdz-chatbot-msg-row bot-row">
                <div className="vetdz-chatbot-bubble bot-bubble typing-bubble">
                  <div className="vetdz-chatbot-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="vetdz-chatbot-input-container">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isEn ? "Type your message here..." : "اكتب رسالتك هنا..."}
              className="vetdz-chatbot-input"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="vetdz-chatbot-send-btn"
              disabled={!input.trim() || isLoading}
              aria-label={isEn ? "Send" : "إرسال"}
            >
              {isLoading ? (
                <Loader2 size={18} className="chatbot-spin" />
              ) : (
                <Send size={18} className={isEn ? "" : "rtl-flip"} />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
