<style type='text/css'>
  [class*="red"] { color: red; }
  [class*="green"] {color: green; }
  [class*="yellow"] {color: yellow; }
  
</style>

<!-- <h3 class="red">Request</h3>

```json

Headers
{
}

```

<h3 class="red">Request</h3>

```ts
client.emit('', data);
``` -->
# handleConnection

<h3 class="red">Request</h3>

```json
// Headers
{
  "access_token": "발급 받은 Access Token"
}
```

<h3 class="green">Response</h3>

```ts
client.emit('single:user:connected', data);

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
}

client.broadcast.emit('broad:user:connected', data);

data: {
  userId: 1,
  username: 'seonkim',
  status: 'online'
}


client.emit('single:user:error', data);
data : {
          error: 'server',
          message: 'unKnown',
        }
```

# handleDisconnect
<h3 class="red">Request</h3>

```json
none
```

<h3 class="green">Response</h3>

```ts
 client.broadcast.emit('broad:user:disconnected', data);
 data: {
  {
        userId: 13342,
        status: "inGame" | "waitingGame" | "watchingGame" | "online" | "offline",
      }
 }
```
# createChannel
<h3 class='red'>Request</h3>
```json
{channel: {
  ownerId: 1234,
  channelName: "드가자",
  password: "1234" | opt
  accessLayer: 'public' | 'private' | 'protected'
  score: 12
}}
```

<h3 class='green'>Response</h3>

```ts
client.emit('single:channel:createChannel', data);

data:{
      channelPublic: channelPublic,
      channelPrivate: channelPrivate,
    }

channelPublic: {
  adminId: 124,
  ownerId: 42,
  channelIdx: 43,
  accessLayer:'public' | 'private' | 'protected',
  channelName:"드가자",
  score: 12,
  onGame: true | false
}

channelPrivate: {
  users: [213, 1234,],
  waiter: [5213, 1234,],
  mathcer: {
    userId: 23,
    isReady: true | false
  }
}
client.broadcast.emit(
      'broad:channel:createdChannel', channelPublic,
    );
```

# modifyGame
<h3 class='red'>Request</h3>

```json
channel: {
  channelName:"드가자",
password: "vdasdf" | opt,
accessLayer:'public' | 'private' | 'protected',
score: 12
}
```

<h3 class='green'>Response</h3>

```ts
this.server.emit(
      'broad:channel:updateChannel',
      channelPublic,
    );
```

# inChannel
<h3 class='red'>Request</h3>

```json
{channelId: 432,password:"addc" | opt}
```
<h3 class='green'>Response</h3>

```ts
client.emit('single:channel:inChannel', channelPrivate);
client
.to(`room:channel:423`)
.emit('group:channel:inChannel', 125);
```

# outChannel
<h3 class='red'>Request</h3>

```json
none
```

<h3 class=' green'> Response</h3>

``` ts
client.emit('single:channel:outChannel', {
      channelId: 13432,
    });

server.emit('broad:channel:setAdmin', {
          channelId: 432,
          ownerId: 43,
          adminId: 4321,
        });

server.emit(
        'broad:channel:deleteChannel',
        543,
      );
```

# inviteUser
<h3 class='red'>Request</h3>

```json
{userId:5342}
```

<h3 class=' green'> Response</h3>

``` ts
client.to(`room:user:543`).emit('single:channel:inviteUser', {
      channelId: 52,
      channelName: "드가자",
    });
```

# setAdmin
<h3 class='red'>Request</h3>

```json
{userId:5342}
```

<h3 class=' green'> Response</h3>

``` ts
this.server.emit('broad:channel:setAdmin', {
      channelId: 543,
      ownerId: 64,
      adminId: 326,
    });
```

# kickOutUser
<h3 class='red'>Request</h3>

```json
{userId:5342}
```

<h3 class=' green'> Response</h3>

``` ts
 client.to(`room:user:${userId}`).emit('single:channel:kickOut');
    client
      .to(`room:channel:5341`)
      .emit('group:channel:kickOut', { userId:542 });
```

# muteUser
<h3 class='red'>Request</h3>

```json
{muteUser: data
}
```

data: {
  userId: 1234,
  expiredAt: 543151234123
}

<h3 class=' green'> Response</h3>

``` ts
server
      .to(`room:channel:52`)
      .emit('group:channel:muteUser', { muteUser: data});
```


# waitingGame
<h3 class='red'>Request</h3>

```json
none
```

<h3 class=' green'> Response</h3>

``` ts
server
      .to(`room:channel:542`)
      .emit('group:channel:getGameParticipants', {
        matcher: [{userId:5342, isReady: false}, {userId:5342, isReady: true}, ...],
        waiter: [34, 1325],
      });
```


# readyGame
<h3 class='red'>Request</h3>

```json
none
```

<h3 class=' green'> Response</h3>

``` ts
server
        .to(`room:channel:523`)
        .emit('group:channel:readyGame', {
          matcher: [{userId:5342, isReady: false}, {userId:5342, isReady: true}, ...],
        });

server
      .to(`room:channel:523`)
      .emit('group:channel:startGame', {
        matcher: c[{userId:5342, isReady: flase}, {userId:5342, isReady: true}, ...],
        score: 12,
      });

```

# sendMSG
<h3 class='red'>Request</h3>

```json
{message:"would you join game next time"}
```

<h3 class=' green'> Response</h3>

``` ts
server
      .to(`room:channel:32`)
      .emit('group:channel:sendMsg', {
        sourceId: 3452,
        message: "would you join game next time",
      });
```

# sendDM
<h3 class='red'>Request</h3>

```json
{targetId: 5342, message: "would you join game next time"}
```

<h3 class=' green'> Response</h3>

``` ts
server
      .to([`room:user:5342`, `room:user:34`])
      .emit('single:channel:sendDm', {
        sourceId: 34,
        targetId: 5432,
        message: "would you join game next time",
      });
```

# blockUser
<h3 class='red'>Request</h3>

```json
{targetId:5342}
```

<h3 class=' green'> Response</h3>

``` ts
client.emit('single:user:blockUser', { targetId:5342 });
```

# followUser
<h3 class='red'>Request</h3>

```json
{targetId: 5342}
```

<h3 class=' green'> Response</h3>

``` ts
client.emit('single:user:followUser', {
      sourceId: 52,
    });

client.to(`room:user:5342`).emit('followedUser', {
  sourceId: 52,
  targetId:5342,
});
```

# unfollowUser
<h3 class='red'>Request</h3>

```json
{targetId: 5342}
```

<h3 class=' green'> Response</h3>

``` ts
client.emit('single:user:followUser', {
      sourceId: 52,
      targetId: 5342,
    });
```