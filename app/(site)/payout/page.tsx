"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  ShieldCheck,
  Clock3,
  Wallet,
  Upload,
  CheckCircle2,
  CreditCard,
  CircleDollarSign,
  QrCode,
  Landmark,
  AlertCircle,
  MessageCircle,
  Send,
  X,
} from "lucide-react";

type PayoutPackage = {
  id: number;
  namaProduk: string;
  nominalRobux: number;
  harga: number;
  isActive?: boolean;
};

type Rekening = {
  id: number;
  metodePembayaran: "BANK" | "QRIS" | string;
  namaBank?: string;
  nomorRekening?: string;
  namaPemilik?: string;
  qrisImage?: string;
  isActive?: boolean;
};

type CommunityItem = {
  id?: number;
  groupId?: string;
  groupName?: string;
  groupLink?: string;
  joinUrl?: string;
  isActive?: boolean;
  isJoined?: boolean;
  joinedDays?: number;
  isEligible14Days?: boolean;
};

type CommunityMember = {
  id?: number;
  robloxUserId?: string;
  robloxUsername?: string;
  displayName?: string;
  groupId?: string;
  groupName?: string;
  groupLink?: string;
  joinedDetectedAt?: string | null;
  lastCheckedAt?: string;
  isStillJoined?: boolean;
};

type CheckUsernameResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  isJoined?: boolean;
  isJoinedAny?: boolean;
  isEligible14Days?: boolean;
  joinedDays?: number;
  joinUrl?: string;
  user?: {
    userId?: number;
    username?: string;
    displayName?: string;
  };
  community?: CommunityItem;
  communities?: CommunityItem[];
  joinedCommunities?: CommunityItem[];
  notJoinedCommunities?: CommunityItem[];
  members?: CommunityMember[];
};

type OrderResponse = {
  message?: string;
  error?: string;
  joinUrl?: string;
  notJoinedCommunities?: CommunityItem[];
  joinedCommunities?: CommunityItem[];
  data?: {
    id?: number;
    orderId?: string;
    status?: string;
    paymentProof?: string;
  };
};

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

export default function PayoutPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [payoutPackages, setPayoutPackages] = useState<PayoutPackage[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<Rekening[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");

  const [selectedPackage, setSelectedPackage] = useState<PayoutPackage | null>(
    null,
  );

  const [form, setForm] = useState({
    robloxUsername: "",
    nomorRekening: "",
  });

  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null);

  const [createdOrder, setCreatedOrder] = useState<{
    id?: number;
    orderId?: string;
    status?: string;
  } | null>(null);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const [showChat, setShowChat] = useState(false);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameCheck, setUsernameCheck] =
    useState<CheckUsernameResponse | null>(null);

  const selectedPayment = useMemo(() => {
    return paymentMethods.find(
      (item) => String(item.id) === String(selectedPaymentId),
    );
  }, [paymentMethods, selectedPaymentId]);

  const mapChatRoom = (room?: ChatRoom | null): ChatRoom | null => {
    if (!room) return null;

    return {
      ...room,
      status: room.isAccepted === true ? "accepted" : room.status || "waiting",
    };
  };

  const isRoomAccepted = (room?: ChatRoom | null) => {
    return Boolean(
      room?.isAccepted === true ||
      room?.status === "accepted" ||
      room?.acceptedBy ||
      room?.acceptedAt,
    );
  };

  const isChatAccepted = isRoomAccepted(chatRoom);

  const hasBuyerSentFirstMessage = chatMessages.some(
    (item) => item.senderType === "buyer",
  );

  const isChatLocked = Boolean(
    chatRoom?.id && hasBuyerSentFirstMessage && !isChatAccepted,
  );

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const getFileUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;

    const cleanPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${API_URL}/${cleanPath}`;
  };

  const safeJson = async (response: Response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error("Response server bukan JSON");
    }
  };

  const getNotJoinedCommunities = () => {
    if (!usernameCheck) return [];

    if (
      usernameCheck.notJoinedCommunities &&
      usernameCheck.notJoinedCommunities.length > 0
    ) {
      return usernameCheck.notJoinedCommunities;
    }

    if (usernameCheck.communities && usernameCheck.communities.length > 0) {
      return usernameCheck.communities.filter(
        (item) => item.isJoined === false,
      );
    }

    if (usernameCheck.community && usernameCheck.community.isJoined === false) {
      return [usernameCheck.community];
    }

    if (usernameCheck.joinUrl) {
      return [
        {
          groupName: "Community Roblox",
          groupLink: usernameCheck.joinUrl,
          isJoined: false,
        },
      ];
    }

    return [];
  };

  const getJoinedCommunities = () => {
    if (!usernameCheck) return [];

    if (
      usernameCheck.joinedCommunities &&
      usernameCheck.joinedCommunities.length > 0
    ) {
      return usernameCheck.joinedCommunities;
    }

    if (usernameCheck.communities && usernameCheck.communities.length > 0) {
      return usernameCheck.communities.filter((item) => item.isJoined === true);
    }

    return [];
  };

  const getAllPayoutProducts = async () => {
    try {
      setLoadingProducts(true);

      const response = await fetch(`${API_URL}/api/payout/produk`, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil produk payout");
      }

      setPayoutPackages(result.data || []);
    } catch (error) {
      console.error("GET PAYOUT ERROR:", error);
      alert(error instanceof Error ? error.message : "Gagal mengambil produk");
    } finally {
      setLoadingProducts(false);
    }
  };

  const getPaymentMethods = async () => {
    try {
      setLoadingPayments(true);

      const response = await fetch(`${API_URL}/api/rekening`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil metode pembayaran");
      }

      const activeMethods = Array.isArray(result.data)
        ? result.data.filter((item: Rekening) => item.isActive !== false)
        : [];

      setPaymentMethods(activeMethods);

      if (!selectedPaymentId && activeMethods.length > 0) {
        setSelectedPaymentId(String(activeMethods[0].id));
      }
    } catch (error) {
      console.error("GET PAYMENT METHODS ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengambil metode pembayaran",
      );
    } finally {
      setLoadingPayments(false);
    }
  };

  const getDetailPayoutProduct = async (id: number) => {
    try {
      setLoadingDetail(true);

      const response = await fetch(`${API_URL}/api/payout/produk/${id}`, {
        method: "GET",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil detail produk");
      }

      setSelectedPackage(result.data);
      setCreatedOrder(null);
      setPaymentProof(null);
      setPaymentPreview(null);
    } catch (error) {
      console.error("GET DETAIL PAYOUT ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengambil detail produk",
      );
    } finally {
      setLoadingDetail(false);
    }
  };

  const checkRobloxUsername = async (robloxUsername: string) => {
    if (!robloxUsername || robloxUsername.trim().length < 3) {
      setUsernameCheck(null);
      return;
    }

    try {
      setCheckingUsername(true);

      const response = await fetch(`${API_URL}/api/payout/check-username`, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          robloxUsername,
        }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) : {};

      setUsernameCheck(result);
    } catch (error) {
      console.error("CHECK USERNAME ERROR:", error);
      setUsernameCheck({
        message: "Gagal mengecek username Roblox",
        isJoined: false,
        isJoinedAny: false,
        isEligible14Days: false,
      });
    } finally {
      setCheckingUsername(false);
    }
  };

  useEffect(() => {
    getAllPayoutProducts();
    getPaymentMethods();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      checkRobloxUsername(form.robloxUsername);
    }, 700);

    return () => clearTimeout(delay);
  }, [form.robloxUsername]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedRoom = localStorage.getItem("payout_chat_room");
    if (!savedRoom) return;

    try {
      const room = JSON.parse(savedRoom) as ChatRoom;
      if (!room?.id) return;

      const mappedRoom = mapChatRoom(room);
      setChatRoom(mappedRoom);

      if (mappedRoom) {
        localStorage.setItem("payout_chat_room", JSON.stringify(mappedRoom));
      }

      fetchMessages(room.id);

      const interval = setInterval(() => {
        fetchMessages(room.id);
      }, 3000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error("PARSE PAYOUT CHAT ROOM ERROR:", error);
      localStorage.removeItem("payout_chat_room");
    }
  }, []);

  const createChatRoom = async () => {
    try {
      if (typeof window !== "undefined") {
        const savedRoom = localStorage.getItem("payout_chat_room");

        if (savedRoom) {
          const parsedRoom = JSON.parse(savedRoom) as ChatRoom;

          if (parsedRoom?.id) {
            const mappedRoom = mapChatRoom(parsedRoom);
            setChatRoom(mappedRoom);

            if (mappedRoom) {
              localStorage.setItem(
                "payout_chat_room",
                JSON.stringify(mappedRoom),
              );
            }

            return mappedRoom;
          }
        }
      }

      const response = await fetch(`${API_URL}/api/chat/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          buyerName: form.robloxUsername || "Customer Payout",
          orderId: createdOrder?.orderId || `PRE-PAYOUT-${Date.now()}`,
          service: "payout",
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat room chat");
      }

      const mappedRoom = mapChatRoom(result.data);
      setChatRoom(mappedRoom);

      if (mappedRoom && typeof window !== "undefined") {
        localStorage.setItem("payout_chat_room", JSON.stringify(mappedRoom));
      }

      return mappedRoom as ChatRoom;
    } catch (error) {
      console.error("CREATE PAYOUT CHAT ROOM ERROR:", error);
      alert(error instanceof Error ? error.message : "Gagal membuat room chat");
      return null;
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
        },
      );

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil pesan chat");
      }

      setChatMessages(result.data || []);

      if (result.room) {
        const mappedRoom = mapChatRoom(result.room);
        setChatRoom(mappedRoom);

        if (mappedRoom && typeof window !== "undefined") {
          localStorage.setItem("payout_chat_room", JSON.stringify(mappedRoom));
        }
      }
    } catch (error) {
      console.error("GET PAYOUT CHAT MESSAGES ERROR:", error);
      setChatMessages([]);
    }
  };

  const updateChatRoomOrderId = async (orderId: string) => {
    try {
      const room = chatRoom || (await createChatRoom());
      if (!room?.id) return;

      const response = await fetch(
        `${API_URL}/api/chat/rooms/${room.id}/order`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            orderId,
            buyerName:
              form.robloxUsername || room.buyerName || "Customer Payout",
          }),
        },
      );

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal update Order ID chat");
      }

      const mappedRoom = mapChatRoom(result.data);
      setChatRoom(mappedRoom);

      if (mappedRoom && typeof window !== "undefined") {
        localStorage.setItem("payout_chat_room", JSON.stringify(mappedRoom));
      }
    } catch (error) {
      console.error("UPDATE PAYOUT CHAT ORDER ERROR:", error);
    }
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;

    if (isChatLocked) {
      alert("Chat sudah terkirim. Tunggu admin menerima chat terlebih dahulu.");
      return;
    }

    try {
      setLoadingChat(true);

      let room = chatRoom;

      if (!room) {
        room = await createChatRoom();
      }

      if (!room?.id) return;

      const response = await fetch(`${API_URL}/api/chat/buyer/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          roomId: room.id,
          senderName: form.robloxUsername || "Customer",
          message: chatInput.trim(),
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengirim pesan");
      }

      setChatInput("");
      await fetchMessages(room.id);
    } catch (error) {
      console.error("SEND PAYOUT CHAT ERROR:", error);
      alert(error instanceof Error ? error.message : "Gagal mengirim pesan");
    } finally {
      setLoadingChat(false);
    }
  };

  const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("File harus berupa PNG, JPG, JPEG, atau WEBP");
      return;
    }

    setPaymentProof(file);
    setPaymentPreview(URL.createObjectURL(file));
  };

  const handleOrder = async () => {
    if (!selectedPackage) {
      alert("Pilih paket payout terlebih dahulu");
      return;
    }

    if (!selectedPayment) {
      alert("Pilih metode pembayaran terlebih dahulu");
      return;
    }

    if (!form.robloxUsername || !form.nomorRekening) {
      alert("Username Roblox dan nomor rekening wajib diisi");
      return;
    }

    if (checkingUsername) {
      alert("Tunggu pengecekan username selesai");
      return;
    }

    if (!usernameCheck) {
      alert("Username belum dicek. Tunggu sebentar atau ketik ulang username.");
      return;
    }

    if (usernameCheck.isJoined === false) {
      alert(
        "Username belum bergabung ke semua community Roblox. Silahkan join terlebih dahulu.",
      );
      return;
    }

    if (usernameCheck.isEligible14Days === false) {
      alert(
        `User sudah join, tetapi belum memenuhi syarat 14 hari. Baru ${
          usernameCheck.joinedDays || 0
        } hari.`,
      );
      return;
    }

    try {
      setLoadingOrder(true);

      const formData = new FormData();

      formData.append("payoutProdukId", String(selectedPackage.id));
      formData.append("robloxUsername", form.robloxUsername);
      formData.append("nomorRekening", form.nomorRekening);

      formData.append("rekeningId", String(selectedPayment.id));
      formData.append("paymentMethodId", String(selectedPayment.id));
      formData.append("metodePembayaran", selectedPayment.metodePembayaran);
      formData.append("namaBankTujuan", selectedPayment.namaBank || "");
      formData.append(
        "nomorRekeningTujuan",
        selectedPayment.nomorRekening || "",
      );
      formData.append("namaPemilikTujuan", selectedPayment.namaPemilik || "");

      if (paymentProof) {
        formData.append("paymentProof", paymentProof);
      }

      const response = await fetch(`${API_URL}/api/payout/order`, {
        method: "POST",
        mode: "cors",
        body: formData,
      });

      const data: OrderResponse = await response.json();

      if (!response.ok) {
        if (data.notJoinedCommunities && data.notJoinedCommunities.length > 0) {
          throw new Error("User belum bergabung ke semua community Roblox");
        }

        throw new Error(data.message || data.error || "Gagal membuat order");
      }

      setCreatedOrder({
        id: data.data?.id,
        orderId: data.data?.orderId,
        status: data.data?.status,
      });

      if (data.data?.orderId) {
        await updateChatRoomOrderId(data.data.orderId);
      }

      setShowInvoice(true);
    } catch (error) {
      console.error("CREATE PAYOUT ORDER ERROR:", error);
      alert(
        error instanceof Error ? error.message : "Gagal membuat order payout",
      );
    } finally {
      setLoadingOrder(false);
    }
  };

  const joinedCommunities = getJoinedCommunities();
  const notJoinedCommunities = getNotJoinedCommunities();

  if (showInvoice && createdOrder) {
    return (
      <main className="min-h-screen bg-[#07111f] px-5 py-10 text-white">
        <div className="pointer-events-none fixed inset-0 z-0 bg-[#07111f]" />
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(37,99,235,0.20),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(37,99,235,0.14),transparent_34%)]" />

        <div className="relative z-10 mx-auto max-w-3xl rounded-[32px] border border-cyan-500/20 bg-white/[0.04] p-6 shadow-xl shadow-cyan-500/10 backdrop-blur-md">
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-cyan-400" size={64} />
            <h1 className="mt-4 text-3xl font-extrabold">
              Invoice Order Payout
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Order payout berhasil dibuat. Simpan Order ID untuk cek transaksi.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <InvoiceRow label="Order ID" value={createdOrder.orderId || "-"} />
            <InvoiceRow
              label="Status"
              value={createdOrder.status || "pending"}
            />
            <InvoiceRow
              label="Username Roblox"
              value={form.robloxUsername || "-"}
            />
            <InvoiceRow
              label="Paket"
              value={selectedPackage?.namaProduk || "-"}
            />
            <InvoiceRow
              label="Nominal Robux"
              value={
                selectedPackage?.nominalRobux
                  ? `${Number(selectedPackage.nominalRobux).toLocaleString("id-ID")} Robux`
                  : "-"
              }
            />
            <InvoiceRow
              label="Total Harga"
              value={
                selectedPackage?.harga
                  ? `Rp ${Number(selectedPackage.harga).toLocaleString("id-ID")}`
                  : "-"
              }
            />
            <InvoiceRow
              label="Nomor Pengirim"
              value={form.nomorRekening || "-"}
            />
            <InvoiceRow
              label="Metode Pembayaran"
              value={
                selectedPayment?.metodePembayaran === "QRIS"
                  ? "QRIS"
                  : `${selectedPayment?.namaBank || "BANK"} - ${
                      selectedPayment?.nomorRekening || "-"
                    }`
              }
            />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                (window.location.href = `/cek-transaksi?orderId=${createdOrder.orderId}`)
              }
              className="flex-1 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-extrabold text-[#07111f] transition hover:bg-cyan-400"
            >
              Cek Transaksi
            </button>

            <button
              type="button"
              onClick={() => {
                setShowInvoice(false);
                setCreatedOrder(null);
                setSelectedPackage(null);
                setForm({
                  robloxUsername: "",
                  nomorRekening: "",
                });
                setPaymentProof(null);
                setPaymentPreview(null);
                setUsernameCheck(null);
              }}
              className="flex-1 rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Buat Order Baru
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] px-5 py-8 text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#07111f]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(37,99,235,0.20),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(37,99,235,0.14),transparent_34%)]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[32px] border border-cyan-500/20 bg-white/[0.04] shadow-2xl shadow-cyan-500/10 backdrop-blur-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(6,182,212,0.18),transparent_38%)]" />

          <div className="relative grid min-h-[390px] gap-6 px-6 py-8 md:grid-cols-[1fr_420px] md:items-center md:px-8 lg:grid-cols-[1fr_470px]">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300">
                💸 Roblox Payout
              </span>

              <h1 className="mt-5 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
                Payout Robux
                <span className="block text-cyan-400">Cepat & Aman</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-gray-300 md:text-base">
                Layanan payout Robux cepat, aman, dan terpercaya. Masukkan
                username Roblox, pilih paket payout, lalu upload bukti
                pembayaran.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300 backdrop-blur">
                  <ShieldCheck size={18} />
                  <span className="font-semibold">Aman</span>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300 backdrop-blur">
                  <Clock3 size={18} />
                  <span className="font-semibold">Proses Cepat</span>
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300 backdrop-blur">
                  <Wallet size={18} />
                  <span className="font-semibold">Payout Robux</span>
                </div>
              </div>
            </div>

            <div className="relative hidden h-[340px] items-end justify-center md:flex">
              <div className="absolute bottom-0 h-[280px] w-[280px] rounded-full bg-cyan-500/20 blur-[90px]" />

              <Image
                src="/images/char1.png"
                alt="Payout Character"
                width={430}
                height={430}
                className="relative z-10 h-[340px] -bottom-5 w-auto translate-y-8 object-contain object-bottom drop-shadow-[0_20px_60px_rgba(0,255,255,0.25)]"
                priority
              />
            </div>
          </div>
        </section>

        {/* PRODUCT */}
        <section className="mt-10">
          <h2 className="text-2xl font-extrabold text-white">
            Pilih Paket Payout
          </h2>

          {loadingProducts ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-gray-300 backdrop-blur-md">
              Loading produk payout...
            </div>
          ) : payoutPackages.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-sm text-gray-300 backdrop-blur-md">
              Produk payout belum tersedia.
            </div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {payoutPackages.map((pkg, index) => {
                const active = selectedPackage?.id === pkg.id;
                const isFirstCard = index === 0;

                return (
                  <div
                    key={pkg.id}
                    className={`relative min-h-[230px] overflow-hidden rounded-[28px] border p-5 backdrop-blur-md transition duration-300 hover:-translate-y-1 ${
                      active
                        ? "border-cyan-400/50 bg-cyan-500/10 shadow-xl shadow-cyan-500/20"
                        : "border-white/10 bg-white/[0.04] hover:border-cyan-400/40 hover:bg-cyan-500/5"
                    }`}
                  >
                    {isFirstCard && (
                      <>
                        <div className="absolute bottom-0 right-0 top-0 w-[46%] overflow-hidden rounded-r-[28px]">

                        </div>

                        <div className="absolute inset-0 bg-gradient-to-r from-[#07111f] via-[#07111f]/95 to-[#07111f]/5" />
                      </>
                    )}

                    <div className="relative z-10 flex min-h-[190px] flex-col">
                      <div className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400">
                        <CircleDollarSign size={28} />
                      </div>

                      <h3
                        className={`mt-4 text-lg font-extrabold text-white ${
                          isFirstCard ? "max-w-[56%]" : ""
                        }`}
                      >
                        {pkg.namaProduk}
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-relaxed text-gray-400 ${
                          isFirstCard ? "max-w-[56%]" : ""
                        }`}
                      >
                        Payout{" "}
                        {Number(pkg.nominalRobux).toLocaleString("id-ID")} Robux
                      </p>

                      <div
                        className={`mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-cyan-300 ${
                          isFirstCard ? "max-w-[62%]" : ""
                        }`}
                      >
                        Total Robux:{" "}
                        {Number(pkg.nominalRobux).toLocaleString("id-ID")}
                      </div>

                      <h4 className="mt-4 text-xl font-extrabold text-cyan-400">
                        Rp {Number(pkg.harga).toLocaleString("id-ID")}
                      </h4>

                      <button
                        type="button"
                        onClick={() => getDetailPayoutProduct(pkg.id)}
                        disabled={loadingDetail}
                        className={`mt-auto flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition disabled:opacity-50 ${
                          active
                            ? "bg-cyan-500 text-[#07111f]"
                            : "border border-white/10 bg-white/5 text-cyan-300 hover:bg-cyan-500 hover:text-[#07111f]"
                        }`}
                      >
                        <ShoppingCart size={18} />
                        {active ? "Paket Dipilih" : "Pilih Paket"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* FORM */}
        {selectedPackage && (
          <section className="mt-10 rounded-[30px] border border-cyan-500/20 bg-white/[0.04] p-5 shadow-xl shadow-cyan-500/10 backdrop-blur-md">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-extrabold text-white">
                  Form Order Payout
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Paket dipilih:{" "}
                  <span className="font-bold text-cyan-400">
                    {selectedPackage.namaProduk}
                  </span>
                </p>
              </div>

              <div className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-extrabold text-[#07111f] shadow-lg shadow-cyan-500/30">
                Rp {Number(selectedPackage.harga).toLocaleString("id-ID")}
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Username Roblox
                </label>

                <input
                  type="text"
                  placeholder="Contoh: HAKENAIZ"
                  value={form.robloxUsername}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      robloxUsername: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1627]/80 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                />

                {checkingUsername && (
                  <p className="mt-2 text-sm text-gray-400">
                    Mengecek username Roblox...
                  </p>
                )}

                {usernameCheck && !checkingUsername && (
                  <div
                    className={`mt-3 rounded-2xl border p-4 text-sm ${
                      usernameCheck.success
                        ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                        : "border-red-400/20 bg-red-500/10 text-red-300"
                    }`}
                  >
                    <p className="font-semibold">{usernameCheck.message}</p>

                    {usernameCheck.user?.username && (
                      <p className="mt-1">
                        Username: {usernameCheck.user.username}
                      </p>
                    )}

                    {usernameCheck.user?.displayName && (
                      <p className="mt-1">
                        Display Name: {usernameCheck.user.displayName}
                      </p>
                    )}

                    {joinedCommunities.length > 0 && (
                      <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                        <p className="font-semibold text-emerald-300">
                          Community yang sudah diikuti:
                        </p>

                        <div className="mt-2 space-y-2">
                          {joinedCommunities.map((community, index) => (
                            <div
                              key={community.id || community.groupId || index}
                              className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-emerald-200"
                            >
                              <p className="font-semibold">
                                {community.groupName ||
                                  `Community ${index + 1}`}
                              </p>

                              <p className="text-xs">
                                Lama join terdeteksi:{" "}
                                {community.joinedDays || 0} hari
                              </p>

                              {community.isEligible14Days === false && (
                                <p className="text-xs font-semibold text-orange-300">
                                  Belum memenuhi syarat 14 hari
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {notJoinedCommunities.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <p className="font-semibold">
                          Silahkan join community berikut:
                        </p>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {notJoinedCommunities.map((community, index) => {
                            const link =
                              community.groupLink || community.joinUrl;

                            if (!link) return null;

                            return (
                              <a
                                key={community.id || community.groupId || index}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 text-center font-bold text-[#07111f] transition hover:bg-cyan-400"
                              >
                                Join{" "}
                                {community.groupName ||
                                  `Community ${index + 1}`}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {usernameCheck.isJoined &&
                      usernameCheck.isEligible14Days === false && (
                        <p className="mt-3 rounded-xl border border-orange-400/20 bg-orange-500/10 px-3 py-2 font-semibold text-orange-300">
                          Sudah join semua community, tapi belum memenuhi syarat
                          14 hari. Baru {usernameCheck.joinedDays || 0} hari.
                        </p>
                      )}

                    {usernameCheck.success && (
                      <p className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 font-semibold text-emerald-300">
                        Akun sudah memenuhi syarat payout.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Nomor Rekening / E-Wallet Pengirim
                </label>

                <input
                  type="text"
                  placeholder="Contoh: 08123456789 / 1234567890"
                  value={form.nomorRekening}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nomorRekening: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1627]/80 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                />
              </div>

              <div className="rounded-[24px] border border-cyan-400/20 bg-cyan-500/5 p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      Pilih Metode Pembayaran
                    </h3>
                    <p className="mt-1 text-sm text-gray-400">
                      Pilih rekening bank atau QRIS yang tersedia.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={getPaymentMethods}
                    disabled={loadingPayments}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500 hover:text-[#07111f] disabled:opacity-50"
                  >
                    {loadingPayments ? "Loading..." : "Refresh Metode"}
                  </button>
                </div>

                {loadingPayments ? (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-gray-300">
                    Loading metode pembayaran...
                  </div>
                ) : paymentMethods.length === 0 ? (
                  <div className="mt-4 flex items-start gap-3 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
                    <AlertCircle size={20} className="mt-0.5 shrink-0" />
                    Belum ada metode pembayaran aktif. Hubungi admin.
                  </div>
                ) : (
                  <>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {paymentMethods.map((method) => {
                        const active =
                          String(selectedPaymentId) === String(method.id);
                        const isQris = method.metodePembayaran === "QRIS";

                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() =>
                              setSelectedPaymentId(String(method.id))
                            }
                            className={`rounded-[22px] border p-4 text-left transition hover:-translate-y-1 ${
                              active
                                ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/20"
                                : "border-white/10 bg-white/[0.04] hover:border-cyan-400/40"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                                  isQris
                                    ? "bg-orange-500/15 text-orange-300"
                                    : "bg-cyan-500/15 text-cyan-300"
                                }`}
                              >
                                {isQris ? (
                                  <QrCode size={22} />
                                ) : (
                                  <Landmark size={22} />
                                )}
                              </div>

                              <div>
                                <p className="text-sm font-extrabold text-white">
                                  {isQris ? "QRIS" : method.namaBank || "BANK"}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {isQris
                                    ? "Scan QR untuk pembayaran"
                                    : method.namaPemilik || "-"}
                                </p>
                              </div>
                            </div>

                            {!isQris && (
                              <div className="mt-4 rounded-2xl bg-black/20 px-4 py-3">
                                <p className="text-xs text-gray-400">
                                  Nomor Rekening
                                </p>
                                <p className="mt-1 text-sm font-bold text-cyan-300">
                                  {method.nomorRekening || "-"}
                                </p>
                              </div>
                            )}

                            {isQris && method.qrisImage && (
                              <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                                <img
                                  src={getFileUrl(method.qrisImage)}
                                  alt="QRIS"
                                  className="h-44 w-full object-contain"
                                />
                              </div>
                            )}

                            {active && (
                              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-cyan-300">
                                <CheckCircle2 size={18} />
                                Metode dipilih
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selectedPayment && (
                      <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                        <p className="text-sm font-bold text-emerald-300">
                          Instruksi Pembayaran
                        </p>

                        {selectedPayment.metodePembayaran === "QRIS" ? (
                          <p className="mt-2 text-sm leading-6 text-emerald-100/80">
                            Scan QRIS di atas sesuai nominal order, lalu upload
                            bukti pembayaran.
                          </p>
                        ) : (
                          <div className="mt-3 grid gap-3 md:grid-cols-3">
                            <PaymentInfo
                              label="Bank"
                              value={selectedPayment.namaBank || "-"}
                            />
                            <PaymentInfo
                              label="Nomor"
                              value={selectedPayment.nomorRekening || "-"}
                            />
                            <PaymentInfo
                              label="Pemilik"
                              value={selectedPayment.namaPemilik || "-"}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="rounded-[24px] border-2 border-dashed border-cyan-400/30 bg-cyan-500/5 p-4">
                <h3 className="text-lg font-extrabold text-white">
                  Upload Bukti Pembayaran
                </h3>

                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-[20px] border border-white/10 bg-white/[0.04] p-6 text-center transition hover:bg-cyan-500/10">
                  <Upload size={34} className="text-cyan-400" />

                  <p className="mt-3 text-sm font-bold text-white">
                    Upload screenshot pembayaran
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    PNG, JPG, JPEG, atau WEBP
                  </p>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handlePaymentProofChange}
                    className="hidden"
                  />
                </label>

                {paymentPreview && (
                  <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1627]">
                    <img
                      src={paymentPreview}
                      alt="Preview bukti pembayaran"
                      className="max-h-72 w-full object-contain"
                    />
                  </div>
                )}

                {paymentProof && (
                  <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                    <CheckCircle2 size={18} />
                    <span className="font-bold">{paymentProof.name}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleOrder}
                disabled={loadingOrder}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-extrabold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                {loadingOrder ? "Membuat Order..." : "Buat Order Payout"}
              </button>
            </div>
          </section>
        )}

        {/* ORDER SUCCESS */}
        {createdOrder && (
          <section className="mt-10 rounded-[26px] border border-cyan-500/20 bg-white/[0.04] p-5 shadow-xl shadow-cyan-500/10 backdrop-blur-md">
            <h2 className="flex items-center gap-2 text-xl font-extrabold text-white">
              <CreditCard size={24} className="text-cyan-400" />
              Order Berhasil
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <span className="text-gray-400">Order ID</span>
                <span className="font-bold text-cyan-400">
                  {createdOrder.orderId}
                </span>
              </div>

              <div className="flex justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <span className="text-gray-400">Status</span>
                <span className="font-bold text-cyan-400">
                  {createdOrder.status}
                </span>
              </div>
            </div>
          </section>
        )}
      </div>
      <button
        type="button"
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500 text-[#07111f] shadow-2xl shadow-cyan-500/40 transition hover:scale-105"
      >
        <MessageCircle size={28} />
      </button>

      {showChat && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[560px] w-[calc(100vw-32px)] max-w-[380px] flex-col overflow-hidden rounded-[30px] border border-cyan-500/20 bg-[#07111f] shadow-[0_0_40px_rgba(0,255,255,0.15)] md:right-6">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h3 className="font-bold text-white">Live Chat Payout</h3>
              <p className="text-xs text-gray-400">
                {isChatAccepted
                  ? "Chat diterima Admin"
                  : "Menunggu Admin menerima"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowChat(false)}
              className="rounded-xl p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#081423] p-4">
            {chatMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-center text-sm text-gray-500">
                Belum ada pesan. Kamu hanya bisa mengirim 1 pesan awal. Setelah
                itu tunggu admin menerima chat.
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`mb-3 flex ${
                    msg.senderType === "buyer" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-[24px] px-4 py-3 text-sm ${
                      msg.senderType === "buyer"
                        ? "bg-cyan-500 text-[#07111f]"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p className="mb-1 text-[10px] font-bold opacity-60">
                      {msg.senderName}
                    </p>
                    <p className="break-words">{msg.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/10 p-4">
            {isChatLocked && (
              <div className="mb-3 rounded-2xl border border-yellow-400/20 bg-yellow-500/10 px-4 py-3 text-xs leading-5 text-yellow-200">
                Pesan awal sudah dikirim. Chat akan aktif lagi setelah admin
                menerima chat ini.
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendChat();
                  }
                }}
                placeholder={
                  isChatLocked
                    ? "Menunggu admin menerima chat..."
                    : "Tulis pesan..."
                }
                disabled={isChatLocked}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <button
                type="button"
                onClick={sendChat}
                disabled={loadingChat || isChatLocked}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-[#07111f] transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function PaymentInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 px-4 py-3">
      <p className="text-xs text-emerald-200/70">{label}</p>
      <p className="mt-1 break-all text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function InvoiceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="break-all text-sm font-bold text-cyan-300">{value}</span>
    </div>
  );
}
