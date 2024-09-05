document.addEventListener('DOMContentLoaded', function() {
    const selectedZoneId = localStorage.getItem('selectedZoneId');
    let savedZone = JSON.parse(localStorage.getItem(selectedZoneId));

    if (!savedZone) {
        savedZone = {
            name: selectedZoneId.split('-')[0],
            floor: selectedZoneId.split('-')[1],
            detail: '',
            nextInformation: '',
            lowerAccessControlStartTime: '00:00',
            lowerAccessControlEndTime: '00:00',
            indoorAccessControlStartTime: '00:00',
            indoorAccessControlEndTime: '00:00',
            towerCrane: ''
        };
        localStorage.setItem(selectedZoneId, JSON.stringify(savedZone));
    }
    
    const informationBox = document.querySelector('.box.information');
    const nextInformationBox = document.querySelector('.box.next-information');
    const lowerAccessControlBox = document.querySelector('.box.Lower-access-control');
    const indoorAccessControlBox = document.querySelector('.box.Indoor-access-control');
    const towerCraneBox = document.querySelector('.box.tower-crane');

    const detailText = savedZone.detail || '무공정';
    informationBox.textContent = `${savedZone.name} / ${savedZone.floor} / ${detailText}`;
    nextInformationBox.textContent = savedZone.nextInformation || '다음 공정 구역 정보 / 공정 정보 / 출입통제시간 정보 /';

    lowerAccessControlBox.querySelector('.time-text').textContent = `${savedZone.lowerAccessControlStartTime || '00:00'} ~ ${savedZone.lowerAccessControlEndTime || '00:00'}`;
    indoorAccessControlBox.querySelector('.time-text').textContent = `${savedZone.indoorAccessControlStartTime || '00:00'} ~ ${savedZone.indoorAccessControlEndTime || '00:00'}`;
    towerCraneBox.textContent = savedZone.towerCrane || '타워크레인 CH 정보';

    function saveZoneData() {
        localStorage.setItem(selectedZoneId, JSON.stringify(savedZone));
        syncWithMainPage();
    }

    function syncWithMainPage() {
        const zones = JSON.parse(localStorage.getItem('zones')) || [];
        const updatedZone = zones.find(zone => `${zone.name}-${zone.floor}` === selectedZoneId);

        if (updatedZone) {
            updatedZone.name = savedZone.name;
            updatedZone.floor = savedZone.floor;
            updatedZone.detail = savedZone.detail;
            localStorage.setItem('zones', JSON.stringify(zones));
        }
    }

    informationBox.addEventListener('click', function() {
        const newInfo = prompt('구역 정보 / 공정 정보 수정:', `${savedZone.name} / ${savedZone.floor} / ${detailText}`);
        if (newInfo !== null) {
            const [newName, newFloor, newDetail] = newInfo.split('/').map(item => item.trim());
            savedZone.name = newName || savedZone.name;
            savedZone.floor = newFloor.replace('F', '').trim() || savedZone.floor;
            savedZone.detail = newDetail || savedZone.detail || '무공정';
            informationBox.textContent = `${savedZone.name} / ${savedZone.floor}F / ${savedZone.detail}`;
            saveZoneData();
        }
    });

    nextInformationBox.addEventListener('click', function() {
        const newInfo = prompt('다음 공정 정보 수정:', nextInformationBox.textContent);
        if (newInfo !== null) {
            savedZone.nextInformation = newInfo;
            nextInformationBox.textContent = newInfo;
            saveZoneData();
        }
    });

    // 모달 창 제어
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const saveButton = document.getElementById('saveButton');
    const towerCraneText = document.getElementById('towerCraneText');

    towerCraneBox.addEventListener('click', function() {
        modal.style.display = 'flex';
        towerCraneText.value = savedZone.towerCrane || '';
    });

    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    saveButton.addEventListener('click', function() {
        savedZone.towerCrane = towerCraneText.value;
        towerCraneBox.textContent = savedZone.towerCrane || '타워크레인 CH 정보';
        saveZoneData();
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    function enableTimeEdit(box, type) {
        const timeText = box.querySelector('.time-text');
        const timeInput = box.querySelector('.time-input');
        const confirmButton = box.querySelector('.confirm-button');

        timeText.addEventListener('click', function() {
            timeInput.value = timeText.textContent;
            timeText.style.display = 'none';
            timeInput.style.display = 'inline-block';
            confirmButton.style.display = 'inline-block';
            timeInput.focus();
        });

        confirmButton.addEventListener('click', function() {
            const newTime = timeInput.value;
            timeText.textContent = newTime;
            timeText.style.display = 'inline-block';
            timeInput.style.display = 'none';
            confirmButton.style.display = 'none';

            if (type === 'lower') {
                [savedZone.lowerAccessControlStartTime, savedZone.lowerAccessControlEndTime] = newTime.split('~').map(t => t.trim());
            } else if (type === 'indoor') {
                [savedZone.indoorAccessControlStartTime, savedZone.indoorAccessControlEndTime] = newTime.split('~').map(t => t.trim());
            }

            saveZoneData();
        });

        timeInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                confirmButton.click();
            }
        });
    }

    enableTimeEdit(lowerAccessControlBox, 'lower');
    enableTimeEdit(indoorAccessControlBox, 'indoor');
});
