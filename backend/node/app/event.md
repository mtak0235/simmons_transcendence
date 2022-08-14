# 모든 소켓 통신
- auth.sessionID 서버 저장소를 뒤지든 랜덤으로 만들고, userID는 안받으면 에러.
- 이 정보들 서버측에서 socket.*로 쓸 수 있게 값 넣어줌 
#- sessionID: (public용)reconnection시 sessionID로 userID(다른 기기로 접속한 mtak들의 소켓이 userID가 이름인 방 안에 계심.) 찾음.(한번 왔던 놈인지 확인)
- userID: (private용)db의 userID와 동일하며, 무슨 sessionID로 접속하더라도 동일한 자기 room(방이름이 "userID")에 접속할 수 있다. 고로
- 여러 내가 sessionID로 동시 접속시 userID방에 내 소켓이 여러개일 수 있다. 
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant cs as ChannelService


c->>ga: auth.encryptedUserID
alt encryptedUserID
ga->>cs: getUserID(encryptedUserID)
cs->>ga: userID
ga->>ss: findSession(userID)
ss->>ga: Session{userID, connected, Message}
alt: Session == null
ga->cs: getUserName(userID)
cs->>ga: userName
ga->>ss: saveSession({userID: {userName, connected(true)}})
ga->>rt: join(userID)
end
ga->>ga: socket.userID = userID
else
ga->>c: exception('jwt 가지고 오셈');
end
```

# 소켓 연결 직후
- 영속성을 위해 세션을 저장해준다.
- blockList client로 내려줌
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant rt as RoomTable

c->>ga: <<connection>>
ga->>cs: getBlockList(userID) :string[]
ss->>ga: string[[userID], ...]
ga->>c: to(userID)<<getBlockList>> {string[userID, ...]}
c->>cls: {blockList: string[userID, ...]}

ga->>cs: getMessageForUser(userID)
cs->>ms: findMessagesForUser(userID)
ms->>cs: Message[{msg, from, to}, ...]
cs->>cs: getMessagePerUser(Message[]):[otherUserID:[Message], ...]
cs->>ss: findAllSessions()
ss->>cs: Session{userID, userName, connected, Message}[]
cs->>cs: findAllSessions().forEach(session=>Message채워넣기)
cs->>c: to(userID).<<getPreLogs>> (Session[])

ga->>c: broadcast<<userEnter>> (user.{userID, userName, connected})
```

# 소켓 연결 끊겼을 때
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant rt as RoomTable

c->>ga: <<disconnection>>
ga->>rt: io.in(userID).allSockets() : Promise<Socket>
rt->>ga: matchingSockets
alt matchingSockets.size == 0
ga->>c: broadcast<<userExit>> (userID)
ga->>ss: saveSession({userID:{userName, connected(false)})
end
```

# inChannel
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant r as rooms
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant rt as RoomTable

c->>ga: <<inChannel>>(channelName)
cs->>cs: enterChannel(client, channelName) :channelName
cs->>rt: client.rooms.has(channelName)
rt->>cs: bool
alt: false
cs->>cs: getChannelFullName(client.rooms, /^room:user:/):string[]
loop
cs->>rt: leave(삭제할 방 이름)
end
cs->>rt: join(channelName)
cs->>ga: broadcast.except(channelName)<<UserEnteredServer>>{userID, channelName}
cs->>ga: to(channelName)<<getMessage>>(`${userName}님이 ${channelName}에 입장하셨습니다`}
```

# outChannel
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant r as Repository
participant rt as RoomTable

c->>ga: <<outChannel>>
ga->>cs: getChannelFullName(client.rooms, /^room:user:/):string[]
cs->> ga: string[]
ga->>cs: exitChannel(client,string[])
cs->>rt: leave(channelName)
alt 
sc->>c: broadcast<<getMessage>>(`${userName}님이 퇴장하셨습니다.`)
sc->>c: broadcast.except(channelName)<<outChannel>>(userID)
end
```

# block
- 상대의 DM을 안받는다. => 모든 DM은 pass된다. 대신 초기 connection에서 DB를 뒤져 blocklist를 local storage로 내려준다. client는 일단 DM을 받고 localStorage를 뒤져서 있으면 뿌려주고 없으면 무시한다.
- unfollow처리한다.
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant r as Repository
participant rt as RoomTable

c->>ga: <<block>>(badGuyID)
ga->>cs: block(badGuyID, client.userID)
cs->>r: saveBlock(userID, badGuyID)

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
participant cs as ChannelService
participant r as Repository
participant rt as RoomTable

c->>ga: follow(targetId)
ga->>cs: friendChanged(userID, targetId, isFollowing(true))
alt isFollowing = true
cs->>r: saveFollow(userID, targetID);
end
```
# unfollow
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant r as Repository
participant rt as RoomTable

c->>ga: unfollow(targetId)
ga->>c: friendChanged(userID, targetId, isFollowing(false))
alt isFollowing = false
cs->>r: deleteFollow(userID, targetID)
end
```

# sendDM
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant r as Repository
participant rt as RoomTable

c->>ga: sendDM(msg, recipientID)
ga->>c: to(recipientID)<<getDM>>({userID, userName, msg})
```

# sendMSG
- channel단위 msg 전송
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant r as Repository
participant rt as RoomTable

c->>ga: sendMSG(msg)
ga->>cs: getChannelFullName(client.rooms, /^room:user:/):string[]
cs->> ga: string[]
ga-->>c: to(channelName)<<getMSG>>({userID, userName, msg})
```

# kickOut
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant r as Repository
participant rt as RoomTable

c->>ga: kickOut(badGuyId)
ga->>cs: kickOut(client, badGuyId)
cs->>cs: getChannelFullName(client.rooms, /^room:user:/):string[]
cs->>cns: this.channelList[channelName]
cns->>cs: ChannelInfoDto
alt ChannelInfoDto.adminID == userID
cs->>rt: to(badGuyId).leave(channelName)
rt->>c: to(badGuyId)<<expelled>>(you are expelled from ${channelName})
end
```
# modifyGame
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant r as Repository
participant rt as RoomTable

c->>ga: <<modifyGame>> (ChannelInfoDto{pw, score, adminID, accessLayer})
ga->>cs: modifyGame(client, ChannelInfoDto)
cs->>cs: getChannelFullName(client.rooms, /^room:user:/):string[]
cs->>cns: this.channelList[channelName]
cns->>cs: ChannelInfoDto
alt ChannelInfoDto.adminID == adminID
cs->>cns: channelList[channelName].[pw, score, admin, accessLayer] = [pw, score, admin, accessLayer]
cs-->>c: broadcast<<gameModified>>(ChannelDto{channelName, accessLayer, score, adminID})
end
```
# inviteUser
- ChannelName은 room:user:[userID]
- 초대 받은 사람은 강제소환됨.
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant r as Repository
participant rt as RoomTable

c->>ga: inviteUser(invitedUserId)
ga->>cs: inviteUser(client, invitedUserId)
cs->>cs: createChannel(client{userID}, ChannelInfoDto) : {channelDto}
cs->>rt: join(channelName)
cs->>c: to(invitedUserID)<<getInvitation>>({msg: 'you are invited to ${userName}', inviter: userID, ChannelDto})
```

# mute

```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant r as Repository
participant rt as RoomTable

c->>ga: <<mute>>(noisyGuyID)
ga-->>c: mute(client, noisyGuyID)
cs->>cs: getChannelFullName(client.rooms, /^room:user:/):string[]
cs->>cns: this.channelList[channelName]
cns->>cs: ChannelInfoDto
alt ChannelInfoDto.adminID == userID
cs->>c: to(noisyGuyID)<<muted>>
c->>c: stop sending <sendMSG> events for 3mins
end
cs->>ga: to(userID)<<nuAuthorized>>('you aren't authorized.')
```
# waitingGame
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant r as Repository
participant rt as RoomTable

c->>ga: waitingGame()
ga->>cs: waitingGame(client)
cs->>cs: getChannelFullName(client.rooms, /^room:user:/):string[]
cs->>cns: this.channelList[channelName]
cns->>cs: ChannelInfoDto
cs->>cs: ChannelInfoDto.game.enqueue(UserDto{userID, userName})
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
participant cs as ChannelService
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
participant cs as ChannelService
participant r as Repository
participant rt as RoomTable

c->>ga: readyGame()
alt: isParticipantsTwo()
ga-->>c: (channel)startGame()#toDo:나중에 game 디테일
end
ga-->>c: (channel)readyGame(userId)
```
# endGame
```mermaid
sequenceDiagram
participant cls as clientStorage
participant c as client
participant ga as server
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant r as Repository
participant rt as RoomTable

c->>ga: endGame()#client가 participant면
ga-->>c:endGame()
```
# generateGame
- private(target에게 dm이 감), protected(pw있어야 함)
```mermaid
sequenceDiagram
participant cs as clientStorage
participant c as client
participant ga as server
participant r as rooms
participant ss as sessionStore
participant ms as MessageStore
participant cns as ChannelList
participant cs as ChannelService
participant rt as RoomTable

c->>ga: <<generateGame>>(ChannelInfoDto{channelName, accessLayer, pw, score, targetID})
ga->>cs: createChannel(client{userID}, ChannelInfoDto) : {channelDto, targetID}
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
alt targetID
ga->>c: to(targetID)<<gameGenerated>>(ChannelInfoDto)
end
ga->>c: (broadcast)<<gameGenerated>>(ChannelDto)
```