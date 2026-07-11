"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Reorder } from "motion/react";
import { format, parse } from "date-fns";
import { GripVertical, Trash2, Pencil, ExternalLink, CalendarIcon, ArrowLeft } from "lucide-react";
import { useQuoteStore, type QuoteItem } from "@/stores/quote-store";
import { useUpdateCustomer } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/custombutton";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

const AddItemIcon = () => (
  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.582 4.24996V5.96412C15.582 7.08329 14.8737 7.79163 13.7545 7.79163H11.332V2.84037C11.332 2.05412 11.9766 1.41663 12.7629 1.41663C13.535 1.42371 14.2433 1.73537 14.7533 2.24537C15.2633 2.76246 15.582 3.47079 15.582 4.24996Z" stroke="#493D39" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1.41797 4.95829V14.875C1.41797 15.4629 2.08381 15.7958 2.55131 15.4416L3.76255 14.535C4.04588 14.3225 4.44256 14.3508 4.69756 14.6058L5.87338 15.7887C6.14963 16.065 6.60297 16.065 6.87922 15.7887L8.06922 14.5987C8.31713 14.3508 8.7138 14.3225 8.99005 14.535L10.2013 15.4416C10.6688 15.7887 11.3346 15.4558 11.3346 14.875V2.83329C11.3346 2.05413 11.9721 1.41663 12.7513 1.41663H4.95964H4.2513C2.1263 1.41663 1.41797 2.68454 1.41797 4.24996V4.95829Z" stroke="#493D39" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4.42578 7.08337H8.32161" stroke="#493D39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.375 9.03121V5.13538" stroke="#493D39" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface QuoteFormProps {
  requestId?: string | null;
}

/**
 * Quote Form Component
 * Right panel form for creating/editing a quote
 */
export function QuoteForm({ requestId }: QuoteFormProps) {
  const router = useRouter();
  const updateCustomer = useUpdateCustomer();
  const [issueDateOpen, setIssueDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPostalCode, setEditPostalCode] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [showAddress, setShowAddress] = useState(true);

  const {
    customer,
    setCustomer,
    title,
    setTitle,
    issueDate,
    dueDate,
    items,
    salesTaxType,
    salesTaxValue,
    setIssueDate,
    setDueDate,
    setSalesTaxType,
    setSalesTaxValue,
    addItem,
    removeItem,
    updateItem,
    reorderItems,
    getTaxAmount,
  } = useQuoteStore();

  const handleEditCustomer = () => {
    setEditAddress(customer?.address || "");
    setEditCity(customer?.city || "");
    setEditState(customer?.state || "");
    setEditPostalCode(customer?.postalCode || "");
    setEditPhone(customer?.phone || "");
    setShowAddress(customer?.showAddress !== false);
    setIsEditingCustomer(true);
  };

  // Update customer in store for live preview
  const updateCustomerField = (updates: Partial<typeof customer>) => {
    if (customer) {
      setCustomer({
        ...customer,
        ...updates,
      });
    }
  };

  const handleToggleShowAddress = () => {
    const newShowAddress = !showAddress;
    setShowAddress(newShowAddress);
    updateCustomerField({ showAddress: newShowAddress });
  };

  const handleAddressChange = (field: string, value: string) => {
    switch (field) {
      case "address":
        setEditAddress(value);
        updateCustomerField({ address: value });
        break;
      case "city":
        setEditCity(value);
        updateCustomerField({ city: value });
        break;
      case "state":
        setEditState(value);
        updateCustomerField({ state: value });
        break;
      case "postalCode":
        setEditPostalCode(value);
        updateCustomerField({ postalCode: value });
        break;
      case "phone":
        setEditPhone(value);
        updateCustomerField({ phone: value });
        break;
    }
  };

  const handleSaveCustomerDetails = async () => {
    if (!customer) return;

    try {
      await updateCustomer.mutateAsync({
        customerId: customer.id,
        data: {
          phone: editPhone || undefined,
          address: editAddress || undefined,
          city: editCity || undefined,
          state: editState || undefined,
          postalCode: editPostalCode || undefined,
          showAddress: showAddress,
        },
      });
      setIsEditingCustomer(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleViewRequest = () => {
    if (requestId) {
      router.push(`/requests/details/${requestId}`);
    }
  };

  // Edit Customer Details View
  if (isEditingCustomer && customer) {
    return (
      <div className="p-5 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditingCustomer(false)}
            className="h-8 w-8 p-0 text-[#97999D] hover:text-[#494F57]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold text-[#494F57]">Edit Customer</h2>
            <p className="text-xs text-[#97999D]">Update address details for this invoice</p>
          </div>
        </div>

        {/* Customer Name */}
        <div className="mb-4">
          <div className="text-xs font-medium text-[#97999D] uppercase tracking-wider mb-2">
            Customer Name
          </div>
          <div className="flex items-center gap-2.5 p-3 bg-[#F8F8F8] rounded-lg border border-[#EAEAEA]">
            <UserAvatar id={customer.id} name={customer.name} size="sm" />
            <div className="font-medium text-sm text-[#494F57]">{customer.name}</div>
          </div>
        </div>

        {/* Customer Email */}
        <div className="mb-4">
          <div className="text-xs font-medium text-[#97999D] uppercase tracking-wider mb-2">
            Customer Email
          </div>
          <div className="p-3 bg-[#F8F8F8] rounded-lg border border-[#EAEAEA] text-sm text-[#494F57]">
            {customer.email}
          </div>
        </div>

        {/* Customer Address */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-medium text-[#97999D] uppercase tracking-wider">
              Customer Address
            </div>
            <button
              type="button"
              onClick={handleToggleShowAddress}
              className="flex items-center gap-2 text-xs text-[#81868C]"
            >
              Show address
              <div
                className={cn(
                  "w-9 h-5 rounded-full transition-colors relative",
                  showAddress ? "bg-[#ff8c32]" : "bg-[#E5E7EB]"
                )}
              >
                <div
                  className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                    showAddress ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </div>
            </button>
          </div>
          <Input
            placeholder="Street address..."
            value={editAddress}
            onChange={(e) => handleAddressChange("address", e.target.value)}
            className="h-10 bg-white border-[#EAEAEA] mb-2"
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder="State"
              value={editState}
              onChange={(e) => handleAddressChange("state", e.target.value)}
              className="h-10 bg-white border-[#EAEAEA]"
            />
            <Input
              placeholder="City"
              value={editCity}
              onChange={(e) => handleAddressChange("city", e.target.value)}
              className="h-10 bg-white border-[#EAEAEA]"
            />
            <Input
              placeholder="Postal code"
              value={editPostalCode}
              onChange={(e) => handleAddressChange("postalCode", e.target.value)}
              className="h-10 bg-white border-[#EAEAEA]"
            />
          </div>
        </div>

        {/* Customer Phone */}
        <div className="mb-4">
          <div className="text-xs font-medium text-[#97999D] uppercase tracking-wider mb-2">
            Customer Phone
          </div>
          <Input
            placeholder="Enter phone number..."
            value={editPhone}
            onChange={(e) => handleAddressChange("phone", e.target.value)}
            className="h-10 bg-white border-[#EAEAEA]"
          />
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsEditingCustomer(false)}
            disabled={updateCustomer.isPending}
            className="flex-1 rounded-full h-10 border-[#D1D5DB] text-[#494F57] shadow-none"
          >
            Cancel
          </Button>
          <CustomButton
            onClick={handleSaveCustomerDetails}
            loading={updateCustomer.isPending}
            loadingText="Saving..."
            normalColor="#ff8c32"
            textColor="white"
            className="flex-1"
          >
            Save and continue
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-[#494F57]">Create a Quote</h2>
        {requestId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewRequest}
            className="text-[#97999D] hover:text-[#494F57] h-8 px-2"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View request
          </Button>
        )}
      </div>

      {/* Quote Title */}
      <div className="mb-4">
        <div className="text-xs font-medium text-[#97999D] uppercase tracking-wider mb-2">
          Quote Title
        </div>
        <Input
          placeholder="e.g. Kitchen Sink Repair, Boiler Installation..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-10 bg-white border-[#EAEAEA]"
        />
      </div>

      {/* Customer Info */}
      <div className="mb-4">
        <div className="text-xs font-medium text-[#97999D] uppercase tracking-wider mb-2">
          Customer Info
        </div>
        <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-[#EAEAEA]">
          {customer ? (
            <>
              <div className="flex items-center gap-2.5">
                <UserAvatar id={customer.id} name={customer.name} size="sm" />
                <div>
                  <div className="font-medium text-sm text-[#494F57]">{customer.name}</div>
                  <div className="text-xs text-[#81868C]">{customer.email}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditCustomer}
                className="h-7 w-7 p-0 text-[#97999D] hover:text-[#494F57]"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <div className="text-[#97999D] text-sm">No customer selected</div>
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <label className="text-xs font-medium text-[#97999D] uppercase tracking-wider mb-1.5 block">
            Issue Date
          </label>
          <Popover open={issueDateOpen} onOpenChange={setIssueDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-9 justify-start text-left font-normal bg-white border-[#EAEAEA] text-sm shadow-none",
                  !issueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-[#97999D]" />
                {issueDate ? format(parse(issueDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 shadow-none border border-[#EAEAEA]" align="start">
              <Calendar
                mode="single"
                selected={issueDate ? parse(issueDate, "yyyy-MM-dd", new Date()) : undefined}
                onSelect={(date) => {
                  setIssueDate(date ? format(date, "yyyy-MM-dd") : "");
                  setIssueDateOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="text-xs font-medium text-[#97999D] uppercase tracking-wider mb-1.5 block">
            Due Date
          </label>
          <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-9 justify-start text-left font-normal bg-white border-[#EAEAEA] text-sm shadow-none",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-[#97999D]" />
                {dueDate ? format(parse(dueDate, "yyyy-MM-dd", new Date()), "dd/MM/yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 shadow-none border border-[#EAEAEA]" align="end">
              <Calendar
                mode="single"
                selected={dueDate ? parse(dueDate, "yyyy-MM-dd", new Date()) : undefined}
                onSelect={(date) => {
                  setDueDate(date ? format(date, "yyyy-MM-dd") : "");
                  setDueDateOpen(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-[#DADADA] -mx-5 mb-4" />

      {/* Items */}
      <div className="flex-1 mb-4">
        <div className="flex items-center gap-1 mb-2 text-xs font-medium text-[#97999D] uppercase tracking-wider">
          <div className="w-4" />
          <div className="flex-[4]">Item Name</div>
          <div className="flex-[1.5] text-center">Qty</div>
          <div className="flex-[2] text-center">Price</div>
          <div className="w-6" />
        </div>

        <Reorder.Group
          axis="y"
          values={items}
          onReorder={reorderItems}
          className="space-y-1.5"
        >
          {items.map((item) => (
            <Reorder.Item
              key={item.id}
              value={item}
              className="flex items-center gap-1"
            >
              {/* Drag Handle */}
              <div className="w-4 flex-shrink-0 cursor-grab active:cursor-grabbing text-[#BEBEBE] hover:text-[#888]">
                <GripVertical className="h-4 w-4" />
              </div>

              {/* Item Name */}
              <div className="flex-[4]">
                <Input
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  className="h-11 bg-white border-[#EAEAEA] text-sm"
                />
              </div>

              {/* Quantity */}
              <div className="flex-[1.5]">
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, "quantity", parseInt(e.target.value) || 1)
                  }
                  className="h-10 bg-white border-[#EAEAEA] text-center text-sm"
                />
              </div>

              {/* Price */}
              <div className="flex-[2]">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(item.id, "unitPrice", e.target.value)}
                  className="h-11 bg-white border-[#EAEAEA] text-sm"
                />
              </div>

              {/* Delete */}
              <div className="w-6 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                  className="h-6 w-6 p-0 text-[#C4C4C4] hover:text-[#FF1603] hover:bg-[#FFF8F8] disabled:opacity-30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>

        {/* Add Item Button */}
        <CustomButton
          onClick={addItem}
          normalColor="#E9E6E5"
          textColor="#493D39"
          fullWidth
          size="sm"
          className="mt-2"
          style={{ borderRadius: 8, border: "1px solid #E2DDDB" }}
        >
          <AddItemIcon />
          Add Item
        </CustomButton>
      </div>

      {/* Sales Tax */}
      <div>
        <div className="text-xs font-medium text-[#97999D] uppercase tracking-wider mb-2">
          Sales Tax
        </div>
        <div className="flex items-center gap-2">
          {/* Animated Tax Type Toggle */}
          <div className="flex bg-[#E8E8E8] rounded-lg p-1 gap-1">
            <button
              type="button"
              onClick={() => setSalesTaxType("percentage")}
              className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                salesTaxType === "percentage"
                  ? "text-[#494F57]"
                  : "text-[#97999D] hover:text-[#494F57]"
              }`}
            >
              {salesTaxType === "percentage" && (
                <motion.div
                  layoutId="tax-type-indicator"
                  className="absolute inset-0 bg-white rounded-md border border-[#D1D5DB]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">%</span>
            </button>
            <button
              type="button"
              onClick={() => setSalesTaxType("fixed")}
              className={`relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                salesTaxType === "fixed"
                  ? "text-[#494F57]"
                  : "text-[#97999D] hover:text-[#494F57]"
              }`}
            >
              {salesTaxType === "fixed" && (
                <motion.div
                  layoutId="tax-type-indicator"
                  className="absolute inset-0 bg-white rounded-md border border-[#D1D5DB]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">£</span>
            </button>
          </div>

          {/* Tax Value Input with symbol inside */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#97999D]">
              {salesTaxType === "percentage" ? "%" : "£"}
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={salesTaxValue}
              onChange={(e) => setSalesTaxValue(e.target.value)}
              className="h-10 pl-7 bg-white border-[#EAEAEA]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
