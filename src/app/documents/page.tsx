import PageHeader from "@/components/page-header";
import { documentLinks } from "@/lib/data";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderGit2 } from "lucide-react";
import Link from "next/link";

export default function DocumentsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Documents & Resources"
        description="Access official documents, SOPs, and guidelines from Google Drive."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {documentLinks.map((doc) => (
          <Link href={doc.driveLink} key={doc.id} target="_blank" rel="noopener noreferrer">
            <Card className="hover:border-primary hover:bg-primary/5 transition-all">
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="p-3 bg-secondary rounded-lg">
                    <FolderGit2 className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle>{doc.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {doc.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
