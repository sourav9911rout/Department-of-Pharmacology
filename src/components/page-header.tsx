import type { FC } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({ title, description, children }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="grid gap-1">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
};

export default PageHeader;
