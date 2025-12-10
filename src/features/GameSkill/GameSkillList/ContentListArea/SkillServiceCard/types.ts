import type { SkillServiceItemVO } from '../../../api/types';

export interface SkillServiceCardProps {
  item: SkillServiceItemVO;
  onPress?: (item: SkillServiceItemVO) => void;
}
