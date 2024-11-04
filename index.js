        let countdown;
        const display = document.getElementById('countdown-display');
        const fullscreenTimer = document.getElementById('fullscreen-timer');
        const displayFull = document.getElementById('countdown-display-full');
        const timerContainer = document.getElementById('timer-container');

        // Sound files
        const endSound = new Audio('a.wav');  // Plays when time is up
        const intervalSound = new Audio('b.wav'); // Plays at user-defined intervals

        // User-defined interval defaults
        let soundIntervalHours = 1;
        let soundIntervalMinutes = 0;
        let soundIntervalSeconds = 0;
        let lastSoundTime = { hours: 0, minutes: 0, seconds: 0 };

        function playSoundForOneMinute(audio) {
            audio.loop = true;
            audio.play().catch(error => console.error("Error playing sound:", error));
            setTimeout(() => {
                audio.loop = false;
                audio.pause();
                audio.currentTime = 0;
            }, 5000);
        }

        function setIntervalSound() {
            soundIntervalHours = parseInt(document.getElementById('interval-hours').value) || 0;
            soundIntervalMinutes = parseInt(document.getElementById('interval-minutes').value) || 0;
            soundIntervalSeconds = parseInt(document.getElementById('interval-seconds').value) || 0;
            lastSoundTime = { hours: 0, minutes: 0, seconds: 0 }; // Reset last sound time

            console.log("Interval set to:", soundIntervalHours, "hours", soundIntervalMinutes, "minutes", soundIntervalSeconds, "seconds");
        }

        function startTimer() {
            const hours = parseInt(document.getElementById('hours').value) || 0;
            const minutes = parseInt(document.getElementById('minutes').value) || 0;
            const seconds = parseInt(document.getElementById('seconds').value) || 0;

            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            if (totalSeconds <= 0) {
                display.innerText = "Please set a valid time.";
                return;
            }

            // Calculate end time and save to localStorage
            const endTime = Date.now() + totalSeconds * 1000;
            localStorage.setItem('timerEndTime', endTime);

            lastSoundTime = { hours: hours, minutes: minutes, seconds: seconds };
            openFullscreen();
            runCountdown(endTime);
        }

        function runCountdown(endTime) {
            clearInterval(countdown);
            countdown = setInterval(() => {
                const remainingTime = Math.max(0, endTime - Date.now());
                const totalSeconds = Math.floor(remainingTime / 1000);

                const hrs = Math.floor(totalSeconds / 3600);
                const mins = Math.floor((totalSeconds % 3600) / 60);
                const secs = totalSeconds % 60;

                const formattedTime =
                    `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

                display.innerText = formattedTime;
                displayFull.innerText = formattedTime;

                // Check if the defined interval has passed to play the interval sound
                const timeSinceLastSound = {
                    hours: Math.abs(lastSoundTime.hours - hrs),
                    minutes: Math.abs(lastSoundTime.minutes - mins),
                    seconds: Math.abs(lastSoundTime.seconds - secs),
                };

                // Log interval to confirm conditions
                console.log("Time since last sound:", timeSinceLastSound);

                if (timeSinceLastSound.hours >= soundIntervalHours &&
                    timeSinceLastSound.minutes >= soundIntervalMinutes &&
                    timeSinceLastSound.seconds >= soundIntervalSeconds) {
                    playSoundForOneMinute(intervalSound);
                    lastSoundTime = { hours: hrs, minutes: mins, seconds: secs };
                    console.log("Interval sound played.");
                }

                // Play end sound for 1 minute when time is up
                if (totalSeconds <= 0) {
                    clearInterval(countdown);
                    localStorage.removeItem('timerEndTime');
                    display.innerText = "Time's up!";
                    displayFull.innerText = "Time's up!";
                    playSoundForOneMinute(endSound);
                    console.log("End sound played.");
                    resetTimer();
                }
            }, 1000);
        }

        function resetTimer() {
            clearInterval(countdown);
            localStorage.removeItem('timerEndTime');
            display.innerText = "00:00:00";
            displayFull.innerText = "00:00:00";
            document.getElementById('hours').value = "";
            document.getElementById('minutes').value = "";
            document.getElementById('seconds').value = "";
            closeFullscreen();
        }

        function openFullscreen() {
            fullscreenTimer.style.display = 'flex';
            timerContainer.style.transform = 'scale(0)';
        }

        function closeFullscreen() {
            fullscreenTimer.style.display = 'none';
            timerContainer.style.transform = 'scale(1)';
        }

        // Resume timer if there's an active countdown on page load
        window.onload = function () {
            const savedEndTime = localStorage.getItem('timerEndTime');
            if (savedEndTime) {
                openFullscreen();
                runCountdown(Number(savedEndTime));
            }
        };

        // Listen for the Enter key on input fields
        document.querySelectorAll('.timer-input').forEach(input => {
            input.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    startTimer();
                }
            });
        });