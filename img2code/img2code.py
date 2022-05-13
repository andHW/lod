"""
References
- https://stackoverflow.com/a/237747/13109740
- https://stackoverflow.com/questions/57496971/map-colors-in-image-to-closest-member-of-a-list-of-colors-in-python
- https://stackoverflow.com/questions/36468530/changing-pixel-color-value-in-pil
"""
from PIL import Image, ImageColor
import matplotlib.pyplot as plt

DIM = 32
hexcolors = ["#FFFFFF","#E4E4E4","#888888","#222222","#FFA7D1","#E50000","#E59500","#A06A42","#E5D900","#94E044","#02BE01","#00D3DD","#0083C7","#0000EA","#CF6EE4","#820080"]

# convert hexcolors to rgb colors
colors = []
for hc in hexcolors:
    rgb = list(ImageColor.getrgb(hc))
    colors+=rgb

qColors = colors + [0,] * (256-len(hexcolors)) * 3

pimage = Image.new("P", (1, 1), 0)
pimage.putpalette(qColors)
img = Image.open("sb.jpg").convert("RGB")

res = img.quantize(palette=pimage, dither=Image.Dither.NONE)
img = img.resize((DIM, DIM), Image.Resampling.NEAREST)


plt.imshow(res)
plt.show()
