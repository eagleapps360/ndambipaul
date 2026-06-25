export default function AdminEmptyState({
  title,
  copy,
}: {
  title: string;
  copy: string;
}) {
  return (
    <div className="adminEmptyState">
      <strong>{title}</strong>
      <p>{copy}</p>
    </div>
  );
}
