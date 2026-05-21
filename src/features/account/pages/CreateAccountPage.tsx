import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateAccount } from "../hooks/use-accounts";
import { ArrowLeft, Loader2, Wallet, Landmark, CreditCard, TrendingUp, PiggyBank, IndianRupee } from "lucide-react";
import type { AccountType } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

const accountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(50, "Account name too long"),
  type: z.enum(["checking", "savings", "credit", "investment"] as const),
  currency: z.string().min(1, "Currency is required"),
  balance: z.number().min(0, "Balance cannot be negative").optional(),
  creditLimit: z.number().min(0).optional(),
  statementDay: z.number().min(1).max(31).optional(),
  dueDay: z.number().min(1).max(31).optional(),
}).refine(data => {
  if (data.type === 'credit') {
    return !!data.creditLimit && !!data.statementDay && !!data.dueDay;
  }
  return true;
}, {
  message: "Credit limit, statement day, and due day are required",
  path: ["creditLimit"],
});

type AccountFormValues = z.infer<typeof accountSchema>;

type AccountTypeConfig = {
  icon: typeof Wallet;
  label: string;
  color: string;
  gradient: string;
  lightColor: string;
  description: string;
};

const accountTypeConfig: Record<AccountType, AccountTypeConfig> = {
  checking: {
    icon: Landmark,
    label: "Checking",
    color: "text-primary",
    gradient: "from-primary/80 to-primary",
    lightColor: "bg-primary/10 border-primary/20",
    description: "Everyday spending and transactions",
  },
  savings: {
    icon: PiggyBank,
    label: "Savings",
    color: "text-green-500",
    gradient: "from-green-500/80 to-green-500",
    lightColor: "bg-green-500/10 border-green-500/20",
    description: "Save and grow your money",
  },
  credit: {
    icon: CreditCard,
    label: "Credit",
    color: "text-destructive",
    gradient: "from-destructive/80 to-destructive",
    lightColor: "bg-destructive/10 border-destructive/20",
    description: "Credit cards and loans",
  },
  investment: {
    icon: TrendingUp,
    label: "Investment",
    color: "text-purple-500",
    gradient: "from-purple-500/80 to-purple-500",
    lightColor: "bg-purple-500/10 border-purple-500/20",
    description: "Stocks, bonds, and ETFs",
  },
};

const currencies = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭" },
];

export default function CreateAccountPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const createAccount = useCreateAccount();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "checking" as AccountType,
      currency: "INR",
      balance: 0,
    },
  });

  const selectedType = form.watch("type");
  const selectedCurrency = form.watch("currency");
  const TypeIcon = accountTypeConfig[selectedType]?.icon || Wallet;

  const onSubmit = async (values: AccountFormValues) => {
    try {
      await createAccount.mutateAsync({
        name: values.name,
        type: values.type,
        currency: values.currency,
        balance: String(values.balance ?? 0),
        creditLimit: values.creditLimit,
        statementDay: values.statementDay,
        dueDay: values.dueDay
      });
      navigate("/accounts");
    } catch (error) {
      console.error("Failed to create account:", error);
    }
  };

  const nextStep = async () => {
    const isValid = await form.trigger(["name", "type"]);
    if (isValid) setStep(2);
  };

  const prevStep = () => setStep(1);

  return (
    <div className="bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate("/accounts")}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {step === 1 ? "Create New Account" : "Set Up Your Account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1
                ? "Choose the type of account you want to create"
                : "Add some details to get started"}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2">
          <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        </div>

        <Card className="w-full border-border bg-card shadow-lg overflow-hidden">

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  {/* Account Type Selection */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Account Type
                        </FormLabel>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          {(Object.entries(accountTypeConfig) as [AccountType, AccountTypeConfig][]).map(([type, config]) => {
                            const Icon = config.icon;
                            const isSelected = field.value === type;

                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => field.onChange(type)}
                                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${isSelected
                                    ? `border-primary bg-primary/10`
                                    : 'border-border bg-muted/30 hover:border-muted-foreground'
                                  }`}
                              >
                                <div className={`w-10 h-10 rounded-full ${config.lightColor} flex items-center justify-center mb-2`}>
                                  <Icon className={`h-5 w-5 ${config.color}`} />
                                </div>
                                <p className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                  {config.label}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 leading-snug">
                                  {config.description}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Account Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Account Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="e.g., Primary Savings"
                              className="pl-10 h-12 bg-muted border-border rounded-xl focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
                              {...field}
                            />
                            <TypeIcon className={`absolute left-3 top-3.5 h-5 w-5 ${accountTypeConfig[selectedType]?.color}`} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/accounts")}
                      className="flex-1 h-12 border-border bg-card hover:bg-accent text-foreground rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium"
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Selected Account Summary */}
                  <div className={`p-4 rounded-xl border ${accountTypeConfig[selectedType]?.lightColor}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center`}>
                        <TypeIcon className={`h-6 w-6 ${accountTypeConfig[selectedType]?.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Creating</p>
                        <p className="font-bold text-foreground">
                          {form.getValues("name") || "New Account"} • {accountTypeConfig[selectedType]?.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Currency Selection */}
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          Currency
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-muted border-border rounded-xl text-foreground">
                              <SelectValue>
                                {field.value && (
                                  <div className="flex items-center gap-2">
                                    <span>{currencies.find(c => c.code === field.value)?.flag}</span>
                                    <span>{field.value} - {currencies.find(c => c.code === field.value)?.name}</span>
                                    <span className="text-muted-foreground ml-auto">{currencies.find(c => c.code === field.value)?.symbol}</span>
                                  </div>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-80 bg-card border-border">
                            {currencies.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code} className="text-foreground">
                                <div className="flex items-center gap-2">
                                  <span>{currency.flag}</span>
                                  <span className="font-medium">{currency.code}</span>
                                  <span className="text-muted-foreground text-sm">- {currency.name}</span>
                                  <span className="text-muted-foreground ml-auto">{currency.symbol}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Initial Balance (Optional) */}
                  <FormField
                    control={form.control}
                    name="balance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                          {selectedType === 'credit' ? 'Current Balance / Debt (Optional)' : 'Initial Balance (Optional)'}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3.5 text-muted-foreground">
                              {currencies.find(c => c.code === selectedCurrency)?.symbol || '₹'}
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-8 h-12 bg-muted border-border rounded-xl focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                              value={field.value || ''}
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          Starting balance for this account
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedType === 'credit' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="creditLimit"
                        render={({ field }) => (
                          <FormItem className="col-span-full">
                            <FormLabel className="text-sm font-medium text-foreground">Credit Limit</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-3.5 text-muted-foreground">₹</span>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  className="pl-8 h-12 bg-muted border-border rounded-xl focus:border-primary focus:ring-primary text-foreground"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                                  value={field.value || ''}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="statementDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-foreground">Statement Day</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1" max="31"
                                placeholder="e.g. 5"
                                className="h-12 bg-muted border-border rounded-xl focus:border-primary focus:ring-primary text-foreground"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dueDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-foreground">Due Day</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1" max="31"
                                placeholder="e.g. 25"
                                className="h-12 bg-muted border-border rounded-xl focus:border-primary focus:ring-primary text-foreground"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                value={field.value || ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1 h-12 border-border bg-card hover:bg-accent text-foreground rounded-xl"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={createAccount.isPending}
                      className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold"
                    >
                      {createAccount.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary-foreground" />
                          Creating...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Form>

        {/* Security Note */}
        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Your account information is encrypted and secure
          </p>
        </div>
      </Card>
      </div>
    </div>
  );
}
