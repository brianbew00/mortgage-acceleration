let chartInstance;

document.addEventListener("DOMContentLoaded", function () {
    calculate(); // Run calculation when the DOM is loaded
});

function calculate() {
    renderTable("tableNoExtra", generateTableData(50, 1000, 5000));
    renderChart();
}

function renderTable(tableId, data) {
    let table = `<div class="table-wrapper"><table><tr><th>Month</th><th>Value</th></tr>`;
    for (let i = 0; i < data.length; i++) {
        table += `<tr><td>${i + 1}</td><td>${data[i]}</td></tr>`;
    }
    table += "</table></div>";
    document.getElementById(tableId).innerHTML = table;
}

function generateTableData(count, min, max) {
    return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min) + min));
}

function renderChart() {
    const ctx = document.getElementById("comparisonChart").getContext("2d");
    if (chartInstance) {
        chartInstance.destroy();
    }
    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Scenario 1", "Scenario 2", "Scenario 3"],
            datasets: [{
                label: "Example Chart",
                data: [10, 20, 30],
                backgroundColor: ["#4CAF50", "#FF5733", "#3A75C4"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true }
            }
        }
    });
}

function showTable(index) {
    const tables = document.querySelectorAll(".table-container");
    const tabs = document.querySelectorAll(".tab");
    tables.forEach((table, i) => table.classList.toggle("active", i === index));
    tabs.forEach((tab, i) => tab.classList.toggle("active", i === index));
}