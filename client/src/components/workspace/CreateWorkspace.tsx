import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { useWorkspace } from '@/contexts/WorkspaceContext';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2 } from 'lucide-react';

interface CreateWorkspaceProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateWorkspace({ 
  trigger, 
  onSuccess, 
  open: controlledOpen, 
  onOpenChange 
}: CreateWorkspaceProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  
  // Determine if this is a controlled or uncontrolled component
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  
  const setOpen = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setUncontrolledOpen(newOpen);
    }
  };
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#4f46e5');
  const { toast } = useToast();
  const { setCurrentWorkspace } = useWorkspace();

  const createWorkspaceMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          color,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Workspace created',
        description: 'Your new workspace has been created successfully.'
      });
      
      // Close the dialog
      setOpen(false);
      
      // Reset form
      setName('');
      setDescription('');
      setColor('#4f46e5');
      
      // Set as current workspace
      setCurrentWorkspace(data);
      
      // Invalidate workspaces query
      queryClient.invalidateQueries({ queryKey: ['/api/workspaces'] });
      
      // Call onSuccess callback if provided
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: 'Failed to create workspace',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Workspace name required',
        description: 'Please enter a name for your workspace.',
        variant: 'destructive'
      });
      return;
    }
    
    createWorkspaceMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            <span>New Workspace</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to organize your forms and events.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workspace"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A workspace for all my projects"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 p-1"
              />
              <div 
                className="w-10 h-10 rounded border border-gray-200"
                style={{ backgroundColor: color }}
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createWorkspaceMutation.isPending || !name.trim()}
            >
              {createWorkspaceMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Workspace'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}