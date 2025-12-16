import AdminLayout from "@/components/AdminLayout";
import ChatManagementAdminComponent from "../chatManagementAdmin";

export default function ChatsPage() {
  return (
    <AdminLayout>
      <ChatManagementAdminComponent userRole="admin" />
    </AdminLayout>
  );
}
