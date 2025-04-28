import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Download, Calendar, Filter } from "lucide-react";
import { Form, Response, FormQuestion, FormResponse } from "@shared/schema";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FormSubmissionsTableProps {
  form: Form;
  responses: Response[];
  isLoading: boolean;
}

export default function FormSubmissionsTable({
  form,
  responses,
  isLoading
}: FormSubmissionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Extract column headers from questions
  const columns = useMemo(() => {
    return form.questions.map(question => ({
      id: question.id,
      title: question.title,
      type: question.type
    }));
  }, [form.questions]);

  // Format date for display
  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return '';
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  };

  // Get formatted value for cell display
  const getCellValue = (answer: string | string[] | number | null, type: string) => {
    if (answer === null || answer === undefined) return "-";
    
    if (Array.isArray(answer)) {
      return answer.join(", ");
    }
    
    if (type === "date" && typeof answer === "string") {
      try {
        return formatDate(answer);
      } catch (e) {
        return answer;
      }
    }
    
    return answer.toString();
  };

  // Filter responses based on search term
  const filteredResponses = useMemo(() => {
    if (!searchTerm.trim()) return responses;
    
    const term = searchTerm.toLowerCase();
    return responses.filter(response => {
      // Search in all answer values
      return Object.values(response.answers).some(value => {
        if (value === null) return false;
        if (Array.isArray(value)) {
          return value.some(v => v.toLowerCase().includes(term));
        }
        return value.toString().toLowerCase().includes(term);
      });
    });
  }, [responses, searchTerm]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-auto">
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-64 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <CardTitle className="text-lg">
            Submissions ({filteredResponses.length})
          </CardTitle>
          
          <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search submissions..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date Range
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by date</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>All time</DropdownMenuItem>
                  <DropdownMenuItem>Today</DropdownMenuItem>
                  <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                  <DropdownMenuItem>Custom range</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter responses</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Complete responses</DropdownMenuItem>
                  <DropdownMenuItem>Incomplete responses</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredResponses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No submissions found</p>
            {searchTerm && (
              <Button
                variant="link"
                onClick={() => setSearchTerm("")}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-medium text-gray-700 sticky left-0 bg-gray-50 z-10">
                    ID
                  </TableHead>
                  <TableHead className="font-medium text-gray-700 sticky left-[70px] bg-gray-50 z-10">
                    Date Submitted
                  </TableHead>
                  {columns.map((column) => (
                    <TableHead key={column.id} className="font-medium text-gray-700 whitespace-nowrap">
                      {column.title}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses.map((response) => (
                  <TableRow key={response.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium sticky left-0 bg-white z-10 whitespace-nowrap">
                      #{response.id}
                    </TableCell>
                    <TableCell className="text-gray-700 sticky left-[70px] bg-white z-10 whitespace-nowrap">
                      {formatDate(response.createdAt || "")}
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell key={column.id} className="text-gray-700">
                        {response.answers[column.id] !== undefined 
                          ? getCellValue(response.answers[column.id], column.type)
                          : "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}