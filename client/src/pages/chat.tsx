import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, MessageSquare } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Nav } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { getChatMessages, sendChatMessage, type ChatMessage } from "@/lib/supabase";

const SUGGESTED_PROMPTS = [
  "What is the cheapest way to treat malaria in Nigeria?",
  "How do I apply for NHIS health insurance?",
  "What drugs can I take for typhoid without a prescription?",
  "How much does a C-section cost in Lagos?",
  "What is the difference between HMO and NHIS?",
  "How can I negotiate my hospital bill?",
  "What free healthcare services are available in Nigeria?",
  "How do I find a cheap pharmacy near me?",
];

export default function Chat() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }
    try {
      const data = await getChatMessages(user.id);
      setMessages(data);
    } catch {
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const handleSend = async (text?: string) => {
    const content = (text ?? message).trim();
    if (!content || isSending) return;

    if (!user) {
      const tempUser: ChatMessage = { id: Date.now(), user_id: "guest", role: "user", content, created_at: new Date().toISOString() };
      const tempAI: ChatMessage = { id: Date.now() + 1, user_id: "guest", role: "assistant", content: "Please sign in to use the AI health chat and get personalized advice.", created_at: new Date().toISOString() };
      setMessages((prev) => [...prev, tempUser, tempAI]);
      setMessage("");
      return;
    }

    setMessage("");
    setIsSending(true);
    const tempMsg: ChatMessage = { id: -1, user_id: user.id, role: "user", content, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      await sendChatMessage(user.id, content);
      const updated = await getChatMessages(user.id);
      setMessages(updated);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== -1));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Nav />
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Health & Finance Assistant</h1>
            <p className="text-xs text-muted-foreground">Ask about affordable healthcare, costs, insurance, and payment options</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>

        <div className="flex-1 rounded-2xl border border-border bg-card overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" style={{ minHeight: "400px", maxHeight: "60vh" }}>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-16 w-3/4" />
                <Skeleton className="h-12 w-1/2 ml-auto" />
                <Skeleton className="h-20 w-4/5" />
              </div>
            ) : messages.length > 0 ? (
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-primary" : "bg-muted border border-border"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-white rounded-tr-sm" : "bg-muted/60 text-foreground rounded-tl-sm border border-border/50"}`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-medium mb-2">Ask about affordable healthcare</h3>
                <p className="text-sm text-muted-foreground max-w-xs">Get answers about costs, insurance, payment plans, and where to find affordable care near you.</p>
              </div>
            )}
            {isSending && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="bg-muted/60 border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1.5">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 0 && !isLoading && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button key={prompt} onClick={() => handleSend(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-colors text-left">
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="p-4 border-t border-border">
            <div className="flex gap-2 items-end">
              <Textarea
                placeholder="Ask about affordable healthcare, costs, insurance..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 resize-none min-h-[44px] max-h-32"
                rows={1}
              />
              <Button onClick={() => handleSend()} disabled={!message.trim() || isSending} className="h-11 w-11 p-0 flex-shrink-0">
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">AI responses are for informational purposes only — not medical advice</p>
          </div>
        </div>
      </div>
    </div>
  );
}
