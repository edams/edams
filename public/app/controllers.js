(function(){
  var ctrls = angular.module('controllers',['services']);

  ctrls.controller('userCtrl', function($scope,$http,socket){

    //메타데이타 셋팅.
    $scope.metadata;
    socket.on('metadata',function(data){
      $scope.metadata = data;
    });
    socket.emit('getMetadata',{emit:'metadata'});

    socket.on('error',function(data){
      toastr.error('오류가 발생하였습니다.', '오류 발생')
      console.log(data);
    });

    $scope.user_obj = {
      grp_id: "",
      grp_name: "",
      user_type: "user",
      id: "",
      passwd: "",
      passwd_re: "",
      passwd_enc: "",
      name: "",
      nicname: "",
      birthday: new Date(Date.UTC(1980, 0, 1)),
      email: "",
      phone: ""
    }

    $scope.user_func = {
      grp_id_validate_text: "",
      grp_id_exist: false,
      grp_length:0,
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
        $scope.user_func.grp_length++;
        $scope.user_obj.grp_name = $scope.grp_obj.name;
      },
      grp_select: function(){
        $scope.user_obj.grp_id = $scope.grp_list[$scope.user_obj.grp_name].id;
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
      nicname_exists: false,
      signin: function(){
        //사용자 저장.
        console.log($scope.user_obj);
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
      for(var i=0; i<data.hits.length; i++){
        var grp_item_key = data.hits[i]._source.name;
        var grp_item_val = data.hits[i]._source.id;
        $scope.grp_list[grp_item_key] = data.hits[i]._source;
        $scope.grp_name_list.push(data.hits[i]._source.name);
      }
      //console.log("$scope.user_func.grp_length: "+$scope.user_func.grp_length);
      //console.log("$scope.grp_name_list.length: "+$scope.grp_name_list.length);
      //그룹 저장 후 호출할 때 저장 반영 안 된 경우가 있어서 기존 그룹 수와 비교 후 반영 안 된 경우 다시 호출. 0.5초 타임아웃.
      if($scope.user_func.grp_length > $scope.grp_name_list.length){
        setTimeout(function(){
          socket.emit('search',search_grp_obj);
        },500);
      } else {
        if($scope.grp_name_list.length > 0 && $scope.user_obj.grp_name === ""){
          $scope.user_obj.grp_name = $scope.grp_name_list[0];
        }
        //console.log($scope.grp_list);
        //console.log($scope.grp_name_list);
        $scope.user_func.grp_length = $scope.grp_name_list.length;
        $scope.grp_obj = JSON.parse(grp_obj_tmp);
        $scope.user_func.grp_select();
      }
    });
    socket.emit('search',search_grp_obj);

    //그룹 추가시 정보 저장하는 객체.
    $scope.grp_obj = {
      id:'',
      name: '',
      comment: '',
      nicnames: [],
      admins: [],
      owner_id: ''
    }
    var grp_obj_tmp = JSON.stringify($scope.grp_obj);

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
      //그룹 목록 다시 가져오기.
      socket.emit('search',search_grp_obj);

      $('#grpModal').modal('hide');
      toastr.success($scope.grp_obj.name + '그룹이 추가되었습니다.', '그룹 추가');
    });

  });

})();
