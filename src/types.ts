/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  color: string;
  price: number;
  formattedPrice: string;
  image: string;
  images?: string[]; // Multiple details images
  description?: string;
  category: "Erkaklar" | "Ayollar" | "Aksessuarlar" | "Barchasi";
  isFeatured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

export type ViewState = "home" | "catalog" | "product-details" | "cart";
