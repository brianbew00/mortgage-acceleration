let chartInstance;

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded, starting calculations...");
    try {
        calculate(); // Run calculations after DOM is fully loaded
    } catch (error) {
        console.error("Error during initial calculation:", error);
    }
});

function calculate() {
    console.log("Running calculations...");
    try {
        const tableData = generateTableData(50, 1000, 5000);

        console.log("Table data generated:", tableData);
        renderTable("tableNoExtra", tableData);

        renderChart();
    } catch (error) {
        console.error("Error in calculate():", error);
    }
}

function renderTable(tableId, data) {
    console.log(`Rendering table for ID: ${tableId}`);
    let table = `
        <div class="table-wrapper">
            <table>
                <tr>
                    <th>Month</th>
                    <th>Value</th>
                </tr>
    `;

    for (let i = 0; i < data.length; i++) {
        table += `
            <tr>
                <td>${i + 1}</td>
                <td>${data[i]}</td>
            </tr>
        `;
    }

    table += `</table></div>`;

    const tableContainer = document.getElementById(tableId);
    if (tableContainer) {
        tableContainer.innerHTML = table;
        console.log(`Table successfully rendered in #${tableId}`);
    } else {
        console.error(`Element with ID '${tableId}' not found.`);
    }
}

function generateTableData(count, min, max) {
    console.log(`Generating table data with ${count} rows.`);
    return Array.from({ length: count }, () =>
        Math.floor(Math.random() * (max - min) + min)
    );
}

function renderChart() {
    console.log("Rendering chart...");

    const ctx = document.getElementById("comparisonChart");
    if (!ctx) {
        console.error("Chart container not found: #comparisonChart");
        return;
    }

    if (chartInstance) {
        chartInstance.destroy();
    }

    try {
        chartInstance = new Chart(ctx.getContext("2d"), {
            type: "bar",
            data: {
                labels: ["Scenario 1", "Scenario 2", "Scenario 3"],
                datasets: [
                    {
                        label: "Example Chart",
                        data: [10, 20, 30],
                        backgroundColor: ["#4CAF50", "#FF5733", "#3A75C4"],
                    },
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                },
            },
        });
        console.log("Chart rendered successfully.");
    } catch (error) {
        console.error("Error rendering chart:", error);
    }
}

function showTable(index) {
    console.log(`Switching to table ${index}`);
    const tables = document.querySelectorAll(".table-container");
    const tabs = document.querySelectorAll(".tab");

    if (tables.length === 0 || tabs.length === 0) {
        console.error("No table or tab elements found.");
        return;
    }

    tables.forEach((table, i) => table.classList.toggle("active", i === index));
    tabs.forEach((tab, i) => tab.classList.toggle("active", i === index));
}
