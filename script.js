console.log("script.js loaded and executed");
let chartInstance;

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded, running calculations...");
    calculate();
    showTable(0); // Default to the first table
});

// Data storage for chart rendering
let annualBalances = { noExtra: [], extraPrincipal: [], heloc: [] };
let annualInterest = { noExtra: [], extraPrincipal: [], heloc: [] };

// Function to format currency
function formatCurrency(value) {
    return `$${value.toFixed(2)}`;
}

function calculate() {
    console.log("Calculating all scenarios...");

    // Clear existing data
    annualBalances = { noExtra: [], extraPrincipal: [], heloc: [] };
    annualInterest = { noExtra: [], extraPrincipal: [], heloc: [] };

    // Input values
    const mortgageBalance = parseFloat(document.getElementById('mortgageBalance').value);
    const mortgageRate = parseFloat(document.getElementById('mortgageRate').value) / 100 / 12;
    const mortgagePayment = parseFloat(document.getElementById('mortgagePayment').value);
    const helocRate = parseFloat(document.getElementById('helocRate').value) / 100 / 12;
    const netIncome = parseFloat(document.getElementById('netIncome').value);
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value);
    const surplusIncome = netIncome - monthlyExpenses;
    const initialLumpSum = surplusIncome * 4;

// Scenario 1: No Extra Payments
calculateNoExtra(
    mortgageBalance, 
    mortgageRate, 
    mortgagePayment, 
    annualBalances.noExtra, 
    annualInterest.noExtra
);

// Scenario 2: Extra Monthly Principal Payments
calculateExtraPrincipal(
    mortgageBalance, 
    mortgageRate, 
    mortgagePayment, 
    surplusIncome, 
    annualBalances.extraPrincipal, 
    annualInterest.extraPrincipal
);

// Scenario 3: Extra Payments with HELOC
calculateWithHELOC(
    mortgageBalance, 
    mortgageRate, 
    mortgagePayment, 
    helocRate, 
    surplusIncome, 
    initialLumpSum, 
    averageDailyOffset, 
    annualBalances.heloc,  // Combined mortgage and HELOC balance
    annualInterest.heloc   // Combined mortgage and HELOC interest
);


    // Update chart after all calculations
    updateChart();
}

//Scenario 1
function calculateNoExtra(balance, rate, payment, annualBalancesNoExtra, annualInterestNoExtra) {
    let totalInterest = 0;
    let months = 0;

    // Add the initial values as the first row
    annualBalancesNoExtra.push(balance);
    annualInterestNoExtra.push(0);

    let table = "<div class='table-wrapper'><table><tr><th>Month</th><th>Payment</th><th>Interest</th><th>Principal</th><th>Balance</th></tr>";

    // First row with initial values
    table += `
        <tr>
            <td>0</td>
            <td></td>
            <td></td>
            <td></td>
            <td>${formatCurrency(balance)}</td>
        </tr>`;

    while (balance > 0) {
        const interest = balance * rate;
        const principal = Math.min(payment - interest, balance);
        balance = Math.max(balance - principal, 0);
        totalInterest += interest;
        months++;

        table += `
            <tr>
                <td>${months}</td>
                <td>${formatCurrency(payment)}</td>
                <td>${formatCurrency(interest)}</td>
                <td>${formatCurrency(principal)}</td>
                <td>${formatCurrency(balance)}</td>
            </tr>`;

        if (months % 12 === 0 || balance === 0) {
            annualBalancesNoExtra.push(balance);
            annualInterestNoExtra.push(totalInterest);
        }
    }

    table += "</table></div>";
    document.getElementById("tableNoExtra").innerHTML = table;
}

//Scenario 2
function calculateExtraPrincipal(balance, rate, payment, surplus, annualBalancesExtra, annualInterestExtra) {
    let totalInterest = 0;
    let months = 0;

    // Add the initial values as the first row
    annualBalancesExtra.push(balance);
    annualInterestExtra.push(0);

    let table = "<div class='table-wrapper'><table><tr><th>Month</th><th>Payment</th><th>Interest</th><th>Principal</th><th>Extra Principal</th><th>Balance</th></tr>";

    // First row with initial values
    table += `
        <tr>
            <td>0</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>${formatCurrency(balance)}</td>
        </tr>`;

    while (balance > 0) {
        const interest = balance * rate;
        let extraPrincipal = surplus;
        let principal = Math.min(payment - interest, balance);
        balance = Math.max(balance - principal - extraPrincipal, 0);
        totalInterest += interest;
        months++;

        table += `
            <tr>
                <td>${months}</td>
                <td>${formatCurrency(payment + extraPrincipal)}</td>
                <td>${formatCurrency(interest)}</td>
                <td>${formatCurrency(principal)}</td>
                <td>${formatCurrency(extraPrincipal)}</td>
                <td>${formatCurrency(balance)}</td>
            </tr>`;

        if (months % 12 === 0 || balance === 0) {
            annualBalancesExtra.push(balance);
            annualInterestExtra.push(totalInterest);
        }
    }

    table += "</table></div>";
    document.getElementById("tableExtra").innerHTML = table;
}

// Scenario 3: Extra Payments with HELOC
function calculateWithHELOC(
    balance,
    rate,
    payment,
    helocRate,
    surplus,
    initialLumpSum,
    averageDailyOffset,
    annualBalancesHELOC,
    annualInterestHELOC
) {
    let helocBalance = 0; // Track HELOC balance
    let totalInterest = 0; // Total mortgage + HELOC interest
    let months = 0;

    // Add the initial values as the first row
    annualBalancesHELOC.push(balance);
    annualInterestHELOC.push(0);

    let table = `
        <div class='table-wrapper'>
            <table>
                <tr>
                    <th>Month</th>
                    <th>Mortgage Payment</th>
                    <th>Mortgage Interest</th>
                    <th>Principal</th>
                    <th>HELOC Advance</th>
                    <th>HELOC Interest</th>
                    <th>HELOC Payment</th>
                    <th>HELOC Balance</th>
                    <th>Total Balance</th>
                </tr>`;

    // First row with initial values
    table += `
        <tr>
            <td>0</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>${formatCurrency(helocBalance)}</td>
            <td>${formatCurrency(balance)}</td>
        </tr>`;

    while (balance > 0 || helocBalance > 0) {
        // Mortgage interest and principal
        const mortgageInterest = balance * rate;
        const principal = Math.min(payment - mortgageInterest, balance);

        // Step 3: Determine HELOC advance
        const effectiveHELOCBalanceForCheck = Math.max(helocBalance - averageDailyOffset, 0);
        const interestHELOCForCheck = effectiveHELOCBalanceForCheck > 0 ? effectiveHELOCBalanceForCheck * helocRate : 0;

        let lumpSumHELOC = 0;
        if (months === 0 || (helocBalance + interestHELOCForCheck - surplus < 0 && balance > 0)) {
            lumpSumHELOC = Math.min(initialLumpSum, balance);
            helocBalance += lumpSumHELOC; // Add lump sum to HELOC balance
            balance -= lumpSumHELOC; // Reduce mortgage balance by lump sum
        }

        // HELOC interest and payment
        const helocInterest = helocBalance * helocRate;
        const helocPayment = Math.min(surplus, helocBalance + helocInterest); // Payment cannot exceed balance + interest
        helocBalance = Math.max(helocBalance + helocInterest - helocPayment, 0);

        totalInterest += mortgageInterest + helocInterest;
        months++;

        // Append row to table
        table += `
            <tr>
                <td>${months}</td>
                <td>${formatCurrency(payment)}</td>
                <td>${formatCurrency(mortgageInterest)}</td>
                <td>${formatCurrency(principal)}</td>
                <td>${formatCurrency(lumpSumHELOC)}</td>
                <td>${formatCurrency(helocInterest)}</td>
                <td>${formatCurrency(helocPayment)}</td>
                <td>${formatCurrency(helocBalance)}</td>
                <td>${formatCurrency(balance + helocBalance)}</td>
            </tr>`;

        // Store combined balances and interest for charts
        if (months % 12 === 0 || (balance === 0 && helocBalance === 0)) {
            annualBalancesHELOC.push(balance + helocBalance);
            annualInterestHELOC.push(totalInterest);
        }
    }

    table += "</table></div>";
    document.getElementById("tableWithHELOC").innerHTML = table;
}

// Chart.js: Update or Create Chart
function updateChart() {
    const chartType = document.getElementById("chartType").value;
    const ctx = document.getElementById("comparisonChart").getContext("2d");

    // Define labels for years
    let labels = Array.from({ length: Math.max(annualBalances.noExtra.length) }, (_, i) => `Year ${i + 1}`);
    let datasets = [];

    if (chartType === "balance") {
        datasets = [
            { label: "No Extra Payments", data: annualBalances.noExtra, borderColor: "blue", borderWidth: 2, fill: false },
            { label: "Extra Principal Payments", data: annualBalances.extraPrincipal, borderColor: "green", borderWidth: 2, fill: false },
            { label: "Extra Payments with HELOC", data: annualBalances.heloc, borderColor: "red", borderWidth: 2, fill: false },
        ];
    } else if (chartType === "interest") {
        datasets = [
            { label: "No Extra Payments", data: annualInterest.noExtra, borderColor: "blue", borderWidth: 2, fill: false },
            { label: "Extra Principal Payments", data: annualInterest.extraPrincipal, borderColor: "green", borderWidth: 2, fill: false },
            { label: "Extra Payments with HELOC", data: annualInterest.heloc, borderColor: "red", borderWidth: 2, fill: false },
        ];
    }

    // If the chart already exists, destroy it
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create a new chart
    chartInstance = new Chart(ctx, {
        type: "line",
        data: { labels: labels, datasets: datasets },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: "top" },
            },
            scales: {
                x: { title: { display: true, text: "Years" } },
                y: { title: { display: true, text: chartType === "balance" ? "Balance ($)" : "Interest Expense ($)" } },
            },
        },
    });
}

// Tab functionality
window.showTable = function (index) {
    const tables = document.querySelectorAll(".table-container");
    const tabs = document.querySelectorAll(".tab");

    tables.forEach((table, i) => {
        table.classList.toggle("active", i === index);
        table.style.display = i === index ? "block" : "none"; // Ensure correct display property
    });

    tabs.forEach((tab, i) => {
        tab.classList.toggle("active", i === index);
    });

    console.log(`Showing table index: ${index}`);
};

// Ensure the first table is displayed on load
document.addEventListener("DOMContentLoaded", function () {
    showTable(0);
});
