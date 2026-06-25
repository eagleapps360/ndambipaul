import AdminEmptyState from "@/components/admin/AdminEmptyState";

export default function AdminTable({
  columns,
  rows,
  emptyTitle,
  emptyCopy,
}: {
  columns: string[];
  rows: Array<Record<string, React.ReactNode>>;
  emptyTitle: string;
  emptyCopy: string;
}) {
  if (!rows.length) {
    return <AdminEmptyState title={emptyTitle} copy={emptyCopy} />;
  }

  return (
    <div className="adminTableWrap">
      <table className="adminTable">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column}>{row[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="adminMobileList">
        {rows.map((row, index) => (
          <article key={index} className="adminMobileCard">
            {columns.map((column) => (
              <div key={column} className="adminMobileCardRow">
                <span>{column}</span>
                <div>{row[column]}</div>
              </div>
            ))}
          </article>
        ))}
      </div>
    </div>
  );
}
