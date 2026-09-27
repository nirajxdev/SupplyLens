const FormInput = ({ label, type = 'text', name, value, onChange, placeholder, error, required = false, ...props }) => {
  return (
    <div>
      {label && (
        <label htmlFor={name} className="ent-label">
          {label}{required && <span style={{ color: 'var(--red)' }}> *</span>}
        </label>
      )}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="ent-input"
        style={error ? { borderColor: 'var(--red)', boxShadow: '0 0 0 3px rgba(185,28,28,0.10)' } : undefined}
        {...props}
      />
      {error && <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>{error}</p>}
    </div>
  );
};

export default FormInput;
