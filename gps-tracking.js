const restrictedArea = [
    { lat: 35.9470822, lng: 126.6853641 }, // 좌표 1
    { lat: 35.9467586, lng: 126.6854137 }, // 좌표 2
    { lat: 35.9467934, lng: 126.6856927 }, // 좌표 3
    { lat: 35.9471093, lng: 126.6856364 }, // 좌표 4
    { lat: 35.9470822, lng: 126.6853641 }  // 좌표 5 (첫 번째 좌표로 다시 닫음)
];

navigator.geolocation.watchPosition(
    function(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        checkBoundary(latitude, longitude);
    },
    function(error) {
        console.error("Error getting GPS location: ", error);
    },
    {
        enableHighAccuracy: true, // 위치 정확도 높이기
        maximumAge: 0,
        timeout: 5000
    }
);

function checkBoundary(latitude, longitude) {
    console.log("경계선 확인 중: 현재 위치 -", latitude, longitude);
    if (isInsideBoundary(latitude, longitude, restrictedArea)) {
        console.log("출입금지구역 안에 있습니다.");
        triggerAlert();
    } else {
        console.log("출입금지구역 밖에 있습니다.");
    }
}

function isInsideBoundary(lat, lng, polygon) {
    let isInside = false;
    const x = lat;
    const y = lng;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lat, yi = polygon[i].lng;
        const xj = polygon[j].lat, yj = polygon[j].lng;

        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
    }

    return isInside;
}

function triggerAlert() {
    const lowerAccessControlBox = document.getElementById('lower-access-control');
    lowerAccessControlBox.classList.add('alert');

    // 알림을 멈추기 위해 10초 후에 깜빡임 해제
    setTimeout(() => {
        lowerAccessControlBox.classList.remove('alert');
    }, 10000);
}
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        function(position) {
            console.log("현재 위치: 위도 " + position.coords.latitude + ", 경도 " + position.coords.longitude);
        },
        function(error) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    console.error("사용자가 위치 정보 제공을 거부했습니다.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    console.error("위치 정보를 사용할 수 없습니다.");
                    break;
                case error.TIMEOUT:
                    console.error("위치 정보 요청이 시간 초과되었습니다.");
                    break;
                default:
                    console.error("알 수 없는 오류가 발생했습니다.");
                    break;
            }
        }
    );
} else {
    console.error("이 브라우저는 위치 정보를 지원하지 않습니다.");
}
