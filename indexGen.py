import os

projects_dir = '.'
exclude = ['.git', '_site', 'assets', 'scripts.js', 'index.html']

projects = [d for d in os.listdir(projects_dir) if os.path.isdir(d) and d not in exclude]

with open('index.html', 'w') as f:
    f.write('<!DOCTYPE html>\n<html>\n<head>\n<title>My Projects</title>\n</head>\n<body>\n')
    f.write('<h1>My Projects</h1>\n<ul>\n')
    for project in projects:
        f.write(f'<li><a href="{project}/">{project}</a></li>\n')
    f.write('</ul>\n</body>\n</html>')
