"use client";

import { Button } from "@/components/ui/button";
import { SendIcon, SquareIcon, UploadIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ChatInput({
  title,
  placeholder = "Ask anything...",
  models,
  allowFileUpload,
  loading,
  handleSubmit,
  handleInputChange,
  input = "",
  className,
  model = "",
  onModelChange,
  stop,
}: {
  handleSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  handleInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  input?: string;
  className?: string;
  model: string;
  onModelChange?: (model: string) => void;
  title?: string;
  placeholder?: string;
  models: { id: string; name: string; description: string }[];
  allowFileUpload?: boolean;
  loading?: boolean;
  stop?: () => void;
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full relative flex flex-col gap-4 items-center", className)}
    >
      {title && <h2 className="text-5xl font-medium tracking-tight">{title}</h2>}
      <Textarea
        name="prompt"
        value={input}
        onChange={handleInputChange}
        disabled={loading}
        autoComplete="off"
        placeholder={placeholder}
        className="w-full pb-20 pt-4 px-4 rounded-xl text-md bg-background disabled:opacity-100 disabled:cursor-not-allowed disabled:bg-background"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
      />
      <Button
        type={loading ? "button" : "submit"}
        onClick={() => {
          if (stop) {
            stop();
          }
        }}
        disabled={!stop && loading}
        variant="fancy"
        size="icon"
        className="absolute bottom-2 right-2"
      >
        {loading ? <SquareIcon className="w-4 h-4" /> : <SendIcon className="w-4 h-4" />}
      </Button>
      {onModelChange && models && (
        <div className="flex items-center gap-2 absolute bottom-0 left-0">
          <Select value={model} onValueChange={(value) => onModelChange(value)}>
            <SelectTrigger className="w-[200px] shadow-none pl-4 hover:bg-transparent hover:text-foreground focus-visible:ring-0 border-none bg-transparent text-xs text-muted-foreground dark:bg-transparent">
              <SelectValue>
                {models.find((m) => m.id === model)?.name || "Select a model"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-xl shadow-gray-200">
              {models.map((model) => (
                <SelectItem
                  key={model.id}
                  value={model.id}
                  className="rounded-lg focus:bg-primary/5"
                >
                  <div className="flex flex-col">
                    <span>{model.name}</span>
                    <span className="text-xs text-muted-foreground">{model.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {allowFileUpload && (
            <Button variant="outline" size="icon">
              <UploadIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
