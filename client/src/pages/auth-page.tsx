import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const { user, loginMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect to dashboard if user is already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="flex min-h-screen">
      {/* Form Section */}
      <div className="flex items-center justify-center w-full md:w-1/2 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Member Management System</CardTitle>
            <CardDescription>
              Login to access the secure member database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      type="text" 
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Registration Form */}
              <TabsContent value="register">
                <form className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input 
                      id="register-username" 
                      type="text" 
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input 
                      id="display-name" 
                      type="text" 
                      placeholder="Your full name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input 
                      id="register-password" 
                      type="password" 
                      placeholder="Choose a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Register
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Secure access for authorized staff only
            </p>
          </CardFooter>
        </Card>
      </div>
      
      {/* Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-primary p-8 flex-col justify-center items-center text-white">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">Member Management System</h1>
          <p className="text-lg mb-6">
            A comprehensive solution for managing member data securely. Easily add
            members, verify their information, and export data for reporting.
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Secure Access</h3>
              <p className="text-sm">Protected member data with role-based permissions</p>
            </div>
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <h3 className="font-medium mb-2">SSN Verification</h3>
              <p className="text-sm">Verify member identity through secure SSN validation</p>
            </div>
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Data Export</h3>
              <p className="text-sm">Generate reports and export data in multiple formats</p>
            </div>
            <div className="bg-primary-foreground/10 p-4 rounded-lg">
              <h3 className="font-medium mb-2">User Management</h3>
              <p className="text-sm">Administer staff accounts and access permissions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}