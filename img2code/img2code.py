"""
References
- https://stackoverflow.com/a/237747/13109740
- https://stackoverflow.com/questions/57496971/map-colors-in-image-to-closest-member-of-a-list-of-colors-in-python
- https://stackoverflow.com/questions/36468530/changing-pixel-color-value-in-pil

This script is implemented without argparse in this prototype.
ROADMAP:
    - Allow user to specify shit load of arguments.
    - Allow user to specify a custom palette.
"""
from PIL import Image, ImageColor
import matplotlib.pyplot as plt

DIM = 16
BSIZE = 3
hexcolors = ["#FFFFFF","#E4E4E4","#888888","#222222","#FFA7D1","#E50000","#E59500","#A06A42","#E5D900","#94E044","#02BE01","#00D3DD","#0083C7","#0000EA","#CF6EE4","#820080"]

# convert hexcolors to rgb colors
colorsDict = {}
colors = []
for i, hc in enumerate(hexcolors):
    rgb = ImageColor.getrgb(hc)
    colors+=list(rgb)
    colorsDict[rgb] = i

qColors = colors

pimage = Image.new("P", (1, 1), 0)
pimage.putpalette(qColors)
img = Image.open("sb.jpg").convert("RGB")

res = img.quantize(palette=pimage, dither=Image.Dither.NONE).convert("RGB")
res = res.resize((DIM, DIM), Image.Resampling.NEAREST)

res.save("out_image.png")

plt.imshow(res)
plt.show()

code = "P"

for y in range(DIM):
    for x in reversed(range(DIM)):
        target = (x,y)
        color = res.getpixel(target)

        # fetch color
        colorX = (2 + colorsDict[color])
        code += "D" * colorX

        code += "S"

        code += "A" * (colorX)
        
        # draw
        # move to target
        code += "W" * (DIM-y+1)
        code += "D" * (x+1)
        
        # move to palette row
        code+="S" * (DIM-y)

        # move to palette left
        code+="A" * (x+1)
print(code)