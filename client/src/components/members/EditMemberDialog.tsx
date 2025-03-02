import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Member } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

interface EditMemberDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditMemberDialog({ 
  member, 
  open, 
  onOpenChange 
}: EditMemberDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update local state when member changes
  if (member && (!editingMember || editingMember.id !== member.id)) {
    setEditingMember({ ...member });
  }
  
  if (!editingMember) return null;
  
  const handleInputChange = (field: keyof Member, value: string | boolean) => {
    setEditingMember(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };
  
  const handleSave = async () => {
    if (!editingMember) return;
    
    setIsSubmitting(true);
    try {
      await apiRequest("PATCH", `/api/members/${editingMember.id}`, {
        name: editingMember.name,
        email: editingMember.email,
        phone: editingMember.phone,
        verified: editingMember.verified
      });
      
      // Success notification
      toast({
        title: "Member Updated",
        description: "Member information has been updated successfully.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/members"] });
      
      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update member:", error);
      toast({
        title: "Update Failed",
        description: "Could not update member information.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              value={editingMember.name} 
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={editingMember.email} 
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input 
              id="phone" 
              value={editingMember.phone} 
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ssn">SSN</Label>
            <Input 
              id="ssn" 
              value={editingMember.ssn} 
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500">SSN cannot be edited</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="verified" 
              checked={editingMember.verified} 
              onCheckedChange={(checked) => {
                handleInputChange("verified", checked === true);
              }}
            />
            <Label htmlFor="verified" className="text-sm font-normal">
              Mark as verified
            </Label>
          </div>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <p className="ml-3 text-sm text-yellow-700">
              Changes to member data will be logged for audit purposes.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
