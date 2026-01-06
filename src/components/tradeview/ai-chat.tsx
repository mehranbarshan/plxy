
'use client';
import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Bot, User, Loader2, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { getMarketInsights } from '@/ai/flows/market-insights';
import type { ChatMessage } from '@/lib/types';
import { getChatHistory, addChatMessage } from '@/services/chatService';

// MOCK: In a real app, you would get this from your auth context
const MOCK_USERid = "user_12345";
const HISTORY_STORAGE_KEY = 'tradeview_signal_history';


const AssistantMessage = ({ content, time }: { content: string, time: string }) => (
    <div className="flex items-end gap-2">
        <div className="bg-secondary p-3 rounded-2xl rounded-bl-none max-w-[80%]">
            <p className="text-sm whitespace-pre-wrap">{content}</p>
            <p className="text-xs text-muted-foreground text-right mt-1">{time}</p>
        </div>
    </div>
);

const UserMessage = ({ content, time }: { content: string, time: string }) => (
    <div className="flex items-end gap-2 justify-end">
        <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-br-none max-w-[80%]">
            <p className="text-sm whitespace-pre-wrap">{content}</p>
            <p className="text-xs text-primary-foreground/80 text-right mt-1">{time}</p>
        </div>
    </div>
);

const QuickActionButton = ({ text, onClick }: { text: string, onClick: (text: string) => void }) => (
    <Button variant="outline" size="sm" className="h-auto py-1.5 px-3 text-xs whitespace-nowrap" onClick={() => onClick(text)}>
        {text}
    </Button>
);

export default function AIChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [firestore, setFirestore] = useState<any>(null); // MOCK: should be Firestore instance

     // MOCK: This simulates getting the firestore instance.
    useEffect(() => {
        // In a real app, you'd get this from a Firebase context provider
        // e.g., const { firestore } = useFirebase();
        // For now, we use a placeholder.
        const mockDb = {}; // Placeholder
        setFirestore(mockDb);

        if (mockDb && Object.keys(mockDb).length > 0) {
             const unsubscribe = getChatHistory(mockDb as any, MOCK_USERid, (loadedMessages) => {
                if (loadedMessages.length === 0) {
                    // If no history, add the initial greeting
                    const initialMessage: ChatMessage = {
                        id: 'initial-greeting',
                        role: 'assistant',
                        content: "Hello! I'm your AI trading assistant. Ask me for market analysis, information on a specific crypto, or insights on your trading patterns.",
                        timestamp: Date.now()
                    };
                    setMessages([initialMessage]);
                } else {
                    setMessages(loadedMessages);
                }
            });
            return () => unsubscribe();
        } else {
            // No firestore instance, set initial message.
            const initialMessage: ChatMessage = {
                id: 'initial-greeting',
                role: 'assistant',
                content: "Hello! I'm your AI trading assistant. Ask me for market analysis, information on a specific crypto, or insights on your trading patterns.",
                timestamp: Date.now()
            };
            setMessages([initialMessage]);
        }
    }, []);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim()) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: messageText,
            timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        if (firestore && Object.keys(firestore).length > 0) {
            addChatMessage(firestore as any, MOCK_USERid, userMessage);
        }
        
        setInput('');
        setIsLoading(true);

        try {
             // Prepare context for the AI flow
            const chatHistoryString = messages
                .slice(-5) // Get last 5 messages for context
                .map(m => `${m.role}: ${m.content}`)
                .join('\n');

            let flowInput: any = { 
                cryptocurrency: messageText,
                chatHistory: chatHistoryString
            };

            // If user's query is about their trades, add trade history to context
            if (messageText.toLowerCase().includes('trade') || messageText.toLowerCase().includes('analyze')) {
                const tradeHistory = localStorage.getItem(HISTORY_STORAGE_KEY) || '[]';
                flowInput.tradeHistoryJson = tradeHistory;
            }
            
            const result = await getMarketInsights(flowInput);
            
            let assistantContent = result?.response || "I couldn't process that request. Please try again.";

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: assistantContent,
                timestamp: Date.now()
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            if (firestore && Object.keys(firestore).length > 0) {
                addChatMessage(firestore as any, MOCK_USERid, assistantMessage);
            }

        } catch (error) {
            console.error("AI chat error:", error);
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Sorry, I ran into an error. Please try again.',
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
            if (firestore && Object.keys(firestore).length > 0) {
                 addChatMessage(firestore as any, MOCK_USERid, errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(input);
    }
    
    const formatTimestamp = (timestamp: number) => {
        if (!timestamp) return '';
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const quickActions = [
        "Analyze my recent trades",
        "What's the 24h volume for BTC?",
        "Give me a summary for Ethereum",
        "Is SOL looking bullish or bearish?"
    ];

    return (
        <div className="flex flex-col h-full">
             <ScrollArea className="flex-grow" ref={scrollAreaRef}>
                <div className="p-4 space-y-4 pb-4">
                    {messages.map((msg, index) => (
                        msg.role === 'assistant' 
                            ? <AssistantMessage key={msg.id || index} content={msg.content} time={formatTimestamp(msg.timestamp)} />
                            : <UserMessage key={msg.id || index} content={msg.content} time={formatTimestamp(msg.timestamp)} />
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2">
                             <div className="bg-secondary p-3 rounded-2xl rounded-bl-none">
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            
            <div className="p-4 pt-2">
                 <div className="space-y-4">
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex w-max space-x-2 pb-2">
                            {quickActions.map(action => <QuickActionButton key={action} text={action} onClick={handleSendMessage} />)}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    <form onSubmit={handleFormSubmit} className="relative">
                        <Input 
                            placeholder="Ask anything..."
                            className="bg-secondary border-none rounded-lg pr-12 h-12"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-foreground hover:bg-foreground/90" disabled={isLoading || !input.trim()}>
                            <Send className="w-4 h-4 text-background"/>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
