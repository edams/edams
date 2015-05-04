var express = require('express');
var bodyParser = require('body-parser');  //데이터 입력을 위한 패키지.
var YAML = require('yamljs');
var http = require('http');

var es = require('./es.js');  // 엘라스틱서치 처리.

// EDAMS 홈 디렉토리.
var $EDAMS_HOME = require('path').join(__dirname, '..');
//EDAMS 환경설정 정보가 담긴 객체.
var config_obj = YAML.load($EDAMS_HOME+'/config/edams.yml');
var metadata_obj = YAML.load($EDAMS_HOME+'/config/metadata.yml');

var app = express();

// socket.io 사용. : http://socket.io/docs/
var server = http.Server(app);
var io = require('socket.io').listen(server);

io.on('connection', function(socket){
  //패스워드 암호화 해서 리턴.
  socket.on('encPasswd', function(data){
    var req_passwd = data.passwd; //passwd
    var req_emit = data.emit; //emit 값.

    var hash = require('crypto').createHash('sha256');
    var passwd_val = hash.update(req_passwd).digest('hex');
    var ret_obj = {passwd_enc : passwd_val};
    socket.emit(req_emit,ret_obj);
  });

  socket.on('getMetadata', function(data){
    var req_emit = data.emit;
    socket.emit(req_emit,metadata_obj);
  });

  //document 직접 겟.
  socket.on('getDocument', function(data){
    es.getDocument(socket, data);
  });

  socket.on('putDocument', function(data){
    es.putDocument(socket, data);
  });

  socket.on('search', function(data){
    es.search(socket, data);
  });

});

// server/views 경로의 파일에 jade 엔진 적용.
app.set('views', $EDAMS_HOME + '/server/views');
app.set('view engine', 'jade');

//partials 디렉토리 파일에 Jade 엔진 적용.
app.get('/user/:userFile', function(req, res) {
  res.render('user/' + req.params.userFile);
});


// public 디렉토리 이하 파일은 그대록 읽어들임.
app.use(express.static($EDAMS_HOME + '/public'));
app.use(bodyParser.json({limit: '50mb'}))


app.get('/', function(req, res) {
  res.render('index', {
    // index.jade 에 보낼 object data 설정.
  });
});


var port = config_obj.edams.port;
//app.listen(port);
console.log('Start EDAMS on port ' + port + '...');

server.listen(port); //socket.io 사용하려면 이렇게 변경.
