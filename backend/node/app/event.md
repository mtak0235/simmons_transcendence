# 모든 소켓 통신
- afterInit 
- 서버 시작시 한번 실행됨.
- server.use()에 module달려고 했는데 소켓 요청시 해당 모듈을 안지남. (왜지..?)

```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant cs as EventService
participant rt as RoomTable


```

# 소켓 연결 직후
- socket에 userId 가지고 다님.
- userId가 같은 소켓은 모두 'room:channel:${userId}' room에 들어감.
- status를 확인해서 offline아닌데 재접속인 경우는 본인인지 확신할 수 없는 소켓이 접속한 것이므로 에러 던짐.
## userEnter (listen)
```
{userId:'432425', userName:'mtak', connected:true}
``` 
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant cs as EventService
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant rt as RoomTable
participant rep as Repository

c->>ga: <<connection>>
ga->>ga: socket.userId = socket.handshake.auth.userId
ga->>rt: socket.join('room:channel:${userId}')
ga->>ss: getUserSource(userId)
ss-->>ga: {userName, status}
alt status != offline
ga->>c: throw WSException("invalid access")
else
ga->>ga: socket.userName = userName
ga->>ss:setStatus(userId, "online")
ga->>c: broadcast<<userEnter>> ({userId, userName, status("online")})
end
```

# 소켓 연결 끊겼을 때
## userExit (listen)
```
{userId: 121}
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable

c->>ga: <<disconnection>>
ga->>rt: server.to('room:channel:${userId}').allSockets() : Promise<Socket>
rt->>ga: matchingSockets
alt matchingSockets.size == 0
alt status가 inGame이면 
ga->>ga: endGame()
ga->>ga: outChannel()
else
ga->>c: broadcast<<userExit>> (userId)
end
ga->>ss: saveUserSource({userId:{userName, status(offline)})
end
```

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
participant cls as clientStorage
participant c as client
participant ga as server
participant r as rooms
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant rt as RoomTable
participant cs as EventService

c->>ga: <<inChannel>>(channelName, ?pw)
ga->>cs: enterChannel(client, channelName, ?pw)
cs->>rt: join(channelName)
cs->>ss: updateUserSource(userId, status("inGame"))
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
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable
participant r as Repository

c->>ga: <<outChannel>>
ga->>cs: exitChannel(client,string[])
cs->>rt: leave(channelName)
cs->>ss: getUserSource(userId):{userName, status}
cs->>cs: status = online
cs->>cs: getChannelFullName(client.rooms, /^room:channel:/):string[].getOne()
cs->>cs: this.channelList[channelName]:{waiter, matcher}
alt userId in matcher
cs->>cs: endGame(channelName)
else userId in waiter
cs->>c: to(channelName)<<outWaitList>>(userId)
end
sc->>c: broadcast<<outChannel>>({userId, userName})
```

# block
- 상대의 DM을 안받는다. => 모든 DM은 pass된다. 대신 초기 connection에서 DB를 뒤져 blocklist를 local storage로 내려준다. client는 일단 DM을 받고 localStorage를 뒤져서 있으면 뿌려주고 없으면 무시한다.
- unfollow처리한다.
- local에서 friends, blocks 데이터 내려줘야됨.

```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable
participant r as Repository

c->>cls: saveBlocker{(targetId)}
c->>ga: <<block>>(targetId)
ga->>cs: block(srcId,targetId)
cs->>ss: getUserSource(userId):{blocks:[]}
cs->>cs: blocks.append(targetId)
cs->>r: saveBlock(srcId,targetId)
ga->>ga: unfollow(targetId, )
```
# follow
## friendChanged (listen)
```
{userId: 431, targetId:4123, isFriend:true}
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable
participant r as Repository

c->>cls: saveFriend(targetId)
c->>ga: <<follow>>(targetId)
ga->>cs: friendChanged(userId, targetId, isFollow(true))
alt isFollow == true
cs->>ss: getUserSource(userId):{friends:[]}
cs->>cs: friends.append(targetId)
cs->>r: saveFollow(userId, targetId)
end
ga->>c: to(userId, targetId)<<friendChanged>>(userId, targetId, isFollow(true))
```
# unfollow
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable
participant r as Repository

c->>cls: deleteFriend(targetId)
c->>ga: <<unfollow>>(targetId)
ga->>cs: friendChanged(userId, targetId, isFollow(false))
alt isFollow == false
cs->>ss: getUserSource(userId):{friends:[]}
cs->>cs: friends.delete(targetId)
cs->>r: deleteFollow(userId, targetId)
end
ga->>c: to(userId, targetId)<<friendChanged>>(userId, targetId, isFollow(false))
```

# sendDM
## getDM (listen)
```
{userId:'121', userName:'mtak', msg:'hihi'}
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable
participant r as Repository

c->>ga: sendDM(msg, targetId)
ga->>cs: sendDM(targetId, client, msg)
cs->>cns: getUserSource(targetId) :{blocks:[]}
alt userId not in blocks[]
cs->>c: to(targetId)<<getDM>>({userId, userName, msg})
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
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable
participant r as Repository

c->>ga: sendMSG(msg)
ga->>cs: sendMSG(msg, client)
cs->>cs: getChannelFullName(client.rooms, /^room:channel:/):string[].getOne()
cs->>cs: this.channelList[channelName]:{mutedUsers:[]}
alt userId not in mutedUsers[] 
cs->>c: to(channelName)<<getMSG>>({userId, userName, msg})
else  mutedUsers[userId] > time()
cs->>cns: deleteMutedUser(userId)
cs->>c: to(channelName)<<getMSG>>({userId, userName, msg})
end
```

# kickOut
## expelled (listen)
```
'you are expelled from helloPython'
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable
participant r as Repository

c->>ga: kickOut(targetId)
ga->>cs: kickOut(client, targetId)
cs->>cs: getChannelFullName(client.rooms, /^room:channel:/).findOne()
cs->>cns: this.channelList[channelName]
cns->>cs: ChannelInfoDto
alt ChannelInfoDto.adminId == userId
cs->>rt: to(targetId).leave(channelName)
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
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable
participant r as Repository

c->>ga: <<modifyGame>> (ChannelInfoDto)
ga->>cs: modifyGame(client, ChannelInfoDto)
cs->>cs: getChannelFullName(client.rooms, /^room:channel:/).getOne() :string
cs->>cns: this.channelList[channelName]
cns->>cs: ChannelInfoDto
alt ChannelInfoDto.adminId == adminId
cs->>cns: this.channelList[channelName] = ChannelInfoDto
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
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable
participant r as Repository

c->>ga: inviteUser(targetId)
ga->>cs: inviteUser(client, targetId)
cs->>c: to(targetId)<<getInvitation>>(channelDisplayableDto, userId)
```

# mute
- 방장만mute를 시킬 수 있다
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable
participant r as Repository

c->>ga: <<mute>>(targetId)
ga-->>cs: mute(client, targetId)
cs->>cs: getChannelFullName(client.rooms, /^room:channel:/):string[]
cs->>cns: this.channelList[channelName]
cns->>cs: ChannelInfoDto
alt ChannelInfoDto.adminId == userId
cs->>cns: ChannelInfoDto.mutedUsers.append(targetId)
end
cs->>ga: thow WSException("unAuthorized")
```

# waitingGame

## getWaitingList (listen)
```
{userId:'121', userName:'mtak'}
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

c->>ga: waitingGame()
ga->>cs: waitingGame(client)
cs->>cs: getChannelFullName(client.rooms, /^room:channel:/).getOne():string
cs->>cs: this.channelList[channelName] {waiter, matcher,score, onGame}
cs->>cs: ChannelInfoDto.waiter.enqueue({userId, userName})
alt waiter.length >= 2
cs->>cs: matcher.append(waiter[:2])
cs->>cs: waiter.remove(2)
end
cs->>c: to(channelName)<<getWaitingList>>(ChannelInfoDto.waiter)
```
# readyGame
- first server는 첫번째  waiter이다. 
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

c->>ga: readyGame()
ga->>cs: readyGame(client)
cs->>cs: getChannelFullName(client.rooms, /^room:channel:/).getOne():string
cs->>cs: this.channelList[channelName]{waiter, matcher,score, onGame}
alt matcher.filter(data => isReady == true)
cs->>cs: onGame= true
cs->>c: to(channelName)<<startGame>>(waiter, matcher, score)
else
cs->>cs: isReady = true
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
participant cls as clientStorage
participant c as client
participant ga as server
participant r as rooms
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable

c->>ga: <<generateChannel>>(ChannelInfoDto{channelName, accessLayer, pw, score})
ga->>cs: createChannel(client{userId}, ChannelInfoDto) : {channelDto, targetId}
cs->>cns: channelList["room:channel:" + channelName]
cns->>cs: RoomDto
alt !NULL:
cs->> ga: exception('duplicate channelName');
end
cs->>cs: getChannelFullName(client.rooms, /^room:channel:/):string[]
loop
cs->>rt: leave(삭제할 방 이름)
end
cs->>rt: join("room:channel:" + channelName)
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
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable
participant r as Repository

c->>ga: endGame()
ga->>cs: getChannelFullName(client.rooms, /^room:channel:/).getOne():string
ga->>cs: endGame(channelName)
cs->>cs: getChannelFullName(client.rooms, /^room:channel:/).getOne():string
cs->>cs: this.channelList[channelName]{matcher,onGame}
cs->>cs: onGame = false
cs->>r: saveGame({waiter,result(integer 8bit)})
alt waiter.length >= 2
cs->>cs: matcher.append(waiter[:2])
cs->>cs: waiter.remove(2)
end
cs-->>c:to(channelName)<<gameOver>> {matcher:[], waiter:[]}
```

# castPingPong

```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as userStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable
participant r as Repository

c->>ga: <<ping>>(client, position)
```