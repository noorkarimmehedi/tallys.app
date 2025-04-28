import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Form as FormType } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AlertTriangle, Settings } from "lucide-react";

interface FormSettingsProps {
  form: FormType;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  published: z.boolean().default(false),
  redirectUrl: z.string().optional(),
  submitButtonText: z.string().default("Submit"),
});

type FormValues = z.infer<typeof formSchema>;

export default function FormSettings({ form }: FormSettingsProps) {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  // Create form with default values from the current form
  const formMethods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: form.title,
      published: form.published || false,
      redirectUrl: form.metadata?.redirectUrl || "",
      submitButtonText: form.metadata?.submitButtonText || "Submit",
    },
  });
  
  // Update form settings mutation
  const updateFormMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await apiRequest("PATCH", `/api/forms/${form.id}`, values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forms/${form.id}`] });
      toast({
        title: "Form settings updated",
        description: "Your form settings have been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update form settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete form mutation
  const deleteFormMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/forms/${form.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Form deleted",
        description: "Your form has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
      setLocation("/inbox");
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete form",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  function onSubmit(values: FormValues) {
    updateFormMutation.mutate(values);
  }
  
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">General Settings</CardTitle>
          <CardDescription>
            Manage your form's title, status, and submission behavior.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...formMethods}>
            <form id="settings-form" onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={formMethods.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter form title" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the title displayed at the top of your form.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={formMethods.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Publish Form</FormLabel>
                      <FormDescription>
                        When enabled, your form will be accessible to anyone with the link.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={formMethods.control}
                name="submitButtonText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Submit Button Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Submit" {...field} />
                    </FormControl>
                    <FormDescription>
                      Customize the text on the form's submit button.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={formMethods.control}
                name="redirectUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Redirect URL (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/thank-you" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Redirect users to this URL after form submission. Leave blank to show the default thank you page.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            type="submit"
            form="settings-form"
            disabled={updateFormMutation.isPending}
            className="ml-auto"
          >
            {updateFormMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-red-600 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete this form and all of its data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Once you delete a form, there is no going back. This action permanently removes the form, all of its questions, and all of its responses.
          </p>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Form</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center text-red-600">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Delete Form
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this form? This will permanently delete the form and all of its responses. This action cannot be undone.
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