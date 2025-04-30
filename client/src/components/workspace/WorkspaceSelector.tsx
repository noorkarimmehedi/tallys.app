import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Check, 
  ChevronsUpDown, 
  Plus, 
  Users, 
  Folder, 
  FolderPlus, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Create workspace mutation
  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Workspace created',
        description: 'Your new workspace has been created successfully.'
      });
      setNewWorkspaceName('');
      setNewWorkspaceDesc('');
      setCreateDialogOpen(false);
      // Invalidate workspaces query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/workspaces'] });
    },
    onError: () => {
      toast({
        title: 'Failed to create workspace',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  });

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      toast({
        title: 'Workspace name required',
        description: 'Please enter a name for your workspace.',
        variant: 'destructive'
      });
      return;
    }

    createWorkspaceMutation.mutate({
      name: newWorkspaceName,
      description: newWorkspaceDesc
    });
  };

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
                      setCreateDialogOpen(true);
                      setOpen(false);
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

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create new workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your forms and events.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateWorkspace}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  placeholder="My Workspace"
                  className="col-span-3"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  placeholder="Optional description"
                  className="col-span-3"
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createWorkspaceMutation.isPending || !newWorkspaceName.trim()}
              >
                {createWorkspaceMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}