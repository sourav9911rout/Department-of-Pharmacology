import PageHeader from "@/components/page-header";
import { requirements } from "@/lib/data";
import RequirementTable from "./components/requirement-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RequirementsPage() {
  const primaryRequirements = requirements.filter((r) => r.type === "Primary");
  const secondaryRequirements = requirements.filter(
    (r) => r.type === "Secondary"
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Requirement List"
        description="Manage primary and secondary requirements for the department."
      />

      <Tabs defaultValue="primary">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="primary">Primary Requirements</TabsTrigger>
          <TabsTrigger value="secondary">Secondary Requirements</TabsTrigger>
        </TabsList>
        <TabsContent value="primary" className="mt-4">
          <RequirementTable data={primaryRequirements} />
        </TabsContent>
        <TabsContent value="secondary" className="mt-4">
          <RequirementTable data={secondaryRequirements} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
