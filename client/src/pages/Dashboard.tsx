import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Member } from "@shared/schema";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MemberTable from "@/components/members/MemberTable";
import EditMemberDialog from "@/components/members/EditMemberDialog";
import { UsersIcon, CheckCircleIcon, ClockIcon } from "lucide-react";

export default function Dashboard() {
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // Fetch members
  const { data: members, isLoading, error } = useQuery<Member[]>({
    queryKey: ["/api/members"],
  });
  
  // Calculate stats
  const totalMembers = members?.length || 0;
  const verifiedMembers = members?.filter(m => m.verified).length || 0;
  
  // Calculate members added this month
  const getNewMembersCount = () => {
    if (!members) return 0;
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return members.filter(member => {
      const memberDate = new Date(member.dateAdded);
      return memberDate >= oneMonthAgo;
    }).length;
  };
  
  const newMembersCount = getNewMembersCount();
  
  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setEditDialogOpen(true);
  };
  
  return (
    <main className="flex-1 overflow-y-auto p-4 bg-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 md:mb-0">Member Dashboard</h2>
        </div>

        {/* Show error if query failed */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Failed to load members. Please try refreshing the page.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Members Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-700">Total Members</h3>
                <span className="text-primary p-2 bg-blue-50 rounded-full">
                  <UsersIcon className="h-5 w-5" />
                </span>
              </div>
              
              {isLoading ? (
                <Skeleton className="h-9 w-16 mt-2" />
              ) : (
                <p className="text-3xl font-bold mt-2">{totalMembers}</p>
              )}
              
              <p className="text-sm text-gray-500 mt-1">Registered members</p>
            </CardContent>
          </Card>
          
          {/* Verified Members Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-700">Verified Members</h3>
                <span className="text-green-500 p-2 bg-green-50 rounded-full">
                  <CheckCircleIcon className="h-5 w-5" />
                </span>
              </div>
              
              {isLoading ? (
                <Skeleton className="h-9 w-16 mt-2" />
              ) : (
                <p className="text-3xl font-bold mt-2">{verifiedMembers}</p>
              )}
              
              <p className="text-sm text-gray-500 mt-1">SSN verified</p>
            </CardContent>
          </Card>
          
          {/* New Members Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-700">Added This Month</h3>
                <span className="text-amber-500 p-2 bg-amber-50 rounded-full">
                  <ClockIcon className="h-5 w-5" />
                </span>
              </div>
              
              {isLoading ? (
                <Skeleton className="h-9 w-16 mt-2" />
              ) : (
                <p className="text-3xl font-bold mt-2">{newMembersCount}</p>
              )}
              
              <p className="text-sm text-gray-500 mt-1">New registrations</p>
            </CardContent>
          </Card>
        </div>

        {/* Members Table with Loading State */}
        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        ) : (
          <MemberTable 
            members={members || []} 
            onEditMember={handleEditMember}
          />
        )}
        
        {/* Edit Member Dialog */}
        <EditMemberDialog
          member={editingMember}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      </div>
    </main>
  );
}
