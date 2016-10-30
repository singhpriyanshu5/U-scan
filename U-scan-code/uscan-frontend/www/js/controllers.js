angular.module('scanner.controllers', ['ionic'])

  .controller('HomeController', function($scope, $rootScope, $cordovaBarcodeScanner, $ionicPlatform, $http, $timeout , $ionicModal, RealCheck
                                          , Register, RealList, eventName, ionicMaterialMotion, $ionicLoading) {
    var vm = this;
    vm.scanResults = '';
    vm.succeedClass = 'Normal';
    $scope.isScan = false;
    $scope.app={};
    $scope.isInEvent ="White";
    $scope.eventMessage="Login to event!";
    $scope.isInValid = "White";
    $scope.user={};
    $scope.message ="";
    $scope.eventName = eventName;
    $scope.timer = null;


    $ionicModal.fromTemplateUrl('my-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      //$scope.modal.hardwareBackButtonClose = false;
    });
    $scope.openModal = function() {
      $scope.message ="";
      $scope.modal.show();
    //   if($scope.isScan == false){
    //    $scope.from = "out";
    // } else{
    //   $scope.from = "in";
    // }
      resetToLogin();
    };
    $scope.closeModal = function() {
      $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
    //   if($scope.from == "in" && $scope.isScan == false){
    //     resetToLogin();
    // }
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
    //   if($scope.isScan == true){
    //     resetToLogin();
    // }
      // Execute action
    });

    resetToLogin = function(){
      $scope.isScan = false;
      $scope.eventMessage = "Login to event!";
      $scope.eventName.eventCode = "";
    }

    $scope.login = function(){
      if($scope.eventName.eventCode === null || $scope.eventName.eventCode === "" || $scope.eventName.eventName === null){
        $scope.isInValid = "Black";
        $scope.message ="Please input an event code";
        resetToLogin();
      }else{
        $ionicLoading.show();
        $http.get(RealCheck.url+$scope.eventName.eventCode + "/").then(function(resp){
          //alert(JSON.stringify(resp));
          var data = JSON.stringify(resp.data)
          if(data.indexOf('false')== -1){
            $scope.eventName.eventName = resp.data['title'];
            eventName.eventName = resp.data['title'];
            $scope.isInValid ="Green";
            //$scope.message="Congrats!It works!";
            $scope.eventMessage ="Logout";
            $scope.isScan = true;
            $ionicLoading.hide();
            
            $scope.closeModal();

            var options = {
                text: 'Event Code Correct',        // change snackbar's text/html
                toast: false,           // change snackbar's style (true = rounded corners)
                align: 'left',          // align 'left' or 'right'
                fullWidth: true,       // snackbar takes all screen width (overrides align and toast style, also remove default 2px rounded corners)
                timeout: 3000,          // delay before the snackbar disappears (if 0, the snackbar is permanently showed until MDSnackbars.hide() is called or the snackbar clicked)
                html: true ,           // allows HTML insertion
                clickToClose: true,     // enable/disable the click to close behavior
                animation: 'slideup'       // change the animation type ('fade' or 'slideup', default to 'fade')
            };

            MDSnackbars.show(options);//show message at snack bar
          } else {
            //$scope.eventName.eventCode = ""
            $ionicLoading.hide();
            $scope.message="This Event does not Exist!";
            $scope.isInValid="Red";
            resetToLogin();
          }
        },function(err){
          $ionicLoading.hide();
          console.log(JSON.stringify(err) + "error");
          //alert(JSON.stringify(err));
          $scope.isInValid = "Black";
          $scope.message = err;
          resetToLogin();
        });
      }
    };

    



    $scope.getManual = function() {
      if($scope.eventName.eventCode.length>0){
        if($scope.app.matric.length==9 && ($scope.app.matric.indexOf('U')==0 || $scope.app.matric.indexOf('u')==0 || $scope.app.matric.indexOf('N')==0 || $scope.app.matric.indexOf('n')==0) && $scope.isScan ==true ){
          $http.get(Register.url+eventName.eventCode+"/"+$scope.app.matric).then(function(resp) {
            var data = JSON.stringify(resp.data);
            if (data.indexOf('New')>=0){
              vm.scanResults = "Added "+$scope.app.matric+" successfully! Please Proceed!";
              vm.succeedClass = "Green";
            }
            else if(data.indexOf('already')>=0){

              vm.scanResults = "Sorry "+$scope.app.matric+" Registered";
              vm.succeedClass = "Red";
            }
          }, function(err) {
            console.error('ERR', err);
            // err.status will contain the status code
            vm.succeedClass = "Orange";
            vm.scanResults = err;
          });
          // postdata = {eventCode: eventName.eventCode, matricNo: $scope.app.matric}
          // $http.post('http://139.59.226.250/registerpost/', postdata).then(function(resp){
          //   alert(JSON.stringify(resp.data));
          // }, function(err){
          //   alert(err);
          // });
        }
        else{
          console.log($scope.app.matric.length==9);
          console.log($scope.app.matric.indexOf('U')==0);
          vm.scanResults = "Invalid Matric Number";
          vm.succeedClass = "Orange";
        }
      }
      else{
        vm.scanResults ="Please Quit the app and login again";
        vm.succeedClass ="Orange";
      }
    };

    vm.successFunc = function(result) {
      // Success! Barcode data is here
      if(result.length==9 && (result.indexOf('U')==0 || result.indexOf('u')==0 || result.indexOf('N')==0 || result.indexOf('n')==0) && $scope.isScan == true ){
        $http.get(Register.url+eventName.eventCode+"/"+result)
          .then(function(resp) {
            var data = JSON.stringify(resp.data);
            if (data.indexOf('New')>=0) {
              vm.scanResults = "Added "+result+" successfully! Please Proceed!";
              vm.succeedClass = "Green";

              if(result && ionic.Platform.isAndroid()) {
                $scope.timer = $timeout(function () {
                  vm.scan();
                }, 600);
              }

            }
            else if(data.indexOf('already')>=0){
              vm.scanResults = "Sorry "+result+" Registered";
              vm.succeedClass = "Red";
            }
            else{
              vm.scanResults = "Result text '" +resp.data+"'";
            }
          }, function(err) {
            if($scope.timer) {
              $timeout.cancel($scope.timer);
              $scope.timer = null;
            }
            console.error('ERR', err);
            // err.status will contain the status code
            vm.succeedClass = "Orange";
            vm.scanResults = err;
          });

      }
      else {
        if($scope.timer) {
          $timeout.cancel($scope.timer);
          $scope.timer = null;
        }
        vm.scanResults = "Invalid Matric Number: " + result;
        vm.succeedClass = "Orange";
      }

    };

    vm.failureFunc = function(error) {
      if($scope.timer) {
        $timeout.cancel($scope.timer);
        $scope.timer = null;
      }
      // An error occurred
      vm.scanResults = 'Error: ' + error;
      vm.succeedClass = "Orange";
    };

    vm.scan = function(){
      if($scope.eventName.eventCode.length>0){
        $ionicPlatform.ready(function() {
          if(ionic.Platform.isAndroid()){
            $cordovaBarcodeScanner
                .scan()
                .then(function(result){
                //success
                vm.successFunc(result.text);
                //console.log('sucessssss');
              }, function(err){
                vm.failureFunc(err);
                //console.log('failureeee')
              });
          } 


          // barcodeScanner.scan(
          //   function(result){
          //       //success
          //       vm.successFunc(result.text);
          //       //console.log('sucessssss');
          //     }, function(err){
          //       vm.failureFunc(err);
          //       //console.log('failureeee')
          //     });
          // else {
          //   cloudSky.zBar.scan({
          //     camera: "back" // defaults to "back"
          //   }, function(result) {
          //     vm.successFunc(result);
          //   }, function(err) {
          //     vm.failureFunc(err);
          //   });
          // }
        });
      }
      else{
        vm.scanResults =" Please Log in first!";
        vm.succeedClass = "Orange";
      }
    };

  })

  .controller('ListController',function($scope, $ionicPopup, $http, $timeout, RealList, RealDelete, eventName, ionicMaterialMotion){

    $scope.numItems = 10;

    $scope.$on('ngRepeatFinished', function() {//when finish render the list, set ripple animation
      ionicMaterialMotion.ripple();
    });

    $http.get(RealList.url+eventName.eventCode).then(function(resp) {
      $scope.list = resp.data;
      $scope.len = Object.keys(resp.data).length;
/*
      $timeout(function() {
        ionicMaterialMotion.ripple();
      }, 1000);
*/
      //ionicMaterialMotion.fadeSlideInRight();
    }, function(err) {
      console.error('ERR', err);
      // err.status will contain the status code
    });
    

     // A confirm dialog
 $scope.deleteMatric = function(matric) {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Delete entry?',
     template: 'Are you sure you want to delete this matric no.?',
     okText: 'Yes', 
     cancelText: 'No'
   });

   confirmPopup.then(function(res) {
     if(res) {
       //console.log('You are sure');

        $http.get(RealDelete.url+eventName.eventCode+"/"+matric).then(function(resp){
          //alert(JSON.stringify(resp.data));
          //doRefresh();
        },function(err){
          //alert(err);
        });
      }
     else {
        //alert('not deleted');
       //console.log('You are not sure');
     }
   });
 };

    // $scope.deleteMatric = function(matric){
    //   //postdata = {matric_id: matric, event_code: eventName.eventCode};
    //   //alert(RealDelete.url);
    //   $http.get(RealDelete.url+eventName.eventCode+"/"+matric).then(function(resp){
    //     alert(resp.data);
    //   },function(err){
    //     alert(err);
    //   });
    // };

    $scope.doRefresh =function() {
      //console.log(RealList.url+eventName.eventCode);
      $http.get(RealList.url+eventName.eventCode).then(function(resp) {
        $scope.list = resp.data;
        $scope.len = Object.keys(resp.data).length;
        $scope.numItems = 10;
        $scope.$broadcast('scroll.refreshComplete');
      },function(err) {
          console.error('ERR', err);
          // err.status will contain the status code
      });
    };

    $scope.addMoreItems = function() {
      console.log("addMoreItems")
      if($scope.len > $scope.numItems) {
        console.log("moree");
        $scope.numItems += 10;
      }
      $scope.$broadcast('scroll.infiniteScrollComplete');
    }
    
  })

  .controller('LoginCtrl', function($scope, $state , $http ,Check,eventName) {
    $scope.isInValid = "White";
    $scope.user={};
    $scope.message ="";
    $scope.eventName = eventName;
    // $scope.adminLogin = function(){
    //   $state.go('adminLogin');
    // };
    // $scope.forgotPassword = function(){
    //   $state.go('forgotPassword');
    // };




    $scope.login = function(){
      if($scope.eventName.eventCode== null || $scope.eventName.eventName == null){
        $scope.isInValid = "Black";
        $scope.message ="Null Values Present"
      }else{
        $http.get(RealCheck.url+$scope.eventName.eventCode).then(function(resp){
          if(resp.data == $scope.eventName.eventName){
            $scope.isInValid ="Green";
            $scope.message="Congrats!It works!";
            $state.go('tab.home');
          }else{
            $scope.isInValid = "Red";
            $scope.message ="Wrong Password Combination";
          }
        },function(err){
          console.log(err);
          $scope.isInValid = "Orange";
          $scope.message = err;
        });
      }
    };
  });
