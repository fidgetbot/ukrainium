"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DropButton({ progressId }: { progressId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleDrop() {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/piles/new/drop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressId }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to drop card:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      onClick={handleDrop}
      disabled={isLoading}
      className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
    >
      {isLoading ? "Moving..." : "Move to Studying"}
    </button>
  );
}
