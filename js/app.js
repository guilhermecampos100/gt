var app = {
    initialize: function() {
        this.bindEvents();
    },
   
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        
        ons.setDefaultDeviceBackButtonListener(function() {
            if (navigator.notification.confirm("Are you sure to close the app?", 
                function(index) {
                    if (index == 1) { // OK button
                        navigator.app.exitApp(); // Close the app
                    }
                }
            ));
        });

        // Open any external link with InAppBrowser Plugin
        $(document).on('click', 'a[href^=http], a[href^=https]', function(e){

            e.preventDefault();
            var $this = $(this); 
            var target = $this.data('inAppBrowser') || '_blank';

            window.open($this.attr('href'), target);

        });

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    },
  
};


(function() {
    var app = angular.module('sensationApp', ['onsen.directives', 'ngTouch', 'ngSanitize']);

    app.config(['$httpProvider', function($httpProvider) {

        $httpProvider.defaults.headers.common['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.cache = false;

    }]);
    
    // Home Controller
    app.controller('HomeController', function($scope, $rootScope, Data) {
	 
        $scope.items = Data.items;

        $scope.showDetail = function(index){
            var selectedItem = $scope.items[index];
            Data.selectedItem = selectedItem;
            $scope.MeuNavigator.pushPage(selectedItem.page, {title: selectedItem.title, animation: 'slide'});
        }
        
    });
    
    // Menu Controller
    app.controller('MenuController', function($scope, MenuData) {
        
        $scope.items = MenuData.items;

        $scope.showDetail = function(index){
            var selectedItem = $scope.items[index];
            MenuData.selectedItem = selectedItem;

            $scope.menu.setMainPage(selectedItem.page, {closeMenu: true})
        }
    });

	  // Login: Login Controller
	app.controller('loginController', function($scope, $rootScope) {

		$scope.fazerLogin = function(token) {
			$rootScope.tokenGlobal = token;
			if(checkLogin()) {
				openProtectedPage();
			}
		}

		function openProtectedPage() {
			MeuNavigator.pushPage('about.html');    
		}

		function checkLogin() {
			//temporariry return true;
			// please write your own logic to detect user login;
			return true;
		}    
	});

	
app.factory('AboutData', function()
{ 
    var data = {
	"id": 1,
	"total": 1,
	"result": [
		{
			"id": 1,
			"token": "TXKML",
			"pedenv": "1",
			"pedand": "1",
			"fechaenv": "1",
			"fechaand": "0",
            "corfundo": "red"
	} ] };

    return data;
});
	
	

    app.controller('TrocaFotoController', function($interval, $scope, $rootScope, $http, AboutData) {
	$scope.token = $rootScope.tokenGlobal
	var page = MeuNavigator.getCurrentPage();
	$scope.foto_garcom = page.options.foto_garcom;
	$scope.nome_garcom = page.options.nome_garcom;
	});

	
    // About: About Controller
    app.controller('AboutController', function($interval, $scope, $rootScope, $http, AboutData) {
	$scope.token = $rootScope.tokenGlobal
	var promise;
    $scope.items = [];
    $scope.start = function() {
      // stops any running interval to avoid two intervals running at the same time
      $scope.stop(); 
      promise = $interval(atualiza, 1000);
    };
    $scope.stop = function() {
      $interval.cancel(promise);
	  promise = undefined;
    };
  
    // starting the interval by default
    $scope.start();
 
    // stops the interval when the scope is destroyed
    $scope.$on('$destroy', function() {
      $scope.stop();
    });

		function atualiza() {
			var urljson = 'http://chamagar.com/dashboard/painel/gtjson.asp?token=' + $rootScope.tokenGlobal + '&hora=' + Date.now();
			$http({method: 'GET', url: urljson}).
			success(function(data, status, headers, config) {
				if  (data.garcom[0].nome_garcom == '') {
					alert('token nao encontrado');
					$scope.stop();
					$scope.MeuNavigator.pushPage('login.html');

				} else
				{	
					$scope.about = data.mesas;
					$scope.nome_garcom = data.garcom[0].nome_garcom;
					$scope.foto_garcom = data.garcom[0].foto_garcom;
				}
			}).
			error(function(data, status, headers, config) {
				alert('erro no json ' +  data);
			});	
		};

        $scope.showDetail = function(index) {
        var selectedItem = $scope.about[index];
        AboutData.selectedItem = selectedItem;
		$scope.stop();
        $scope.MeuNavigator.pushPage('detalhe.html', selectedItem);
        }
		 
		$scope.abreLogin = function(index) {
			$scope.stop();
			$scope.MeuNavigator.pushPage('login.html',{title: 'Login', animation: 'slide'})
		}
    });
    
	// About: Detalhe Controller
    app.controller('DetalheController', function($scope, $rootScope, $http, AboutData) {

        $scope.item = AboutData.selectedItem;
		$scope.chktodosemandamento = [];
		$scope.chktodosenviados = [];
		$scope.chamando = false;

		
		$scope.updateSelection = function($event) {
		  var checkbox = $event.target;
		  var action = (checkbox.checked ? 'add' : 'remove');
		  if (action == 'add') {
			$scope.chamando = true;
			$scope.corchamando = 'red';
			processaacao(3,$scope.item.token);
		  }
		  else {
			$scope.chamando = false;
			$scope.corchamando = 'lightgrey';
			processaacao(4,$scope.item.token);
		  }
		};

		$scope.marca = function(tipo, codigo) {
			if (tipo == 1) {
				var pedidos = $scope.pedidosativos;
			}
			else {
				var pedidos = $scope.pedidosemandamento;
			}
			angular.forEach(pedidos, function (item) {
				if (item.codigopedido == codigo) {
					if (item.Selected) {
						item.Selected = false;
					}
					else {
						item.Selected = true;
					}
				}
			});
		};
		
		$scope.MarcarTodosEnviados = function() {
			angular.forEach($scope.pedidosativos, function (item) {
				item.Selected = $scope.chktodosenviados.Selected;
			});
		};	
		
		$scope.MarcarTodosEmAndamento = function() {
			angular.forEach($scope.pedidosemandamento, function (item) {
				item.Selected = $scope.chktodosemandamento.Selected;
			});
		};
		
		$scope.MarcarTodosEA = function() {
			$scope.chktodosemandamento.Selected = !$scope.chktodosemandamento.Selected;
			$scope.MarcarTodosEmAndamento();
		}
		

		$scope.MarcarTodosEnv = function() {
			$scope.chktodosenviados.Selected = !$scope.chktodosenviados.Selected;
			$scope.MarcarTodosEnviados();
		}
		
		function processaacao(codigoacao,tripa) {
			var acao = "";
			if (codigoacao == 1) { acao = "ColocarEmAndamentoMulti"; }
			if (codigoacao == 2) { acao = "ColocarEntregueMulti"; }
			if (codigoacao == 3) { acao = "AtivaChamado"; }
			if (codigoacao == 4) { acao = "DesativaChamado"; }

			var segundos = new Date().getTime() / 1000;

			var urljson = 'http://chamagar.com/dashboard/painel/processaacaojson.asp?acao='+ acao + '&tripa='+tripa + '&segundos='+ segundos;
			$http({method: 'GET', url: urljson}).
			success(function(data, status, headers, config) {
				atualiza();
			}).
			error(function(data, status, headers, config) {
				alert('erro no json ' +  data);
			});	
		}


		$scope.ColocarEmAndamento = function () {
			var a=1;
			var tripa = PegaSelecionados('enviado');
			//alert('tripa: ' + tripa + ' pronto para colocar em andamento');
			processaacao(1,tripa);
		}
		
		$scope.Cancelar = function () {
			var a=2;
			var tripa = PegaSelecionados('enviado');
			alert('tripa: ' +   tripa + ' pronto para cancelar');
		}
		
		$scope.ColocarEntregue = function () {
			var a=3;
			var tripa = PegaSelecionados('em andamento');
			//alert('tripa: ' + tripa + '  pronto para colocar entregue');
			processaacao(2,tripa);
		}

		
		var PegaSelecionados = function(tipo) {
			var tripa = '';
			var pedidos = [];
			
			if (tipo == 'enviado') {
				pedidos = $scope.pedidosativos;
			}
			if (tipo == 'em andamento') {
				pedidos = $scope.pedidosemandamento;
			}
			angular.forEach(pedidos, function(item) {
				if (item.Selected) {
					if (tripa == '') {
						tripa = item.codigopedido;
					}
					else
					{
						tripa += '-' + item.codigopedido
					}
				}
				
			});
			return tripa;
		};


		function atualiza() {
			var urljson = 'http://chamagar.com/dashboard/painel/gtdetalhejson.asp?mesa=' + $scope.item.token + '&token=' + $rootScope.tokenGlobal + '&hora=' + Date.now();
			$http({method: 'GET', url: urljson}).
			success(function(data, status, headers, config) {
				$scope.pedidosativos = data.pedidosativos;
				$scope.pedidosemandamento = data.pedidosemandamento;
				$scope.chamando = data.mesa[0].chamando;
				if (data.mesa[0].chamando == 1) {
					$scope.corchamando = 'red';
					$scope.chamando = true;
				}
				else {
					$scope.corchamando = 'lightgrey';
					$scope.chamando = false;
				}
			}).
			error(function(data, status, headers, config) {
				alert('erro no json ' +  data);
			});	
		};
		
		atualiza();

     });
	

    // PLUGINS: Notifications Controller
    app.controller('NotificationsController', function($scope) {
        
        $scope.alertNotify = function() {
        navigator.notification.alert("Sample Alert",function() {console.log("Alert success")},"My Alert","Close");
        };

        $scope.beepNotify = function() {
        navigator.notification.beep(1);
        };

        $scope.vibrateNotify = function() {
        navigator.notification.vibrate(3000);
        };

        $scope.confirmNotify = function() {
        navigator.notification.confirm("My Confirmation",function(){console.log("Confirm Success")},"Are you sure?",["Ok","Cancel"]);
        };
        
    });

    // Filter
    app.filter('partition', function($cacheFactory) {
          var arrayCache = $cacheFactory('partition');
          var filter = function(arr, size) {
            if (!arr) { return; }
            var newArr = [];
            for (var i=0; i<arr.length; i+=size) {
                newArr.push(arr.slice(i, i+size));        
            }
            var cachedParts;
            var arrString = JSON.stringify(arr);
            cachedParts = arrayCache.get(arrString+size); 
            if (JSON.stringify(cachedParts) === JSON.stringify(newArr)) {
              return cachedParts;
            }
            arrayCache.put(arrString+size, newArr);
            return newArr;
          };
          return filter;
        });

})();