import React, { useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceSettings } from "@/components/workspace/WorkspaceSettings";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateWorkspace } from "@/components/workspace/CreateWorkspace";

export default function WorkspacePage() {
  const { currentWorkspace, setCurrentWorkspace, workspaces } = useWorkspace();
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  
  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error('Failed to fetch user data');
      return response.json();
    }
  });

  // If there's no current workspace and we have user data, check if we need to show create dialog
  useEffect(() => {
    if (!currentWorkspace && !isLoadingUser && user) {
      // Auto-show create dialog when no workspace exists
      setShowCreateDialog(true);
    }
  }, [currentWorkspace, isLoadingUser, user]);

  if (isLoadingUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  // If no workspace is selected, show create or select prompt
  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center p-6">
        <h1 className="text-3xl font-bold mb-4">Workspace Settings</h1>
        <p className="text-gray-600 mb-8 max-w-md">
          You don't have a workspace selected. Create your first workspace to organize your forms and events.
        </p>
        <Button onClick={() => setShowCreateDialog(true)}>
          Create Workspace
        </Button>
        
        {/* Hidden CreateWorkspace component controlled by state */}
        <CreateWorkspace 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            // The workspace will be selected automatically via context
          }}
        />
      </div>
    );
  }

  // If workspace is selected, show the WorkspaceSettings component
  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Workspace Settings</h1>
        <CreateWorkspace 
          trigger={
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" />
              <span>New Workspace</span>
            </Button>
          }
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <WorkspaceSettings
          workspace={currentWorkspace}
          currentUserId={user?.id}
          onClose={() => {}}
          onUpdate={(updated) => setCurrentWorkspace(updated)}
        />
      </div>
      
      {workspaces.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Your Workspaces</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map(workspace => (
              <div 
                key={workspace.id}
                className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                onClick={() => setCurrentWorkspace(workspace)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded flex items-center justify-center text-white"
                    style={{ backgroundColor: workspace.color || '#4f46e5' }}
                  >
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium">{workspace.name}</h3>
                    {workspace.description && (
                      <p className="text-sm text-gray-500">{workspace.description}</p>
                    )}
                  </div>
                </div>
                {currentWorkspace.id === workspace.id && (
                  <div className="mt-2 text-xs text-primary font-medium">
                    Currently selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}