// Closure Rate by Package
export const getClosureRateByPackage = (data) => {
  const result = {};

  data.forEach(rfi => {
    const pkg = rfi.package;

    if (!result[pkg]) {
      result[pkg] = { total: 0, closed: 0 };
    }

    result[pkg].total++;

    if (rfi.closed_date && rfi.closed_date !== "") {
      result[pkg].closed++;
    }
  });

  return {
    labels: Object.keys(result),
    values: Object.values(result).map(
      item => (item.closed / item.total) * 100
    )
  };
};


// SLA Breach by Station
export const getSLABreachByStation = (data) => {
  const result = {};

  data.forEach(rfi => {
    const station = rfi.station;

    if (!result[station]) {
      result[station] = 0;
    }

    if (rfi.closed_date && rfi.sla_deadline) {
      if (new Date(rfi.closed_date) < new Date(rfi.sla_deadline)) {
        result[station]++;
      }
    }
  });

  return {
    labels: Object.keys(result),
    values: Object.values(result)
  };
};