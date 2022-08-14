import Users from '@util/entity/user.entity';
import UserAchievements from '@util/entity/user.achievement.entity';
import Follows from '@util/entity/follow.entity';
import Blocks from '@util/entity/block.entity';
import Achievements from '@util/entity/achievement.entity';
import GameLogs from '@util/entity/game.log.entity';

const entities = [
  Users,
  UserAchievements,
  Follows,
  Blocks,
  Achievements,
  GameLogs,
];

export default entities;
