function Field({ label, hint, ...inputProps }) {
  return (
    <div className="field">
      <label htmlFor={inputProps.name}>{label}</label>
      <input id={inputProps.name} {...inputProps} />
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  );
}

export default Field;
