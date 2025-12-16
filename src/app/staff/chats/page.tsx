import StaffLayout from "@/components/StaffLayout";
import ChatManagementAdminComponent from "../../admin/chatManagementAdmin";

export default function StaffChatsPage() {
  return (
    <StaffLayout>
      <ChatManagementAdminComponent userRole="staff" />
    </StaffLayout>
  );
}
