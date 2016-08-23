global.utils = {};
// var fs = require('fs');
//                                   v directory
utils.deleteFolderRecursive=function(a){fs.existsSync(a)&&(fs.readdirSync(a).forEach(function(c,d){var b=a+"/"+c;fs.lstatSync(b).isDirectory()?deleteFolderRecursive(b):fs.unlinkSync(b)}),fs.rmdirSync(a))};
//                       v directory
utils.dirExists=function(b){var a;try{return a=fs.lstatSync(b),a.isDirectory()?!0:!1}catch(c){return!1}};
//                         v directory/file
utils.locationExists=function(a){try{return stats=fs.lstatSync(a),!0}catch(b){return!1}};
//                         v directory
utils.getFolderContents=function(e){for(var b=fs.readdirSync(e),c={},d,a=0;a<b.length;a++)fs.statSync(e+"/"+b[a]).isDirectory()?c[b[a]]="folder":(d=b[a].split("."),c[b[a]]=d[d.length-1]);return c};
//                          v directory, extension, filter function
utils.findFileType=function(e,d,b){var c=[],g=fs.readdirSync(e);b||(b=function(){return!0});g.forEach(function(a){a=e+"/"+a;var f=fs.statSync(a);f&&f.isDirectory()?c=c.concat(utils.findFileType(a,d,b)):a.substr(a.length-(d.length+1))==="."+d&&b(a)&&c.push(a)});return c};
//                            v directory
utils.getDirectories=function(a){return fs.readdirSync(a).filter(function(b){return fs.statSync(a+"/"+b).isDirectory()})};
//                                     v directory
utils.getDirectoriesRecursive=function(c){var b=[];fs.readdirSync(c).forEach(function(a){a=c+"/"+a;var d=fs.statSync(a);d&&d.isDirectory()&&(b=b.concat(utils.getDirectoriesRecursive(a)),b.push(a))});return b};
