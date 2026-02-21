// Redirect to login if not logged in
const currentUser = localStorage.getItem("bbCurrent");
if (!currentUser) {
    window.location.href = "index.html";
}

// helper to create safe key for user's data
function safeEmail(email) {
    return email.replace(/[@.]/g, "_");
}
const userKey = "bbData_" + safeEmail(currentUser);

// ELEMENTS
const amountEl = document.getElementById("amount");
const typeEl = document.getElementById("type");
const categoryEl = document.getElementById("category");
const dateEl = document.getElementById("date");
const noteEl = document.getElementById("note");
const addBtn = document.getElementById("addBtn");
const tbody = document.getElementById("transactionBody");

const incomeSpan = document.getElementById("totalIncome");
const expenseSpan = document.getElementById("totalExpense");
const balanceSpan = document.getElementById("balance");
const monthFilter = document.getElementById("monthFilter");

let transactions = JSON.parse(localStorage.getItem(userKey) || "[]");
let expenseChart = null;

// Add entry
addBtn.addEventListener("click", () => {
    const amount = parseFloat(amountEl.value);
    const type = typeEl.value;
    const category = categoryEl.value;
    const date = dateEl.value;
    const note = noteEl.value.trim();

    if (!amount || !date) {
        alert("Please enter amount and date");
        return;
    }

    const entry = { amount, type, category, date, note };
    transactions.push(entry);
    localStorage.setItem(userKey, JSON.stringify(transactions));

    amountEl.value = "";
    noteEl.value = "";

    loadMonths();
    renderTable();
    updateSummary();
    updateChart();
});

// Populate Month Filter Options
function loadMonths() {
    const months = [...new Set(transactions.map(t => t.date.slice(0,7)))].sort().reverse();
    monthFilter.innerHTML = `<option value="all">All Months</option>`;
    months.forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = m;
        monthFilter.appendChild(opt);
    });
}

// Render transaction rows
function renderTable() {
    const filter = monthFilter.value;
    tbody.innerHTML = "";

    const filtered = (filter === "all") ? transactions : transactions.filter(t => t.date.startsWith(filter));

    filtered.forEach((t, displayIndex) => {
        const tr = document.createElement("tr");

        const typeTd = document.createElement("td");
        typeTd.textContent = t.type;
        typeTd.style.color = t.type === "income" ? "#4ade80" : "#f97373";

        const catTd = document.createElement("td");
        catTd.textContent = t.category;

        const amtTd = document.createElement("td");
        amtTd.textContent = "₹" + t.amount;

        const dateTd = document.createElement("td");
        dateTd.textContent = t.date;

        const noteTd = document.createElement("td");
        noteTd.textContent = t.note || "-";

        // DELETE BUTTON
        const delTd = document.createElement("td");
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.style.background = "#ef4444";
        delBtn.style.color = "white";
        delBtn.style.border = "none";
        delBtn.style.padding = "5px 10px";
        delBtn.style.borderRadius = "8px";
        delBtn.style.cursor = "pointer";

        delBtn.onclick = () => {
            if (!confirm("Delete this entry?")) return;

            // Need to find the correct index in the main transactions array
            // If filter is 'all', displayIndex === realIndex
            // If filtered, find real index by searching object identity
            const filterValue = monthFilter.value;
            if (filterValue === "all") {
                transactions.splice(displayIndex, 1);
            } else {
                // find the item in main transactions array (match by all fields)
                const item = filtered[displayIndex];
                const realIndex = transactions.findIndex(x => 
                    x.amount === item.amount && x.type === item.type && x.category === item.category && x.date === item.date && x.note === item.note
                );
                if (realIndex !== -1) transactions.splice(realIndex, 1);
            }

            localStorage.setItem(userKey, JSON.stringify(transactions));
            loadMonths();
            renderTable();
            updateSummary();
            updateChart();
        };

        delTd.appendChild(delBtn);

        tr.appendChild(typeTd);
        tr.appendChild(catTd);
        tr.appendChild(amtTd);
        tr.appendChild(dateTd);
        tr.appendChild(noteTd);
        tr.appendChild(delTd);

        tbody.appendChild(tr);
    });
}

// Summary cards
function updateSummary() {
    const filter = monthFilter.value;
    const data = (filter === "all") ? transactions : transactions.filter(t => t.date.startsWith(filter));

    let income = 0;
    let expense = 0;

    data.forEach(t => {
        if (t.type === "income") income += t.amount;
        else expense += t.amount;
    });

    incomeSpan.textContent = income.toFixed(2);
    expenseSpan.textContent = expense.toFixed(2);
    balanceSpan.textContent = (income - expense).toFixed(2);
}

// Pie chart for expense categories
function updateChart() {
    const filter = monthFilter.value;
    const data = (filter === "all") ? transactions : transactions.filter(t => t.date.startsWith(filter));

    const categoryTotals = {};
    data.filter(t => t.type === "expense").forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);

    if (expenseChart) {
        expenseChart.destroy();
    }

    const ctx = document.getElementById("expenseChart");
    expenseChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: ["#f97373", "#38bdf8", "#fbbf24", "#22c55e", "#a855f7", "#fb7185"]
            }]
        }
    });
}

// Scroll helper for navbar buttons
function scrollToSection(id) {
    const sec = document.getElementById(id);
    if (sec) sec.scrollIntoView({ behavior: "smooth" });
}

// Logout
function logout() {
    // Clear current user only (do not erase all users)
    localStorage.removeItem("bbCurrent");
    window.location.href = "index.html";
}

// Month filter events
monthFilter.addEventListener("change", () => {
    renderTable();
    updateSummary();
    updateChart();
});

// Initial render
loadMonths();
renderTable();
updateSummary();
updateChart();
