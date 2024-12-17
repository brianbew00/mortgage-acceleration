let chartInstance;

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded, running calculations...");
    calculate();
});

function calculate() {
    console.log("Calculating mortgage payment scenarios...");

    // Input values
    const mortgageBalance = parseFloat(document.getElementById('mortgageBalance').value);
    const mortgageRate = parseFloat(document.getElementById('mortgageRate').value) / 100 / 12;
    const mortgagePayment = parseFloat(document.getElementById('mortgagePayment').value);
    const helocRate = parseFloat(document.getElementById('helocRate').value) / 100 / 12;
    const netIncome = parseFloat(document.getElementById('netIncome').value);
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value);
    const surplusIncome = netIncome - monthlyExpenses;
    const lumpSumMultiple = parseFloat(document.getElementById('lumpSumMultiple').value);

    // Scenario 1: No Extra Payments
    const noExtraData = calculateMortgage(mortgageBalance, mortgageRate, mortgagePayment, 0);

    // Scenario 2: Extra Monthly Principal Payments
    const extraPaymentData = calculateMortgage(mortgageBalance, mortgageRate, mortgagePayment, surplusIncome);

    // Scenario 3: Extra Payments with HELOC
    const helocData = calculateHELOC(mortgageBalance, mortgageRate, mortgagePayment, helocRate, surplusIncome, lumpSumMultiple);

    // Render tables
    renderTable("tableNoExtra", noExtraData, "No Extra Payments");
    renderTable("tableExtra", extraPaymentData, "Extra Monthly Payments");
    renderTable("tableWithHELOC", helocData, "HELOC Payments");

    // Render chart
    renderChart([noExtraData, extraPaymentData, helocData]);
}

// Function to calculate standard mortgage amortization
function calculateMortgage(balance, rate, payment, extraPrincipal) {
    const tableData = [];
    let month = 0;

    while (balance > 0 && month < 360) { // 30 years max
        const interest = balance * rate;
        let principal = payment - interest + extraPrincipal;

        if (balance - principal < 0) {
            principal = balance;
        }

        balance -= principal;
        month++;

        tableData.push({ month, payment: payment + extraPrincipal, interest, principal, balance });
    }

    return tableData;
}

// Function to calculate mortgage with HELOC
function calculateHELOC(balance, rate, payment, helocRate, surplus, lumpSumMultiple) {
    const tableData = [];
    let helocBalance = surplus * lumpSumMultiple;
    let month = 0;

    while ((balance > 0 || helocBalance > 0) && month < 360) {
        const mortgageInterest = balance * rate;
        let principal = payment - mortgageInterest;

        if (balance > 0) {
            balance -= principal;
        }

        const helocInterest = helocBalance * helocRate;
        let helocPayment = surplus - helocInterest;

        if (helocBalance > 0) {
            helocBalance -= helocPayment;
        }

        month++;

        tableData.push({
            month,
            payment: payment,
            mortgageInterest: mortgageInterest,
            principal: principal,
            balance: balance,
            helocBalance: helocBalance
        });
    }

    return tableData;
}

// Function to render tables
function renderTable(tableId, data, title) {
    let table = `
        <div class="table-wrapper">
            <table>
                <tr>
                    <th>Month</th>
                    <th>Payment ($)</th>
                    <th>Interest ($)</th>
                    <th>Principal ($)</th>
                    <th>Remaining Balance ($)</th>
                </tr>
    `;

    data.forEach(row => {
        table += `
            <tr>
                <td>${row.month}</td>
                <td>${row.payment.toFixed(2)}</td>
                <td>${row.interest.toFixed(2)}</td>
                <td>${row.principal.toFixed(2)}</td>
                <td>${row.balance.toFixed(2)}</td>
            </tr>
        `;
    });

    table += `</table></div>`;
    document.getElementById(tableId).innerHTML = `<h3>${title}</h3>` + table;
}

// Function to render the chart
function renderChart(scenarios) {
    const ctx = document.getElementById("comparisonChart").getContext("2d");

    if (chartInstance) chartInstance.destroy();

    const labels = scenarios[0].map(row => `Month ${row.month}`);
    const datasets = [
        {
            label: "No Extra Payments",
            data: scenarios[0].map(row => row.balance),
            borderColor: "rgba(76, 175, 80, 1)",
            backgroundColor: "rgba(76, 175, 80, 0.2)",
            fill: true,
        },
        {
            label: "Extra Monthly Payments",
            data: scenarios[1].map(row => row.balance),
            borderColor: "rgba(255, 87, 51, 1)",
            backgroundColor: "rgba(255, 87, 51, 0.2)",
            fill: true,
        },
        {
            label: "Extra Payments with HELOC",
            data: scenarios[2].map(row => row.balance),
            borderColor: "rgba(58, 117, 196, 1)",
            backgroundColor: "rgba(58, 117, 196, 0.2)",
            fill: true,
        },
    ];

    chartInstance = new Chart(ctx, {
        type: "line",
        data: { labels, datasets },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: "Mortgage Balance Over Time (All Scenarios)"
                }
            },
            scales: {
                y: { beginAtZero: false, title: { display: true, text: "Balance ($)" } } 
            }
        }
    });
}
function showTable(index) {
    console.log(`Switching to table ${index}`);

    // Select all table containers and tabs
    const tables = document.querySelectorAll(".table-container");
    const tabs = document.querySelectorAll(".tab");

    // Hide all tables and remove active class from tabs
    tables.forEach((table, i) => {
        table.classList.toggle("active", i === index);
    });

    tabs.forEach((tab, i) => {
        tab.classList.toggle("active", i === index);
    });
}
