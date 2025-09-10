/**
 * 射箭记分工具类 - 专为微信小程序优化
 * 提供得分计算、统计分析、性能评估等功能
 */

class ArcheryScoring {
  constructor() {
    // 靶纸规格配置 (单位: cm)
    this.targetSpecs = {
      '18m': { diameter: 40, rings: 10, distance: 18 },
      '30m': { diameter: 80, rings: 10, distance: 30 },
      '50m': { diameter: 80, rings: 10, distance: 50 },
      '70m': { diameter: 122, rings: 10, distance: 70 }
    };
  }

  /**
   * 计算精度得分
   * @param {number} distance 距离中心的距离(cm)
   * @param {string} targetType 靶纸类型
   * @returns {number} 得分(1-10)
   */
  calculatePrecisionScore(distance, targetType = '18m') {
    try {
      const targetSpec = this.targetSpecs[targetType] || this.targetSpecs['18m'];
      const targetDiameter = targetSpec.diameter;
      
      // 将距离转换为环数
      const maxRadius = targetDiameter / 2;
      const ringWidth = maxRadius / 10;
      
      if (distance <= ringWidth) {
        return 10;
      } else if (distance <= ringWidth * 2) {
        return 9;
      } else if (distance <= ringWidth * 3) {
        return 8;
      } else if (distance <= ringWidth * 4) {
        return 7;
      } else if (distance <= ringWidth * 5) {
        return 6;
      } else if (distance <= ringWidth * 6) {
        return 5;
      } else if (distance <= ringWidth * 7) {
        return 4;
      } else if (distance <= ringWidth * 8) {
        return 3;
      } else if (distance <= ringWidth * 9) {
        return 2;
      } else {
        return 1;
      }
    } catch (error) {
      console.error('精度得分计算失败:', error);
      return 0;
    }
  }

  /**
   * 计算组射得分
   * @param {Array} shots 箭矢位置数组 [{x, y}, ...]
   * @returns {Object} 组射分析结果
   */
  calculateGroupScore(shots) {
    try {
      if (shots.length < 2) {
        return { groupSize: 0, groupScore: 0, center: { x: 0, y: 0 } };
      }
      
      // 计算所有箭矢的中心点
      const centerX = shots.reduce((sum, shot) => sum + shot.x, 0) / shots.length;
      const centerY = shots.reduce((sum, shot) => sum + shot.y, 0) / shots.length;
      
      // 计算组射大小（最大距离）
      let maxDistance = 0;
      shots.forEach(shot => {
        const distance = Math.sqrt(
          Math.pow(shot.x - centerX, 2) + Math.pow(shot.y - centerY, 2)
        );
        maxDistance = Math.max(maxDistance, distance);
      });
      
      // 根据组射大小评分
      let groupScore = 0;
      if (maxDistance <= 2) { // 2cm以内
        groupScore = 10;
      } else if (maxDistance <= 4) {
        groupScore = 8;
      } else if (maxDistance <= 6) {
        groupScore = 6;
      } else if (maxDistance <= 8) {
        groupScore = 4;
      } else {
        groupScore = 2;
      }
      
      return {
        groupSize: Math.round(maxDistance * 100) / 100,
        groupScore: groupScore,
        center: { x: Math.round(centerX * 100) / 100, y: Math.round(centerY * 100) / 100 },
        shotCount: shots.length
      };
    } catch (error) {
      console.error('组射得分计算失败:', error);
      return { groupSize: 0, groupScore: 0, center: { x: 0, y: 0 } };
    }
  }

  /**
   * 计算总分和统计信息
   * @param {Array} scores 得分数组
   * @returns {Object} 统计信息
   */
  calculateTotalScore(scores) {
    try {
      if (!scores || scores.length === 0) {
        return {};
      }
      
      const total = scores.reduce((sum, score) => sum + score, 0);
      const average = total / scores.length;
      const maxScore = Math.max(...scores);
      const minScore = Math.min(...scores);
      
      // 计算标准差
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
      const stdDev = Math.sqrt(variance);
      
      // 计算命中率
      const hitRates = {};
      for (let i = 1; i <= 10; i++) {
        hitRates[`${i}环`] = scores.filter(score => score === i).length;
      }
      
      return {
        totalScore: total,
        averageScore: Math.round(average * 100) / 100,
        maxScore: maxScore,
        minScore: minScore,
        stdDeviation: Math.round(stdDev * 100) / 100,
        shotCount: scores.length,
        hitRates: hitRates,
        consistency: this.calculateConsistency(scores)
      };
    } catch (error) {
      console.error('总分计算失败:', error);
      return {};
    }
  }

  /**
   * 计算一致性指标
   * @param {Array} scores 得分数组
   * @returns {Object} 一致性分析
   */
  calculateConsistency(scores) {
    try {
      if (scores.length < 2) {
        return { consistencyScore: 0, trend: 'stable' };
      }
      
      // 计算连续得分的变化
      const changes = [];
      for (let i = 1; i < scores.length; i++) {
        changes.push(scores[i] - scores[i - 1]);
      }
      
      if (changes.length === 0) {
        return { consistencyScore: 0, trend: 'stable' };
      }
      
      // 计算变化的标准差
      const changeAvg = changes.reduce((sum, change) => sum + change, 0) / changes.length;
      const changeVariance = changes.reduce((sum, change) => sum + Math.pow(change - changeAvg, 2), 0) / changes.length;
      const changeStd = Math.sqrt(changeVariance);
      
      // 一致性评分（变化越小，一致性越高）
      const consistencyScore = Math.max(0, 10 - changeStd);
      
      // 判断趋势
      let trend = 'stable';
      if (changeAvg > 0.5) {
        trend = 'improving';
      } else if (changeAvg < -0.5) {
        trend = 'declining';
      }
      
      return {
        consistencyScore: Math.round(consistencyScore * 100) / 100,
        trend: trend,
        changeStd: Math.round(changeStd * 100) / 100,
        changeAvg: Math.round(changeAvg * 100) / 100
      };
    } catch (error) {
      console.error('一致性计算失败:', error);
      return { consistencyScore: 0, trend: 'stable' };
    }
  }

  /**
   * 计算让分
   * @param {Array} scores 得分数组
   * @param {string} targetType 靶纸类型
   * @returns {Object} 让分分析
   */
  calculateHandicap(scores, targetType = '18m') {
    try {
      if (!scores || scores.length === 0) {
        return {};
      }
      
      const maxPossibleScore = scores.length * 10;
      const actualScore = scores.reduce((sum, score) => sum + score, 0);
      
      // 计算让分
      const handicap = maxPossibleScore - actualScore;
      
      // 计算让分等级
      let handicapLevel = 'E';
      if (handicap <= 5) {
        handicapLevel = 'A';
      } else if (handicap <= 15) {
        handicapLevel = 'B';
      } else if (handicap <= 30) {
        handicapLevel = 'C';
      } else if (handicap <= 50) {
        handicapLevel = 'D';
      }
      
      return {
        handicap: handicap,
        handicapLevel: handicapLevel,
        maxPossible: maxPossibleScore,
        actualScore: actualScore,
        efficiency: Math.round((actualScore / maxPossibleScore) * 10000) / 100
      };
    } catch (error) {
      console.error('让分计算失败:', error);
      return {};
    }
  }

  /**
   * 综合分析表现
   * @param {Array} scores 得分数组
   * @param {string} targetType 靶纸类型
   * @returns {Object} 综合分析结果
   */
  analyzePerformance(scores, targetType = '18m') {
    try {
      // 基础统计
      const basicStats = this.calculateTotalScore(scores);
      
      // 一致性分析
      const consistency = this.calculateConsistency(scores);
      
      // 让分分析
      const handicap = this.calculateHandicap(scores, targetType);
      
      // 表现评级
      const performanceGrade = this.gradePerformance(basicStats, consistency);
      
      return {
        basic_stats: basicStats,
        consistency: consistency,
        handicap: handicap,
        performance_grade: performanceGrade,
        recommendations: this.generateRecommendations(basicStats, consistency)
      };
    } catch (error) {
      console.error('表现分析失败:', error);
      return {};
    }
  }

  /**
   * 评级表现
   * @param {Object} basicStats 基础统计
   * @param {Object} consistency 一致性分析
   * @returns {string} 表现等级
   */
  gradePerformance(basicStats, consistency) {
    try {
      if (!basicStats || !consistency) {
        return 'F';
      }
      
      const avgScore = basicStats.averageScore || 0;
      const consistencyScore = consistency.consistencyScore || 0;
      
      // 综合评分
      const overallScore = (avgScore * 0.7) + (consistencyScore * 0.3);
      
      if (overallScore >= 9.0) {
        return 'A+';
      } else if (overallScore >= 8.0) {
        return 'A';
      } else if (overallScore >= 7.0) {
        return 'B+';
      } else if (overallScore >= 6.0) {
        return 'B';
      } else if (overallScore >= 5.0) {
        return 'C+';
      } else if (overallScore >= 4.0) {
        return 'C';
      } else if (overallScore >= 3.0) {
        return 'D';
      } else {
        return 'F';
      }
    } catch (error) {
      console.error('表现评级失败:', error);
      return 'F';
    }
  }

  /**
   * 生成改进建议
   * @param {Object} basicStats 基础统计
   * @param {Object} consistency 一致性分析
   * @returns {Array} 建议列表
   */
  generateRecommendations(basicStats, consistency) {
    const recommendations = [];
    
    try {
      if (!basicStats || !consistency) {
        return ['数据不足，无法生成建议'];
      }
      
      const avgScore = basicStats.averageScore || 0;
      const stdDev = basicStats.stdDeviation || 0;
      const consistencyScore = consistency.consistencyScore || 0;
      
      // 基于平均分的建议
      if (avgScore < 5) {
        recommendations.push('建议加强基础训练，提高瞄准精度');
      } else if (avgScore < 7) {
        recommendations.push('可以尝试调整姿势和呼吸技巧');
      } else if (avgScore < 8) {
        recommendations.push('注意细节，提高稳定性');
      } else {
        recommendations.push('表现优秀，继续保持');
      }
      
      // 基于一致性的建议
      if (consistencyScore < 5) {
        recommendations.push('建议练习一致性训练，减少得分波动');
      } else if (consistencyScore < 7) {
        recommendations.push('可以尝试固定动作流程，提高稳定性');
      }
      
      // 基于标准差的建议
      if (stdDev > 2) {
        recommendations.push('得分波动较大，建议练习固定距离射击');
      }
      
      return recommendations;
    } catch (error) {
      console.error('建议生成失败:', error);
      return ['无法生成建议'];
    }
  }

  /**
   * 计算距离
   * @param {number} x1 点1的x坐标
   * @param {number} y1 点1的y坐标
   * @param {number} x2 点2的x坐标
   * @param {number} y2 点2的y坐标
   * @returns {number} 距离
   */
  calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * 像素距离转换为实际距离
   * @param {number} pixelDistance 像素距离
   * @param {number} targetDiameter 靶纸实际直径(cm)
   * @param {number} targetPixelDiameter 靶纸像素直径
   * @returns {number} 实际距离(cm)
   */
  pixelToRealDistance(pixelDistance, targetDiameter, targetPixelDiameter) {
    return (pixelDistance * targetDiameter) / targetPixelDiameter;
  }

  /**
   * 获取靶纸规格
   * @param {string} targetType 靶纸类型
   * @returns {Object} 靶纸规格
   */
  getTargetSpec(targetType) {
    return this.targetSpecs[targetType] || this.targetSpecs['18m'];
  }

  /**
   * 验证得分
   * @param {number} score 得分
   * @returns {boolean} 是否有效
   */
  isValidScore(score) {
    return Number.isInteger(score) && score >= 1 && score <= 10;
  }

  /**
   * 格式化得分数组
   * @param {Array} scores 得分数组
   * @returns {Array} 格式化后的得分数组
   */
  formatScores(scores) {
    if (!Array.isArray(scores)) {
      return [];
    }
    
    return scores.map(score => {
      const numScore = parseInt(score);
      return this.isValidScore(numScore) ? numScore : 0;
    }).filter(score => score > 0);
  }
}

// 创建单例实例
const archeryScoring = new ArcheryScoring();

module.exports = archeryScoring;
