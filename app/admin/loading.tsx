export default function AdminLoading() {
  return (
    <section className="adminPage">
      <div className="adminPageHeader">
        <div>
          <p className="kicker">Loading</p>
          <h1>Preparing the admin workspace</h1>
          <p>Fetching live records, permissions, and pending actions.</p>
        </div>
      </div>
      <div className="statsGrid">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={index} className="adminStatCard adminSkeleton" aria-hidden="true" />
        ))}
      </div>
      <div className="adminRecordStack">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="adminPanel adminSkeleton adminSkeletonBlock" aria-hidden="true" />
        ))}
      </div>
    </section>
  );
}
