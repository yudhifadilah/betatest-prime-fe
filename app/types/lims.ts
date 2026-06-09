export type LimsPackage = {
  id: number;
  namaItem: string;
  assetId: string;
  harga: number;
  isActive?: boolean;
};

export type TumbalItem = {
  id: number;
  namaItem: string;
  assetId: string;
  harga: number;
  isActive?: boolean;
};

export type CreatedOrder = {
  id?: number;
  orderId?: string;
  status?: string;
};

export type ChatRoom = {
  id: number;
  orderId?: string;
  buyerName?: string;
  service?: string;
};

export type ChatMessage = {
  id: number;
  roomId: number;
  senderName: string;
  senderType: "buyer" | "admin" | "staff";
  message: string;
  createdAt?: string;
};