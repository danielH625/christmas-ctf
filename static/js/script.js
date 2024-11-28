document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("challenge-modal");
    const modalContent = document.getElementById("modal-body");
    const modalClose = document.getElementById("modal-close");

    // Initialize solved flags from local storage
    const solvedFlags = JSON.parse(localStorage.getItem("solvedFlags")) || {};

    // Update UI based on solved flags
    for (const [challengeId, isSolved] of Object.entries(solvedFlags)) {
        if (isSolved) {
            const challengeBox = document.querySelector(`[data-challenge-id="${challengeId}"]`);
            if (challengeBox) {
                challengeBox.classList.add("solved");
                challengeBox.style.pointerEvents = "none"; // Disable further clicks
            }
        }
    }

    // Handle reset progress button click
    document.getElementById("reset-progress").addEventListener("click", () => {
        if (confirm("Are you sure you want to reset your progress?")) {
            // Clear local storage
            localStorage.removeItem("solvedFlags");

            // Reset UI
            document.querySelectorAll(".challenge-box").forEach(box => {
                box.classList.remove("solved");
                box.style.pointerEvents = ""; // Re-enable clicks
            });

            alert("Progress has been reset.");
        }
    });

    // Handle challenge box clicks
    document.querySelectorAll(".challenge-box").forEach(box => {
        box.addEventListener("click", (event) => {
            event.preventDefault();
            const challengeId = box.getAttribute("data-challenge-id");
            openModal(challengeId);
        });
    });

    // Close the modal
    modalClose.addEventListener("click", () => {
        closeModal();
    });

    // Close modal when clicking outside of it
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Open modal and fetch challenge data
    function openModal(challengeId) {
        fetch(`/challenge_data/${challengeId}`)
            .then(response => response.json())
            .then(data => {
                if (data.name) {
                    modalContent.innerHTML = `
                        <h1>${data.name}</h1>
                        <p>${data.description}</p>
                        ${data.encrypted_flag ? `<div class="encrypted-flag">
                            <p>Encrypted Flag:</p>
                            <code>${data.encrypted_flag}</code>
                        </div>` : ''}
                        ${data.download ? `<a href="${data.download}" class="download-link" download>
                            <button>Download Challenge File</button>
                        </a>` : ''}
                        ${data.hidden_link ? `<a href="${data.hidden_link}" target="_blank">
                            <button>Go to Challenge</button>
                        </a>` : ''}
                        <div class="flag-submission">
                            <input type="text" id="flag-input" placeholder="Enter your flag" data-challenge-id="${challengeId}">
                            <button id="submit-btn">Submit Flag</button>
                            <p id="response"></p>
                        </div>
                    `;
                    modal.style.display = "block";

                    // Add flag submission event listeners
                    const submitBtn = document.getElementById("submit-btn");
                    const flagInput = document.getElementById("flag-input");
                    submitBtn.addEventListener("click", submitFlag);
                    flagInput.addEventListener("keydown", (event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            submitFlag();
                        }
                    });
                } else {
                    console.error("Error: Challenge data not found.");
                }
            })
            .catch(error => console.error(`Error fetching challenge data: ${error}`));
    }

    // Close the modal
    function closeModal() {
        modal.style.display = "none";
        modalContent.innerHTML = ""; // Clear content
    }

    // Submit the flag
    function submitFlag() {
        const flagInput = document.getElementById("flag-input");
        const flag = flagInput.value;
        const challengeId = flagInput.getAttribute("data-challenge-id");

        fetch("/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ challenge_id: challengeId, flag: flag })
        })
            .then(response => response.json())
            .then(data => {
                const responseElement = document.getElementById("response");
                if (data.solved) {
                    responseElement.textContent = "Correct flag!";
                    responseElement.style.color = "green";

                    // Update solved state in local storage
                    solvedFlags[challengeId] = true;
                    localStorage.setItem("solvedFlags", JSON.stringify(solvedFlags));

                    // Update UI
                    const challengeBox = document.querySelector(`[data-challenge-id="${challengeId}"]`);
                    if (challengeBox) {
                        challengeBox.classList.add("solved");
                        challengeBox.style.pointerEvents = "none"; // Disable further clicks
                    }

                    setTimeout(() => {
                        closeModal();
                    }, 1000);
                } else {
                    responseElement.textContent = "Incorrect flag.";
                    responseElement.style.color = "red";
                }
            })
            .catch(error => console.error("Error submitting flag:", error));
    }
});
