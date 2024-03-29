<br>

# handleConnection

<h3 class="red">Request</h3>

```ts
// Headers
{
  "access_token": "발급 받은 Access Token"
}
```

<h3 class="green">Response</h3>

```ts
socket.emit('single:user:connected', data);
data {
  me: {
    userId: 1,
    username: 'seonkim',
    status: 'online',
    follows: [2, 3],
    blocks: []
  },
  users: [
    {
      userId: 2,
      username: 'gilee',
      status: 'online',
    },
    {
      userId: 3,
      username: 'taeskim',
      status: 'inGame',
    },
    ...
  ],
  channels: [
    {
      adminId: 3,
      channelIdx: 1,
      accessLayer: 'public',
      channelName: 'taeskim과 신나는 게임 한판',
      score: 11,
      onGame: true
    },
    ...
  ]
};

socket.emit('broad:user:changeStauts', data);
data: {
  userId: 1,
  username: 'seonkim',
  status: 'online'
};


socket.emit('single:user:error', data);
data : {
  error: 'server',
  message: 'unKnown',
};
```

# handleDisconnect

<h3 class="green">Response</h3>

```ts
socket.emit('broad:user:changeStatus', data);
data: {
    userId: 1,
    username: 'seonkim',
    status: 'offline',
};
```

# changeStatus

<h3 class='red'>Request</h3>

```ts
socket.on('changeStatue', data);
data: {
  status: 'online' | 'offline' | 'watchingGame' | 'waitingGame' | 'inGame'
}
```

<h3 class='green'>Response</h3>

```ts

socket.emit('broad:user:changeStauts', data);
data: {
  userId: 1,
  username: 'seonkim',
  status: 'online' | 'offline' | 'watchingGame' | 'waitingGame' | 'inGame'
}
```

# createChannel

<h3 class='red'>Request</h3>

```ts
socket.on('createChannel', data);
data: {
  channel: {
    ownerId: 1234,
    channelName: "드가자",
    password?: "1234" | opt
    accessLayer: 'public' | 'private' | 'protected'
    score: 12
  }
}
```

<h3 class='green'>Response</h3>

```ts

channelPublicDto: {
  adminId: 124,
  ownerId: 42,
  channelIdx: 43,
  accessLayer: 'public' | 'private' | 'protected',
  channelName: '드가자',
  score: 12,
  onGame: true | false
}

channelPrivateDto: {
  users: [ 213, 1234 ],
  waiter: [ 5213, 1234 ],
  mathcer: [
    {
      userId: 23,
      isReady: false
    },
    {
      userId: 45,
      isReady: true
    },
  ]
}

socket.emit('broad:user:changeStauts', data);
data: {
  userId: 1,
  username: 'seonkim',
  status: 'watchingGame'
}

socket.emit('single:channel:createChannel', data);
data: {
  channelPublic: channelPublicDto,
  channelPrivate: channelPrivateDto,
}

socket.emit('broad:channel:createdChannel', data);
data = channelPublicDto;
```

# modifyGame

<h3 class='red'>Request</h3>

```ts
socket.on('modifyChannel', data);
data: {
  channel: {
    channelName?: '드가자',
    accessLayer?: 'public' | 'private' | 'protected',
    score?: 12
  },
  password?: 'asdfasd';
}
```

<h3 class='green'>Response</h3>

```ts
socket.emit('broad:channel:updateChannel', data);
data = channelPublicDto;
```

# inChannel

<h3 class='red'>Request</h3>

```ts
socket.on('inChannel', data);
data: {
  channelId: 432,
  password?: "addc"
}
```

<h3 class='green'>Response</h3>

```ts
socket.emit('broad:user:changeStauts', data);
data: {
  userId: 1,
  username: 'seonkim',
  status: 'watchingGame'
};

socket.emit('single:channel:inChannel', data);
data: {
  channelPublic: channelPublicDto,
  channelPrivate: channelPrivateDto,
};

socket.emit('group:channel:inChannel', data);
data = 1;
```

# outChannel

<h3 class='red'>Request</h3>

```ts
socket.on('outChannel');
```

<h3 class='green'>Response</h3>

``` ts
socket.emit('broad:user:changeStauts', data);
data: {
  userId: 1,
  username: 'seonkim',
  status: 'online'
};

socket.emit('single:channel:outChannel');

// Admin 또는 Owner 변경 시 emit 될 이벤트
socket.emit('broad:channel:setAdmin', data);
data: {
  channelId: 432,
  ownerId: 43,
  adminId: 4321,
};

socket.emit('group:channel:outChannel', data);
data = 123;

// 채널에 모든 유저가 나간 경우 emit 될 이벤트
socket.emit('broad:channel:deleteChannel', data);
data = 10;
```

# inviteUser

<h3 class='red'>Request</h3>

```ts
socket.on('inviteUser', data);
data: {
  userId: 5342
};
```

<h3 class=' green'>Response</h3>

``` ts
socket.emit('single:channel:inviteUser', data);
data: {
  userId: 1,
  channelId: 52,
  channelName: "드가자",
};
```

# setAdmin

<h3 class='red'>Request</h3>

```ts
socket.on('setAdmin', data);
data: {
  userId: 5342
}
```

<h3 class=' green'>Response</h3>

``` ts
socket.emit('broad:channel:setAdmin', data);
data: {
  channelId: 543,
  ownerId: 64,
  adminId: 326,
};
```

# kickOutUser

<h3 class='red'>Request</h3>

```ts
socket.on('kickOutUser', data);
data: {
  userId: 5342
}
```

<h3 class=' green'>Response</h3>

``` ts
socket.emit('single:channel:kickOut');

socket.emit('group:channel:kickOut', data);
data = 542;
```

# muteUser
<h3 class='red'>Request</h3>

```ts
socket.on('muteUser', data);
data: {
  userId: 1
}
```

<h3 class=' green'>Response</h3>

``` ts
socket.emit('group:channel:muteUser', data);
data: {
  userId: 1,
  expiredAt: 1668823412
};
```


# waitingGame

<h3 class='red'>Request</h3>

```ts
socket.on('waitingGame');
```

<h3 class=' green'>Response</h3>

``` ts
socket.emit('group:channel:waitingGame', data);
data: {
  matcher: [
    {
      userId: 5342,
      isReady: false
    },
    {
      userId: 2222,
      isReady: true
     }
  ],
  waiter: [ 34, 1325 ]
};
```


# readyGame


<h3 class='red'>Request</h3>

```ts
socket.on('readyGame');
```

<h3 class=' green'>Response</h3>

``` ts
socket.emit('group:channel:readyGame', data);
data: {
  matcher: [
    {
      userId: 5342,
      isReady: false
    },
    {
      userId: 5342,
      isReady: true
    }
  ]
};

socket.emit('group:channel:startGame');
```

# leaveGame - 게임 대기열 빠져나가는 이벤트 (채널 나가는 이벤트 아님)


<h3 class='red'>Request</h3>

```ts
socket.on('leaveGame');
```

<h3 class=' green'>Response</h3>

```ts
socket.emit('group:channel:leaveGame', data);
data: {
  matcher: [
    {
      userId: 5342,
      isReady: false
    },
    {
      userId: 2222,
      isReady: true
     }
  ],
  waiter: [ 34, 1325 ]
}
```

# endGame
## 게임 이벤트 명세 나중에 게임 구현하면서 같이 작업

<h3 class='red'>Request</h3>

```ts
{
  userId?:
}
```

# sendMessage

<h3 class='red'>Request</h3>

```ts
socket.on('sendMessage', data);
data: {
  message: '안녕하세요'
}
```

<h3 class=' green'>Response</h3>

``` ts
socket.emit('group:channel:sendMessage', data);
data: {
  sourceId: 3452,
  message: '안녕하세요',
}
```

# sendDirectMessage

<h3 class='red'>Request</h3>

```ts
socket.on('sendDirectMessage', data);
data: {
  targetId: 5342,
  message: '안녕하세요'
}
```

<h3 class=' green'>Response</h3>

``` ts
socket.emit('single:channel:sendDm', data);
data: {
  sourceId: 34,
  targetId: 5432,
  message: "안녕하세요",
}
```

# blockUser
<h3 class='red'>Request</h3>

```ts
{
  userId: 5342
}
```

<h3 class=' green'>Response</h3>

``` ts
socket.emit('single:user:blockUser', data);
data = 5342;
```

# followUser

<h3 class='red'>Request</h3>

```ts
{
  userId: 5342
}
```

<h3 class=' green'>Response</h3>

``` ts
socket.emit('single:user:followUser', data);
data = 52;

socket.emit('followedUser', data);
data = 52;
```

# unfollowUser
<h3 class='red'>Request</h3>

```ts
{
  targetId: 5342
}
```

<h3 class=' green'>Response</h3>

``` ts
socket.emit('single:user:followUser', data);
data = 52;
```
