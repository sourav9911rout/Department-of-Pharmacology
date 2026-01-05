import PageHeader from "@/components/page-header";
import { procuredItems } from "@/lib/data";
import ItemTable from "./components/item-table";
import { ItemDialog } from "./components/item-dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function ProcuredItemsPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Procured Items"
        description="Track all items procured by the department."
      >
        <ItemDialog>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Add New Item
            </Button>
        </ItemDialog>
      </PageHeader>
      <ItemTable data={procuredItems} />
    </div>
  );
}
