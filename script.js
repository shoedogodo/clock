
let isDragging = false;
let DraggingMinuteHand = false;
let DraggingHourHand = false;
let draggedElement = null;
let customTime = null; //存储拖拽时的时间
let lastUpdateTime = Date.now();//存储最后一次更新的时间
let baseAngle = null; //存储基准角度
let AF = null;

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
    const secondsPlusMilliseconds = now.getSeconds() + now.getMilliseconds() / 1000;
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secondDegrees = ((secondsPlusMilliseconds / 60) * 360);
    const minuteDegrees = ((minutes + secondsPlusMilliseconds / 60) / 60) * 360;
    const hourDegrees = ((hours + minutes / 60) / 12) * 360;

    // 设置秒针的旋转角度
    document.getElementById('second-hand-group').style.transform = `rotate(${secondDegrees}deg)`;

    if (!DraggingMinuteHand){
      document.getElementById('minute-hand-group').style.transform = `rotate(${minuteDegrees}deg)`;
    }
    if (!DraggingHourHand){
      document.getElementById('hour-hand-group').style.transform = `rotate(${hourDegrees}deg)`;
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
  console.log("鼠标x值：", svgPoint.x,"鼠标y值：", svgPoint.y);
  console.log(svgPoint.x - centerX,centerY-svgPoint.y);
  console.log("起始角度（相较12点方向）",baseAngle);

  const baseTime = customTime ? new Date(customTime) : new Date();
  draggedElement.setAttribute('data-base-time', baseTime.getTime());
}

function stopDrag() {
    isDragging = false;
    DraggingMinuteHand = false;
    DraggingHourHand = false;
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
        console.log("表盘中心：", centerX, centerY);
        console.log("鼠标x值：", svgPoint.x,"鼠标y值：", svgPoint.y);
        console.log(svgPoint.x - centerX,centerY-svgPoint.y);
        currentAngle = 90 - Math.atan2(centerY - svgPoint.y, svgPoint.x - centerX) * (180 / Math.PI) ; 
        //遇到问题：为什么拖拽分针到第三象限的时候时针会疯狂转动，而且分针会剧烈抖动；每个针在第一次拖动的时候不随鼠标位置转移
        //原因：
        console.log("目前角度（相较12点方向）：",currentAngle);
        let angle = currentAngle - baseAngle; // 计算拖拽的角度,负角度（经过x轴、y轴时）需要加360度
        angle = (angle + 360) % 360;
        console.log("拖拽角度：",angle);
        //draggedElement.style.transform = `rotate(${angle}deg)`;
        draggedElement.style.transform = `rotate(${angle+baseAngle}deg)`;
        //`rotate(${angle+baseAngle}deg)`要不要加baseAngle
        // 根据拖拽的角度计算时间
        let hours, minutes;
        if (draggedElement.id === 'hour-hand-group') {
            DraggingHourHand = true;
            hours = ((angle+baseAngle) / 30) % 12;
            //这里有问题，hours不应该是angle来设置
            customTime = new Date(customTime || new Date()).setHours(hours);
        } else if (draggedElement.id === 'minute-hand-group') {
            DraggingMinuteHand = true;
            minutes = ((angle+baseAngle) / 6) % 60;
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

function startStopwatch() {
  if (stopwatchInterval){
    clearInterval(stopwatchInterval);
  }
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
    if (!stopwatchInterval) {
        const hoursString = String(hours).padStart(2, '0');
        const minutesString = String(minutes).padStart(2, '0');
        const secondsString = String(Math.floor(secondsPlusMilliseconds)).padStart(2, '0');
        document.getElementById('digital-clock').textContent = `${hoursString}:${minutesString}:${secondsString}`;
    }
    
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
  const second = parseInt(document.getElementById('inputsecond').value, 10) || 0;

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
    list.innerHTML += `<li>${timeString} <button onclick="toggleAlarm(${index})">${alarm.enabled ? '关闭' : '开启'}</button></li>`;
  });
  document.getElementById('alarm-sound').pause();
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