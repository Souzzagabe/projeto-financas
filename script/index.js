var modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close() {
        document.querySelector('.modal-overlay').classList.remove('active');
    },
};

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    },
};

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);
        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);
        App.reload();
    },

    incomes() {
        let income = 0;
        Transaction.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        });
        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        });
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    },
};

const Dom = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = Dom.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        Dom.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? 'income' : 'expense';
        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
        <tr>
            <td class="Description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="">
            </td>
        </tr>
        `;

        return html;
    },

    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions() {
        Dom.transactionsContainer.innerHTML = '';
    },
};

const Utils = {
    formatAmount(value) {
        value = value.trim().replace(',', '.');
        return Number(value) * 100;
    },

    formatDate(date) {
        const splittedDate = date.split('-');
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },

    formatCurrency(value) {
        const signal = value < 0 ? '-' : '';
        value = String(value).replace(/\D/g, '');
        value = Number(value) / 100;

        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });

        return signal + value;
    },
};

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    exitSignal: '',

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        };
    },

    validateFields() {
        const { description, amount, date } = Form.getValues();
        if (description.trim() === '' || amount.trim() === '' || date.trim() === '') {
            throw new Error('Por favor, preencha todos os campos!');
        }
    },

    formatValues() {
        const { description, amount, date } = Form.getValues();


        let type = '';
        if (Form.exitSignal === '-') {
            type = 'expense';
        } else if (Form.exitSignal === ' ') {
            type = 'income';
        }

        const formattedAmount = Utils.formatAmount(amount);
        const formattedDate = Utils.formatDate(date);

        return {
            description,
            amount: type === 'expense' ? -formattedAmount : formattedAmount,
            date: formattedDate,
            type,
        };
    },

    clearFields() {
        Form.description.value = '';
        Form.amount.value = '';
        Form.date.value = '';
        Form.exitSignal = '';
    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields();

            const transaction = Form.formatValues();
            Transaction.add(transaction);

            Form.clearFields();
            modal.close();
        } catch (error) {
            alert(error.message);
        }
    },
};

const App = {
    init() {
        Transaction.all.forEach((transaction, index) => {
            Dom.addTransaction(transaction, index);
        });

        Dom.updateBalance();
        Storage.set(Transaction.all);
    },

    reload() {
        Dom.clearTransactions();
        App.init();
    },
};

function OutSignal() {
    Form.exitSignal = '-';
}

App.init();
Transaction.remove(0);