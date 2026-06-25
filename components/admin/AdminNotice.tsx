export default function AdminNotice({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "error";
  children: React.ReactNode;
}) {
  return <div className={`adminNotice adminNotice-${tone}`}>{children}</div>;
}
