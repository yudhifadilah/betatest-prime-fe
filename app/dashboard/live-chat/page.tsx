"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Send, Search, User } from "lucide-react";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LiveChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const filteredRooms = rooms.filter((room) => {
    const keyword = search.toLowerCase();

    return (
      room.buyerName?.toLowerCase().includes(keyword) ||
      room.orderId?.toLowerCase().includes(keyword) ||
      room.service?.toLowerCase().includes(keyword)
    );
  });

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);

      const token = getToken();

      const response = await fetch(`${API_URL}/api/chat/rooms`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil room chat");
      }

      setRooms(result.data || []);
    } catch (error) {
      console.error("GET ROOMS ERROR:", error);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMessages = async (roomId: number) => {
    try {
      const response = await fetch(
        `${API_URL}/api/chat/rooms/${roomId}/messages`,
        {
          method: "GET",
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

      setMessages(result.data || []);
    } catch (error) {
      console.error("GET CHAT MESSAGES ERROR:", error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!selectedRoom) {
      alert("Pilih room chat terlebih dahulu");
      return;
    }

    if (!message.trim()) {
      alert("Pesan tidak boleh kosong");
      return;
    }

    try {
      setLoadingSend(true);

      const token = getToken();

      const response = await fetch(`${API_URL}/api/chat/admin/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          senderName: "Admin",
          message: message.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengirim pesan");
      }

      setMessage("");
      await fetchMessages(selectedRoom.id);
      await fetchRooms();
    } catch (error) {
      console.error("SEND ADMIN MESSAGE ERROR:", error);

      alert(
        error instanceof Error ? error.message : "Gagal mengirim pesan"
      );
    } finally {
      setLoadingSend(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (!selectedRoom?.id) return;

    fetchMessages(selectedRoom.id);

    const interval = setInterval(() => {
      fetchMessages(selectedRoom.id);
      fetchRooms();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedRoom?.id]);

  return (
    <main className="min-h-screen bg-neutral-100 p-5 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black">Live Chat</h1>
        <p className="mt-2 text-neutral-500">
          Balas chat customer secara realtime
        </p>
      </div>

      <div className="grid h-[82vh] overflow-hidden rounded-[36px] border border-neutral-200 bg-white shadow-xl md:grid-cols-[350px_1fr]">
        <div className="border-r border-neutral-200">
          <div className="border-b border-neutral-200 p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 px-4 py-3">
              <Search size={18} className="text-neutral-400" />

              <input
                type="text"
                placeholder="Cari customer / order..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-black outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="h-[calc(82vh-90px)] overflow-y-auto">
            {loadingRooms ? (
              <div className="p-5 text-sm text-neutral-500">
                Loading rooms...
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="flex h-full items-center justify-center text-neutral-400">
                Belum ada chat
              </div>
            ) : (
              filteredRooms.map((room) => {
                const active = selectedRoom?.id === room.id;

                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      setSelectedRoom(room);
                      fetchMessages(room.id);
                    }}
                    className={`flex w-full items-center gap-4 border-b border-neutral-100 p-5 text-left transition ${
                      active ? "bg-black text-white" : "hover:bg-neutral-50"
                    }`}
                  >
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                        active ? "bg-white/10" : "bg-neutral-100"
                      }`}
                    >
                      <User
                        size={24}
                        className={active ? "text-white" : "text-neutral-700"}
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold">
                        {room.buyerName || "Customer"}
                      </h3>

                      <p
                        className={`text-sm ${
                          active ? "text-neutral-300" : "text-neutral-500"
                        }`}
                      >
                        Order: {room.orderId || "No Order"}
                      </p>

                      <p
                        className={`mt-1 text-xs ${
                          active ? "text-neutral-400" : "text-neutral-400"
                        }`}
                      >
                        Service: {room.service || "-"}
                      </p>
                    </div>

                    <MessageCircle size={20} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex h-full flex-col">
          {!selectedRoom ? (
            <div className="flex h-full flex-col items-center justify-center text-neutral-400">
              <MessageCircle size={70} className="mb-5 opacity-30" />
              <p className="text-xl font-semibold">Pilih Room Chat</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-neutral-200 p-5">
                <div>
                  <h2 className="text-xl font-bold text-black">
                    {selectedRoom.buyerName || "Customer"}
                  </h2>

                  <p className="text-sm text-neutral-500">
                    Order ID: {selectedRoom.orderId || "No Order"}
                  </p>
                </div>

                <div className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                  Online
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-neutral-50 p-5">
                {messages.length === 0 ? (
                  <div className="text-center text-neutral-400">
                    Belum ada pesan
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`mb-4 flex ${
                        msg.senderType === "buyer"
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-[28px] px-5 py-4 shadow-sm ${
                          msg.senderType === "buyer"
                            ? "bg-white text-black"
                            : "bg-black text-white"
                        }`}
                      >
                        <p className="mb-1 text-xs opacity-60">
                          {msg.senderName}
                        </p>
                        <p className="break-words">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-neutral-200 bg-white p-5">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Tulis balasan..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendMessage();
                      }
                    }}
                    className="flex-1 rounded-2xl border border-neutral-200 px-5 py-4 text-black outline-none focus:border-black"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={loadingSend}
                    className="flex items-center justify-center rounded-2xl bg-black px-8 text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    <Send size={22} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}