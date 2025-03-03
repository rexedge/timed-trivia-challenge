"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { updateGame } from "@/app/actions/game-actions";

interface EditGameProps {
  game: {
    id: string;
    startTime: Date;
    endTime: Date;
    status: string;
    questions: {
      id: string;
      question: {
        id: string;
        text: string;
      };
    }[];
  };
  availableQuestions: {
    id: string;
    text: string;
  }[];
}

export function EditGame({ game, availableQuestions }: EditGameProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    startTime: new Date(game.startTime),
    endTime: new Date(game.endTime),
    questions: game.questions.map((q) => q.question.id),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateGame(game.id, formData);

      if (!result.success) {
        toast.error(result.message || "Failed to update game");
        return;
      }

      toast.success("Game updated successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("An error occurred while updating the game");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit game</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Game</DialogTitle>
          <DialogDescription>
            Make changes to the game schedule and questions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startTime && "text-muted-foreground"
                    )}
                  >
                    {formData.startTime ? (
                      format(formData.startTime, "PPP p")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startTime}
                    onSelect={(date) =>
                      date &&
                      setFormData((prev) => ({
                        ...prev,
                        startTime: date,
                      }))
                    }
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <input
                      type="time"
                      className="w-full"
                      value={format(formData.startTime, "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":");
                        const newDate = new Date(formData.startTime);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setFormData((prev) => ({
                          ...prev,
                          startTime: newDate,
                        }));
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Time</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endTime && "text-muted-foreground"
                    )}
                  >
                    {formData.endTime ? (
                      format(formData.endTime, "PPP p")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endTime}
                    onSelect={(date) =>
                      date &&
                      setFormData((prev) => ({
                        ...prev,
                        endTime: date,
                      }))
                    }
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <input
                      type="time"
                      className="w-full"
                      value={format(formData.endTime, "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":");
                        const newDate = new Date(formData.endTime);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setFormData((prev) => ({
                          ...prev,
                          endTime: newDate,
                        }));
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Questions</label>
            <div className="space-y-4">
              {formData.questions.map((questionId, index) => (
                <div key={index} className="flex gap-2">
                  <Select
                    value={questionId}
                    onValueChange={(value) => {
                      const newQuestions = [...formData.questions];
                      newQuestions[index] = value;
                      setFormData((prev) => ({
                        ...prev,
                        questions: newQuestions,
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a question" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableQuestions.map((question) => (
                        <SelectItem key={question.id} value={question.id}>
                          {question.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        questions: prev.questions.filter((_, i) => i !== index),
                      }));
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    questions: [...prev.questions, ""],
                  }));
                }}
              >
                Add Question
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
