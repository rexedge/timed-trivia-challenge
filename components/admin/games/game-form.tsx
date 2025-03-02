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
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createGame } from "@/app/actions/game-actions";

const formSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  questions: z.array(z.string()).min(1, {
    message: "Select at least one question",
  }),
  answerTime: z.number().min(30).max(600), // 30 seconds to 10 minutes
  resultTime: z.number().min(30).max(600),
  intervalTime: z.number().min(30).max(900), // up to 15 minutes
});

interface GameFormProps {
  questions: Question[];
}

export function GameForm({ questions }: GameFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
      questions: [],
      answerTime: 300, // 5 minutes default
      resultTime: 300,
      intervalTime: 300,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await createGame({
        startTime: new Date(values.startTime),
        endTime: new Date(values.endTime),
        questions: values.questions,
        answerTime: values.answerTime,
        resultTime: values.resultTime,
        intervalTime: values.intervalTime,
      });

      if (!result.success) {
        toast.error(result.message || "Failed to schedule game");
        return;
      }

      toast.success("Game scheduled successfully");
      router.push("/admin/games");
    } catch (error) {
      toast.error("Failed to schedule game");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Game</CardTitle>
        <CardDescription>Set up a new trivia game session</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>When the game will start</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>When the game will end</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add duration fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="answerTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Answer Time (seconds)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={30}
                        max={600}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Time to answer each question
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resultTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Result Time (seconds)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={30}
                        max={600}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Time to display results</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intervalTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval Time (seconds)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={30}
                        max={900}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>Time between questions</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormLabel>Questions</FormLabel>
              <FormDescription>
                Select the questions for this game
              </FormDescription>
              {questions.map((question) => (
                <FormField
                  key={question.id}
                  control={form.control}
                  name="questions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(question.id)}
                          onCheckedChange={(checked) => {
                            const value = field.value || [];
                            if (checked) {
                              field.onChange([...value, question.id]);
                            } else {
                              field.onChange(
                                value.filter((val) => val !== question.id)
                              );
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {question.text}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
              <FormMessage />
            </div>
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
              {isLoading ? "Scheduling..." : "Schedule Game"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
