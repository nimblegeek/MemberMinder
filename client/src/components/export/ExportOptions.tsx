import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { exportToCsv } from "@/lib/utils/exportToCsv";
import { Member } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

export default function ExportOptions() {
  const [exportType, setExportType] = useState<"all" | "filtered">("all");
  const [reportFrequency, setReportFrequency] = useState("weekly");
  const [reportFormat, setReportFormat] = useState("csv");
  const [reportEmail, setReportEmail] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  
  const handleExport = async (type: "all" | "filtered") => {
    setIsExporting(true);
    
    try {
      const endpoint = type === "all" 
        ? "/api/members" 
        : "/api/members/filter/verified?status=true";
      
      const response = await apiRequest("GET", endpoint, undefined);
      const members = await response.json() as Member[];
      
      // Prepare data for CSV export
      const csvData = members.map(member => ({
        Name: member.name,
        Email: member.email,
        Phone: member.phone,
        // Mask SSN in the export
        SSN: `XXX-XX-${member.ssn.split('-')[2]}`,
        "Date of Birth": member.dob,
        Address: `${member.address.street}, ${member.address.city}, ${member.address.state} ${member.address.zip}`,
        Verified: member.verified ? "Yes" : "No",
        "Date Added": new Date(member.dateAdded).toLocaleDateString()
      }));
      
      // Generate and download CSV
      exportToCsv(csvData, `member-export-${new Date().toISOString().split('T')[0]}`);
      
      toast({
        title: "Export Successful",
        description: `Successfully exported ${members.length} members to CSV file.`,
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export member data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleScheduleReport = () => {
    // In the real app, this would connect to a scheduler service
    // For now, just show a success message
    toast({
      title: "Report Scheduled",
      description: `Your ${reportFrequency} ${reportFormat} report will be sent to ${reportEmail}`,
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Export Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="col-span-1">
            <CardContent className="pt-5">
              <RadioGroup value={exportType} onValueChange={(value) => setExportType(value as "all" | "filtered")}>
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem value="all" id="export-all" />
                  <Label htmlFor="export-all">All Members</Label>
                </div>
                <p className="text-sm text-gray-500">Export the complete list of members with all data fields.</p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => handleExport("all")}
                  disabled={isExporting}
                >
                  {isExporting ? "Exporting..." : "Export All"}
                </Button>
              </RadioGroup>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardContent className="pt-5">
              <RadioGroup value={exportType} onValueChange={(value) => setExportType(value as "all" | "filtered")}>
                <div className="flex items-center space-x-2 mb-4">
                  <RadioGroupItem value="filtered" id="export-filtered" />
                  <Label htmlFor="export-filtered">Verified Members Only</Label>
                </div>
                <p className="text-sm text-gray-500">Export only members with verified status.</p>
                <Button
                  className="mt-4 w-full"
                  variant="outline"
                  onClick={() => handleExport("filtered")}
                  disabled={isExporting}
                >
                  {isExporting ? "Exporting..." : "Export Verified"}
                </Button>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Scheduled Reports</h3>
        
        <p className="text-sm text-gray-500 mb-4">Configure automatic exports to be delivered to your email on a schedule.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1">
            <Label htmlFor="report-frequency" className="block text-sm font-medium text-gray-700 mb-1">Frequency</Label>
            <Select value={reportFrequency} onValueChange={setReportFrequency}>
              <SelectTrigger id="report-frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="col-span-1">
            <Label htmlFor="report-format" className="block text-sm font-medium text-gray-700 mb-1">Format</Label>
            <Select value={reportFormat} onValueChange={setReportFormat}>
              <SelectTrigger id="report-format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="col-span-1">
            <Label htmlFor="report-email" className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</Label>
            <Input 
              id="report-email" 
              type="email" 
              placeholder="your@email.com"
              value={reportEmail}
              onChange={(e) => setReportEmail(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button 
            onClick={handleScheduleReport}
            disabled={!reportEmail}
          >
            Schedule Report
          </Button>
        </div>
      </div>
    </div>
  );
}
