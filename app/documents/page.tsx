"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { Download, Trash, UploadCloud, FolderOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Dummy data for demonstration
const initialFiles = [
  { id: 1, name: "Report.pdf", type: "application/pdf", date: "2024-05-01", size: "1.2MB" },
  { id: 2, name: "Photo.png", type: "image/png", date: "2024-05-02", size: "800KB" },
  { id: 3, name: "Notes.txt", type: "text/plain", date: "2024-05-03", size: "12KB" },
  { id: 4, name: "Draft.docx", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", date: "2024-05-04", size: "56KB" },
]

export default function DocumentsPage() {
  const { data: session } = useSession()
  const [selected, setSelected] = useState<number[]>([])
  const [files, setFiles] = useState(initialFiles)
  const [driveFolderUrl, setDriveFolderUrl] = useState<string | null>(null)
  const { toast } = useToast();

  function toggleSelect(id: number) {
    setSelected(sel => sel.includes(id) ? sel.filter(i => i !== id) : [...sel, id])
  }
  function selectAll() {
    setSelected(files.map(f => f.id))
  }
  function clearSelection() {
    setSelected([])
  }
  function handleExportToDrive() {
    // TODO: Call backend to export selected files to Google Drive and get folder URL
    setDriveFolderUrl("https://drive.google.com/drive/folders/AGORA_AI_FOLDER_ID")
  }
  function handleDownload(id: number) {
    const file = files.find(f => f.id === id);
    if (file) {
      toast({
        title: "Download",
        description: `Downloading ${file.name}`,
      });
    }
  }
  function handleDelete(id: number) {
    // TODO: Delete file logic
    setFiles(files => files.filter(f => f.id !== id))
    setSelected(sel => sel.filter(i => i !== id))
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Your Documents</h1>
      <div className="mb-4 flex gap-2 items-center">
        <Button variant="outline" onClick={selectAll}>Select All</Button>
        <Button variant="outline" onClick={clearSelection}>Clear Selection</Button>
        {selected.length > 0 && (
          <Button onClick={handleExportToDrive} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center gap-2">
            <UploadCloud className="h-5 w-5" /> Export to Google Drive
          </Button>
        )}
        {driveFolderUrl && (
          <Button asChild variant="outline" className="flex items-center gap-2">
            <a href={driveFolderUrl} target="_blank" rel="noopener noreferrer">
              <FolderOpen className="h-5 w-5 text-blue-500" /> Open AgoraAI Folder
            </a>
          </Button>
        )}
      </div>
      <div className="bg-white dark:bg-[#18181b] rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left">
                <input type="checkbox" checked={selected.length === files.length} onChange={e => e.target.checked ? selectAll() : clearSelection()} />
              </th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Size</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id} className={selected.includes(file.id) ? "bg-blue-50 dark:bg-blue-900/20" : ""}>
                <td className="px-4 py-2">
                  <input type="checkbox" checked={selected.includes(file.id)} onChange={() => toggleSelect(file.id)} />
                </td>
                <td className="px-4 py-2 font-medium">{file.name}</td>
                <td className="px-4 py-2 text-sm">{file.type}</td>
                <td className="px-4 py-2 text-sm">{file.date}</td>
                <td className="px-4 py-2 text-sm">{file.size}</td>
                <td className="px-4 py-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleDownload(file.id)}><Download className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(file.id)}><Trash className="h-4 w-4 text-red-500" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {files.length === 0 && <div className="text-center text-gray-400 py-12">No documents yet.</div>}
    </div>
  )
} 