"use client";

import { OTPInput, type SlotProps } from "input-otp";
import { useId } from "react";
import { MinusIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface OTPComponentProps {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export default function OTPComponent({ value, onChange, disabled }: OTPComponentProps) {
  const id = useId();
  return (
    <OTPInput
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoFocus
      containerClassName="flex items-center justify-between w-full gap-2 has-disabled:opacity-50"
      maxLength={6}
      render={({ slots }) => (
        <>
          <div className="flex flex-1">
            {slots.slice(0, 3).map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>

          <div className="text-muted-foreground/80">
            <MinusIcon size={16} aria-hidden="true" />
          </div>

          <div className="flex flex-1">
            {slots.slice(3).map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        </>
      )}
    />
  );
}

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "-ms-px relative flex h-14 flex-1 items-center justify-center border border-input bg-white font-medium text-foreground shadow-xs transition-[color,box-shadow] first:ms-0 first:rounded-s-lg last:rounded-e-lg",
        { "z-10 border-ring ring-[3px] ring-ring/50": props.isActive },
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
    </div>
  );
}
