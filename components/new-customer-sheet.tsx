"use client";

import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import Button from "@/components/custombutton";
import { PhoneInput } from "@/components/phone-input";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { useCreateCustomer } from "@/hooks/use-customers";
import type { Customer } from "@/types/customer";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string(),
});

interface NewCustomerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (customer: Customer) => void;
}

export function NewCustomerSheet({
  open,
  onOpenChange,
  onSuccess,
}: NewCustomerSheetProps) {
  const createCustomer = useCreateCustomer();
  const isLoading = createCustomer.isPending;

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
    validators: {
      onChange: customerSchema,
      onSubmit: customerSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { customer } = await createCustomer.mutateAsync({
          name: value.name,
          email: value.email,
          phone: value.phone || undefined,
        });

        // Reset form and close sheet on success
        form.reset();
        onOpenChange(false);

        // Call success callback with new customer data
        if (onSuccess && customer) {
          onSuccess(customer);
        }
      } catch {
        // Error handling is done in the hook
      }
    },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-y-auto bg-[#F5F6F7]">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-[#EDEDED] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFF4ED] flex items-center justify-center">
              <User className="w-5 h-5 text-[#ff8c32]" />
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold text-[#1F2937]">
                New Customer
              </SheetTitle>
              <p className="text-sm text-[#7F7F7F]">
                Add a new customer to the system
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Form */}
        <div className="p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            <div className="bg-white border border-[#EDEDED] rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-semibold text-[#7F7F7F] uppercase tracking-wider">
                Customer Information
              </h3>

              <FieldGroup className="gap-4">
                {/* Name */}
                <form.Field
                  name="name"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-1">
                        <FieldLabel htmlFor={field.name} className="text-[#211E25] text-sm font-medium">
                          Name <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          placeholder="Enter customer name"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isLoading}
                          className="rounded-lg px-4 py-3 bg-white border-[#EAEAEA] placeholder:text-[#ACACAC] placeholder:text-sm h-[46px]"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                />

                {/* Email */}
                <form.Field
                  name="email"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-1">
                        <FieldLabel htmlFor={field.name} className="text-[#211E25] text-sm font-medium">
                          Email <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id={field.name}
                          type="email"
                          placeholder="Enter email address"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isLoading}
                          className="rounded-lg px-4 py-3 bg-white border-[#EAEAEA] placeholder:text-[#ACACAC] placeholder:text-sm h-[46px]"
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                />

                {/* Phone */}
                <form.Field
                  name="phone"
                  children={(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <Field data-invalid={isInvalid} className="gap-1">
                        <FieldLabel className="text-[#211E25] text-sm font-medium">
                          Phone number <span className="text-[#9CA3AF]">(optional)</span>
                        </FieldLabel>
                        <PhoneInput
                          value={field.state.value}
                          onChange={(value) => field.handleChange(value)}
                          defaultCountry="GB"
                          disabled={isLoading}
                        />
                        {isInvalid && <FieldError errors={field.state.meta.errors} />}
                      </Field>
                    );
                  }}
                />
              </FieldGroup>
            </div>

            {/* Info box */}
            <div className="bg-[#FFF8F3] border border-[#FFE4D1] rounded-xl p-4">
              <p className="text-sm text-[#9A4D1C]">
                An invitation email will be sent to the customer with a link to set their password.
              </p>
            </div>

            {/* Submit button */}
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
                values: state.values,
              })}
              children={({ canSubmit, isSubmitting, values }) => {
                const isFormFilled =
                  values.name.length >= 2 &&
                  values.email.includes("@");
                return (
                  <Button
                    type="submit"
                    disabled={!canSubmit || !isFormFilled}
                    loading={isSubmitting || isLoading}
                    loadingText="Creating..."
                    normalColor="#ff8c32"
                    loadingColor="#e55f00"
                    fullWidth
                    size="md"
                  >
                    Create Customer
                  </Button>
                );
              }}
            />
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
