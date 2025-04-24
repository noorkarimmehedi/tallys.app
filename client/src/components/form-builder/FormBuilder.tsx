import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { QuestionEditor } from "./QuestionEditor";
import { ElementsSidebar } from "./ElementsSidebar";
import { Form, FormQuestion, FormSection, FieldType } from "@shared/schema";
import { createQuestion, createSection, getDefaultFormTheme } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { createFormUrl } from "@/lib/utils";

interface FormBuilderProps {
  id?: string;
}

export function FormBuilder({ id }: FormBuilderProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState("New Form");
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [sections, setSections] = useState<FormSection[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [formUrl, setFormUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionDescription, setNewSectionDescription] = useState("");
  
  // Fetch form if id is provided
  const { data: form, isLoading: isLoadingForm } = useQuery({
    queryKey: [`/api/forms/${id}`],
    enabled: !!id,
  });
  
  // Create form mutation
  const createFormMutation = useMutation({
    mutationFn: async (formData: Partial<Form>) => {
      const response = await apiRequest('POST', '/api/forms', formData);
      return response.json();
    },
    onSuccess: (newForm) => {
      toast({
        title: "Form created",
        description: "Your form has been created successfully",
      });
      navigate(`/form-builder/${newForm.id}`);
      queryClient.invalidateQueries({ queryKey: ['/api/forms'] });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create form",
        variant: "destructive",
      });
    }
  });
  
  // Update form mutation
  const updateFormMutation = useMutation({
    mutationFn: async (formData: Partial<Form>) => {
      const response = await apiRequest('PATCH', `/api/forms/${id}`, formData);
      return response.json();
    },
    onSuccess: (updatedForm) => {
      toast({
        title: "Form saved",
        description: "Your form has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/forms/${id}`] });
      
      if (updatedForm.published) {
        setFormUrl(createFormUrl(updatedForm.shortId));
        setPublishDialogOpen(true);
      }
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save form",
        variant: "destructive",
      });
    }
  });
  
  // Initialize with data if editing existing form
  useEffect(() => {
    if (form && !isLoadingForm) {
      setTitle(form.title);
      setQuestions(form.questions || []);
      setSections(form.sections || []);
      setLoading(false);
    } else if (!id) {
      // New form with default section and question
      const personalInfoSection = createSection('Personal Information', 'Please provide your contact information');
      const nameQuestion = createQuestion('shortText', "What's your name?", personalInfoSection.id);
      
      setQuestions([nameQuestion]);
      setSections([personalInfoSection]);
      setLoading(false);
    }
  }, [form, isLoadingForm, id]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  
  const addQuestion = (type: FieldType) => {
    const newQuestion = createQuestion(type);
    const newQuestions = [...questions, newQuestion];
    setQuestions(newQuestions);
    setCurrentQuestionIndex(newQuestions.length - 1);
  };
  
  const updateQuestion = (questionId: string, updates: Partial<FormQuestion>) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
  };
  
  const deleteQuestion = (questionId: string) => {
    const newQuestions = questions.filter(q => q.id !== questionId);
    
    if (newQuestions.length === 0) {
      // Don't allow deleting all questions, add a default one
      const defaultQuestion = createQuestion('shortText');
      setQuestions([defaultQuestion]);
      setCurrentQuestionIndex(0);
    } else {
      setQuestions(newQuestions);
      
      // Adjust current index if needed
      if (currentQuestionIndex >= newQuestions.length) {
        setCurrentQuestionIndex(newQuestions.length - 1);
      }
    }
  };
  
  const addSection = () => {
    if (!newSectionTitle.trim()) return;
    
    const newSection = createSection(newSectionTitle, newSectionDescription);
    setSections([...sections, newSection]);
    
    // Reset form fields
    setNewSectionTitle('');
    setNewSectionDescription('');
    setSectionDialogOpen(false);
    
    toast({
      title: "Section added",
      description: "New section has been added to the form",
    });
  };
  
  const deleteSection = (sectionId: string) => {
    // Remove section
    const newSections = sections.filter(s => s.id !== sectionId);
    
    // Update questions that were in this section
    const updatedQuestions = questions.map(q => 
      q.sectionId === sectionId ? { ...q, sectionId: undefined } : q
    );
    
    setSections(newSections);
    setQuestions(updatedQuestions);
    
    toast({
      title: "Section deleted",
      description: "Section has been removed from the form",
    });
  };
  
  const navigateQuestion = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (direction === 'next' && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const saveForm = (publish = false) => {
    const formData: Partial<Form> = {
      title,
      questions,
      sections,
      theme: getDefaultFormTheme(),
      published: publish
    };
    
    if (id) {
      updateFormMutation.mutate(formData);
    } else {
      createFormMutation.mutate(formData);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(formUrl);
    toast({
      title: "Copied",
      description: "Form URL copied to clipboard",
    });
  };
  
  return (
    <>
      {/* Form Builder Header */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <i className="ri-arrow-left-line text-xl"></i>
          </Button>
          <div className="ml-4">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Form Title"
              className="text-lg font-medium border-none focus:outline-none font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
            onClick={() => navigate(`/preview/${id || 'new'}`)}
          >
            Preview
          </Button>
          <Button
            size="sm"
            className="bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
            onClick={() => saveForm(true)}
            disabled={createFormMutation.isPending || updateFormMutation.isPending}
          >
            {createFormMutation.isPending || updateFormMutation.isPending ? (
              <span className="animate-spin mr-2">●</span>
            ) : (
              <>Publish</>
            )}
          </Button>
        </div>
      </div>
      
      {/* Form Builder Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Form Editor */}
        <div className="flex-1 flex flex-col overflow-y-auto relative">
          {/* Question Editor */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-xl w-full">
              {currentQuestion && (
                <QuestionEditor 
                  question={currentQuestion} 
                  onChange={updateQuestion}
                  onDelete={() => deleteQuestion(currentQuestion.id)}
                  sections={sections}
                />
              )}
            </div>
          </div>
          
          {/* Question Navigation */}
          <div className="h-16 bg-white border-t border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateQuestion('prev')}
                disabled={currentQuestionIndex === 0}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <i className="ri-arrow-left-line text-xl"></i>
              </Button>
              <span className="mx-4 text-gray-500">{currentQuestionIndex + 1} of {questions.length}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateQuestion('next')}
                disabled={currentQuestionIndex === questions.length - 1}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <i className="ri-arrow-right-line text-xl"></i>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSectionDialogOpen(true)}
                className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
              >
                Manage Sections
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => saveForm()}
                className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
        
        {/* Form Components Sidebar */}
        <ElementsSidebar onAddElement={addQuestion} />
      </div>
      
      {/* Publish Dialog */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide text-xl">Publish Form</DialogTitle>
            <DialogDescription>
              Your form is ready to be published! Here's your shareable link:
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center bg-gray-100 p-2 rounded-md">
            <Input 
              value={formUrl} 
              readOnly 
              className="bg-transparent border-none flex-1 text-sm text-gray-700" 
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={copyToClipboard} 
              className="p-1 text-gray-600 hover:text-gray-900"
            >
              <i className="ri-clipboard-line"></i>
            </Button>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sharing Options</h4>
            <div className="flex space-x-3">
              <Button variant="outline" size="icon" className="p-2">
                <i className="ri-twitter-x-line"></i>
              </Button>
              <Button variant="outline" size="icon" className="p-2">
                <i className="ri-facebook-circle-line"></i>
              </Button>
              <Button variant="outline" size="icon" className="p-2">
                <i className="ri-linkedin-box-line"></i>
              </Button>
              <Button variant="outline" size="icon" className="p-2">
                <i className="ri-mail-line"></i>
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
              onClick={() => {
                setPublishDialogOpen(false);
                navigate("/");
              }}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Section Management Dialog */}
      <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-['Alternate_Gothic', 'sans-serif'] tracking-wide text-xl">Manage Sections</DialogTitle>
            <DialogDescription>
              Organize your form into sections to group related questions together.
            </DialogDescription>
          </DialogHeader>
          
          {/* Current Sections */}
          {sections.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Current Sections</h4>
              <div className="space-y-2">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <h5 className="font-medium">{section.title}</h5>
                      {section.description && (
                        <p className="text-sm text-gray-500">{section.description}</p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteSection(section.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Add New Section */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Section</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="section-title">Section Title</Label>
                <Input
                  id="section-title"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="e.g. Personal Information"
                  className="w-full mt-1"
                />
              </div>
              <div>
                <Label htmlFor="section-description">Description (optional)</Label>
                <Textarea
                  id="section-description"
                  value={newSectionDescription}
                  onChange={(e) => setNewSectionDescription(e.target.value)}
                  placeholder="e.g. Please provide your contact details"
                  className="w-full mt-1"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="sm:w-full"
              onClick={() => setSectionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={addSection}
              disabled={!newSectionTitle.trim()}
              className="sm:w-full bg-black hover:bg-gray-800 font-['Alternate_Gothic', 'sans-serif'] tracking-wide"
            >
              Add Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
