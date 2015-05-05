(function(){
  var ctrls = angular.module('controllers',['services']);

  ctrls.controller('init', function(socket){
    socket.on('error',function(data){
      toastr.error('오류가 발생하였습니다.', '오류 발생')
      console.log(data);
    });
  });

  ctrls.controller('userCtrl', function($scope,$http,$state,socket){
    //메타데이타 셋팅.
    $scope.metadata;
    socket.on('metadata',function(data){
      $scope.metadata = data;
    });
    socket.emit('getMetadata',{emit:'metadata'});

    $scope.login_obj = {
      id : '',
      passwd : '',
      passwd_pre : '',
      passwd_pre_correct : false
    }

    socket.on('loggedIn', function(data){
      //console.log(data);
      if(!data.idExist){
        toastr.error('존재하지 않는 아이디입니다.', '로그인 실패');
      } else {
        if(!data.correctPasswd){
          toastr.error('패스워드가 일치하지 않습니다.', '로그인 실패');
        } else {
          append_user_obj(data.user_obj);
          sessionStorage["edams_login_obj"] = JSON.stringify($scope.login_obj);
          $state.go('main');  //이렇게 하면 해당 state로 감. 파라메터 전달 가능.
        }
      }
    });

    // 서버에서 가져온 사용자 정보를 user_obj에 대입.
    var append_user_obj = function(data){
      //console.log(data);
      var user_obj_app = JSON.parse(user_obj_tmp);
      var obj_keys = Object.keys(data); // key Array 가져옴. ["signin_step","id","type","passwd", ...];
      for(var i=0; i < obj_keys.length; i++){
        user_obj_app[obj_keys[i]] = data[obj_keys[i]];
      }
      user_obj_app.passwd_enc = data.passwd;
      user_obj_app.passwd = "";
      user_obj_app.passwd_re = "";
      user_obj_app.logged_in = true;
      user_obj_app.birthday = new Date(user_obj_app.birthday);
      $scope.user_obj = user_obj_app;
      console.log($scope.user_obj);
    }

    $scope.user_obj = {
      register_date: null,
      logged_in: false,
      grp_id: "",
      grp_name: "",
      user_type: "user",
      id: "",
      passwd: "",
      passwd_re: "",
      passwd_enc: "",
      name: "",
      nicname: "",
      birthday: null,
      email: "",
      phone: ""
    }

    var user_obj_tmp = JSON.stringify($scope.user_obj);
    $scope.user_obj.birthday= new Date(Date.UTC(1980, 0, 1));

    //그룹 추가시 정보 저장하는 객체.
    $scope.grp_obj = {
      register_date: null,
      id:'',
      name: '',
      comment: '',
      nicnames: [],
      admins: [],
      owner_id: ''
    }
    var grp_obj_tmp = JSON.stringify($scope.grp_obj);

    $scope.user_func = {
      login : function(){
        //사용자 로그인
        var login_io_obj = {
          index : "edams-users",
          type : "user",
          id : $scope.login_obj.id,
          passwd : $scope.login_obj.passwd,
          emit : "loggedIn"
        }
        socket.emit('login',login_io_obj);
      },
      logout : function(){
        $scope.login_obj.id='';
        $scope.login_obj.passwd='';
        var user_obj_tmp = JSON.stringify($scope.user_obj);
        $scope.user_obj.birthday= new Date(Date.UTC(1980, 0, 1));
        delete sessionStorage["edams_login_obj"];
      },
      grp_id_validate_text: "",
      grp_id_exist: false,
      grp_added_id: '',
      chk_grp_id: function(){
        if($scope.grp_obj.id.length > 3){
          var chk_grp_id_obj = {
            index: "edams-groups",
            type: "group",
            id: $scope.grp_obj.id,
            element: "found",
            emit:"chkGrpId"
          }
          socket.emit('getDocument',chk_grp_id_obj);
        }
      },
      chk_grp_id_valid: function(){
        if(!$scope.grp_obj.id || $scope.grp_obj.id.length === 0 ){
          $scope.user_func.grp_id_validate_text = "";
          return false;
        } else {
          if($scope.grp_obj.id.length > 3){
            var ck_validation = /^[A-Za-z0-9_]{0,20}$/;
            if(ck_validation.test($scope.grp_obj.id)){
              if($scope.user_func.grp_id_exist){
                $scope.user_func.grp_id_validate_text = "이미 존재하는 아이디 입니다.";
                return false;
              } else {
                if($scope.metadata.forbidden.grp_id.indexOf($scope.grp_obj.id) > -1){
                  $scope.user_func.grp_id_validate_text = "사용할 수 없는 아이디 입니다.";
                  return false;
                } else {
                  $scope.user_func.grp_id_validate_text = "사용 가능한 아이디 입니다.";
                  return true;
                }
              }
            } else {
              $scope.user_func.grp_id_validate_text = "영어, 숫자, '_' 만 입력 가능합니다.";
              return false;
            }
          } else {
            if($scope.grp_obj.id.length > 0){
              $scope.user_func.grp_id_validate_text = "4자리 이상 입력하세요.";
            }
            return false;
          }
        }
      },
      grp_add: function(){
        //그룹 저장.
        var put_grp_obj = {
          index: "edams-groups",
          type: "group",
          data: $scope.grp_obj,
          emit: "insertGrp"
        }
        socket.emit('putDocument',put_grp_obj);
        $scope.user_obj.grp_name = $scope.grp_obj.name;
      },
      grp_select: function(){
        $scope.user_obj.grp_id = $scope.grp_list[$scope.user_obj.grp_name].id;
        $scope.user_func.nicname_list = $scope.grp_list[$scope.user_obj.grp_name].nicnames;
        $scope.user_func.chk_nicname();
      },
      id_validate_text: "",
      id_exists: false,
      chk_id: function(){
        if($scope.user_obj.id.length > 3){
          var chk_id_obj = {
            index: "edams-users",
            type: "user",
            id: $scope.user_obj.id,
            element: "found",
            emit:"chkUserId"
          }
          socket.emit('getDocument',chk_id_obj);
        }
      },
      chk_id_valid: function(){
        if(!$scope.user_obj.id || $scope.user_obj.id.length === 0 ){
          $scope.user_func.id_validate_text = "";
          return false;
        } else {
          if($scope.user_obj.id.length > 3){
            var ck_validation = /^[A-Za-z0-9_]{0,20}$/;
            if(ck_validation.test($scope.user_obj.id)){
              if($scope.user_func.id_exists){
                $scope.user_func.id_validate_text = "이미 존재하는 아이디 입니다.";
                return false;
              } else {
                if($scope.metadata.forbidden.user_id.indexOf($scope.user_obj.id) > -1){
                  $scope.user_func.id_validate_text = "사용할 수 없는 아이디 입니다.";
                  return false;
                } else {
                  $scope.user_func.id_validate_text = "사용 가능한 아이디 입니다.";
                  return true;
                }
              }
            } else {
              $scope.user_func.id_validate_text = "영어, 숫자, '_' 만 입력 가능합니다.";
              return false;
            }
          } else {
            if($scope.user_obj.id.length > 0){
              $scope.user_func.id_validate_text = "4자리 이상 입력하세요.";
            }
            return false;
          }
        }
      },
      nicname_list: [],
      nicname_exists: false,
      chk_nicname: function(){
        if($scope.user_func.nicname_list.indexOf($scope.user_obj.nicname) > -1){
          $scope.user_func.nicname_exists = true;
        } else {
          $scope.user_func.nicname_exists = false;
        }
      },
      signin: function(){
        //사용자 저장.
        delete $scope.user_obj.passwd_re;
        delete $scope.user_obj.passwd_enc;
        //console.log($scope.user_obj);
        var put_user_obj = {
          index: "edams-users",
          type: "user",
          data: $scope.user_obj,
          enc_fields: ["passwd"],
          emit: "insertUser"
        }
        socket.emit('putDocument',put_user_obj);

        //그룹 업데이트를 위한 객체 생성.
        var put_grp_obj_tmp = $scope.grp_list[$scope.user_obj.grp_name];
        //닉네임 그룹 배열에 추가.
        var nicnameIdx = put_grp_obj_tmp.nicnames.indexOf($scope.user_obj.nicname);
        if(nicnameIdx > -1){
          put_grp_obj_tmp.nicnames.splice(nicnameIdx,1);
        }
        put_grp_obj_tmp.nicnames.push($scope.user_obj.nicname);

        //운영자id 그룹 배열에 추가.
        if($scope.user_obj.user_type === "admin"){
          var adminIdx = put_grp_obj_tmp.admins.indexOf($scope.user_obj.id);
          if(adminIdx > -1){
            put_grp_obj_tmp.admins.splice(adminIdx,1);
          }
          put_grp_obj_tmp.admins.push($scope.user_obj.id);
        }

        //그룹 업데이트
        var update_grp_obj = {
          index: "edams-groups",
          type: "group",
          data: put_grp_obj_tmp,
          emit: ""
        }
        socket.emit('putDocument',update_grp_obj);

      }
    }

    //앵귤러JS에서 select가 예상대로 안 되서 꼼수.
    $scope.grp_list;  // 그룹 name : id 를 역으로 하는 객체.
    $scope.grp_name_list; //그룹 이름을 배열로 저장.
    var search_grp_obj = {
      index: "edams-groups",
      type: "group",
      query: {
        size: 100,
        sort: "name"
      },
      element: "hits",
      emit:"getGroupList"
    }
    socket.on('getGroupList', function(data){
      $scope.grp_list = {};
      $scope.grp_name_list = [];
      var grp_id_list = [];
      for(var i=0; i<data.hits.length; i++){
        var grp_item_key = data.hits[i]._source.name;
        var grp_item_val = data.hits[i]._source.id;
        $scope.grp_list[grp_item_key] = data.hits[i]._source;
        $scope.grp_name_list.push(data.hits[i]._source.name);
        grp_id_list.push(data.hits[i]._id);
      }
      //console.log("$scope.grp_name_list.length: "+$scope.grp_name_list.length);
      //그룹 저장 후 호출할 때 저장 반영 안 된 경우가 있어서 추가된 그룹 id 조회 후 반영 안 된 경우 다시 호출. 0.5초 타임아웃.
      if($scope.user_func.grp_added_id !== "" && grp_id_list.indexOf($scope.user_func.grp_added_id) < 0){
        setTimeout(function(){
          socket.emit('search',search_grp_obj);
        },500);
      } else {
        if($scope.grp_name_list.length > 0){
          if($scope.user_obj.grp_name === ""){
            $scope.user_obj.grp_name = $scope.grp_name_list[0];
            //console.log($scope.grp_list);
            //console.log($scope.grp_name_list);
          }
          $scope.grp_obj = JSON.parse(grp_obj_tmp);
          $scope.user_func.grp_select();
          $scope.user_func.grp_added_id = "";
        }
      }
    });
    socket.emit('search',search_grp_obj);

    //그룹 아이디 존재하는지 체크.
    socket.on('chkGrpId', function(data){
      $scope.user_func.grp_id_exist = data;
    });

    //사용자 아이디 존재하는지 체크.
    socket.on('chkUserId', function(data){
      $scope.user_func.id_exists = data;
    });

    //그룹 아이디 저장.
    socket.on('insertGrp', function(data){
      $scope.user_func.grp_added_id = data._id;
      //console.log($scope.user_func.grp_added_id);
      //그룹 목록 다시 가져오기.
      socket.emit('search',search_grp_obj);
      $('#grpModal').modal('hide');
      toastr.success($scope.grp_obj.name + '그룹이 추가되었습니다.', '그룹 추가');
    });

    //세션 체크해서 로그인.
    if(sessionStorage["edams_login_obj"]){
      var login_session = JSON.parse(sessionStorage["edams_login_obj"]);
      $scope.login_obj = login_session;
      $scope.user_func.login();
    }

    $scope.navbar_func = {
      
    }

  });

  ctrls.controller('bodyCtrl', function(socket){

  });

})();
