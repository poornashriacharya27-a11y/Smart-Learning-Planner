document.addEventListener("DOMContentLoaded", function () {
    const studyForm = document.getElementById("studyForm");
    const formMessage = document.getElementById("formMessage");

    if (!studyForm || !formMessage) {
        console.error("Study form or output area not found.");
        return;
    }

    studyForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const examDate = document.getElementById("examDate").value;
        const subjectsInput = document.getElementById("subjects").value;
        const weakSubject = document.getElementById("weakSubject").value.trim();
        const startTime = document.getElementById("startTime").value;
        const studyHours = Number(document.getElementById("studyHours").value);
        const studyGoal = document.getElementById("studyGoal").value;

        // Validate the examination date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const selectedDate = examDate
            ? new Date(examDate + "T00:00:00")
            : new Date(NaN);

        if (isNaN(selectedDate.getTime()) || selectedDate <= today) {
            showMessage("Please select an examination date in the future.");
            return;
        }

        if (!startTime) {
            showMessage("Please select your study start time.");
            return;
        }

        // Prepare and remove duplicate subjects
        const subjects = subjectsInput
            .split(",")
            .map(subject => subject.trim())
            .filter(Boolean);

        const uniqueSubjects = [
            ...new Map(
                subjects.map(subject => [
                    subject.toLowerCase(),
                    subject
                ])
            ).values()
        ];

        if (uniqueSubjects.length === 0) {
            showMessage("Please enter at least one subject.");
            return;
        }

        if (!weakSubject) {
            showMessage("Please enter your most difficult subject.");
            return;
        }

        const difficultIndex = uniqueSubjects.findIndex(
            subject => subject.toLowerCase() === weakSubject.toLowerCase()
        );

        if (difficultIndex === -1) {
            showMessage(
                "Your difficult subject must also appear in your subjects list."
            );
            return;
        }

        if (!studyHours || studyHours < 1 || studyHours > 8) {
            showMessage("Please select your daily study hours.");
            return;
        }

        if (!studyGoal) {
            showMessage("Please select your study goal.");
            return;
        }

        // Calculate study time, including breaks
        const totalMinutes = studyHours * 60;
        const numberOfBreaks = uniqueSubjects.length - 1;
        const breakMinutes = numberOfBreaks * 10;
        const availableStudyMinutes = totalMinutes - breakMinutes;

        if (availableStudyMinutes < uniqueSubjects.length * 15) {
            showMessage(
                "There are too many subjects for your selected study hours. " +
                "Please select more hours or enter fewer subjects."
            );
            return;
        }

        // Give the difficult subject extra time
        const weights = uniqueSubjects.map((subject, index) =>
            index === difficultIndex ? 2 : 1
        );

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

        let sessions = uniqueSubjects.map((subject, index) => ({
            subject: subject,
            duration: Math.floor(
                availableStudyMinutes * weights[index] / totalWeight
            )
        }));

        // Distribute any remaining minutes
        let allocatedMinutes = sessions.reduce(
            (sum, session) => sum + session.duration,
            0
        );

        let remainingMinutes = availableStudyMinutes - allocatedMinutes;

        for (let i = 0; remainingMinutes > 0; i++) {
            sessions[i % sessions.length].duration++;
            remainingMinutes--;
        }

        // Build the timetable
        let currentMinutes = timeToMinutes(startTime);

        let timetableHTML = `
            <div class="timetable-card">
                <h2>Your Personalized Study Timetable 🌿</h2>

                <p>
                    <strong>Exam Date:</strong>
                    ${escapeHTML(selectedDate.toLocaleDateString())}
                </p>

                <p>
                    <strong>Daily Study Limit:</strong>
                    ${studyHours} hour(s), including breaks
                </p>

                <p>
                    <strong>Study Goal:</strong>
                    ${escapeHTML(getGoalText(studyGoal))}
                </p>

                <div class="timetable-list">
        `;

        sessions.forEach((session, index) => {
            const sessionStart = formatTime(currentMinutes);
            const sessionEnd = formatTime(
                currentMinutes + session.duration
            );

            const isDifficult = index === difficultIndex;

            timetableHTML += `
                <div class="timetable-item">
                    <div class="session-number">${index + 1}</div>

                    <div class="session-details">
                        <h3>${escapeHTML(session.subject)}</h3>

                        <p>
                            ${isDifficult
                                ? "⭐ High Priority Subject"
                                : "📚 Regular Study Session"}
                        </p>

                        <p class="session-time">
                            ${sessionStart} – ${sessionEnd}
                        </p>
                    </div>

                    <div class="session-duration">
                        ${session.duration} minutes
                    </div>
                </div>
            `;

            currentMinutes += session.duration;

            if (index < sessions.length - 1) {
                const breakStart = formatTime(currentMinutes);
                const breakEnd = formatTime(currentMinutes + 10);

                timetableHTML += `
                    <div class="break-item">
                        ☕ Break: ${breakStart} – ${breakEnd}
                        <span>Relax for 10 minutes</span>
                    </div>
                `;

                currentMinutes += 10;
            }
        });

        timetableHTML += `
                </div>

                <div class="timetable-summary">
                    <p>
                        📖 Total focused study time:
                        ${availableStudyMinutes} minutes
                    </p>

                    <p>
                        ☕ Total break time:
                        ${breakMinutes} minutes
                    </p>
                </div>

                <p class="timetable-note">
                    🌱 Stay consistent, take breaks, and keep learning!
                </p>
            </div>
        `;

        formMessage.innerHTML = timetableHTML;

        formMessage.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    function showMessage(message) {
        formMessage.textContent = message;

        formMessage.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function timeToMinutes(time) {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    }

    function formatTime(totalMinutes) {
        const normalizedMinutes =
            ((totalMinutes % 1440) + 1440) % 1440;

        const hours = Math.floor(normalizedMinutes / 60);
        const minutes = normalizedMinutes % 60;

        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;

        return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
    }

    function getGoalText(goal) {
        const goals = {
            pass: "Pass the Examination",
            "75": "Score Above 75%",
            "85": "Score Above 85%",
            "95": "Score Above 95%"
        };

        return goals[goal] || goal;
    }

    function escapeHTML(text) {
        return String(text).replace(/[&<>"']/g, function (character) {
            const characters = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            };

            return characters[character];
        });
    }
});
