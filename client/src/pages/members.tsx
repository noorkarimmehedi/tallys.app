import React, { useState } from "react";
import { 
  PlusCircle, UserPlus, MoreHorizontal, Search, Check, Mail, X, Shield, ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Mock team members data
const initialMembers = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    role: "Admin",
    avatar: null,
    status: "active",
    lastActive: "Today at 2:34 PM",
  },
  {
    id: 2,
    name: "Sara Williams",
    email: "sara.williams@example.com",
    role: "Editor",
    avatar: null,
    status: "active",
    lastActive: "Yesterday at 11:20 AM",
  },
  {
    id: 3,
    name: "Marcus Chen",
    email: "marcus.chen@example.com",
    role: "Viewer",
    avatar: null,
    status: "pending",
    lastActive: "Invite sent 2 days ago",
  },
  {
    id: 4,
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    role: "Editor",
    avatar: null,
    status: "active",
    lastActive: "Today at 9:15 AM",
  },
];

type RoleType = "Admin" | "Editor" | "Viewer";

const Members = () => {
  const [members, setMembers] = useState(initialMembers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<"name" | "email" | "role">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<RoleType>("Editor");

  // Filter members by search query
  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort members
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const fieldA = a[sortField].toLowerCase();
    const fieldB = b[sortField].toLowerCase();
    
    if (sortDirection === "asc") {
      return fieldA.localeCompare(fieldB);
    } else {
      return fieldB.localeCompare(fieldA);
    }
  });

  // Handle sort click
  const handleSort = (field: "name" | "email" | "role") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  // Handle sending invite
  const handleSendInvite = () => {
    if (!newMemberEmail) return;
    
    // Simple validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      alert("Please enter a valid email address");
      return;
    }
    
    // Create new member
    const newMember = {
      id: members.length + 1,
      name: newMemberEmail.split("@")[0], // Just a placeholder name based on email
      email: newMemberEmail,
      role: newMemberRole,
      avatar: null,
      status: "pending",
      lastActive: "Invite just sent",
    };
    
    setMembers([...members, newMember]);
    setNewMemberEmail("");
    setNewMemberRole("Editor");
    setIsInviteDialogOpen(false);
  };
  
  // Handle changing a member's role
  const handleRoleChange = (memberId: number, newRole: RoleType) => {
    setMembers(
      members.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  };
  
  // Handle removing a member
  const handleRemoveMember = (memberId: number) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      setMembers(members.filter((member) => member.id !== memberId));
    }
  };
  
  // Handle resending an invite
  const handleResendInvite = (memberId: number) => {
    alert(`Invite resent to member #${memberId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members and their access permissions.
          </p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Invite Member</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite a Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join your workspace. They'll receive an email with a link to accept.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  placeholder="colleague@example.com"
                  className="col-span-3"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select 
                  value={newMemberRole} 
                  onValueChange={(value: RoleType) => setNewMemberRole(value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Editor">Editor</SelectItem>
                    <SelectItem value="Viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendInvite}>Send Invite</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Team Members</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b bg-muted/30">
                  <th 
                    className="px-6 py-3 font-medium cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      <span>Name</span>
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 font-medium cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      <span>Email</span>
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 font-medium cursor-pointer"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center">
                      <span>Role</span>
                      <ArrowUpDown className="ml-1 h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.avatar || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground">{member.lastActive}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={member.role}
                        onValueChange={(value: RoleType) => handleRoleChange(member.id, value)}
                        disabled={member.status === "pending"}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">
                            <div className="flex items-center">
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Admin</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Editor">
                            <div className="flex items-center">
                              <PlusCircle className="mr-2 h-4 w-4" />
                              <span>Editor</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="Viewer">
                            <div className="flex items-center">
                              <Check className="mr-2 h-4 w-4" />
                              <span>Viewer</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {member.status === "active" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {member.status === "pending" && (
                            <DropdownMenuItem onClick={() => handleResendInvite(member.id)}>
                              <Mail className="mr-2 h-4 w-4" />
                              <span>Resend Invite</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleRemoveMember(member.id)}>
                            <X className="mr-2 h-4 w-4" />
                            <span>{member.status === "active" ? "Remove" : "Cancel Invite"}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-4 bg-muted/30 border rounded-lg p-4">
        <h3 className="font-medium mb-2">About team roles</h3>
        <div className="text-sm text-muted-foreground space-y-2">
          <p><span className="font-semibold">Admin:</span> Full access to all settings, can manage team members and billing.</p>
          <p><span className="font-semibold">Editor:</span> Can create, edit and publish content, but can't access team settings.</p>
          <p><span className="font-semibold">Viewer:</span> Can only view and interact with published content, with no edit permissions.</p>
        </div>
      </div>
    </div>
  );
};

export default Members;