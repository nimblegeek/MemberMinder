import { useState } from "react";
import { Member } from "@shared/schema";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { format } from "date-fns";

interface MemberTableProps {
  members: Member[];
  onEditMember: (member: Member) => void;
}

export default function MemberTable({ members, onEditMember }: MemberTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "email" | "date">("name");
  const [filterVerified, setFilterVerified] = useState<"all" | "verified" | "unverified">("all");
  
  // Filter and sort members
  const filteredMembers = members
    .filter(member => {
      // Apply verification filter
      if (filterVerified === "verified" && !member.verified) return false;
      if (filterVerified === "unverified" && member.verified) return false;
      
      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          member.name.toLowerCase().includes(term) ||
          member.email.toLowerCase().includes(term) ||
          member.phone.includes(term)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "email") {
        return a.email.localeCompare(b.email);
      } else if (sortBy === "date") {
        return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
      }
      return 0;
    });
  
  // Mask SSN for display
  const maskSSN = (ssn: string) => {
    const parts = ssn.split('-');
    if (parts.length === 3) {
      return `XXX-XX-${parts[2]}`;
    }
    return 'XXX-XX-XXXX';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center">
        <h3 className="text-lg font-medium text-gray-700 mb-2 md:mb-0">Members List</h3>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
          <Input 
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64"
          />
          
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as "name" | "email" | "date")}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="email">Sort by Email</SelectItem>
              <SelectItem value="date">Sort by Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filterVerified}
            onValueChange={(value) => setFilterVerified(value as "all" | "verified" | "unverified")}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              <SelectItem value="verified">Verified Only</SelectItem>
              <SelectItem value="unverified">Unverified Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>SSN</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((member) => (
                <TableRow key={member.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-slate-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{member.email}</TableCell>
                  <TableCell className="text-sm text-gray-500">{member.phone}</TableCell>
                  <TableCell className="text-sm text-gray-500">{maskSSN(member.ssn)}</TableCell>
                  <TableCell>
                    <Badge variant={member.verified ? "success" : "warning"}>
                      {member.verified ? "Verified" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {format(new Date(member.dateAdded), 'MM/dd/yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEditMember(member)}
                    >
                      <PencilIcon className="h-4 w-4 text-indigo-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                  <p className="text-lg">No members found</p>
                  <p className="text-sm mt-1">Add new members or adjust your search filters</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span>{Math.min(filteredMembers.length, 10)}</span> of <span>{filteredMembers.length}</span> results
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled={filteredMembers.length === 0}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={filteredMembers.length === 0}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
