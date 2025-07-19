// app/email-verify/page.js
/*import React from 'react';


export default function VerifySuccess() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Email Verified ✅</h1>
      <p>Your email has been successfully verified.</p>
    </div>
  );
}
*/

"use client";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function VerifyStatusPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  let message = "";
  let emoji = "";
  let color = "";

  if (status === "success") {
    message = "Your email has been successfully verified!";
    emoji = "✅";
    color = "#4CAF50";
  } else if (status === "failed") {
    message = "Verification failed or token is invalid.";
    emoji = "❌";
    color = "#e53935";
  } else {
    message = "Something went wrong during verification.";
    emoji = "⚠️";
    color = "#ff9800";
  }

  return (
    <div style={{ textAlign: "center", marginTop: "100px", color }}>
      <div style={{ fontSize: "80px" }}>{emoji}</div>
      <h1>Email Verification</h1>
      <p>{message}</p>
    </div>
  );
}