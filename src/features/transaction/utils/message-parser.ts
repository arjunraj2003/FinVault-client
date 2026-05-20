import type { Account } from "@/features/account/types";
import type { Category } from "@/features/category/types";
import type { TransactionType } from "../types";

export interface ParsedTransactionMessage {
  type: TransactionType;
  amount: string;
  transactionDate: string;
  description: string;
  accountId: string;
  categoryId: string;
  confidence: {
    amount: boolean;
    account: boolean;
    category: boolean;
    date: boolean;
    type: boolean;
  };
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: ["food", "restaurant", "cafe", "coffee", "swiggy", "zomato", "grocery", "groceries", "blinkit", "zepto"],
  transport: ["uber", "ola", "rapido", "metro", "fuel", "petrol", "diesel", "bus", "train", "irctc", "flight"],
  shopping: ["amazon", "flipkart", "myntra", "shopping", "store", "mall", "purchase"],
  entertainment: ["netflix", "spotify", "movie", "bookmyshow", "game", "subscription"],
  utilities: ["electricity", "mobile", "recharge", "internet", "wifi", "bill", "water", "gas"],
  health: ["hospital", "doctor", "pharmacy", "medicine", "medical", "clinic"],
  rent: ["rent", "landlord", "lease"],
  investment: ["sip", "mutual", "stock", "zerodha", "groww", "investment"],
  salary: ["salary", "payroll", "credited by", "income"],
};

const DEBIT_WORDS = /\b(debit(?:ed)?|spent|paid|withdrawn|purchase|sent|dr|txn|transaction)\b/i;
const CREDIT_WORDS = /\b(credit(?:ed)?|received|deposited|salary|refund|cashback|cr)\b/i;

function todayIsoDate() {
  return new Date().toISOString().split("T")[0];
}

function normalizeAmount(raw: string) {
  return raw.replace(/,/g, "");
}

function parseAmount(message: string): string {
  const amountPatterns = [
    /(?:inr|rs\.?|₹)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i,
    /([0-9][0-9,]*(?:\.\d{1,2})?)\s*(?:inr|rs\.?|₹)/i,
    /\bamount\s*(?:of)?\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i,
  ];

  for (const pattern of amountPatterns) {
    const match = message.match(pattern);
    if (match?.[1]) return normalizeAmount(match[1]);
  }

  return "";
}

function parseType(message: string): TransactionType {
  const creditMatch = CREDIT_WORDS.test(message);
  const debitMatch = DEBIT_WORDS.test(message);
  if (creditMatch && !debitMatch) return "credit";
  return "debit";
}

function parseDate(message: string): string {
  const numeric = message.match(/\b(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})\b/);
  if (numeric) {
    const day = numeric[1].padStart(2, "0");
    const month = numeric[2].padStart(2, "0");
    const year = numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3];
    return `${year}-${month}-${day}`;
  }

  const textual = message.match(/\b(\d{1,2})[-\s](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[-\s](\d{2,4})\b/i);
  if (textual) {
    const monthMap: Record<string, string> = {
      jan: "01",
      feb: "02",
      mar: "03",
      apr: "04",
      may: "05",
      jun: "06",
      jul: "07",
      aug: "08",
      sep: "09",
      oct: "10",
      nov: "11",
      dec: "12",
    };
    const day = textual[1].padStart(2, "0");
    const month = monthMap[textual[2].slice(0, 3).toLowerCase()];
    const year = textual[3].length === 2 ? `20${textual[3]}` : textual[3];
    return `${year}-${month}-${day}`;
  }

  return todayIsoDate();
}

function findAccount(message: string, accounts: Account[]): string {
  const lower = message.toLowerCase();
  const maskedDigits = Array.from(message.matchAll(/(?:x{2,}|[*]{2,}|ending|a\/c|account|card)\D*(\d{3,4})/gi)).map((m) => m[1]);

  const matched = accounts.find((account) => {
    const name = account.name?.toLowerCase() ?? "";
    const nameMatch = name && lower.includes(name);
    const digitMatch = maskedDigits.some((digits) => account.name?.includes(digits));
    return nameMatch || digitMatch;
  });

  return matched?.id ?? accounts[0]?.id ?? "";
}

function findCategory(message: string, categories: Category[], type: TransactionType): string {
  const lower = message.toLowerCase();

  if (type === "credit") {
    const salary = categories.find((c) => c.name.toLowerCase() === "salary");
    if (salary && /\b(salary|payroll|income)\b/i.test(message)) return salary.id;
  }

  for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const category = categories.find((c) => c.name.toLowerCase() === categoryName);
    if (category && keywords.some((keyword) => lower.includes(keyword))) {
      return category.id;
    }
  }

  const other = categories.find((c) => c.name.toLowerCase() === "other");
  return other?.id ?? categories[0]?.id ?? "";
}

function parseDescription(message: string): string {
  const merchantPatterns = [
    /\bat\s+([a-z0-9 .&_-]{3,40})/i,
    /\bto\s+([a-z0-9 .&_-]{3,40})/i,
    /\bfrom\s+([a-z0-9 .&_-]{3,40})/i,
    /\bupi\/([a-z0-9 .&@_-]{3,40})/i,
  ];

  for (const pattern of merchantPatterns) {
    const match = message.match(pattern);
    if (match?.[1]) return match[1].replace(/\s+/g, " ").trim();
  }

  return message.replace(/\s+/g, " ").slice(0, 120).trim() || "Imported from message";
}

export function parseTransactionMessage(
  message: string,
  accounts: Account[],
  categories: Category[]
): ParsedTransactionMessage {
  const type = parseType(message);
  const amount = parseAmount(message);
  const transactionDate = parseDate(message);
  const accountId = findAccount(message, accounts);
  const categoryId = findCategory(message, categories, type);

  return {
    type,
    amount,
    transactionDate,
    description: parseDescription(message),
    accountId,
    categoryId,
    confidence: {
      amount: Boolean(amount),
      account: Boolean(accountId),
      category: Boolean(categoryId),
      date: transactionDate !== todayIsoDate() || /\b(today|now)\b/i.test(message),
      type: CREDIT_WORDS.test(message) || DEBIT_WORDS.test(message),
    },
  };
}
