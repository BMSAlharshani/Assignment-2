$(document).ready(function () {
    $.getScript('https://cdn.jsdelivr.net/npm/chart.js', function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const expenses = JSON.parse(localStorage.getItem('userExpenses')) || {};
        const userExpenses = (currentUser && expenses[currentUser.username]) ? expenses[currentUser.username].expenses : [];

        const categories = ['food', 'transportation', 'utilities', 'entertainment', 'other'];
        const expenseSummary = categories.map(category => {
            return {
                category: category,
                total: userExpenses.filter(expense => expense.category === category)
                                    .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0)
            };
        });

        const monthlyExpenses = {};
        userExpenses.forEach(expense => {
            const date = new Date(expense.date);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyExpenses[monthYear]) {
                monthlyExpenses[monthYear] = {};
            }
            const day = date.getDate();
            if (!monthlyExpenses[monthYear][day]) {
                monthlyExpenses[monthYear][day] = 0;
            }
            monthlyExpenses[monthYear][day] += parseFloat(expense.amount || 0);
        });

        renderPieChart(expenseSummary);
        renderLineChart(monthlyExpenses);
    });
});

function renderPieChart(expenseSummary) {
    const ctx = $('#categoryPieChart');
    const data = {
        labels: expenseSummary.map(expense => expense.category),
        datasets: [{
            data: expenseSummary.map(expense => expense.total),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
        }]
    };

    new Chart(ctx, {
        type: 'pie',
        data: data
    });
}

function renderLineChart(monthlyExpenses) {
    const ctx = $('#monthlyLineChart');
    const sortedMonths = Object.keys(monthlyExpenses).sort((a, b) => new Date(a) - new Date(b));
    const labels = [];
    const data = [];

    if (sortedMonths.length === 1) {
        // Display daily expenses for the single month
        const monthDays = monthlyExpenses[sortedMonths[0]];
        const sortedDays = Object.keys(monthDays).sort((a, b) => a - b);
        sortedDays.forEach(day => {
            labels.push(`${sortedMonths[0]}-${String(day).padStart(2, '0')}`);
            data.push(monthDays[day]);
        });
    } else {
        // Display monthly expenses
        sortedMonths.forEach(month => {
            const monthTotal = Object.values(monthlyExpenses[month]).reduce((sum, value) => sum + value, 0);
            labels.push(month);
            data.push(monthTotal);
        });
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expenses',
                data: data,
                fill: false,
                borderColor: '#36A2EB',
                tension: 0.1 // Add tension to show a smooth line
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount'
                    }
                }
            }
        }
    });
}
