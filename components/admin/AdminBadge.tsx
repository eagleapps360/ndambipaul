export function AdminBadge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}) {
  return <span className={`adminBadge adminBadge-${tone}`}>{children}</span>;
}

export function RoleBadge({ role }: { role: string }) {
  const tone =
    role === "owner" || role === "administrator"
      ? "warning"
      : role === "finance"
        ? "info"
        : role === "moderator"
          ? "success"
          : "neutral";
  return <AdminBadge tone={tone}>{role.replaceAll("_", " ")}</AdminBadge>;
}
