---
title: "Formik을 사용해야 하는 이유"
category: "Library"
date: "2020-06-07 11:11:00 +09:00"
desc: "리액트에서 Formik으로 form을 관리해야 하는 이유를 알아보자"
thumbnail: "./images/formik/formik.png"
alt: "formik official thumbnail"
---

## Form

웹 페이지 개발 경험이 있다면, form을 만드는 것은 심심치 않게 접할 수 있습니다. HTML에도 내장 form 태그가 따로 있지만, 리액트에서는 기존 HTML form 태그와는 다른 방식을 권장하고 있습니다.

### React Forms : Controlled Component

HTML form 태그를 사용하게 되면, form 내부에서 state를 관리하게 됩니다.

```html
<form>
  <label>
    Name:
    <input type="text" name="name" />
  </label>
  <input type="submit" value="Submit" />
</form>
```

위 예시는 **[React 공식문서](https://reactjs.org/docs/forms.html)** 에서 나온 예시로, input에 값을 적으면 해당 value를 form 내부에서 관리하고, submit 시 새로운 페이지로 넘어가게 됩니다. 하지만 이는 리액트가 DOM element를 다루는 방식과는 차이가 있습니다. 리액트는 form을 사용할 때 form의 input value를 `setState()` 로 관리해서 개발할 때 직접 form data를 제어하는 방식을 권장하고 있고, 이를 **Controlled Component** 라고 합니다.

- **Uncontrolled Component:** 전통적으로 HTML에서 form을 입력받는 방식으로, value에 접근하기 위해서 ref를 사용해야 합니다.
- **Controlled Component:** 사용자가 input 값을 변경할 때마다 form도 업데이트되고, value는 state에 저장됩니다.

리액트에서는 form 태그를 아래와 같이 사용하는 것이 일반적입니다.

```typescript
import React, { useState } from "react"

const FormComponent = () => {
  const [inputValue, setInputValue] = useState<string>("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  } // store input value as a state

  const handleSubmit = () => {
    // submit logic here...
    console.log(inputValue)
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={inputValue} onChange={handleChange} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </>
  )
}

export default FormComponent
```

위의 예시는 가장 기본적인 예시이고, 실제로 우리가 form를 웹 개발을 하면서 사용할 때에는 각각의 다른 component에서 user가 입력하는 값을 저장해두었다가 최종적으로 한 곳에서 입력값들을 모아서 submit handling을 해야하는 경우들이 많습니다.  
즉, form을 사용하면서 전역 상태 관리를 함께 해야 하는 이슈가 생기는 것이죠. 그 때마다 `useState()`로 state을 관리하고, 상위 컴포넌트에서 `handleChange()` 함수를 넘겨주는 방식은 코드의 가독성을 떨어뜨립니다.

## Formik!

**[Formik 공식문서](https://formik.org/docs/overview)** 에서는 Formik이 가지는 장점을 아래와 같이 설명합니다.

1. Getting values in and out of form state: 값 상태 관리
2. Validation and error messages: 유효성 검사
3. Handling form submission: 제출 방식 제어

Formik은 단순히 input component 관리를 넘어서서 데이터의 흐름을 제어할 수 있는데 효과적이라고 표현합니다. Formik을 사용하면 마치 Context API를 사용하는 것처럼 form이 필요한 컴포넌트를 `<Formik>` 태그로 감싸주어 <code>props drilling</code> 없이 '컴포넌트 내에서 전역적으로 상태 관리'를 할 수 있습니다. 또한 form에서 늘 빠질 수 없는 유효성 검사까지 같이 해줄 수 있다는 장점이 있습니다. 또한, formik은 라이브러리 크기도 작습니다. (12.7KB when minified gzipped)  
그렇다면, 다른 다양한 form management library들이 있음에도 불구하고, formik을 사용해야 하는 이유는 무엇일까요?

## Let's try Formik

그럼 직접 React Typescript 환경에서 `Formik`을 사용해봅시다.

<iframe src="https://codesandbox.io/embed/xenodochial-currying-e8y8sw?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="xenodochial-currying-e8y8sw"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

<br>

- _출처: Formik 공식문서_

## Why not React-hook-form?

`React-hook-form`도 form management에 있어서 뛰어난 성능을 보여줍니다. 그래서 둘 중 어떤 것을 사용할 지 고민하고 사용할 필요가 있습니다. 다양한 기준을 가지고 `React-hook-form`과 `Formik`을 비교해봅시다.

### Bundle Size

**[Bundle Phobia: Formik](https://bundlephobia.com/package/formik@2.2.9)** 에 따르면, `Formik@2.2.9`버전 기준 번들 사이즈가 13KB로 기재되어있습니다 (minified+gzipped). 반면 **[Bundle Phobia: React-Hook-Form](https://bundlephobia.com/package/formik@2.2.9)** 은 `React-Hook-Form@7.31.3`버전 기준으로 번들 사이즈가 8.6KB입니다 (minified+gzipped).

### Dependency

Bundle Phobia에서 dependency에 대해서도 확인할 수 있는데요, Formik의 dependency는 총 **8개**입니다.

<img width="1343" alt="스크린샷 2022-06-09 오후 2 02 52" src="https://user-images.githubusercontent.com/81177665/172768290-d05192c2-3afa-432d-8558-9dd95ccce38d.png">

- 출처: Bundle Phobia

그에 반해 React-Hook-Form은 **dependency-free** 라는 장점을 가지고 있습니다.

<img width="1327" alt="스크린샷 2022-06-09 오후 2 04 32" src="https://user-images.githubusercontent.com/81177665/172768469-d69299cc-6100-43f7-bdb9-0b3dafa246d6.png">

- 출처: Bundle Phobia

### Rendering

렌더링 횟수는 웹의 Perfomance Optimization에 직결됩니다. `Formik`과 `React-Hook-Form`의 렌더링 횟수를 비교해봅시다.

아래는 `Formik`의 렌더링 횟수를 나타낸 코드입니다. 보시다싶이 `console`에서 렌더링 숫자가 입력할 떄마다 올라가는 것을 알 수 있습니다.

<iframe src="https://codesandbox.io/embed/cool-tess-9qym02?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="cool-tess-9qym02"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

<br>
<br>
<br>

아래는 `React-Hook-Form`의 렌더링 횟수를 나타낸 코드입니다. `React-Hook-Form`은 `Formik`에 비해서 렌더링 횟수가 적은 것을 보실 수 있습니다. 이는 **Uncontrolled Component** 와도 관련이 있는데, 이는 아래에서 설명하도록 하겠습니다.

<iframe src="https://codesandbox.io/embed/serverless-dawn-83fxen?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="serverless-dawn-83fxen"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### Controlled Component

제어가능한 컴포넌트인지 여부가 제가 생각하는 둘의 가장 중요한 차이점이 아닐까 하는 생각이 듭니다. `Formik`은 제어가능한 컴포넌트이기 때문에 아래 이미지와 같이 `onChange()`를 사용하고 `formik.values.email`로 값에 접근이 용이합니다.

<img width="323" alt="스크린샷 2022-06-10 오후 6 54 07" src="https://user-images.githubusercontent.com/81177665/173040605-0e594c94-2490-484d-bbd3-a176ed18b68e.png">

<br>

하지만, `React-Hook-Form`은 Uncontrolled Component 라는 특징을 가지고 있습니다. Uncontrolled Component는 React 코드와 non-React 코드를 통일하기 좋지만, 값을 제어하기 위해서는 ref를 사용해서 접근해야 합니다. 위에서 보여주었던 예시 코드에서도 ref를 사용해서 값에 접근하는 것을 알 수 있습니다. 물론, 나름의 방식(watch API) 를 사용해서 다른 Controlled Component들과 혼합해서 사용하는 것이 가능하지만, 권장하는 방식이 아니기 때문에, Controlled Component를 권장하는 `React` 환경이나 `ref`를 사용하기 어려운 환경에서는 적합한 라이브러리가 아닐 수 있습니다.

<img width="290" alt="스크린샷 2022-06-10 오후 8 36 28" src="https://user-images.githubusercontent.com/81177665/173056706-7ba7d5a6-0b54-4255-80a3-767ce32be3cd.png">

## State Management

form을 만들다 보면 하나의 form을 여러 컴포넌트에서 분리해서 값을 입력받고 다시 한 곳에서 모아서 데이터를 서버로 보내야 하는 상황이 생길 수 있습니다. 여기에서 저는 `Formik`의 힘이 발휘된다고 생각합니다.  
`Formik`에는 `useFormikContext()`라는 `React Context`를 사용한 커스텀 훅이 존재합니다. form을 넣고자 하는 컴포넌트들의 부모 컴토넌트를 `<Formik>` 태그로 감싸주면, `Context API`를 사용하듯이 내부에서 state 관리를 할 수 있습니다.  
하지만, `React-Hook-Form`은 자신이 만든 컴포넌트를 리덕스의 `connect`를 사용해서 리덕스와 연결해주는 방식입니다. 이는 최상단의 위치에서 관리할 필요없는 form state를 다른 state들과 함께 관리하게 되면서, 프로젝트 사이즈가 커질수록 리덕스가 비대해지고 관심사 분리에 취약해질 수 있다는 단점이 있습니다.

## Conclusion

모든 라이브러리나 프레임워크가 그렇듯이, 해당 라이브러리나 프레임워크가 만들어지는 목적에 부합하게 만들기 위해 어떤 기능은 장점이 극대화되고, 반대로 그 기능으로 인해 생기는 `side-effect`가 생기기도 합니다. `Formik`은 리액트가 권장하는 Controlled Component를 만드는 것에 힘썼다면, `React-Hook-Form`은 퍼포먼스 최적화에 힘을 실었다고 할 수 있습니다.
