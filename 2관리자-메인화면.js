document.addEventListener('DOMContentLoaded', function() {
    const siteInformationBox = document.querySelector('.site-information');
    const selectedUniversity = localStorage.getItem('selectedUniversity');

    const warningBox = document.querySelector('.warning');
    warningBox.addEventListener('click', function() {
        window.open('3경고창.html', '_blank', 'width=800,height=600');
    });

    let sensorDataList = JSON.parse(localStorage.getItem('sensorDataList')) || [];
    const urgentCount = sensorDataList.filter(data => data.status === '즉시 점검 필요').length;

    warningBox.innerHTML = `갱폼안전인양시스템 경고창 [${urgentCount}]`;
    if (urgentCount > 0) {
        warningBox.style.color = '#b30000';
    } else {
        warningBox.style.color = 'black';
    }

    if (selectedUniversity) {
        siteInformationBox.textContent = selectedUniversity;
    }

    const addZoneButton = document.querySelector('.Add-zone');
    const deleteZoneButton = document.querySelector('.Deleted-zone');
    const settingZoneButton = document.querySelector('.Setting-zone');
    const displayPreviewButton = document.querySelector('.Display-preview');

    let zones = JSON.parse(localStorage.getItem('zones')) || [];

    let isEditing = false;
    let isDeleting = false;
    let isAdding = false;
    let currentZoneIndex = null;

    const zoneWidth = 215;
    const zoneHeight = 60;
    const margin = 10;
    const maxZonesPerRow = 6;

    function loadZones() {
        document.querySelectorAll('.zone-box').forEach(box => box.remove());

        zones.sort((a, b) => a.name.localeCompare(b.name));

        zones.forEach((zone, index) => {
            createZoneBox(zone, index);
        });

        if (isEditing) {
            applyBlinkingEffect();
        }
    }

    function saveZones() {
        localStorage.setItem('zones', JSON.stringify(zones));
    }

    function createZoneBox(zone, index) {
        const zoneBox = document.createElement('div');
        zoneBox.classList.add('box', 'zone-box');
        zoneBox.innerHTML = `<span>${zone.name} ${zone.floor}<br>(${zone.detail || '무공정'})</span>`;

        const row = Math.floor(index / maxZonesPerRow);
        const col = index % maxZonesPerRow;
        const top = 140 + row * (zoneHeight + margin);
        const left = 50 + col * (zoneWidth + margin);

        zoneBox.style.top = `${top}px`;
        zoneBox.style.left = `${left}px`;

        document.querySelector('.container').appendChild(zoneBox);

        zoneBox.addEventListener('click', function() {
            if (isEditing) {
                openEditZonePrompt(zone, index);
            } else if (isDeleting) {
                const confirmation = confirm(`구역 이름: ${zone.name}\n층수: ${zone.floor}\n공정 현황: ${zone.detail}\n\n이 구역을 삭제하시겠습니까?`);
                if (confirmation) {
                    zones.splice(index, 1);
                    saveZones();
                    syncWithDisplay(zone);
                    loadZones();
                    if (isDeleting) {
                        applyRedBlinkingEffect();
                    }
                }
            } else if (!isAdding) {
                redirectToPanel(zone);
            }
        });
    }

    function openEditZonePrompt(zone, index) {
        currentZoneIndex = index;

        const input = prompt(
            `구역 정보를 수정하세요 (구역 이름, 층수, 공정 현황)`,
            `${zone.name}, ${zone.floor}, ${zone.detail || '무공정'}`
        );

        if (input === null) return;

        const [zoneName, zoneFloor, zoneDetail] = input.split(',').map(item => item.trim());

        if (zoneName && zoneFloor && zoneDetail) {
            zones[currentZoneIndex] = {
                name: zoneName,
                floor: zoneFloor,
                detail: zoneDetail
            };
            saveZones();
            syncWithDisplay(zones[currentZoneIndex]);
            localStorage.setItem(`${zoneName}-${zoneFloor}`, JSON.stringify(zones[currentZoneIndex]));
            loadZones();
        }
    }

    function syncWithDisplay(zone) {
        const selectedZoneId = `${zone.name}-${zone.floor}`;
        let savedZone = JSON.parse(localStorage.getItem(selectedZoneId)) || {};

        savedZone.name = zone.name;
        savedZone.floor = zone.floor;
        savedZone.detail = zone.detail;

        localStorage.setItem(selectedZoneId, JSON.stringify(savedZone));
    }

    function disableAllFunctions() {
        document.querySelectorAll('.zone-box span').forEach(span => {
            span.classList.remove('red-blinking-text', 'dark-blue-blinking-text');
        });
        isEditing = false;
        isDeleting = false;
        isAdding = false;
        currentZoneIndex = null;
        addZoneButton.classList.remove('active');
        deleteZoneButton.classList.remove('active');
        settingZoneButton.classList.remove('active');
    }

    function toggleFunction(button, activateFunction) {
        if (button.classList.contains('active')) {
            disableAllFunctions();
        } else {
            disableAllFunctions();
            button.classList.add('active');
            if (activateFunction) activateFunction();
        }
    }

    settingZoneButton.addEventListener('click', function() {
        toggleFunction(settingZoneButton, function() {
            isEditing = true;
            applyBlinkingEffect();
        });
    });

    addZoneButton.addEventListener('click', function() {
        toggleFunction(addZoneButton, function() {
            isAdding = true;
            openAddZonePrompt();
        });
    });

    deleteZoneButton.addEventListener('click', function() {
        toggleFunction(deleteZoneButton, function() {
            isDeleting = true;
            applyRedBlinkingEffect();
        });
    });

    displayPreviewButton.addEventListener('click', function() {
        window.location.href = '7전광판설정.html';
    });

    function applyBlinkingEffect() {
        if (isEditing) {
            document.querySelectorAll('.zone-box span').forEach(span => {
                span.classList.add('dark-blue-blinking-text');
            });
        }
    }

    function applyRedBlinkingEffect() {
        if (isDeleting) {
            document.querySelectorAll('.zone-box span').forEach(span => {
                span.classList.remove('dark-blue-blinking-text');
                span.classList.add('red-blinking-text');
            });
        }
    }

    function openAddZonePrompt() {
        const input = prompt('새 구역 정보를 입력하세요 (구역 이름, 층수, 공정 현황)');
        if (input === null) return;

        const [zoneName, zoneFloor, zoneDetail] = input.split(',').map(item => item.trim());

        if (zoneName && zoneFloor && zoneDetail) {
            const newZone = {
                name: zoneName,
                floor: zoneFloor,
                detail: zoneDetail,
            };
            zones.push(newZone);
            saveZones();
            syncWithDisplay(newZone);
            loadZones();
        }
    }

    function redirectToPanel(zone) {
        const zoneId = `${zone.name}-${zone.floor}`;
        localStorage.setItem('selectedZoneId', zoneId);

        const existingZoneData = localStorage.getItem(zoneId);
        if (!existingZoneData) {
            localStorage.setItem(zoneId, JSON.stringify(zone));
        }

        const width = 1100;
        const height = Math.floor((width / 16) * 9);

        window.open('101관리자-전광판.html', '_blank', `width=${width},height=${height}`);
    }

    loadZones();
});
document.addEventListener('DOMContentLoaded', function() {
    const warningBox = document.querySelector('.warning');

    // 경고창 숫자 업데이트 함수
    function updateWarningBox() {
        const warningMessage = localStorage.getItem('warningMessage') || '갱폼안전인양시스템 경고창 [0]';
        warningBox.innerHTML = warningMessage;

        const count = parseInt(warningMessage.match(/\[(\d+)\]/)[1], 10);
        if (count > 0) {
            warningBox.classList.add('red-blinking-text');
        } else {
            warningBox.classList.remove('red-blinking-text');
            warningBox.style.color = 'black';  // 숫자가 0일 때 글씨 색상을 검정색으로 유지
        }
    }

    // 초기 경고창 숫자 설정
    updateWarningBox();

    // WebSocket 설정 및 연결 상태 모니터링
    function connectWebSocket() {
        const ws = new WebSocket('ws://192.168.1.7:81');  // ESP8266의 실제 IP 주소로 수정

        ws.onopen = function() {
            console.log('WebSocket connection opened');
        };

        ws.onmessage = function(event) {
            const sensorStatus = event.data;

            if (sensorStatus === 'Open') {
                let count = 1; // 경고창 숫자를 1로 고정
                const newMessage = `갱폼안전인양시스템 경고창 [${count}]`;
                localStorage.setItem('warningMessage', newMessage);

                // 경고창 숫자 업데이트
                updateWarningBox();
            }
        };

        ws.onclose = function() {
            console.log('WebSocket connection closed, reconnecting...');
            setTimeout(connectWebSocket, 1000); // 1초 후 재연결 시도
        };

        ws.onerror = function(error) {
            console.error('WebSocket error:', error);
            ws.close(); // 연결을 닫고 재연결 시도
        };
    }

    connectWebSocket();  // WebSocket 연결 시도

    // 경고창 클릭 시 새로운 창 열기 (경고창 숫자를 초기화하지 않음)
    warningBox.addEventListener('click', function() {
        const newWindow = window.open('3경고창.html', '_blank', 'width=800,height=600');
        if (newWindow) {
            newWindow.onload = function() {
                newWindow.updateWarningBox();  // 새 창의 경고창 숫자를 업데이트
            };
        }
    });

    // 로컬 스토리지 값이 변경될 때마다 경고창 숫자 업데이트
    window.addEventListener('storage', updateWarningBox);
});
