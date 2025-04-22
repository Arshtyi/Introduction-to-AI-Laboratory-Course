import cv2
import os
# TODO: write some code to read an image, save it, and display it
# Note: the cwd is the root of the project
# Read an image
image_path = 'assets/image/mario.png'  # Adjust path as needed
img = cv2.imread(image_path)

if img is None:
    print(f"Error: Could not read image from {image_path}")
else:
    # Save the image
    output_path = 'output/mario.png'
    # Create output directory if it doesn't exist
    output_dir = os.path.dirname(output_path)
    os.makedirs(output_dir, exist_ok=True)
    # Save the image
    cv2.imwrite(output_path, img)
    print(f"Image saved to {output_path}")
    
    # Display the image
    cv2.imshow('Image', img)
    cv2.waitKey(0)  # Wait until a key is pressed
    cv2.destroyAllWindows()