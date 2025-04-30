import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface Workspace {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  icon: string;
  color: string;
  isDefault: boolean;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  createDefaultWorkspace: (userId: number) => Promise<Workspace>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  
  // Fetch workspaces from API
  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ['/api/workspaces'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/workspaces');
        if (!response.ok) {
          if (response.status === 401) {
            // Not authenticated, return empty array
            return [];
          }
          throw new Error('Failed to fetch workspaces');
        }
        return response.json();
      } catch (error) {
        console.error('Error fetching workspaces:', error);
        return [];
      }
    }
  });

  // Create a default workspace if user doesn't have any
  const createDefaultWorkspace = async (userId: number): Promise<Workspace> => {
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'My Workspace',
          description: 'Default workspace',
          isDefault: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create default workspace');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating default workspace:', error);
      throw error;
    }
  };

  // Set the current workspace when workspaces are loaded
  useEffect(() => {
    if (workspaces?.length > 0 && !currentWorkspace) {
      // Look for default workspace first
      const defaultWorkspace = workspaces.find(workspace => workspace.isDefault);
      if (defaultWorkspace) {
        setCurrentWorkspace(defaultWorkspace);
      } else {
        // Otherwise use the first workspace
        setCurrentWorkspace(workspaces[0]);
      }
    }
  }, [workspaces, currentWorkspace]);

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        isLoading,
        setCurrentWorkspace,
        createDefaultWorkspace
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}