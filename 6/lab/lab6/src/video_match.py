import os
os.environ["QT_QPA_PLATFORM"] = "xcb"
import cv2
import numpy as np
from matplotlib import pyplot as plt

template_path = 'assets/video/obj.png'
video_path = 'assets/video/001.mp4'

os.makedirs('output', exist_ok=True)
output_path = 'output/output.mp4'

# read the template image
template = None

# read video
cap = cv2.VideoCapture(video_path)

# process the video
fps = cap.get(cv2.CAP_PROP_FPS)
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

while True:
    # get each frame
    ret, frame = cap.read()
    if not ret:
        break

    # TODO: convert the frame to grayscale
    frame_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    top_left = None
    bottom_right = None
    # Read the template if not already loaded
    if template is None:
        template = cv2.imread(template_path)
        if template is None:
            print(f"Error: Could not read template image from {template_path}")
            exit()
        template = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)  # Convert template to grayscale
    
    # Apply template matching using TM_CCOEFF_NORMED
    result = cv2.matchTemplate(frame_gray, template, cv2.TM_CCOEFF_NORMED)
    
    # Get the location of the best match
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(result)
    
    # For TM_CCOEFF_NORMED, we use the max location
    top_left = max_loc
    
    # Calculate bottom right point
    h, w = template.shape
    bottom_right = (top_left[0] + w, top_left[1] + h)
   
    cv2.rectangle(frame, top_left, bottom_right, (0, 255, 0), 2)
    # draw rectangle around the matched region
    # points = np.array([
    #     [top_left[0], top_left[1]],
    #     [bottom_right[0], top_left[1]],
    #     [bottom_right[0], bottom_right[1]],
    #     [top_left[0], bottom_right[1]]
    # ])
    # rect = cv2.minAreaRect(points)
    # box = cv2.boxPoints(rect)
    # box = np.intp(box)
    # cv2.drawContours(frame, [box], 0, (0, 255, 0), 2)
    out.write(frame)

    # TODO: show the frame with the matched region
    # 调整窗口大小
    cv2.namedWindow("Template Matching", cv2.WINDOW_NORMAL)
    cv2.resizeWindow("Template Matching", 800, 600)
    cv2.imshow("Template Matching", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
out.release()
cv2.destroyAllWindows()
print(f"Saved output video: {output_path}")
