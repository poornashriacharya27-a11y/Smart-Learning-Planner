document.addEventListener("DOMContentLoaded", function () {

    // Get HTML elements
    const taskForm = document.getElementById("taskForm");
    const taskInput = document.getElementById("taskInput");
    const taskList = document.getElementById("taskList");
    const progressText = document.getElementById("progressText");
    const progressBar = document.getElementById("progressBar");
    const progressPercentage = document.getElementById("progressPercentage");
    const taskMessage = document.getElementById("taskMessage");

    // Stop safely if the required HTML elements are missing
    if (
        !taskForm ||
        !taskInput ||
        !taskList ||
        !progressText ||
        !progressBar ||
        !progressPercentage ||
        !taskMessage
    ) {
        console.error("Some Daily Tasks HTML elements are missing.");
        return;
    }

    // Load saved tasks from browser storage
    let tasks = [];

    try {
        const savedTasks = JSON.parse(
            localStorage.getItem("studyPlannerTasks")
        );

        if (Array.isArray(savedTasks)) {
            tasks = savedTasks.filter(function (task) {
                return (
                    task &&
                    typeof task.id === "string" &&
                    typeof task.name === "string" &&
                    typeof task.completed === "boolean"
                );
            });
        }
    } catch (error) {
        tasks = [];
    }

    // Add a new task
    taskForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const taskName = taskInput.value.trim();

        if (taskName === "") {
            showMessage("Please enter a study task.");
            return;
        }

        const newTask = {
            id: Date.now().toString() +
                Math.random().toString(16).slice(2),
            name: taskName,
            completed: false
        };

        tasks.push(newTask);

        saveTasks();
        renderTasks();

        taskInput.value = "";
        taskInput.focus();

        showMessage("Your new study task has been added! 🌱");
    });

    // Display tasks
    function renderTasks() {

        taskList.innerHTML = "";

        tasks.forEach(function (task) {

            const listItem = document.createElement("li");
            listItem.className = "task-item";

            if (task.completed) {
                listItem.classList.add("completed");
            }

            // Checkbox
            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            checkbox.className = "task-checkbox";
            checkbox.checked = task.completed;

            checkbox.setAttribute(
                "aria-label",
                "Mark " + task.name + " as completed"
            );

            checkbox.addEventListener("change", function () {

                task.completed = checkbox.checked;

                saveTasks();
                renderTasks();

                if (task.completed) {
                    showMessage(
                        "Well done! Keep up the great work! 🎉"
                    );
                } else {
                    showMessage("Task marked as incomplete.");
                }
            });

            // Task name
            const taskText = document.createElement("span");

            taskText.className = "task-text";
            taskText.textContent = task.name;

            // Delete button
            const deleteButton = document.createElement("button");

            deleteButton.type = "button";
            deleteButton.className = "delete-task";
            deleteButton.textContent = "Delete";

            deleteButton.setAttribute(
                "aria-label",
                "Delete " + task.name
            );

            deleteButton.addEventListener("click", function () {

                tasks = tasks.filter(function (item) {
                    return item.id !== task.id;
                });

                saveTasks();
                renderTasks();

                showMessage("Study task deleted.");
            });

            // Add elements to the task list
            listItem.appendChild(checkbox);
            listItem.appendChild(taskText);
            listItem.appendChild(deleteButton);

            taskList.appendChild(listItem);

        });

        updateProgress();
    }

    // Update progress bar and percentage
    function updateProgress() {

        const totalTasks = tasks.length;

        const completedTasks = tasks.filter(function (task) {
            return task.completed;
        }).length;

        const percentage = totalTasks === 0
            ? 0
            : Math.round((completedTasks / totalTasks) * 100);

        progressText.textContent =
            completedTasks + " of " +
            totalTasks + " tasks completed";

        progressBar.style.width = percentage + "%";

        progressPercentage.textContent =
            percentage + "% completed";

        progressBar.setAttribute("role", "progressbar");
        progressBar.setAttribute("aria-valuemin", "0");
        progressBar.setAttribute("aria-valuemax", "100");
        progressBar.setAttribute("aria-valuenow", percentage);
    }

    // Save tasks in browser storage
    function saveTasks() {

        try {
            localStorage.setItem(
                "studyPlannerTasks",
                JSON.stringify(tasks)
            );
        } catch (error) {
            showMessage(
                "Unable to save tasks in this browser."
            );
        }
    }

    // Display messages
    function showMessage(message) {
        taskMessage.textContent = message;
    }

    // Show saved tasks when the page opens
    renderTasks();

});
