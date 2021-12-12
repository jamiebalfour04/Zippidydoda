function highlight(input, highlights, symbols, callback){
  function eatSpace(){
    while((input[pc] == " " || input[pc] == "\n") && pc < input.length){
      if(input[pc] == '\n'){
        output += "\n";
      } else{
        output += "&nbsp;";
      }
      pc++;
    }
  }

  function generateComment(){
    output += '<span class="comment">//';
    pc+=2;
    while(pc < input.length && input[pc] != '\n'){
      output += input[pc];
      pc++;
    }

    output += '</span>';
  }

  function generateMultilineComment(){
    output += '<span class="comment">/*';
    pc+=2;
    while(pc < input.length && !(input[pc] == '*' && (pc+1 < input.length && input[pc+1] == "/"))){
      if(input[pc] == "\n"){
        output+='</span>\n<span class="comment">';
        pc++;
      } else{
        output += input[pc];
        pc++;
      }

    }
    pc+=2;
    output += '*/</span>';
  }

  function generateString(){
    output += '<span class="string">&quot;';
    pc++;
    while(pc < input.length && input[pc] != '"'){
      output += input[pc];
      pc++;
    }

    output += '&quot;</span>';
  }

  function generateHereDoc(){
    output += '<span class="heredoc">&lt;&lt;';
    pc+=2;
    while(pc < input.length && !(input[pc] == '>' && input[pc+1] == '>' && (input[pc-1] == " " || input[pc-1] == "\n"))){
      if(input[pc] == "\n"){
        output+='</span>\n<span class="heredoc">';
        pc++;
      } else{
        output += input[pc];
        pc++;
      }

    }

    output += '&gt;&gt;</span>';
  }

  function matchBreakSymbols(prog_count, searchWords){
    var found = false;
    searchWords.forEach(function(k){
      var len = prog_count + k.length;
      if(len < input.length){
        var checkStr = input.substring(prog_count, len);


        if(checkStr == k){
          found = true;
          return true;
        }
      } else{
        found = false;
        return false;
      }

    });
    if(found){
      return true;
    }
    return false;
  }

  function matchesWord(word, searchWords){
    var found = false;
    searchWords.forEach(function(k){
      if(word == k){
        found = true;
        return true;
      }
    });
    if(found){
      return true;
    }
    return false;
  }

  function matchesVariable(word){
    return (/^(\$_?[A-z][A-z0-9]*?)$/.test(word));
  }

  var output = "";
  var w = "";

  var pc = 0;

  while (pc < input.length){

    if(input[pc] == '"'){
      generateString();
      pc++;
    }

    if(input[pc] == '<' && input[pc+1] == '<'){
      generateHereDoc();
      pc+=2;
    }



    eatSpace();
    while(pc < input.length && !(input[pc] == " " || input[pc] == '\n')){
      eatSpace();
      if(input[pc] == '"'){
        //Don't lose the current word
        if(w != ""){

          if(matchesVariable(w)){
            w = '<span class="var">' + w + '</span>';
          }
          //Output what's there already
          output += w;
          w = "";
        }

        //We don't need to eat another character after this because the loop does this anyway
        generateString();

      } else if(input[pc] == '/' && input[pc+1] == '/'){
        //Don't lose the current word
        if(w != ""){
          //Output what's there already
          output += w;
          w = "";
        }

        //We don't need to eat another character after this because the loop does this anyway
        generateComment();
        //Since the loop adds one to pc, we need to remove
        pc--;
      } else if(input[pc] == '/' && input[pc+1] == '*'){
        //Don't lose the current word
        if(w != ""){
          //Output what's there already
          output += w;
          w = "";
        }

        //We don't need to eat another character after this because the loop does this anyway
        generateMultilineComment();
        //Since the loop adds one to pc, we need to remove
        pc--;
      } else if(input[pc] == "$"){
        output += w;
        w = "";
        var tmpStr = "";
        var i = pc;
        while(i < input.length && !(input[i] == " " || input[i] == "\n" || matchBreakSymbols(i, symbols))){
          tmpStr += input[i];
          i++;
        }
        console.log(tmpStr);

        if(matchesVariable(tmpStr)){
          output += '<span class="var">' + tmpStr + '</span>';
          pc = i-1;
        }
      } else{

        w += input[pc];
        //We can find a word such as a function when we hit a space, special char or a new line
        if(matchBreakSymbols(pc+1, symbols) || input[pc+1] == " " || input[pc+1] == "\n"){
          console.log(w);
          var found = false;
          highlights.forEach(function(i){
            if(matchesWord(w, i.items)){
              w = '<span class="'+i.class+'">' + w +  '</span>';
              output += w;
              found = true;
              w = "";
              return;
            }
          });
          console.log(w);
          if(!found){
            output += w;
            w = "";
          }

        }
        //We need to check for symbols
        if(matchesWord(w, symbols)){
          output += w;
          w = "";
        }


      }
      pc++;
    }

    if(matchesVariable(w)){
      w = '<span class="var">' + w + '</span>';
    }


    output += w;

    eatSpace();


    //console.log(w);
    w = "";
  }

  if(callback !== undefined){
    callback();
  }

  return output;


}

