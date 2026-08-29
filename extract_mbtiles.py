#!/usr/bin/env python3

import sqlite3
import sys
from pathlib import Path


def extract_mbtiles(mbtiles_path: str, output_dir: str):
    mbtiles = Path(mbtiles_path)
    output = Path(output_dir)

    if not mbtiles.exists():
        print(f"Error: MBTiles file not found: {mbtiles}")
        sys.exit(1)

    output.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(mbtiles)

    try:
        cursor = conn.execute("""
            SELECT zoom_level, tile_column, tile_row, tile_data
            FROM tiles
            ORDER BY zoom_level, tile_column, tile_row
        """)

        count = 0

        for z, x, tms_y, tile_data in cursor:
            # MBTiles uses TMS coordinates.
            # MapLibre/XYZ uses the opposite Y coordinate.
            xyz_y = (1 << z) - 1 - tms_y

            tile_dir = output / str(z) / str(x)
            tile_dir.mkdir(parents=True, exist_ok=True)

            tile_path = tile_dir / f"{xyz_y}.pbf"

            tile_path.write_bytes(tile_data)

            count += 1

            print(f"Extracted {z}/{x}/{xyz_y}.pbf")

        print()
        print(f"Extracted {count} tiles to {output}")

    finally:
        conn.close()


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage:")
        print(f"  {sys.argv[0]} <input.mbtiles> <output-directory>")
        print()
        print("Example:")
        print(f"  {sys.argv[0]} data/rpi-troy.mbtiles data/tiles")
        sys.exit(1)

    extract_mbtiles(sys.argv[1], sys.argv[2])
