function FormError({ children }) {
  if (!children) return null;

  return (
    <div className="form-error" role="alert">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7.5v5M12 16.2v.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export default FormError;
