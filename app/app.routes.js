app.config(function($routeProvider){
	$routeProvider.when('/',{
		templateUrl: './app/components/main/main.html',
		controller: 'mainController as vm'	
	})
});