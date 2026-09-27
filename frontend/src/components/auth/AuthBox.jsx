const AuthBox = ({ children, shake = false }) => {
  return (
    <div
      className="ent-card"
      style={{
        width: '100%',
        maxWidth: 400,
        padding: '24px',
        ...(shake ? { borderColor: 'var(--red)', animation: 'ent-shake 0.4s' } : {}),
      }}
    >
      <style>{`@keyframes ent-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`}</style>
      {children}
    </div>
  );
};

export default AuthBox;
