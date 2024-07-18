function updateClock() {

    // 获取当前时间
    const now = new Date();
    // 获取当前的秒数(得到整数)
    const seconds = now.getSeconds();
    // 获取当前的秒数并加上毫秒数，得到更精确的秒数(得到小数)(为了秒针运动的平滑)
    const secondsPlusMilliseconds = now.getSeconds() + now.getMilliseconds() / 1000;
    // 获取当前的分钟数
    const minutes = now.getMinutes();
    // 获取当前的小时数
    const hours = now.getHours();

    // 将秒数转换成度数 (每60秒是360度)
    const secondDegrees = ((secondsPlusMilliseconds / 60) * 360);
    // 将分钟数转换成度数 (每60分钟是360度)
    const minuteDegrees = ((minutes + seconds / 60) / 60) * 360;
    // 将小时数转换成度数 (每12小时是360度)
    const hourDegrees = ((hours + minutes / 60) / 12) * 360;

    // 设置秒针的旋转角度
    document.getElementById('second-hand-group').style.transform = `rotate(${secondDegrees}deg)`;
    // 设置分针的旋转角度
    document.getElementById('minute-hand-group').style.transform = `rotate(${minuteDegrees}deg)`;
    // 设置时针的旋转角度
    document.getElementById('hour-hand-group').style.transform = `rotate(${hourDegrees}deg)`;

    // 将小时、分钟和秒数转换成字符串，并且确保是两位数格式（例如：09:05:08）
    const hoursString = String(hours).padStart(2, '0');
    const minutesString = String(minutes).padStart(2, '0');
    const secondsString = String(seconds).padStart(2, '0');
    // 拼接成时间字符串
    const timeString = `${hoursString}:${minutesString}:${secondsString}`;
    // 显示数字时钟
    document.getElementById('digital-clock').textContent = timeString;

    // 使用 requestAnimationFrame 来确保动画的流畅性
    requestAnimationFrame(updateClock);
}

// 每秒更新一次时钟
setInterval(updateClock, 1000);
// 初始调用更新函数
updateClock();
// 确保动画流畅
requestAnimationFrame(updateClock);








// 秒表功能
let stopwatchInterval;
let stopwatchStartTime;
let stopwatchElapsedTime = 0;

function startStopwatch() {
    stopwatchStartTime = Date.now() - stopwatchElapsedTime;
    stopwatchInterval = setInterval(updateStopwatch, 10); // 每 10 毫秒更新一次
}

function stopStopwatch() {
    clearInterval(stopwatchInterval);
}

function resetStopwatch() {
    clearInterval(stopwatchInterval);
    stopwatchElapsedTime = 0;
    document.getElementById('stopwatch-display').textContent = '00:00:00:00';
}

function updateStopwatch() {
    stopwatchElapsedTime = Date.now() - stopwatchStartTime;
    const totalSeconds = Math.floor(stopwatchElapsedTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((stopwatchElapsedTime % 1000) / 10); // 百分之一秒

    const hoursString = String(hours).padStart(2, '0');
    const minutesString = String(minutes).padStart(2, '0');
    const secondsString = String(seconds).padStart(2, '0');
    const centisecondsString = String(centiseconds).padStart(2, '0');
    document.getElementById('stopwatch-display').textContent = `${hoursString}:${minutesString}:${secondsString}:${centisecondsString}`;
}

document.getElementById('start-stopwatch').addEventListener('click', startStopwatch);
document.getElementById('stop-stopwatch').addEventListener('click', stopStopwatch);
document.getElementById('reset-stopwatch').addEventListener('click', resetStopwatch);
