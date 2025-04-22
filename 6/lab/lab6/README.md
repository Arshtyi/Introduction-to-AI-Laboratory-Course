# 计算机视觉实验

## 目录结构

```
lab6/
├── assets/
│   ├── image/              # 实验图片
│   └── video/              # 实验视频
├── src/
│   ├── get_start.py        # 学习cv2
│   ├── image_match.py      # 图像匹配
│   └── video_match.py      # 视频匹配
├── pyproject.toml						
├── README.md               # 实验说明
└── uv.lock
```



## 说明

- 阅读实验目录下的 `get_start.py` ， `image_match.py` 和 `video_match.py` 代码文件
- 根据实验要求和代码文件里的文档注释完成相关代码

  1. 学习使用 `opencv` 读取，保存，展示图片。可以使用自己的图片，放在 `assets/image` 下，注意路径。
  2. 进行图像匹配实验，理解各种相似性度量方法的含义和适用情况；针对模板与图像目标存在颜色（亮度）差异、几何形变等情况进行测试分析；同样可以使用自己的图片。
  3. 思考 `matchTemplate` 的主要限制，寻求改进方式。
  4. 在视频里进行模板匹配；思考在不考虑计算效率的情况下，有什么办法可以克服 `matchTemplate` 的主要限制，有什么方法可以进一步提高检测/跟踪的效率和稳定性。


### **注意**

- **本次实验基于 `python`，版本号不得低于 `3.12`**
### **特别注意**

- **命令行终端在云主机上直接使用就可以，在 Windows下推荐使用 cmd**

  - **如果不了解什么是 zsh，powershell 等，就不要使用**

- **实验开始务必在命令行终端输入命令`python --version`** 或者 `python3 --version`

  - **如果出现错误，那么需要安装`python`，注意版本号**
  - **如果出现版本号，那么检查版本号和要求是否一致**
  - **安装正确版本的`python`的方法可以在csdn，知乎，博客园等技术网站搜索，或者询问其他成功的同学**
  - **上次实验安装了 `anaconda` 或者 `miniconda` 的同学，需要注意在 `base` 环境下进行实验**

- **注意终端当前工作目录，即 `xxxxx >`，这里的 `xxxxx` 必须是实验目录，也就是本文件所在的目录**

  - **上次实验安装了 `anaconda` 或者 `miniconda` 的同学，终端类似于 `(base) xxx >`**
  
  

## 运行

#### 运行

- 在实验项目目录下打开命令行终端，或者直接使用 `IDE/VS Code` 里的终端
- 在终端里运行 `pip install uv`
- 需要运行 `src` 下的代码时，在终端输入 `uv run ./src/xxx.py` 执行
  - 第一次运行时，会自动下载安装依赖，在实验项目目录下出现 `.venv` 文件夹
  
  

## 参考和提示

### cv2

> 查看详细用法可以参考各种网络教程和 AI 
>

```python
# 参数:
# filename (str): 图像文件的路径。
# flags (int): 指定图像读取的方式。常见的标志有：
# 	cv2.IMREAD_COLOR (默认): 以彩色模式读取图像（忽略透明度通道）。
# 	cv2.IMREAD_GRAYSCALE: 以灰度模式读取图像。
# 	cv2.IMREAD_UNCHANGED: 以原始格式读取图像（包括Alpha通道）。
# 
# 返回值:
# 返回一个图像对象（NumPy数组），如果图像加载失败，返回 None
def imread(filename: str, flags: int = ...) -> cv2.typing.MatLike:
    ...

# 参数:
# filename (str): 保存图像的路径和文件名。
# img (cv2.typing.MatLike): 要保存的图像对象（NumPy数组）。
#
#返回值:
#返回 True 如果图像成功保存，否则返回 False。
def imwrite(filename: str, img: cv2.typing.MatLike) -> bool:
    ...

参数:
# winname (str): 显示图像的窗口名称。
# mat (cv2.typing.MatLike): 要显示的图像对象（NumPy数组）。
# 
# 返回值:
# 没有返回值。函数会弹出一个窗口显示图像。
def imshow(winname: str, mat: cv2.typing.MatLike) -> None:
    ...
    
# 参数:
# image (cv2.typing.MatLike): 输入图像。在该图像中搜索模板。
# templ (cv2.typing.MatLike): 模板图像。要搜索的小图像。
# method (int): 匹配方法。常用的方法包括：
# 
# 返回值:
# 返回一个结果图像（NumPy 数组），表示模板匹配的匹配度。每个位置的值越小或越大（取决于方法），表示匹配程度越好。
def matchTemplate(image: cv2.typing.MatLike, templ: cv2.typing.MatLike, method: int) -> cv2.typing.MatLike:
    ...
    
# 参数
# image (cv2.typing.MatLike): 输入图像。在该图像中绘制矩形。
# pt1 (cv2.typing.Point): 矩形的左上点。
# pt2 (cv2.typing.Point): 矩形的右下点。
# color (cv2.typing.Scalar): 矩形的颜色。
# thickness (int): 矩形边框的粗细。
#
# 返回值：
# 返回一个矩形（NumPy 数组）
def rectangle(img: cv2.typing.MatLike, pt1: cv2.typing.Point, pt2: cv2.typing.Point, color: cv2.typing.Scalar, thickness: int = ...) -> cv2.typing.MatLike:
    ...

# 参数
# src (cv2.typing.MatLike): 源图像。
# code (int): 指定颜色转换的方式。
#
# 返回值：
# 返回转换颜色之后的图像（NumPy数组）。
def cvtColor(src: cv2.typing.MatLike, code: int) -> cv2.typing.MatLike:
    ...
```

