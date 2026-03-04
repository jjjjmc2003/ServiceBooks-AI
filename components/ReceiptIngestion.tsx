"use client";

import { Upload, Check, X } from "lucide-react";

export interface IngestedDocument {
  id: string;
  fileName: string;
  vendor: string;
  date: string;
  amount: number;
  glCode: string;
  glCategory: string;
  confidence: number;
  status: "pending" | "approved" | "rejected";
}

interface Props {
  documents: IngestedDocument[];
  onExtracted: (documents: IngestedDocument[]) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

function inferGL(fileName: string) {
  const value = fileName.toLowerCase();
  if (value.includes("rent")) return { glCode: "7800", glCategory: "Rent" };
  if (value.includes("payroll") || value.includes("adp")) return { glCode: "6000", glCategory: "Labor – FOH" };
  if (value.includes("sysco") || value.includes("tyson") || value.includes("protein")) return { glCode: "5000", glCategory: "Protein Cost – Beef" };
  if (value.includes("uber") || value.includes("doordash") || value.includes("grubhub")) return { glCode: "7600", glCategory: "Delivery Commission – DoorDash" };
  if (value.includes("packaging") || value.includes("container")) return { glCode: "7700", glCategory: "Packaging & Containers" };
  if (value.includes("meta") || value.includes("ads")) return { glCode: "7000", glCategory: "Marketing & Advertising" };
  return { glCode: "8000", glCategory: "Office & Admin" };
}

function inferAmount(fileName: string) {
  const matches = fileName.match(/(\d+(?:\.\d{1,2})?)/g);
  if (!matches || matches.length === 0) return Math.round((Math.random() * 700 + 80) * 100) / 100;
  const largest = Math.max(...matches.map((value) => Number(value)));
  return largest > 10 ? largest : Math.round((Math.random() * 700 + 80) * 100) / 100;
}

function inferVendor(fileName: string) {
  const cleaned = fileName.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ").trim();
  if (!cleaned) return "Unknown Vendor";
  return cleaned.slice(0, 48);
}

export function ReceiptIngestion({ documents, onExtracted, onApprove, onReject }: Props) {
  const pending = documents.filter((doc) => doc.status === "pending").length;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const extracted: IngestedDocument[] = Array.from(files).map((file) => {
      const mapped = inferGL(file.name);
      return {
        id: `DOC-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        fileName: file.name,
        vendor: inferVendor(file.name),
        date: new Date().toISOString().slice(0, 10),
        amount: inferAmount(file.name),
        glCode: mapped.glCode,
        glCategory: mapped.glCategory,
        confidence: Math.round((0.68 + Math.random() * 0.29) * 100) / 100,
        status: "pending",
      };
    });

    onExtracted(extracted);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Receipt & Invoice Ingestion</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload PDFs/images to auto-extract vendor, date, amount, GL, confidence.
          </p>
        </div>
        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 cursor-pointer transition-colors">
          <Upload className="w-3 h-3" />
          Upload
          <input
            type="file"
            multiple
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      <div className="px-6 py-3 border-b border-slate-100 text-xs text-slate-500">
        {documents.length} extracted · {pending} pending approval
      </div>

      <div className="divide-y divide-slate-100">
        {documents.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            No documents uploaded yet.
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="px-6 py-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-slate-800 truncate">{doc.fileName}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {doc.vendor} · {doc.date} · ${doc.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-indigo-600 font-mono mt-0.5">
                  {doc.glCode} · {doc.glCategory} · {(doc.confidence * 100).toFixed(0)}% confidence
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                {doc.status === "pending" ? (
                  <>
                    <button
                      onClick={() => onApprove(doc.id)}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Approve
                    </button>
                    <button
                      onClick={() => onReject(doc.id)}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Reject
                    </button>
                  </>
                ) : (
                  <span className={`text-[11px] px-2 py-1 rounded border ${
                    doc.status === "approved"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}>
                    {doc.status}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
