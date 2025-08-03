import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, Send, User } from "lucide-react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  interface ChatMessage {
    sender: "user" | "bot";
    text?: string;
    id?: string | number;
    content?: string;
  }

  interface BackendRequestBody {
    messages: { sender: "user"; content: string }[];
  }

  interface BackendResponse {
    reply?: string;
    [key: string]: unknown;
  }

  const sendMessageToBackend = async (
    message: string
  ): Promise<BackendResponse> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ sender: "user", content: message }],
      } as BackendRequestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return (await response.json()) as BackendResponse;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userMessage = userInput.trim();
    if (!userMessage) return;

    // Add user message to chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: userMessage },
    ]);
    setUserInput("");
    setIsLoading(true);

    try {
      const response = await sendMessageToBackend(userMessage);

      if (response && response.reply) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: response.reply },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Sorry, no response received." },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: "Failed to get response from server." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    console.log(messages);
  }, [messages]);

  return (
    <div className="flex flex-col h-screen w-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 py-4 sm:px-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
          Alfan AI Chat Bot
        </h1>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages?.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg">
                Hi! I'm Alfan AI. How can I help you today?
              </p>
            </div>
          )}

          {messages?.map((message) => (
            <div
              key={message?.id}
              className={`flex ${
                message?.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start space-x-2 max-w-xs sm:max-w-md lg:max-w-lg ${
                  message?.sender === "user"
                    ? "flex-row-reverse space-x-reverse"
                    : ""
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message?.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {message?.sender === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message?.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white text-gray-800 shadow-sm border rounded-bl-md"
                  }`}
                >
                  <p className="text-sm sm:text-base leading-relaxed">
                    <ReactMarkdown>{message?.text}</ReactMarkdown>
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-2 max-w-xs sm:max-w-md lg:max-w-lg">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="px-4 py-2 bg-white rounded-2xl rounded-bl-md shadow-sm border">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t px-4 py-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message here..."
              disabled={isLoading}
              className="flex-1 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
