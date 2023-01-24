---
title: "자바스크립트를 묶어야만 했던 이유"
category: "Library"
date: "2023-01-22 22:06:00 +09:00"
desc: "번들러의 탄생 배경과 각 번들러들을 비교해보자"
thumbnail: "./images/bundler/webpack.png"
alt: "webpack official thumbnail"
---

번들러가 왜 중요한 지는 이미 저도 알고 있고, 이 글을 읽는 사람도 알고 있습니다. 하지만 우리는 새로운 것을 만들 때, '이게 불편하다'를 느껴서 새로운 것을 만들지, '이게 중요할 것 같아서' 새로운 것을 만들지 않습니다. 불편함을 느끼고, 개선할 무언가를 만들어내고, 점차 중요함을 깨닫습니다. 그래서 저도 번들러의 중요성은 알지만, 옛 개발자들이 어떤 불편함을 느꼈기에 만들어야겠다고 결심했는지의 이유가 궁금했습니다. 그래서 번들러가 생겨난 이유와 현재 사용되고 있는 여러 번들러들을 비교해보고자 이 글을 쓰게 되었습니다.

## Six Connection Limit Per Origin

번들러가 왜 생겨났는지 알기 위해서는 HTTP/1.X Protocol에 대해 알아야합니다. HTTP/1.X는 직렬적으로 요청을 보내기 때문에, 충분히 넓은 대역폭 없이는 모든 요청을 마치기까지의 시간이 오래 걸리게 됩니다. 그래서 해결책으로, 브라우저는 각 도메인마다 병렬적으로 요청을 보낼 수 있도록 해줍니다. 처음에는 한 번에 2개에서 3개의 연결까지 가능했지만, 이제는 한 번에 6개의 병렬 연결이 가능합니다. 하지만 6개보다 더 많이 병렬적으로 연결하게 되면 서버에서는 현재 Dos 공격이 온 것이라고 판단하여 공격을 막으려는 움직임을 보일 수 있습니다. 그래서 한 번에 병렬적으로 최대 6개의 연결까지 가능한 것입니다. 이와 같은 병렬 연결의 좋은 점은 이러한 병렬 연결을 개발자들이 직접 관리할 필요없이 브라우저가 다 관리한다는 것입니다. 개발자의 관여가 필요없는 것이죠. 하지만 단점은, 6개는 여전히 적은 숫자라는 것입니다. **[HTTP Archive-State of the Web](https://httparchive.org/reports/state-of-the-web#pctHttps)** 에 따르면, 웹 한 페이지 당 리소스 요청 건수는 데스크탑 평균 70건, 모바일 평균 66건이라고 합니다. 이것도 이전보다 16% 가량 감소한 건수이기 때문에 이전에는 더 많은 요청을 하기도 했고, 웹이 복잡하고 리소스가 많이 필요할수록 요청 건수는 늘어날 수 있습니다.

<img width="1142" alt="total-resource-request" src="https://user-images.githubusercontent.com/81177665/213923543-48575c9e-ce09-4440-be68-6a65ed92e3c5.png">

*출처: HTTP Archive - State of Web*

그렇기 때문에 나온 방식이 Domain Sharding입니다. Domain Sharding에 대해서 더욱 자세히 알고 싶다면, **[MDN Web Docs-Connection management in HTTP/1.X](https://developer.mozilla.org/en-US/docs/Web/HTTP/Connection_management_in_HTTP_1.x)** 에서 Domain Sharding 챕터에서 더욱 자세하게 확인하실 수 있습니다. 간단하게 설명하면, www.example.com 이라는 하나의 도메인에서 모든 리소스를 관리하는 것이 아니라 도메인을 www.sharding1.example.com, www.sharding2.example.com 과 같이 나누지만 같은 서버로 가도록 하는 방법입니다. 이렇게 하면 각 도메인에서 6개의 병렬 연결을 할 수 있게 됩니다. 하지만, domain sharding도 장점만 있는 것은 아닙니다. 결국 다른 도메인 이름을 하고 있기 떄문에, DNS는 각 도메인을 전부 살피며 IP로 변환하여야 합니다. 그리고 각 도메인마다 추가적으로 소켓도 사용해야 합니다. 그렇기 때문에 도메인을 남용하는 것은 오히려 필요 이상의 TCP 커넥션을 유발하여 사용자로 하여금 더 느리다고 느끼게끔 만들 수도 있습니다. 그래서 HTML, CSS, JS와 같은 code 파일, 사진, 음악, 영상과 같은 asset 파일 전부 서버와 TCP/IP 커넥션을 통해 가져와야 하기 때문에, Domain Sharding을 하기 전에 요청 횟수를 줄이는 것이 최선책이었습니다. 그래서 등장한 개념이 바로 번들러입니다. HTML를 파싱하는 와중에 <code>\<script></code> 태그 내부에 자바스크립트 파일이 여러개라면 그만큼 서버에 파일을 요청해야 하지만, 자바스크립트 파일이 하나로 묶여있다면 한 번에 원하는 코드를 전부 가져올 수 있기 때문입니다.

## Bundler
첫 번들러가 세상에 나온 것은 2013년, Browserify의 출시입니다. 사실 Browserify는 번들러의 역할로 시작한 것은 아니었습니다. Node.js가 2009년에 출시되면서 개발자들은 Node에서 사용한 코드를 browser에서도 그대로 재사용하고 싶어했습니다. 하지만 Node.js에서 사용하는 <code>require</code>이라는 메소드가 브라우저에는 없어서 읽히지 않는 문제점이 있었습니다. 그래서 Browserify는 '브라우저에서도 Node.js의 <code>require</code>문법을 그대로 사용할 수 있도록 해주겠다'는 의도로 출시되었습니다. 그래서 이름도 Browserify, require 문법을 '브라우저화' 해주겠다는 것이었죠.

<img width="913" alt="스크린샷 2023-01-23 오전 3 10 39" src="https://user-images.githubusercontent.com/81177665/213932559-f43580d4-a479-4a02-8fb6-a0233a975fc6.png">

*출처: Browserify 공식 문서*

<br>

지금은 위 사진처럼 'by bundling up all of your dependencies'라는 문구로 번들러임을 명확하게 보여주지만, 초기 Browserify 의 캐치프레이즈(catchphrase)는 아래와 같이 브라우저에서 require 메소드를 쓸 수 있게 해주겠다는 것을 강조했습니다.

> Browserify require('modules') in the browser

Browserify은 commonjs 모듈 방식이 브라우저에서도 작동할 수 있도록 해주었습니다. 그 방법은 개발자가 모듈이나 자바스크립트 파일을 require하면, 그에 따른 의존성 트리를 크롤링 하고 하나의 번들로 만들어주는 것이었습니다. 이것이 번들링의 시초입니다.

## Use of Webpack
2013년에 리액트가 등장하면서 Webpack도 2014년에 출시됩니다. 이전보다 더 사용자와 개발자에게 편리한 방법을 찾다보니, 여러 라이브러리들과 디자인 패턴이 생겨났기 때문입니다. 특히 리액트에서는 이전 디자인 패턴들과 다르게 단방향 데이터 흐름을 추구하기 시작했고, <code>jsx</code>라는 새로운 문법도 세상에 선보였습니다. 그렇기 때문에 이전보다 더 변환 작업이 필요해졌고, 바벨과 같은 트랜스파일러로 <code>jsx</code>를 <code>js</code>로 변환하였습니다. 이러한 것들을 해결해줄 수 있는 라이브러리가 웹팩입니다.

<br>

Webpack은 Browserify처럼 모듈을 가져오는데 생기는 문제점들을 해결해주고, 파일들을 읽어와서 의존성 그래프를 생성해줍니다. 그 의존성 그래프는 자바스크립트에만 국한되는 것이 아니라, 모든 code와 asset(CSS, images, SVGs, HTML, etc.)을 마치 자바스크립트 파일을 하나로 뭉치는 것처럼 똑같이 적용합니다. 즉, 웹팩을 어플리케이션에서 실행하면, 하나 또는 여러 개의 <code>entry points</code>에서 의존성 그래프를 만들어 내고 어플리케이션 내에서 필요한 모든 모듈들을 합쳐서 하나 또는 여러 개의 <code>bundles</code>로 합칩니다. 흔히 쉽게 오해하는 부분이 Webpack을 마치 Gulp나 Grunt처럼 task runner의 용도로 사용하는 경우가 있습니다. 하지만 **[Webpack 공식문서](https://webpack.js.org/guides/integrations/)** 에 따르면, Webpack을 task runner의 용도로 사용하는 것을 권장하지 않습니다. 다만 task runners와 bundlers를 올바른 방법으로 융합해서 사용한다면 좋은 효과를 가져올 수도 있음을 강조했습니다. 해당 내용에 관련해서는 나중에 기회가 된다면 다른 글로 자세히 정리하겠습니다.

> Let's start by clearing up a common misconception. Webpack is a module bundler like Browserify or Brunch. It is not a task runner like Make, Grunt, or Gulp. Task runners handle automation of common development tasks such as linting, building, or testing your project. Compared to bundlers, task runners have a higher level focus.

Webpack이 어떤 역할을 하고 있는지 위에서 설명하였으므로, Webpack이 어떤 원리로 작동하는 지 알아보겠습니다. 웹팩을 사용하기 전에 가장 근본적인 웹팩의 컨셉부터 이해해야 합니다. 웹팩에는 <code>Entry</code>, <code>Output</code>, <code>Loaders</code>, <code>Plugins</code>, <code>Mode</code>, <code>Browser Compatibility</code>, <code>Environment</code>와 같은 개념이 있습니다.

### Entry

<code>Entry point</code>는 웹팩이 의존성 그래프를 어디서부터 만들기 시작해야 할지 지정해주는 것입니다. 해당 entry point가 직접적으로 혹은 간접적으로 어떤 라이브러리나 모듈에 의존하고 있는지 찾아냅니다. entry points는 하나가 아니라 여러개일 수도 있습니다.
아래와 같이 시작했으면 좋겠는 경로를 적어줄 수 있고, 기본값(default)은 <code>'./src/index.js'</code>입니다.

```javascript
// single main entry
module.exports = {
  entry: './pathname/index.js' // 예시 경로입니다.
}

// multi main entry
module.exports = {
  entry: ['./pathname/index.js', './pathname/index2.js'],
}

// object entry
module.exports = {
  entry: {
    main: './pathname/main.js',
    admin: './pathname/admin.js',
  }
}

```

### Output
<code>Output</code>은 웹팩이 새롭게 만든 bundles를 어느 경로에, 어떤 이름으로 저장할 것인 지 지정하는 것입니다. main entry point에서부터 나온 bundles는 기본적으로 <code>'./dist/main.js'</code>에 담기고, 다른 파일들도 기본적으로는 <code>'./dist'</code> 안에 생성됩니다.

```javascript
const path = require('path');

module.exports = {
  entry: './pathname/index.js'  // 예시 경로입니다.
  output: {
    path: path.resolve(__dirname, 'dist'),  // output 디렉토리 이름을 dist로 설정
    filename: 'webpack.bundle.js'  // dist 안에서 파일 이름은 webpack.bundle.js로 설정
  }
}

// multi entry point
module.exports = {
  entry: {
    main: './pathname/main.js',
    admin: './pathname/admin.js',
  },
  output: {
    filename: '[name].js',  // entry points 에 맞춰서 unique한 output filename 지정
    path: __dirname + '/dist',
  },
};

```

### Loaders
Webpack은 실제로는 자바스크립트 파일과 JSON 파일밖에 이해하지 못합니다. 그래서 Loaders를 이용해서 자바스크립트와 JSON이 아닌 다른 파일들을 어플리케이션에서 사용 가능한 유효한 모듈 형태로 변환한 뒤, 의존성 그래프에 추가합니다. Loaders 에서는 변환되어야 할 파일이 어떤 파일인지 찾는 <code>test</code> 프로퍼티와 해당 파일을 변환하기 위해 어떤 loader를 사용해야 하는 지 명시하는 <code>use</code> 프로퍼티를 사용할 수 있습니다. 아래 예시를 통해 확인해봅시다.

```javascript
module.exports = {
  module: {
    rules: [
      { test: /\.css$/, use: 'css-loader' }, // 정규표현식 .css를 통과하는 파일은 css-loader를 사용하여 변환
      { test: /\.ts$/, use: 'ts-loader' },
    ]
  }
}
```

위 예시에서 적힌 내용은 Webpack 공식문서에 따르면 이렇게 해석할 수 있습니다.

> "Hey webpack compiler, when you come across a path that resolves to a '.css' file inside of a require() / import statement, use the <code>css-roader</code> to transform it before you add it to the bundle."

### Plugins
다양한 종류의 플러그인들은 웹팩을 더욱 강력하게 만들어줍니다. 마치 우리가 특정 기능을 하는 라이브러리를 밖에서 import해와서 쓰듯이, 웹팩에서도 플러그인을 require() 구문을 통해 들고 오면, 웹팩 내에서 bundle optimization, asset management, injection of environment variables 와 같은 기능들을 구현할 수 있습니다.

<br>

플러그린을 사용하기 위해서는 위해서 설명했다시피, require() 구문을 통해 가져오고, plugins 배열 안에 넣습니다. 그리고 플러그인 인스턴스를 생성하기 위해 <code>new</code> 연산자를 사용하여야 합니다. 아래 예시를 통해 살펴봅시다.

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  module: {
    rules: [{ test: /\.txt$/, use: 'raw-loader' }],
  },
  plugins: [new HtmlWebpackPlugin({ template: './src/index.html' })],
};
```

## Bundler Comparison

<img width="1342" alt="스크린샷 2023-01-24 오전 10 52 09" src="https://user-images.githubusercontent.com/81177665/214196792-b0265eab-3f9a-451a-b715-5075a57e594c.png">

*출처: NPM Trends*

<br>

Webpack 이후에도 많은 번들링 라이브러리가 나왔습니다. 위 사진에서 최근 1년 간의 번들링 도구 트렌드를 살펴봅시다. 아직까지 Webpack의 사용률이 가장 높습니다. 하지만 그래프를 통해 <code>esbuild</code> 가 가파른 성장세로 쫓아오는 것을 볼 수 있습니다. 그렇다면, 본인이 개발하는 프로젝트에 어떤 번들러가 가장 좋을 지 확인하려면 어떤 기준으로 결정해야 할까요?

### Configuration

번들러를 사용하기 전에 미리 configuration file을 설정해줘야 하는 경우와 그렇지 않은 경우가 있습니다. 예를 들어 <code>Webpack</code>과 <code>Rollup</code>은 config file을, <code>esbuild</code>는 build script를 작성하지만, <code>Parcel</code> 은 <code>zero-config</code>로, 별다른 설정을 요구하지 않습니다. 참고로 <code>Rollup</code>은 <code>Webpack</code> 과 다르게 config file을 작성할 때 <code>import/export</code> 를 사용할 수 있고, 상대 경로를 지정해줄 수 있습니다.

### Entry Points
어디서부터 번들링을 시작할 지를 지정해주는 Entry Points가 <code>Webpack</code>에서는 자바스크립트 파일만 가능합니다. 물론 <code>Webpack</code>은 플러그인이 많기 때문에 html 파일과 같이 다른 유형의 파일을 시작점으로 설정하고 싶다면, 그에 맞는 플러그인을 사용해주면 됩니다. <code>Rollup</code>도 마찬가지로 html 파일을 시작점으로 설정하고 싶다면, <code>rollup-plugin-html-entry</code> 라는 플러그인을 설치해주어야 합니다. 하지만 <code>Parcel</code>은 <code>index.html</code>을 시작점으로 둘 수 있고, <code>Parcel</code>이 알아서 <code>\<script></code> 태그를 읽어와서 어떻게 번들을 만들 지 찾아냅니다.

### Transformation
모듈 번들러들은 번들링 작업을 하기 위해서는 꼭! 자바스크립트 파일이어야 합니다. 그렇기 때문에 자바스크립트가 아닌 다른 파일을 번들링하기 위해서는 먼저 자바스크립트 파일로 변환하는 과정이 있어야 합니다. <code>Webpack</code>은 이를 변환하기 위한 여러 loaders를 갖추고 있습니다. 어떤 파일에 어떤 타입의 loader를 사용할 건지 지정해주기만 하면 됩니다. <code>Rollup</code>은 변환 작업을 거치기 위해 plugins를 사용하고 있고, config file을 만들 떄 <code>import</code>해오면 됩니다. <code>Parcel</code>과 같은 경우에는 config file이 없기 때문에 <code>.babelrc</code>나 <code>.postcssrc</code>와 같은 config file을 만나면 자동적으로 변환을 시작합니다.

### Tree Shaking
트리 셰이킹이란, 사용하지 않고 있는 코드를 제거하는 것입니다. 웹팩에서는 <code>UglifyJSPlugin</code>와 같은 minifier를 써서 트리셰이킹을 할 수 있습니다. <code>Rollup</code>은 import 해온 모듈들을 파악하여 사용하지 않은 코드들은 제외합니다. 하지만 <code>Parcel</code>은 아직 트리 셰이킹을 지원하지 않습니다.

### Code Splitting
<code>Code Splitting</code>은 많은 코드를 가져와서 실행시킬수록 오래 걸리기 때문에, 코드를 더 작은 단위의 chunk로 쪼개어서 그 순간에 필요한 코드들만 load하는 방식입니다. 그리고 나중에 관련 코드들이 필요해지면 나머지 코드를 fetch해옵니다. <code>Webpack</code>에서는 <code>code splitting</code>하는 방법이 세가지가 있습니다. 우선 entry points를 다르게 준다면 수동적으로 개발자가 코드를 나눌 수 있습니다. 아니면 <code>CommonsChunkPlugin</code>과 같은 플러그인의 도움을 받을 수도 있습니다. 마지막으로는 모듈을 동적으로 불러오는 방식입니다.

```html
<!doctype html>
<script>
  async function handleClick() {
    let say = await import('./event.js');
    event.click(); // alert('클릭하셨습니다')
  }
</script>
<button onclick="handleClick()">Click</button>
```

위와 같이 모듈을 inline으로 필요할 때 불러오는 방식을 활용한다면, webpack에서 알아서 chunk를 쪼개어줍니다. 이는 <code>webpack-bundle-analyzer</code> 라이브러리를 통해서 확인할 수 있습니다. (React에서는 <code>React.lazy</code>)로 <code>Dynamic Imports</code>를 할 수 있습니다. <code>Rollup</code>에서는 <code>experimentalCodeSplitting</code>와 <code>experimentalDynamicImport</code> 플래그를 <code>true</code>상태로 해둔다면, <code>code splitting</code>을 진행할 수 있습니다. <code>Parcel</code>은 위에서도 언급한 바와 같이 별다른 설정 없이도 <code>code splitting</code>을 지원합니다. <code>Dynamic Imports</code>를 사용하여 비동기적으로 모듈을 불러오기만 한다면, <code>Parcel</code>에서 알아서 코드를 chunk 단위로 쪼개주는 것입니다.

<br>

### Webpack vs. esbuild

<code>esbuild</code>는 차세대 번들러입니다. 위 그래프에서 봤듯이 유일하게 성장세를 보이고 있습니다. <code>esbuild</code>가 많은 사랑을 받게 된 이유는 다름 아닌 속도 때문입니다. **[esbuild 공식문서](https://esbuild.github.io/)** 를 살펴보면, 'An extremely fast bundler for the web'라고 나와 있고, 아래 사진에서 <code>esbuild</code> 가 얼마나 빠른 지를 보여주고 있습니다.

<img width="835" alt="스크린샷 2023-01-24 오전 11 15 15" src="https://user-images.githubusercontent.com/81177665/214199158-e370d5a6-8d89-418e-8cb7-00029688fb9c.png">

*출처: esbuild 공식 문서*

<br>

<code>esbuild</code>가 이토록 빠르게 build할 수 있었던 것은 GO 언어로 작성되어 있기 때문입니다. 하지만 <code>esbuild</code>가 아직 <code>Webpack</code>보다 사용률이 적은 이유는 아직 나온 지 얼마 되지 않아 안정적으로 사용하기에는 시간을 두어야 한다는 입장일 수 있고, <code>Webpack</code>의 방대한 plugin도 <code>Webpack</code>이 가진 큰 장점이기 때문입니다. 하지만, <code>Webpack</code>의 안정성과 큰 커뮤니티, 방대한 plugin을 사용하면서 esbuild의 속도도 추구하고 싶다면, 둘 다 사용하면 됩니다! <code>Webpack</code>에도 es-loader가 있기 때문입니다. <code>Webpack</code>의 커뮤니티가 큰 만큼, 많은 사람들이 원하는 기능이 있을 경우, 해결책이 빠르게 제시되기 때문에 이런 융합이 가능하다고 생각합니다.

## Conclusion
언제나 그랬듯이, 어떤 한 번들러가 압도적으로 장점만을 가지고 있는 것은 아닙니다. 맨 첫 줄에서 설명한 바와 같이 '이게 중요하겠구나'라는 생각에서 개선점이 나오는 것이 아니라, '이게 불편하네'라는 생각에서 개선점이 나옵니다. <code>Parcel</code>과 같이 <code>zero-config</code> 번들러가 나왔다는 것은 설정 파일을 매번 만들어주어야 하는 것을 불편하다고 느낀 사람들이 있기 때문입니다. 실제로도 <code>Webpack</code>의 러닝 커브가 높습니다. 그렇기 때문에 그 많은 plugin들을 적절하게 활용하고 세팅해주는 것은 간단한 프로젝트에서 오버스펙일 수도 있습니다. 그래서 입문이나 초보자, 개인 프로젝트에는 <code>Parcel</code>이 좋은 선택지로 떠오르기도 합니다. 무조건 많이 쓰는 거나 커뮤니티가 큰 것을 쓰는 게 아니라, 내가 어떤 지점에서 '이게 불편하네'를 느끼는 지 고민해보고 그것을 기준으로 선택해나가는 것도 좋을 것 같습니다.