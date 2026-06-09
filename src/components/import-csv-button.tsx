"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2 } from "lucide-react";

export function ImportCsvButton() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
      
      if (lines.length < 2) {
        alert("File appears to be empty or missing data rows.");
        setLoading(false);
        return;
      }

      const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
      
      const nameIdx = headers.indexOf("name");
      const emailIdx = headers.indexOf("email");
      const cityIdx = headers.indexOf("city");

      if (nameIdx === -1 || emailIdx === -1) {
        alert("CSV must contain 'name' and 'email' columns.");
        setLoading(false);
        return;
      }

      const customers = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        return {
          name: cols[nameIdx],
          email: cols[emailIdx],
          city: cityIdx !== -1 ? cols[cityIdx] : null,
          tags: ["imported"]
        };
      }).filter(c => c.name && c.email);

      const response = await fetch("/api/customers/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload customers");
      }

      alert(`Successfully imported ${data.count} customers!`);
      
      // Clear the input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      router.refresh();

    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while parsing the CSV.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      <button
        disabled={loading}
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {loading ? "Importing..." : "Import CSV"}
      </button>
    </>
  );
}
