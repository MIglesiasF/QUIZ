var users = { admin: {id:1, username:"admin", password:"1234"},
			  pepe:  {id:2, username:"pepe", password:"5678"}
			};
// Comprueba  si el usuario esta registrado en users
// Si autenticación falla o hay errores se ejecuta callback(error).

exports.autenticar = function (login, password, callback){
	if (users[login])
	{
		//console.log('user_controller: ' + login + ' ' + password);
		if (password === users[login].password)
		{
			//console.log( users[login]);
			callback(null,users[login]);
			
		} else {
			callback( new Error('Password erróneo.'));
		}
	} else {
		callback( new Error('No existe el usuario.'));
	}
};