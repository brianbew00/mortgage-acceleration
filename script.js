let annualBalances = { noExtra: [], extraPrincipal: [], heloc: [] };
let annualInterest = { noExtra: [], extraPrincipal: [], heloc: [] };
let chartInstance = null;

function formatCurrency(value) {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function calculate() {
    // Core calculation logic from provided code (simplified for space)
    console.log("Calculations executed!");
    updateChart();
}

function showTable(index) {
    const tables = document.querySelectorAll(".table-container");
    const tabs = document.querySelectorAll(".tab");
    tables.forEach((table, i) => table.classList.toggle("active", i === index));
    tabs.forEach((tab, i) => tab.classList.toggle("active", i === index));
}

function updateChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, { /* Chart rendering logic */ });
}