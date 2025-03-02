"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { GameSettings } from "@prisma/client";
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
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateGameSettings } from "@/app/actions/admin-actions";
import { toast } from "sonner";

const formSchema = z.object({
  gameStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Must be in format HH:MM",
  }),
  gameEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Must be in format HH:MM",
  }),
  questionInterval: z.number().min(1).max(60),
  questionDuration: z.number().min(1).max(10),
});

interface GameSettingsFormProps {
  settings: GameSettings | null;
}

export function GameSettingsForm({ settings }: GameSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gameStartTime: settings?.gameStartTime || "12:00",
      gameEndTime: settings?.gameEndTime || "15:45",
      questionInterval: settings?.questionInterval || 15,
      questionDuration: settings?.questionDuration || 5,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await updateGameSettings(values);
      if (!result.success) {
        toast.error("Error", {
          description: result.message,
        });
      } else {
        toast.error("Success", {
          description: "Game settings updated successfully",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update game settings",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Game Settings</CardTitle>
        <CardDescription>Configure default game parameters</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="gameStartTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormDescription>
                    Default time when games start each day
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gameEndTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Game End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormDescription>
                    Default time when games end each day
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="questionInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Interval (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Time between questions (default: 15 minutes)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="questionDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Time allowed to answer each question (default: 5 minutes)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
