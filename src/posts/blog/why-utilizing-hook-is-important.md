---
title: "리액트 훅을 적극적으로 사용하는 것이 중요한 이유(1)"
category: "React"
date: "2022-09-02 19:11:00 +09:00"
desc: "왜 우리는 useState와 useEffect만 사용하는가: 렌더링 최적화"
thumbnail: "./images/react/react.png"
alt: "react official thumbnail"
---

## Hooks

리액트를 배울 떄, 가장 먼저, 가장 여러 번 접하는 개념이 `useState`와 `useEffect`입니다. 처음에는 이해하는데 어려움을 느꼈지만, 한 번 이해하고 난 이후부터는 깊게 생각하고 코드를 짜지 않을 때 두 hooks를 남용했습니다. 그리고 많은 코드에서 `useState`와 `useEffect`를 무분별하게 사용하는 것을 볼 수 있습니다.
<br>

왜 대부분의 코드에서 해당 hooks를 계속 발견하게 되는 것일까요? 그 이유는 다른 hooks를 찾아서 활용해보는 노력을 기울이지 않더라도, 두 hooks만으로도 원하는 기능의 80-90%는 구현할 수 있기 때문입니다. 하지만 렌더링 최적화나 메모이제이션에 대해서 조금이라도 더 고민해보게 된다면, 다른 hooks들이 조금씩 눈에 띄게 됩니다. 이번 글에서는 `useState`와 `useEffect`를 제외한 다른 hooks들을 활용하는 방법에 대해 알아볼 예정입니다.
<br>
(`useMemo`와 `useCallback`은 다음 글에서 다루도록 하겠습니다.)

### Provided React Hooks

리액트는 기본적으로 훅을 제공하기도 하고, 사용자가 입맛에 맞게 훅을 만들어서 사용(`Custom Hook`)할 수도 있습니다. 리액트 내장 훅들 중 가장 많이 사용되고 있는 `useState`와 `useEffect` 이외에도 유용하게 쓰일 수 있는 Hooks의 종류에는,
<br>

- ▫️ useContext
- ▫️ useReducer
- ▫️ useRef
- ▫️ useCallback (다음 글에 게재)
- ▫️ useMemo (다음 글에 게재)

<br>
등이 있습니다.

### useContext: As a Component Level Redux

웹 개발을 하다보면, 여러 페이지를 넘나들면서 상태관리를 하게 됩니다. 이 때 `props drilling`을 피하기 위해서 상태관리 라이브러리를 활용하게 되는데요, 그 중 가장 많이 사용해오던 라이브러리가 `Redux`입니다. 하지만 실제로 개발할 때, 모든 컴포넌트와 페이지를 넘나들면서 상태를 관리해야 하는 경우는 `User Authorization` 나 `Dark Mode` 정도고, 컴포넌트 레벨에서 상태를 관리하는 경우도 많습니다. 이럴 때 컴포넌트 레벨의 상태를 최상단에서 관리하게 되면, Redux 스토어가 비약적으로 커지는 상황이 발생할 수 있습니다. 그래서 이를 혼용해서 사용할 때, `centralized state`는 Redux로, 페이지나 컴포넌트 내부에서 관리하는 상태는 `Context API`를 사용할 수 있습니다. (Context API는 `useContext`와 `useReducer`를 함께 사용합니다.)

<br>

리덕스는 최상단의 `index.tsx` 를 리덕스 `Provider`로 감싸줌으로써, 그 내부에 있는 모든 페이지와 컴포넌트에서 리덕스의 state 사용이나 dispatch가 가능해지고, 대신 state 값이 변하면 해당 state와 관련이 있는 컴포넌트만 추려져서 렌더링됩니다. 이 글은 Hook에 관련된 글이므로 `Context API` 예시 코드를 작성해보겠습니다.

<iframe src="https://codesandbox.io/embed/fancy-sound-qqegio?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="fancy-sound-qqegio"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

<br>
<br>

이 때, `useContext`를 활용한 `Context API`와 `Redux`를 아예 같은 기능을 한다고 보거나, 하나가 다른 하나를 대체할 수 있을까요? 우선 공통점을 이야기하자면,
<br>

- ✅ Props drilling: 두 경우 모두 props drilling을 막을 수 있습니다.
- ✅ Flux Pattern: action 과 reducer가 존재하면서 두 경우 모두 Flux 패턴을 따르는 것을 알 수 있습니다.
- ✅ Decoupling: UI 와 상태 관리 로직을 따로 둠으로써, 관심사 분리를 할 수 있습니다.

<br>

와 같은 특징을 들 수 있습니다. 하지만, 고려해야 하는 차이점들도 많은데요, 예를 들면,

1] Rendering
<br>

가장 중요한 차이점입니다. `Redux`는 현재 store에 저장되어 있는 instance를 넘겨주는 방식이기 때문에 그 state를 사용하는 **'관련된 컴포넌트'** 만 다시 렌더링 하지만, `Context API`는 `Provider` 안에 속해있는 모든 컴포넌트가 리렌더링 됩니다. 왜냐하면, `Context API`는 state를 업데이트하고, state가 바뀌는 것은 리액트의 리렌더링 조건에 부합하기 때문입니다. 해당 내용은 **[React 공식문서](https://reactjs.org/docs/context.html)** `Context.Provider`에서 살펴볼 수 있는데요,

> All consumers that are descendants of a Provider will re-render whenever the Providers's value prop changes. The propagation from Provider to its descendant consumers is not subject to the `shouldComponentUpdate` method, do the consumer is updated even when an ancestor component skips an update

라고 적혀있습니다. 즉, `Context API`를 컴포넌트 레벨에서 사용하는 것이 아니라 global manner 로 사용하게 된다면, 불필요한 렌더링이 계속 일어날 수 있습니다.
<br>

2] Side Effect
<br>
`Redux`는 미들웨어를 사용하면서 조금 더 효과적으로 side-effect를 제어할 수 있지만, `Context API`는 `useEffect`로 제어하게 됩니다.
<br>

3] Dependency
<br>
리덕스는 라이브러리이기 때문에 자바스크립트에서도 사용할 수 있는 대신, 사용하기 위해서는 `Redux`를 깔아야 한다는 단점이 있습니다. 반대로 `Context API`는 리액트에 내장된 hooks를 활용하는 것이기 때문에 dependency-free 이지만, 다른 프레임워크나 라이브러리, 자바스크립트에서는 사용할 수 없습니다.

### useReducer: Effective State Management

방금 위에서 `Context API`를 만들기 위해 `useReducer`를 활용했지만, 그 이외에도 state 관리를 효율적으로 하기 위해서 활용할 수 있습니다. 전역 상태관리가 아닌 useState 로 여러 개의 상태를 제어한다고 했을 때 `useReducer`가 렌더링 횟수에 더 효과적일 수 있습니다. `useReducer`는 상태가 복잡해지면 사용해야 한다고 생각하는 사람들도 있지만, 꼭 그런 것만은 아닙니다. `useReducer`의 특징을 잘 활용하면 하나의 state도 효과적으로 관리할 수 있습니다. 예를 들어봅시다.

토글 버튼을 만드는 경우에 useState를 사용한다면,

<iframe src="https://codesandbox.io/embed/dawn-thunder-xqjfbi?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="dawn-thunder-xqjfbi"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

<br>
<br>

라고 코드를 짤 수 있습니다. 토글하는 기능을 담은 함수를 따로 만들어서 `onClick` 함수에 넣어주게 되면, state와 state 변경 로직이 분리되어 있기 떄문에 코드 가독성이 떨어질 수 있습니다. 하지만 `useReducer`를 활용하게 된다면,

<br>

<iframe src="https://codesandbox.io/embed/stoic-wescoff-6zf4tv?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="stoic-wescoff-6zf4tv"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

<br>
<br>

위와 같이 코드를 짜게 됩니다. dispatch인 toggleButton 함수와 initialState, 그리고 reducer function까지 한 곳에 모여있기 떄문에 내가 아닌 다른 사람이 코드를 보더라도 한 눈에 파악할 수 있고, 코드 가독성이 좋아집니다.
<br>

위와 같은 간단한 코드 이외에도 복잡한 상태 관리에서 `useReducer`는 더 큰 힘을 발휘합니다. 복잡한 상태관리라 함은, 아래와 같은 두가지 경우를 들 수 있습니다.

- ✅ 객체의 상태 변화를 다뤄야 하는 경우
- ✅ 유저 인터랙션이 다른 상태를 변화시킬 경우
  <br>

객체의 상태 변화 방식이 다양할 경우에, useState를 사용하면 어떤 식으로 표현할 수 있는지 알아봅시다.

<iframe src="https://codesandbox.io/embed/great-pasteur-xzezpu?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="great-pasteur-xzezpu"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

<br>
<br>

위 코드와 같이 useState로 객체를 생성해준뒤, input 값이 바뀔 때마다 객체의 해당 property를 업데이트해주는 방식이 있습니다. 이를 useReducer로 관리하는 방법에 대해서도 알아봅시다.

<iframe src="https://codesandbox.io/embed/jolly-andras-id6025?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="jolly-andras-id6025"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>
  
<br>
<br>

위와 같이 `useReducer`를 사용하면, dispatch와 reducer 를 사용하면서 form 업데이트에 사용하는 함수들을 용이하게 한 곳에 관리할 수 있고, 코드가 길어질 수록 가독성에 도움을 줍니다.

<br>

유저의 인터랙션이 다른 곳에서 상태를 변화시킨다는 것은 위에서 설명한 `Context API` 에서 `useReducer`를 사용하는 것과 비슷한 개념입니다. setState가 들어있는 callback function을 컴포넌트의 props로 계속 넘기는 것보다 `useReducer`를 활용하면 `callback` 함수 대신 `dispatch` 함수를 전달할 수 있고, 리액트 공식문서에서는 아래와 같은 내용을 보장한다고 적어두었습니다.

> React guarantees that dispatch function identity is stable and won't change on re-renders. This is why it's safe to omit from the useEffect or useCallback dependency list.

deep update가 있는 컴포넌트에서 `dispatch`의 사용은 리렌더링의 영향을 받지 않기 때문에 성능 향상도 기대할 수 있습니다.

### useRef: DOM Accessment

`useRef`는 DOM Element에 접근할 때 가장 많이 활용하지만, 리액트의 원리를 이해하고 나면 오히려 `useRef`를 효율적인 리렌더링을 위해 활용할 수도 있습니다.

<br>

아래와 같은 방법이 `useRef`를 사용하여 DOM Element에 접근하는 일반적인 방법입니다. `useRef`를 사용해서 `.current` 값이 선언된 객체를 돌려받으면 내부 property들을 제어할 수 있습니다. (mutable)

<iframe src="https://codesandbox.io/embed/beautiful-ishizaka-ufmbp9?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="beautiful-ishizaka-ufmbp9"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

<br>
<br>

그런데 `useRef`가 활용도가 높은 이유는, 단순히 DOM Element에 접근하는 용도로 사용하는 것이 아니라, current 객체를 제어하는 데에 있습니다. `useRef`를 통해 만들어지는 current 객체는 우리가 알고 있는 자바스크립트 객체인데, 직접 객체를 만드는 것과 다른 것은 `useRef`로 생성된 current 객체는 내부 property 값이 변경되어도 리렌더링되지 않습니다. 우리는 리렌더링할 필요가 없는 값들까지 useState에 저장해서, 불필요한 렌더링을 늘립니다. 하지만 **변한 값은 저장하되, 값이 변경되었다고 렌더링되는 것까지는 원치 않을 때** `useRef`를 적극 활용할 수 있습니다. 예를 들어, 아래와 같은 검색창을 만든다고 가정해봅시다.

<iframe src="https://codesandbox.io/embed/vigorous-bartik-dv028p?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="vigorous-bartik-dv028p"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

<br>
<br>

검색창에 자동완성 기능이 있는 경우에는 useState로 매번 렌더링을 해줘야하지만, 자동완성 기능 없이 마지막에 search 버튼을 눌렀을 때만, value를 확인한다면, 매번 value가 변할 때마다 리렌더링을 할 필요가 없습니다. 위 코드에서 콘솔창을 열어서 확인해보면, value가 첫 렌더링 이후, search 버튼을 눌러야지만 값이 변해서 렌더링되는 것을 확인할 수 있습니다.

<br>

DOM Element를 접근하지 않더라도 렌더링을 효율적으로 해야 하는 곳에 다양하게 활용할 수 있습니다. 마치 클래스의 인스턴스를 활용하는 것처럼 current 객체에 값을 담을 수 있는데, 코드에서 아무리 여러번 ref 객체에 접근해서 값을 바꾸어도 렌더링에 영향을 미치지 않습니다.

<iframe src="https://codesandbox.io/embed/wizardly-cookies-8uh9oj?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="wizardly-cookies-8uh9oj"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

<br>
<br>

예를 들어 위 코드는 `useRef`를 사용하여 객체를 업데이트하였습니다. `useState`를 사용해서 객체를 업데이트 하는 것보다 렌더링 횟수를 줄일 수 있고, 실제로 UI상의 리렌더링이 필요한 경우가 아니기 때문에 이런 경우에는 `useRef`를 활용하여 렌더링 최적화에 더 가까워질 수 있습니다.

## Conclusion

`useState`와 `useRef`는 리액트를 사용하면서 가장 많이 활용하게 되는 Hook입니다. 하지만, 리액트를 계속 접하다보면 렌더링 최적화나 Hook의 올바른 쓰임에 대해 고민하게 되고, 더 효율적으로 동작하는 웹사이트를 만들기 위해 욕심내게 됩니다. 개발을 시작한지 얼마 되지 않았다면, 두가지 훅을 완벽하게 숙지하면서 '완성'에 목표를 두는 것도 좋은 공부 방법이지만, 리액트 공식문서 내용을 자주 살펴보면서 리액트가 주는 다양한 기능들을 최대한 활용하면서 개발하는 것도 성장할 수 있는 좋은 방법인 것 같습니다. 이번 글에서 다룬 Hooks들은 렌더링 최적화에 초점을 맞추었습니다. 다음 글에서는 메모이제이션을 중심으로 글을 다룰 예정입니다.
