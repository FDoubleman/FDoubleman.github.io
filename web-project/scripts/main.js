const myImage = document.querySelector("img");
myImage.onclick = () => {
    const mySrc = myImage.getAttribute("src");
    if (mySrc === "images/test_1.png") {
        myImage.setAttribute("src", "images/test_2.png");
    } else {
        myImage.setAttribute("src", "images/test_1.png");
    }
}

let myButton = document.querySelector("button");
let myHeading = document.querySelector("h1");

function setUserName() {
    const myName = prompt("Please enter your name.");
    if (!myName) {
        setUserName();
    } else {
        localStorage.setItem("name", myName);
        myHeading.textContent = `Mozilla is cool, ${myName}`;
    }
}

if (!localStorage.getItem("name")) {
    setUserName();
} else {
    const storedName = localStorage.getItem("name");
    myHeading.textContent = `Mozilla is cool, ${storedName}`;
}

myButton.onclick = () => {
    setUserName();
};

// ===== 日历生成核心代码 =====
// 功能：月份导航、选择日期、右侧详情面板显示（公历/星期/简单农历/节日示例）
const weekStr = ['一','二','三','四','五','六','日'];
const lunarDays = [
  '初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'
];
// 节假日示例（可按需扩展或替换为后端数据）
const holidays = {
  '2025-11-01': {name: '示例节日', type: 'holiday'},
  '2025-11-11': {name: '光棍节', type: 'festival'},
  '2025-11-22': {name: '示例休息', type: 'rest'}
};

let selectedDate = null; // 保存已选日期字符串

function pad(n) {return n<10?'0'+n:n;}

function getLunar(date) {
  // 简单示例：仅根据公历日序映射到农历日名，真实农历需要更复杂算法或第三方库
  const d = date.getDate();
  return lunarDays[(d-1) % lunarDays.length];
}

function weekdayText(date) {
  return '星期' + weekStr[(date.getDay()+6)%7]; // 使周一为一
}

function showDateInfo(dateStr) {
  const elG = document.getElementById('gDate');
  const elW = document.getElementById('weekday');
  const elL = document.getElementById('lunar');
  const elH = document.getElementById('holiday');
  const infoTitle = document.getElementById('infoTitle');
  const parts = dateStr.split('-').map(s=>+s);
  const date = new Date(parts[0], parts[1]-1, parts[2]);
  infoTitle.textContent = `${parts[0]}年${parts[1]}月${parts[2]}日`;
  elG.textContent = `${parts[0]}-${pad(parts[1])}-${pad(parts[2])}`;
  elW.textContent = weekdayText(date);
  elL.textContent = getLunar(date) + '（演示）';
  if (holidays[dateStr]) elH.textContent = holidays[dateStr].name; else elH.textContent = '-';
}

function renderCalendar(year, month) {
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
  const firstDay = new Date(year, month-1, 1);
  const lastDay = new Date(year, month, 0);
  const beginWeek = firstDay.getDay() || 7;

  // header
  let calendarHtml = '<div class="calendar-header">';
  calendarHtml += `<div class="controls">`;
  calendarHtml += `<button id='prevYear' title='上一年'>&lt;&lt;</button>`;
  calendarHtml += `<button id='prevMonth' title='上一月'>&lt;</button>`;
  calendarHtml += `<select id='yearSel'>`;
  for(let y=2020;y<=2030;y++) calendarHtml += `<option value='${y}'${y===year?' selected':''}>${y}年</option>`;
  calendarHtml += '</select>';
  calendarHtml += `<select id='monthSel'>`;
  for(let m=1;m<=12;m++) calendarHtml += `<option value='${m}'${m===month?' selected':''}>${m}月</option>`;
  calendarHtml += '</select>';
  calendarHtml += `<button id='nextMonth' title='下一月'>&gt;</button>`;
  calendarHtml += `<button id='nextYear' title='下一年'>&gt;&gt;</button>`;
  calendarHtml += `</div>`;
  calendarHtml += `<button id='backToday' class='today-btn'>回到今天</button>`;
  calendarHtml += `<div class='calendar-title'><div class='year'>${year}年</div><div class='month'>${month}月</div></div>`;
  calendarHtml += '</div>';

  calendarHtml += '<div class="calendar-week">'+weekStr.map(w=>`<span>${w}</span>`).join('')+'</div>';
  calendarHtml += '<div class="calendar-days">';

  // leading blanks
  for(let i=1;i<beginWeek;i++) calendarHtml += '<div class="calendar-day other-month"></div>';

  for(let d=1;d<=lastDay.getDate();d++) {
    const dateStr = `${year}-${pad(month)}-${pad(d)}`;
    let cls = 'calendar-day';
    if (dateStr === todayStr) cls += ' today';
    if (selectedDate === dateStr) cls += ' selected';
    let holidayTag = '';
    if (holidays[dateStr]) {
      cls += ' has-holiday';
      holidayTag = `<div class='holiday-mark'>${holidays[dateStr].name}</div>`;
    }
    calendarHtml += `<div class='${cls}' data-date='${dateStr}'>${d}${holidayTag}</div>`;
  }

  // fill to 42
  const filled = beginWeek-1+lastDay.getDate();
  for(let i=filled;i<42;i++) calendarHtml += '<div class="calendar-day other-month"></div>';
  calendarHtml += '</div>';
  calendarHtml += `<div class='calendar-footer'>数据仅作演示：节假日/农历为示例，真实项目建议使用可靠数据源。</div>`;

  document.getElementById('calendar').innerHTML = calendarHtml;

  // bind events
  document.getElementById('yearSel').onchange = e=>renderCalendar(+e.target.value, month);
  document.getElementById('monthSel').onchange = e=>renderCalendar(year,+e.target.value);
  document.getElementById('prevMonth').onclick = ()=>{ if(month===1) renderCalendar(year-1,12); else renderCalendar(year,month-1); };
  document.getElementById('nextMonth').onclick = ()=>{ if(month===12) renderCalendar(year+1,1); else renderCalendar(year,month+1); };
  document.getElementById('prevYear').onclick = ()=>renderCalendar(year-1,month);
  document.getElementById('nextYear').onclick = ()=>renderCalendar(year+1,month);
  document.getElementById('backToday').onclick = ()=>{ const now = new Date(); renderCalendar(now.getFullYear(), now.getMonth()+1); };

  // click-to-select and show details
  const calendarEl = document.getElementById('calendar');
  calendarEl.onclick = (e) => {
    const day = e.target.closest('.calendar-day');
    if (!day || day.classList.contains('other-month')) return;
    const dateStr = day.getAttribute('data-date');
    const prev = calendarEl.querySelector('.calendar-day.selected');
    if (prev && prev !== day) prev.classList.remove('selected');
    const isNowSelected = day.classList.toggle('selected');
    selectedDate = isNowSelected ? dateStr : null;
    if (isNowSelected) showDateInfo(dateStr); else {
      // reset info
      document.getElementById('infoTitle').textContent = '请选择日期';
      document.getElementById('gDate').textContent = '-';
      document.getElementById('weekday').textContent = '-';
      document.getElementById('lunar').textContent = '-';
      document.getElementById('holiday').textContent = '-';
    }
  };
}

window.addEventListener('DOMContentLoaded',()=>{
  const now = new Date();
  renderCalendar(now.getFullYear(), now.getMonth()+1);
});
// ===== 日历生成核心代码 END =====