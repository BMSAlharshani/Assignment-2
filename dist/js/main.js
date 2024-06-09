$(document).ready(function () {
    // Load expenses content by default
    $('#contentContainer').load('expenses.html');

    // Handle tab click events
    $('#expensesTab').click(function () {
        $('#contentContainer').load('expenses.html');
    });

    $('#summaryTab').click(function () {
        $('#contentContainer').load('summary.html');
    });
});
