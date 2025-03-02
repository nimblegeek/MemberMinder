import MemberForm from "@/components/members/MemberForm";

export default function AddMember() {
  return (
    <main className="flex-1 overflow-y-auto p-4 bg-slate-100">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Add New Member</h2>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <MemberForm />
        </div>
      </div>
    </main>
  );
}
