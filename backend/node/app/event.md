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

# client Events

## handleConnection

- client에 userDto 가지고 다님
- status를 확인해서 offline아닌데 재접속인 경우는 본인인지 확신할 수 없는 소켓이 접속한 것이므로 에러 던짐.
- status는 ['online', 'offline', 'inGame'] 3개로만 구분 됨

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

```

<br>

<h3 class="yellow">Exception</h3>

- [Exception-1](#exception-1) JWT 인증 실패 (만료, 비정상 토큰 등)
- [Exception-2](#exception-2) 이미 접속중인데 추가로 접속하는 경우 (보안 강화 목적)
- [Exception-3](#exception-3) clientException일 경우
<br>

### Sequence Diagram

```mermaid
sequenceDiagram

participant c as Client
participant f as Filter
participant ga as Server
participant us as UserSocketService
participant ms as MainSocketService
participant cs as ChannelSocketService
participant js as JwtService

participant css as ChannelSocketStore
participant uss as UserSocketStore
participant rt as RoomTable

participant rep as Repository


c->>ga: <<connection>>
ga->>ms: verifyUser(token);
ms->>ConfigService:  get('authConfig.jwt')
ConfigService-->>ms: secret
ms->>js: verifyUser(token, secret)
js-->ms: payload{id:{type:'Buffer',data:[number, ...]}, type:'dev', iat:number, exp:number}
alt type === 'dev'
ms->>ms: userId
else
ms->>EncryptionService: decrypt(payload.id)
EncryptionService-->ms: userId
end
ms->>ms: Exception-1
ms->>rep: findUser(userId)
rep-->ms: Users
ms-->ga: Users
ga->>ms: setClient(Users);
ms->>uss: find(userId)
uss-->ms: UserDto
ms->>uss:findAllInfo(userId)
uss-->ms: UserInfoDto
ms->>css: findAllInfo
css->>ms: ChannelPublicDto[]
alt UserDto && UserDto.status != offline && process.env.NODE_ENV !== 'local'
ms->>f: new SocketException('Forbidden')
end
ms->>us: connect(UserDto|Users)
alt Users
us->>rep: findFolloweeList(userId) :follows
us->>rep: findBlockList(userId) : blocks
us->>uss: save(userId, username, follows{id}, blocks{id});
us-->ms:UserDto{userId, username, follows, blocks}

end
us->>rep: findFolloweeList(usreId) :follows
us->>us: switchStatus(UserDto, status('online'))
us->>uss: update(UserDto, status)
us-->ms:UserDto{follows}
us-->>ga: MainPageDto
ga->>ga: client.user = UserDto
ga->>rt: client.join('room:user:${userId}')
ga-->>c: client.emit('connected', MainPageDto);
ga-->>c: client.broadcast.emit('connectUser', {userId, username, status});
ms->>ms: Exception-2
```

<br>

## handleDisconnect

<br>

<h3 class="green">Response</h3>

```ts
client.broadcast.emit('broad:user:disconnected', data);

data: {
  userId: 1,
  status: 'offline'
}
```

<br>

### Sequence Diagram

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant us as UserSocketService
participant ms as MainSocketService
participant cs as ChannelSocketService

participant css as ChannelSocketStore
participant uss as UserSocketStore

participant rep as Repository

participant rt as RoomTable

c->>ga: <<disconnection>>
alt statue === inGame
alt user === matcher
ga->>ga: this.endGame()
end
ga->>ga: this.outChannel()
end
ga->>us: switchStatus(UserDto, 'STATUS_LAYER')
us->>ss: save()
ga->>us: leaveRoomTable(RoomDto)
us->>rt: Exit all room
ga-->>c: client.broadcast.emit('disconnectuser', data)
```

<br>

# inChannel

- channelName pattern; room:channel:channelID

## inChannel (listen)

```
{userId:'121', userName:'mtak', status:"inGame", channelId:"diavlo"}
```

## getChannelInfo (listen)

```
{channelName:"diavlo",  accessLayer: "private",
  score: 13, adminID: 543}
```

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant r as rooms
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant rt as RoomTable
participant us as UserService

c->>ga: <<inChannel>>(channelName, ?pw)
ga->>us: enterChannel(client, channelName, ?pw)
us->>rt: join(channelName)
us->>ss: updateUserSource(userId, status("inGame"))
ss->>ss: getUserSource(userId):{userName, status}
ss->>ss: status = status
ga->>c: broadcast<<inChannel>>{userId, userName, status, channelId}
ga->>c: to(userId)<<getChannelInfo>>{channelName,  accessLayer, score, adminID}
```

# outChannel

- 이벤트 던지는 상황
- 정상적으로 나가기 버튼을 눌렀을 때
- 새로고침이나 뒤로가기로 나갔을 땐(커넥션 끊겼을 땐?)
- connection, disconnection이벤트에서 status 관라

## outChannel (listen)

```
{userId:412}
```

## outWaitList (listen)

```
{userId:1234}
```

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant rt as RoomTable
participant r as Repository

c->>ga: <<outChannel>>
ga->>us: exitChannel(client,string[])
us->>rt: leave(channelName)
us->>ss: getUserSource(userId):{userName, status}
us->>us: status = online
us->>us: getChannelFullName(client.rooms, /^room:channel:/):string[].getOne()
us->>us: this.channelList[channelName]:{waiter, matcher}
alt userId in matcher
us->>us: endGame(channelName)
else userId in waiter
us->>c: to(channelName)<<outWaitList>>(userId)
end
sc->>c: broadcast<<outChannel>>({userId, userName})
```

# block

- 상대의 DM을 안받는다. => 모든 DM은 pass된다. 대신 초기 connection에서 DB를 뒤져 blocklist를 local storage로 내려준다. client는 일단 DM을 받고 localStorage를 뒤져서 있으면 뿌려주고 없으면 무시한다.
- unfollow처리한다.
- local에서 friends, blocks 데이터 내려줘야됨.

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant rt as RoomTable
participant r as Repository

c->>ga: <<block>>(targetId)
ga->>us: block(sourceId,targetId)
us->>ss: getUserSource(userId):{blocks:[]}
us->>us: blocks.append(targetId)
us->>r: saveBlock(sourceId,targetId)
ga->>ga: unfollow(targetId, )
ga->>cs: block(UserDto,targetId)
cs->>us: addBlock(UserDto, targetId)
cs->>us: unfollow(targetId, )
```

# follow

## friendChanged (listen)

```
{userId: 431, targetId:4123, isFriend:true}
```

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant rt as RoomTable
participant r as Repository

c->>ga: <<follow>>(targetId)
ga->>us: friendChanged(userId, targetId, isFollow(true))
alt isFollow == true
us->>ss: getUserSource(userId):{friends:[]}
us->>us: friends.append(targetId)
us->>r: saveFollow(userId, targetId)
end
ga->>c: to(userId)<<friendChanged>>(userId, targetId, isFollow(true))
```

# unfollow

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant rt as RoomTable
participant r as Repository

c->>ga: <<unfollow>>(targetId)
ga->>us: friendChanged(userId, targetId, isFollow(false))
alt isFollow == false
us->>ss: getUserSource(userId):{friends:[]}
us->>us: friends.delete(targetId)
us->>r: deleteFollow(userId, targetId)
end
ga->>c: to(userId)<<friendChanged>>(userId, targetId, isFollow(false))
```

# sendDM

## getDM (listen)

```
{userId:'121', userName:'mtak', msg:'hihi'}
```

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant rt as RoomTable
participant r as Repository

c->>ga: sendDM(msg, targetId)
ga->>us: sendDM(targetId, client, msg)
us->>cns: getUserSource(targetId) :{blocks:[]}
alt userId not in blocks[]
us->>c: to(targetId)<<getDM>>({userId, userName, msg})
end
```

# sendMSG

- channel단위 msg 전송

## getMSG (listen)

```
{userId:'121', userName:'mtak', msg:'hihi'}
```

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant rt as RoomTable
participant r as Repository

c->>ga: sendMSG(msg)
ga->>us: sendMSG(msg, client)
us->>us: getChannelFullName(client.rooms, /^room:channel:/):string[].getOne()
us->>us: this.channelList[channelName]:{mutedUsers:[]}
alt userId not in mutedUsers[]
us->>c: to(channelName)<<getMSG>>({userId, userName, msg})
else  mutedUsers[userId] > time()
us->>cns: deleteMutedUser(userId)
us->>c: to(channelName)<<getMSG>>({userId, userName, msg})
end
```

# kickOut

## expelled (listen)

```
'you are expelled from helloPython'
```

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant rt as RoomTable
participant r as Repository

c->>ga: kickOut(targetId)
ga->>us: kickOut(client, targetId)
us->>us: getChannelFullName(client.rooms, /^room:channel:/).findOne()
us->>cns: this.channelList[channelName]
cns->>us: ChannelInfoDto
alt ChannelInfoDto.adminId == userId
us->>rt: to(targetId).leave(channelName)
rt->>c: to(targetId)<<expelled>>(you are expelled from ${channelName})
end
```

# modifyGame

- ChannelInfoDto

```
export interface ChannelDisplayableDto {
  accessLayer: ACCESS_LAYER;
  channelName: string;
  score: number;
  adminID: number;
}

export interface MutedUser {
  expiredDate: number;
  userID: number;
}

export interface Matcher {
  userID: number;
  isReady: boolean;
  score: number;
}

// export interface Game {}
export interface ChannelInfoDto {
  password?: string; // todo: bcrypt
  channel: ChannelDisplayableDto;
  waiter: Array<number>;
  kickedOutUsers: Array<number>;
  mutedUsers: Array<MutedUser>;
  matcher: Array<Matcher>;
  onGame: boolean;
}
```

## gameModified (listen)

```
{channelName:'helloPython', accessLayer:'public', score:'12', adminId:'121'}
```

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant rt as RoomTable
participant r as Repository

c->>ga: <<modifyGame>> (ChannelInfoDto)
ga->>us: modifyGame(client, ChannelInfoDto)
us->>us: getChannelFullName(client.rooms, /^room:channel:/).getOne() :string
us->>cns: this.channelList[channelName]
cns->>us: ChannelInfoDto
alt ChannelInfoDto.adminId == adminId
us->>cns: this.channelList[channelName] = ChannelInfoDto
cs-->>c: broadcast<<gameModified>>(ChannelDisplayableDto)
end
```

# inviteUser

- 게임중인 놈은 초대할 수 없음.
- 현재 내가 있는 채널로 초대한다.
- 차단당했으면 초대 메일 안감.

## getInvitation (listen)

```
{inviter:'121'}
```

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant rt as RoomTable
participant r as Repository

c->>ga: inviteUser(targetId)
ga->>us: inviteUser(client, targetId)
us->>c: to(targetId)<<getInvitation>>(channelDisplayableDto, userId)
```

# mute

- 방장만mute를 시킬 수 있다

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant rt as RoomTable
participant r as Repository

c->>ga: <<mute>>(targetId)
ga-->>us: mute(client, targetId)
us->>us: getChannelFullName(client.rooms, /^room:channel:/):string[]
us->>cns: this.channelList[channelName]
cns->>us: ChannelInfoDto
alt ChannelInfoDto.adminId == userId
us->>cns: ChannelInfoDto.mutedUsers.append(targetId)
end
us->>ga: thow WSException("unAuthorized")
```

# waitingGame

## getWaitingList (listen)

```
{userId:'121', userName:'mtak'}
```

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant r as Repository
participant rt as RoomTable

c->>ga: waitingGame()
ga->>us: waitingGame(client)
us->>us: getChannelFullName(client.rooms, /^room:channel:/).getOne():string
us->>us: this.channelList[channelName] {waiter, matcher,score, onGame}
us->>us: ChannelInfoDto.waiter.enqueue({userId, userName})
alt waiter.length >= 2
us->>us: matcher.append(waiter[:2])
us->>us: waiter.remove(2)
end
us->>c: to(channelName)<<getWaitingList>>(ChannelInfoDto.waiter)
```

# readyGame

- first server는 첫번째 waiter이다.

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant r as Repository
participant rt as RoomTable

c->>ga: readyGame()
ga->>us: readyGame(client)
us->>us: getChannelFullName(client.rooms, /^room:channel:/).getOne():string
us->>us: this.channelList[channelName]{waiter, matcher,score, onGame}
alt matcher.filter(data => isReady == true)
us->>us: onGame= true
us->>c: to(channelName)<<startGame>>(waiter, matcher, score)
else
us->>us: isReady = true
ga-->>c: (channel)readyGame(userId)
end
```

# generateChannel

- private(target에게 초대 메시지 알림 감), protected(pw있어야 함)

## createChannel (listen)

```
{channelName:"diavlo",  accessLayer: "private",
  score: 13, adminID: 543}
```

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant r as rooms
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant rt as RoomTable

c->>ga: <<generateChannel>>(ChannelInfoDto{channelName, accessLayer, pw, score})
ga->>us: createChannel(client{userId}, ChannelInfoDto) : {channelDto, targetId}
us->>cns: channelList["room:channel:" + channelName]
cns->>us: RoomDto
alt !NULL:
us->> ga: exception('duplicate channelName');
end
us->>us: getChannelFullName(client.rooms, /^room:channel:/):string[]
loop
us->>rt: leave(삭제할 방 이름)
end
us->>rt: join("room:channel:" + channelName)
alt access_layer != private
ga->>c: broadcast<<channelGenerated>>(ChannelDto)
end
```

# endGame

- 게임 기록 db에 등록
- matcher 제거
- 대기열 유저 matcher 등록
- 등록된 유저 대기열 삭제
- channel에 게임 종료 emit{matcher, waiter}

## gameOver (listen)

```
{matcher:[1234, 45315], waiter:[5234, 34542, 3425342]}
```

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant rt as RoomTable
participant r as Repository

c->>ga: endGame()
ga->>us: getChannelFullName(client.rooms, /^room:channel:/).getOne():string
ga->>us: endGame(channelName)
us->>us: getChannelFullName(client.rooms, /^room:channel:/).getOne():string
us->>us: this.channelList[channelName]{matcher,onGame}
us->>us: onGame = false
us->>r: saveGame({waiter,result(integer 8bit)})
alt waiter.length >= 2
us->>us: matcher.append(waiter[:2])
us->>us: waiter.remove(2)
end
cs-->>c:to(channelName)<<gameOver>> {matcher:[], waiter:[]}
```

# castPingPong

```mermaid
sequenceDiagram
participant c as Client
participant ga as Server
participant ss as UserStore
participant ms as MessageStore
participant cns as ChannelService
participant us as UserService
participant rt as RoomTable
participant r as Repository

c->>ga: <<ping>>(client, position)
```

# Exceptions

## Exception-1

> JWT 인증 실패

```mermaid
sequenceDiagram
participant c as Client
participant f as Filter

ms-->>f: throw Error('UnAuthorized')
f-->>c: client.emit('error', err);
f->>f: client.disconnect();
```

<br>

## Exception-2

> HttpException과 동일함

```mermaid
sequenceDiagram
participant c as Client
participant f as Filter

ms-->>f: throw Error('UnAuthorized')
f-->>c: client.emit('error', err);
f->>f: client.disconnect();
```

## Exception-3

> clientException

```mermaid
sequenceDiagram
participant c as Client
participant f as Filter

participant ga as Gateway

ga->>f: throw clientException()
ga-->c: client.emit('single:user:error', {
          error: 'server',
          message: 'unKnown',
        })
ga->c: client.disconnect()
```