import { EmptyState } from "@/components/ui/empty-state"
import { 
  FileText, 
  ExternalLink, 
  Files, 
  Search, 
  MessageSquare, 
  Mail, 
  Image,
  FileQuestion,
  Settings,
  Calendar,
  Clock
} from "lucide-react"
import { useLocation } from "wouter"

export function EmptyStateForForms() {
  const [, setLocation] = useLocation()
  
  return (
    <EmptyState
      title="No Forms Created"
      description="You can create a new form to collect information from your users."
      icons={[FileText, ExternalLink, Files]}
      action={{
        label: "Create Form",
        onClick: () => setLocation("/form-builder/new")
      }}
    />
  )
}

export function EmptyStateForEvents() {
  const [, setLocation] = useLocation()
  
  return (
    <EmptyState
      title="No Events Created"
      description="You can create a new event to manage your bookings and appointments."
      icons={[Calendar, Clock, MessageSquare]}
      action={{
        label: "Create Event",
        onClick: () => setLocation("/event-builder/new")
      }}
    />
  )
}

export function EmptyStateForResponses() {
  return (
    <EmptyState
      title="No Responses Yet"
      description="When users submit your form, their responses will appear here."
      icons={[FileText, Mail]}
    />
  )
}

export function EmptyStateForBookings() {
  return (
    <EmptyState
      title="No Bookings Yet"
      description="When users book appointments for your events, they will appear here."
      icons={[Calendar, Clock]}
    />
  )
}

export function EmptyStateForSearch() {
  return (
    <EmptyState
      title="No Results Found"
      description="Try adjusting your search filters or try a different search term."
      icons={[Search, FileQuestion]}
    />
  )
}

export function EmptyStateWelcome() {
  const [, setLocation] = useLocation()
  
  return (
    <EmptyState
      title="Welcome to tallys!"
      description="Get started by creating your first form or event. tallys makes it easy to collect information and manage bookings."
      icons={[FileText, Calendar, ExternalLink]}
      action={{
        label: "Create Form",
        onClick: () => setLocation("/form-builder/new")
      }}
      className="mx-auto"
    />
  )
}