document.addEventListener('DOMContentLoaded', function() {
    const dataListTable = document.getElementById('data-list').getElementsByTagName('tbody')[0];
    const dateHeader = document.getElementById('date-header');
    const zoneHeader = document.getElementById('zone-header');
    const warningBox = document.querySelector('.warning');
    const editModal = document.getElementById('edit-modal');
    const addModal = document.getElementById('add-modal');
    const closeButtons = document.querySelectorAll('.close-button');
    const editForm = document.getElementById('edit-form');
    const addForm = document.getElementById('add-form');

    // localStorage에서 데이터 가져오기
    let sensorDataList = JSON.parse(localStorage.getItem('sensorDataList')) || [];
    let isAscending = true;
    let currentRowData = null;

    // 경고창 숫자 업데이트 함수
    function updateWarningBox() {
        const urgentCount = sensorDataList.filter(data => data.status === '즉시 점검 필요').length;
        const newMessage = `갱폼안전인양시스템 경고창 [${urgentCount}]`;

        // 경고창에 표시
        warningBox.innerHTML = newMessage;

        // 경고창 숫자가 0이 아닐 때 텍스트 색상 변경
        if (urgentCount > 0) {
            warningBox.classList.add('red-blinking-text');
        } else {
            warningBox.classList.remove('red-blinking-text');
            warningBox.style.color = 'black';
        }

        // 경고창 상태를 로컬 스토리지에 저장
        localStorage.setItem('warningMessage', newMessage);
    }

    // 초기 경고창 숫자 설정
    updateWarningBox();

    // 센서 상태 처리
    const ws = new WebSocket('ws://192.168.1.7:81');  // ESP8266의 실제 IP 주소로 수정

    ws.onmessage = function(event) {
        const sensorStatus = event.data;

        if (sensorStatus === 'Open') {
            // 첫 번째 항목의 진행 상태를 '즉시 점검 필요'로 변경
            if (sensorDataList.length > 0) {
                sensorDataList[0].status = '즉시 점검 필요';
            }

            // localStorage에 업데이트된 데이터를 저장
            localStorage.setItem('sensorDataList', JSON.stringify(sensorDataList));

            // 경고창 숫자 업데이트
            updateWarningBox();

            // 테이블 업데이트
            populateTable(sensorDataList, isAscending);
        }
    };

    // 경고창 클릭 시 새 창 열기 및 경고창 초기화 방지
    warningBox.addEventListener('click', function() {
        // 기존 경고창 상태를 로컬 스토리지에서 유지
        const previousMessage = localStorage.getItem('warningMessage');

        // 새로운 창을 열 때 로컬 스토리지 상태를 유지합니다.
        const newWindow = window.open('3경고창.html', '_blank', 'width=800,height=600');
        if (newWindow) {
            newWindow.onload = function() {
                newWindow.localStorage.setItem('warningMessage', previousMessage); // 상태 유지
                newWindow.updateWarningBox();  // 새 창의 경고창 숫자를 업데이트
            };
        }
    });

    // 로컬 스토리지 값이 변경될 때 경고창 숫자 업데이트
    window.addEventListener('storage', function() {
        updateWarningBox();
        populateTable(sensorDataList, isAscending); // 테이블도 동기화
    });

    // 데이터 목록 행 추가 함수
    const createDataRow = (data) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${data.date}</td>
            <td>${data.time}</td>
            <td>${data.zone}</td>
            <td>${data.reason}</td>
            <td>${data.status}</td>
        `;

        row.addEventListener('click', (event) => {
            if (event.ctrlKey) {
                // Ctrl 키가 눌린 상태에서 클릭하면 수정 모달 열기
                currentRowData = data;
                openEditModal(data);
            } else if (event.altKey) {
                // Alt 키가 눌린 상태에서 클릭하면 삭제 확인
                if (confirm('삭제하겠습니까?')) {
                    deleteDataRow(data);
                }
            } else {
                // 일반 클릭 시 상세 페이지 열기
                const queryString = `?date=${data.date}&time=${data.time}&zone=${data.zone}&reason=${data.reason}&status=${data.status}`;
                const newWindow = window.open(`4점검내역 상세.html${queryString}`, '_blank', 'width=800,height=600');
                if (newWindow) {
                    newWindow.focus();
                }
            }
        });

        dataListTable.appendChild(row);
    };

    // 데이터를 정렬하여 데이터 목록 생성
    const populateTable = (dataList, ascending = true, filterText = '') => {
        dataListTable.innerHTML = ''; // 테이블 내용 초기화

        const filteredDataList = dataList.filter(item => item.zone.includes(filterText));

        const sortedDataList = filteredDataList.sort((a, b) => {
            if (a.date === b.date) {
                return ascending ? a.time.localeCompare(b.time) : b.time.localeCompare(a.time);
            }
            return ascending ? new Date(b.date) - new Date(a.date) : new Date(a.date) - new Date(b.date);
        });

        sortedDataList.forEach(data => createDataRow(data));
    };

    // 초기 데이터 로드
    populateTable(sensorDataList, isAscending);

    // 날짜 정렬 버튼 클릭 이벤트
    dateHeader.addEventListener('click', () => {
        isAscending = !isAscending;
        dateHeader.textContent = isAscending ? '날짜▽' : '날짜△';
        populateTable(sensorDataList, isAscending);
    });

    // 구역 검색 버튼 클릭 이벤트
    zoneHeader.addEventListener('click', () => {
        const searchText = prompt("검색할 구역을 입력하세요:");
        if (searchText !== null) {
            populateTable(sensorDataList, isAscending, searchText.trim());
        }
    });

    // 모달 열기 함수
    const openEditModal = (data) => {
        document.getElementById('edit-date').value = data.date;
        document.getElementById('edit-time').value = data.time;
        document.getElementById('edit-zone').value = data.zone;
        document.getElementById('edit-reason').value = data.reason;
        document.getElementById('edit-status').value = data.status;
        editModal.style.display = 'block';
    };

    // 데이터 추가 모달 열기 함수
    const openAddModal = () => {
        // 입력 칸을 초기화
        document.getElementById('add-date').value = '';
        document.getElementById('add-time').value = '';
        document.getElementById('add-zone').value = '';
        document.getElementById('add-reason').value = '';
        document.getElementById('add-status').value = '';
        addModal.style.display = 'block';
    };

    // 모달 닫기
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            editModal.style.display = 'none';
            addModal.style.display = 'none';
        });
    });

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        } else if (event.target === addModal) {
            addModal.style.display = 'none';
        }
    });

    // 수정 폼 제출 시 처리
    editForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        // 수정된 데이터 추출
        const updatedData = {
            date: document.getElementById('edit-date').value,
            time: document.getElementById('edit-time').value,
            zone: document.getElementById('edit-zone').value,
            reason: document.getElementById('edit-reason').value,
            status: document.getElementById('edit-status').value
        };

        // 기존 데이터 목록에서 수정된 데이터 찾기
        sensorDataList = sensorDataList.map(data => {
            if (data.date === currentRowData.date && data.time === currentRowData.time && data.zone === currentRowData.zone) {
                return updatedData;
            }
            return data;
        });

        // localStorage에 저장
        localStorage.setItem('sensorDataList', JSON.stringify(sensorDataList));
        
        // 테이블 갱신
        populateTable(sensorDataList, isAscending);

        // 모달 닫기
        editModal.style.display = 'none';
    });

    // 데이터 추가 폼 제출 시 처리
    addForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        // 새 데이터 추출
        const newData = {
            date: document.getElementById('add-date').value,
            time: document.getElementById('add-time').value,
            zone: document.getElementById('add-zone').value,
            reason: document.getElementById('add-reason').value,
            status: document.getElementById('add-status').value
        };

        // 새 데이터 목록에 추가
        sensorDataList.push(newData);

        // localStorage에 저장
        localStorage.setItem('sensorDataList', JSON.stringify(sensorDataList));
        
        // 테이블 갱신
        populateTable(sensorDataList, isAscending);

        // 모달 닫기
        addModal.style.display = 'none';
    });

    // 배경 클릭 시 데이터 추가 모달 열기
    document.addEventListener('click', (event) => {
        if (event.ctrlKey && !event.target.closest('.data-list-container') && !event.target.closest('.modal-content')) {
            openAddModal();
        }
    });

    // 데이터 삭제 함수
    const deleteDataRow = (data) => {
        // 데이터 삭제
        sensorDataList = sensorDataList.filter(item => item !== data);

        // localStorage에 저장
        localStorage.setItem('sensorDataList', JSON.stringify(sensorDataList));

        // 테이블 갱신
        populateTable(sensorDataList, isAscending);
    };
});
