"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MessageCircle,
  Send,
  Lock,
  X,
  Headphones,
  Sparkles,
} from "lucide-react";
import { ChatMessage, ChatRoom, CreatedOrder } from "@/app/types/lims";

type Props = {
  createdOrder?: CreatedOrder | null;
  chatRoom: ChatRoom | null;
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (value: string) => void;
  showChat: boolean;
  setShowChat: (value: boolean) => void;
  loadingChat: boolean;
  onSend: () => void;
};

export default function LimsChat({
  createdOrder,
  chatRoom,
  chatMessages,
  chatInput,
  setChatInput,
  showChat,
  setShowChat,
  loadingChat,
  onSend,
}: Props) {
  const [savedMessages, setSavedMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const storageKey = useMemo(() => {
    return `lims_chat_${createdOrder?.orderId || chatRoom?.id || "pre_order"}`;
  }, [createdOrder?.orderId, chatRoom?.id]);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      try {
        setSavedMessages(JSON.parse(saved));
      } catch {
        setSavedMessages([]);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(chatMessages));
      setSavedMessages(chatMessages);
    }
  }, [chatMessages, storageKey]);

  const displayMessages =
    chatMessages.length > 0 ? chatMessages : savedMessages;

  const hasBuyerMessage = displayMessages.some(
    (msg) => msg.senderType === "buyer"
  );

  const hasAdminReply = displayMessages.some(
    (msg) => msg.senderType === "admin" || msg.senderType === "staff"
  );

  const roomStatus = String(
    (chatRoom as ChatRoom & { status?: string })?.status || ""
  );

  const adminAccepted =
    roomStatus === "accepted" ||
    roomStatus === "active" ||
    roomStatus === "approved" ||
    hasAdminReply;

  const canSendMessage = !hasBuyerMessage || adminAccepted;

  const handleSend = () => {
    if (!canSendMessage) {
      alert("Pesan pertama sudah terkirim. Tunggu admin menerima live chat.");
      return;
    }

    onSend();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [displayMessages.length, showChat]);

  return (
    <>
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500 text-[#07111f] shadow-2xl shadow-cyan-500/30 transition hover:scale-105 hover:bg-cyan-400"
      >
        <MessageCircle size={28} />
      </button>

      {showChat && (
        <div className="fixed bottom-28 right-6 z-50 w-[390px] max-w-[92vw] overflow-hidden rounded-[32px] border border-cyan-500/20 bg-[#07111f] text-white shadow-2xl shadow-cyan-500/20">
          <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_10%,rgba(6,182,212,0.18),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(37,99,235,0.20),transparent_34%),radial-gradient(circle_at_70%_90%,rgba(6,182,212,0.12),transparent_35%)]" />

          <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-md">
            <div>
              <h3 className="flex items-center gap-2 text-base font-extrabold text-white">
                <Headphones size={20} className="text-cyan-400" />
                Live Chat Admin
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                {createdOrder?.orderId ? (
                  <>
                    Order:{" "}
                    <span className="font-semibold text-cyan-300">
                      {createdOrder.orderId}
                    </span>
                  </>
                ) : (
                  "Konsultasi sebelum order"
                )}
              </p>
            </div>

            <button
              onClick={() => setShowChat(false)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-gray-300 transition hover:bg-cyan-500/10 hover:text-cyan-300"
            >
              <X size={20} />
            </button>
          </div>

          {!canSendMessage && (
            <div className="relative z-10 flex items-center gap-2 border-b border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-300">
              <Lock size={16} />
              Pesan sudah terkirim. Tunggu admin menerima live chat.
            </div>
          )}

          <div className="relative z-10 h-[350px] overflow-y-auto bg-[#07111f]/40 p-4">
            {displayMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-cyan-400/20 bg-cyan-500/10 text-cyan-400">
                  <Sparkles size={32} />
                </div>

                <p className="mt-4 max-w-xs text-sm leading-6 text-gray-400">
                  Silakan kirim 1 pesan awal ke admin.
                </p>
              </div>
            ) : (
              displayMessages.map((msg) => {
                const isBuyer = msg.senderType === "buyer";

                return (
                  <div
                    key={msg.id}
                    className={`mb-3 flex ${
                      isBuyer ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-[24px] px-4 py-3 text-sm shadow-lg ${
                        isBuyer
                          ? "bg-cyan-500 text-[#07111f] shadow-cyan-500/20"
                          : "border border-white/10 bg-white/[0.06] text-white"
                      }`}
                    >
                      <p
                        className={`text-[11px] font-semibold ${
                          isBuyer ? "text-[#07111f]/70" : "text-cyan-300"
                        }`}
                      >
                        {msg.senderName}
                      </p>

                      <p className="mt-1 break-words leading-6">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="relative z-10 border-t border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder={
                  canSendMessage
                    ? "Tulis pesan..."
                    : "Menunggu admin menerima chat..."
                }
                value={chatInput}
                disabled={!canSendMessage || loadingChat}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                className="flex-1 rounded-2xl border border-white/10 bg-[#0b1627]/90 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 disabled:bg-white/5 disabled:text-gray-500"
              />

              <button
                onClick={handleSend}
                disabled={loadingChat || !canSendMessage}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-[#07111f] shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}