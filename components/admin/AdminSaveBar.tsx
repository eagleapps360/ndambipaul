export default function AdminSaveBar({
  label = "Save changes",
  helper,
}: {
  label?: string;
  helper?: string;
}) {
  return (
    <div className="adminSaveBar">
      <div>
        <strong>{label}</strong>
        {helper ? <p>{helper}</p> : null}
      </div>
      <button className="button" type="submit">
        {label}
      </button>
    </div>
  );
}
