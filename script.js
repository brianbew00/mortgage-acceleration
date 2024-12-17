let chartInstance;

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded, running calculations...");
    calculate();
    showTable(0); // Default to the first table
});

// Function to format currency
function formatCurrency(value) {
    return `$${value.toFixed(2)}`;
}

function calculate() {
    console.log("Calculating all scenarios...");

    // Input values
    const mortgageBalance = parseFloat(document.getElementById('mortgageBalance').value);
    const mortgageRate = parseFloat(document.getElementById('mortgageRate').value) / 100 / 12;
    const mortgagePayment = parseFloat(document.getElementById('mortgagePayment').value);
    const helocRate = parseFloat(document.getElementById('helocRate').value) / 100 / 12;
    const netIncome = parseFloat(document.getElementById('netIncome').value);
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value);
    const surplusIncome = netIncome - monthlyExpenses;
    const averageDailyOffset = 0; // Placeholder
    const initialLumpSum = surplusIncome * 4; // Lump sum multiple placeholder

    const annualBalances = { noExtra: [], extraPrincipal: [], heloc: [] };
    const annualInterest = { noExtra: [], extraPrincipal: [], heloc: [] };

    // Scenario 1: No Extra Payments
    calculateNoExtra(mortgageBalance, mortgageRate, mortgagePayment, annualBalances, annualInterest);

    // Scenario 2: Extra Monthly Payments
    calculateExtraPrincipal(mortgageBalance, mortgageRate, mortgagePayment, surplusIncome, annualBalances, annualInterest);

    // Scenario 3: Extra Payments with HELOC
    calculateWithHELOC(
        mortgageBalance, mortgageRate, mortgagePayment, helocRate,
        surplusIncome, initialLumpSum, averageDailyOffset,
        annualBalances, annualInterest
    );
}

// Scenario 1: No Extra Payments
function calculateNoExtra(balance, rate, payment, annualBalances, annualInterest) {
    let totalInterest = 0;
    let months = 0;
    let table = "<div class='table-wrapper'><table><tr><th>Month</th><th>Payment</th><th>Interest</th><th>Principal</th><th>Balance</th></tr>";

    while (balance > 0) {
        const interest = balance * rate;
        const principal = Math.min(payment - interest, balance);
        balance = Math.max(balance - principal, 0);
        totalInterest += interest;
        months++;

        table += `<tr>
            <td>${months}</td>
            <td>${formatCurrency(payment)}</td>
            <td>${formatCurrency(interest)}</td>
            <td>${formatCurrency(principal)}</td>
            <td>${formatCurrency(balance)}</td>
        </tr>`;

        if (months % 12 === 0 || balance === 0) {
            annualBalances.noExtra.push(balance);
            annualInterest.noExtra.push(totalInterest);
        }
    }

    table += "</table></div>";
    document.getElementById("tableNoExtra").innerHTML = table;
}

// Scenario 2: Extra Monthly Principal Payments
function calculateExtraPrincipal(balance, rate, payment, surplus, annualBalances, annualInterest) {
    let totalInterest = 0;
    let months = 0;
    let table = "<div class='table-wrapper'><table><tr><th>Month</th><th>Payment</th><th>Interest</th><th>Principal</th><th>Extra Principal</th><th>Balance</th></tr>";

    while (balance > 0) {
        const interest = balance * rate;
        let extraPrincipal = surplus;
        let principal = Math.min(payment - interest, balance);
        let totalPayment = principal + interest + extraPrincipal;

        if (totalPayment > balance + interest) {
            extraPrincipal = balance + interest - payment;
            totalPayment = payment + extraPrincipal;
        }

        balance = Math.max(balance - principal - extraPrincipal, 0);
        totalInterest += interest;
        months++;

        table += `<tr>
            <td>${months}</td>
            <td>${formatCurrency(totalPayment)}</td>
            <td>${formatCurrency(interest)}</td>
            <td>${formatCurrency(principal)}</td>
            <td>${formatCurrency(extraPrincipal)}</td>
            <td>${formatCurrency(balance)}</td>
        </tr>`;

        if (months % 12 === 0 || balance === 0) {
            annualBalances.extraPrincipal.push(balance);
            annualInterest.extraPrincipal.push(totalInterest);
        }
    }

    table += "</table></div>";
    document.getElementById("tableExtra").innerHTML = table;
}

// Scenario 3: Extra Payments with HELOC
function calculateWithHELOC(balance, rate, payment, helocRate, surplus, lumpSum, averageDailyOffset, annualBalances, annualInterest) {
    let helocBalance = 0;
    let totalInterest = 0;
    let months = 0;

    let table = "<div class='table-wrapper'><table><tr><th>Month</th><th>Mortgage Payment</th><th>Mortgage Interest</th><th>Principal</th><th>Lump Sum</th><th>HELOC Interest</th><th>HELOC Payment</th><th>HELOC Balance</th><th>Mortgage Balance</th></tr>";

    while (balance > 0 || helocBalance > 0) {
        const mortgageInterest = balance * rate;
        let principal = Math.min(payment - mortgageInterest, balance);
        let lumpSumHELOC = months === 1 ? lumpSum : 0;

        helocBalance += lumpSumHELOC;
        balance -= lumpSumHELOC;
        balance = Math.max(balance - principal, 0);

        const helocInterest = helocBalance * helocRate;
        let helocPayment = surplus - helocInterest;
        helocBalance = Math.max(helocBalance + helocInterest - helocPayment, 0);

        totalInterest += mortgageInterest + helocInterest;
        months++;

        table += `<tr>
            <td>${months}</td>
            <td>${formatCurrency(payment)}</td>
            <td>${formatCurrency(mortgageInterest)}</td>
            <td>${formatCurrency(principal)}</td>
            <td>${formatCurrency(lumpSumHELOC)}</td>
            <td>${formatCurrency(helocInterest)}</td>
            <td>${formatCurrency(helocPayment)}</td>
            <td>${formatCurrency(helocBalance)}</td>
            <td>${formatCurrency(balance)}</td>
        </tr>`;

        if (months % 12 === 0 || (balance === 0 && helocBalance === 0)) {
            annualBalances.heloc.push(balance + helocBalance);
            annualInterest.heloc.push(totalInterest);
        }
    }

    table += "</table></div>";
    document.getElementById("tableWithHELOC").innerHTML = table;
}
