let DATA = null;

async function loadData(){
    if(DATA) return DATA;
    try{
        const resp = await fetch("data.json");
        DATA = await resp.json();
        return DATA;
    }catch(e){
        alert("Файл data.json не найден. Поместите его в эту папку.");
        return {rooms:[]};
    }
}

async function renderIndex(){
    await loadData();
    const rooms = DATA.rooms;
    const un=document.getElementById("rooms-unpassed");
    const pa=document.getElementById("rooms-passed");
    if(!un) return;

    un.innerHTML=""; pa.innerHTML="";
    rooms.forEach(r=>{
        const div=document.createElement("div");
        div.className="room-card";
        div.innerHTML =
        `<button class='btn' style='position:absolute;right:10px;top:10px'
             onclick="location.href='study.html?room=${r.id}'">Учиться</button>
         <strong>${r.title}</strong>
         ${r.introImage ? `<br><img src='${r.introImage}' class='room-img'>` : ""}`;
        (r.examPassed ? pa : un).appendChild(div);
    });
}

let studyRoom=null;
let examData=null;

async function loadStudy(){
    await loadData();
    const box=document.getElementById("study-container");
    if(!box) return;

    const id=new URL(location.href).searchParams.get("room");
    const r=DATA.rooms.find(x=>x.id===id);
    if(!r){ box.innerHTML="Комната не найдена"; return; }
    studyRoom=r;

    box.innerHTML = `
    <h2>${r.title}</h2>
    ${r.introImage?`<img src='${r.introImage}' class='room-img'>`:""}
    <div id='stage_intro'></div>
    <div id='stage_demo' class='hidden'></div>
    <div id='stage_exam' class='hidden'></div>`;
    loadIntroStage();
}

function loadIntroStage(){
    const st=document.getElementById("stage_intro");
    st.innerHTML=
    `<h3>Вводная</h3>
     <p>${studyRoom.introText}</p>
     <button class='btn' onclick='startDemo()'>Перейти к демонстрации</button>`;
    st.classList.remove("hidden");
}

function startDemo(){
    document.getElementById("stage_intro").classList.add("hidden");
    buildDemo();
    document.getElementById("stage_demo").classList.remove("hidden");
}

function buildDemo(){
    let html="<h3>Демонстрация</h3>";
    (studyRoom.types||[]).forEach(tp=>{
        html+=`<div class='room-card'><strong>${tp.title}</strong><br>`;
        (tp.situations||[]).forEach(s=>{
            html+=`<div><em>${s}</em><br>`;
            (tp.features||[]).forEach(f=>{
                html+=`<label><input type='checkbox'> ${f}</label><br>`;
            });
            html+="</div><hr>";
        });
        html+="</div>";
    });
    html+=`<button class='btn' onclick='startExam()'>Перейти к экзамену</button>`;
    document.getElementById("stage_demo").innerHTML=html;
}

function startExam(){
    document.getElementById("stage_demo").classList.add("hidden");
    buildExam();
    document.getElementById("stage_exam").classList.remove("hidden");
}

function buildExam(){
    let all=[];
    (studyRoom.types||[]).forEach(tp=>{
        (tp.situations||[]).forEach(s=>all.push({text:s,type:tp.title}));
    });

    all=all.sort(()=>Math.random()-0.5);
    examData=all;

    let html="<h3>Экзамен</h3>";
    all.forEach((q,i)=>{
        html+=
        `<div class='room-card'>
            <strong>${q.text}</strong><br>
            <select id='exam_${i}'>
                <option value=''>Выбрать тип</option>
                ${(studyRoom.types||[]).map(tp=>`<option value='${tp.title}'>${tp.title}</option>`).join("")}
            </select>
         </div>`;
    });
    html+=`<button class='btn' onclick='finishExam()'>Завершить</button>`;
    document.getElementById("stage_exam").innerHTML=html;
}

function finishExam(){
    let correct=0;
    examData.forEach((q,i)=>{
        const sel=document.getElementById("exam_"+i);
        const parent=sel.closest(".room-card");
        if(sel.value===q.type){correct++;parent.style.background="#d8ffd8";}
        else parent.style.background="#ffd8d8";
        sel.disabled=true;
    });

    const percent=Math.round(correct/examData.length*100);
    alert("Ваш результат: "+percent+"%");
    setTimeout(()=>location.href='index.html',300);
}

window.onload=()=>{
    renderIndex();
    loadStudy();
};
