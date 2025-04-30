import React, { useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useQuery } from "@tanstack/react-query";
import { WorkspaceSettings } from "@/components/workspace/WorkspaceSettings";
import { Loader2 } from "lucide-react";
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
        <h1 className="text-3xl font-bold mb-4">Workspace</h1>
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Workspace: {currentWorkspace.name}</h1>
        <p className="text-gray-500">{currentWorkspace.description}</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border">
        <WorkspaceSettings
          workspace={currentWorkspace}
          currentUserId={user?.id}
          onClose={() => {}}
          onUpdate={(updated) => setCurrentWorkspace(updated)}
        />
      </div>
    </div>
  );
}