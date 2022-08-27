import UserRepository from '@repository/user.repository';
import UserAchievementRepository from '@repository/user.achievement.repository';
import FollowRepository from '@repository/follow.repository';
import BlockRepository from '@repository/block.repository';
import AchievementRepository from '@repository/achievement.repository';
import GameLogRepository from '@repository/game.log.repository';

const repositories = [
  UserRepository,
  UserAchievementRepository,
  FollowRepository,
  BlockRepository,
  AchievementRepository,
  GameLogRepository,
];

export default repositories;
