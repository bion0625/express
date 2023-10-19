# express-bion

# fly.io
NODE_ENV=production ==> 서버에 자동설정

flyctl launch

# env 세팅 (port의 경우 fly.toml에 있는 port로 키 저장)
flyctl secrets set key=value
# env 세팅 제거
flyctl secrets unset key

# fly 설치
powershell
iwr https://fly.io/install.ps1 -useb | iex

# fly 로그인
flyctl auth login

# 배포
flyctl deploy
