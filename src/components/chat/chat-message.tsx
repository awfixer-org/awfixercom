"use client";

import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";
import Markdown from "@/components/ui/markdown";
import React from "react";
import { ToolUIPart, UIMessage } from "ai";
import ChatReasoning from "@/components/chat/chat-reasoning";
import ChatTool from "@/components/chat/chat-tool";

const userMessageVariants = cva("flex flex-col gap-2", {
  variants: {
    variant: {
      raised:
        "bg-gradient-to-b from-primary to-primary/80 border border-primary text-primary-foreground shadow-lg shadow-slate-200/50 dark:shadow-none max-w-2xs ml-auto rounded-xl px-4 py-2 font-medium",
      title: "font-semibold tracking-tight text-3xl mt-4 border-b border-primary/30 pb-1",
      default: "bg-primary/20 max-w-2xs ml-auto rounded-xl px-4 py-2",
    },
  },
});
const assistantMessageVariants = cva("flex flex-col gap-2", {
  variants: {
    variant: {
      raised:
        "bg-gradient-to-b from-muted to-muted/50 rounded-xl px-4 py-2 border shadow-md shadow-foreground/5 dark:shadow-none mr-8",
      paragraph: "",
      default: "bg-muted rounded-xl px-4 py-2 mr-8",
    },
  },
});

// Helper function to render a single message part
const renderMessagePart = (part: any, key: string | number) => {
  if (part.type.includes("tool")) {
    return (
      <ChatTool
        toolMessagePart={part as ToolUIPart}
        className="my-1 border-none px-0 py-0 shadow-none text-muted-foreground"
      />
    );
  } else if (part.type === "text") {
    return <Markdown key={key}>{part.text}</Markdown>;
  } else if (part.type === "reasoning") {
    return (
      <Markdown key={key} className="text-sm text-muted-foreground">
        {part.text}
      </Markdown>
    );
  }
  return <div key={key}>{part.type}</div>;
};

export default function ChatMessage({
  message,
  className,
  userMessageVariant = "default",
  assistantMessageVariant = "default",
}: {
  message: UIMessage;
  className?: string;
  userMessageVariant?: VariantProps<typeof userMessageVariants>["variant"];
  assistantMessageVariant?: VariantProps<typeof assistantMessageVariants>["variant"];
}) {
  if (message.role === "user") {
    return (
      <div
        className={cn(userMessageVariants({ variant: userMessageVariant }), className)}
        role="user"
      >
        {message.parts.map((part) => part.type === "text" && part.text).join("")}
      </div>
    );
  }

  const firstTextIndex = message.parts.findIndex((part) => part.type === "text");
  const hasTextPart = firstTextIndex !== -1;

  const shouldShowAccordion = firstTextIndex !== 0;
  const accordionDefaultValue = !hasTextPart ? "reasoning" : null;
  const partsInAccordion = shouldShowAccordion ? message.parts.slice(0, firstTextIndex) : [];
  const partsAfter = hasTextPart ? message.parts.slice(firstTextIndex) : [];

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div
        className={cn(
          "flex flex-col gap-1 relative",
          assistantMessageVariants({ variant: assistantMessageVariant })
        )}
      >
        {shouldShowAccordion && (
          <ChatReasoning
            renderMessagePart={renderMessagePart}
            partsInAccordion={partsInAccordion}
            defaultValue={accordionDefaultValue ?? undefined}
          />
        )}
        {partsAfter.map((part, index) => renderMessagePart(part, firstTextIndex + index))}
      </div>
    </div>
  );
}
