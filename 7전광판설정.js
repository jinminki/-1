document.addEventListener('DOMContentLoaded', function() {
    const displayBox = document.querySelector('.Electronic-display-preview');
    const zoneText = document.createElement('span');
    zoneText.classList.add('zone-text');
    zoneText.textContent = '구역 선택';

    const fullscreenText = document.createElement('span');
    fullscreenText.classList.add('fullscreen-text');
    fullscreenText.textContent = '전체 화면';
    fullscreenText.addEventListener('click', function() {
        toggleFullScreen();
    });

    const zoneSelectionBox = document.createElement('div');
    zoneSelectionBox.classList.add('zone-selection');
    zoneSelectionBox.appendChild(zoneText);
    zoneSelectionBox.appendChild(fullscreenText);

    const zoneList = document.createElement('div');
    zoneList.classList.add('zone-list');

    displayBox.appendChild(zoneSelectionBox);
    displayBox.appendChild(zoneList);

    let isZoneListVisible = false; // 구역 목록 표시 상태 관리 변수

    zoneText.addEventListener('click', function() {
        if (isZoneListVisible) {
            hideZoneSelectionBoxAndList(); // 목록이 보일 때 클릭하면 숨김
        } else {
            loadZoneList();
            zoneList.style.display = 'block';
            isZoneListVisible = true; // 목록이 보이므로 상태 변경
        }
    });

    function hideZoneSelectionBoxAndList() {
        zoneSelectionBox.style.display = 'none';
        zoneList.style.display = 'none';
        isZoneListVisible = false; // 목록이 숨겨졌으므로 상태 변경
    }

    function showZoneSelectionBox() {
        zoneSelectionBox.style.display = 'flex';
        if (isZoneListVisible) {
            zoneList.style.display = 'block'; // 목록이 보일 때 다시 보이도록 설정
        }
    }

    function handleMouseMove(event) {
        const mouseY = event.clientY;
        const mouseX = event.clientX;
        const boxRect = displayBox.getBoundingClientRect();

        if (document.fullscreenElement) {
            const zoneSelectionBoxRect = zoneSelectionBox.getBoundingClientRect();
            const zoneListRect = zoneList.getBoundingClientRect();

            // 전체 화면 모드
            if (mouseY <= 35 ||
                (mouseY >= zoneSelectionBoxRect.top && mouseY <= zoneSelectionBoxRect.bottom &&
                 mouseX >= zoneSelectionBoxRect.left && mouseX <= zoneSelectionBoxRect.right) ||
                (mouseY >= zoneListRect.top && mouseY <= zoneListRect.bottom &&
                 mouseX >= zoneListRect.left && mouseX <= zoneListRect.right)) {
                showZoneSelectionBox();
            } else {
                hideZoneSelectionBoxAndList();
            }
        } else {
            // 일반 화면 모드
            if (mouseX >= boxRect.left && mouseX <= boxRect.right &&
                mouseY >= boxRect.top && mouseY <= boxRect.bottom) {
                showZoneSelectionBox();
            } else {
                hideZoneSelectionBoxAndList();
            }
        }
    }

    function handleIframeMouseMove(event) {
        const iframeRect = event.currentTarget.getBoundingClientRect();
        const mouseY = event.clientY;
        const mouseX = event.clientX;

        if (mouseX >= iframeRect.left && mouseX <= iframeRect.right &&
            mouseY >= iframeRect.top && mouseY <= iframeRect.bottom) {
            showZoneSelectionBox();
        } else {
            hideZoneSelectionBoxAndList();
        }
    }

    function loadZoneList() {
        let zones = JSON.parse(localStorage.getItem('zones')) || [];
        
        zoneList.innerHTML = '';

        zones.forEach(zone => {
            const zoneItem = document.createElement('div');
            zoneItem.classList.add('zone-item');
            zoneItem.textContent = `${zone.name} ${zone.floor} (${zone.detail || '무공정'})`;

            zoneItem.addEventListener('click', function() {
                handleZoneSelection(zone);
                hideZoneSelectionBoxAndList(); // 구역을 선택하면 박스와 목록 숨기기
            });

            zoneList.appendChild(zoneItem);
        });
    }

    function handleZoneSelection(zone) {
        const selectedZoneId = `${zone.name}-${zone.floor}`;
        localStorage.setItem('selectedZoneId', selectedZoneId);

        loadSelectedZoneHTML(zone);
    }

    function loadSelectedZoneHTML(zone) {
        const zoneFileName = `101관리자-전광판.html?zone=${zone.name}-${zone.floor}`;

        const existingIframe = document.querySelector('.zone-display-iframe');
        if (existingIframe) {
            existingIframe.remove();
        }

        const container = document.createElement('div');
        container.classList.add('zone-display-container');

        const iframe = document.createElement('iframe');
        iframe.classList.add('zone-display-iframe');
        iframe.src = zoneFileName;

        container.appendChild(iframe);
        displayBox.appendChild(container);

        // iframe의 마우스 이벤트 처리
        iframe.addEventListener('load', function() {
            iframe.contentWindow.addEventListener('mousemove', handleIframeMouseMove);
        });

        if (document.fullscreenElement) {
            iframe.style.transform = 'scale(1.4)';
            iframe.style.transformOrigin = '0 0';
        }
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            displayBox.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    function onFullScreenChange() {
        const iframe = document.querySelector('.zone-display-iframe');
        if (document.fullscreenElement) {
            if (iframe) {
                iframe.style.transform = 'scale(1.4)';
                iframe.style.transformOrigin = '0 0';
            }
        } else {
            if (iframe) {
                iframe.style.transform = 'scale(1)';
            }
        }
    }

    document.addEventListener('fullscreenchange', onFullScreenChange);
    initializeMouseEventHandlers();

    function initializeMouseEventHandlers() {
        window.addEventListener('mousemove', handleMouseMove);
    }

    function restorePreviousSelection() {
        const selectedZoneId = localStorage.getItem('selectedZoneId');
        if (selectedZoneId) {
            const zones = JSON.parse(localStorage.getItem('zones')) || [];
            const zone = zones.find(z => `${z.name}-${z.floor}` === selectedZoneId);
            if (zone) {
                loadSelectedZoneHTML(zone);
            }
        }
    }

    // 페이지 로드 시 이전 선택 복원
    restorePreviousSelection();

    // 초기 상태에서 구역 선택 창과 구역 목록 모두 숨김
    zoneSelectionBox.style.display = 'none';
    zoneList.style.display = 'none';
});
