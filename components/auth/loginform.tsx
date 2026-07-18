"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "@/components/ui/sonner";
import { Input } from "../ui/input";
import Password from "../ui/password";
import Button from "../custombutton";
import HeadingGroup from "../headinggroup";
import { Field, FieldLabel, FieldError, FieldGroup } from "../ui/field";
import { authClient, signIn } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

const Loginform = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      await signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: async () => {
            const { data: session } = await authClient.getSession();

            if (!session?.user) {
              toast.error(
                "Signed in, but session cookie was not set. Please try again or clear site cookies.",
              );
              setIsLoading(false);
              return;
            }

            toast.success("Successfully signed in");
            const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
            router.push(
              callbackUrl.startsWith("/") ? callbackUrl : "/dashboard",
            );
            router.refresh();
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Login failed. Please try again.");
          },
        },
      );
      setIsLoading(false);
    },
  });

  return (
    <div className="w-full max-w-md space-y-6">
      <HeadingGroup
        heading="Admin Login"
        description="Sign in to the admin dashboard"
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <FieldGroup className="gap-4">
          <form.Field
            name="email"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid} className="gap-1">
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[0.85rem] font-medium text-gray-900"
                  >
                    Email
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder="Enter your email"
                    className="h-12"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    disabled={isLoading}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <form.Field
            name="password"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid} className="gap-1">
                  <FieldLabel
                    htmlFor={field.name}
                    className="text-[0.85rem] font-medium text-gray-900"
                  >
                    Password
                  </FieldLabel>
                  <Password
                    id={field.name}
                    name={field.name}
                    placeholder="Enter your password"
                    className="h-12"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(value) => field.handleChange(value)}
                    aria-invalid={isInvalid}
                    disabled={isLoading}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </FieldGroup>

        <Button
          type="submit"
          fullWidth
          className="py-6"
          loading={isLoading}
          loadingText="Signing in..."
          disabled={isLoading}
        >
          Login
        </Button>
      </form>
    </div>
  );
};

export default Loginform;
