"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  MessageCircle,
  Send,
  Search,
  User,
  RefreshCw,
  Headphones,
  Clock3,
  AlertCircle,
} from "lucide-react";

type ChatRoom = {
  id: number;
  orderId?: string;
  buyerName?: string;
  service?: string;
  status?: "waiting" | "accepted" | "closed" | string;
  isAccepted?: boolean;
  acceptedBy?: number | null;
  acceptedAt?: string | null;
};

type ChatMessage = {
  id: number;
  roomId: number;
  senderName: string;
  senderType: "buyer" | "admin" | "staff";
  message: string;
  createdAt?: string;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(
  /\/+$/,
  ""
);

export default function LiveChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingSend, setLoadingSend] = useState(false);
  const [accepting, setAccepting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const safeJson = async (response: Response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error("Response server bukan JSON");
    }
  };

  const mapRoomStatus = (room: ChatRoom): ChatRoom => {
    return {
      ...room,
      status: room.isAccepted === true ? "accepted" : room.status || "waiting",
    };
  };

  const isRoomAccepted = (room?: ChatRoom | null) => {
    if (!room) return false;

    return Boolean(
      room.isAccepted === true ||
        room.status === "accepted" ||
        room.acceptedBy ||
        room.acceptedAt
    );
  };

  const filteredRooms = useMemo(() => {
    const keyword = search.toLowerCase();

    return rooms.filter((room) => {
      return (
        String(room.buyerName || "").toLowerCase().includes(keyword) ||
        String(room.orderId || "").toLowerCase().includes(keyword) ||
        String(room.service || "").toLowerCase().includes(keyword) ||
        String(room.status || "").toLowerCase().includes(keyword)
      );
    });
  }, [rooms, search]);

  const totalWaiting = rooms.filter((room) => !isRoomAccepted(room)).length;
  const totalAccepted = rooms.filter((room) => isRoomAccepted(room)).length;

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

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil room chat");
      }

      const mappedRooms = Array.isArray(result.data)
        ? result.data.map((room: ChatRoom) => mapRoomStatus(room))
        : [];

      setRooms(mappedRooms);

      setSelectedRoom((prev) => {
        if (!prev) return prev;
        return mappedRooms.find((room: ChatRoom) => room.id === prev.id) || prev;
      });
    } catch (error) {
      console.error("GET ROOMS ERROR:", error);
      setRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMessages = async (roomId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/chat/rooms/${roomId}/messages`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil pesan");
      }

      setMessages(Array.isArray(result.data) ? result.data : []);

      if (result.room) {
        const mappedRoom = mapRoomStatus(result.room);

        setSelectedRoom(mappedRoom);

        setRooms((prev) =>
          prev.map((room) => (room.id === mappedRoom.id ? mappedRoom : room))
        );
      }
    } catch (error) {
      console.error("GET CHAT MESSAGES ERROR:", error);
      setMessages([]);
    }
  };

  const acceptRoom = async () => {
    if (!selectedRoom) {
      alert("Pilih room chat terlebih dahulu");
      return;
    }

    try {
      setAccepting(true);

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/chat/rooms/${selectedRoom.id}/accept`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal menerima chat");
      }

      const mappedRoom = mapRoomStatus({
        ...result.data,
        isAccepted: true,
        status: "accepted",
      });

      setSelectedRoom(mappedRoom);

      setRooms((prev) =>
        prev.map((room) => (room.id === mappedRoom.id ? mappedRoom : room))
      );

      await fetchMessages(selectedRoom.id);
      await fetchRooms();
    } catch (error) {
      console.error("ACCEPT CHAT ROOM ERROR:", error);
      alert(error instanceof Error ? error.message : "Gagal menerima chat");
    } finally {
      setAccepting(false);
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

    if (!isRoomAccepted(selectedRoom)) {
      alert("Terima chat terlebih dahulu sebelum membalas");
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

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengirim pesan");
      }

      setMessage("");
      await fetchMessages(selectedRoom.id);
      await fetchRooms();
    } catch (error) {
      console.error("SEND ADMIN MESSAGE ERROR:", error);
      alert(error instanceof Error ? error.message : "Gagal mengirim pesan");
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length, selectedRoom?.id]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] px-5 pb-10 pt-24 text-white md:px-8 md:pt-8">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#07111f]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(37,99,235,0.20),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(37,99,235,0.14),transparent_34%)]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-[34px] border border-cyan-500/20 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-md md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.18),transparent_35%)]" />

          <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300">
                <Headphones size={18} />
                Live Chat Management
              </div>

              <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">
                Live Chat Admin
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
                Pantau room chat customer secara realtime, terima chat masuk,
                dan balas pesan customer dengan tampilan PrimeBlox modern.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchRooms}
              disabled={loadingRooms}
              className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-4 text-sm font-extrabold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              <RefreshCw size={20} className={loadingRooms ? "animate-spin" : ""} />
              {loadingRooms ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Room"
            value={rooms.length}
            subtitle="Semua room chat"
            icon={<MessageCircle size={24} />}
          />

          <StatCard
            title="Menunggu"
            value={totalWaiting}
            subtitle="Belum diterima"
            icon={<Clock3 size={24} />}
          />

          <StatCard
            title="Diterima"
            value={totalAccepted}
            subtitle="Chat aktif"
            icon={<CheckCircle2 size={24} />}
          />

          <StatCard
            title="Customer"
            value={filteredRooms.length}
            subtitle="Hasil pencarian"
            icon={<User size={24} />}
          />
        </section>

        <section className="grid h-[78vh] min-h-[640px] overflow-hidden rounded-[36px] border border-cyan-500/20 bg-white/[0.04] shadow-2xl shadow-cyan-500/10 backdrop-blur-md md:grid-cols-[360px_1fr]">
          <aside className="flex min-h-0 flex-col border-b border-white/10 md:border-b-0 md:border-r md:border-white/10">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1627]/80 px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-400/10">
                <Search size={18} className="text-cyan-400" />

                <input
                  type="text"
                  placeholder="Cari customer / order..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {loadingRooms ? (
                <div className="p-5 text-sm text-gray-400">Loading rooms...</div>
              ) : filteredRooms.length === 0 ? (
                <EmptyState text="Belum ada chat" compact />
              ) : (
                filteredRooms.map((room) => {
                  const active = selectedRoom?.id === room.id;
                  const accepted = isRoomAccepted(room);

                  return (
                    <button
                      key={room.id}
                      onClick={() => {
                        const mappedRoom = mapRoomStatus(room);
                        setSelectedRoom(mappedRoom);
                        fetchMessages(room.id);
                      }}
                      className={`group flex w-full items-center gap-4 border-b border-white/10 p-5 text-left transition ${
                        active ? "bg-cyan-500/10" : "hover:bg-cyan-500/5"
                      }`}
                    >
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${
                          active
                            ? "border-cyan-400/30 bg-cyan-500/15 text-cyan-300"
                            : "border-white/10 bg-white/[0.04] text-gray-300 group-hover:text-cyan-300"
                        }`}
                      >
                        <User size={24} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-extrabold text-white">
                          {room.buyerName || "Customer"}
                        </h3>

                        <p className="mt-1 truncate text-sm text-gray-400">
                          Order: {room.orderId || "No Order"}
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-500">
                          Service: {room.service || "-"}
                        </p>

                        <div
                          className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${
                            accepted
                              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                              : "border-yellow-400/20 bg-yellow-500/10 text-yellow-300"
                          }`}
                        >
                          {accepted ? "Diterima" : "Menunggu"}
                        </div>
                      </div>

                      <MessageCircle
                        size={20}
                        className={active ? "text-cyan-300" : "text-gray-500"}
                      />
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <div className="flex min-h-0 flex-col">
            {!selectedRoom ? (
              <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[30px] border border-cyan-400/20 bg-cyan-500/10 text-cyan-400">
                  <MessageCircle size={50} />
                </div>

                <h2 className="mt-6 text-2xl font-black text-white">
                  Pilih Room Chat
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-400">
                  Pilih salah satu room customer di sebelah kiri untuk melihat
                  pesan dan membalas chat.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-black text-white">
                      {selectedRoom.buyerName || "Customer"}
                    </h2>

                    <p className="mt-1 truncate text-sm text-gray-400">
                      Order ID: {selectedRoom.orderId || "No Order"}
                    </p>

                    <p className="mt-1 truncate text-xs text-gray-500">
                      Service: {selectedRoom.service || "-"}
                    </p>
                  </div>

                  {isRoomAccepted(selectedRoom) ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300">
                      <CheckCircle2 size={18} />
                      Diterima
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={acceptRoom}
                      disabled={accepting}
                      className="flex shrink-0 items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-500/10 px-4 py-2 text-sm font-bold text-yellow-300 transition hover:bg-yellow-500/20 disabled:opacity-50"
                    >
                      <CheckCircle2 size={18} />
                      {accepting ? "Menerima..." : "Terima Chat"}
                    </button>
                  )}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto bg-[#07111f]/50 p-5">
                  {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center">
                      <p className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-gray-400">
                        Belum ada pesan
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isBuyer = msg.senderType === "buyer";

                      return (
                        <div
                          key={msg.id}
                          className={`mb-4 flex ${
                            isBuyer ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-[26px] px-5 py-4 shadow-lg ${
                              isBuyer
                                ? "border border-white/10 bg-white/[0.06] text-white"
                                : "bg-cyan-500 text-[#07111f] shadow-cyan-500/20"
                            }`}
                          >
                            <p
                              className={`mb-1 text-xs font-bold ${
                                isBuyer ? "text-cyan-300" : "text-[#07111f]/70"
                              }`}
                            >
                              {msg.senderName}
                            </p>

                            <p className="break-words text-sm leading-6">
                              {msg.message}
                            </p>

                            {msg.createdAt && (
                              <p
                                className={`mt-2 text-[10px] ${
                                  isBuyer
                                    ? "text-gray-500"
                                    : "text-[#07111f]/60"
                                }`}
                              >
                                {new Date(msg.createdAt).toLocaleString("id-ID")}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-white/10 bg-white/[0.03] p-5 backdrop-blur-md">
                  {!isRoomAccepted(selectedRoom) && (
                    <div className="mb-3 flex items-start gap-2 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                      Terima chat terlebih dahulu sebelum membalas pesan.
                    </div>
                  )}

                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder={
                        isRoomAccepted(selectedRoom)
                          ? "Tulis balasan..."
                          : "Terima chat terlebih dahulu..."
                      }
                      disabled={!isRoomAccepted(selectedRoom) || loadingSend}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          sendMessage();
                        }
                      }}
                      className="flex-1 rounded-2xl border border-white/10 bg-[#0b1627]/90 px-5 py-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 disabled:cursor-not-allowed disabled:bg-white/5 disabled:text-gray-500"
                    />

                    <button
                      onClick={sendMessage}
                      disabled={loadingSend || !isRoomAccepted(selectedRoom)}
                      className="flex items-center justify-center rounded-2xl bg-cyan-500 px-6 text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send size={22} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-[28px] border border-cyan-500/20 bg-white/[0.04] p-5 shadow-xl shadow-cyan-500/5 backdrop-blur-md transition hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-500/5">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400 transition group-hover:bg-cyan-500 group-hover:text-[#07111f]">
        {icon}
      </div>

      <p className="mt-5 text-sm font-bold text-gray-400">{title}</p>
      <h2 className="mt-2 text-3xl font-black text-white">{value}</h2>
      <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function EmptyState({
  text,
  compact = false,
}: {
  text: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[30px] border border-dashed border-white/10 bg-white/[0.04] p-8 text-center ${
        compact ? "min-h-[300px]" : "min-h-[260px]"
      }`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-cyan-400/20 bg-cyan-500/10">
        <AlertCircle size={30} className="text-cyan-400" />
      </div>

      <h3 className="mt-5 text-lg font-black text-white">Tidak Ada Data</h3>

      <p className="mt-2 max-w-sm text-sm text-gray-400">{text}</p>
    </div>
  );
}
