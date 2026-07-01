"use client";

export default function ProgrammePrintButton() {
  return (
    <button
      className="button ghost darkButton"
      type="button"
      onClick={() => {
        window.print();
      }}
    >
      Print Programme
    </button>
  );
}
