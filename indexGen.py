import os

projects_dir = '.'
exclude = ['.git', '_site', 'assets', 'scripts.js', 'index.html']

projects = [d for d in os.listdir(projects_dir) if os.path.isdir(d) and d not in exclude]

with open('index.html', 'w') as f:
    f.write('<!DOCTYPE html>\n<html>\n<head>\n<title>My Projects</title>\n</head>\n<body>\n<h1>Connor Bizjak</h1>\n<p>I left my first swe job a little bit ago, and realized I have to show people that I can do what it is I said I did</p>\n<p>Full Stack (frontend work was internal) applications for the management of a global IP communications infrastructure</p>\n<p>Please click around while I figure out what to do next</p>')
    
    
    f.write('<h1>My Projects</h1>\n<ul>\n<p>I spent a night with GPT and yielded the following</p>\n<ul>\n')
    projects.pop(0)
    projects.insert(0, projects.pop())
    projects.insert(0, projects.pop())
    for project in projects:
        f.write(f'<li><a href="{project}/">{project}</a></li>\n')
    f.write('</ul>\n</body>\n</html>')
