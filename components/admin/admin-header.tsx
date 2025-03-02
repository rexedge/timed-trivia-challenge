interface AdminHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
}

export function AdminHeader({ heading, text, children }: AdminHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between px-2">
      <div className="grid gap-1">
        <h1 className="font-heading text-3xl md:text-4xl">{heading}</h1>
        {text && <p className="text-lg text-muted-foreground">{text}</p>}
      </div>
      {children}
    </div>
  );
}
