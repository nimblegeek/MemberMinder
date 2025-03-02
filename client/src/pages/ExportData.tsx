import ExportOptions from "@/components/export/ExportOptions";

export default function ExportData() {
  return (
    <main className="flex-1 overflow-y-auto p-4 bg-slate-100">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Export Member Data</h2>
        <ExportOptions />
      </div>
    </main>
  );
}
