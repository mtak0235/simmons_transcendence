import Users from '@entity/user.entity';
import UserAchievements from '@entity/user.achievement.entity';
import Follows from '@entity/follow.entity';
import Blocks from '@entity/block.entity';
import Achievements from '@entity/achievement.entity';
import GameLogs from '@entity/game.log.entity';

const entities = [
  Users,
  UserAchievements,
  Follows,
  Blocks,
  Achievements,
  GameLogs,
];

export default entities;
