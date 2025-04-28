import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Form } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash, Save, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface FormSettingsProps {
  form: Form;
}

export default function FormSettings({ form }: FormSettingsProps) {
  const [isPublished, setIsPublished] = useState(form.published || false);
  const [, navigate] = useLocation();

  // Mutation to update form settings
  const updateFormMutation = useMutation({
    mutationFn: async (data: Partial<Form>) => {
      const res = await apiRequest("PATCH", `/api/forms/${form.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forms/${form.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      toast({
        title: "Settings updated",
        description: "Form settings have been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update form settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete form
  const deleteFormMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/forms/${form.id}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      toast({
        title: "Form deleted",
        description: "Form has been deleted successfully",
      });
      navigate("/inbox");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete form: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle publish status change
  const handlePublishChange = (checked: boolean) => {
    setIsPublished(checked);
    updateFormMutation.mutate({ published: checked });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Form Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="publish" className="text-base font-medium">Publish Form</Label>
              <p className="text-sm text-gray-500">
                {isPublished 
                  ? "Your form is live and accepting responses" 
                  : "Your form is currently in draft mode"}
              </p>
            </div>
            <Switch 
              id="publish" 
              checked={isPublished} 
              onCheckedChange={handlePublishChange}
            />
          </div>

          <div className="border-t pt-4">
            <Label className="text-base font-medium">Form Privacy</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input 
                  type="radio" 
                  id="public" 
                  name="privacy" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500" 
                  checked 
                  readOnly
                />
                <label htmlFor="public" className="ml-2 block text-sm text-gray-700">
                  Public - Anyone with the link can view and submit
                </label>
              </div>
              <div className="flex items-center opacity-50">
                <input 
                  type="radio" 
                  id="restricted" 
                  name="privacy" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500" 
                  disabled 
                />
                <label htmlFor="restricted" className="ml-2 block text-sm text-gray-700">
                  Restricted - Require login or password (Coming soon)
                </label>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <Label className="text-base font-medium">Response Settings</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="allow-multiple" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500" 
                  checked 
                  readOnly
                />
                <label htmlFor="allow-multiple" className="ml-2 block text-sm text-gray-700">
                  Allow multiple submissions from the same device
                </label>
              </div>
              <div className="flex items-center opacity-50">
                <input 
                  type="checkbox" 
                  id="collect-emails" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500" 
                  disabled 
                />
                <label htmlFor="collect-emails" className="ml-2 block text-sm text-gray-700">
                  Collect email addresses (Coming soon)
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-100">
        <CardHeader>
          <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Deleting this form will permanently remove all form data and responses. This action cannot be undone.
          </p>
        </CardContent>
        <CardFooter>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="h-4 w-4 mr-2" />
                Delete Form
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Delete Form
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this form? This will permanently delete the form and all of its {responses?.length || 0} responses. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => deleteFormMutation.mutate()}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}