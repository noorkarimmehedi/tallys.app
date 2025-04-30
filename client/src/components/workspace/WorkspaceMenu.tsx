import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { WorkspaceSelector } from './WorkspaceSelector';
import { WorkspaceSettings } from './WorkspaceSettings';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Folder, Settings } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface WorkspaceMenuProps {
  userId: number;
}

export function WorkspaceMenu({ userId }: WorkspaceMenuProps) {
  const { currentWorkspace, setCurrentWorkspace, workspaces } = useWorkspace();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Fetch user data for ID
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json();
    }
  });

  return (
    <div className="flex items-center gap-2">
      <div className="w-48">
        <WorkspaceSelector
          currentWorkspace={currentWorkspace}
          onSelect={setCurrentWorkspace}
        />
      </div>
      
      {currentWorkspace && (
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Workspace Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px]">
            <WorkspaceSettings
              workspace={currentWorkspace}
              currentUserId={userId}
              onClose={() => setIsSettingsOpen(false)}
              onUpdate={(updated) => {
                setCurrentWorkspace(updated);
                setIsSettingsOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}