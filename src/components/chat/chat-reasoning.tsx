import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { UIDataTypes, UIMessagePart, UITools } from "ai";
import React from "react";

export default function ChatReasoning({
  partsInAccordion,
  defaultValue,
  renderMessagePart,
  className,
}: {
  partsInAccordion: UIMessagePart<UIDataTypes, UITools>[];
  defaultValue?: string;
  renderMessagePart: (
    part: UIMessagePart<UIDataTypes, UITools>,
    key: string | number
  ) => React.ReactNode;
  className?: string;
}) {
  const [value, setValue] = React.useState<string | undefined>(defaultValue);

  React.useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <Accordion
      type="single"
      collapsible
      value={value}
      onValueChange={setValue}
      className={cn("w-full", className)}
    >
      <AccordionItem value="reasoning" className="w-full">
        <AccordionTrigger className="text-md text-muted-foreground hover:no-underline hover:opacity-70 py-2 w-full">
          {defaultValue === "reasoning" ? "Reasoning..." : `Done reasoning.`}
        </AccordionTrigger>
        <AccordionContent className="p-0 -mt-1">
          <div className="flex flex-col gap-0">
            {partsInAccordion.map(
              (part, index) =>
                part.type !== "step-start" && (
                  <div key={index} className="flex gap-2 pl-2">
                    <div className="flex flex-col items-center gap-1 pt-2 -mb-1">
                      <div className="w-2 h-2 bg-muted-foreground/50 rounded-full" />
                      <div
                        className={cn(
                          "w-0.5 min-h-0 flex-1 bg-border rounded-full",
                          index === partsInAccordion.length - 1 &&
                            "bg-gradient-to-b from-border to-transparent"
                        )}
                      />
                    </div>
                    <div className="flex-1">{renderMessagePart(part, `accordion-${index}`)}</div>
                  </div>
                )
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
