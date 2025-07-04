
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Edit3, Save, X } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const UserProfile = () => {
  const { profile, updateProfile } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    department: profile?.department || "",
    supervisor: profile?.supervisor || "",
  });
  const { toast } = useToast();

  const handleEdit = () => {
    setFormData({
      name: profile?.name || "",
      phone: profile?.phone || "",
      department: profile?.department || "",
      supervisor: profile?.supervisor || "",
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: profile?.name || "",
      phone: profile?.phone || "",
      department: profile?.department || "",
      supervisor: profile?.supervisor || "",
    });
  };

  const handleSave = async () => {
    const { error } = await updateProfile(formData);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsEditing(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Profile Information</span>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">{profile.name}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="p-2 bg-gray-50 rounded-md text-gray-600">{profile.email}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            {isEditing ? (
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">{profile.phone || "Not provided"}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <div className="p-2 bg-gray-50 rounded-md text-gray-600 capitalize">{profile.role}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            {isEditing ? (
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Enter department"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">{profile.department || "Not assigned"}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supervisor">Supervisor</Label>
            {isEditing ? (
              <Input
                id="supervisor"
                value={formData.supervisor}
                onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                placeholder="Enter supervisor name"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded-md">{profile.supervisor || "Not assigned"}</div>
            )}
          </div>

          {profile.intern_id && (
            <div className="space-y-2">
              <Label htmlFor="internId">Intern ID</Label>
              <div className="p-2 bg-gray-50 rounded-md text-gray-600">{profile.intern_id}</div>
            </div>
          )}

          {profile.join_date && (
            <div className="space-y-2">
              <Label htmlFor="joinDate">Join Date</Label>
              <div className="p-2 bg-gray-50 rounded-md text-gray-600">
                {new Date(profile.join_date).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
