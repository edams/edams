var YAML = require('yamljs');
var http = require('http');
var fs = require('fs');

// EDAMS 홈 디렉토리.
var $EDAMS_HOME = require('path').join(__dirname, '..');
//EDAMS 환경설정 정보가 담긴 객체.
var config_obj = YAML.load($EDAMS_HOME+'/config/edams.yml');

//도큐먼트 1건 가져오기.
exports.getDocument = function(socket, req_data){
  var es_index = req_data.index; //index
  var es_type = req_data.type; //type
  var es_id = req_data.id; //type
  var es_element = req_data.element; //found 또는 _source
  var es_emit = req_data.emit; //emit 값.

  var headers = {
    'Content-Type': 'application/json'
  };

  var path_val = "";
  if(es_index !== null && es_index !== ""){
    path_val += "/"+es_index;
    if(es_type !== null && es_type !== ""){
      path_val += "/"+es_type;
      if(es_id !== null && es_id !== ""){
        path_val += "/"+es_id;
      }
    }
  }

  var options = {
    host: config_obj.es.host,
    port: config_obj.es.port,
    path: path_val,
    method: 'GET',
    headers: headers
  };
  var es_req = http.request(options, function(es_res) {
    es_res.setEncoding('utf-8');
    var responseString = '';
    es_res.on('data', function(res_data) {
      var resultObject = JSON.parse(res_data);
      //console.log("%j",resultObject);
      if(resultObject){
        if(es_element !== null && es_element !== "" && typeof(es_element) !=="undefined"){
          socket.emit(es_emit,resultObject[es_element]);
        } else {
          socket.emit(es_emit,resultObject);
        }
      } else {
        socket.emit('error',error);
      }
    }).on('error', function(error) {
      console.log(error);
      socket.emit('error',error);
    });
  });
  es_req.end();
}


//도큐먼트 입력
exports.putDocument = function(socket, req_data){
  var es_index = req_data.index; //index
  var es_type = req_data.type; //type
  var es_id = req_data.id; //type
  var es_data = req_data.data; //입력할 도큐먼트 내용.
  var es_emit = req_data.emit; //emit 값.

  //enc_fields 값이 있으면 해당 값에 해당하는 필드값을 sha256 으로 암호화.
  var enc_fields = req_data.enc_fields;
  if(enc_fields !== null && typeof(enc_fields) !== "undefined"){
    if(enc_fields.length > 0){
      var hash = require('crypto').createHash('sha256');
      for(var i=0; i < enc_fields.length; i++){
        es_data[enc_fields[i]] = hash.update(es_data[enc_fields[i]]).digest('hex');
      }
    }
  }
  //register_date 필드가 null 이면 현재 시간 넣기.
  if(es_data.register_date === null){
    es_data.register_date = new Date();
  }

  var dataString = JSON.stringify(es_data);

  var headers = {
    'Content-Type': 'application/json'
  };

  var path_val = "";
  if(es_index !== null && es_index !== ""){
    path_val += "/"+es_index;
    if(es_type !== null && es_type !== ""){
      path_val += "/"+es_type;
      if(es_id !== null && es_id !== "" && typeof(es_id) !=="undefined" ){
        path_val += "/"+es_id;
      }
    }
  }

  var options = {
    host: config_obj.es.host,
    port: config_obj.es.port,
    path: path_val,
    method: 'POST',
    headers: headers
  };

  var es_req = http.request(options, function(es_res) {
    es_res.setEncoding('utf-8');
    var responseString = '';
    es_res.on('data', function(res_data) {
      var resultObject = JSON.parse(res_data);
      //console.log("%j",resultObject);
      if(resultObject){
        //console.log("%j",resultObject);
        if(es_emit !== null && es_emit !== "" && typeof(es_emit) !=="undefined"){
          socket.emit(es_emit,resultObject);
        }
      } else {
        socket.emit('error',error);
      }
    });
  });
  es_req.write(dataString);
  es_req.end();

}

//문서 검색
exports.search = function(socket, req_data){
  var es_index = req_data.index; //index
  var es_type = req_data.type; //type
  var es_query = req_data.query;   //QueryDSL
  var es_element = req_data.element;   //가져올 요소 : hits, aggs 등.
  var es_emit = req_data.emit; //emit 값.

  var headers = {
    'Content-Type': 'application/json'
  }
  var path_val = "";
  if(es_index !== null && es_index !== ""){
    path_val += "/"+es_index;
    if(es_type !== null && es_type !== ""){
      path_val += "/"+es_type;
    }
  } else {
    path_val += "/_all";
  }
  path_val += "/_search";

  var options = {
    host: config_obj.es.host,
    port: config_obj.es.port,
    path: path_val,
    method: 'POST',
    headers: headers
  };
  var es_req = http.request(options, function(es_res) {
    es_res.setEncoding('utf-8');
    var responseString = '';
    es_res.on('data', function(res_data) {
      var resultObject = JSON.parse(res_data);
      //console.log("%j",resultObject);
      if(resultObject){
        if(es_emit !== null && es_emit !== "" && typeof(es_emit) !=="undefined"){
          if(es_element !== null && es_element !== "" && typeof(es_element) !=="undefined"){
            socket.emit(es_emit,resultObject[es_element]);
          } else {
            socket.emit(es_emit,resultObject);
          }
        }
      } else {
        socket.emit('error',error);
      }
    }).on('error', function(error) {
      console.log(error);
      socket.emit('error',error);
    });
  });
  es_req.write(JSON.stringify(es_query));
  es_req.end();
}

//로그인
exports.login = function(socket, req_data){
  var es_index = req_data.index; //index
  var es_type = req_data.type; //type
  var es_id = req_data.id; //type
  var es_passwd = req_data.passwd; //type
  //var req_element = req_data.element; //found 또는 _source
  var es_emit = req_data.emit; //emit 값.

  var headers = {
    'Content-Type': 'application/json'
  };

  var path_val = "";
  if(es_index !== null && es_index !== ""){
    path_val += "/"+es_index;
    if(es_type !== null && es_type !== ""){
      path_val += "/"+es_type;
      if(es_id !== null && es_id !== "" && typeof(es_id) !=="undefined" ){
        path_val += "/"+es_id;
      }
    }
  }

  var resObj = {
    idExist : false,
    correctPasswd : false,
    isError : false,
    user_obj : null
  }

  var options = {
    host: config_obj.es.host,
    port: config_obj.es.port,
    path: path_val,
    method: 'GET',
    headers: headers
  };
  var es_req = http.request(options, function(es_res) {
    es_res.setEncoding('utf-8');
    var responseString = '';
    es_res.on('data', function(res_data) {
      var resultObject = JSON.parse(res_data);
//      console.log("%j",resultObject);
      if(resultObject){
        if(resultObject.found){
          if(es_id === resultObject._source.id ){
            resObj.idExist = true;
            // 패스워드 암호화.
            var hash = require('crypto').createHash('sha256');
            var passwd_val = hash.update(es_passwd).digest('hex');
            if(passwd_val === resultObject._source.passwd ){
              resObj.correctPasswd = true;
              resObj.user_obj = resultObject._source;
            }
          }
        } else {
          resObj.idExist = false;
        }
        socket.emit(es_emit,resObj);
      } else {
        socket.emit('error',error);
      }
    }).on('error', function(error) {
      console.log(error);
      socket.emit('error',error);
    });
  });
  es_req.end();
}
