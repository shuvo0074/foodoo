"""Foodoo logo generator — pure stdlib PNG writer, no image libraries needed.

Mark: a bowl with three rising steam wisps, on the brand orange gradient.
Reads as food at 48px, and the silhouette survives Android's circular mask.
"""
import zlib, struct, math, sys

# ---------------------------------------------------------------- png out
def write_png(path, w, h, px):
    raw = bytearray()
    stride = w * 4
    for y in range(h):
        raw.append(0)                      # filter: none
        raw += px[y * stride:(y + 1) * stride]
    def chunk(tag, data):
        return (struct.pack('>I', len(data)) + tag + data
                + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff))
    out = b'\x89PNG\r\n\x1a\n'
    out += chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
    out += chunk(b'IDAT', zlib.compress(bytes(raw), 9))
    out += chunk(b'IEND', b'')
    open(path, 'wb').write(out)

# ---------------------------------------------------------------- geometry
def sd_circle(x, y, cx, cy, r):
    return math.hypot(x - cx, y - cy) - r

def sd_capsule(x, y, ax, ay, bx, by, r):
    pax, pay = x - ax, y - ay
    bax, bay = bx - ax, by - ay
    denom = bax * bax + bay * bay
    h = 0.0 if denom == 0 else max(0.0, min(1.0, (pax * bax + pay * bay) / denom))
    return math.hypot(pax - bax * h, pay - bay * h) - r

def sd_round_rect(x, y, cx, cy, hw, hh, r):
    dx = abs(x - cx) - (hw - r)
    dy = abs(y - cy) - (hh - r)
    ax, ay = max(dx, 0.0), max(dy, 0.0)
    return math.hypot(ax, ay) + min(max(dx, dy), 0.0) - r

def in_mark(x, y, s):
    """x,y in 0..1. s scales the mark about the centre. True if inside."""
    x = 0.5 + (x - 0.5) / s
    y = 0.5 + (y - 0.5) / s
    # bowl: lower half of a disc
    if y >= 0.508 and sd_circle(x, y, 0.5, 0.508, 0.250) < 0:
        return True
    # rim: a capsule slightly wider than the bowl
    if sd_round_rect(x, y, 0.5, 0.500, 0.300, 0.032, 0.032) < 0:
        return True
    # three steam wisps, centre one taller
    if sd_capsule(x, y, 0.390, 0.405, 0.390, 0.312, 0.029) < 0: return True
    if sd_capsule(x, y, 0.500, 0.405, 0.500, 0.262, 0.029) < 0: return True
    if sd_capsule(x, y, 0.610, 0.405, 0.610, 0.312, 0.029) < 0: return True
    return False

def in_squircle(x, y, r=0.235):
    return sd_round_rect(x, y, 0.5, 0.5, 0.5, 0.5, r) < 0

def in_disc(x, y):
    return sd_circle(x, y, 0.5, 0.5, 0.5) < 0

# ---------------------------------------------------------------- colour
STOPS = [(0.0, (255, 149, 86)), (0.5, (255, 107, 44)), (1.0, (226, 80, 15))]

def grad(x, y):
    t = max(0.0, min(1.0, (x + y) / 2.0))
    for i in range(len(STOPS) - 1):
        t0, c0 = STOPS[i]
        t1, c1 = STOPS[i + 1]
        if t <= t1:
            k = 0 if t1 == t0 else (t - t0) / (t1 - t0)
            return tuple(round(c0[j] + (c1[j] - c0[j]) * k) for j in range(3))
    return STOPS[-1][1]

# ---------------------------------------------------------------- render
def render(path, size, shape, mark, mark_scale=1.0, ss=3):
    px = bytearray(size * size * 4)
    inv = 1.0 / size
    sub = [(i + 0.5) / ss for i in range(ss)]
    n = ss * ss
    for yi in range(size):
        row = yi * size * 4
        for xi in range(size):
            cov_shape = 0
            cov_mark = 0
            for sy in sub:
                v = (yi + sy) * inv
                for sx in sub:
                    u = (xi + sx) * inv
                    if shape is None or shape(u, v):
                        cov_shape += 1
                        if mark and in_mark(u, v, mark_scale):
                            cov_mark += 1
            i = row + xi * 4
            if cov_shape == 0:
                continue
            a_shape = cov_shape / n
            a_mark = cov_mark / n
            r, g, b = grad((xi + 0.5) * inv, (yi + 0.5) * inv) if shape is not None else (255, 255, 255)
            if shape is None:
                # foreground layer: white mark on transparent
                px[i] = px[i + 1] = px[i + 2] = 255
                px[i + 3] = round(a_mark * 255)
                continue
            k = 0.0 if a_shape == 0 else a_mark / a_shape
            px[i]     = round(r + (255 - r) * k)
            px[i + 1] = round(g + (255 - g) * k)
            px[i + 2] = round(b + (255 - b) * k)
            px[i + 3] = round(a_shape * 255)
    write_png(path, size, size, px)
    print("   wrote", path)

if __name__ == '__main__':
    out = sys.argv[1]
    render(f'{out}/master_square.png', 512, in_squircle, True, 1.0)   # legacy android
    render(f'{out}/master_full.png',   512, lambda x, y: True, True, 1.0)  # ios (system masks)
    render(f'{out}/master_round.png',  512, in_disc, True, 1.0)       # ic_launcher_round
    render(f'{out}/master_fg.png',     512, None, True, 0.72)         # adaptive foreground
    render(f'{out}/master_bg.png',     512, lambda x, y: True, False) # adaptive background

# ---------------------------------------------------------------------------
# Regenerating the app icon
#
#   python3 tools/make-logo.py /tmp/logo
#
# then resize the masters into place (sips ships with macOS):
#   iOS      : master_full  -> ios/Foodoo/Images.xcassets/AppIcon.appiconset/
#              foodoo-icon-1024.png  (1024px, must have NO alpha channel)
#   Android  : master_square -> mipmap-*/ic_launcher.png            48/72/96/144/192
#              master_round  -> mipmap-*/ic_launcher_round.png      48/72/96/144/192
#              master_fg     -> mipmap-*/ic_launcher_foreground.png 108/162/216/324/432
#              master_bg     -> mipmap-*/ic_launcher_background.png 108/162/216/324/432
#
# The adaptive foreground is drawn at 0.72 scale so the mark stays inside
# Android's 66dp safe zone once the launcher applies its mask.
# ---------------------------------------------------------------------------
