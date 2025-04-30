import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  ChevronsUpDown, 
  FolderPlus
} from 'lucide-react';
import { CreateWorkspace } from './CreateWorkspace';

interface Workspace {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  icon: string;
  color: string;
  isDefault: boolean;
}

interface WorkspaceSelectorProps {
  onSelect: (workspace: Workspace | null) => void;
  currentWorkspace: Workspace | null;
  showCreateOption?: boolean;
}

export function WorkspaceSelector({ 
  onSelect, 
  currentWorkspace, 
  showCreateOption = true 
}: WorkspaceSelectorProps) {
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch workspaces
  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['/api/workspaces'],
    queryFn: async () => {
      const response = await fetch('/api/workspaces');
      if (!response.ok) {
        throw new Error('Failed to fetch workspaces');
      }
      return response.json();
    },
    retry: 1
  });

  const handleSelectWorkspace = (workspace: Workspace) => {
    onSelect(workspace);
    setOpen(false);
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {currentWorkspace ? (
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-sm" 
                  style={{ backgroundColor: currentWorkspace.color || '#4f46e5' }}
                />
                <span>{currentWorkspace.name}</span>
              </div>
            ) : (
              "Select workspace..."
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search workspace..." />
            <CommandList>
              <CommandEmpty>No workspace found.</CommandEmpty>
              <CommandGroup heading="Your workspaces">
                {workspaces.map((workspace: Workspace) => (
                  <CommandItem
                    key={workspace.id}
                    onSelect={() => handleSelectWorkspace(workspace)}
                    className="flex items-center gap-2"
                  >
                    <div 
                      className="w-3 h-3 rounded-sm flex-shrink-0" 
                      style={{ backgroundColor: workspace.color || '#4f46e5' }}
                    />
                    <span>{workspace.name}</span>
                    {currentWorkspace?.id === workspace.id && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              {showCreateOption && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem onSelect={() => {
                      setOpen(false);
                      setShowCreateDialog(true);
                    }}>
                      <FolderPlus className="mr-2 h-4 w-4" />
                      <span>Create workspace</span>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Use our CreateWorkspace component with controlled state */}
      <CreateWorkspace 
        trigger={<div className="hidden" />}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          // The workspace will be selected automatically via context
        }}
      />
    </div>
  );
}