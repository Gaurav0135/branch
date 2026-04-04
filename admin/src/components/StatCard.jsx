const StatCard = ({ title, value, tone = 'teal', subtitle }) => {
  return (
    <div className={`stat-card tone-${tone}`}>
      <p>{title}</p>
      <h3>{value}</h3>
      {subtitle ? <small>{subtitle}</small> : null}
    </div>
  );
};

export default StatCard;
