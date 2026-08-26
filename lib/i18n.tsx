"use client";

import { ACTION_FAILED } from "@/lib/actionError";
import {
  createContext,
  useContext,
  useSyncExternalStore,
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
    quickSellHint: "Tap items to add them to the basket, then record the whole sale at once.",
    customSale: "Custom Sale",
    sold: "Sold",
    undo: "Undo",
    outOfStock: "Out of stock",
    sell: "Sell",
    somethingWrong: "Something went wrong",
    tryAgain: "Try Again",
    archive: "Archive",
    activeItems: "Selling",
    archivedItems: "Archived",
    restore: "Restore",
    confirmArchive:
      "Hide this item from your items and sales? Its sales history stays in your reports, and you can bring it back any time.",
    noArchivedItems: "Nothing archived yet.",
    soldBefore: "Sold before",
    actionFailed: "Couldn't reach the shop data. Refresh the page and try again.",
    basket: "Basket",
    clear: "Clear",
    add: "Add",
    itemWord: "item",
    itemsWord: "items",
    searchItems: "Search items",
    normalPrice: "Normal price",
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
    quickSellHint: "ចុចទំនិញដើម្បីបញ្ចូលក្នុងកន្ត្រក រួចកត់ត្រាការលក់ទាំងអស់ម្តង។",
    customSale: "លក់តាមបំណង",
    sold: "បានលក់",
    undo: "ត្រឡប់វិញ",
    outOfStock: "អស់ស្តុក",
    sell: "លក់",
    somethingWrong: "មានបញ្ហាកើតឡើង",
    tryAgain: "ព្យាយាមម្តងទៀត",
    archive: "លាក់ទុក",
    activeItems: "កំពុងលក់",
    archivedItems: "បានលាក់ទុក",
    restore: "យកមកវិញ",
    confirmArchive:
      "លាក់ទំនិញនេះពីបញ្ជីទំនិញ និងការលក់មែនទេ? ប្រវត្តិលក់នៅដដែលក្នុងរបាយការណ៍ ហើយអ្នកអាចយកវាមកវិញបានគ្រប់ពេល។",
    noArchivedItems: "មិនទាន់មានទំនិញបានលាក់ទុកទេ។",
    soldBefore: "ធ្លាប់លក់",
    actionFailed: "មិនអាចភ្ជាប់ទិន្នន័យហាងបានទេ។ សូមផ្ទុកទំព័រឡើងវិញ ហើយព្យាយាមម្តងទៀត។",
    basket: "កន្ត្រក",
    clear: "សម្អាត",
    add: "បន្ថែម",
    itemWord: "ទំនិញ",
    itemsWord: "ទំនិញ",
    searchItems: "ស្វែងរកទំនិញ",
    normalPrice: "តម្លៃធម្មតា",
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

// The chosen language lives in localStorage, which the server cannot read, so
// it is subscribed to as an external store rather than copied into state by an
// effect - the effect version re-rendered the whole tree a second time on
// every load.
const langListeners = new Set<() => void>();

function subscribeLang(onChange: () => void) {
  langListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    langListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getStoredLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === "km" ? "km" : "en";
  } catch {
    // Private windows and blocked site data throw on access.
    return "en";
  }
}

// The server has no localStorage, so it always renders English.
function getServerLang(): Lang {
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribeLang, getStoredLang, getServerLang);

  const setLang = (newLang: Lang) => {
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch {
      // Not persisting is survivable; the switch still applies for this visit.
    }
    langListeners.forEach((notify) => notify());
  };

  const t = (key: TranslationKey) => dictionary[lang][key] ?? dictionary.en[key];

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

// Server Actions hand back plain English strings; map the ones we have
// translations for, and pass anything else through unchanged.
export function useErrorText() {
  const { t } = useI18n();
  return (message: string | null | undefined) => {
    if (!message) return null;
    if (message === ACTION_FAILED) return t("actionFailed");
    if (message === "Not enough stock") return t("notEnoughStock");
    return message;
  };
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
