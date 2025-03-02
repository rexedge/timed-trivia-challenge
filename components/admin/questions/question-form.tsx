"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Question } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createQuestion, updateQuestion } from "@/app/actions/question-actions";

const formSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  options: z.array(z.string()).min(2, "At least two options are required"),
  correctAnswer: z.string().min(1, "Correct answer is required"),
});

interface QuestionFormProps {
  question?: Question;
}

export function QuestionForm({ question }: QuestionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<string[]>(
    question ? JSON.parse(question.options) : ["", ""]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: question?.text || "",
      options: question ? JSON.parse(question.options) : ["", ""],
      correctAnswer: question?.correctAnswer || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const action = question
        ? updateQuestion(question.id, values)
        : createQuestion(values);

      const result = await action;

      if (!result.success) {
        toast.error("Error", {
          description: result.message || "Something went wrong",
        });
        return;
      }

      toast.success("Success", {
        description: `Question ${
          question ? "updated" : "created"
        } successfully`,
      });
      router.push("/admin/questions");
    } catch (error) {
      toast.error("Error", {
        description: "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const addOption = () => {
    setOptions([...options, ""]);
    form.setValue("options", [...options, ""]);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    form.setValue("options", newOptions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{question ? "Edit Question" : "New Question"}</CardTitle>
        <CardDescription>
          {question
            ? "Update your trivia question"
            : "Create a new trivia question"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <FormLabel>Options</FormLabel>
              {options.map((_, index) => (
                <FormField
                  key={index}
                  control={form.control}
                  name={`options.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        {options.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeOption(index)}
                          >
                            ×
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <Button type="button" variant="outline" onClick={addOption}>
                Add Option
              </Button>
            </div>
            <FormField
              control={form.control}
              name="correctAnswer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correct Answer</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : question ? "Update" : "Create"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
