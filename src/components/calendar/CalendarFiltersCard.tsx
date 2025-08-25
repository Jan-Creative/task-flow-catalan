import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Folder, AlertTriangle, Flag, Star } from "lucide-react";

const CalendarFiltersCard = () => {
  const [selectedFolders, setSelectedFolders] = useState<string[]>(["all"]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(["high", "medium", "low"]);

  const folders = [
    { id: "all", label: "Totes", icon: Folder, color: "text-foreground" },
    { id: "personal", label: "Personal", icon: Folder, color: "text-blue-400" },
    { id: "work", label: "Feina", icon: Folder, color: "text-orange-400" },
    { id: "projects", label: "Projectes", icon: Folder, color: "text-purple-400" }
  ];

  const priorities = [
    { id: "high", label: "Alta", icon: AlertTriangle, color: "text-destructive" },
    { id: "medium", label: "Mitjana", icon: Flag, color: "text-orange-400" },
    { id: "low", label: "Baixa", icon: Star, color: "text-green-400" }
  ];

  const toggleFolder = (folderId: string) => {
    if (folderId === "all") {
      setSelectedFolders(["all"]);
    } else {
      setSelectedFolders(prev => {
        const filtered = prev.filter(id => id !== "all");
        return prev.includes(folderId)
          ? filtered.filter(id => id !== folderId)
          : [...filtered, folderId];
      });
    }
  };

  const togglePriority = (priorityId: string) => {
    setSelectedPriorities(prev =>
      prev.includes(priorityId)
        ? prev.filter(id => id !== priorityId)
        : [...prev, priorityId]
    );
  };

  return (
    <Card className="h-full bg-background/40 backdrop-blur-md border-border/20 shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Filtres</CardTitle>
        <CardDescription>Personalitza la vista del calendari</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Folders Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">CARPETES</h4>
            <Badge variant="secondary" className="text-xs">
              {selectedFolders.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {folders.map((folder) => {
              const Icon = folder.icon;
              const isSelected = selectedFolders.includes(folder.id);
              return (
                <div
                  key={folder.id}
                  onClick={() => toggleFolder(folder.id)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/20 cursor-pointer transition-all duration-200"
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => {}}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Icon className={`h-4 w-4 ${folder.color}`} />
                  <span className="text-sm text-foreground flex-1">{folder.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priorities Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">PRIORITATS</h4>
            <Badge variant="secondary" className="text-xs">
              {selectedPriorities.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {priorities.map((priority) => {
              const Icon = priority.icon;
              const isSelected = selectedPriorities.includes(priority.id);
              return (
                <div
                  key={priority.id}
                  onClick={() => togglePriority(priority.id)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-background/20 cursor-pointer transition-all duration-200"
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => {}}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Icon className={`h-4 w-4 ${priority.color}`} />
                  <span className="text-sm text-foreground flex-1">{priority.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarFiltersCard;