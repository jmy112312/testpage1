document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    alert("로그인이 필요합니다.");
    window.location.href = "login.html";
    return;
  }

  const companyName = localStorage.getItem("companyName");
  const loginRole = localStorage.getItem("loginRole");
  const loginName = localStorage.getItem("loginName");

  const userSpecificDataKey = `report_${companyName}_${loginName}`;
  const userSpecificTimestampKey = `timestamp_${companyName}_${loginName}`;

  if (companyName) {
    document.getElementById("companyName").value = companyName;
  }

  if (loginName) {
    const creatorCell = document.querySelector(
      ".approval-table tbody tr td:first-child"
    );
    const managerCell = document.querySelector(
      ".approval-table tbody tr td:nth-child(2)"
    );

    if (loginRole === "creator" && creatorCell) {
      creatorCell.textContent = loginName;
    } else if (loginRole === "manager" && managerCell) {
      managerCell.textContent = loginName;
    }
  }

  const saveBtn = document.getElementById("saveBtn");
  const clearBtn = document.getElementById("clearBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const personnelTableBody = document.querySelector(".personnel-table__body");
  const equipmentTableBody = document.querySelector(".equipment-table__body");
  const timestampContainer = document.getElementById("save-timestamp");

  /**
   * 폼 전체 데이터를 객체 형태로 수집합니다.
   * @returns {object} 수집된 공사일보 데이터
   */
  function collectReportData() {
    const reportData = {
      overview: {
        reportDate: document.getElementById("reportDate").value,
        location: document.getElementById("location").value,
        weather: document.getElementById("weather").value,
        companyName: document.getElementById("companyName").value,
        workType: document.getElementById("workType").value,
        projectName: document.getElementById("projectName").value,
      },
      personnel: [],
      equipment: [],
      workDetails: document.getElementById("workDetails").value,
      tomorrowPlan: document.getElementById("tomorrowPlan").value,
      specialNotes: document.getElementById("specialNotes").value,
    };
    personnelTableBody
      .querySelectorAll(".personnel-table__row")
      .forEach((row) => {
        const inputs = row.querySelectorAll(".personnel-table__input");
        reportData.personnel.push({
          type: inputs[0]?.value,
          name: inputs[1]?.value,
          work: inputs[2]?.value,
        });
      });
    equipmentTableBody
      .querySelectorAll(".equipment-table__row")
      .forEach((row) => {
        const inputs = row.querySelectorAll(".equipment-table__input");
        reportData.equipment.push({
          name: inputs[0]?.value,
          spec: inputs[1]?.value,
          work: inputs[2]?.value,
        });
      });
    return reportData;
  }

  /**
   * 데이터를 로컬 스토리지에 저장합니다.
   */
  function saveReport() {
    const reportData = collectReportData();
    try {
      localStorage.setItem(userSpecificDataKey, JSON.stringify(reportData));
      const now = new Date();
      const saveTime = now.toLocaleString("ko-KR");
      timestampContainer.textContent = `마지막 저장: ${saveTime}`;
      localStorage.setItem(userSpecificTimestampKey, saveTime);
      alert("작성하신 내용이 브라우저에 임시 저장되었습니다.");
    } catch (e) {
      console.error("데이터 저장 중 오류 발생:", e);
      alert(
        "데이터 저장에 실패했습니다. 브라우저의 저장 공간이 부족할 수 있습니다."
      );
    }
  }

  /**
   * 로컬 스토리지에서 데이터를 불러와 폼을 채웁니다.
   */
  function loadReport() {
    const savedDataJSON = localStorage.getItem(userSpecificDataKey);
    const savedTimestamp = localStorage.getItem(userSpecificTimestampKey);
    if (savedDataJSON) {
      if (
        confirm("이전에 이 이름으로 저장된 내용이 있습니다. 불러오시겠습니까?")
      ) {
        const savedData = JSON.parse(savedDataJSON);
        const overview = savedData.overview;
        document.getElementById("reportDate").value = overview.reportDate || "";
        document.getElementById("location").value = overview.location || "";
        document.getElementById("weather").value = overview.weather || "";
        document.getElementById("companyName").value =
          overview.companyName || companyName;
        document.getElementById("workType").value = overview.workType || "";
        document.getElementById("projectName").value =
          overview.projectName || "";
        personnelTableBody.innerHTML = "";
        savedData.personnel.forEach((p) => addPersonnelRow(p));
        equipmentTableBody.innerHTML = "";
        savedData.equipment.forEach((e) => addEquipmentRow(e));
        document.getElementById("workDetails").value =
          savedData.workDetails || "";
        document.getElementById("tomorrowPlan").value =
          savedData.tomorrowPlan || "";
        document.getElementById("specialNotes").value =
          savedData.specialNotes || "";
        if (savedTimestamp) {
          timestampContainer.textContent = `마지막 저장: ${savedTimestamp}`;
        }
        alert("저장된 내용을 성공적으로 불러왔습니다.");
      }
    }
  }

  /**
   * 저장된 데이터를 삭제하고 폼을 초기화합니다.
   */
  function clearReport() {
    if (
      confirm(
        "현재 사용자로 저장된 모든 내용을 삭제하고 양식을 초기화하시겠습니까?"
      )
    ) {
      localStorage.removeItem(userSpecificDataKey);
      localStorage.removeItem(userSpecificTimestampKey);
      location.reload();
    }
  }

  /**
   * 인원 현황 테이블에 행을 추가합니다.
   * @param {object} [data={}] - 행에 채울 데이터
   */
  function addPersonnelRow(data = {}) {
    const newRow = document.createElement("tr");
    newRow.classList.add("personnel-table__row");
    newRow.innerHTML = `
      <td class="personnel-table__cell"><input type="text" class="personnel-table__input" placeholder="예: 보통인부" value="${
        data.type || ""
      }"></td>
      <td class="personnel-table__cell"><input type="text" class="personnel-table__input" placeholder="예: 홍길동" value="${
        data.name || ""
      }"></td>
      <td class="personnel-table__cell"><input type="text" class="personnel-table__input" placeholder="예: 1층 벽체 거푸집 설치" value="${
        data.work || ""
      }"></td>
      <td class="personnel-table__cell"><button type="button" class="btn delete-btn personnel-table__delete-btn">삭제</button></td>
    `;
    personnelTableBody.appendChild(newRow);
  }

  /**
   * 사용장비 현황 테이블에 행을 추가합니다.
   * @param {object} [data={}] - 행에 채울 데이터
   */
  function addEquipmentRow(data = {}) {
    const newRow = document.createElement("tr");
    newRow.classList.add("equipment-table__row");
    newRow.innerHTML = `
      <td class="equipment-table__cell"><input type="text" class="equipment-table__input" placeholder="예: 굴삭기" value="${
        data.name || ""
      }"></td>
      <td class="equipment-table__cell"><input type="text" class="equipment-table__input" placeholder="예: 06W" value="${
        data.spec || ""
      }"></td>
      <td class="equipment-table__cell"><input type="text" class="equipment-table__input" placeholder="예: 터파기 및 상차" value="${
        data.work || ""
      }"></td>
      <td class="equipment-table__cell"><button type="button" class="btn delete-btn equipment-table__delete-btn">삭제</button></td>
    `;
    equipmentTableBody.appendChild(newRow);
  }

  /**
   * 로그아웃을 처리합니다.
   */
  function logout() {
    if (confirm("로그아웃하시겠습니까?")) {
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("companyName");
      localStorage.removeItem("loginRole");
      localStorage.removeItem("loginName");
      window.location.href = "login.html";
    }
  }

  saveBtn.addEventListener("click", saveReport);
  clearBtn.addEventListener("click", clearReport);
  logoutBtn.addEventListener("click", logout);
  document
    .getElementById("addPersonnelBtn")
    .addEventListener("click", () => addPersonnelRow());
  document
    .getElementById("addEquipmentBtn")
    .addEventListener("click", () => addEquipmentRow());

  function handleTableClick(event) {
    if (event.target.classList.contains("delete-btn")) {
      event.target.closest("tr").remove();
    }
  }
  personnelTableBody.addEventListener("click", handleTableClick);
  equipmentTableBody.addEventListener("click", handleTableClick);

  function getWeatherAndLocation() {
    const API_KEY = "5ab40ddf4e05b0a1a2547b94d3aa95a7";
    const locationInput = document.getElementById("location");
    const weatherInput = document.getElementById("weather");
    if (locationInput.value && weatherInput.value) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=kr`;
        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            if (data.name) locationInput.value = data.name;
            if (data.weather)
              weatherInput.value = `${data.weather[0].description} (${data.main.temp}°C)`;
          })
          .catch((err) => console.error("날씨 정보 로딩 실패:", err));
      },
      (err) => {
        console.error("위치 정보를 찾을 수 없습니다.", err);
        locationInput.placeholder = "위치를 찾을 수 없습니다.";
        weatherInput.placeholder = "직접 입력해주세요.";
        locationInput.readOnly = false;
        weatherInput.readOnly = false;
      }
    );
  }

  function updateClock() {
    const dateElement = document.getElementById("real-time-date");
    const timeElement = document.getElementById("real-time-time");
    const now = new Date();
    dateElement.textContent = now.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    timeElement.textContent = now.toLocaleTimeString("ko-KR", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
  }
  setInterval(updateClock, 1000);
  updateClock();

  if (!document.getElementById("reportDate").value) {
    document.getElementById("reportDate").valueAsDate = new Date();
  }

  loadReport();
  getWeatherAndLocation();
});
