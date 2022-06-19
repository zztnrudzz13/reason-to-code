---
title: "컴포넌트 설계가 중요한 이유"
category: "React"
date: "2022-06-17 21:02:00 +09:00"
desc: "개발을 할 때 컴포넌트를 설계하는 것이 중요한 이유를 알아보자"
thumbnail: "./images/react/react.png"
alt: "react official thumbnail"
---

## Component?

개발을 처음 시작했을 때, '컴포넌트 설계'라는 개념이 있는지조차 몰랐습니다. 웹 사이트를 바라볼 때, '이쯤이면 하나의 구역으로 나눌 수 있겠다'라는 생각이 들면 단순히 감으로 컴포넌트의 기준을 나누고는 했습니다. 또한, 하나의 프로젝트를 완성해 본 경험이 해커톤이었다보니, 시간 안에 완성하는 데에 가장 초점이 맞추어져 있었습니다. 당시에는 API URL을 따로 뺄 수 있는 지도 몰랐었기 때문에 늘 `jsx` 페이지 상단에 API URL을 const로 적어놓고, URL이 바뀌면 모든 페이지에 들어가서 고쳤던 경험도 있습니다.  
회사에서 코드를 짜면서 '코드는 적는 순간 레거시이다'라는 말을 실감하고 나니, 컴포넌트 설계가 왜 중요한지, decoupling and reusing component가 왜 필요한지 깊이 느꼈습니다. 이 글을 통해서 컴포넌트 설계의 중요성과 방법에 대해 정리해보려고 합니다.

## Component!

컴포넌트라는 개념은 렌더링과 밀접한 관련이 있습니다. 리액트는 Virtual DOM을 통해서 기존 DOM과 달라진 부분만 렌더링하는 방식이기 때문에, 컴포넌트 설계를 잘 한다면, 렌더링 횟수나 최적화에도 도움이 될 수 있습니다. **[React 공식문서](https://reactjs.org/docs/components-and-props.html)** 에서는 Component에 대해서 아래와 같이 설명하고 있습니다.

> Components let you split the UI into independent, reusable pieces, and think about each piece in isolation.

위의 문장에서 알 수 있듯이, 컴포넌트는 독립적이고, 재사용성이 높고, 관심사가 분리되어 있는 형태로 만들어야 합니다. 그렇다면 컴포넌트를 감이 아니고 어떠한 기준으로 디자인할 수 있을까요?

### Single Responsibility

제가 느끼기에 레거시 코드를 업데이트할 수 있는 가장 좋은 방법은 파일마다 최대한 `Single Responsibility`를 부여하는 것입니다. 제가 처음으로 `React Native`로 앱을 만들었을 당시에 짠 코드를 예시로 살펴보겠습니다. 고쳐야 할 게 정말 많은 코드이지만 컴포넌트 설계 측면에서 개선점을 바라봅시다.

```javascript
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import React, { useEffect, useState } from "react"
import { View, Text, SafeAreaView, Image } from "react-native"
import styled from "styled-components"

const ProfileContainer = styled.View`
  width: 100%;
  height: 70px;
  display: flex;
  flex-direction: row;
`

const ProfileImageContainer = styled.View`
  width: 28%;
  justify-content: center;
  align-items: center;
`

const ProfileImageSkeleton = styled.View`
  width: 50px;
  height: 50px;
  background-color: #d9d9d9;
  border-radius: 40px;
`

const ProfileImage = styled.Image``

const ProfileTextContainer = styled.View`
  width: 70%;
  justify-content: center;
  padding-left: 5px;
`

const FixedText = styled.Text`
  color: #707070;
`

export default function CustomDrawerContent(props) {
  const [data, setData] = useState("")
  const [loadingUser, setLoadingUser] = useState(true)

  // 토큰 획득
  async function getToken() {
    const token = await AsyncStorage.getItem("StorageKey")
    return token
  }

  const url =
    "http://spplitsuccess.eba-xefre73m.us-west-2.elasticbeanstalk.com/user"

  useEffect(() => {
    async function getData() {
      const USER_TOKEN = await getToken()
      const AuthStr = "Token ".concat(USER_TOKEN)
      axios
        .get(url, { headers: { Authorization: AuthStr } })
        .then(response => {
          setData(response.data)
          console.log(response.data)
        })
        .finally(() => setLoadingUser(false))
        .catch(error => {
          console.log(error)
        })
    }

    setInterval(() => getData(), 2000)
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ProfileContainer>
        <ProfileImageContainer>
          <ProfileImageSkeleton>
            <ProfileImage />
          </ProfileImageSkeleton>
        </ProfileImageContainer>
        <ProfileTextContainer>
          <FixedText>Welcome Back,</FixedText>
          {!loadingUser && (
            <Text style={{ fontSize: 17, color: "black" }}>
              {data[0].username}
            </Text>
          )}
        </ProfileTextContainer>
      </ProfileContainer>
    </SafeAreaView>
  )
}
```

한 페이지에 담겨있다고 믿기에는 충격적인 코드의 양이고, 코드가 긴 것보다 더 문제가 될 만한 점들이 있습니다.

1. 🔸 CSS가 제일 중요한 코드인 것처럼, 페이지의 상단에 CSS가 위치해있습니다.
2. 🔸 API 통신과 토큰 관리가 페이지 내부에서 다루어지고 있습니다. (심지어 then을 사용하였네요)
3. 🔸 충분히 공통 컴포넌트로 분리할 수 있어보이는 컴포넌트까지 그 때 그 때 만들어서 사용한 것이 보입니다.
4. 🔸 import해 온 컴포넌트와 내부에서 만들어진 컴포넌트의 차이를 알 수 없습니다.

<br>
리액트를 배운 지 얼마 안 됐을 때의 코드이기 때문에, 심각한 상태의 코드이지만, 더 극적으로 컴포넌트 설계의 중요성을 드러내기 위해 가져왔습니다. 그럼 이제부터 `Single Responsibility`를 지킬 수 있는 방식으로 컴포넌트를 짜봅시다.

### Separating CSS

공통 컴포넌트를 만들 때에는 CSS만 따로 분리해서 컴포넌트를 만들 수 있습니다. (현재는 width와 height를 고정값으로 두었지만 더 생산성을 위해서 props로 넘겨받을 수도 있을 것입니다.)

<iframe src="https://codesandbox.io/embed/seperating-css-ifyogw?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="seperating css"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

### Reusing Component

이 영역은 제가 토스 **[`Slash22`](https://reactjs.org/docs/components-and-props.html)** 를 보면서 영감을 받았던 부분인데요, 가장 중요하다고 느낀 점을 요약하자면,

> 컴포넌트를 설계할 때 요소보다 데이터의 흐름이 같은 지를 판단해야 한다

는 것이었습니다. 예를 들면, 기획에서 버튼을 드롭다운 형태로 바꾸라고 이야기할 수도 있고, 알고 보면 같은 데이터 흐름인데도 불구하고 이중으로 컴포넌트를 만들고 있을 수도 있습니다. 위 자판기(Vending Machine) 코드로 살펴보면, 지금은 자판기 음료를 선택하는 방법이 버튼 형식으로 되어 있지만, 회사에서 자판기를 버튼이 아닌 드롭다운 형태로 바꾸라고 할 수도 있습니다. 그럴 때, 아래와 같이 코드를 짜면, 변하는 기획 안에서도 유동적으로 대처할 수 있습니다.

<iframe src="https://codesandbox.io/embed/reusable-component-5qtkmd?fontsize=14&hidenavigation=1&theme=dark"
     style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;"
     title="reusable component"
     allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
     sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
   ></iframe>

<br>
<br>

위 `App.tsx` 코드에서 볼 수 있듯이, '선택' 하는 방식으로 `MultiOptions` 태그를 넣으면 저 위치에 버튼이나 다른 태그들을 손쉽게 넣을 수 있고, 컴포넌트의 독립성을 유지해줄 수 있습니다. 원한다면 `SingleSelect` (하나만 선택하는 컴포넌트) 를 고도화할 수도 있을 겁니다.

<br>

### Separating Data

데이터는 컴포넌트 위치에서 받아와서 그 자리에서 가공하는 것이 아니라, 컴포넌트에서 사용하기 편하게 미리 다른 위치에서 가공을 완료하고, 컴포넌트 위치에서는 해당 데이터를 사용하기만 하면 되게끔 해주어야 합니다. 이러한 상황에서는 `Custom Hook`를 활용할 수 있는데요, 아래처럼 커스텀 훅을 활용한 예시를 살펴봅시다.

```typescript
import "./styles.css"
import { useState } from "react"
import SingleSelect from "./components/SingleSelect"
import MultiOptions from "./components/MultiOptions"
import useDrinkData from "./hooks/useDrinkData"
import giveDrink from "./utils/giveDrink"

export default function App(): JSX.Element {
  const [result, setResult] = useState<string>("")
  const { name } = useDrinkData()

  return (
    <div className="App">
      <h2>Vending Machine</h2>
      <SingleSelect
        as={
          <MultiOptions
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setResult(e.target.value)
            }
            options={name}
          />
        }
      />
      <p>{giveDrink(result)}</p>
    </div>
  )
}
```

<br>

위 자판기 코드에서 `App.tsx`를 따로 가져왔는데요, 기존에는 위 컴포넌트에서 `getDrinkList()`를 사용해서 데이터를 들고 와서 사용했다면, 지금은

```typescript
const { name } = useDrinkData()
```

라는 `Custom Hook`을 사용해서 데이터를 독립적인 페이지에서 부른 뒤, 원하는 데이터를 가공해서 들고 오고 있습니다. 이는 데이터를 추상화해서 들고 옴으로써 좀 더 관심사가 분리된 형태의 컴포넌트를 만들 수 있습니다.

## Conclusion

컴포넌트 설계에 정답이 있는 것은 아닙니다. 정답은 없지만 방향은 정해져 있습니다. 맨 위에서 언급했던 리액트 공식문서 문장처럼, **독립적이고, 재사용 가능하고, 관심사가 분리된 컴포넌트** 를 만들기 위해서 고민하는 것입니다. 개발을 할 때 혼자서 일하는 경우는 드물고, 개발자 간의 협업, 개발자 외 다른 부서와의 협업에도 코드는 영향을 받습니다. 그리고 변화하는 기술로도 코드도 함께 변화하게 됩니다. 개발을 할 때 변화는 필연적인 요소이고, 이러한 순간 순간의 변화에 큰 타격을 받지 않기 위해서는 위에서 소개한 방법 말고도 최대한 dependent, reusable, isolated component를 design하기 위해 고민해보는 것이 중요합니다.
