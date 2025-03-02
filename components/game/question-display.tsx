"use client";

import { useState } from "react";
import { Question } from "@prisma/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { QuestionTimer } from "./question-timer";

interface QuestionDisplayProps {
  question: Question;
  displayTime: Date;
  duration: number;
  onSubmit: (answer: string) => Promise<void>;
  onTimeUp: () => void;
  disabled?: boolean;
}

export function QuestionDisplay({
  question,
  displayTime,
  duration,
  onSubmit,
  onTimeUp,
  disabled = false,
}: QuestionDisplayProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const options = JSON.parse(question.options);

  const handleSubmit = async () => {
    if (!selectedAnswer || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedAnswer);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{question.text}</CardTitle>
        <QuestionTimer
          startTime={displayTime}
          duration={duration}
          onTimeUp={onTimeUp}
        />
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedAnswer}
          onValueChange={setSelectedAnswer}
          className="space-y-3"
          disabled={disabled || isSubmitting}
        >
          {options.map((option: string, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option}
                id={`option-${index}`}
                disabled={disabled || isSubmitting}
              />
              <Label htmlFor={`option-${index}`}>{option}</Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer || disabled || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Submitting..." : "Submit Answer"}
        </Button>
      </CardFooter>
    </Card>
  );
}
