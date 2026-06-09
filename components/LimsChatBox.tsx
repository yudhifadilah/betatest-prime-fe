"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Headphones, Sparkles } from "lucide-react";

type ChatRoom = {
  id: number;
  orderId?: string;
  buyerName?: string;
  service?: string;
};

type ChatMessage = {
  id: number;
  roomId: number;
  senderName: string;
  senderType: "buyer" | "admin" | "staff";
  message: string;
  createdAt?: string;
};

type LimsChatBoxProps = {
  API_URL: string;
  orderId?: string;
  buyerName: string;
};

export default function LimsChatBox({
  API_URL,
  orderId,
  buyerName,
}: LimsChatBoxProps) {
  const [showChat, setShowChat] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const createChatRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/rooms`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          orderId,
          buyerName: buyerName || "Buyer",
          service: "lims",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat room chat");
      }

      setChatRoom(result.data);
      await getChatMessages(result.data.id);
    } catch (error) {
      console.error("CREATE CHAT ROOM ERROR:", error);
      alert(error instanceof Error ? error.message : "Gagal membuat room chat");
    }
  };

  const getChatMessages = async (roomId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/api/chat/rooms/${roomId}/messages`,
        {
          method: "GET",
          mode: "cors",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil pesan");
      }

      setChatMessages(result.data || []);
    } catch (error) {
      console.error("GET CHAT MESSAGES ERROR:", error);
    }
  };

  const sendBuyerMessage = async () => {
    if (!chatRoom) {
      alert("Room chat belum dibuat");
      return;
    }

    if (!chatInput.trim()) {
      alert("Pesan tidak boleh kosong");
      return;
    }

    try {
      setLoadingChat(true);

      const response = await fetch(`${API_URL}/api/chat/buyer/send`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          roomId: chatRoom.id,
          senderName: buyerName || "Buyer",
          message: chatInput.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengirim pesan");
      }

      setChatInput("");
      await getChatMessages(chatRoom.id);
    } catch (error) {
      console.error("SEND CHAT ERROR:", error);
      alert(error instanceof Error ? error.message : "Gagal mengirim pesan");
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    if (!chatRoom?.id) return;

    const interval = setInterval(() => {
      getChatMessages(chatRoom.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [chatRoom?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, showChat]);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 rounded-full border border-cyan-400/30 bg-cyan-500 px-6 py-4 text-sm font-extrabold text-[#07111f] shadow-2xl shadow-cyan-500/30 transition hover:scale-105 hover:bg-cyan-400"
      >
        <MessageCircle size={22} />
        Chat Admin
      </button>

      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/60 p-4 backdrop-blur-md md:p-6">
          <div className="relative flex h-[620px] w-full max-w-md flex-col overflow-hidden rounded-[32px] border border-cyan-500/20 bg-[#07111f] text-white shadow-2xl shadow-cyan-500/20">
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_10%,rgba(6,182,212,0.18),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(37,99,235,0.20),transparent_34%),radial-gradient(circle_at_70%_90%,rgba(6,182,212,0.12),transparent_35%)]" />

            <div className="relative z-10 flex items-center justify-between border-b border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-white">
                  <Headphones size={22} className="text-cyan-400" />
                  Chat dengan Admin
                </h2>

                <p className="mt-1 text-xs text-gray-400">
                  Order:{" "}
                  <span className="font-semibold text-cyan-300">
                    {orderId || "Belum ada order"}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowChat(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-gray-300 transition hover:bg-cyan-500/10 hover:text-cyan-300"
              >
                <X size={20} />
              </button>
            </div>

            {!chatRoom ? (
              <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-cyan-400/20 bg-cyan-500/10 text-cyan-400 shadow-xl shadow-cyan-500/10">
                  <MessageCircle size={42} />
                </div>

                <h3 className="mt-5 text-xl font-extrabold text-white">
                  Mulai Chat dengan Admin
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-gray-400">
                  Gunakan chat untuk menanyakan progress order limited item.
                </p>

                <button
                  type="button"
                  onClick={createChatRoom}
                  className="mt-6 flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-4 text-sm font-extrabold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400"
                >
                  <Sparkles size={18} />
                  Mulai Chat
                </button>
              </div>
            ) : (
              <>
                <div className="relative z-10 flex-1 space-y-3 overflow-y-auto bg-[#07111f]/40 p-4">
                  {chatMessages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center">
                      <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-gray-400">
                        Belum ada pesan.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isBuyer = msg.senderType === "buyer";

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
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

                            <p className="mt-1 leading-6">{msg.message}</p>
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
                      placeholder="Tulis pesan..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          sendBuyerMessage();
                        }
                      }}
                      className="flex-1 rounded-2xl border border-white/10 bg-[#0b1627]/90 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                    />

                    <button
                      type="button"
                      onClick={sendBuyerMessage}
                      disabled={loadingChat}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500 text-[#07111f] shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:opacity-50"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}