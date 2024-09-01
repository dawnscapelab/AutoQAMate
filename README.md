# AutoQAMate

AutoQAMate는 Electron과 React를 사용하여 구축된 데스크톱 애플리케이션입니다. 이 애플리케이션은 자동화된 QA 프로세스를 지원하기 위해 설계되었습니다.

## 사용 방법

1. 프로그램 실행 방법
   - 프로그램은 로컬 PC에 개발 환경을 설정한 후 실행하거나, Release zip 파일들 다운로드 받아서 exe 패키지 파일을 실행하여 사용 가능합니다.
   - [AutoQAMate v1.0.1](https://github.com/dawnscapelab/autoqamate/releases/download/v1.0.0/autoqamate-v1.0.0.zip)

2. **웹 자동화**
   - "Web" 탭에서 검색 키워드와 시간 범위를 설정합니다.
   - "Execute" 버튼을 클릭하여 자동화를 실행합니다.
   - 결과는 CSV 파일로 저장되며, 목록에서 확인 및 다운로드할 수 있습니다.

3. **모바일 자동화**
   - "Mobile" 탭에서 연결된 Android 디바이스를 선택합니다.
   - 테스트 시나리오를 생성하거나 기본 저장된 시나리오를 사용합니다.
   - "Run Test" 버튼을 클릭하여 테스트를 실행합니다.
   - "Get Page Source"로 현재 화면에 대한 페이지 소스를 확인 할 수 있습니다.
   - 테스트 시나리오는 UI를 통해서 스텝 단위로 구성하고, 정해진 실행 명령어를 설정하고, 필요한 실행 정보 (객체 요소 값 등)을 입력하여 생성하고 수정할 수 있습니다.

4. **테스트 관리**
   - "Tools" 메뉴를 클릭하면 새 윈도우로 테스트 도구가 실행됩니다.
   - 테스터 정보 추가, 삭제 및 조회
   - 테스트 정보 추가, 삭제 및 조회
   - 토큰 생성
   - 테스트 실행 및 확인

## 개발 환경 설정

1. Node.js와 npm이 설치되어 있는지 확인하세요. 빌드된 프로그램을 사용하기 위해서는 필요가 없지만, 로컬 개발 환경 구성을 위해서는 필수적으로 설치되어 있어야 합니다.

2. 저장소를 클론하거나 다운로드합니다. 
   ```
   git clone https://github.com/yourusername/autoqamate.git
   cd autoqamate
   ```

3. CMD 창에서 아래 명령어를 실행하여 프로젝트에 필요한 의존성을 설치합니다.
   ```
   npm install
   ```
4. CMD 창에서 `npm run dev`를 실행하여 개발 서버를 시작합니다.


## 주요 기능

1. **웹 자동화**
   - Google 뉴스 검색 자동화
   - 검색 결과를 CSV 파일로 저장
   - CSV 파일 뷰어 및 다운로드

2. **모바일 자동화**
   - Android 디바이스 연동
   - 사용자 정의 테스트 시나리오 실행
   - XPath 요소 관리

3. **테스트 도구**
   - 사용자 토큰 생성
   - 테스터 정보 관리
   - 테스트 정보 관리
   - 테스트 실행 및 결과 확인

## 주요 기술 스택

- Electron
- React
- Tailwind CSS
- Node.js
- Puppeteer (웹 자동화)
- Appium (모바일 자동화)


## 빌드 및 배포
1. CMD 창에서 `npm run package` 명령어를 실행하여 프로그램을 배포 가능한 형태(exe)로 빌드를 생성하고, 빌드된 실행 가능한 프로그램을 배포합니다.

2. (최초) 패키지 빌드 시 윈도우 환경에서 관리자 권한이 필요한 경우가 있으므로, CMD 창을 관리자 권한으로 실행 후 명령어를 실행해야 정상적인 빌드가 가능합니다.

