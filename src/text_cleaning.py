import re
def remove__number(txt):
    if not len(txt):
        return ""

    txt = str(txt)
    txt = re.sub(r'\d+', '', txt)
    txt = re.sub(r'["“”\'‘’]', '', txt)

    return txt.lower()
