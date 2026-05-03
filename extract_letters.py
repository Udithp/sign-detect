import os
import numpy as np
from PIL import Image

def extract_letters_perfect():
    # Adjusted path to match workspace
    img_path = 'web-app/public/asl-chart.png'
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found.")
        return

    img = Image.open(img_path).convert('RGBA')
    w, h = img.size
    
    rows = 4
    cols_list = [7, 7, 8, 8]  # exact layout
    
    cell_h = h / rows
    
    # Adjusted output path
    out_dir = 'web-app/public/letters'
    os.makedirs(out_dir, exist_ok=True)
    
    letters = [
        ['A','B','C','CH','D','E','F'],
        ['G','H','I','J','K','L','LL'],
        ['M','N','Ñ','O','P','Q','R','RR'],
        ['S','T','U','V','W','X','Y','Z']
    ]

    for r in range(rows):
        cols = cols_list[r]
        cell_w = w / cols
        
        for c in range(cols):
            letter = letters[r][c]
            
            # Skip non-target letters if needed, but we'll extract them all as per script
            
            # --- Crop full cell ---
            x1 = int(c * cell_w)
            y1 = int(r * cell_h)
            x2 = int((c + 1) * cell_w)
            y2 = int((r + 1) * cell_h)
            
            cell = img.crop((x1, y1, x2, y2))
            
            # --- REMOVE BOTTOM TEXT AREA ---
            crop_top = int(cell_h * 0.05)
            crop_bottom = int(cell_h * 0.75)  # remove label completely
            cell = cell.crop((0, crop_top, cell_w, crop_bottom))
            
            # --- Convert to grayscale ---
            gray = cell.convert('L')
            arr = np.array(gray)
            
            # --- STRONG threshold (only hand strokes) ---
            mask = arr < 200   # tighter than 240
            
            coords = np.column_stack(np.where(mask))
            
            if coords.size > 0:
                y_min, x_min = coords.min(axis=0)
                y_max, x_max = coords.max(axis=0)
                
                # --- ADD PADDING ---
                pad = 15
                x_min = max(x_min - pad, 0)
                y_min = max(y_min - pad, 0)
                x_max = min(x_max + pad, cell.size[0])
                y_max = min(y_max + pad, cell.size[1])
                
                final = cell.crop((x_min, y_min, x_max, y_max))
            else:
                final = cell
            
            # --- MAKE PERFECT SQUARE ---
            size = max(final.size) + 40
            square = Image.new('RGBA', (size, size), (255,255,255,0))
            
            square.paste(
                final,
                ((size - final.size[0]) // 2,
                 (size - final.size[1]) // 2)
            )
            
            square.save(os.path.join(out_dir, f'{letter}.png'))
            print(f"Perfect {letter}.png")

if __name__ == '__main__':
    extract_letters_perfect()
