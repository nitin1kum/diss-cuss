"use client";
import Verify from "./_components/Verify";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<any>;
}) {
  const { ins: instruction } = await params;
  return <Verify instruction={instruction} />;
}
