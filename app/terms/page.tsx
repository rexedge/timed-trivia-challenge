import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Terms of Service | Timed Trivia Challenge",
  description: "Terms of service for Timed Trivia Challenge",
};

export default function TermsPage() {
  return (
    <div className="mx-auto container max-w-3xl py-6 lg:py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
      <Separator className="my-4" />
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              By accessing and using Timed Trivia Challenge, you accept and
              agree to be bound by the terms and conditions of this agreement.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Game Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-medium">2.1 Game Schedule</h3>
            <p>
              Games run between 12:00 PM and 3:45 PM, with questions appearing
              every 15 minutes.
            </p>

            <h3 className="text-lg font-medium">2.2 Scoring</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Correct answers: 10 points</li>
              <li>Speed bonus based on answer time</li>
              <li>No points for incorrect answers</li>
            </ul>

            <h3 className="text-lg font-medium">2.3 Fair Play</h3>
            <p>
              Users must not cheat, use automated systems, or engage in any
              behavior that gives them an unfair advantage.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-medium">3.1 Registration</h3>
            <p>
              Users must register with valid information and maintain account
              security.
            </p>

            <h3 className="text-lg font-medium">3.2 Account Termination</h3>
            <p>
              We reserve the right to terminate accounts for violations of these
              terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              All content, including questions, graphics, and software, is owned
              by Timed Trivia Challenge and protected by copyright laws.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We are not liable for any indirect, incidental, or consequential
              damages arising from your use of the service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We reserve the right to modify these terms at any time. Continued
              use of the service constitutes acceptance of new terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              These terms are governed by the laws of [Your Jurisdiction],
              without regard to its conflict of law principles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>For any questions about these terms, please contact:</p>
            <p className="font-medium">support@timedtrivia.com</p>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
