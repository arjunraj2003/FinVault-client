import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  name: z.string(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof formSchema>;

function schemaFor(mode: "login" | "register") {
  return formSchema.superRefine((value, ctx) => {
    if (mode === "register" && value.name.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["name"],
        message: "Name must be at least 2 characters",
      });
    }
  });
}

export function LoginForm({
  mode,
  onModeChange,
}: {
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
}) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  const form = useForm<FormValues>({
    resolver: zodResolver(schemaFor(mode)),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      if (!data.email || !data.password) return;
      if (isRegister) {
        await register({
          name: (data.name ?? "").trim(),
          email: data.email,
          password: data.password,
        });
      } else {
        await login({ email: data.email, password: data.password });
      }
      navigate("/dashboard", { replace: true });
    } catch {
      // error toast is shown by useAuth
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {isRegister && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="••••••••"
                  type="password"
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isRegister ? "Create account" : "Sign In"}
        </Button>
        <button
          type="button"
          className="w-full text-sm text-muted-foreground hover:text-primary"
          onClick={() => onModeChange(isRegister ? "login" : "register")}
        >
          {isRegister ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </form>
    </Form>
  );
}
