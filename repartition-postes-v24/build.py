# Génère index.html (compatible anciens Safari) à partir de source.html : python3 build.py  (nécessite esbuild : npm i esbuild)
import re,subprocess,shutil,sys
EB=shutil.which('esbuild') or (sys.argv[1] if len(sys.argv)>1 else 'node_modules/.bin/esbuild')
s=open('source.html',encoding='utf-8').read()
def tr(m):
    code=m.group(2)
    if 'application/json' in m.group(1) or not code.strip(): return m.group(0)
    out=subprocess.run([EB,'--loader=js','--target=safari12','--charset=utf8'],input=code,capture_output=True,text=True,check=True).stdout
    return m.group(1)+'\n'+out+'</script>'
s=re.sub(r'(<script(?: [^>]*)?>)(.*?)</script>',tr,s,flags=re.S)
open('index.html','w',encoding='utf-8').write(s)
