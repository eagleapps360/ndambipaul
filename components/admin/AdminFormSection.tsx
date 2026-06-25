export default function AdminFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="adminFormSection">
      <div className="adminFormSectionHead">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="adminFormSectionBody">{children}</div>
    </section>
  );
}
