---
title: "Next.js를 사용하면서 리액트랑 별반 다르지 않다고 느꼈던 이유"
category: "Next"
date: "2023-01-17 13:11:00 +09:00"
desc: "Next.js가 제공하는 여러 렌더링 패턴을 알아보자"
thumbnail: "./images/next/next.webp"
alt: "next official thumbnail"
---

## Next.js를 사용하는 회사

스타트업에서 인턴으로 일을 하면서 Next.js를 사용하는 회사가 많다는 것을 알 수 있었습니다. 저는 왜 우리 회사에서 Next.js를 사용하고 있는지 궁금하였습니다. 왜냐하면, 처음 Next.js를 접했을 때 React와 별반 다른 점을 느끼지 못했기 때문입니다. 문법도 리액트와 같고, 차이점이라 한다면 Next.js에서 Image 태그를 그들이 만든 태그를 사용하도록 한다는 것이고, 그마저도 저는 불편하게 느껴졌습니다. 그래서 회사에서 점심시간에 동료들이랑 이야기를 나누면서 Next.js와 React의 차이점이 무엇인 것 같냐고 물어보았습니다. 돌아온 대답은 '다이나믹 라우팅'이라는 것이었습니다. 하지만 제 생각은 달랐습니다. 단지 다이나믹 라우팅 하나만을 위해서 Next.js라는 프레임워크를 만들었을 거라고 생각하지 않았기 때문입니다. 실제로도 Next.js가 어떠한 장점을 가진 지 모르는 채로 사람들이 사용하기 때문에, 더 최근에 나온 프레임워크이기 때문에 무분별하게 사용하는 경우가 많다는 것을 느꼈습니다. 저 또한 SSR를 지원해준다고는 하지만, 실제로 어떤 방식으로 장점이 되는지 찾아보고 싶었고, 그래서 이 글을 정리하게 되었습니다.

## Browser Rendering

Next에 대한 이해를 돕기 위해 우선 브라우저의 렌더링 방식을 알아야 합니다. 자세한 내용은 **[Naver D2-브라우저는 어떻게 동작하는가](https://d2.naver.com/helloworld/59361)** 에서 접할 수 있습니다. 우리가 브라우저에 www.google.com 을 치면 어떤 일이 일어날까요? 첫 번째로는 웹브라우저에서 URL에 있는 호스트명을 추출해서 IP로 변환합니다. 그리고 URL에 포트번호가 있다면 포트번호를 추출합니다.(기본 포트번호는 80입니다.) 그 다음 브라우저는 서버와 TCP 커넥션을 맺어서 HTTP 요청을 보냅니다. 그러면 서버에서 HTTP 응답을 보낼 것이고 커넥션이 닫히면, 브라우저에서 문서를 띄우고 유저가 그 문서를 보게 되는 것입니다.<br>

### 클라이언트 렌더링
여기서 서버가 **어떤 문서**를 전달해주는 지가 중요한 지점입니다. 서버가 전달해주는 문서에 따라 우리는 클라이언트가 렌더링 하는지, 서버가 렌더링하는 지를 나눌 수 있습니다. 클라이언트가 렌더링하는 경우부터 살펴봅시다. 클라이언트가 렌더링을 한다면, 서버에서 응답으로 받은 리소스에서 자바스크립트 엔진이 HTML 파일을 생성합니다. 그리고 브라우저가 이를 화면에 보여주는 것이죠. 그렇기 때문에 이 과정에서 서버는 리소스를 넘겨주는 것 이외에는 그 어떤 관여도 하지 않게 됩니다. 그렇기 때문에 초기에 브라우저는 아래와 같은 HTML 파일을 처음에 가지고 있다가 점차 element들을 채워나가게 됩니다.
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>when client renders the page</title>
  </head>
  <body>
    <div id="root"><!-- it's blank here --></div>
    <script src="main.js"></script>
  <body>
</html>
```
<br>

### 서버 렌더링
그렇다면 서버가 렌더링에 관여하는 경우, 즉 server-side rendering 일 때는 어떤 변화가 일어날까요? 위에서 빈 HTML 을 브라우저가 채워나갔던 상황과는 달리 서버가 렌더링에 관연하게 될 때는 꽉 채워진 HTML 파일을 커넥션때 전달합니다. root element가 blank가 아닌, 요소들이 채워져서 넘어오는 것입니다. 그렇기 때문에 브라우저는 static page인 HTML을 렌더링하는데 시간을 쏟을 필요가 없고, interaction 을 하기 위한 자바스트립트 파일만 다운받아서 실행하면 됩니다. 서버 사이드에서 렌더링을 할 때는 넘어오는 리소스가 아래와 같습니다.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>when server renders the page</title>
  </head>
  <body>
    <div id="root">
      <div class="container">
        <h3>Please fill the email</h3>
        <form>
          <input type="email" placeholder="example@domain.com" name="email" required />
          <button type=submit>Submit</button>
        </form>
      </div>
    </div>
    <script src="main.js"></script>
  <body>
</html>
```
<br>

위 코드만 봐도 실제 유저가 사용할 때 어떤 차이를 느끼는 지 파악할 수 있습니다. 클라이언트에서 렌더링을 진행할 경우에는, 브라우저가 화면을 보여주기 전까지는 유저는 빈 페이지를 바라보게 됩니다. 하지만, 브라우저에서 HTML을 채워넣고 자바스크립트 파일을 다운받아서 실행해서 화면에 띄워주게 되면, 유저는 원하면 페이지를 볼 수 있고, 바로 클릭이나 입력과 같은 interaction을 할 수 있게 됩니다. 완성된 형태를 마지막에 한 번에 보여주게 되기 때문입니다. 하지만, 서버에서 렌더링을 할 경우에는 완성된 HTML 페이지를 보내주기 때문에, 브라우저는 이를 바로 화면에 띄울 수 있지만, 아직 자바스크립트 파일을 다운받지 않은 상태이기 때문에 사용자가 버튼을 클릭하거나 input에 값을 입력할 수 있게 되기까지 시간이 걸릴 수 있습니다. 즉, Client Side Rendering은 보여지는 시간(Time To View)과 인터랙션이 이루어지는 시간(Time To Interaction)이 동일하지만, Server Side Rendering은 보여지는 시간과 인터랙션이 이루어지는 시간 사이에 공백이 생기게 됩니다.

## What is better, CSR or SSR?
그럼 CSR, SSR 둘 중에 어떤 렌더링 패턴을 사용하는 것이 적합할까요? SSR이 CSR 이후 각광 받으면서, CSR보다 SSR이 더 최신 기술, 혹은 더 '좋은' 기술이라고 생각하는 사람들이 더러 있습니다. 하지만 생각해보면 SSR은 SPA가 아닌 MPA에서 정적 페이지를 렌더링할 때부터 쓰이던 기술로, 예전 기술을 SPA 환경에서 채택한 것이라고 볼 수 있습니다. 그러므로, 어떤 기술이 좋다, 나쁘다 혹은 최신이다, 아니다를 따질 수 없습니다. 그렇다면 우리가 만들고 있는 웹 사이트에 맞게 CSR,SSR 중 어떤 것을 채택할 지 정할 수 있어야 합니다. 때로는 우리가 만들고 있는 페이지가 데이터 변화가 없고 모든 소비자한테 동일한 페이지를 제공하는 Static Rendering Page일 수도 있습니다.

## Next.js : provide every rendering pattern you need
위와 같은 상황에서 Next.js가 빛을 발하는 이유는 우리가 원하는 다양한 종류 렌더링 패턴을 제공한다는 것입니다. 더욱이, 같은 웹 사이트라도 어떤 페이지에서는 csr을, 어떤 페이지에는 ssr을, 어떤 페이지는 ssg를 상황에 맞게 사용할 수 있도록 해준다는 것이 Next.js의 가장 큰 장점입니다. 그래서 Next.js를 이용하면 우리는 적재적소에 렌더링 패턴을 알맞게 활용하여, 서버비용을 줄이거나, 빌드 타임을 줄이거나, 콘텐츠를 캐싱하는 등 optimized된 환경을 유저에게 제공할 수 있습니다. 여기서는 Next.js 를 활용하여 얼마나 다양한 렌더링 패턴을 만들어낼 수 있는지 설명하겠습니다.

### Static Site Generation
어떤 사이트들은 유저마다 제공하는 정보가 같을 수 있습니다. 로그인을 통해 Authentication이 필요하지도 않고, 모든 유저가 보는 정보가 다 같은 경우입니다. 이러한 경우에는 서버에 각기 다른 상황에 대한 데이터를 요청하지 않아도 됩니다. 이럴 때는 HTML을 build time에 만들고, 만들어진 HTML 콘텐츠를 CDN(Content-Delivery-Network) 에 캐싱해둘 수 있습니다.

### Static Site with Client-Side Fetching
정적인 페이지이지만 일부 데이터를 fetching해가지고 와야하는 상황에는 어떨까요? 위의 SSG 환경과 동일하지만, dynamic data의 경우에만 client에서 가져오기 때문에, TTFB(Time To First Byte)에도 문제가 없고 FCP(First Contentful Paint)에도 문제가 없지만, 데이터를 가져와야지만 paint되는 LCP(Largest Contentful Paint)에는 시간이 오래 소요될 수 있습니다.

### Static Site with <code>getStaticProps</code>
위와 같은 문제는 해결한 것이 <code>getStaticProps</code>입니다. 다른 Static Site들과 마찬가지로 build time에 html을 생성하지만, <code>getStaticProps</code>를 사용하면 build time에 서버에 있는 데이터까지 가져와서 html을 생성합니다. 그렇기 떄문에 skeleton UI나 loading state처럼 데이터 가져오는 것을 기다릴 필요가 없습니다. 하지만 build time이 더 길어지고, 데이터가 바뀔 때마다 캐싱된 콘텐츠를 redeploy해야 한다는 단점이 있습니다.

### Incremental Static Regeneration
getStaticProps가 가진 단점을 해결할 수 있는 방법은 캐싱된 데이터를 자동적으로 invalidate하고, 다시 페이지를 생성하게끔하는 것입니다. 아래와 같은 코드로 data를 받으면, 60초를 기준으로 데이터 요청이 있을 때 rebuild 과정을 거치면서 새로 업데이트된 페이지를 redeploy없이 볼 수 있습니다.

```javascript
export async function getStaticProps() {
  const res = await fetch('https://.../data')
  const data = await res.json()
 
  return {
    props: {
      data,
    },
    revalidate: 60
  }
}
```
<br>

### Server-Side Rendering
정적 페이지와 다르게, html이 모든 요청마다 다시 생성되어야 할 수도 있습니다. 그리고 유저별로 보여줘야 하는 콘텐츠가 다르면, 정적 페이지를 사용할 수 없습니다. 그렇기 때문에 CDN에 캐싱하는 것도 의미가 없습니다. 그런 경우, 우리는 CSR이나 SSR을 사용할 수 있는데요, Next.js에서는 SSR을 위해서 <code>getServerSideProps</code>라는 기능을 제공합니다. 만약 유저가 이 페이지를 바로 연다면, 페이지를 요청할 때 <code>getServerSideProps</code>가 실행되어 페이지가 반환된 데이터를 가지고 있는 상태로 pre-rendered 될 것이고, 만약 유저가 사이트가 이미 열려있는 상태에서 <code>next/link</code>나 <code>next/router</code>를 통해 해당 페이지로 전환하려고 할 때는, Next.js가 API 요청을 서버로 보낼 것이고, 그 요청과 함께 <code>getServerSideProps</code>가 실행됩니다.

### Streaming SSR + React Server Components
Next.js 13 버전에서는 React 18을 활용하여 정말 재미있는 형태의 렌더링 패턴을 만들 수도 있습니다. 바로 Streaming SSR과 React Server Component인데요, 이를 사용하면 클라이언트가 아예 렌더링을 하지 않게끔 할 수 있습니다. Streaming SSR은 HTML을 chunk로 쪼개어 빨리 내보낼 수 있는 콘텐츠를 먼저 client에 보내고, 해당 chunk에 대한 javascipt hydrating을 빠르게 시작할 수 있기 때문에 Time To View 시간을 월등히 앞당길 수 있습니다. 그래서 먼저 만들 수 있는 컴포넌트는 미리 웹에 보여줌으로써 점진적으로 화면을 그릴 수 있습니다. React의 기본 Component는 Server Component이지만, useState나 onClick과 같이 interaction이 포함된 경우는 Client Component로 분류하게 됩니다. 그렇기 때문에 Client Component 안에 Server Component를 child component로 사용하게 되면 Client Component 내부 컴포넌트는 이미 렌더링이 된 상태이기 때문에 더 빠르게 화면에 보여줄 수 있습니다. Static한 페이지는 미리 서버에서 만들어서 클라이언트에 보내주고, 유저별로 다른 데이터를 보여줘야 하는 경우에는 getServerSideProps로 데이터를 가져와 React Server Component를 활용하여 웹에 점진적으로 서버에서 렌더링 된 채 띄우고, 마지막으로 javascript interaction이 있는 화면의 경우에만 브라우저가 관여한다면, 유저가 지루함을 느끼지 않고 화면이 변화하는 것을 볼 수 있습니다.

더 자세히 알고 싶다면, **[Vercel App Directory](https://app-dir.vercel.app/)**에서 다양한 렌더링 패턴의 활용방식을 확인하실 수 있습니다.

## Conclusion
Next.js를 사용하면서도 React와 크게 다르지 않았다고 느낀 이유는, Next.js가 가진 이러한 장점을 십분 활용하지 못해서였다는 생각이 듭니다. 제가 회사에서 웹 페이지를 제작할 때 cesium.js라는 라이브러리를 사용한 적이 있습니다. 이는 지구를 그리고, 위성 데이터를 지구 위에 그래픽으로 나타내는 라이브러리입니다. 근데 cesium은 아직까지 ssr을 지원하지 않고, DOM을 필요로 합니다. 그래서 Next.js를 사용하면서 일부는 ssr을 사용하고 cesium.js를 사용하는 페이지에는 csr을 사용하였습니다. 제가 이렇게 분리해서 사용한 경험 외에도 Nest.js를 사용하면 더 최적화된 렌더링 패턴을 사용할 수 있고, 편하게 코딩하는 것보다 어느 순간에 어떤 렌더링 패턴을 사용하는 것이 좋을 지 고민해보는 시간을 가지고 사이트 제작을 시작해도 좋을 것 같습니다.
