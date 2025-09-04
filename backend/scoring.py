import math
from typing import Tuple, List, Dict, Any
from config import Config
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ArcheryScoring:
    def __init__(self):
        self.config = Config()
        self.target_specs = self.config.TARGET_SPECS
        
    def calculate_precision_score(self, distance: float, target_type: str = '18m') -> int:
        """计算精度得分"""
        try:
            target_spec = self.target_specs.get(target_type, self.target_specs['18m'])
            target_diameter = target_spec['diameter']
            
            # 将距离转换为环数
            max_radius = target_diameter / 2
            ring_width = max_radius / 10
            
            if distance <= ring_width:
                return 10
            elif distance <= ring_width * 2:
                return 9
            elif distance <= ring_width * 3:
                return 8
            elif distance <= ring_width * 4:
                return 7
            elif distance <= ring_width * 5:
                return 6
            elif distance <= ring_width * 6:
                return 5
            elif distance <= ring_width * 7:
                return 4
            elif distance <= ring_width * 8:
                return 3
            elif distance <= ring_width * 9:
                return 2
            else:
                return 1
                
        except Exception as e:
            logger.error(f"精度得分计算失败: {str(e)}")
            return 0
    
    def calculate_group_score(self, shots: List[Tuple[float, float]]) -> Dict[str, Any]:
        """计算组射得分"""
        try:
            if len(shots) < 2:
                return {'group_size': 0, 'group_score': 0, 'center': (0, 0)}
            
            # 计算所有箭矢的中心点
            center_x = sum(x for x, y in shots) / len(shots)
            center_y = sum(y for x, y in shots) / len(shots)
            
            # 计算组射大小（最大距离）
            max_distance = 0
            for x, y in shots:
                distance = math.sqrt((x - center_x)**2 + (y - center_y)**2)
                max_distance = max(max_distance, distance)
            
            # 根据组射大小评分
            if max_distance <= 2:  # 2cm以内
                group_score = 10
            elif max_distance <= 4:
                group_score = 8
            elif max_distance <= 6:
                group_score = 6
            elif max_distance <= 8:
                group_score = 4
            else:
                group_score = 2
            
            return {
                'group_size': round(max_distance, 2),
                'group_score': group_score,
                'center': (round(center_x, 2), round(center_y, 2)),
                'shot_count': len(shots)
            }
            
        except Exception as e:
            logger.error(f"组射得分计算失败: {str(e)}")
            return {'group_size': 0, 'group_score': 0, 'center': (0, 0)}
    
    def calculate_total_score(self, scores: List[int]) -> Dict[str, Any]:
        """计算总分和统计信息"""
        try:
            if not scores:
                return {}
            
            total = sum(scores)
            average = total / len(scores)
            max_score = max(scores)
            min_score = min(scores)
            
            # 计算标准差
            variance = sum((score - average) ** 2 for score in scores) / len(scores)
            std_dev = math.sqrt(variance)
            
            # 计算命中率
            hit_rates = {}
            for i in range(1, 11):
                hit_rates[f'{i}环'] = scores.count(i)
            
            return {
                'total_score': total,
                'average_score': round(average, 2),
                'max_score': max_score,
                'min_score': min_score,
                'std_deviation': round(std_dev, 2),
                'shot_count': len(scores),
                'hit_rates': hit_rates,
                'consistency': self.calculate_consistency(scores)
            }
            
        except Exception as e:
            logger.error(f"总分计算失败: {str(e)}")
            return {}
    
    def calculate_consistency(self, scores: List[int]) -> Dict[str, Any]:
        """计算一致性指标"""
        try:
            if len(scores) < 2:
                return {'consistency_score': 0, 'trend': 'stable'}
            
            # 计算连续得分的变化
            changes = []
            for i in range(1, len(scores)):
                changes.append(scores[i] - scores[i-1])
            
            # 计算变化的标准差
            if changes:
                change_avg = sum(changes) / len(changes)
                change_variance = sum((c - change_avg) ** 2 for c in changes) / len(changes)
                change_std = math.sqrt(change_variance)
                
                # 一致性评分（变化越小，一致性越高）
                consistency_score = max(0, 10 - change_std)
                
                # 判断趋势
                if change_avg > 0.5:
                    trend = 'improving'
                elif change_avg < -0.5:
                    trend = 'declining'
                else:
                    trend = 'stable'
                
                return {
                    'consistency_score': round(consistency_score, 2),
                    'trend': trend,
                    'change_std': round(change_std, 2),
                    'change_avg': round(change_avg, 2)
                }
            
            return {'consistency_score': 0, 'trend': 'stable'}
            
        except Exception as e:
            logger.error(f"一致性计算失败: {str(e)}")
            return {'consistency_score': 0, 'trend': 'stable'}
    
    def calculate_handicap(self, scores: List[int], target_type: str = '18m') -> Dict[str, Any]:
        """计算让分（用于不同水平选手比赛）"""
        try:
            if not scores:
                return {}
            
            target_spec = self.target_specs.get(target_type, self.target_specs['18m'])
            max_possible_score = len(scores) * 10
            actual_score = sum(scores)
            
            # 计算让分
            handicap = max_possible_score - actual_score
            
            # 计算让分等级
            if handicap <= 5:
                handicap_level = 'A'
            elif handicap <= 15:
                handicap_level = 'B'
            elif handicap <= 30:
                handicap_level = 'C'
            elif handicap <= 50:
                handicap_level = 'D'
            else:
                handicap_level = 'E'
            
            return {
                'handicap': handicap,
                'handicap_level': handicap_level,
                'max_possible': max_possible_score,
                'actual_score': actual_score,
                'efficiency': round(actual_score / max_possible_score * 100, 2)
            }
            
        except Exception as e:
            logger.error(f"让分计算失败: {str(e)}")
            return {}
    
    def analyze_performance(self, scores: List[int], target_type: str = '18m') -> Dict[str, Any]:
        """综合分析表现"""
        try:
            # 基础统计
            basic_stats = self.calculate_total_score(scores)
            
            # 一致性分析
            consistency = self.calculate_consistency(scores)
            
            # 让分分析
            handicap = self.calculate_handicap(scores, target_type)
            
            # 表现评级
            performance_grade = self.grade_performance(basic_stats, consistency)
            
            return {
                'basic_stats': basic_stats,
                'consistency': consistency,
                'handicap': handicap,
                'performance_grade': performance_grade,
                'recommendations': self.generate_recommendations(basic_stats, consistency)
            }
            
        except Exception as e:
            logger.error(f"表现分析失败: {str(e)}")
            return {}
    
    def grade_performance(self, basic_stats: Dict[str, Any], consistency: Dict[str, Any]) -> str:
        """评级表现"""
        try:
            if not basic_stats:
                return 'F'
            
            avg_score = basic_stats.get('average_score', 0)
            consistency_score = consistency.get('consistency_score', 0)
            
            # 综合评分
            overall_score = (avg_score * 0.7) + (consistency_score * 0.3)
            
            if overall_score >= 9.0:
                return 'A+'
            elif overall_score >= 8.0:
                return 'A'
            elif overall_score >= 7.0:
                return 'B+'
            elif overall_score >= 6.0:
                return 'B'
            elif overall_score >= 5.0:
                return 'C+'
            elif overall_score >= 4.0:
                return 'C'
            elif overall_score >= 3.0:
                return 'D'
            else:
                return 'F'
                
        except Exception as e:
            logger.error(f"表现评级失败: {str(e)}")
            return 'F'
    
    def generate_recommendations(self, basic_stats: Dict[str, Any], consistency: Dict[str, Any]) -> List[str]:
        """生成改进建议"""
        recommendations = []
        
        try:
            if not basic_stats:
                return ["数据不足，无法生成建议"]
            
            avg_score = basic_stats.get('average_score', 0)
            std_dev = basic_stats.get('std_deviation', 0)
            consistency_score = consistency.get('consistency_score', 0)
            
            # 基于平均分的建议
            if avg_score < 5:
                recommendations.append("建议加强基础训练，提高瞄准精度")
            elif avg_score < 7:
                recommendations.append("可以尝试调整姿势和呼吸技巧")
            elif avg_score < 8:
                recommendations.append("注意细节，提高稳定性")
            else:
                recommendations.append("表现优秀，继续保持")
            
            # 基于一致性的建议
            if consistency_score < 5:
                recommendations.append("建议练习一致性训练，减少得分波动")
            elif consistency_score < 7:
                recommendations.append("可以尝试固定动作流程，提高稳定性")
            
            # 基于标准差的建议
            if std_dev > 2:
                recommendations.append("得分波动较大，建议练习固定距离射击")
            
            return recommendations
            
        except Exception as e:
            logger.error(f"建议生成失败: {str(e)}")
            return ["无法生成建议"]
    
    def export_results(self, analysis_results: Dict[str, Any], format_type: str = 'json') -> str:
        """导出分析结果"""
        try:
            if format_type == 'json':
                import json
                return json.dumps(analysis_results, ensure_ascii=False, indent=2)
            elif format_type == 'csv':
                return self._convert_to_csv(analysis_results)
            else:
                return str(analysis_results)
                
        except Exception as e:
            logger.error(f"结果导出失败: {str(e)}")
            return str(analysis_results)
    
    def _convert_to_csv(self, data: Dict[str, Any]) -> str:
        """转换为CSV格式"""
        try:
            import csv
            import io
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # 写入标题行
            writer.writerow(['指标', '数值'])
            
            # 递归写入数据
            self._write_csv_recursive(writer, data, '')
            
            return output.getvalue()
            
        except Exception as e:
            logger.error(f"CSV转换失败: {str(e)}")
            return str(data)
    
    def _write_csv_recursive(self, writer, data: Any, prefix: str):
        """递归写入CSV数据"""
        if isinstance(data, dict):
            for key, value in data.items():
                current_prefix = f"{prefix}.{key}" if prefix else key
                if isinstance(value, (dict, list)):
                    self._write_csv_recursive(writer, value, current_prefix)
                else:
                    writer.writerow([current_prefix, value])
        elif isinstance(data, list):
            for i, item in enumerate(data):
                current_prefix = f"{prefix}[{i}]"
                self._write_csv_recursive(writer, item, current_prefix)
        else:
            writer.writerow([prefix, data])
