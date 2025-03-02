import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="mx-auto px-4 container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{" "}
            <Link
              href="https://twitter.com/apoyeniran"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Paul of ISCE
            </Link>
            . The source code is available on{" "}
            <Link
              href="https://github.com/rexedge/timed-trivia-challenge"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
