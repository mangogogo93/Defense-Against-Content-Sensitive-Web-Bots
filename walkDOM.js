var htmlparser2 = require('htmlparser2');
var fs = require('fs'); 
var html = require('htmlparser-to-html');
var css = require('css');

var nameBList = [];   // original class name
var nameAList = [];   // randomized class name 
var count = 0;  // changed class name number
  
var html_str = fs.readFileSync('index.html','utf-8');  //read the html file

var handler = new htmlparser2.DomHandler();
var HTMLparser = new htmlparser2.Parser(handler);  // generate the class tree

HTMLparser.parseComplete(html_str);

walkDOM(handler.dom[4],nameBList,nameAList);  

//scan the tree and change the class name to randomed name
function walkDOM(currNode,nameBList,nameAList) {

    // Visit current node: only randomize the className of <a> tags
    if (currNode.type == "tag" && currNode.attribs.class) {
        //store the original class name
        nameBList[count] = currNode.attribs.class;

        var string2 = "RAND-CLASS-" + Math.ceil(Math.random()*10000).toString();
        currNode.attribs.class = string2;
        
        //store the changed class name
        nameAList[count] = string2;
        count++; 
      }
    // Visit all children nodes of current node
    if (currNode.children && (currNode.children.length > 0)){     
    var i;
      for (i=0; i<currNode.children.length; i++){
        walkDOM(currNode.children[i],nameBList,nameAList);
      }
    }
}

//regenerate the html file

var randomized = html(handler.dom);
try {
  fs.writeFileSync('index1.html', randomized);
}
catch(err){;}

// find the css file in the  folder
fs.readdir('index_files', (err, files) => {
  files.forEach(file => {
    var index= file.lastIndexOf(".");
    var ext = file.substr(index+1);
    if(ext == "css"){
          var file2 = "index_files/" + file;

          var data = fs.readFileSync(file2,'utf-8');
          
          var obj = css.parse(data, file2);

          walkAST(obj,nameAList,nameBList);

          var result = css.stringify(obj);

          fs.writeFileSync(file2, result);

    }
  });
})


// scan the css tree and chande the class name into corresponding randomed class name 
function walkAST(obj,nameAList,nameBList) {
  var len = obj.stylesheet.rules.length;
  var i;
  console.log("=========", nameBList.length);
            for(k=0;k<nameBList.length;k++){
              console.log(nameBList[k]);
            }
  for(i=0;i<len;i++){
    
    
    if(obj.stylesheet.rules[i].type == 'rule' && obj.stylesheet.rules[i].selectors){

      var m;
      var sele_len = obj.stylesheet.rules[i].selectors.length;
      for(m=0;m<sele_len;m++){
        
        var j;
      
        var str = obj.stylesheet.rules[i].selectors[m];
        var strGroup = str.split(' ');
        var index = -1;
      
        for(j=0;j<strGroup.length;j++){

          var p = strGroup[j].indexOf('.');
          if(strGroup[j].indexOf('.') >= 0){

            
            var oriString = strGroup[j].slice(p+1);
            var k;
            //if find a match then keep the index 
            for(k=0; k<count;k++){

              if(oriString == nameBList[k]){
                index = k;
              }
            }
          }
          // change the class name to randoemd class name
          if(index != -1){
            var res = obj.stylesheet.rules[i].selectors[m].replace(oriString,nameAList[index]);
            obj.stylesheet.rules[i].selectors[m] = res;
          }

        }
      }
    }  
  }
}


