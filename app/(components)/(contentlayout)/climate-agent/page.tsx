"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useConnectedAddress } from '../useConnectedAddress';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ClimateAgent = () => {
  const { address, shortAddress } = useConnectedAddress();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoTransactions, setAutoTransactions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Welcome to Climate Agent! 🌱\n\nHow can I help you today?\n\n${address ? '' : 'Please ensure to connect your wallet to get started.'}`,
        timestamp: new Date()
      }]);
    }
  }, [address, shortAddress]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Add system context about the dApp
      const systemContext = `You are Climate Agent, an AI assistant for a carbon credit and climate action dApp called Bitgrass. 
      
The dApp features:
- Portfolio tracking for carbon credits and NFTs
- Carbon credit marketplace
- NFT collections (OwnPlot) representing land parcels
- Leaderboard for top contributors
- Staking for rewards
- Calculator for carbon footprint
- Swap functionality for tokens

${address ? `The user's wallet address is ${address} on Base network (Chain ID: 8453).` : 'The user has not connected their wallet yet.'}
${autoTransactions ? 'Auto-transactions are ENABLED. You can execute blockchain transactions automatically when requested.' : 'Auto-transactions are DISABLED. You can only provide information and guidance.'}

Be helpful, concise, and focus on climate action and blockchain technology.`;

      console.log('Sending request to thirdweb AI...');
      const startTime = Date.now();

      // Call thirdweb AI API
      const response = await fetch('https://api.thirdweb.com/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '',
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemContext },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: input }
          ],
          walletAddress: address || undefined,
          chainIds: [8453],
        }),
      });

      const responseTime = Date.now() - startTime;
      console.log(`Response received in ${responseTime}ms`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API error:', response.status, errorText);
        throw new Error(`Failed to get response from AI: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI response data:', data);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || data.content || data.choices?.[0]?.message?.content || 'Sorry, I could not process that request.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error calling AI:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedPrompts = address ? [
    "What's my wallet balance on Base?",
    "Show me my NFTs",
    "What tokens do I own?",
    "Explain how carbon credits work"
  ] : [
    "What is Bitgrass?",
    "How do carbon credits work?",
    "What can I do on this dApp?",
    "Tell me about OwnPlot NFTs"
  ];

  return (
    <div className="mt-6 flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-3xl">
        {/* Header - Centered */}
        <div className="flex flex-col items-center justify-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center shadow-sm">
            <i className="bx bx-bot text-4xl text-secondary"></i>
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-semibold text-default">Climate Agent</h1>
            <p className="text-sm text-textmuted">AI-Agent powered by Bitgrass</p>
          </div>
          {address && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-lg text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
              {shortAddress}
            </div>
          )}
        </div>

        {/* AI Welcome Message with Suggested Prompts - All in One Box */}
        {messages.length <= 1 && (
          <div className="flex justify-center mb-8">
            <div className="flex gap-3 max-w-[700px] w-full">
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-secondary/20  flex items-center justify-center">
                <i className="bx bx-bot text-base text-secondary"></i>
              </div>
              <div className="flex-1">
                <div className="p-4 rounded-xl bg-white dark:bg-bodybg">
                  <div className="text-sm leading-relaxed text-default mb-2">
                    Welcome to Climate Agent! 🌱
                  </div>
                  <div className="text-sm leading-relaxed text-textmuted mb-3">
                    How can I help you today?
                  </div>
                  {!address && (
                    <div className="text-xs text-warning mb-4">
                      Please ensure to connect your wallet to get started.
                    </div>
                  )}
                  
                  {/* Suggested Prompts Inside Message */}
                  <div className="space-y-2 mt-4 pt-3">
                    {suggestedPrompts.map((prompt, index) => (
                      <button 
                        key={index} 
                        onClick={() => setInput(prompt)} 
                        className="w-full text-left px-3 py-2 text-xs font-medium bg-secondary/5 hover:bg-secondary/15 text-secondary rounded-lg transition-all duration-200"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.length > 1 && (
          <div className="mb-6 space-y-4 max-h-[400px] overflow-y-auto p-4 bg-white dark:bg-bodybg rounded-2xl">
            {messages.slice(1).map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-primary/20 to-primary/10' 
                      : 'bg-gradient-to-br from-secondary/20 to-secondary/10'
                  }`}>
                    <i className={`text-base ${
                      message.role === 'user' 
                        ? 'bx bx-user text-primary' 
                        : 'bx bx-bot text-secondary'
                    }`}></i>
                  </div>
                  
                  <div className={`flex flex-col gap-1 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-xl ${
                      message.role === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-light dark:bg-bodybg'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                    </div>
                    <div className="text-xs text-textmuted px-2">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center">
                    <i className="bx bx-bot text-base text-secondary"></i>
                  </div>
                  <div className="bg-light dark:bg-bodybg p-4 rounded-xl">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Field */}
        <div className="w-full space-y-3">
          {/* Auto-Transaction Toggle */}
          {address && (
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-bodybg rounded-lg">
              <input
                type="checkbox"
                id="autoTransactions"
                checked={autoTransactions}
                onChange={(e) => setAutoTransactions(e.target.checked)}
                className="w-4 h-4 text-secondary bg-white  rounded-sm focus:ring-2 focus:ring-secondary cursor-pointer"
              />
              <label htmlFor="autoTransactions" className="text-sm text-default cursor-pointer select-none">
                Enable Auto-Transactions
              </label>
              <div className="group relative">
                <i className="bx bx-info-circle text-textmuted text-sm cursor-help"></i>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-default text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Allow AI to execute transactions automatically
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-white dark:bg-bodybg border-none rounded-xl p-3">
            <div className="flex gap-2 items-stretch">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your wallet, NFTs, or carbon credits..."
                className="flex-1 p-3 border-none rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-secondary bg-camel transition-all text-sm placeholder:text-textmuted/60 min-h-[44px]"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 h-[44px] bg-secondary text-white rounded-md hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <i className="ri-loader-4-line animate-spin text-base"></i>
                ) : (
                  <i className="ri-send-plane-fill text-base"></i>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClimateAgent;