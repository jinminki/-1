document.getElementById('startButton').addEventListener('click', function() {
    const selection = document.getElementById('selection'); // 군산대학교 선택 창
    const loginInput = document.getElementById('loginInput'); // 로그인 입력 창

    if (selection.style.display === 'block') {
        selection.style.display = 'none'; // 선택 창 숨기기
        loginInput.style.display = 'none'; // 로그인 입력 창 숨기기
    } else {
        selection.style.display = 'block'; // 선택 창 표시
    }
});

function handleUniversityClick(event) {
    const selectedText = event.target.textContent;
    const usernameInput = document.getElementById('username');
    usernameInput.value = selectedText;
    document.getElementById('loginInput').style.display = 'block'; // 로그인 입력 창 표시
}

document.getElementById('kunsanUniversity1').addEventListener('click', handleUniversityClick);
document.getElementById('kunsanUniversity2').addEventListener('click', handleUniversityClick);
document.getElementById('kunsanUniversity3').addEventListener('click', handleUniversityClick);

document.getElementById('submitLogin').addEventListener('click', function() {
    const username = document.getElementById('username').value; // 아이디 입력 값
    const password = document.getElementById('password').value; // 비밀번호 입력 값
    if (username === '2003139' && password === '2003139') {
        window.location.href = '2관리자-메인화면.html'; // 올바른 아이디와 비밀번호일 경우 이동
    } else {
        alert('아이디 또는 비밀번호가 틀렸습니다. 다시 시도해주세요.'); // 잘못된 입력 경고
    }
});

document.getElementById('password').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('submitLogin').click(); // 엔터 키로 로그인 제출
    }
});

document.getElementById('username').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        document.getElementById('submitLogin').click(); // 엔터 키로 로그인 제출
    }
});

// 추가된 부분
document.getElementById('username').addEventListener('focus', function() {
    if (this.value === '군산대학교1' || this.value === '군산대학교2' || this.value === '군산대학교3') {
        this.value = ''; // 클릭하면 텍스트 사라짐
    }
});

document.getElementById('username').addEventListener('blur', function() {
    if (this.value === '') {
        this.value = '군산대학교1'; // 기본 텍스트로 다시 설정, 필요에 따라 변경 가능
    }
});
