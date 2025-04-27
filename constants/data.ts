import { CategoryType, ExpenseCategoriesType } from "@/types";
import * as Icons from "phosphor-react-native"; // Tüm ikonları dinamik olarak içe aktar

export const expenseCategories: ExpenseCategoriesType = {
  groceries: {
    label: "Market",
    value: "groceries",
    icon: Icons.ShoppingCart,
    bgColor: "#4B5563", // Derin Teal Yeşili
  },
  rent: {
    label: "Kira",
    value: "rent",
    icon: Icons.House,
    bgColor: "#075985", // Koyu Mavi
  },
  utilities: {
    label: "Faturalar",
    value: "utilities",
    icon: Icons.Lightbulb,
    bgColor: "#ca8a04", // Koyu Altın Kahverengi
  },
  transportation: {
    label: "Ulaşım",
    value: "transportation",
    icon: Icons.Car,
    bgColor: "#b45309", // Koyu Turuncu-Kırmızı
  },
  entertainment: {
    label: "Eğlence",
    value: "entertainment",
    icon: Icons.FilmStrip,
    bgColor: "#0f766e", // Daha Koyu Kırmızı-Kahverengi
  },
  dining: {
    label: "Yeme İçme",
    value: "dining",
    icon: Icons.ForkKnife,
    bgColor: "#be185d", // Koyu Kırmızı
  },
  health: {
    label: "Sağlık",
    value: "health",
    icon: Icons.Heart,
    bgColor: "#e11d48", // Koyu Mor
  },
  insurance: {
    label: "Sigorta",
    value: "insurance",
    icon: Icons.ShieldCheck,
    bgColor: "#404040", // Koyu Gri
  },
  savings: {
    label: "Birikim",
    value: "savings",
    icon: Icons.PiggyBank,
    bgColor: "#065F46", // Derin Teal Yeşili
  },
  clothing: {
    label: "Giyim",
    value: "clothing",
    icon: Icons.TShirt,
    bgColor: "#7c3aed", // Koyu Lacivert
  },
  personal: {
    label: "Kişisel",
    value: "personal",
    icon: Icons.User,
    bgColor: "#a21caf", // Derin Pembe
  },
  others: {
    label: "Diğer",
    value: "others",
    icon: Icons.DotsThreeOutline,
    bgColor: "#525252", // Nötr Koyu Gri
  },
};

export const incomeCategory: CategoryType = {
  label: "Gelir",
  value: "income",
  icon: Icons.CurrencyDollarSimple,
  bgColor: "#16a34a", // Koyu Yeşil
};

export const transactionTypes = [
  { label: "Gider", value: "expense" },
  { label: "Gelir", value: "income" },
];