<!DOCTYPE html>
<html class="web-version" lang="en" data-sidebar="true">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <link rel="stylesheet" href="css/index.css">
</head>
<body>
<div id="menubar">
    <div class="left">
        <button id="toggleSidebar">☰</button>
        <div class="title">{{title}}</div>
    </div>
    <div class="right"></div>
</div>
<div id="sidebar">
{{sidebar}}
</div>
<div id="content">
{{{content}}}
</div>
</body>
</html>