"use client";

import { useQuoteStore } from "@/stores/quote-store";

/**
 * Invoice Preview Component
 * Live preview of the quote/invoice that updates in real-time
 */
export function InvoicePreview() {
  const {
    customer,
    issueDate,
    dueDate,
    items,
    quoteNumber,
    getSubtotal,
    getTaxAmount,
    getTotal,
    salesTaxType,
    salesTaxValue,
  } = useQuoteStore();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  // Filter items that have content
  const displayItems = items.filter(
    (item) => item.description || parseFloat(item.unitPrice) > 0
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E0E0E0] p-6 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-lg font-bold">
            <span className="text-[#ff8c32]">FAIL</span>
            <span className="text-[#494F57]">2FIX</span>
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="text-[#97999D]">Invoice Date</div>
          <div className="text-[#494F57] font-semibold">{formatDate(issueDate)}</div>
        </div>
      </div>

      {/* Invoice Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#494F57] mb-1">Invoice</h1>
        <div className="text-[#97999D] text-sm">#{quoteNumber}</div>
        <div className="text-right text-sm -mt-8">
          <div className="text-[#97999D]">Due Date</div>
          <div className="text-[#494F57] font-semibold">{formatDate(dueDate)}</div>
        </div>
      </div>

      {/* From / To Section */}
      <div className="grid grid-cols-2 gap-8 mb-6 text-sm">
        <div>
          <div className="text-[#97999D] mb-2">From</div>
          <div className="text-[#494F57] font-semibold">Fail2Fix Ltd</div>
          <div className="text-[#81868C]">support@fail2fix.com</div>
          <div className="text-[#81868C]">London, UK</div>
        </div>
        <div className="text-right">
          <div className="text-[#97999D] mb-2">To</div>
          {customer ? (
            <>
              <div className="text-[#494F57] font-semibold">{customer.name}</div>
              {customer.phone && <div className="text-[#81868C]">{customer.phone}</div>}
              <div className="text-[#81868C]">{customer.email}</div>
              {customer.showAddress !== false && (customer.address || customer.city || customer.state || customer.postalCode) && (
                <div className="text-[#81868C]">
                  {customer.address && <div>{customer.address}</div>}
                  {(customer.city || customer.state || customer.postalCode) && (
                    <div>
                      {[customer.city, customer.state, customer.postalCode].filter(Boolean).join(", ")}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-[#C4C4C4] italic">No customer selected</div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-1 mb-6">
        <div className="border-t border-b border-[#EAEAEA] py-3">
          <div className="grid grid-cols-12 text-sm font-semibold text-[#494F57]">
            <div className="col-span-5">Item</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-center">Price</div>
            <div className="col-span-3 text-right">Total</div>
          </div>
        </div>

        <div className="py-2 space-y-2 min-h-[100px]">
          {displayItems.length > 0 ? (
            displayItems.map((item) => {
              const itemTotal = item.quantity * (parseFloat(item.unitPrice) || 0);
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-12 text-sm text-[#81868C] py-1"
                >
                  <div className="col-span-5 truncate">
                    {item.description || <span className="text-[#C4C4C4]">—</span>}
                  </div>
                  <div className="col-span-2 text-center">{item.quantity}</div>
                  <div className="col-span-2 text-center">
                    {item.unitPrice ? `£${item.unitPrice}` : <span className="text-[#C4C4C4]">—</span>}
                  </div>
                  <div className="col-span-3 text-right">
                    {itemTotal > 0 ? `£${formatCurrency(itemTotal)}` : <span className="text-[#C4C4C4]">—</span>}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-[#C4C4C4] text-sm py-8">
              Add items to see preview
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Footer & Totals */}
      <div className="mt-auto flex justify-between items-end">
        {/* Footer */}
        <div className="text-xs text-[#97999D]">Fail2fix.com</div>

        {/* Totals */}
        <div className="w-72 rounded-xl border border-[#EAEAEA] overflow-hidden bg-white">
          {/* Subtotal & Tax */}
          <div className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[#81868C]">Subtotal</span>
              <span className="text-[#494F57] font-medium">£{formatCurrency(getSubtotal())}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#81868C]">
                Tax {salesTaxType === "percentage" && salesTaxValue ? `(${salesTaxValue}%)` : ""}
              </span>
              <span className="text-[#494F57] font-medium">£{formatCurrency(getTaxAmount())}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#EAEAEA]" />

          {/* Total Due */}
          <div className="p-4 flex justify-between items-center">
            <span className="text-[#494F57] font-semibold">Total Due</span>
            <span className="text-xl font-semibold text-[#494F57]">
              £{formatCurrency(getTotal())}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
