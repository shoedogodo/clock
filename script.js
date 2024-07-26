
let isDragging = false;
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

    document.getElementById('second-hand-group').style.transform = `rotate(${secondDegrees}deg)`;
    document.getElementById('minute-hand-group').style.transform = `rotate(${minuteDegrees}deg)`;
    document.getElementById('hour-hand-group').style.transform = `rotate(${hourDegrees}deg)`;

    const hoursString = String(hours).padStart(2, '0');
    const minutesString = String(minutes).padStart(2, '0');
    const secondsString = String(Math.floor(secondsPlusMilliseconds)).padStart(2, '0');
    document.getElementById('digital-clock').textContent = `${hoursString}:${minutesString}:${secondsString}`;
    requestAnimationFrame(updateClock);
}

function startDrag(e) {
    isDragging = true;
    //draggedElement = e.target或者它的父亲
    draggedElement = e.target.id.includes('hand-group') ? e.target : e.target.parentElement;
    const rect = draggedElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    console.log(centerX);
    const centerY = rect.top + rect.height / 2;
    console.log(centerY);
    baseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI); // 计算基准角度
    const baseTime = customTime ? new Date(customTime) : new Date();
    draggedElement.setAttribute('data-base-time', baseTime.getTime());
    console.log(draggedElement);
}

function stopDrag() {
    isDragging = false;
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
        const rect = draggedElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        //遇到问题：为什么拖拽分针到第三象限的时候时针会疯狂转动，而且分针会剧烈抖动
        //原因：

        let angle = currentAngle - baseAngle ; // 计算拖拽的角度
        angle = (angle + 360) % 360;
        
        draggedElement.style.transform = `rotate(${angle}deg)`;

        // 根据拖拽的角度计算时间
        let hours, minutes;
        if (draggedElement.id === 'hour-hand-group') {
            hours = ((angle) / 30) % 12;
            customTime = new Date(customTime || new Date()).setHours(hours);
        } else if (draggedElement.id === 'minute-hand-group') {
            minutes = ((angle) / 6) % 60;
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