import { useState } from "react";
import { Calendar, Tag, Link, File, Clock, Users, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NoteMetadataPanelProps {
  noteId: string;
}

// Mock data - replace with real data later
const mockMetadata = {
  tags: ["reflexio", "diari", "productivitat"],
  linkedTasks: [
    { id: "1", title: "Revisar documentació", completed: true },
    { id: "2", title: "Preparar presentació", completed: false },
  ],
  linkedEvents: [
    { id: "1", title: "Reunió equip", date: new Date("2024-01-16T10:00:00") },
  ],
  attachments: [
    { id: "1", name: "esquema_projecte.pdf", size: "2.3 MB", type: "pdf" },
  ],
  collaborators: [
    { id: "1", name: "Anna Garcia", initials: "AG" },
    { id: "2", name: "Marc Torres", initials: "MT" },
  ],
  createdAt: new Date("2024-01-15T09:30:00"),
  updatedAt: new Date("2024-01-15T14:20:00"),
  wordCount: 245,
  readingTime: 2,
};

export const NoteMetadataPanel = ({ noteId }: NoteMetadataPanelProps) => {
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim()) {
      // Add tag logic here
      console.log("Adding tag:", newTag);
      setNewTag("");
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    // Remove tag logic here
    console.log("Removing tag:", tag);
  };

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {/* Tags */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Etiquetes
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingTag(true)}
              className="h-6 w-6 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {mockMetadata.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="h-6 cursor-pointer group"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag}
                <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Badge>
            ))}
          </div>
          
          {isAddingTag && (
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Nova etiqueta..."
                className="h-7 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTag();
                  if (e.key === "Escape") setIsAddingTag(false);
                }}
                autoFocus
              />
              <Button size="sm" onClick={handleAddTag} className="h-7 px-2">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Linked Tasks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Link className="h-4 w-4" />
            Tasques enllaçades ({mockMetadata.linkedTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mockMetadata.linkedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer"
            >
              <div className={`h-3 w-3 rounded-full ${task.completed ? 'bg-green-500' : 'bg-muted-foreground'}`} />
              <span className={`text-sm flex-1 ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </span>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full h-8 text-muted-foreground">
            <Plus className="h-3 w-3 mr-2" />
            Enllaçar tasca
          </Button>
        </CardContent>
      </Card>

      {/* Linked Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Esdeveniments enllaçats ({mockMetadata.linkedEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mockMetadata.linkedEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer"
            >
              <Calendar className="h-3 w-3 text-primary" />
              <div className="flex-1">
                <span className="text-sm">{event.title}</span>
                <div className="text-xs text-muted-foreground">
                  {event.date.toLocaleDateString("ca-ES", { 
                    day: "numeric", 
                    month: "short", 
                    hour: "2-digit", 
                    minute: "2-digit" 
                  })}
                </div>
              </div>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full h-8 text-muted-foreground">
            <Plus className="h-3 w-3 mr-2" />
            Enllaçar esdeveniment
          </Button>
        </CardContent>
      </Card>

      {/* Attachments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <File className="h-4 w-4" />
            Adjunts ({mockMetadata.attachments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mockMetadata.attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 cursor-pointer"
            >
              <File className="h-3 w-3 text-blue-500" />
              <div className="flex-1">
                <span className="text-sm">{attachment.name}</span>
                <div className="text-xs text-muted-foreground">{attachment.size}</div>
              </div>
            </div>
          ))}
          <Button variant="ghost" size="sm" className="w-full h-8 text-muted-foreground">
            <Plus className="h-3 w-3 mr-2" />
            Afegir adjunt
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Statistics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Estadístiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Paraules</div>
              <div className="font-medium">{mockMetadata.wordCount}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Lectura</div>
              <div className="font-medium">{mockMetadata.readingTime} min</div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Creat: {mockMetadata.createdAt.toLocaleDateString("ca-ES")}</div>
            <div>Modificat: {mockMetadata.updatedAt.toLocaleDateString("ca-ES")}</div>
          </div>
        </CardContent>
      </Card>

      {/* Collaborators */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Col·laboradors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {mockMetadata.collaborators.map((collaborator) => (
              <Avatar key={collaborator.id} className="h-6 w-6">
                <AvatarFallback className="text-xs">{collaborator.initials}</AvatarFallback>
              </Avatar>
            ))}
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};