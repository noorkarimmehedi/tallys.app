import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Users, Trash2, UserPlus, Edit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Workspace {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  icon: string;
  color: string;
  isDefault: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

interface WorkspaceMember {
  id: number;
  workspaceId: number;
  userId: number;
  role: string;
  createdAt: string;
  user?: User;
}

interface WorkspaceSettingsProps {
  workspace: Workspace;
  currentUserId: number;
  onClose: () => void;
  onDelete?: () => void;
  onUpdate?: (workspace: Workspace) => void;
}

export function WorkspaceSettings({ 
  workspace, 
  currentUserId,
  onClose,
  onDelete,
  onUpdate
}: WorkspaceSettingsProps) {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || '');
  const [color, setColor] = useState(workspace.color || '#4f46e5');
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [addMemberRole, setAddMemberRole] = useState('viewer');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isOwner = workspace.ownerId === currentUserId;

  // Fetch workspace members
  const { data: members = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: [`/api/workspaces/${workspace.id}/members`],
    queryFn: async () => {
      const response = await fetch(`/api/workspaces/${workspace.id}/members`);
      if (!response.ok) {
        throw new Error('Failed to fetch workspace members');
      }
      return response.json();
    }
  });

  // Update workspace
  const updateWorkspaceMutation = useMutation({
    mutationFn: async (data: Partial<Workspace>) => {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update workspace');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Workspace updated',
        description: 'Workspace details have been updated successfully.'
      });
      if (onUpdate) onUpdate(data);
    },
    onError: () => {
      toast({
        title: 'Failed to update workspace',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  });

  // Delete workspace
  const deleteWorkspaceMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/workspaces/${workspace.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete workspace');
      }
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Workspace deleted',
        description: 'Workspace has been deleted successfully.'
      });
      // Close dialog and call the onDelete callback
      setIsDeleteDialogOpen(false);
      onClose();
      if (onDelete) onDelete();
      
      // Invalidate workspaces query to refetch
      queryClient.invalidateQueries({ queryKey: ['/api/workspaces'] });
    },
    onError: () => {
      toast({
        title: 'Failed to delete workspace',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  });

  // Add member
  const addMemberMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const response = await fetch(`/api/workspaces/${workspace.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add member');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Member added',
        description: 'Member has been added to the workspace successfully.'
      });
      setAddMemberEmail('');
      
      // Invalidate members query to refetch
      queryClient.invalidateQueries({ 
        queryKey: [`/api/workspaces/${workspace.id}/members`] 
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add member',
        description: error?.message || 'Please try again later.',
        variant: 'destructive'
      });
    }
  });

  // Remove member
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      const response = await fetch(`/api/workspaces/${workspace.id}/members/${memberId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove member');
      }
      
      return true;
    },
    onSuccess: () => {
      toast({
        title: 'Member removed',
        description: 'Member has been removed from the workspace.'
      });
      
      // Invalidate members query to refetch
      queryClient.invalidateQueries({ 
        queryKey: [`/api/workspaces/${workspace.id}/members`] 
      });
    },
    onError: () => {
      toast({
        title: 'Failed to remove member',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  });

  // Update member role
  const updateMemberRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: number; role: string }) => {
      const response = await fetch(`/api/workspaces/${workspace.id}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update member role');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Role updated',
        description: 'Member role has been updated successfully.'
      });
      
      // Invalidate members query to refetch
      queryClient.invalidateQueries({ 
        queryKey: [`/api/workspaces/${workspace.id}/members`] 
      });
    },
    onError: () => {
      toast({
        title: 'Failed to update role',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    }
  });

  const handleUpdateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Workspace name required',
        description: 'Please enter a name for your workspace.',
        variant: 'destructive'
      });
      return;
    }

    updateWorkspaceMutation.mutate({
      name,
      description,
      color
    });
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMemberEmail.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address.',
        variant: 'destructive'
      });
      return;
    }

    addMemberMutation.mutate({
      email: addMemberEmail,
      role: addMemberRole
    });
  };

  const handleDeleteWorkspace = () => {
    deleteWorkspaceMutation.mutate();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return <span className="text-yellow-600 font-medium">Owner</span>;
      case 'admin':
        return <span className="text-blue-600 font-medium">Admin</span>;
      case 'editor':
        return <span className="text-green-600 font-medium">Editor</span>;
      case 'viewer':
      default:
        return <span className="text-gray-600 font-medium">Viewer</span>;
    }
  };

  return (
    <div className="w-full">
      <Tabs defaultValue="details">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span>Details</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Members</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Details</CardTitle>
              <CardDescription>
                Update your workspace information here.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateWorkspace}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isOwner}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={!isOwner}
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
                      disabled={!isOwner}
                    />
                    <div 
                      className="w-10 h-10 rounded border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                    <Input
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="flex-1"
                      disabled={!isOwner}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {isOwner && (
                  <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" type="button">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Workspace
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          workspace and remove all associated forms and events data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteWorkspace}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    type="button" 
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  {isOwner && (
                    <Button 
                      type="submit" 
                      disabled={updateWorkspaceMutation.isPending || !name.trim()}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateWorkspaceMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Members</CardTitle>
              <CardDescription>
                Manage the members of your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isOwner && (
                <form onSubmit={handleAddMember} className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="memberEmail">Add Member</Label>
                    <div className="flex gap-3">
                      <Input
                        id="memberEmail"
                        placeholder="Email address"
                        value={addMemberEmail}
                        onChange={(e) => setAddMemberEmail(e.target.value)}
                        className="flex-1"
                      />
                      <select
                        value={addMemberRole}
                        onChange={(e) => setAddMemberRole(e.target.value)}
                        className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button 
                        type="submit" 
                        disabled={addMemberMutation.isPending || !addMemberEmail.trim()}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </form>
              )}
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500">Current Members</h3>
                {isLoadingMembers ? (
                  <div className="text-center py-4">Loading members...</div>
                ) : (
                  <div className="border rounded-md divide-y">
                    {members.map((member: WorkspaceMember) => (
                      <div key={member.id} className="flex items-center justify-between p-3">
                        <div className="flex-1">
                          <div className="font-medium">
                            {member.user?.displayName || member.user?.username || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.user?.email}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getRoleLabel(member.role)}
                          
                          {isOwner && member.userId !== workspace.ownerId && (
                            <div className="flex items-center gap-2">
                              <select
                                value={member.role}
                                onChange={(e) => 
                                  updateMemberRoleMutation.mutate({
                                    memberId: member.userId,
                                    role: e.target.value
                                  })
                                }
                                className="h-8 px-2 py-1 rounded-md border border-input bg-background text-sm"
                              >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                                <option value="admin">Admin</option>
                              </select>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => 
                                  removeMemberMutation.mutate(member.userId)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {members.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No members found in this workspace.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}