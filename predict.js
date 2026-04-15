export const predictSLABreach = (data) => {
  const today = new Date();

  return data.filter(rfi => {
    if (rfi.closed_date) return false;

    const deadline = new Date(rfi.sla_deadline);
    const diff = (deadline - today) / (1000 * 60 * 60); // hours left

    return diff > 0 && diff < 24; // less than 24 hrs left
  });
};