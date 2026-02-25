import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateTransaction } from "../hooks/use-transactions";
import { useAccounts } from "@/features/account/hooks/use-accounts";
import { Plus, Loader2 } from "lucide-react";

const categories = ["salary", "freelance", "investment", "food", "transport", "entertainment", "utilities", "shopping", "health", "other"] as const;

const schema = z.object({
  accountId: z.string().min(1, "Select an account"),
  type: z.enum(["credit", "debit"]),
  category: z.enum(categories),
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
});

export function CreateTransactionModal() {
  const [open, setOpen] = useState(false);
  const createTx = useCreateTransaction();
  const { data: accounts } = useAccounts();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      accountId: "",
      type: "debit",   // sensible default
      category: "food",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    }
  });

 const onSubmit = async (values: {
  accountId: string;
  type: "credit" | "debit";
  category: typeof categories[number];
  amount: string;
  description: string;
  date: string;
}) => {
  await createTx.mutateAsync({
    accountId: values.accountId,
    type: values.type,
    category: values.category,
    amount: values.amount,
    description: values.description,
    transactionDate: values.date, // 🔥 FIX HERE
  });

  form.reset();
  setOpen(false);
};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-2 h-4 w-4" /> New Transaction</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Create Transaction</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="accountId" render={({ field }) => (
              <FormItem>
                <FormLabel>Account</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {accounts?.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="credit">Income</SelectItem>
                      <SelectItem value="debit">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="amount" render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Input placeholder="Monthly rent" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={createTx.isPending}>
              {createTx.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Transaction
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
