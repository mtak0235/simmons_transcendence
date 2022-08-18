# 모든 소켓 통신
- auth.sessionId 서버 저장소를 뒤지든 랜덤으로 만들고, userId는 안받으면 에러.
- 이 정보들 서버측에서 socket.*로 쓸 수 있게 값 넣어줌 
#- sessionId: (public용)reconnection시 sessionId로 userId(다른 기기로 접속한 mtak들의 소켓이 userId가 이름인 방 안에 계심.) 찾음.(한번 왔던 놈인지 확인)
- userId: (private용)db의 userId와 동일하며, 무슨 sessionId로 접속하더라도 동일한 자기 room(방이름이 "userId")에 접속할 수 있다. 고로
- 여러 내가 sessionId로 동시 접속시 userId방에 내 소켓이 여러개일 수 있다. 
## afterInit 
---

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
- 영속성을 위해 세션을 저장해준다.
- blockList clienthttp 화면랜더링에서 내려준다.
- 메시지 수령자가 오프라인이면 애초에 보내는 사람이 메시지를 보낼 수 없게 한다. 
--------------------------------
- getBlockList
```
['1234134', '54324532', '324523453']
```
- userEnter
```
{userId:'432425', userName:'mtak', connected:true}
``` 
- getPreLogs
```
[[{userId:'121', userName:'mtak', connected:true, message:[msg:'전화받으셈', from:'111', to:'121']}, {userId:'121', userName:'mtak', connected:true, message:[msg:'어디세요엠탁님', from:'111', to:'121']}], 
[{userId:'121', userName:'mtak', connected:true, message:[msg:'늦게가욤', from:'222', to:'121']}, {userId:'121', userName:'mtak', connected:true, message:[msg:'집현전으로 가겠습니당', from:'222', to:'121']}], ...
]
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
participant rep as Repository
participant rt as RoomTable

c->>ga: <<connection>>
ga->>ga: socket.userId = socket.handshake.auth.userId
ga->>rt: socket.join('room:user:${userId}')
ga->>us: getUserSource(userId)
ss-->>ga: {userName, status}
alt status != offline
ga->>c: throw WSException("invalid access")
else
ga->>ss:setStatus(userId, online)
ga->>c: broadcast<<userEnter>> ({userId, userName, status(online)})
end
```

# 소켓 연결 끊겼을 때
- userExit
```
'121'
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable

c->>ga: <<disconnection>>
ga->>rt: server.to('room:user:${userId}').allSockets() : Promise<Socket>
rt->>ga: matchingSockets
alt matchingSockets.size == 0
alt status가 inGame이면 
ga->>c: <<gameOver>>()
# endGame 호출
else
ga->>c: broadcast<<userExit>> (userId)
end
ga->>ss: saveUserSource({userId:{userName, status(offline)})
end
```

# inChannel
- channelName pattern; room:channel:channelID
- 
```
{userId:'121', userName:'mtak'}
```
- getMessage
```
'mtak님이 입장하셨습니다'
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant r as rooms
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable

c->>ga: <<inChannel>>(channelName, ?pw)
ga->>cs: enterChannel(client, channelName, ?pw)
cs->>rt: join(channelName)
ga->>c: broadcast<<inChannel>>{userId, userName, status, channelId}
ga->>c: to(userId)<<getChannelInfo>>{ChannelDto}
```

# outChannel
- outChannel
```
'121'
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

c->>ga: <<outChannel>>
ga->>cs: exitChannel(client,string[])
cs->>rt: leave(channelName)
sc->>c: broadcast<<outChannel>>(userId)
```

# block
- 상대의 DM을 안받는다. => 모든 DM은 pass된다. 대신 초기 connection에서 DB를 뒤져 blocklist를 local storage로 내려준다. client는 일단 DM을 받고 localStorage를 뒤져서 있으면 뿌려주고 없으면 무시한다.
- unfollow처리한다.
- local
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
c->>cls: save{(targetId)}
c->>c: removeFollow()
c->>ga: <<block>>(targetId)
ga->>cs: block(srcIDtargetId)
cs->>r: saveBlock(srcId,targetId)
ga->>ga: unfollow(targetId)
```
# follow
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

c->>ga: follow(targetId)
ga->>cs: friendChanged(userId, targetId, isFollowing(true))
alt isFollowing = true
cs->>r: saveFollow(userId, targetId);
end
ga->>c: to(userId, targetId)<<friendChanged>>(userId, targetId, isFollowing(false))
```
# unfollow
- friendChanged
```
{userId:'121', targetId:'111', isFollowing:false}
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

c->>ga: unfollow(targetId)
ga->>cs: friendChanged(userId, targetId, isFollowing(false))
alt isFollowing == false
cs->>r: deleteFollow(userId, targetId)
end
ga->>c: to(userId, targetId)<<friendChanged>>(userId, targetId, isFollowing(false))
c->>cs: save targetId or userId
```

# sendDM
- getDM
```
{userId:'121', userName:'mtak', msg:'hihi'}
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

c->>ga: sendDM(msg, recipientId)
ga->>c: to(recipientId)<<getDM>>({userId, userName, msg})
c->>cs: save targetId or UserId
```

# sendMSG
- channel단위 msg 전송
- getMSG
```
{userId:'121', userName:'mtak', msg:'hihi'}
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

c->>ga: sendMSG(msg)
ga->>cs: getChannelFullName(client.rooms, /^room:user:/):string[]
cs->> ga: string[]
ga-->>c: to(channelName)<<getMSG>>({userId, userName, msg})
```

# kickOut
- expelled
```
'you are expelled from helloPython'
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

c->>ga: kickOut(badGuyId)
ga->>cs: kickOut(client, badGuyId)
cs->>cs: getChannelFullName(client.rooms, /^room:user:/):string[]
cs->>cns: this.channelList[channelName]
cns->>cs: ChannelInfoDto
alt ChannelInfoDto.adminId == userId
cs->>rt: to(badGuyId).leave(channelName)
rt->>c: to(badGuyId)<<expelled>>(you are expelled from ${channelName})
end
```
# modifyGame
- gameModified
```
{channelName:'helloPython', accessLayer:'public', score:'12', adminId:'121'}
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

c->>ga: <<modifyGame>> (ChannelInfoDto{pw, score, adminId, accessLayer})
ga->>cs: modifyGame(client, ChannelInfoDto)
cs->>cs: getChannelFullName(client.rooms, /^room:user:/):string[]
cs->>cns: this.channelList[channelName]
cns->>cs: ChannelInfoDto
alt ChannelInfoDto.adminId == adminId
cs->>cns: channelList[channelName].[pw, score, admin, accessLayer] = [pw, score, admin, accessLayer]
cs-->>c: broadcast<<gameModified>>(ChannelDto{channelName, accessLayer, score, adminId})
end
```
# inviteUser
- ChannelName은 room:user:[userId]
- 게임중인 놈은 초대할 수 없음.  
- getInvitation
```
{inviter:'121', msg:'you are invited to mtak'}
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

c->>ga: inviteUser(invitedUserId)
ga->>cs: inviteUser(client, invitedUserId)
cs->>cs: createChannel(client{userId}, ChannelInfoDto) : {channelDto}
cs->>rt: join(channelName)
cs->>c: to(invitedUserId)<<getInvitation>>({msg: 'you are invited to ${userName}', inviter: userId, ChannelDto})
```

# mute
- mute
```
(아무것도 안줌)
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

c->>ga: <<mute>>(noisyGuyId)
ga-->>cs: mute(client, noisyGuyId)
cs->>cs: getChannelFullName(client.rooms, /^room:user:/):string[]
cs->>cns: this.channelList[channelName]
cns->>cs: ChannelInfoDto
alt ChannelInfoDto.adminId == userId
cs->>c: to(noisyGuyId)<<muted>>
c->>c: stop sending <sendMSG> events for 3mins
end
cs->>ga: to(userId)<<nuAuthorized>>('you aren't authorized.')
```
# waitingGame
- getWaitingList
```
{userId:'121', userName:'mtak'}
```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

c->>ga: waitingGame()
ga->>cs: waitingGame(client)
cs->>cs: getChannelFullName(client.rooms, /^room:user:/):string[]
cs->>cns: this.channelList[channelName]
cns->>cs: ChannelInfoDto
cs->>cs: ChannelInfoDto.game.enqueue(UserDto{userId, userName})
cs->>c: to(channelName)<<getWaitingList>>(UserDto)
```
# startGame
- 계속 Queue를 확인하면서 2명인지 체크해야 함.
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

ga->>c: (channel)determineParticipants(participantsId[])

```
# readyGame
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

c->>ga: readyGame()
alt: isParticipantsTwo()
ga-->>c: (channel)startGame()#toDo:나중에 game 디테일
end
ga-->>c: (channel)readyGame(userId)
```
# endGame
- 게임 기록 db에 등록
- matcher 제거
- 대기열 유저 matcher 등록
- 등록된 유저 대기열 삭제
- channel에 게임 종료 emit{matcher, waiter}
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant r as Repository
participant rt as RoomTable

c->>ga: endGame()#client가 participant면
ga-->>c:endGame()
```
# gameGenerated
- private(target에게 초대 메시지 알림 감), protected(pw있어야 함)
- createChannel
```

```
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant r as rooms
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as EventService
participant rt as RoomTable

c->>ga: <<generateGame>>(ChannelInfoDto{channelName, accessLayer, pw, score, targetId})
ga->>cs: createChannel(client{userId}, ChannelInfoDto) : {channelDto, targetId}
cs->>cns: channelList["room:channel:" + channelName]
cns->>cs: RoomDto
alt !NULL:
cs->> ga: exception('duplicate channelName');
end
cs->>cns: {channelName: RoomDto}
cs->>cs: getChannelFullName(client.rooms, /^room:user:/):string[]
loop
cs->>rt: leave(삭제할 방 이름)
end
cs->>rt: join(channelName)
alt access_layer != private
ga->>c: (broadcast)<<gameGenerated>>(ChannelDto)
```