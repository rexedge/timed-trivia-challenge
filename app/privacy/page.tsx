import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Privacy Policy | Timed Trivia Challenge",
  description: "Privacy policy for Timed Trivia Challenge",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto container max-w-3xl py-6 lg:py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl">
            Privacy Policy
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
            <CardTitle>Information We Collect</CardTitle>
            <CardDescription>
              We collect information you provide directly to us.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <p>When you register for an account, we collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and email address through Google authentication</li>
              <li>Phone number (optional)</li>
              <li>Profession (optional)</li>
            </ul>

            <h3 className="text-lg font-medium">Usage Information</h3>
            <p>We collect information about your use of the game:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Game participation records</li>
              <li>Answers submitted</li>
              <li>Scores and rankings</li>
              <li>Time spent on questions</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
            <CardDescription>
              We use the information we collect for various purposes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain the game service</li>
              <li>To notify you about game schedules and results</li>
              <li>To create and maintain leaderboards</li>
              <li>To prevent fraud and ensure fair play</li>
              <li>To improve and optimize our game experience</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information Sharing</CardTitle>
            <CardDescription>
              How we share your information with others.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>We share your information in the following ways:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Public leaderboards display your name and score</li>
              <li>Service providers who assist in game operations</li>
              <li>When required by law or to protect rights</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Security</CardTitle>
            <CardDescription>How we protect your information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We implement appropriate security measures to protect your
              personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments</li>
              <li>Access controls and authentication</li>
              <li>Secure data storage practices</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
            <CardDescription>
              Your rights regarding your personal information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of communications</li>
              <li>Export your data</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>
              How to reach us with questions about privacy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              If you have questions about this Privacy Policy, please contact us
              at:
            </p>
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
