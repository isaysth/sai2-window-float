"""把 stage 目录打成 zip：只写文件条目，路径统一用正斜杠，顶层保留 sai2-fx-studio/。"""
import os
import sys
import zipfile

pkg = sys.argv[1]
out = sys.argv[2]
base = os.path.dirname(pkg)

with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for dirpath, dirnames, filenames in os.walk(pkg):
        dirnames.sort()
        for name in sorted(filenames):
            full = os.path.join(dirpath, name)
            rel = os.path.relpath(full, base).replace(os.sep, '/')
            zf.write(full, rel)

print(f'entries: {len(zipfile.ZipFile(out).namelist())}')
