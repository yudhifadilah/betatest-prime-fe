import { ChatMessage, ChatRoom } from "../app/types/lims";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function parseJson(response: Response) {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

export type TumbalItem = {
  id: number;
  namaItem: string;
  assetId: string;
  harga: number;
  isActive?: boolean;
};

export async function getLimsProducts() {
  const response = await fetch(`${API_URL}/api/lims/produk`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  const result = await parseJson(response);

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil produk LIMS");
  }

  return result.data || [];
}

export async function getLimsProductDetail(id: number) {
  const response = await fetch(`${API_URL}/api/lims/produk/${id}`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  const result = await parseJson(response);

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil detail produk");
  }

  return result.data;
}

export async function getTumbalItemsApi(): Promise<TumbalItem[]> {
  const response = await fetch(`${API_URL}/api/tumbal`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  const result = await parseJson(response);

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil daftar tumbal");
  }

  return result.data || [];
}

export async function getTumbalDetailApi(id: number): Promise<TumbalItem> {
  const response = await fetch(`${API_URL}/api/tumbal/${id}`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  const result = await parseJson(response);

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil detail tumbal");
  }

  return result.data;
}

export async function createLimsOrderApi(formData: FormData) {
  const response = await fetch(`${API_URL}/api/lims/order`, {
    method: "POST",
    body: formData,
  });

  const result = await parseJson(response);

  if (!response.ok) {
    throw new Error(result.message || result.error || "Gagal membuat order");
  }

  return result.data;
}

export async function createChatRoomApi(data: {
  orderId?: string;
  buyerName: string;
  service?: string;
}): Promise<ChatRoom> {
  const response = await fetch(`${API_URL}/api/chat/rooms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      orderId: data.orderId,
      buyerName: data.buyerName,
      service: data.service || "lims",
    }),
  });

  const result = await parseJson(response);

  if (!response.ok) {
    throw new Error(result.message || "Gagal membuat room chat");
  }

  return result.data;
}

export async function updateChatRoomApi(
  roomId: number,
  data: {
    orderId?: string;
    buyerName?: string;
    service?: string;
  }
): Promise<ChatRoom> {
  const response = await fetch(`${API_URL}/api/chat/rooms/${roomId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await parseJson(response);

  if (!response.ok) {
    throw new Error(result.message || "Gagal update room chat");
  }

  return result.data;
}

export async function getChatMessagesApi(
  roomId: number
): Promise<ChatMessage[]> {
  const response = await fetch(`${API_URL}/api/chat/rooms/${roomId}/messages`, {
    method: "GET",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  const result = await parseJson(response);

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil pesan");
  }

  return result.data || [];
}

export async function sendBuyerMessageApi(data: {
  roomId: number;
  senderName: string;
  message: string;
}) {
  const response = await fetch(`${API_URL}/api/chat/buyer/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await parseJson(response);

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengirim pesan");
  }

  return result.data;
}