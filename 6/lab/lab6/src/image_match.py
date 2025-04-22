import os
os.environ["QT_QPA_PLATFORM"] = "xcb"

# 设置 matplotlib 后端为 TkAgg，这是一个常用的交互式后端
import matplotlib
matplotlib.use('TkAgg')  # 在导入 pyplot 之前设置后端

import cv2
import matplotlib.pyplot as plt

# template matching methods
METHODS = {
    'cv2.TM_SQDIFF': cv2.TM_SQDIFF,
    'cv2.TM_SQDIFF_NORMED': cv2.TM_SQDIFF_NORMED,
    'cv2.TM_CCORR': cv2.TM_CCORR,
    'cv2.TM_CCORR_NORMED': cv2.TM_CCORR_NORMED,
    'cv2.TM_CCOEFF': cv2.TM_CCOEFF,
    'cv2.TM_CCOEFF_NORMED': cv2.TM_CCOEFF_NORMED,
}

# image and template paths
image_path = 'assets/image/scene_0.png'
template_path = 'assets/image/mario.png'

# Read image and template
image = cv2.imread(image_path)
template = cv2.imread(template_path)

if image is None or template is None:
    print(f"Error: Could not read image or template")
    exit()

# Convert images to grayscale
gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
template = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)  # Convert template to grayscale

plt.figure()

for i, (method_name, method) in enumerate(METHODS.items()):
    temp_image = image.copy()

    # Apply template matching
    result = cv2.matchTemplate(gray_image, template, method)
    
    # Get the best match location
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
    
    # If the method is TM_SQDIFF or TM_SQDIFF_NORMED, take minimum location
    # otherwise take maximum location
    if method in [cv2.TM_SQDIFF, cv2.TM_SQDIFF_NORMED]:
        top_left = min_loc
    else:
        top_left = max_loc
    
    # Calculate bottom right point
    h, w = template.shape
    bottom_right = (top_left[0] + w, top_left[1] + h)
    
    # Draw rectangle on the image
    cv2.rectangle(temp_image, top_left, bottom_right, (0, 255, 0), 2)
    # Draw rectangle around the matched region
    # (Rectangle is already drawn with cv2.rectangle above)
    # Display matching score
    if method in [cv2.TM_SQDIFF, cv2.TM_SQDIFF_NORMED]:
        score = min_val
    else:
        score = max_val
    cv2.putText(temp_image, f"Score: {score:.4f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    # draw the result in the matplotlib figure
    plt.subplot(3, 2, i + 1)
    plt.imshow(cv2.cvtColor(temp_image, cv2.COLOR_BGR2RGB))
    plt.title(method_name)
    plt.axis('off')

    # resize the image for better visualization, change the scale factor as needed
    cv2.resize(temp_image, None, fx=.4, fy=.4)

    # 调整窗口大小
    display_image = cv2.resize(temp_image, None, fx=0.6, fy=0.6)
    cv2.namedWindow(f"Template Matching - {method_name}", cv2.WINDOW_NORMAL)
    cv2.resizeWindow(f"Template Matching - {method_name}", 800, 600)
    cv2.imshow(f"Template Matching - {method_name}", display_image)

    # 等待用户按任意键继续
    cv2.waitKey(1000)  # 等待用户按任意键
    cv2.destroyAllWindows()

    # 保存结果图像到output文件夹
    output_path = f'output/template_match_{method_name.replace("cv2.", "")}.png'
    cv2.imwrite(output_path, temp_image)
    print(f"已保存结果为: {output_path}")

# show the matplotlib figure
plt.tight_layout()
plt.show()
