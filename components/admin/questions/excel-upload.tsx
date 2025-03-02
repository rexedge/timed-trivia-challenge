"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react";
import { toast } from "sonner";
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
import { uploadQuestions } from "@/app/actions/question-actions";

interface ExcelQuestion {
  text: string;
  options: string[];
  correctAnswer: string;
}

export function ExcelUpload() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<ExcelQuestion[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
        }) as string[][];

        // Skip header row and process data
        const questions: ExcelQuestion[] = [];
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          if (row.length >= 3) {
            // Ensure row has minimum required columns
            const options = row.slice(1, -1).filter(Boolean); // Get all columns between question and answer
            const question: ExcelQuestion = {
              text: row[0],
              options: options,
              correctAnswer: row[row.length - 1],
            };

            // Validate question
            if (
              question.text &&
              question.options.length >= 2 &&
              question.correctAnswer
            ) {
              if (question.options.includes(question.correctAnswer)) {
                questions.push(question);
              }
            }
          }
        }

        if (questions.length === 0) {
          toast.error("No valid questions found in the file");
          return;
        }

        setPreview(questions);
        setIsOpen(true);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast.error("Error parsing Excel file");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (preview.length === 0) return;

    setIsUploading(true);
    try {
      const result = await uploadQuestions(preview);

      if (!result.success) {
        toast.error(result.message || "Failed to upload questions");
        return;
      }

      toast.success(`Successfully uploaded ${preview.length} questions`);
      router.refresh();
      setIsOpen(false);
      setPreview([]);
    } catch (error) {
      toast.error("Failed to upload questions");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "Question Text",
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4",
        "Correct Answer",
      ],
      ["What is 2 + 2?", "3", "4", "5", "6", "4"],
      [
        "Who wrote Hamlet?",
        "Shakespeare",
        "Dickens",
        "Twain",
        "Poe",
        "Shakespeare",
      ],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Questions Template");
    XLSX.writeFile(wb, "questions-template.xlsx");
  };

  return (
    <div className="flex gap-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <div>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              id="excel-upload"
              onChange={handleFileChange}
            />
            <label htmlFor="excel-upload">
              <Button variant="outline" className="cursor-pointer" asChild>
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Excel
                </span>
              </Button>
            </label>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Questions</DialogTitle>
            <DialogDescription>
              Preview the questions before uploading. Make sure all questions
              have valid options and correct answers.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Question</th>
                  <th className="py-2 px-4 text-left">Options</th>
                  <th className="py-2 px-4 text-left">Correct Answer</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((question, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-4">{question.text}</td>
                    <td className="py-2 px-4">{question.options.join(", ")}</td>
                    <td className="py-2 px-4">{question.correctAnswer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading
                ? "Uploading..."
                : `Upload ${preview.length} Questions`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Button variant="outline" onClick={downloadTemplate}>
        Download Template
      </Button>
    </div>
  );
}
