import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function BlocoMaterial({ titulo, icone: Icone, children, className }) {
  return (
    <Card className={cn("mb-6 rounded-xl shadow-md", className)}>
      <CardContent className="p-6">
        {titulo && (
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            {Icone && <Icone className="text-blue-600" size={20} />}
            {titulo}
          </h2>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
