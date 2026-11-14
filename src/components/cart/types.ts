export type DrawerStep = "cart" | "checkout" | "success";
export type PaymentType = "cod" | "easypaisa" | "jazzcash";
export type DigitalPaymentMethod = "easypaisa" | "jazzcash";

export interface CompletedOrderSummary {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  subtotal?: number;
  discount?: number;
  totalAmount: number;
  paymentMethod: PaymentType;
  transactionId?: string;
}

export interface PaymentAccountConfig {
  id: DigitalPaymentMethod;
  name: string;
  badgeLabel: string;
  badgeBg: string;
  accountTitle: string;
  displayNumber: string;
  rawNumber: string;
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
    accountTitle: "Pehalwan Karahi Official",
    displayNumber: "0300-1234567",
    rawNumber: "03001234567",
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
    accountTitle: "Pehalwan Karahi Official",
    displayNumber: "0321-9876543",
    rawNumber: "03219876543",
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
};

export const QUICK_AREAS = [
  "Kohinoor City",
  "Canal Road",
  "Gulberg / D-Ground",
  "Madina Town",
  "Civil Lines",
  "Dine-in / Pickup",
];

export interface CheckoutFormData {
  customerName: string;
  customerPhone: string;
  address: string;
  notes: string;
  paymentMethod: PaymentType;
  transactionId: string;
}

