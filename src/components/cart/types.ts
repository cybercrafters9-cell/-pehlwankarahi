export type DrawerStep = "cart" | "checkout" | "success";
export type PaymentType = "easypaisa" | "jazzcash" | "bank";
export type DigitalPaymentMethod = "easypaisa" | "jazzcash" | "bank";

export interface CompletedOrderSummary {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  totalAmount: number;
  paymentMethod: PaymentType;
  transactionId?: string;
  items?: { id: number; name: string; price: number; qty: number }[];
}

export interface PaymentAccountConfig {
  id: DigitalPaymentMethod;
  name: string;
  badgeLabel: string;
  badgeBg: string;
  theme: {
    panelBg: string;
    panelBorder: string;
    headerText: string;
    badgeBg: string;
    cardBorder: string;
    numberColor: string;
    copyBtn: string;
    checkIcon: string;
    inputBorder: string;
    cardActiveBorder: string;
    cardActiveBg: string;
    cardHoverBg: string;
    subtitleColor: string;
    radioAccent: string;
  };
}

export const PAYMENT_ACCOUNTS: Record<DigitalPaymentMethod, PaymentAccountConfig> = {
  easypaisa: {
    id: "easypaisa",
    name: "Easypaisa",
    badgeLabel: "easypaisa",
    badgeBg: "bg-emerald-600",
    theme: {
      panelBg: "bg-emerald-50",
      panelBorder: "border-emerald-300",
      headerText: "text-emerald-950",
      badgeBg: "bg-emerald-600",
      cardBorder: "border-emerald-200",
      numberColor: "text-emerald-800",
      copyBtn: "bg-emerald-100 hover:bg-emerald-200 text-emerald-900",
      checkIcon: "text-emerald-700",
      inputBorder: "border-emerald-300",
      cardActiveBorder: "border-emerald-600",
      cardActiveBg: "bg-emerald-50/50",
      cardHoverBg: "hover:bg-emerald-50/20",
      subtitleColor: "text-emerald-800",
      radioAccent: "accent-emerald-600",
    },
  },
  jazzcash: {
    id: "jazzcash",
    name: "JazzCash",
    badgeLabel: "JazzCash",
    badgeBg: "bg-red-600",
    theme: {
      panelBg: "bg-red-50",
      panelBorder: "border-red-300",
      headerText: "text-red-950",
      badgeBg: "bg-red-600",
      cardBorder: "border-red-200",
      numberColor: "text-red-800",
      copyBtn: "bg-red-100 hover:bg-red-200 text-red-900",
      checkIcon: "text-red-700",
      inputBorder: "border-red-300",
      cardActiveBorder: "border-red-600",
      cardActiveBg: "bg-red-50/50",
      cardHoverBg: "hover:bg-red-50/20",
      subtitleColor: "text-red-800",
      radioAccent: "accent-red-600",
    },
  },
  bank: {
    id: "bank",
    name: "Bank Transfer",
    badgeLabel: "Bank Transfer",
    badgeBg: "bg-blue-600",
    theme: {
      panelBg: "bg-blue-50",
      panelBorder: "border-blue-300",
      headerText: "text-blue-950",
      badgeBg: "bg-blue-600",
      cardBorder: "border-blue-200",
      numberColor: "text-blue-800",
      copyBtn: "bg-blue-100 hover:bg-blue-200 text-blue-900",
      checkIcon: "text-blue-700",
      inputBorder: "border-blue-300",
      cardActiveBorder: "border-blue-600",
      cardActiveBg: "bg-blue-50/50",
      cardHoverBg: "hover:bg-blue-50/20",
      subtitleColor: "text-blue-800",
      radioAccent: "accent-blue-600",
    },
  },
};

export const QUICK_AREAS = [
  "Kohinoor City",
  "Canal Road",
  "Gulberg / D-Ground",
  "Madina Town",
  "Civil Lines",
  "Peoples Colony",
];

export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  address: string;
  notes: string;
  paymentMethod: PaymentType;
  transactionId: string;
}

export function getDeliverySchedule(orderDate = new Date()) {
  const hour = orderDate.getHours();
  const isBefore7PM = hour < 19;
  const target = new Date(orderDate);
  target.setDate(target.getDate() + (isBefore7PM ? 1 : 2));
  const formattedDate = target.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return {
    isBefore7PM,
    deliveryDate: formattedDate,
    badgeText: isBefore7PM ? "Next Day Delivery" : "Scheduled Delivery",
    etaText: isBefore7PM ? `Tomorrow (${formattedDate})` : `${formattedDate}`,
    policyNote: "Orders confirmed before 7:00 PM are delivered the next day.",
  };
}
