"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateQuestion } from "@/app/actions/admin-actions";

interface EditQuestionProps {
  question: {
    id: string;
    text: string;
    options: string;
    correctAnswer: string;
  };
}

export function EditQuestion({ question }: EditQuestionProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: question.text,
    options: [...JSON.parse(question.options)],
    correctAnswer: question.correctAnswer,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateQuestion(question.id, formData);

      if (!result.success) {
        toast.error(result.message || "Failed to update question");
        return;
      }

      toast.success("Question updated successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("An error occurred while updating the question");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Pencil className="h-4 w-4" />
          <span className="">Edit </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
          <DialogDescription>
            Make changes to the question. Click save when done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="text">Question Text</Label>
            <Input
              id="text"
              value={formData.text}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  text: e.target.value,
                }))
              }
              placeholder="Enter the question text"
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Options</Label>
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={addOption}
              disabled={formData.options.length >= 5}
            >
              Add Option
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="correctAnswer">Correct Answer</Label>
            <Select
              value={formData.correctAnswer}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  correctAnswer: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the correct answer" />
              </SelectTrigger>
              <SelectContent>
                {formData.options.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
