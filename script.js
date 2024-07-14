let previousSeconds = new Date().getSeconds();



function updateClock() {
    const now = new Date();
    const seconds = now.getSeconds();
    const secondsPlusMilliseconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const minutes = now.getMinutes();
    const hours = now.getHours();

    // //time below is for making clock look prettier
    // const seconds = 52;
    // const minutes = 45;
    // const hours = 9;

    // const secondDegrees = ((seconds / 60) * 360);


    const secondDegrees = ((secondsPlusMilliseconds / 60) * 360);
    const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
    const hourDegrees = ((hours + minutes / 60) / 12) * 360;

    document.getElementById('second-hand-group').style.transform = `rotate(${secondDegrees}deg)`;
    document.getElementById('minute-hand-group').style.transform = `rotate(${minuteDegrees}deg)`;
    document.getElementById('hour-hand-group').style.transform = `rotate(${hourDegrees}deg)`;


    const hoursString = String(hours).padStart(2, '0');
    const minutesString = String(minutes).padStart(2, '0');
    const secondsString = String(seconds).padStart(2, '0');
    const timeString = `${hoursString}: ${minutesString}: ${secondsString}`;
    document.getElementById('digital-clock').textContent = timeString;

    requestAnimationFrame(updateClock);
}

setInterval(updateClock, 1000);
updateClock();
requestAnimationFrame(updateClock);
