import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ReceiptText, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAccounts } from "@/features/account/hooks/use-accounts";
import { useCategories } from "@/features/category/hooks/use-category";
import { useCreateTransaction } from "../hooks/use-transactions";
import { parseTransactionMessage } from "../utils/message-parser";
import type { TransactionType } from "../types";

function getSharedText(search: string) {
  const params = new URLSearchParams(search);
  return [params.get("title"), params.get("text"), params.get("url")]
    .filter(Boolean)
    .join("\n")
    .trim();
}

export default function ImportTransactionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const createTx = useCreateTransaction();
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = categoriesData?.data ?? [];

  const initialMessage = useMemo(() => getSharedText(location.search), [location.search]);
  const [message, setMessage] = useState(initialMessage);
  const [type, setType] = useState<TransactionType>("debit");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0]);

  const canParse = message.trim() && accounts.length > 0 && categories.length > 0;

  const applyParse = () => {
    if (!canParse) return;
    const parsed = parseTransactionMessage(message, accounts, categories);
    setType(parsed.type);
    setAmount(parsed.amount);
    setAccountId(parsed.accountId);
    setCategoryId(parsed.categoryId);
    setDescription(parsed.description);
    setTransactionDate(parsed.transactionDate);
  };

  useEffect(() => {
    if (canParse) applyParse();
  }, [canParse]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createTx.mutateAsync({
      type,
      amount,
      accountId,
      categoryId,
      description,
      transactionDate,
    });
    navigate("/transactions", { replace: true });
  };

  const isLoading = accountsLoading || categoriesLoading;
  const isValid = Boolean(type && amount && accountId && categoryId && description && transactionDate);

  return (
    <div className="mx-auto max-w-2xl pb-28">
      <div className="mb-4 flex items-center gap-3">
        <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import Transaction</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review the parsed message before saving.</p>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm dark:border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ReceiptText className="h-4 w-4" />
            Shared message
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Paste a bank SMS or UPI message here"
            className="min-h-32"
          />
          <Button type="button" variant="secondary" onClick={applyParse} disabled={!canParse || isLoading}>
            <Wand2 className="h-4 w-4" />
            Parse Message
          </Button>
        </CardContent>
      </Card>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        <Card className="border-gray-200 shadow-sm dark:border-gray-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Transaction details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={(value) => setType(value as TransactionType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">Expense</SelectItem>
                    <SelectItem value="credit">Income</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <Input value={amount} onChange={(event) => setAmount(event.target.value)} type="number" min="0" step="0.01" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Account</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder={accountsLoading ? "Loading..." : "Select account"} />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="capitalize">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input value={transactionDate} onChange={(event) => setTransactionDate(event.target.value)} type="date" />
            </div>

            <Button type="submit" className="w-full" disabled={!isValid || createTx.isPending || isLoading}>
              {createTx.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Transaction
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
