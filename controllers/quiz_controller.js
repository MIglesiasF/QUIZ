var models = require('../models/models.js');

// Autoload - factoriza el código si la ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find( //quizId
			{
				where: { id: Number(quizId)},
				include: [{ model: models.Comment}]
			}
		).then(
		function(quiz) {
			if(quiz){
				req.quiz = quiz;
				next();
			}else {next(new Error('No existe quizID = ' + quizId))}
		}
		).catch(function(error){next(error);});
};

// GET /quizes
exports.index = function(req, res) {
	var busqueda  = "%";
	if (req.query.search != undefined)
	{
		busqueda = "%" + req.query.search + "%";
		busqueda = busqueda.trim();
		busqueda = busqueda.replace(/\s+|\s+$/g,"%");

	}
	
	models.Quiz.findAll({where:["pregunta like ?", busqueda]}).then(function(quizes){
				res.render('quizes/index',{quizes: quizes, errors:[]});
			}).catch(function(error) { next(error);})	
};

//GET /quizes/:id
exports.show = function(req, res) {
	models.Quiz.find(req.params.quizId).then(function(quiz){
		res.render('quizes/show',{quiz: req.quiz, errors:[]});
	})
};


//GET /quizes/:id/answer
exports.answer = function(req, res){
	var resultado = 'Incorrecto';
	if (req.query.respuesta === req.quiz.respuesta)
	{
		resultado = 'Correcto';
	}
	res.render('quizes/answer',{quiz: req.quiz, respuesta: resultado, errors:[]});
};

//GET /quizes/statistics
exports.statistics = function(req, res){
		
	var  resultadosEstadisticas = {
		preguntas: 0,
		comentarios: 0,
	    media: 0,
		preguntasSC: 0,
		preguntasCC: 0

	};

	models.Quiz.count()
	.then(function(c) 
		  {
			resultadosEstadisticas.preguntas = c;	
			//console.log("Hay  " + resultadosEstadisticas.preguntas + " preguntas!!");
		  }
		  ).then( 
				models.Comment.count()
				.then(function(c) 
					  {
						resultadosEstadisticas.comentarios = c;
						//console.log("Hay  " + resultadosEstadisticas.comentarios + " comentarios!!");
						if (resultadosEstadisticas.preguntas > 0)
						{	
							resultadosEstadisticas.media = (resultadosEstadisticas.comentarios / resultadosEstadisticas.preguntas).toFixed(2);
							//console.log("Hay  " + resultadosEstadisticas.media + " comentarios por pregunta!!");
						}						
					  }
					  ).then( models.Quiz.count({where: [ '"Comments"."QuizId" IS NULL' ],	include: [{ model: models.Comment, required: false}]})
							  .then(function(c) 
									{
										//console.log("Hay  " + c + " preguntas sin comentarios!!");
										resultadosEstadisticas.preguntasSC = c;										
									}
								   ).then( models.Quiz.count({where: [ '"Comments"."QuizId" IS NOT NULL' ], include: [{ model: models.Comment,required: true}]})
									       .then(function(c) 
												 {
													//console.log("Hay  " + c + " preguntas con comentarios!!");
													resultadosEstadisticas.preguntasCC = c;
													res.render('quizes/statistics',{estadisticas: resultadosEstadisticas, errors:[]});
												 }
												)
									)
							)
			).catch(function(error) { next(error);});	
};

//GET /quizes/new
exports.new = function(req, res){
	var quiz = models.Quiz.build( //crea objeto quiz
	{ pregunta: "Pregunta", respuesta: "Respuesta", tema: "Tema"}
	);
	res.render('quizes/new', {quiz: quiz, errors:[]});
};

// POST /quizes/create
exports.create = function(req, res){
	var quiz = models.Quiz.build( req.body.quiz );

	quiz.validate().then(
		function (err) {
			if(err){
				res.render('quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				//save: guardar en DB campos pregunta y respuesta de quiz
				quiz.save({fields: ["pregunta","respuesta","tema"]}).then(
					function(){
						res.redirect('/quizes');					
					}
				)	// res.redirect: Redirección HTTP a lista de preguntas
			}
		}
	);
};

// GET /quizes/:id
exports.edit = function(req, res){
	var quiz = req.quiz; //autoload de instancia de quiz
	res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res){
	req.quiz.pregunta  = req.body.quiz.pregunta;
    req.quiz.respuesta = req.body.quiz.respuesta;
	req.quiz.tema = req.body.quiz.tema;
	
	req.quiz.validate().then(
		function (err) {
			if(err){
				res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
			} else {
				//save: guardar en DB campos pregunta y respuesta de quiz
				req.quiz.save({fields: ["pregunta","respuesta","tema"]}).then(
					function(){
						res.redirect('/quizes');					
					}
				)	// res.redirect: Redirección HTTP a lista de preguntas
			}
		}
	);
};

// DELETE / quizes/:id
exports.destroy = function(req, res){
	req.quiz.destroy().then(function(){
		res.redirect('/quizes');
	}).catch(function(error){next(error)});
};