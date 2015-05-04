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
        socket.emit(es_emit,resultObject[es_element]);
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
        socket.emit(es_emit,resultObject);
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
        socket.emit(es_emit,resultObject[es_element]);
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
