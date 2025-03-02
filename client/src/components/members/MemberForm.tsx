import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMemberSchema, InsertMember, Address } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { InfoIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

// Swedish municipalities (kommuner) for dropdown
const SWEDISH_MUNICIPALITIES = [
  { value: "Stockholm", label: "Stockholm" },
  { value: "Göteborg", label: "Göteborg" },
  { value: "Malmö", label: "Malmö" },
  { value: "Uppsala", label: "Uppsala" },
  { value: "Västerås", label: "Västerås" },
  { value: "Örebro", label: "Örebro" },
  { value: "Linköping", label: "Linköping" },
  { value: "Helsingborg", label: "Helsingborg" },
  { value: "Jönköping", label: "Jönköping" },
  { value: "Norrköping", label: "Norrköping" },
  { value: "Lund", label: "Lund" },
  { value: "Umeå", label: "Umeå" },
  { value: "Gävle", label: "Gävle" },
  { value: "Borås", label: "Borås" },
  { value: "Södertälje", label: "Södertälje" },
  { value: "Eskilstuna", label: "Eskilstuna" },
  { value: "Halmstad", label: "Halmstad" },
  { value: "Växjö", label: "Växjö" },
  { value: "Karlstad", label: "Karlstad" },
  { value: "Sundsvall", label: "Sundsvall" },
  { value: "Östersund", label: "Östersund" },
  { value: "Trollhättan", label: "Trollhättan" },
  { value: "Luleå", label: "Luleå" },
  { value: "Kalmar", label: "Kalmar" },
  { value: "Karlskrona", label: "Karlskrona" },
  { value: "Skellefteå", label: "Skellefteå" },
  { value: "Kristianstad", label: "Kristianstad" },
  { value: "Falun", label: "Falun" },
  { value: "Skövde", label: "Skövde" },
  { value: "Karlskoga", label: "Karlskoga" },
  { value: "Kiruna", label: "Kiruna" },
  { value: "Visby", label: "Visby" },
  { value: "Ystad", label: "Ystad" },
  { value: "Mora", label: "Mora" },
  { value: "Varberg", label: "Varberg" },
  { value: "Nyköping", label: "Nyköping" },
  { value: "Hudiksvall", label: "Hudiksvall" },
  { value: "Borlänge", label: "Borlänge" },
  { value: "Örnsköldsvik", label: "Örnsköldsvik" },
  { value: "Motala", label: "Motala" },
];

export default function MemberForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();
  
  // Default values for form
  const defaultValues: InsertMember = {
    name: "",
    email: "",
    phone: "",
    personnummer: "",
    dob: "",
    address: {
      street: "",
      city: "",
      municipality: "",
      postalCode: ""
    },
    verified: false
  };
  
  // Initialize form
  const form = useForm<InsertMember>({
    resolver: zodResolver(insertMemberSchema),
    defaultValues
  });
  
  // Handle form submission
  const onSubmit = async (data: InsertMember) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", "/api/members", data);
      const result = await response.json();
      
      // Show success notification
      toast({
        title: "Member Added",
        description: result.verificationResult.verified 
          ? "Member added and personnummer verified successfully." 
          : "Member added but personnummer verification pending.",
        variant: "default",
      });
      
      // Reset form
      form.reset(defaultValues);
      
      // Invalidate query to refresh members list
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      
      // Redirect to dashboard
      setLocation("/");
    } catch (error) {
      console.error("Failed to add member:", error);
      toast({
        title: "Failed to add member",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="john@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="+46 70 123 45 67" />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">Format: +46 XX XXX XX XX or 07X-XXX XX XX</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Verification Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Personnummer Verification</h3>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="personnummer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Personnummer</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="YYMMDD-XXXX" />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">Format: YYMMDD-XXXX</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <div className="flex items-start">
                <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="ml-3 text-sm text-blue-700">
                  The system will verify the personnummer against the Swedish national database. Verification typically takes a few seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Address Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Storgatan 1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Stockholm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address.municipality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Municipality</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Municipality" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SWEDISH_MUNICIPALITIES.map((municipality) => (
                        <SelectItem key={municipality.value} value={municipality.value}>
                          {municipality.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address.postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 45" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => form.reset(defaultValues)}
          >
            Reset Form
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              "Add Member"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
