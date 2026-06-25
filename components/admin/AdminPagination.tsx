import Link from "next/link";

export type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
};

function buildHref(
  pathname: string,
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
  pageSize: number,
) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === "page" || key === "pageSize") return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) params.append(key, item);
      });
      return;
    }
    if (value) params.set(key, value);
  });
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));
  return `${pathname}?${params.toString()}`;
}

export default function AdminPagination({
  pathname,
  searchParams,
  pagination,
}: {
  pathname: string;
  searchParams: Record<string, string | string[] | undefined>;
  pagination: PaginationState;
}) {
  if (pagination.pageCount <= 1) return null;

  return (
    <div className="adminPagination">
      <p>
        Showing page {pagination.page} of {pagination.pageCount} · {pagination.total} total records
      </p>
      <div className="adminPaginationActions">
        {pagination.page > 1 ? (
          <Link className="button ghost darkButton" href={buildHref(pathname, searchParams, pagination.page - 1, pagination.pageSize)}>
            Previous
          </Link>
        ) : null}
        {pagination.page < pagination.pageCount ? (
          <Link className="button ghost darkButton" href={buildHref(pathname, searchParams, pagination.page + 1, pagination.pageSize)}>
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
