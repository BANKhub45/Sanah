import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ChatMessage } from '../../types';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Trash2, 
  RotateCcw,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export const GeminiChatModal: React.FC = () => {
  const { isChatOpen, setIsChatOpen, products, orders, settings } = useStore();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      content: 'สวัสดีค่ะ! หนูน้องสานะ ผู้ช่วยอัจฉริยะประจำร้านของฝาก "สานะกิมหยง" ตลาดกิมหยง หาดใหญ่ ยินดีให้บริการค่ะ 🥜✨\n\nสามารถสอบถามสินค้าของฝากยอดฮิต ขอคำแนะนำเซ็ตของฝากตามงบ หรือให้หนูช่วยตรวจสอบสต็อกและวิธีเก็บรักษาความอร่อยได้เลยนะคะ!',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'แนะนำของฝากยอดฮิตสำหรับผู้ใหญ่ งบ 500 บาท',
    'ถั่วพิตาชิโอ กับ เม็ดมะม่วงหิมพานต์เผา เก็บได้กี่เดือน?',
    'อยากได้ชุดชาชักหาดใหญ่ รสชาติเข้มข้น มีอะไรบ้าง?',
    'ช่วยสรุปสต็อกสินค้าที่ใกล้หมดให้หน่อยค่ะ',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [messages, isChatOpen]);

  if (!isChatOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    // Provide context summary of current store
    const contextData = {
      storeName: settings.storeName,
      freeShippingThreshold: settings.freeShippingThreshold,
      topProducts: products.slice(0, 8).map((p) => ({
        name: p.name,
        category: p.category,
        sellPrice: p.sellPrice,
        stock: p.stock,
        isBestSeller: p.isBestSeller,
      })),
      totalOrders: orders.length,
      lowStockCount: products.filter((p) => p.stock <= p.minStock).length,
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          contextData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const modelReply = data.reply || 'ขออภัยนะคะ น้องสานะไม่สามารถประมวลผลคำตอบได้ในขณะนี้';

      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          content: modelReply,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      // Helpful fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `model-${Date.now()}`,
          role: 'model',
          content:
            'ยินดีต้อนรับสู่ร้านสานะกิมหยง หาดใหญ่ค่ะ! สินค้าของฝากขึ้นชื่อของเรามีทั้ง เม็ดมะม่วงหิมพานต์เผาโบราณเตาถ่าน ถั่วพิตาชิโอเกรดพรีเมียม ชาชักปักษ์ใต้ 666 และไมโลมาเลย์แท้ 1kg คุณลูกค้าสามารถเลือกชมสินค้าในหน้าเว็บและกดสั่งซื้อเพื่อชำระเงินผ่าน PromptPay QR ได้ทันทีค่ะ!',
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'init-1',
        role: 'model',
        content: 'สวัสดีค่ะ! หนูน้องสานะ ผู้ช่วยอัจฉริยะประจำร้านของฝาก "สานะกิมหยง" ตลาดกิมหยง หาดใหญ่ ถามคำถามได้เลยนะคะ!',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative bg-white w-full max-w-xl h-[88vh] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chat Header */}
        <div className="p-4 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-200 shadow-inner">
              <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">น้องสานะ (AI ผู้ช่วยของฝาก)</h3>
                <span className="px-1.5 py-0.5 rounded bg-amber-800/80 text-[10px] font-bold text-amber-200">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-amber-100/90">
                ผู้เชี่ยวชาญของฝากตลาดกิมหยง หาดใหญ่ พร้อมตอบคำถาม & แนะนำสินค้า
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearChat}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              title="ล้างประวัติการคุย"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsChatOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages Body (Scrollable thread) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/70">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs text-xs font-bold">
                    ส
                  </div>
                )}

                <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-2xs ${
                      isUser
                        ? 'bg-amber-600 text-white rounded-tr-xs font-medium'
                        : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-xs'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {m.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin text-amber-600" />
              </div>
              <div className="bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-1.5 shadow-2xs">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-slate-500 text-xs ml-1 font-medium">น้องสานะกำลังคิด...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[11px] text-amber-800 font-bold shrink-0 ml-1">
            คำถามแนะนำ:
          </span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg whitespace-nowrap transition-colors text-[11px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="พิมพ์คำถาม หรือขอคำแนะนำของฝากกิมหยง..."
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2.5 sm:px-4 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md ${
                !input.trim() || isLoading
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 active:scale-95'
              }`}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">ส่ง</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
