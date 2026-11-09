let cabinChart;
let monthChart;

function drawCharts(data) {
  const byCabin = totalsBy(data, "cabin");
  const cabins = Object.keys(byCabin);
  const byMonth = totalsBy(data, "month");
  const months = Object.keys(byMonth);

  // Remove old charts before drawing new ones
  if (cabinChart) cabinChart.destroy();
  if (monthChart) monthChart.destroy();

  cabinChart = new Chart(document.getElementById("cabinChart"), {
    type: "bar",
    data: {
      labels: cabins,
      datasets: [
        { label: "Paid ($)", data: cabins.map(c => byCabin[c].paid) },
        { label: "Due ($)", data: cabins.map(c => byCabin[c].due) }
      ]
    }
  });

  monthChart = new Chart(document.getElementById("monthChart"), {
    type: "line",
    data: {
      labels: months,
      datasets: [
        { label: "Collected ($)", data: months.map(m => byMonth[m].paid) }
      ]
    }
  });
}
async function loadData() {
  try {
    const response = await fetch("data.json");

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Could not load data:", error);
  }
}

function totalsBy(data, key) {
  const totals = {};
  data.forEach(item => {
    const group = item[key];
    if (!totals[group]) {
      totals[group] = { paid: 0, due: 0 };
    }
    totals[group].paid += item.paid;
    totals[group].due += item.due;
  });
  return totals;
}
async function init() {
  const data = await loadData();
  if (!data) return;

  // Fill the dropdown with each unique cabin
  const select = document.getElementById("cabinFilter");
  const uniqueCabins = [...new Set(data.map(item => item.cabin))];
  uniqueCabins.forEach(cabin => {
    const option = document.createElement("option");
    option.value = cabin;
    option.textContent = cabin;
    select.appendChild(option);
  });

  // Redraw when the choice changes
  select.addEventListener("change", () => {
    const choice = select.value;
    const filtered = choice === "all"
      ? data
      : data.filter(item => item.cabin === choice);
    drawCharts(filtered);
  });

  drawCharts(data);
}

init();