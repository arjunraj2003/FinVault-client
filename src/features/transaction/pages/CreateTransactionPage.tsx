import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateTransaction } from "../hooks/use-transactions";
import { useAccounts } from "@/features/account/hooks/use-accounts";
import { useCategories } from "@/features/category/hooks/use-category";
import { ArrowLeft, Loader2, IndianRupee, FileText, Calendar, Tag, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const schema = z.object({
  accountId: z.string().min(1, "Select an account"),
  type: z.enum(["credit", "debit"]),
  categoryId: z.string().min(1, "Select a category"),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  sourceAccountId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreateTransactionPage() {
  const navigate = useNavigate();
  const createTx = useCreateTransaction();
  const { data: accounts } = useAccounts();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = categoriesData?.data ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      accountId: "",
      type: "debit",
      categoryId: "",
      amount: 0,
      description: "",
      date: new Date().toISOString().split("T")[0],
      sourceAccountId: "",
    }
  });

  const selectedAccountId = form.watch("accountId");
  const selectedType = form.watch("type");
  const selectedAccount = accounts?.find((a) => a.id === selectedAccountId);
  const isCreditCardPayment = selectedAccount?.type === "credit" && selectedType === "credit";

  const onSubmit = async (values: FormValues) => {
    try {
      await createTx.mutateAsync({
        accountId: values.accountId,
        type: values.type,
        categoryId: values.categoryId,
        amount: values.amount.toString(),
        description: values.description,
        transactionDate: values.date,
        sourceAccountId: isCreditCardPayment && values.sourceAccountId ? values.sourceAccountId : undefined,
      });
      navigate("/transactions");
    } catch (error) {
      console.error("Failed to create transaction:", error);
    }
  };

  return (
    <div className="bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate("/transactions")}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Create Transaction
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Add a new income or expense transaction
            </p>
          </div>
        </div>

        <Card className="w-full border-border bg-card shadow-lg overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-6 space-y-4">
            
            {/* Account Selector */}
            <FormField control={form.control} name="accountId" render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                  Account
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 bg-muted border-border rounded-xl text-foreground">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card border-border">
                    {accounts?.map((a) => (
                      <SelectItem key={a.id} value={a.id} className="text-foreground">
                        {a.name} ({a.currency} {Number(a.balance).toFixed(2)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            {/* Type & Category Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Transaction Type */}
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-sm font-medium text-foreground">Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-muted border-border rounded-xl text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="credit" className="text-foreground">Income</SelectItem>
                      <SelectItem value="debit" className="text-foreground">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Category */}
              <FormField control={form.control} name="categoryId" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    Category
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-muted border-border rounded-xl text-foreground">
                        <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border max-h-60 overflow-y-auto">
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="capitalize text-foreground">
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Repayment Option for Credit Card Payments */}
            {isCreditCardPayment && (
              <FormField control={form.control} name="sourceAccountId" render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    Pay From (Source Account)
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 bg-muted border-border rounded-xl text-foreground">
                        <SelectValue placeholder="Select payment source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border">
                      {accounts
                        ?.filter((a) => a.id !== selectedAccountId)
                        .map((a) => (
                          <SelectItem key={a.id} value={a.id} className="text-foreground">
                            {a.name} ({a.currency} {Number(a.balance).toFixed(2)})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {/* Amount */}
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-muted-foreground" />
                  Amount
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-8 h-12 bg-muted border-border rounded-xl focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Description */}
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Description
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Monthly rent"
                    className="h-12 bg-muted border-border rounded-xl focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Date */}
            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Date
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="h-12 bg-muted border-border rounded-xl focus:border-primary focus:ring-primary text-foreground"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/transactions")}
                className="flex-1 h-12 border-border bg-card hover:bg-accent text-foreground rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTx.isPending || categoriesLoading}
                className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold"
              >
                {createTx.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-foreground" />
                    Creating...
                  </>
                ) : (
                  "Create Transaction"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
      </div>
    </div>
  );
}
