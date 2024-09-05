document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const date = urlParams.get('date');
    const time = urlParams.get('time');
    const zone = urlParams.get('zone');
    const reason = urlParams.get('reason');
    let status = urlParams.get('status');

    const zoneInformationBox = document.querySelector('.Zone-Information');
    const completedButton = document.querySelector('.Inspection-completed');
    const notCompletedButton = document.querySelector('.Inspection-not-completed');

    // 구역 정보 박스에 데이터 표시
    zoneInformationBox.innerHTML = `
        <span>${date}</span>
        <span>${time}</span>
        <span>${zone}</span>
        <span class="clickable-warning" tabindex="0">${reason}</span>
        <span>${status}</span>
    `;

    const warningText = zoneInformationBox.querySelector('.clickable-warning');

    // Ctrl 키를 누르고 경고 텍스트를 클릭했을 때 수정 창 표시
    warningText.addEventListener('click', function(event) {
        if (event.ctrlKey) {
            const newReason = prompt("수정할 내용을 입력하세요:", reason);
            if (newReason !== null) {
                reason = newReason;
                warningText.textContent = newReason;
                updateStatusInStorage(date, time, zone, newReason, status);
            }
        }
    });

    // 포커스가 맞춰질 때 배경 색상 변경
    warningText.addEventListener('focus', function(event) {
        if (event.ctrlKey) {
            event.target.style.backgroundColor = "white"; // 입력 칸을 흰색으로 변경
        }
    });

    // 포커스가 사라지면 배경 색상 원래대로 복구
    warningText.addEventListener('blur', function(event) {
        event.target.style.backgroundColor = ""; // 원래 배경으로 복구
    });

    // 점검 완료 버튼 클릭 시 상태 변경
    completedButton.addEventListener('click', function() {
        if (status === '즉시 점검 필요') {
            status = '점검 완료';
            updateStatusInStorage(date, time, zone, reason, status);
        }
        window.close(); // 창 닫기
    });

    // 점검 미완료 버튼 클릭 시 상태 변경
    notCompletedButton.addEventListener('click', function() {
        if (status !== '즉시 점검 필요') {
            status = '즉시 점검 필요';
            updateStatusInStorage(date, time, zone, reason, status);
        }
        window.close(); // 창 닫기
    });

    // 상태를 로컬 스토리지에 업데이트
    function updateStatusInStorage(date, time, zone, reason, newStatus) {
        const sensorDataList = JSON.parse(localStorage.getItem('sensorDataList')) || [];
        const updatedDataList = sensorDataList.map(data => {
            if (data.date === date && data.time === time && data.zone === zone && data.reason === reason) {
                data.status = newStatus;
            }
            return data;
        });
        localStorage.setItem('sensorDataList', JSON.stringify(updatedDataList));

        // 로컬 스토리지를 강제로 갱신하여 다른 탭에 변경사항을 알림
        localStorage.setItem('forceUpdate', Date.now());
    }
});
