$(document).ready(function () {
    console.log('hi');
    updateExpenseList();

    $('#signOutButton').click(function () {
        signOutUser();
    });

    $('#addExpenseButton').click(function () {
        openEditModal();
    });

    $('#expenseForm').submit(function (event) {
        event.preventDefault();
        addOrUpdateExpense();
    });
});

function addOrUpdateExpense() {
    const id = $('#expenseId').val(); // Get the expense ID
    const amount = $('#expenseAmount').val();
    const date = $('#expenseDate').val();
    const description = $('#expenseDescription').val();
    const category = $('#expenseCategory').val();

    let expenses = JSON.parse(localStorage.getItem('userExpenses')) || {};
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser || !currentUser.username) {
        console.log('No current user or current user does not have a username');
        return;
    }

    if (!expenses[currentUser.username]) {
        expenses[currentUser.username] = { expenses: [] };
    }

    if (id) {
        // Update existing expense
        const index = expenses[currentUser.username].expenses.findIndex(exp => exp.id === id);
        if (index !== -1) {
            expenses[currentUser.username].expenses[index] = {
                id: id,
                amount: amount,
                date: date,
                description: description,
                category: category
            };
        }
    } else {
        // Add new expense
        expenses[currentUser.username].expenses.push({
            id: Date.now().toString(),
            amount: amount,
            date: date,
            description: description,
            category: category
        });
    }

    localStorage.setItem('userExpenses', JSON.stringify(expenses));
    console.log('Stored expenses:', JSON.stringify(expenses));

    updateExpenseList();
    clearFormFields();
    closeModal();
}

function openEditModal(expense) {
    if (expense) {
        $('#expenseId').val(expense.id);
        $('#expenseAmount').val(expense.amount);
        $('#expenseDate').val(expense.date);
        $('#expenseDescription').val(expense.description);
        $('#expenseCategory').val(expense.category);
    } else {
        $('#expenseId').val('');
        clearFormFields();
        $('#deleteExpense').hide();  // Hide the delete button if adding new expense

    }

    let deleteButton = $('#deleteExpense');
    if (deleteButton.length === 0) {
        deleteButton = $('<ion-button color="danger" id="deleteExpense">Delete Expense</ion-button>');
        $('#expenseForm').append(deleteButton);
    }

    deleteButton.off('click').on('click', function () {
        deleteExpense($('#expenseId').val());
        closeModal();
    });

    const modal = document.querySelector('ion-modal');
    modal.present();
}

function deleteExpense(expenseId) {
    let expenses = JSON.parse(localStorage.getItem('userExpenses')) || {};
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !expenses[currentUser.username]) {
        console.log('No current user or user expenses found');
        return;
    }

    expenses[currentUser.username].expenses = expenses[currentUser.username].expenses.filter(expense => expense.id !== expenseId);
    localStorage.setItem('userExpenses', JSON.stringify(expenses));
    updateExpenseList();
}

function updateExpenseList() {
    const expenses = JSON.parse(localStorage.getItem('userExpenses')) || {};
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser || !expenses[currentUser.username]) {
        console.log('No expenses or current user found');
        displayPlaceholder(true);
        return;
    }

    const userExpenses = expenses[currentUser.username].expenses;
    if (userExpenses.length > 0) {
        displayExpenses(userExpenses);
        displayPlaceholder(false);
    } else {
        displayPlaceholder(true);
    }
}
function getIconName(category) {
    switch (category) {
        case 'food':
            return 'pizza-outline';
        case 'transportation':
            return 'car-outline';
        case 'utilities':
            return 'flash-outline';
        case 'entertainment':
            return 'game-controller-outline';
        case 'other':
            return 'bag-handle-outline';
        default:
            return 'wallet-outline'; // Default icon
    }
}

function displayExpenses(expenses) {
    const list = $('#expenseList');
    list.empty();
    $.each(expenses, function (index, expense) {
        const formattedAmount = `RM ${parseFloat(expense.amount).toFixed(2)}`;
        const item = $(`
    <ion-item lines="full">
        <ion-avatar slot="start">
            <ion-icon name="${getIconName(expense.category)}" size="large"></ion-icon>
        </ion-avatar>
        <ion-label class="ion-text-wrap">
            <h2>${expense.description}</h2>
            <p>${expense.date}</p>
        </ion-label>
        <ion-note slot="end" color="danger">${formattedAmount}</ion-note>
    </ion-item>
`);


        item.on('click', function () {
            openEditModal(expense);
        });

        list.append(item);
    });
}

function closeModal() {
    const modal = document.querySelector('ion-modal');
    if (modal.dismiss) {
        modal.dismiss();
    } else {
        console.error('Modal dismiss function not available');
    }
}

function clearFormFields() {
    $('#expenseAmount').val('');
    $('#expenseDate').val('');
    $('#expenseDescription').val('');
    $('#expenseCategory').val('');
    $('#expenseId').val('');
}

function displayPlaceholder(show) {
    const list = $('#expenseList');
    const placeholder = $('#placeholder');
    if (show) {
        list.hide();
        placeholder.show();
    } else {
        list.show();
        placeholder.hide();
    }
}

function signOutUser() {
    localStorage.removeItem('currentUser'); // Remove the current user from local storage
    window.location.href = 'index.html'; // Redirect to the index page
}
