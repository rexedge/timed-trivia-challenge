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
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { createGame } from "@/app/actions/game-actions";
import { addMinutes, format } from "date-fns";

const formSchema = z.object({
  startTime: z.string(),
  useRandomQuestions: z.boolean(),
  numberOfQuestions: z.number().min(1).max(100),
  selectedQuestions: z.array(z.string()),
  answerTime: z.number().min(5).max(600),
  resultTime: z.number().min(5).max(600),
  intervalTime: z.number().min(5).max(900),
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
      startTime: format(addMinutes(new Date(), 30), "yyyy-MM-dd'T'HH:mm"),
      useRandomQuestions: true,
      numberOfQuestions: 10,
      selectedQuestions: [],
      answerTime: 30, // 30 seconds default
      resultTime: 15, // 15 seconds default
      intervalTime: 15, // 15 seconds default
    },
  });

  const watchStartTime = form.watch("startTime");
  const watchNumberOfQuestions = form.watch("numberOfQuestions");
  const watchAnswerTime = form.watch("answerTime");
  const watchResultTime = form.watch("resultTime");
  const watchIntervalTime = form.watch("intervalTime");
  const watchUseRandomQuestions = form.watch("useRandomQuestions");
  const watchSelectedQuestions = form.watch("selectedQuestions");

  // Calculate end time based on form values
  const calculateEndTime = () => {
    const startTime = new Date(watchStartTime);
    const numberOfQuestions = watchUseRandomQuestions
      ? watchNumberOfQuestions
      : watchSelectedQuestions.length;

    const totalSeconds =
      numberOfQuestions *
      (watchAnswerTime + watchResultTime + watchIntervalTime);

    return addMinutes(startTime, Math.ceil(totalSeconds / 60));
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const selectedQuestions = values.useRandomQuestions
        ? getRandomQuestions(questions, values.numberOfQuestions)
        : values.selectedQuestions;

      const result = await createGame({
        startTime: new Date(values.startTime),
        endTime: calculateEndTime(),
        questions: selectedQuestions,
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

  // Get random questions helper
  function getRandomQuestions(questions: Question[], count: number): string[] {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map((q) => q.id);
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
              name="useRandomQuestions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Random Questions
                    </FormLabel>
                    <FormDescription>
                      Randomly select questions for the game
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {watchUseRandomQuestions ? (
              <FormField
                control={form.control}
                name="numberOfQuestions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Questions</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={questions.length}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      How many random questions to include (max:{" "}
                      {questions.length})
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="space-y-4">
                <FormLabel>Questions</FormLabel>
                <FormDescription>
                  Select specific questions for this game
                </FormDescription>
                {questions.map((question) => (
                  <FormField
                    key={question.id}
                    control={form.control}
                    name="selectedQuestions"
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
            )}

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
                        min={5}
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
                        min={5}
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
                        min={5}
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

            <div className="rounded-lg border p-4 bg-muted">
              <p className="text-sm font-medium">Game Duration Summary</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start: {format(new Date(watchStartTime), "PPp")}
                <br />
                End: {format(calculateEndTime(), "PPp")}
                <br />
                Total Questions:{" "}
                {watchUseRandomQuestions
                  ? watchNumberOfQuestions
                  : watchSelectedQuestions.length}
                <br />
                Total Duration:{" "}
                {Math.ceil(
                  ((watchUseRandomQuestions
                    ? watchNumberOfQuestions
                    : watchSelectedQuestions.length) *
                    (watchAnswerTime + watchResultTime + watchIntervalTime)) /
                    60
                )}{" "}
                minutes
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between mt-4">
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
