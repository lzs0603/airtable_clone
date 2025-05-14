"use client";

export default function TableLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-10 w-48 rounded bg-gray-200"></div>
      <div className="mb-4 flex">
        <div className="mr-2 h-8 w-24 rounded bg-gray-200"></div>
        <div className="mr-2 h-8 w-24 rounded bg-gray-200"></div>
        <div className="h-8 w-24 rounded bg-gray-200"></div>
      </div>
      <div className="mb-2 h-10 rounded bg-gray-200"></div>
      <div className="mb-2 h-10 rounded bg-gray-200"></div>
      <div className="mb-2 h-10 rounded bg-gray-200"></div>
      <div className="mb-2 h-10 rounded bg-gray-200"></div>
      <div className="mb-2 h-10 rounded bg-gray-200"></div>
    </div>
  );
} 