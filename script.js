
let isDragging = false;
let DraggingMinuteHand = false;
let DraggingHourHand = false;
let DraggingSecondHand = false;
let draggedElement = null;
let customTime = null; //存储拖拽时的时间
let lastUpdateTime = Date.now();//存储最后一次更新的时间
let baseAngle = null; //存储基准角度
let AF = null;
let isPM = false;
let Checked = false;

function updateClock() {
  //需要自定义时间
  let now;
  //用差值来保持指针继续转动
  if (customTime) {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastUpdateTime;
    customTime += deltaTime;
    now = new Date(customTime);
    lastUpdateTime = currentTime;
  } else {
    now = new Date();
    lastUpdateTime = now.getTime();
  }
  var secondsPlusMilliseconds
  if (!DraggingSecondHand) {
    secondsPlusMilliseconds = now.getSeconds() + now.getMilliseconds() / 1000;
  }
  else {
    secondsPlusMilliseconds = now.getSeconds();
  }

  const minutes = now.getMinutes();
  const hours = now.getHours();
  if (!isDragging) {
    if (hours >= 12) {
      isPM = true;
    }
    else {
      isPM = false;
    }
  }

  const secondDegrees = ((secondsPlusMilliseconds / 60) * 360);
  const minuteDegrees = ((minutes + secondsPlusMilliseconds / 60) / 60) * 360;
  const hourDegrees = ((hours + minutes / 60) / 12) * 360;

  // 设置秒针的旋转角度


  if (!isDragging || DraggingSecondHand) {
    document.getElementById('minute-hand-group').style.transform = `rotate(${minuteDegrees}deg)`;
  }
  if (!DraggingHourHand) {
    document.getElementById('hour-hand-group').style.transform = `rotate(${hourDegrees}deg)`;
  }
  if (!DraggingSecondHand) {
    document.getElementById('second-hand-group').style.transform = `rotate(${secondDegrees}deg)`;
  }

  // 将小时、分钟和秒数转换成字符串，并且确保是两位数格式
  const hoursString = String(hours).padStart(2, '0');
  const minutesString = String(minutes).padStart(2, '0');
  const secondsString = String(Math.floor(secondsPlusMilliseconds)).padStart(2, '0');
  document.getElementById('digital-clock').textContent = `${hoursString}:${minutesString}:${secondsString}`;
  requestAnimationFrame(updateClock);
}

// function startDrag(e) {
//     isDragging = true;
//     //draggedElement = e.target或者它的父亲
//     draggedElement = e.target.id.includes('hand-group') ? e.target : e.target.parentElement;
//     // const rect = draggedElement.getBoundingClientRect();
//     // console.log(rect);
//     //存疑！！！！！！！！！！！！！
//     //const centerX = rect.left + rect.width / 2;
//     //console.log(centerX); 
//     // const centerY = rect.top + rect.height / 2;
//     // console.log(centerY);
//     // 获取SVG元素
//     // 获取viewBox属性值
//     console.log("表盘中心：",centerX, centerY);
//     baseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI); // 计算基准角度
//     console.log("鼠标y值：",e.clientY);
//     console.log("鼠标x值：",e.clientX);
//     console.log(baseAngle);
//     const baseTime = customTime ? new Date(customTime) : new Date();
//     draggedElement.setAttribute('data-base-time', baseTime.getTime());
//     //console.log(draggedElement);
// }
function startDrag(e) {
  isDragging = true;
  draggedElement = e.target.id.includes('hand-group') ? e.target : e.target.parentElement;
  const svgElement = document.querySelector('svg');
  const pt = svgElement.createSVGPoint(); // 创建一个SVG点
  pt.x = e.clientX;
  pt.y = e.clientY;
  const svgPoint = pt.matrixTransform(svgElement.getScreenCTM().inverse()); // 将屏幕坐标转换为SVG坐标
  const viewBox = svgElement.getAttribute('viewBox').split(' ');
  const width = parseFloat(viewBox[2]);
  const height = parseFloat(viewBox[3]);
  const centerX = width / 2;
  const centerY = height / 2;
  console.log("表盘中心：", centerX, centerY);
  baseAngle = 90 - Math.atan2(centerY - svgPoint.y, svgPoint.x - centerX) * (180 / Math.PI); // 使用转换后的坐标计算基准角度
  console.log("鼠标x值：", svgPoint.x, "鼠标y值：", svgPoint.y);
  console.log(svgPoint.x - centerX, centerY - svgPoint.y);
  console.log("起始角度（相较12点方向）", baseAngle);

  const baseTime = customTime ? new Date(customTime) : new Date();
  draggedElement.setAttribute('data-base-time', baseTime.getTime());
}

function stopDrag() {
  isDragging = false;
  DraggingMinuteHand = false;
  DraggingHourHand = false;
  DraggingSecondHand = false;
  draggedElement = null;
  baseAngle = null; // 重置基准角度
  //requestAnimationFrame(updateClock); // 重新开始自动更新
}

function drag(e) {
  if (!isDragging || !draggedElement) return;

  if (AF) {
    cancelAnimationFrame(AF);
  }
  AF = requestAnimationFrame(() => {
    console.log(draggedElement);
    // const rect = draggedElement.getBoundingClientRect();
    // const centerX = rect.left + rect.width / 2;
    // const centerY = rect.top + rect.height / 2;
    const svgElement = document.querySelector('svg');
    const pt = svgElement.createSVGPoint(); // 创建一个SVG点
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPoint = pt.matrixTransform(svgElement.getScreenCTM().inverse()); // 将屏幕坐标转换为SVG坐标
    const viewBox = svgElement.getAttribute('viewBox').split(' ');
    const width = parseFloat(viewBox[2]);
    const height = parseFloat(viewBox[3]);
    const centerX = width / 2;
    const centerY = height / 2;
    const distance = Math.sqrt(Math.pow(svgPoint.x - centerX, 2) + Math.pow(svgPoint.y - centerY, 2));
    const radiusThreshold = Math.min(width, height) / 2 * 0.1;
    if (distance < radiusThreshold) {
      console.log("Too close to the center, no dragging performed.");
      return; // 鼠标太接近中心，不执行拖拽操作
    }
    //console.log("表盘中心：", centerX, centerY);
    //console.log("鼠标x值：", svgPoint.x,"鼠标y值：", svgPoint.y);
    //console.log(svgPoint.x - centerX,centerY-svgPoint.y);
    currentAngle = 90 - Math.atan2(centerY - svgPoint.y, svgPoint.x - centerX) * (180 / Math.PI);
    //console.log("目前角度（相较12点方向）：",currentAngle);
    let angle = currentAngle - baseAngle; // 计算拖拽的角度,负角度（经过x轴、y轴时）需要加360度
    angle = (angle + 360) % 360;
    //console.log("拖拽角度：",angle);
    //draggedElement.style.transform = `rotate(${angle}deg)`;
    draggedElement.style.transform = `rotate(${angle + baseAngle}deg)`;
    //`rotate(${angle+baseAngle}deg)`要不要加baseAngle
    // 根据拖拽的角度计算时间
    let hours, minutes, seconds;
    if (draggedElement.id === 'hour-hand-group') {
      DraggingHourHand = true;
      let newTime = new Date(customTime || new Date());

      console.log((currentAngle + 360) % 360);

      // 计算拖拽后的小时数，并更新小时
      hours = Math.floor((((currentAngle + 360) % 360) / 30) % 12);
      if (currentAngle >= 0 && currentAngle <= 2 && !Checked) {
        isPM = !isPM;
        Checked = true;
      }
      if ((currentAngle < 0 || currentAngle > 2) && Checked) {
        Checked = false;
      }
      if (isPM) {
        hours += 12;
      }

      console.log(hours);

      let correctedMinuteAngle = (((currentAngle + 360) % 360) - (hours % 12) * 30) * 12;

      // 计算拖拽后的分钟数（分针旋转角度）
      minutes = (correctedMinuteAngle / 6) % 60;
      newTime.setHours(hours);
      newTime.setMinutes(minutes);
      customTime = newTime.getTime();
      console.log(new Date(customTime).getHours());

      // 更新分针的角度
      const minuteHand = document.getElementById('minute-hand-group');
      minuteHand.style.transform = `rotate(${correctedMinuteAngle}deg)`;
    }
    else if (draggedElement.id === 'minute-hand-group') {
      DraggingMinuteHand = true;
      minutes = ((angle + baseAngle + 360) / 6) % 60;
      let newTime = new Date(customTime || new Date());
      //发现问题：分钟经过12点时小时数不增加：原因：在sethour时没有考虑到小时的变化
      //解决方案：在sethour时判断分钟的大小，如果分钟大于50且当前分钟小于10，则小时数加1；如果分钟小于10且当前分钟大于50，则小时数减1
      if (newTime.getMinutes() > 50 && minutes < 10) {
        newTime.setHours(newTime.getHours() + 1);
      } else if (newTime.getMinutes() < 10 && minutes > 50) {
        newTime.setHours(newTime.getHours() - 1);
      }
      newTime.setMinutes(minutes);
      customTime = newTime.getTime();
    }
    else if (draggedElement.id === 'second-hand-group') {
      DraggingSecondHand = true;
      seconds = ((angle + baseAngle + 360) / 6) % 60;
      let newTime = new Date(customTime || new Date());
      if (newTime.getSeconds() > 50 && seconds < 10) {
        newTime.setMinutes(newTime.getMinutes() + 1);
      } else if (newTime.getSeconds() < 10 && seconds > 50) {
        newTime.setMinutes(newTime.getMinutes() - 1);
      }
      newTime.setSeconds(seconds);
      customTime = newTime.getTime();
    }
  });
}

// 初始化时钟更新
requestAnimationFrame(updateClock);

// 添加事件监听器
document.getElementById('hour-hand-group').addEventListener('mousedown', startDrag);
document.getElementById('minute-hand-group').addEventListener('mousedown', startDrag);
document.getElementById('second-hand-group').addEventListener('mousedown', startDrag);
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', stopDrag);


// 秒表功能
let stopwatchInterval;
let stopwatchStartTime;
let stopwatchElapsedTime = 0;

let stopwatchLapStartTime;
let stopwatchLapElapsedTime = 0;

function startStopwatch() {
  if (stopwatchInterval) {
    clearInterval(stopwatchInterval);
  }
  stopwatchStartTime = Date.now() - stopwatchElapsedTime;
  stopwatchLapStartTime = Date.now() - stopwatchLapElapsedTime;
  stopwatchInterval = setInterval(updateStopwatch, 10); // 每 10 毫秒更新一次
}

function stopStopwatch() {
  clearInterval(stopwatchInterval);
}

let laps = [];

function updateLapList() {
  const lap_list = document.getElementById('lap-list');
  lap_list.innerHTML = '';

  laps.forEach((lap, index) => {
      index++;

      const centiseconds = Math.floor(lap.time.getMilliseconds() / 10); // Get centiseconds
      const centisecondsString = centiseconds.toString().padStart(2, '0'); // Convert to string and pad with '0'
      const timeString = `${lap.time.getHours().toString().padStart(2, '0')}:${lap.time.getMinutes().toString().padStart(2, '0')}:${lap.time.getSeconds().toString().padStart(2, '0')}:${centisecondsString}`;

      const lapDisplayString = `Lap ${index}: ${timeString}`;

      const li = document.createElement('li');
      li.innerHTML = `${lapDisplayString}`

      lap_list.appendChild(li);
  });
}




function lapStopwatch() {
  if (stopwatchElapsedTime==0){
    return;
  }


  const totalSeconds = Math.floor(stopwatchLapElapsedTime / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((stopwatchLapElapsedTime % 1000) / 10); // 百分之一秒

  const lapTime = new Date();
  lapTime.setHours(hours, minutes, seconds, centiseconds*10);

  const lapNum = laps.length;

  const lap = {
    time: lapTime,
    index: lapNum
  };
  laps.push(lap);
  updateLapList();

  stopwatchLapElapsedTime = 0;
  stopwatchLapStartTime = Date.now() - stopwatchLapElapsedTime;
}

function resetStopwatch() {
  clearInterval(stopwatchInterval);
  stopwatchElapsedTime = 0;
  document.getElementById('stopwatch-display').textContent = '00:00:00:00';

  while (laps.length) {
    laps.pop();
  }
  updateLapList();

}

function updateStopwatch() {
  if (!stopwatchInterval) {
    const hoursString = String(hours).padStart(2, '0');
    const minutesString = String(minutes).padStart(2, '0');
    const secondsString = String(Math.floor(secondsPlusMilliseconds)).padStart(2, '0');
    document.getElementById('digital-clock').textContent = `${hoursString}:${minutesString}:${secondsString}`;
  }

  stopwatchElapsedTime = Date.now() - stopwatchStartTime;
  stopwatchLapElapsedTime = Date.now() - stopwatchLapStartTime;
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
document.getElementById('lap-stopwatch').addEventListener('click', lapStopwatch);
document.getElementById('reset-stopwatch').addEventListener('click', resetStopwatch);

// 参数输入设置时间
document.getElementById('submit').addEventListener('click', function (event) {
  event.preventDefault();
  const hours = parseInt(document.getElementById('inputhour').value, 10);
  const minutes = parseInt(document.getElementById('inputminute').value, 10);
  const seconds = parseInt(document.getElementById('inputsecond').value, 10);


  if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
    customTime = new Date();
    customTime.setHours(hours);
    customTime.setMinutes(minutes);
    customTime.setSeconds(seconds);
    customTime = customTime.getTime();
    lastUpdateTime = Date.now(); // 更新 lastUpdateTime
  } else {
    alert('请输入有效的时间');
  }
});

// 闹钟
let alarms = [];

function addAlarm() {
  const hour = parseInt(document.getElementById('inputhour').value, 10);
  const minute = parseInt(document.getElementById('inputminute').value, 10);
  const second = parseInt(document.getElementById('inputsecond').value, 10);

  if (!isNaN(hour) && !isNaN(minute) && !isNaN(second)) {
    const alarmTime = new Date();
    alarmTime.setHours(hour, minute, second, 0);

    const alarm = {
      time: alarmTime,
      enabled: true
    };
    alarms.push(alarm);
    updateAlarmList();
  } else {
    alert('请输入有效的时间');
  }
}

function updateAlarmList() {
  const list = document.getElementById('alarm-list');
  list.innerHTML = '';
  alarms.forEach((alarm, index) => {
      const timeString = `${alarm.time.getHours().toString().padStart(2, '0')}:${alarm.time.getMinutes().toString().padStart(2, '0')}:${alarm.time.getSeconds().toString().padStart(2, '0')}`;
      const li = document.createElement('li');
      li.innerHTML = `${timeString} <button onclick="toggleAlarm(${index})">${alarm.enabled ? '关闭' : '开启'}</button> <button onclick="deleteAlarm(${index})">删除</button>`;
      list.appendChild(li);
  });
  document.getElementById('alarm-sound').pause();
}

function deleteAlarm(index) {
  alarms.splice(index, 1);
  updateAlarmList();
}

function toggleAlarm(index) {
  alarms[index].enabled = !alarms[index].enabled;
  updateAlarmList();
}

function checkAlarms() {
  const now = customTime ? new Date(customTime) : new Date();
  alarms.forEach(alarm => {
    if (alarm.enabled && now.getHours() === alarm.time.getHours() && now.getMinutes() === alarm.time.getMinutes() && now.getSeconds() === alarm.time.getSeconds()) {
      //alert('闹钟时间到！');
      document.getElementById('alarm-sound').play();
      document.getElementById('stop_play').style.display = 'inline-block';
    }
  });
}

document.getElementById('set_alarm').addEventListener('click', function (event) {
  event.preventDefault();
  addAlarm();
});

document.getElementById('stop_play').addEventListener('click', function (event) {
  event.preventDefault();
  document.getElementById('alarm-sound').pause();
  document.getElementById('stop_play').style.display = 'none';
})

setInterval(checkAlarms, 500);

document.getElementById('stop_alarm').addEventListener('click', (event) => {
  event.preventDefault();
  while (alarms.length) {
    alarms.pop();
  }
  updateAlarmList();
})

document.getElementById('sync').addEventListener('click', function (event) {
  event.preventDefault();
  customTime = null;
  lastUpdateTime = Date.now();
})


// 倒计时功能
let countdownInterval;
let countdownTime;

function startCountdown() {
    const hours = parseInt(document.getElementById('inputhour').value, 10);
    const minutes = parseInt(document.getElementById('inputminute').value, 10);
    const seconds = parseInt(document.getElementById('inputsecond').value, 10);

    if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds) && hours >= 0 && minutes >= 0 && seconds >= 0) {
        countdownTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(updateCountdown, 1000);
    } else {
        alert('请输入有效的时间');
    }
}

function stopCountdown() {
    clearInterval(countdownInterval);
}

function resetCountdown() {
    clearInterval(countdownInterval);
    countdownTime = 0;
    document.getElementById('countdown-display').textContent = '00:00:00';
}

function updateCountdown() {
    if (countdownTime <= 0) {
        clearInterval(countdownInterval);
        document.getElementById('countdown-display').textContent = '00:00:00';
        alert('倒计时结束');
        return;
    }

    countdownTime -= 1000;
    const totalSeconds = Math.floor(countdownTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const hoursString = String(hours).padStart(2, '0');
    const minutesString = String(minutes).padStart(2, '0');
    const secondsString = String(seconds).padStart(2, '0');
    document.getElementById('countdown-display').textContent = `${hoursString}:${minutesString}:${secondsString}`;
}

document.getElementById('start-countdown').addEventListener('click', startCountdown);
document.getElementById('stop-countdown').addEventListener('click', stopCountdown);
document.getElementById('reset-countdown').addEventListener('click', resetCountdown);
