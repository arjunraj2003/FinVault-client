import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateAccount } from "../hooks/use-accounts";
import { Plus, Loader2, Wallet, Landmark, CreditCard, TrendingUp, PiggyBank, X, IndianRupee } from "lucide-react";
import type { AccountType } from "../types";
import { motion, AnimatePresence } from "framer-motion";

const accountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(50, "Account name too long"),
  type: z.enum(["checking", "savings", "credit", "investment"] as const),
  currency: z.string().min(1, "Currency is required"),
  balance: z.number().min(0, "Balance cannot be negative").optional(),
});

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
    color: "text-blue-600",
    gradient: "from-blue-500 to-blue-600",
    lightColor: "bg-blue-50 dark:bg-blue-950/30",
    description: "Everyday spending and transactions",
  },
  savings: {
    icon: PiggyBank,
    label: "Savings",
    color: "text-green-600",
    gradient: "from-green-500 to-green-600",
    lightColor: "bg-green-50 dark:bg-green-950/30",
    description: "Save and grow your money",
  },
  credit: {
    icon: CreditCard,
    label: "Credit",
    color: "text-red-600",
    gradient: "from-red-500 to-red-600",
    lightColor: "bg-red-50 dark:bg-red-950/30",
    description: "Credit cards and loans",
  },
  investment: {
    icon: TrendingUp,
    label: "Investment",
    color: "text-purple-600",
    gradient: "from-purple-500 to-purple-600",
    lightColor: "bg-purple-50 dark:bg-purple-950/30",
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

interface CreateAccountModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateAccountModal({ 
  open: controlledOpen, 
  onOpenChange, 
  trigger 
}: CreateAccountModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const createAccount = useCreateAccount();

  // Use controlled open if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  
  const setIsOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
    if (!value) {
      // Reset form when closing
      setTimeout(() => {
        setStep(1);
        form.reset();
      }, 200);
    }
  };

  const form = useForm({
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

  const onSubmit = async (values: any) => {
    try {
      await createAccount.mutateAsync(values);
      form.reset();
      setStep(1);
      setIsOpen(false);
    } catch (error) {
      // Error handling is managed by react-query
      console.error("Failed to create account:", error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const nextStep = async () => {
    const isValid = await form.trigger(["name", "type"]);
    if (isValid) setStep(2);
  };

  const prevStep = () => setStep(1);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-[#0F1A2F] border-gray-200 dark:border-gray-800">
        {/* Header with close button */}
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
          
          <DialogHeader className="p-0">
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {step === 1 ? "Create New Account" : "Set Up Your Account"}
            </DialogTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {step === 1 
                ? "Choose the type of account you want to create" 
                : "Add some details to get started"}
            </p>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
            <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`} />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4"
                >
                  {/* Account Type Selection */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                                className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                                  isSelected
                                    ? `border-${type === 'checking' ? 'blue' : type === 'savings' ? 'green' : type === 'credit' ? 'red' : 'purple'}-600 bg-${type === 'checking' ? 'blue' : type === 'savings' ? 'green' : type === 'credit' ? 'red' : 'purple'}-50 dark:bg-${type === 'checking' ? 'blue' : type === 'savings' ? 'green' : type === 'credit' ? 'red' : 'purple'}-950/20`
                                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-full ${config.lightColor} flex items-center justify-center mb-2`}>
                                  <Icon className={`h-5 w-5 ${config.color}`} />
                                </div>
                                <p className={`text-sm font-medium ${isSelected ? config.color : 'text-gray-900 dark:text-white'}`}>
                                  {config.label}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 text-left">
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
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Account Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="e.g., Primary Savings" 
                              className="pl-10 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500"
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
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="flex-1 h-12 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
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
                  className="space-y-4"
                >
                  {/* Selected Account Summary */}
                  <div className={`p-4 rounded-xl ${accountTypeConfig[selectedType]?.lightColor} mb-4`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full ${accountTypeConfig[selectedType]?.lightColor} flex items-center justify-center`}>
                        <TypeIcon className={`h-6 w-6 ${accountTypeConfig[selectedType]?.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Creating</p>
                        <p className="font-medium text-gray-900 dark:text-white">
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
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Currency
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                              <SelectValue>
                                {field.value && (
                                  <div className="flex items-center gap-2">
                                    <span>{currencies.find(c => c.code === field.value)?.flag}</span>
                                    <span>{field.value} - {currencies.find(c => c.code === field.value)?.name}</span>
                                    <span className="text-gray-400 ml-auto">{currencies.find(c => c.code === field.value)?.symbol}</span>
                                  </div>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-80">
                            {currencies.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                <div className="flex items-center gap-2">
                                  <span>{currency.flag}</span>
                                  <span className="font-medium">{currency.code}</span>
                                  <span className="text-gray-500 text-sm">- {currency.name}</span>
                                  <span className="text-gray-400 ml-auto">{currency.symbol}</span>
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
                        <FormLabel className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Initial Balance (Optional)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-3.5 text-gray-500">
                              {currencies.find(c => c.code === selectedCurrency)?.symbol || '₹'}
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-8 h-12 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:border-blue-500 focus:ring-blue-500"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                              value={field.value || ''}
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-gray-400 mt-1">
                          Starting balance for this account
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                      className="flex-1 h-12 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={createAccount.isPending}
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    >
                      {createAccount.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
        <div className="px-6 pb-6">
          <p className="text-xs text-center text-gray-400">
            🔒 Your account information is encrypted and secure
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}