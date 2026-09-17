export interface PurchaseBillItem {
  id?: number;
  item: string;
  batch: string;
  standardCost: number;
  standardPrice: number;
  quantity: number;
  discount: number;
  totalCost: number;
  totalSelling: number;
  createdAt?: string;
}

export interface PurchaseBillRequest {
  item: string;
  batch: string;
  standardCost: number;
  standardPrice: number;
  quantity: number;
  discount: number;
}

export interface ItemSummary {
  totalItems: number;
  totalQuantity: number;
}

export interface PurchaseBillListResponse {
  items: PurchaseBillItem[];
  summary: ItemSummary;
}

export interface LocationItem {
  // Matches backend [JsonPropertyName("Location_Code")] and [JsonPropertyName("Location_Name")]
  Location_Code?: string;
  Location_Name?: string;
}
