import { Loader2, Check } from 'lucide-react';

const SubmitButton = ({
  children,
  loading = false,
  success = false,
  disabled = false,
  onClick,
  type = 'submit',
  className = '',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`ent-btn ent-btn-primary ${className}`}
      style={{ width: '100%', height: 36 }}
    >
      {success ? (
        <Check size={15} strokeWidth={3} />
      ) : loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        children
      )}
    </button>
  );
};

export default SubmitButton;
