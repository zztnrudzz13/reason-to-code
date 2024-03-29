---
title: "면접에서 브라우저 렌더링을 묻는 이유"
category: "Network"
date: "2023-09-18 13:29:00 +09:00"
desc: "브라우저가 렌더링될 때 벌어지는 일들에 대해 알아보자"
thumbnail: "./images/network/browser.jpg"
alt: "browser rendering"
---

## 면접 단골 질문

프론트엔드 개발자로써 신입 면접을 보면 브라우저 렌더링은 꼭 한 번씩 받게 되는 면접 단골 질문입니다. 처음 저도 면접 준비를 할 때에는 왜 물어보는 지 영문도 모른 채 외워서 답변했던 기억이 납니다. 그 이후 여러 회사에서 실무를 경험해보면서, 브라우저와 친해지고 브라우저 관점에서 작업을 하다보니, 자연스레 이 질문이 왜 중요한 지, 그리고 이 질문의 요점이 무엇인지 체득하게 되었습니다. 제 첫 면접에서도 받았던 질문으로, 저에게도 매우 의미있는 질문이고 이 질문을 통해 설명할 수 있는 영역이 많아서 글을 정리하게 되었습니다.

## 첫 번째: 주소를 적고 엔터를 치면

크롬을 기준으로 설명하겠습니다. 크롬에 'https://www.google.com' 이라고 주소를 적고 엔터를 치면 유저가 보는 화면이 완성될 때까지 어떤 일들이 발생할까요? 아래 사진은 실제로 주소를 치고 개발자 도구의 Network 탭에 들어가면 볼 수 있는 화면입니다.

<img width="1142" alt="network-tab" src="https://github.com/teenting/Frontend/assets/81177665/5084ecf0-ccfe-44ec-84f1-7fd849e275e3">
<br>

다양한 타입의 파일들이 어디선가 넘어와서, 이 데이터들을 토대로 화면을 그려내는 것 같습니다. 넘어오고 난 이후의 과정은 차차 설명하고, 우선 어디서 어떻게 넘어오는 지를 알고 싶습니다. 우선 주소를 살펴보면 'https' 부분과 'www.google.com' 부분으로 나눌 수 있습니다. 두 부분의 역할이 다른데요, https부터 살펴봅시다.

### HTTP: the way(method) of connection

우리가 우체국에 가서 우편을 보낼 때, 다양한 방법 중 하나를 선택해서 보내게 됩니다. 등기나 소포일 수도 있고, 익일특급일 수도 있고, 국제 우편일 수도 있습니다. 그리고 각 방법마다 요구하는 정보가 다르고, 반송여부도 다르고, 위치 추적이 안 될 수도 있습니다. 그런 것처럼 HTTP도 클라이언트와 서버가 통신하는 여러 방법 중 하나입니다. 클라이언트에서 HTTP Request 메세지의 틀에 맞춰서 메세지를 제작하고 서버에 보내면, 서버에서는 (status가 200이라고 가정하였을 때) HTTP Response를 줍니다. 즉, HTTP라는 프로토콜 규약을 지키며 서버와 클라이언트가 서로 데이터를 교환합니다. 마치 우편을 보낼 때 요구하는 틀에 맞춰서 정보를 적는 것과 동일합니다.

### DNS: internet address book

받고 싶은 데이터에 대해 통신 규약에 맞게 메세지를 만들었다면, 어느 서버로 보내줘야 할까요? 실제 서버 주소는 www.google.com 이라는 이름으로 되어 있지 않습니다. 이 이름은 사용자들이 보기 편리하게 단어들로 변경해둔 것이고, 실제로는 192.168.1.1 와 같이 고유 IP 주소로 되어 있습니다. 그렇기 때문에 어떤 IP 주소로 가서 데이터를 받아와야 하는 지 도메인 이름을 IP 주소로 변환하는 과정이 필요합니다. 그리고 이 과정에서 DNS를 사용합니다. DNS(Domain Name System)는 인터넷 전화번호부로, 브라우저에서 데이터를 로드할 수 있도록 도메인 이름을 IP 주소로 변경해줍니다.

<img width="2160" alt="DNS" src="https://github.com/zztnrudzz13/reason-to-code/assets/81177665/8d28f299-61c5-40b0-9539-eefbd495688c">

<br>
<br>

DNS는 www.google.com 과 같은 주소를 받으면 맨 뒤에서부터 차근차근 주소를 찾아나갑니다. 아래는 IP 주소를 찾는 순서입니다.

<br>
<br>
✅ DNS Resolver 는 주소를 받으면 Root Server에 가고, Root Server는 `.com`을 관리하는 TLD 서버 주소를 알려줍니다.
<br>
<br>
✅ DNS Resolver 는 TLD Server로 가고, TLD Server는 SLD Server 주소를 알려주거나, Subdomain 서버 주소를 알려줍니다.
<br>
<br>
(주소가 `www.bbc.co.uk` 와 같이 SLD와 subdomain이 모두 있는 형태, `www.google.com` 과 같이 subdomain만 있는 형태, `www.mit.edu` 처럼 SLD만 있는 형태로 생김새가 다양하기 때문에, TLD Server가 전달하는 주소가 다를 수 있습니다.)
<br>
<br>
✅ SLD Server 혹은 Subdomain Server 혹은 둘 다 방문하면서 IP 주소를 알아내면 DNS Resolver는 고유 IP 주소를 브라우저에 다시 전달합니다.

### TCP/UDP: the way(road) of connection

OK! 보내고 싶은 데이터도 HTTP 메세지로 만들고 어느 서버로 보내야 할 지 DNS 서버로 IP 주소로 알아냈으니 이제 보내봅시다. 서버랑 클라이언트는 서로 소통할 수 있는 길이 열려 있어야지만 데이터를 주고 받을 수 있습니다. 한 번 열어둔 길은 닫히기 전에 재사용해서 데이터를 또 보낼 수도 있습니다. 데이터를 전송할 때도 각각의 길이 요구하는 방법을 지키면서 보내야 하는데요, 인터넷 환경에서 가장 많이 쓰이는 방법에는 TCP와 UDP가 있습니다.
<br>
TCP는 UDP에 비해 안전하게 데이터를 전송하는 방법입니다. 안전하다는 것은, 내가 보낸 데이터가 서버에 잘 도착했는 지 확인할 수 있기 때문인데요, 이를 보장하기 위해 Handshake라는 방식을 사용합니다. 예를 들어, 화상으로 면접을 본다고 생각해봅시다. 제 목소리가 잘 들리는 지 면접관에게 묻지 않고, 자기소개부터 하기 시작한다면 어떻게 될까요? 면접관이 들을 준비가 안되어 있거나, 소리가 꺼져있었다면 제가 전달하고자 했던 내용을 듣지 못했을 수도 있습니다. 그래서 저희는 대화를 시작하기 전에,
<br>
<br>
🙋🏻‍♀️ : 면접관님, 제 목소리가 잘 들릴까요?<br>
🙆🏻‍♂️ : 네, 잘 들립니다! 혹시 제 목소리도 잘 들리나요?<br>
🙆🏻‍♀️ : 네, 저도 잘 들립니다!
<br>
<br>
와 같은 과정을 거치고 시작합니다. 어렵게 생각할 것 없이, TCP도 같은 방식으로 동작합니다. 아래 사진을 보면 총 세 번의 패킷을 보내는데요, 위 면접자와 면접관의 대화와 같이 데이터를 교류할 수 있는 상태인 지, 길을 열어줄 수 있는 지 묻고 되묻는 과정입니다.

<img width="1856" alt="handshake" src="https://github.com/zztnrudzz13/reason-to-code/assets/81177665/6c90fa78-ad45-44f3-9a58-5b4ecf5ebbf6">

<br>
<br>

위 사진에서 SYN는 Synchronize Sequence Number로, 연결을 확인하기 위해 무작위로 숫자 값을 보내고, ACK는 상대로부터 받은 SYN에 1를 더해 잘 받았다는 패킷을 보내면서 연결을 초기화합니다. 처음 연결을 `ESTABLISHED` 상태로 만들 때와 마찬가지로, 데이터를 전송하고 연결을 끊기 위해 `CLOSED` 상태를 만들 때도 4-way handshake 방식을 사용하여 안전하게 연결을 종료합니다. 즉, TCP는 빠른 전송보다는 신뢰성 있는 전송이 필요할 때 사용되는 프로토콜입니다.
<br>

이와 다르게 UDP는 비연결형 프로토콜로, TCP보다 빠르고 네트워크 부하가 적습니다. 또한 TCP와 다르게 1:1로 통신하는 것이 아니라 1:N 혹은 N:N 통신도 가능합니다. UDP는 TCP처럼 연결을 설정하고 종료하는 과정이나 흐름을 제어하는 기능이 없기 때문에 데이터를 보낼 때 잘 받았는 지 확인하지 않고, 또 전송 순서가 변경될 수도 있습니다. 그렇다고 TCP가 안정적이기 때문에 TCP만을 옳은 프로토콜로 보지는 않습니다. 대부분의 브라우저와 서버 간 통신에서 TCP를 통신 방식으로 선택하지만, 굳이 신뢰성이 보장될 필요가 없는 경우에는 UDP가 더 좋은 선택지가 될 수도 있습니다. 단적인 예시로 DNS는 UDP 통신 방식을 사용합니다. 물론 특정 DNS resolver는 TCP 방식을 사용하기도 하지만, 대부분은 UDP를 사용하는데요, 그 이유는 DNS server는 트래픽이 엄청난 서버이기 때문에 빠른 통신이 중요하고, 신뢰도 문제는 application layer에서 해결이 가능하기 때문입니다. timeout을 사용해서 request를 다시 보낼 수 있기 때문에 UDP로도 충분히 소통이 가능합니다.
<br>

그렇게 상황에 맞는 프로토콜을 사용하여 서버와의 연결이 완료되면, 그 길을 통해 원하는 데이터 요청을 보내고 서버는 request에 맞는 데이터를 브라우저에 넘겨줍니다. 요청한 데이터를 전부 보내면 클라이언트와 서버는 연결을 종료하게 되는데요, 만약 연결이 종료되기 전에 패킷을 전송하였지만, 패킷 전송이 지연되었거나 유실되어 재전송하는 과정에서 이미 연결이 종료되는 문제를 막기 위해 클라이언트는 서버로부터 종료 패킷을 받았더라도 일정 시간동안 세션을 남겨두고 잉여 패킷을 기다리기도 합니다.

### OSI 7계층

통신에 대한 이야기가 마무리되었으니, 잠깐 OSI 7계층에 대한 이야기를 해보고자 합니다. 처음 OSI 7계층 그림을 보았을 때, 이게 무엇을 도식화하는 것인지 이해하기 어려웠고, 설명을 들었을 때는 더 이해할 수 없었습니다. 하지만 브라우저가 렌더링될 때 네트워크 통신을 통해 서버로부터 데이터를 가져오는 영역을 배우면서 자연스럽게 7계층을 이해하게 되었습니다.
<br>

OSI 7계층은 네트워크에서 통신이 일어나는 과정을 7단계로 나눈 것으로, 위에서 설명한 바와 같이 브라우저와 서버가 통신을 하면서 데이터를 교환할 때 발생하는 과정을 표현한 것입니다. 7단계를 단순화하여 4단계로 나누기도 합니다. 여기서 OSI 7계층 내용을 깊이 다루기에는 양이 너무 많아지지만, 위에서 설명한 내용이 아래 사진에서 어떤 식으로 적용되는 지만 알고 간다면, 스스로 공부할 때 더 이해가 쉬울 것 같습니다. TCP/IP 4계층을 기준으로 본다면 Application Layer, 유저와 가장 가까이 있는 계층에서 HTTP와 같은 프로토콜을 사용하여 통신을 시작하는 것을 알 수 있습니다. DNS도 Application Layer에 해당하는 것을 볼 수 있습니다.
<br>

Transport Layer에서는 위에서 살펴본 TCP/UDP가 프로토콜로 사용되는 것을 알 수 있습니다. 한 가지 사실을 추가해서 설명해보자면 Transport Layer, 즉 전송계층에서는 위에서 받은 Application 데이터를 TCP/UDP 세그먼트에 넣어서 네트워크 계층에 전달합니다. 그리고 네트워크 계층에서는 TCP/UDP 세그먼트로 감싸진 데이터를 IP 패킷으로 한 번 더 감싸서 데이터 링크 계층으로 보냅니다. 이런 식으로 한 계층을 내려갈 때마다 새로운 패킷과 정보로 기존 데이터를 감싸는데 이를 캡슐화(encapsulation)라고 합니다. Physical Layer, 물리 계층에서 감싸진 데이터가 0과 1의 형태로 서버에 전송되면 서버는 감싸진 데이터를 다시 하나씩 뜯어보면서 상위 계층으로 보내고, 클라이언트에서 처음에 보낸 요청 데이터를 발견하게 되는데 이를 역캡슐화(decapsulation)라고 합니다. 계층을 내려갈 때마다 데이터를 감싸고 다시 계층을 올라갈 때마다 감싸둔 패킷을 뜯어보면서 실제 데이터와 마주하게 되는 방식입니다. 그리고 그 과정에서 위에서 설명한 여러 프로토콜들을 활용하게 됩니다.

<img width="3232" alt="OSI 7 layer" src="https://github.com/zztnrudzz13/reason-to-code/assets/81177665/9c84e7db-ec02-4654-b290-02196adec206">

## 두 번째: 받은 데이터로 화면 그리기

위 네트워크 탭에서 확인할 수 있는 사진처럼, 브라우저는 통신에 성공하면 서버에서 여러 타입의 데이터를 가지고 옵니다. 서버에서 데이터를 로드해오는 것은 아래 사진에 통신(편의상 HTTP라고 적어두었습니다)에 해당될 것입니다. 그렇다면, 로드된 데이터를 잘 활용해서 사용자가 보는 화면을 그리는 것은 아래 사진에서 별표가 쳐져 있는 **렌더링 엔진**의 역할입니다.

<img width="1792" alt="browser-rendering" src="https://github.com/zztnrudzz13/reason-to-code/assets/81177665/fc149f7e-0f1a-4e5f-ae5d-892a009ec7a9">

<br>
<br>

브라우저마다 사용하고 있는 렌더링 엔진은 조금씩 다른데요, 예를 들면 크롬은 Blink, 사파리는 Webkit, 파이어폭스에서는 Gecko를 렌더링 엔진으로 사용합니다. 그렇다면 렌더링 엔진은 데이터를 가지고 어떤 일을 실행할까요? 렌더링 엔진의 기본 기능은 HTML과 CSS를 파싱해서 트리를 만들고 이를 UI로 그리는 역할을 합니다. 요즘에는 CSR(Client Side Rendering)으로 빈 HTML 파일이 넘어오기도 합니다. 그러면 `<script>` 태그에 import되어 있는 Javascript 파일을 자바스크립트 엔진이 해석하여 HTML 파일을 채워넣게 됩니다. 우리가 아는 유명한 V8 엔진이 바로 이 시점에 실행되는 자바스크립트 해석기에 해당됩니다. 그렇게 자바스크립트 엔진이 HTML 파일의 `body` 태그 부분을 채워넣거나, 이미 채워져서 로드된 HTML 파일이 있다고 생각해봅시다.
<br>

```html
<html>
  <body>
    <div>
      <p>This is my blog!</p>
      <div><img src="blog.png" /></div>
    </div>
  <body>
</html>
```

<br>

위 예시대로 렌더링 엔진이 HTML 파일을 받게 된다면, 렌더링 엔진은 아래와 같은 DOM 트리를 구성해낼 것입니다. 부모 태그와 자식 태그 간의 관계를 트리의 노드를 활용하여 표현한 것입니다.

<br>
<img width="2608" alt="dom-tree" src="https://github.com/zztnrudzz13/reason-to-code/assets/81177665/dd4a1ddd-8952-4329-bee5-391c2dc8f2df">
<br>
<br>

HTML의 요소들을 태그로 표현한 것과 같이, StyleSheets도 파싱해서 CSSOM 트리를 생성합니다. 루트 노드에는 스타일 시트 객체가 생성되고 그 아래 CSS 규칙 객체는 `선택자`와 `선언`으로 나뉘어 특정 선택자에 어떤 속성이 포함되어 있는 지 노드로 표현하게 됩니다.

<img width="3520" alt="cssom-tree" src="https://github.com/zztnrudzz13/reason-to-code/assets/81177665/1147b98b-0909-407c-9bb7-a2a00123d9c9">

<br>

CSSOM 트리까지 완성되고 나면, 렌더링 엔진은 렌더 트리를 만듭니다. DOM 트리에 있는 모든 요소가 렌더 트리에 포함되는 것은 아닙니다. 예를 들어 head 요소는 실제로 UI에 나타나는 영역이 아니기 때문에 렌더 트리에 들어가지 않습니다. `display: none;` 이 할당된 요소도 UI에서 그 어떤 영역도 차지하지 않기 때문에 렌더 트리에 추가되지 않습니다. 실제로 UI에서 사용되는 HTML과 CSS 요소를 한 곳에 모아 렌더 트리를 형성하면, 렌더링 엔진은 요소들을 화면에서 차지하는 영역만큼 배치하고, 스타일대로 그림을 그립니다. 이 모든 과정이 끝나면 유저는 서버로부터 넘어온 데이터를 화면에서 UI로 확인할 수 있게 됩니다.
<br>

아래 사진을 통해 위 설명을 좀 더 시각적으로 이해할 수 있을 것입니다.
<br>

<img width="4176" alt="render-tree" src="https://github.com/zztnrudzz13/reason-to-code/assets/81177665/1042c77b-8cca-45aa-8a97-8579b0bde6dc">

## Conclusion

제가 느끼기에 브라우저 렌더링을 물어보는 이유는, 이 질문이 프론트엔드 분야의 많은 영역을 관통하고 있기 때문입니다. 짧고 간단하게는 1분 정도로 설명할 수 있지만, 길고 자세하게는 설명할 영역이 끝도 없습니다. 이미 브라우저 렌더링이라는 화두로 HTTP 규약, DNS Lookup, TCP와 UDP, 렌더링 엔진들에 대해서 설명하였는데요, 이 외에도 HTTP와 HTTPS, 메세지를 보낼 때 GET과 POST, TCP/UDP 심화 내용, OSI 7계층 심화 내용 등 더 많은 영역에 대해서도 다뤄볼 수 있습니다.
<br>

따라서 이 질문을 던졌을 때, 어떻게 답변을 시작하느냐에 따라 얼만큼 알고 대답하는 것인지 가늠할 수 있습니다. 저도 처음에는 렌더링 엔진이 무엇인지조차 모르는 상태에서 렌더 트리 관련된 내용만 암기하고 면접을 보았습니다. 하지만 이제는 브라우저 렌더링에 대한 질문을 받으면 머릿속에서 어느 정도 가지를 친 여러 개념들과 세부 항목들에 대한 지도가 그려집니다.
<br>

이런 지도를 만들기 위해서 저는 '재귀검색'을 활용합니다. '재귀검색'은 제가 공부를 하는 방식인데, <code>What is Browser Rendering?</code>이라는 가장 기초적인 내용으로 검색을 시작합니다. 그리고 콘텐츠를 읽으면서 모르는 내용을 또 검색하고, 그 안에서 모르는 내용을 또 검색하면서 계속 파고들다가 재귀적으로 다시 처음 검색했던 콘텐츠로 돌아왔을 때에는 제 머릿속에 큰 지도가 그려지게 됩니다. 브라우저 렌더링에 대한 질문은 단순히 자주 나오는 질문이기보다, 브라우저가 돌아가는 원리에 대해 깊게, 재귀적으로 파고들 수 있는 좋은 마중물과 같은 질문이라는 생각이 듭니다.
