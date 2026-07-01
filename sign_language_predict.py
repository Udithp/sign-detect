import math
import numpy as np


def distance(x, y):
    return math.sqrt(((x[0] - y[0]) ** 2) + ((x[1] - y[1]) ** 2))


def predict_single(pts, white, model, return_confidence=False, raw_pts=None, input_details=None, output_details=None):
    """
    pts = flipped coords (for CNN image)
    raw_pts = unflipped coords (for heuristics). If None, uses pts.
    """
    # Use raw_pts for heuristics if provided, else fall back to pts
    h = raw_pts if raw_pts is not None else pts

    white_flat = np.array(white, dtype=np.float32)
    white_flat = white_flat.reshape(1, 400, 400, 3)
    
    model.set_tensor(input_details[0]['index'], white_flat)
    model.invoke()
    prob = model.get_tensor(output_details[0]['index'])[0]
    
    ch1_idx = int(np.argmax(prob, axis=0))
    confidence = float(prob[ch1_idx])
    ch1 = ch1_idx
    prob[ch1] = 0
    ch2 = int(np.argmax(prob, axis=0))
    prob[ch2] = 0
    ch3 = int(np.argmax(prob, axis=0))
    prob[ch3] = 0

    if (
        h[4][1] < h[3][1]
        and h[4][1] < h[5][1] - 30
        and h[4][1] < h[9][1] - 30
        and h[8][1] > h[6][1]
        and h[12][1] > h[10][1]
        and h[16][1] > h[14][1]
        and h[20][1] > h[18][1]
    ):
        ch1 = "Speak"

    pl = [ch1, ch2]

    l = [
        [5, 2], [5, 3], [3, 5], [3, 6], [3, 0], [3, 2], [6, 4], [6, 1], [6, 2], [6, 6], [6, 7], [6, 0], [6, 5],
        [4, 1], [1, 0], [1, 1], [6, 3], [1, 6], [5, 6], [5, 1], [4, 5], [1, 4], [1, 5], [2, 0], [2, 6], [4, 6],
        [1, 0], [5, 7], [1, 6], [6, 1], [7, 6], [2, 5], [7, 1], [5, 4], [7, 0], [7, 5], [7, 2],
    ]
    if pl in l:
        if h[6][1] < h[8][1] and h[10][1] < h[12][1] and h[14][1] < h[16][1] and h[18][1] < h[20][1]:
            ch1 = 0

    l = [[2, 2], [2, 1]]
    if pl in l:
        if h[5][0] < h[4][0]:
            ch1 = 0

    l = [[0, 0], [0, 6], [0, 2], [0, 5], [0, 1], [0, 7], [5, 2], [7, 6], [7, 1]]
    pl = [ch1, ch2]
    if pl in l:
        if (
            h[0][0] > h[8][0]
            and h[0][0] > h[4][0]
            and h[0][0] > h[12][0]
            and h[0][0] > h[16][0]
            and h[0][0] > h[20][0]
            and h[5][0] > h[4][0]
        ):
            ch1 = 2

    l = [[6, 0], [6, 6], [6, 2]]
    pl = [ch1, ch2]
    if pl in l:
        if distance(h[8], h[16]) < 52:
            ch1 = 2

    l = [[1, 4], [1, 5], [1, 6], [1, 3], [1, 0]]
    pl = [ch1, ch2]
    if pl in l:
        if (
            h[6][1] > h[8][1]
            and h[14][1] < h[16][1]
            and h[18][1] < h[20][1]
            and h[0][0] < h[8][0]
            and h[0][0] < h[12][0]
            and h[0][0] < h[16][0]
            and h[0][0] < h[20][0]
        ):
            ch1 = 3

    l = [[4, 6], [4, 1], [4, 5], [4, 3], [4, 7]]
    pl = [ch1, ch2]
    if pl in l:
        if h[4][0] > h[0][0]:
            ch1 = 3

    l = [[5, 3], [5, 0], [5, 7], [5, 4], [5, 2], [5, 1], [5, 5]]
    pl = [ch1, ch2]
    if pl in l:
        if h[2][1] + 15 < h[16][1]:
            ch1 = 3

    l = [[6, 4], [6, 1], [6, 2]]
    pl = [ch1, ch2]
    if pl in l:
        if distance(h[4], h[11]) > 55:
            ch1 = 4

    l = [[1, 4], [1, 6], [1, 1]]
    pl = [ch1, ch2]
    if pl in l:
        if (
            distance(h[4], h[11]) > 50
            and h[6][1] > h[8][1]
            and h[10][1] < h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] < h[20][1]
        ):
            ch1 = 4

    l = [[3, 6], [3, 4]]
    pl = [ch1, ch2]
    if pl in l:
        if h[4][0] < h[0][0]:
            ch1 = 4

    l = [[2, 2], [2, 5], [2, 4]]
    pl = [ch1, ch2]
    if pl in l:
        if h[1][0] < h[12][0]:
            ch1 = 4

    l = [[3, 6], [3, 5], [3, 4]]
    pl = [ch1, ch2]
    if pl in l:
        if (
            h[6][1] > h[8][1]
            and h[10][1] < h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] < h[20][1]
            and h[4][1] > h[10][1]
        ):
            ch1 = 5

    l = [[3, 2], [3, 1], [3, 6]]
    pl = [ch1, ch2]
    if pl in l:
        if (
            h[4][1] + 17 > h[8][1]
            and h[4][1] + 17 > h[12][1]
            and h[4][1] + 17 > h[16][1]
            and h[4][1] + 17 > h[20][1]
        ):
            ch1 = 5

    l = [[4, 4], [4, 5], [4, 2], [7, 5], [7, 6], [7, 0]]
    pl = [ch1, ch2]
    if pl in l:
        if h[4][0] > h[0][0]:
            ch1 = 5

    l = [[0, 2], [0, 6], [0, 1], [0, 5], [0, 0], [0, 7], [0, 4], [0, 3], [2, 7]]
    pl = [ch1, ch2]
    if pl in l:
        if (
            h[0][0] < h[8][0]
            and h[0][0] < h[12][0]
            and h[0][0] < h[16][0]
            and h[0][0] < h[20][0]
        ):
            ch1 = 5

    l = [[5, 7], [5, 2], [5, 6]]
    pl = [ch1, ch2]
    if pl in l:
        if h[3][0] < h[0][0]:
            ch1 = 7

    l = [[4, 6], [4, 2], [4, 4], [4, 1], [4, 5], [4, 7]]
    pl = [ch1, ch2]
    if pl in l:
        if h[6][1] < h[8][1]:
            ch1 = 7

    l = [[6, 7], [0, 7], [0, 1], [0, 0], [6, 4], [6, 6], [6, 5], [6, 1]]
    pl = [ch1, ch2]
    if pl in l:
        if h[18][1] > h[20][1]:
            ch1 = 7

    l = [[0, 4], [0, 2], [0, 3], [0, 1], [0, 6]]
    pl = [ch1, ch2]
    if pl in l:
        if h[5][0] > h[16][0]:
            ch1 = 6

    l = [[7, 2]]
    pl = [ch1, ch2]
    if pl in l:
        if h[18][1] < h[20][1] and h[8][1] < h[10][1]:
            ch1 = 6

    l = [[2, 1], [2, 2], [2, 6], [2, 7], [2, 0]]
    pl = [ch1, ch2]
    if pl in l:
        if distance(h[8], h[16]) > 50:
            ch1 = 6

    l = [[4, 6], [4, 2], [4, 1], [4, 4]]
    pl = [ch1, ch2]
    if pl in l:
        if distance(h[4], h[11]) < 60:
            ch1 = 6

    l = [[1, 4], [1, 6], [1, 0], [1, 2]]
    pl = [ch1, ch2]
    if pl in l:
        if h[5][0] - h[4][0] - 15 > 0:
            ch1 = 6

    l = [
        [5, 0], [5, 1], [5, 4], [5, 5], [5, 6], [6, 1], [7, 6], [0, 2], [7, 1], [7, 4], [6, 6], [7, 2],
        [5, 0], [6, 3], [6, 4], [7, 5], [7, 2],
    ]
    pl = [ch1, ch2]
    if pl in l:
        if (
            h[6][1] > h[8][1]
            and h[10][1] > h[12][1]
            and h[14][1] > h[16][1]
            and h[18][1] > h[20][1]
        ):
            ch1 = 1

    l = [
        [6, 1], [6, 0], [0, 3], [6, 4], [2, 2], [0, 6], [6, 2], [7, 6], [4, 6], [4, 1], [4, 2], [0, 2], [7, 1],
        [7, 4], [6, 6], [7, 2], [7, 5], [7, 2],
    ]
    pl = [ch1, ch2]
    if pl in l:
        if (
            h[6][1] < h[8][1]
            and h[10][1] > h[12][1]
            and h[14][1] > h[16][1]
            and h[18][1] > h[20][1]
        ):
            ch1 = 1

    l = [[6, 1], [6, 0], [4, 2], [4, 1], [4, 6], [4, 4]]
    pl = [ch1, ch2]
    if pl in l:
        if (
            h[10][1] > h[12][1]
            and h[14][1] > h[16][1]
            and h[18][1] > h[20][1]
        ):
            ch1 = 1

    l = [[5, 0], [3, 4], [3, 0], [3, 1], [3, 5], [5, 5], [5, 4], [5, 1], [7, 6]]
    pl = [ch1, ch2]
    if pl in l:
        if (
            h[6][1] > h[8][1]
            and h[10][1] < h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] < h[20][1]
            and h[2][0] < h[0][0]
            and h[4][1] > h[14][1]
        ):
            ch1 = 1

    l = [[4, 1], [4, 2], [4, 4]]
    pl = [ch1, ch2]
    if pl in l:
        if (
            distance(h[4], h[11]) < 50
            and h[6][1] > h[8][1]
            and h[10][1] < h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] < h[20][1]
        ):
            ch1 = 1

    l = [[3, 4], [3, 0], [3, 1], [3, 5], [3, 6]]
    pl = [ch1, ch2]
    if pl in l:
        if (
            h[6][1] > h[8][1]
            and h[10][1] < h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] < h[20][1]
            and h[2][0] < h[0][0]
            and h[14][1] < h[4][1]
        ):
            ch1 = 1

    l = [[6, 6], [6, 4], [6, 1], [6, 2]]
    pl = [ch1, ch2]
    if pl in l:
        if h[5][0] - h[4][0] - 15 < 0:
            ch1 = 1

    l = [[5, 4], [5, 5], [5, 1], [0, 3], [0, 7], [5, 0], [0, 2], [6, 2], [7, 5], [7, 1], [7, 6], [7, 7]]
    pl = [ch1, ch2]
    if pl in l:
        if (
            h[6][1] < h[8][1]
            and h[10][1] < h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] > h[20][1]
        ):
            ch1 = 1

    l = [[1, 5], [1, 7], [1, 1], [1, 6], [1, 3], [1, 0]]
    pl = [ch1, ch2]
    if pl in l:
        if (h[4][0] < h[5][0] + 15) and (
            h[6][1] < h[8][1]
            and h[10][1] < h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] > h[20][1]
        ):
            ch1 = 7

    l = [[5, 5], [5, 0], [5, 4], [5, 1], [4, 6], [4, 1], [7, 6], [3, 0], [3, 5]]
    pl = [ch1, ch2]
    if pl in l:
        if (
            h[6][1] > h[8][1]
            and h[10][1] > h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] < h[20][1]
            and h[4][1] > h[14][1]
        ):
            ch1 = 1

    fg = 13
    l = [[3, 5], [3, 0], [3, 6], [5, 1], [4, 1], [2, 0], [5, 0], [5, 5]]
    pl = [ch1, ch2]
    if pl in l:
        if not (
            h[0][0] + fg < h[8][0]
            and h[0][0] + fg < h[12][0]
            and h[0][0] + fg < h[16][0]
            and h[0][0] + fg < h[20][0]
        ) and not (
            h[0][0] > h[8][0]
            and h[0][0] > h[12][0]
            and h[0][0] > h[16][0]
            and h[0][0] > h[20][0]
        ) and distance(h[4], h[11]) < 50:
            ch1 = 1

    l = [[5, 0], [5, 5], [0, 1]]
    pl = [ch1, ch2]
    if pl in l:
        if (
            h[6][1] > h[8][1]
            and h[10][1] > h[12][1]
            and h[14][1] > h[16][1]
        ):
            ch1 = 1

    if ch1 == 0:
        ch1 = "S"
        if (
            h[4][0] < h[6][0]
            and h[4][0] < h[10][0]
            and h[4][0] < h[14][0]
            and h[4][0] < h[18][0]
        ):
            ch1 = "A"
        if (
            h[4][0] > h[6][0]
            and h[4][0] < h[10][0]
            and h[4][0] < h[14][0]
            and h[4][0] < h[18][0]
            and h[4][1] < h[14][1]
            and h[4][1] < h[18][1]
        ):
            ch1 = "T"
        if (
            h[4][1] > h[8][1]
            and h[4][1] > h[12][1]
            and h[4][1] > h[16][1]
            and h[4][1] > h[20][1]
        ):
            ch1 = "E"
        if (
            h[4][0] > h[6][0]
            and h[4][0] > h[10][0]
            and h[4][0] > h[14][0]
            and h[4][1] < h[18][1]
        ):
            ch1 = "M"
        if (
            h[4][0] > h[6][0]
            and h[4][0] > h[10][0]
            and h[4][1] < h[18][1]
            and h[4][1] < h[14][1]
        ):
            ch1 = "N"

    if ch1 == 2:
        ch1 = "C" if distance(h[12], h[4]) > 42 else "O"

    if ch1 == 3:
        ch1 = "G" if distance(h[8], h[12]) > 72 else "H"

    if ch1 == 7:
        ch1 = "Y" if distance(h[8], h[4]) > 42 else "J"

    if ch1 == 4:
        ch1 = "L"

    if ch1 == 6:
        ch1 = "X"

    if ch1 == 5:
        if h[4][0] > h[12][0] and h[4][0] > h[16][0] and h[4][0] > h[20][0]:
            ch1 = "Z" if h[8][1] < h[5][1] else "Q"
        else:
            ch1 = "P"

    if ch1 == 1:
        if (
            h[6][1] > h[8][1]
            and h[10][1] > h[12][1]
            and h[14][1] > h[16][1]
            and h[18][1] > h[20][1]
        ):
            ch1 = "B"
        if (
            h[6][1] > h[8][1]
            and h[10][1] < h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] < h[20][1]
        ):
            ch1 = "D"
        if (
            h[6][1] < h[8][1]
            and h[10][1] > h[12][1]
            and h[14][1] > h[16][1]
            and h[18][1] > h[20][1]
        ):
            ch1 = "F"
        if (
            h[6][1] < h[8][1]
            and h[10][1] < h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] > h[20][1]
        ):
            ch1 = "I"
        if (
            h[6][1] > h[8][1]
            and h[10][1] > h[12][1]
            and h[14][1] > h[16][1]
            and h[18][1] < h[20][1]
        ):
            ch1 = "W"
        if (
            h[6][1] > h[8][1]
            and h[10][1] > h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] < h[20][1]
            and h[4][1] < h[9][1]
        ):
            ch1 = "K"
        if (
            (distance(h[8], h[12]) - distance(h[6], h[10])) < 8
            and h[6][1] > h[8][1]
            and h[10][1] > h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] < h[20][1]
        ):
            ch1 = "U"
        if (
            (distance(h[8], h[12]) - distance(h[6], h[10])) >= 8
            and h[6][1] > h[8][1]
            and h[10][1] > h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] < h[20][1]
            and h[4][1] > h[9][1]
        ):
            ch1 = "V"
        if (
            h[8][0] > h[12][0]
            and h[6][1] > h[8][1]
            and h[10][1] > h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] < h[20][1]
        ):
            ch1 = "R"

    if ch1 in (1, "E", "S", "X", "Y", "B"):
        if (
            h[6][1] > h[8][1]
            and h[10][1] < h[12][1]
            and h[14][1] < h[16][1]
            and h[18][1] > h[20][1]
        ):
            ch1 = " "

    if ch1 in ("E", "Y", "B", "Speak", "A", "S", "T", "M", "N"):
        if (h[4][0] < h[5][0]) and (
            h[6][1] > h[8][1]
            and h[10][1] > h[12][1]
            and h[14][1] > h[16][1]
            and h[18][1] > h[20][1]
        ):
            ch1 = "next"

    if (
        h[0][0] > h[8][0]
        and h[0][0] > h[12][0]
        and h[0][0] > h[16][0]
        and h[0][0] > h[20][0]
        and h[4][1] < h[8][1]
        and h[4][1] < h[12][1]
        and h[4][1] < h[16][1]
        and h[4][1] < h[20][1]
        and h[4][1] < h[6][1]
        and h[4][1] < h[10][1]
        and h[4][1] < h[14][1]
        and h[4][1] < h[18][1]
    ):
        ch1 = "Backspace"

    if not isinstance(ch1, str):
        ch1 = ""

    # HELLO gesture: thumb + index + pinky UP, middle + ring DOWN (ILY hand sign)
    if (
        h[4][1] < h[3][1]          # thumb tip above thumb knuckle
        and h[8][1] < h[6][1]      # index finger up
        and h[12][1] > h[10][1]    # middle finger curled
        and h[16][1] > h[14][1]    # ring finger curled
        and h[20][1] < h[18][1]    # pinky up
    ):
        ch1 = "HELLO"
    if return_confidence:
        return ch1, confidence
    return ch1
