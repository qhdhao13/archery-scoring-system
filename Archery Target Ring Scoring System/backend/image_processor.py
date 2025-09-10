import cv2
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt
from config import Config
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ArcheryTargetProcessor:
    def __init__(self):
        self.target_radius = 0
        self.center = None
        self.rings = []
        self.config = Config()
        
    def detect_target(self, image):
        """检测靶纸边缘和中心"""
        try:
            # 转换为灰度图
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # 高斯模糊
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # 边缘检测
            edges = cv2.Canny(blurred, 50, 150)
            
            # 霍夫圆检测
            circles = cv2.HoughCircles(
                edges, cv2.HOUGH_GRADIENT, 1, 20,
                param1=50, param2=30, 
                minRadius=self.config.TARGET_DETECTION_MIN_RADIUS, 
                maxRadius=self.config.TARGET_DETECTION_MAX_RADIUS
            )
            
            if circles is not None:
                circles = np.round(circles[0, :]).astype("int")
                # 选择最大的圆作为靶纸
                largest_circle = max(circles, key=lambda x: x[2])
                self.center = (largest_circle[0], largest_circle[1])
                self.target_radius = largest_circle[2]
                logger.info(f"检测到靶纸: 中心{self.center}, 半径{self.target_radius}")
            else:
                logger.warning("未检测到靶纸")
                
        except Exception as e:
            logger.error(f"靶纸检测失败: {str(e)}")
            
        return self.center, self.target_radius
    
    def detect_arrow(self, image):
        """检测箭矢位置"""
        try:
            # 转换为HSV色彩空间
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # 定义箭矢颜色范围（通常是黑色或深色）
            lower_black = np.array([0, 0, 0])
            upper_black = np.array([180, 255, self.config.ARROW_DETECTION_THRESHOLD])
            
            # 创建掩码
            mask = cv2.inRange(hsv, lower_black, upper_black)
            
            # 形态学操作
            kernel = np.ones((5,5), np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
            
            # 查找轮廓
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            # 选择最大的轮廓作为箭矢
            if contours:
                # 过滤掉太小的轮廓
                valid_contours = [c for c in contours if cv2.contourArea(c) > 50]
                if valid_contours:
                    largest_contour = max(valid_contours, key=cv2.contourArea)
                    M = cv2.moments(largest_contour)
                    if M["m00"] != 0:
                        cx = int(M["m10"] / M["m00"])
                        cy = int(M["m01"] / M["m00"])
                        logger.info(f"检测到箭矢: 位置({cx}, {cy})")
                        return (cx, cy)
            
            logger.warning("未检测到箭矢")
            return None
            
        except Exception as e:
            logger.error(f"箭矢检测失败: {str(e)}")
            return None
    
    def detect_multiple_arrows(self, image):
        """检测多支箭矢"""
        try:
            # 转换为HSV色彩空间
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            
            # 定义箭矢颜色范围
            lower_black = np.array([0, 0, 0])
            upper_black = np.array([180, 255, self.config.ARROW_DETECTION_THRESHOLD])
            
            # 创建掩码
            mask = cv2.inRange(hsv, lower_black, upper_black)
            
            # 形态学操作
            kernel = np.ones((5,5), np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
            
            # 查找轮廓
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            arrows = []
            for contour in contours:
                if cv2.contourArea(contour) > 50:  # 过滤小轮廓
                    M = cv2.moments(contour)
                    if M["m00"] != 0:
                        cx = int(M["m10"] / M["m00"])
                        cy = int(M["m01"] / M["m00"])
                        arrows.append((cx, cy))
            
            logger.info(f"检测到{len(arrows)}支箭矢")
            return arrows
            
        except Exception as e:
            logger.error(f"多箭矢检测失败: {str(e)}")
            return []
    
    def calculate_score(self, arrow_position, target_type='18m'):
        """计算得分"""
        if not arrow_position or not self.center:
            return 0
            
        try:
            # 获取靶纸规格
            target_spec = self.config.TARGET_SPECS.get(target_type, self.config.TARGET_SPECS['18m'])
            target_diameter = target_spec['diameter']
            
            # 计算箭矢到中心的距离
            distance = np.sqrt(
                (arrow_position[0] - self.center[0])**2 + 
                (arrow_position[1] - self.center[1])**2
            )
            
            # 将像素距离转换为实际距离（假设图像中靶纸直径对应实际直径）
            pixel_to_cm_ratio = target_diameter / (self.target_radius * 2)
            actual_distance = distance * pixel_to_cm_ratio
            
            # 根据距离计算得分
            ring_radius = target_diameter / 20  # 每环宽度
            
            if actual_distance <= ring_radius:
                return 10
            elif actual_distance <= ring_radius * 2:
                return 9
            elif actual_distance <= ring_radius * 3:
                return 8
            elif actual_distance <= ring_radius * 4:
                return 7
            elif actual_distance <= ring_radius * 5:
                return 6
            elif actual_distance <= ring_radius * 6:
                return 5
            elif actual_distance <= ring_radius * 7:
                return 4
            elif actual_distance <= ring_radius * 8:
                return 3
            elif actual_distance <= ring_radius * 9:
                return 2
            else:
                return 1
                
        except Exception as e:
            logger.error(f"得分计算失败: {str(e)}")
            return 0
    
    def draw_result(self, image, center, radius, arrow_positions, scores=None):
        """绘制检测结果"""
        result_image = image.copy()
        
        # 绘制靶纸
        if center and radius:
            # 绘制外圆
            cv2.circle(result_image, center, radius, (0, 255, 0), 2)
            # 绘制中心点
            cv2.circle(result_image, center, 2, (0, 0, 255), -1)
            
            # 绘制环线
            for i in range(1, 10):
                ring_radius = int(radius * i / 10)
                cv2.circle(result_image, center, ring_radius, (0, 255, 255), 1)
        
        # 绘制箭矢
        if arrow_positions:
            for i, pos in enumerate(arrow_positions):
                color = (255, 0, 0)  # 蓝色
                if scores and i < len(scores):
                    # 根据得分改变颜色
                    if scores[i] >= 8:
                        color = (0, 255, 0)  # 绿色（高分）
                    elif scores[i] >= 6:
                        color = (0, 255, 255)  # 黄色（中等）
                    else:
                        color = (0, 0, 255)  # 红色（低分）
                
                cv2.circle(result_image, pos, 5, color, -1)
                cv2.putText(result_image, f"{scores[i] if scores and i < len(scores) else '?'}", 
                           (pos[0]+10, pos[1]-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)
        
        return result_image
    
    def process_image(self, image_path, target_type='18m'):
        """处理图像并返回得分"""
        try:
            # 读取图像
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError("无法读取图像文件")
            
            # 检测靶纸
            center, radius = self.detect_target(image)
            
            # 检测箭矢
            arrow_positions = self.detect_multiple_arrows(image)
            
            # 计算每支箭的得分
            scores = []
            for arrow_pos in arrow_positions:
                score = self.calculate_score(arrow_pos, target_type)
                scores.append(score)
            
            # 绘制结果
            result_image = self.draw_result(image, center, radius, arrow_positions, scores)
            
            return {
                'success': True,
                'scores': scores,
                'center': center,
                'radius': radius,
                'arrow_positions': arrow_positions,
                'result_image': result_image,
                'target_type': target_type
            }
            
        except Exception as e:
            logger.error(f"图像处理失败: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def enhance_image(self, image):
        """图像增强处理"""
        try:
            # 对比度增强
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
            cl = clahe.apply(l)
            enhanced_lab = cv2.merge((cl,a,b))
            enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
            
            # 降噪
            denoised = cv2.fastNlMeansDenoisingColored(enhanced, None, 10, 10, 7, 21)
            
            return denoised
            
        except Exception as e:
            logger.error(f"图像增强失败: {str(e)}")
            return image
