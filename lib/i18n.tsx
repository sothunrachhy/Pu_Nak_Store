"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type Lang = "en" | "km";

export const dictionary = {
  en: {
    appName: "Stock Manager",
    dashboard: "Dashboard",
    items: "Items",
    sales: "Sales",
    expenses: "Expenses",
    logout: "Log out",
    login: "Log in",
    password: "Password",
    loginButton: "Enter",
    loginError: "Incorrect password",
    todayIncome: "Today's Income",
    todayExpense: "Today's Expenses",
    todayProfit: "Today's Profit",
    thisWeek: "This Week",
    thisMonth: "This Month",
    income: "Income",
    costOfGoods: "Cost of Goods",
    expense: "Expenses",
    profit: "Profit",
    lowStock: "Low Stock",
    lowStockDesc: "Items with 3 or fewer in stock",
    salesTrend: "Sales Trend (Last 7 Days)",
    recentSales: "Recent Sales",
    noSales: "No sales yet",
    addItem: "Add Item",
    editItem: "Edit Item",
    addPhoto: "Add Photo",
    itemName: "Item Name",
    category: "Category",
    size: "Size",
    color: "Color",
    other: "Other",
    costPrice: "Cost Price",
    sellPrice: "Sell Price",
    quantity: "Quantity",
    inStock: "In Stock",
    actions: "Actions",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    noItems: "No items yet. Add your first item.",
    confirmDelete: "Are you sure you want to delete this?",
    recordSale: "Record a Sale",
    selectItem: "Select Item",
    unitPrice: "Unit Price",
    total: "Total",
    note: "Note (optional)",
    recordSaleButton: "Record Sale",
    date: "Date",
    item: "Item",
    notEnoughStock: "Not enough stock",
    addExpense: "Add Expense",
    description: "Description",
    amount: "Amount",
    addExpenseButton: "Add Expense",
    noExpenses: "No expenses recorded yet",
    all: "All",
    today: "Today",
    week: "Week",
    month: "Month",
    requiredField: "This field is required",
    saving: "Saving...",
    currency: "៛",
    quickSell: "Quick Sell",
    quickSellHint: "Tap a photo to sell 1. Tap the number to sell more.",
    customSale: "Custom Sale",
    sold: "Sold",
    undo: "Undo",
    outOfStock: "Out of stock",
    sell: "Sell",
  },
  km: {
    appName: "គ្រប់គ្រងស្តុក",
    dashboard: "ទំព័រដើម",
    items: "ទំនិញ",
    sales: "លក់",
    expenses: "ចំណាយ",
    logout: "ចាកចេញ",
    login: "ចូល",
    password: "ពាក្យសម្ងាត់",
    loginButton: "ចូល",
    loginError: "ពាក្យសម្ងាត់មិនត្រឹមត្រូវ",
    todayIncome: "ចំណូលថ្ងៃនេះ",
    todayExpense: "ចំណាយថ្ងៃនេះ",
    todayProfit: "ចំណេញថ្ងៃនេះ",
    thisWeek: "សប្តាហ៍នេះ",
    thisMonth: "ខែនេះ",
    income: "ចំណូល",
    costOfGoods: "ថ្លៃដើមទំនិញ",
    expense: "ចំណាយ",
    profit: "ចំណេញ",
    lowStock: "ស្តុកជិតអស់",
    lowStockDesc: "ទំនិញនៅសល់ ៣ ឬតិចជាង",
    salesTrend: "និន្នាការលក់ (៧ថ្ងៃចុងក្រោយ)",
    recentSales: "ការលក់ថ្មីៗ",
    noSales: "មិនទាន់មានការលក់ទេ",
    addItem: "បន្ថែមទំនិញ",
    editItem: "កែសម្រួលទំនិញ",
    addPhoto: "បន្ថែមរូបភាព",
    itemName: "ឈ្មោះទំនិញ",
    category: "ប្រភេទ",
    size: "ទំហំ",
    color: "ពណ៌",
    other: "ផ្សេងទៀត",
    costPrice: "តម្លៃដើម",
    sellPrice: "តម្លៃលក់",
    quantity: "ចំនួន",
    inStock: "នៅសល់ក្នុងស្តុក",
    actions: "សកម្មភាព",
    edit: "កែសម្រួល",
    delete: "លុប",
    save: "រក្សាទុក",
    cancel: "បោះបង់",
    noItems: "មិនទាន់មានទំនិញទេ។ បន្ថែមទំនិញដំបូងរបស់អ្នក។",
    confirmDelete: "តើអ្នកប្រាកដថាចង់លុបនេះមែនទេ?",
    recordSale: "កត់ត្រាការលក់",
    selectItem: "ជ្រើសរើសទំនិញ",
    unitPrice: "តម្លៃឯកតា",
    total: "សរុប",
    note: "កំណត់ចំណាំ (មិនចាំបាច់)",
    recordSaleButton: "កត់ត្រាការលក់",
    date: "កាលបរិច្ឆេទ",
    item: "ទំនិញ",
    notEnoughStock: "ស្តុកមិនគ្រប់គ្រាន់",
    addExpense: "បន្ថែមចំណាយ",
    description: "សេចក្តីពិពណ៌នា",
    amount: "ចំនួនទឹកប្រាក់",
    addExpenseButton: "បន្ថែមចំណាយ",
    noExpenses: "មិនទាន់មានចំណាយត្រូវបានកត់ត្រាទេ",
    all: "ទាំងអស់",
    today: "ថ្ងៃនេះ",
    week: "សប្តាហ៍",
    month: "ខែ",
    requiredField: "ត្រូវការបំពេញកន្លែងនេះ",
    saving: "កំពុងរក្សាទុក...",
    currency: "៛",
    quickSell: "លក់រហ័ស",
    quickSellHint: "ចុចរូបភាពដើម្បីលក់ ១។ ចុចលេខដើម្បីលក់ច្រើន។",
    customSale: "លក់តាមបំណង",
    sold: "បានលក់",
    undo: "ត្រឡប់វិញ",
    outOfStock: "អស់ស្តុក",
    sell: "លក់",
  },
} as const;

export type TranslationKey = keyof typeof dictionary.en;

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const STORAGE_KEY = "app_lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === "en" || stored === "km") {
      setLangState(stored);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  };

  const t = (key: TranslationKey) => dictionary[lang][key] ?? dictionary.en[key];

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
